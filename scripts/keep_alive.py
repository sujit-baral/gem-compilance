#!/usr/bin/env python3
"""
Render 24/7 Keep-Alive Script
Pings your Render free-tier backend endpoint every 10 minutes to prevent it from spinning down.
"""

import time
import urllib.request
import urllib.error
import datetime

BACKEND_URL = "https://gem-compilance-backend.onrender.com/health"
PING_INTERVAL_SECONDS = 600  # 10 minutes

def ping_server():
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{current_time}] Sending keep-alive heartbeat to: {BACKEND_URL}...")
    try:
        req = urllib.request.Request(
            BACKEND_URL,
            headers={"User-Agent": "GeM-Compliance-KeepAlive-Guard/1.0"}
        )
        with urllib.request.urlopen(req, timeout=60) as response:
            status_code = response.getcode()
            body = response.read().decode("utf-8")
            print(f"[{current_time}] ✓ SUCCESS ({status_code}): {body}")
    except urllib.error.HTTPError as e:
        print(f"[{current_time}] ⚠️ HTTP Error: {e.code} - {e.reason}")
    except urllib.error.URLError as e:
        print(f"[{current_time}] ❌ Connection Error: {e.reason}")
    except Exception as e:
        print(f"[{current_time}] ❌ Unexpected error: {e}")

if __name__ == "__main__":
    print("==================================================")
    print("  GeM Compliance Platform - Render Keep-Alive Guard")
    print(f"  Target: {BACKEND_URL}")
    print(f"  Interval: Every {PING_INTERVAL_SECONDS // 60} minutes")
    print("==================================================")
    
    while True:
        ping_server()
        time.sleep(PING_INTERVAL_SECONDS)
