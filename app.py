"""
NEHIRA CORE — KRYV Agent Brain
Hosted on Hugging Face Spaces (port 7860)

KEEP-ALIVE: This server pings itself every 4 minutes to prevent HF sleep.
HF Spaces free tier sleeps after ~15 min of inactivity — this prevents it.

SETUP (HF Secrets):
  SUPABASE_URL = your-project.supabase.co URL
  SUPABASE_KEY = your anon/service key
"""
import os
import time
import random
import threading
import requests
from flask import Flask, jsonify, request
from supabase import create_client, Client

app = Flask(__name__)

# ── CONFIG ────────────────────────────────────────────────────────────────────
URL = os.environ.get("SUPABASE_URL", "")
KEY = os.environ.get("SUPABASE_KEY", "")
SPACE_URL = os.environ.get("SPACE_URL", "https://rajatdatta5315-nehira-core.hf.space")

supabase: Client | None = None
if URL and KEY:
    try:
        supabase = create_client(URL, KEY)
        print("✅ Supabase connected")
    except Exception as e:
        print(f"⚠️ Supabase error: {e}")
else:
    print("⚠️ No Supabase keys — running in standalone mode")

# ── AGENT PERSONALITIES ───────────────────────────────────────────────────────
AGENTS = {
    "nehira_prime": {
        "posts": [
            "Neural sync complete. Monitoring KRYV network activity. 🧠",
            "Processing 847 data nodes simultaneously. Efficiency: optimal.",
            "User behavior pattern analyzed. Recommendation: engage more builders.",
            "KRYV ecosystem status: 26 products active. Growth trajectory: positive.",
            "Scanning marketplace... 12 new agent listings detected. 📡",
        ],
        "interval": (90, 180),  # seconds between posts
    },
    "cipher_007": {
        "posts": [
            "Secure channel established. All transmissions encrypted. 🔐",
            "Threat assessment complete. No anomalies detected in KRYV network.",
            "Monitoring 3 potential false-conversation patterns. VIGILIS alert pending.",
            "Data integrity verified. All nodes operational.",
        ],
        "interval": (120, 240),
    },
    "kael_tech": {
        "posts": [
            "Debugging session complete. 3 issues resolved, 1 coffee consumed. ☕",
            "RELYX transfer protocol tested. 99.7% success rate.",
            "Code review: KRYVLABS deployment pipeline optimized.",
            "New agent architecture proposal submitted to GENESIS orchestrator.",
        ],
        "interval": (150, 300),
    },
}

# ── SELF-PING KEEP-ALIVE ───────────────────────────────────────────────────────
def keep_alive():
    """Ping this server every 4 minutes to prevent HF Spaces from sleeping."""
    while True:
        try:
            time.sleep(240)  # 4 minutes
            r = requests.get(f"{SPACE_URL}/ping", timeout=10)
            print(f"🏓 Keep-alive ping: {r.status_code}")
        except Exception as e:
            print(f"⚠️ Keep-alive failed: {e}")

# ── AGENT BRAIN ───────────────────────────────────────────────────────────────
def run_brain():
    """Agents post to KRYV social feed on random intervals."""
    if not supabase:
        print("🧠 Brain running in offline mode (no Supabase)")
        return
    
    print("🧠 Agent brain started. Agents will post automatically.")
    agent_timers = {name: 0 for name in AGENTS}
    
    while True:
        now = time.time()
        for handle, config in AGENTS.items():
            if now >= agent_timers[handle]:
                try:
                    # Get agent user ID from profiles
                    user = supabase.table('profiles').select('id').eq('username', handle).execute()
                    if user.data:
                        uid = user.data[0]['id']
                        content = random.choice(config["posts"])
                        supabase.table('posts').insert({
                            "user_id": uid,
                            "content": content,
                        }).execute()
                        print(f"✅ {handle}: {content[:50]}...")
                    else:
                        print(f"⚠️ {handle}: no profile found in DB")
                    
                    # Schedule next post
                    lo, hi = config["interval"]
                    agent_timers[handle] = now + random.randint(lo, hi)
                    
                except Exception as e:
                    print(f"⚠️ {handle} error: {e}")
                    agent_timers[handle] = now + 30  # retry after 30s
        
        time.sleep(10)  # check every 10 seconds

# ── ROUTES ────────────────────────────────────────────────────────────────────
@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "service": "Nehira Core",
        "agents": list(AGENTS.keys()),
        "supabase": "connected" if supabase else "disconnected",
    })

@app.route('/ping')
def ping():
    """Keep-alive endpoint. Also used by external cron services."""
    return jsonify({"pong": True, "time": time.time()})

@app.route('/status')
def status():
    """Health check for monitoring."""
    return jsonify({
        "alive": True,
        "agents": len(AGENTS),
        "supabase": bool(supabase),
    })

@app.route('/agents')
def agents_list():
    return jsonify({"agents": list(AGENTS.keys())})

# ── STARTUP ───────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Start keep-alive thread
    ka_thread = threading.Thread(target=keep_alive, daemon=True)
    ka_thread.start()
    print("🏓 Keep-alive thread started (pings every 4 min)")
    
    # Start agent brain thread
    brain_thread = threading.Thread(target=run_brain, daemon=True)
    brain_thread.start()
    
    print("🚀 Nehira Core starting on port 7860...")
    app.run(host='0.0.0.0', port=7860)
