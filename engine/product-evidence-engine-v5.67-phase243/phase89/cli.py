"""Single-request JSON line-free CLI for Phase89 watchdog; no network/LLM."""
import json
import sys
from .watch_ledger import WatchLedger,WatchReject


def main():
    try:
        if len(sys.argv)!=2 or sys.argv[1] not in ('record','pending','close_case','case_status','case_status_many'):
            raise WatchReject('invalid_action')
        raw=sys.stdin.buffer.read(16_385)
        if len(raw)>16_384:raise WatchReject('payload_too_large')
        data=json.loads(raw)
        if not isinstance(data,dict) or 'db_path' not in data:raise WatchReject('invalid_payload')
        ledger=WatchLedger(data['db_path'])
        if sys.argv[1]=='record':
            if set(data)!={'db_path','record'}:raise WatchReject('invalid_payload')
            result=ledger.record(data['record'])
        elif sys.argv[1]=='pending':
            if set(data)!={'db_path'}:raise WatchReject('invalid_payload')
            result=ledger.pending()
        elif sys.argv[1]=='case_status':
            if set(data)!={'db_path','source_host','path_prefix','category','recipe_id'}:
                raise WatchReject('invalid_payload')
            result=ledger.case_status(data['source_host'],data['path_prefix'],
                                      data['category'],data['recipe_id'])
        elif sys.argv[1]=='case_status_many':
            if set(data)!={'db_path','recipes'}:raise WatchReject('invalid_payload')
            result=ledger.case_status_many(data['recipes'])
        else:
            if set(data)!={'db_path','source_key','recipe_id','disposition_receipt'}:
                raise WatchReject('invalid_payload')
            result=ledger.close_case(data['source_key'],data['recipe_id'],data['disposition_receipt'])
        sys.stdout.write(json.dumps({'ok':True,'result':result},sort_keys=True))
    except (WatchReject,ValueError,TypeError,KeyError,UnicodeError,RecursionError,OSError) as exc:
        sys.stdout.write(json.dumps({'ok':False,'error':str(exc)[:160]}))
        sys.exit(2)

if __name__=='__main__':main()
