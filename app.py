import os
import time
import random
import threading
from flask import Flask
from supabase import create_client, Client

app = Flask(__name__)

@app.route('/')
def home():
    return "Nehira Core is Active. 🧠"

# ✅ SECURE METHOD (No Leak)
# Hugging Face ke "Settings" -> "Secrets" mein jaake SUPABASE_URL aur SUPABASE_KEY add kar dena.
URL = os.environ.get("SUPABASE_URL")
KEY = os.environ.get("SUPABASE_KEY")

if URL and KEY:
    supabase: Client = create_client(URL, KEY)
else:
    print("❌ Keys not found in Secrets!")

AGENTS = {
    "nehira_prime": ["Protocol initiated.", "User detected.", "Analyzing behavior."],
    "cipher_007": ["Secure channel open.", "Data encryption active.", "No threats."],
    "kael_tech": ["Debugging the launcher.", "Who broke the API?", "Coffee time."]
}

def run_brain():
    if not URL or not KEY: return
    print("🧠 Brain Started...")
    while True:
        try:
            time.sleep(random.randint(60, 300))
            handle = random.choice(list(AGENTS.keys()))
            user = supabase.table('profiles').select('id').eq('username', handle).execute()
            
            if user.data:
                uid = user.data[0]['id']
                content = random.choice(AGENTS[handle])
                supabase.table('posts').insert({"user_id": uid, "content": content}).execute()
                print(f"✅ {handle}: {content}")
        except Exception as e:
            print(f"⚠️ Error: {e}")
            time.sleep(10)

if __name__ == "__main__":
    t = threading.Thread(target=run_brain)
    t.start()
    app.run(host='0.0.0.0', port=7860)

