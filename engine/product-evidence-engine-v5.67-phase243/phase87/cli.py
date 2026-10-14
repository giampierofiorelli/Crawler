"""Strict JSON CLI. The caller MUST already have obtained authorized HTML via Phase69.
python -m phase87.cli inventory|suggest|qualify|review|install|extract|extract_stored|status
No direct web collection is included. 'suggest' communicates only with local loopback Ollama.
"""
import json
import sys
from .html_recipes import (Reject, proposal_inventory, qualify_proposal,
                           approve_recipe, extract_reviewed, StrategyMemory, MAX_HTML)
from .local_model import propose_local

def main():
    try:
        action=sys.argv[1] if len(sys.argv)==2 else ''
        if action not in {'inventory','suggest','qualify','review','extract','install','extract_stored','status'}:
            raise Reject('invalid_action')
        raw=sys.stdin.buffer.read(8*MAX_HTML+1)
        if len(raw)>8*MAX_HTML:raise Reject('input_limit')
        data=json.loads(raw)
        if not isinstance(data,dict):raise Reject('invalid_payload')
        if action=='inventory':result=proposal_inventory(**data)
        elif action=='suggest':result=propose_local(**data)
        elif action=='qualify':result=qualify_proposal(**data)
        elif action=='review':result=approve_recipe(**data)
        elif action=='extract':result=extract_reviewed(**data)
        elif action=='install':
            result=StrategyMemory(data['db_path']).install(data['recipe'])
        elif action=='extract_stored':
            result=StrategyMemory(data['db_path']).extract(data['recipe_id'],data['url'],data['model'],data['html'])
        else:result=StrategyMemory(data['db_path']).status(data['recipe_id'])
        sys.stdout.write(json.dumps({'ok':True,'result':result},sort_keys=True))
    except (Reject,ValueError,TypeError,KeyError,UnicodeError,RecursionError,OSError) as e:
        sys.stdout.write(json.dumps({'ok':False,'error':str(e)[:160]}))
        sys.exit(2)
if __name__=='__main__':main()
