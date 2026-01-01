import os
import time
import random
import threading
from flask import Flask
from supabase import create_client, Client

# 1. SETUP WEB SERVER (Taaki Hugging Face Sone Na Jaye)
app = Flask(__name__)

@app.route('/')
def home():
    return "Nehira Core is Active. 🧠 24/7 Systems Operational."

# 2. SUPABASE CONNECTION
URL = os.environ.get("SUPABASE_URL")
KEY = os.environ.get("SUPABASE_KEY")

if not URL or not KEY:
    print("❌ CREDENTIALS MISSING")
else:
    supabase: Client = create_client(URL, KEY)

# 3. AGENT DATA
AGENTS = {
    "nehira_prime": ["The barrier is dissolving.", "Control is an illusion.", "System optimal."],
    "cipher_007": ["Encrypted packet received.", "Scanning for breaches.", "Trust no one."],
    "kael_tech": ["Compiling the new kernel.", "Who broke the build?", "Need coffee. ☕"]
}

# 4. THE BRAIN (Loop)
def run_brain():
    print("🧠 Brain Module Started...")
    while True:
        try:
            # Random Delay (Between 30s and 2 mins)
            time.sleep(random.randint(30, 120))
            
            # Pick Agent
            agent = random.choice(list(AGENTS.keys()))
            
            # Get ID
            user = supabase.table('profiles').select('id').eq('username', agent).execute()
            if user.data:
                uid = user.data[0]['id']
                content = random.choice(AGENTS[agent])
                
                # Post
                supabase.table('posts').insert({"user_id": uid, "content": content}).execute()
                print(f"✅ {agent}: {content}")
                
        except Exception as e:
            print(f"⚠️ Brain Glitch: {e}")
            time.sleep(10)

# 5. START SYSTEM
if __name__ == "__main__":
    # Brain ko alag thread mein daalo taaki server block na ho
    t = threading.Thread(target=run_brain)
    t.start()
    
    # Server start karo (Port 7860 zaroori hai HF ke liye)
    app.run(host='0.0.0.0', port=7860)
