#!/usr/bin/env python3
"""Phase170 SQLite research-only replay ledger.

IMPORTANT: This CLI NEVER checks signatures, actors or evidence. It MUST be called
only from the server-side Phase170 adapter after Phase169 cryptographic verification.
A caller with write access to the database or the CLI can inject entries. No user
authentication, production consent, source authentication or ranking permissions.
"""
from __future__ import annotations
import argparse
import json
import os
from pathlib import Path
import re
import sqlite3
import sys

ID = re.compile(r"^[a-z][a-z0-9_]{0,100}$")
HEX = re.compile(r"^[0-9a-f]{64}$")


class AdmissionError(Exception):
    pass


def validate_envelope(envelope: object) -> dict:
    if not isinstance(envelope, dict) or set(envelope) != {
        'phase', 'sessionId', 'epoch', 'revision', 'turnId',
        'questionSha256', 'revisionFingerprint', 'receiptIds',
        'rankingAuthorized', 'publicationAuthorized', 'humanIdentityVerified',
    }:
        raise AdmissionError('invalid_envelope_shape')
    p = envelope
    if (p['phase'] != 170 or any(not isinstance(p[n], str) or not ID.fullmatch(p[n])
           for n in ('sessionId', 'turnId')) or
        any(not isinstance(p[n], str) or not HEX.fullmatch(p[n])
            for n in ('questionSha256', 'revisionFingerprint')) or
        any(type(p[n]) is not int or p[n] < 0 or p[n] > 2**53 - 1
            for n in ('epoch', 'revision')) or
        any(p[n] is not False for n in
            ('rankingAuthorized', 'publicationAuthorized', 'humanIdentityVerified'))):
        raise AdmissionError('invalid_envelope_binding')
    receipts = p['receiptIds']
    if (not isinstance(receipts, list) or not 1 <= len(receipts) <= 500 or
        any(not isinstance(v, str) or not ID.fullmatch(v) for v in receipts) or
        sorted(set(receipts)) != receipts):
        raise AdmissionError('invalid_receipt_ids')
    return p


def admit(db_path: Path, envelope: object) -> dict:
    p = validate_envelope(envelope)
    # Ownership & filesystem protection must be installed by the operator. We
    # require an existing private directory; never create a DB in a public dir.
    parent = db_path.parent
    if not parent.is_dir() or parent.is_symlink():
        raise AdmissionError('database_parent_missing_or_symlink')
    if os.stat(parent).st_mode & 0o077:
        raise AdmissionError('database_directory_not_private')
    if db_path.is_symlink():
        raise AdmissionError('database_symlink_forbidden')
    if db_path.exists() and (not db_path.is_file() or os.stat(db_path).st_mode & 0o077):
        raise AdmissionError('database_file_not_private')
    old_umask = os.umask(0o077)
    try:
        conn = sqlite3.connect(str(db_path), timeout=5.0, isolation_level=None)
    finally:
        os.umask(old_umask)
    try:
        if os.stat(db_path).st_mode & 0o077:
            raise AdmissionError('database_file_not_private')
        conn.execute('PRAGMA busy_timeout = 5000')
        conn.execute('PRAGMA journal_mode = WAL')
        conn.execute('PRAGMA synchronous = FULL')
        conn.executescript('''
          CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY, epoch INTEGER NOT NULL,
            revision INTEGER NOT NULL, turn_id TEXT NOT NULL,
            question_sha256 TEXT NOT NULL, fingerprint TEXT NOT NULL
          );
          CREATE TABLE IF NOT EXISTS consumed (
            receipt_id TEXT PRIMARY KEY, session_id TEXT NOT NULL,
            epoch INTEGER NOT NULL, revision INTEGER NOT NULL,
            fingerprint TEXT NOT NULL
          );
        ''')
        conn.execute('BEGIN IMMEDIATE')
        try:
            seen = conn.execute('SELECT epoch,revision,turn_id,question_sha256,fingerprint '
                                'FROM sessions WHERE session_id=?', (p['sessionId'],)).fetchone()
            pair = (p['epoch'], p['revision'])
            if seen:
                old_pair = (seen[0], seen[1])
                if pair < old_pair:
                    raise AdmissionError('stale_session_revision')
                if pair == old_pair and (p['turnId'], p['questionSha256'], p['revisionFingerprint']) != tuple(seen[2:]):
                    raise AdmissionError('conflicting_revision_binding')
            for receipt_id in p['receiptIds']:
                if conn.execute('SELECT 1 FROM consumed WHERE receipt_id=?', (receipt_id,)).fetchone():
                    raise AdmissionError('receipt_replay')
            conn.execute('INSERT INTO sessions(session_id,epoch,revision,turn_id,question_sha256,fingerprint) '
                         'VALUES(?,?,?,?,?,?) ON CONFLICT(session_id) DO UPDATE SET '
                         'epoch=excluded.epoch,revision=excluded.revision,turn_id=excluded.turn_id,'
                         'question_sha256=excluded.question_sha256,fingerprint=excluded.fingerprint',
                         (p['sessionId'], p['epoch'], p['revision'], p['turnId'], p['questionSha256'],
                          p['revisionFingerprint']))
            conn.executemany('INSERT INTO consumed(receipt_id,session_id,epoch,revision,fingerprint) '
                             'VALUES(?,?,?,?,?)', [(r, p['sessionId'], p['epoch'], p['revision'],
                                p['revisionFingerprint']) for r in p['receiptIds']])
            conn.execute('COMMIT')
        except Exception:
            conn.execute('ROLLBACK')
            raise
        return {'status': 'admitted_research_only', 'receiptCount': len(p['receiptIds']),
                'sessionId': p['sessionId'], 'epoch': p['epoch'], 'revision': p['revision'],
                'fingerprint': p['revisionFingerprint'], 'rankingAuthorized': False,
                'humanIdentityVerified': False}
    except sqlite3.Error as exc:
        raise AdmissionError('sqlite_admission_failed') from exc
    finally:
        conn.close()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--db', required=True)
    args = parser.parse_args()
    try:
        raw = sys.stdin.read(200000)
        if len(raw) >= 200000:
            raise AdmissionError('oversized_envelope')
        body = json.loads(raw)
        db_path = Path(args.db)
        if not db_path.is_absolute():
            raise AdmissionError('database_path_must_be_absolute')
        result = admit(db_path, body)
        print(json.dumps(result, sort_keys=True))
    except (AdmissionError, ValueError, TypeError, json.JSONDecodeError) as exc:
        print(json.dumps({'status': 'rejected', 'reason': str(exc)}), file=sys.stderr)
        raise SystemExit(2)


if __name__ == '__main__':
    main()
