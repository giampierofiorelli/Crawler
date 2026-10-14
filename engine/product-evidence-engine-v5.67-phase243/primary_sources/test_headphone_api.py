import base64
import copy
import hashlib
import json
import unittest
from primary_sources.headphone_api import (
    collect, parse_frequency_curve, decode_github_file, resolve_pinned_commit,
    UpstreamEvidenceError, API_ROOT,
)

REV = 'a' * 40
A = 'cEAR30-Sennheiser-HD600-L.txt'
B = 'cEAR30-Focal-Elex-L.txt'
C = 'cEAR32-Focal-Elex-L.txt'
DAT = b'20 -7.10\n30 -5.75\n100 -2.10\n1000 0.0\n5000 1.5\n10000 -2.5\n'


def contents(file_name, content=DAT, **updates):
    gitsha = hashlib.sha1(b'blob ' + str(len(content)).encode() + b'\x00' + content).hexdigest()
    payload = {'type': 'file', 'path': file_name, 'size': len(content),
               'encoding': 'base64', 'content': base64.b64encode(content).decode(), 'sha': gitsha}
    payload.update(updates)
    return json.dumps(payload).encode()


def mock_get(url):
    if url == API_ROOT + '/commits/master':
        return json.dumps({'sha': REV}).encode()
    assert url.endswith('?ref=' + REV), url
    file_name = url.split('/contents/', 1)[1].split('?', 1)[0]
    return contents(file_name)


class DirectOriginalMeasurementTests(unittest.TestCase):
    def test_immutable_commit_resolved_from_api(self):
        self.assertEqual(resolve_pinned_commit(mock_get), REV)

    def test_live_api_flow_is_mocked_and_all_measurements_keep_raw_units(self):
        report = collect(mock_get, [A, B])
        self.assertEqual(report['immutable_source_commit'], REV)
        self.assertEqual(len(report['curves']), 2)
        self.assertEqual(report['curves'][0]['points'][0]['frequency_hz'], 20)
        self.assertEqual(report['curves'][0]['points'][0]['relative_amplitude_db'], -7.1)
        self.assertEqual(len(report['comparable_curve_groups']), 1)
        self.assertFalse(report['ranking_input_approved'])
        self.assertTrue(report['research_only'])

    def test_different_rig_version_is_not_automatically_merged(self):
        report = collect(mock_get, [A, C])
        self.assertEqual(report['comparable_curve_groups'], [])

    def test_no_file_selection(self):
        with self.assertRaisesRegex(UpstreamEvidenceError, 'invalid_file_selection'):
            collect(mock_get, [])

    def test_no_duplicate_filenames(self):
        with self.assertRaisesRegex(UpstreamEvidenceError, 'invalid_file_selection'):
            collect(mock_get, [A, A])

    def test_no_path_traversal(self):
        with self.assertRaisesRegex(UpstreamEvidenceError, 'invalid_measurement_filename'):
            collect(mock_get, ['../' + A])

    def test_reject_invalid_git_commit(self):
        with self.assertRaisesRegex(UpstreamEvidenceError, 'invalid_commit_pin'):
            collect(mock_get, [A], commit='master')

    def test_bad_github_file_type(self):
        with self.assertRaisesRegex(UpstreamEvidenceError, 'unexpected_github_file_response'):
            decode_github_file(contents(A, type='dir'), A)

    def test_git_blob_sha_integrity_enforced(self):
        with self.assertRaisesRegex(UpstreamEvidenceError, 'git_blob_integrity_failure'):
            decode_github_file(contents(A, sha='0'*40), A)

    def test_source_filename_must_match(self):
        with self.assertRaisesRegex(UpstreamEvidenceError, 'unexpected_github_file_response'):
            decode_github_file(contents(A, path=B), A)

    def test_no_oversized_file(self):
        with self.assertRaisesRegex(UpstreamEvidenceError, 'invalid_file_size'):
            decode_github_file(contents(A, size=200001), A)

    def test_non_monotonic_frequency_is_invalid(self):
        with self.assertRaisesRegex(UpstreamEvidenceError, 'invalid_frequency_or_amplitude'):
            parse_frequency_curve(A, b'20 1\n30 0\n20 1\n40 1\n')

    def test_nan_values_invalid(self):
        with self.assertRaisesRegex(UpstreamEvidenceError, 'invalid_frequency_or_amplitude'):
            parse_frequency_curve(A, b'20 1\n30 nan\n100 1\n200 0\n')

    def test_extra_column_invalid(self):
        with self.assertRaisesRegex(UpstreamEvidenceError, 'invalid_measurement_row'):
            parse_frequency_curve(A, b'20 1 3\n30 0\n100 1\n200 0\n')

    def test_short_curve_rejected(self):
        with self.assertRaisesRegex(UpstreamEvidenceError, 'insufficient_curve_points'):
            parse_frequency_curve(A, b'20 1\n30 0\n100 1\n')

    def test_invalid_commit_return_rejected(self):
        with self.assertRaisesRegex(UpstreamEvidenceError, 'missing_immutable_commit'):
            resolve_pinned_commit(lambda _: b'{"sha":"master"}')

    def test_no_automatic_trust_even_for_published_ccby(self):
        report = collect(mock_get, [A])
        self.assertFalse(report['real_market_variant_match_verified'])
        self.assertEqual(report['published_license'], 'CC-BY-4.0')
        self.assertFalse(report['ranking_input_approved'])

if __name__ == '__main__':
    unittest.main()
