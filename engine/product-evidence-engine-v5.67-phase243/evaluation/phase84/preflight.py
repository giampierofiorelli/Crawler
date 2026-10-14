"""Diagnose AB test readiness without fetching content or accessing a publisher."""
import importlib.metadata
import importlib.util
import json
import os
from pathlib import Path
import platform
import shutil
import socket
import subprocess


def preflight() -> dict:
    def version(pkg:str):
        try:return importlib.metadata.version(pkg)
        except importlib.metadata.PackageNotFoundError:return None
    chrome=shutil.which('chromium') or shutil.which('google-chrome')
    chrome_version=None
    if chrome:
        try: chrome_version=subprocess.run([chrome,'--version'],capture_output=True,text=True,timeout=4).stdout.strip()
        except (OSError, subprocess.TimeoutExpired):pass
    try:
        socket.getaddrinfo('github.com',443)
        dns=True
    except OSError: dns=False
    return {'scope':'ENVIRONMENT READINESS ONLY; NO PUBLIC SITE CRAWLED',
      'python':platform.python_version(), 'playwright_installed':bool(importlib.util.find_spec('playwright')),
      'playwright_version':version('playwright'),
      'crawl4ai_installed':bool(importlib.util.find_spec('crawl4ai')),
      'crawl4ai_version':version('crawl4ai'),
      'chromium_path':chrome,'chromium_version':chrome_version,
      'public_dns_available':dns,
      'public_site_automation_authorized':False,
      'real_ab_test_ready':bool(version('crawl4ai') and chrome and dns),
      'note':'Even if tools/network are ready, an actual public-site AB test additionally needs per-source current access review and documented permissions. Browser admin restrictions require independent checks.'}

if __name__=='__main__':
    print(json.dumps(preflight(),indent=2))
