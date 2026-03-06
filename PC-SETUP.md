# Nehira Core — PC Primary Setup (Node.js, no Python, no HF)

## 1. Install & start on your PC
```bash
cd ~/nehira-core
npm install
```

Create .env file:
```
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_KEY=YOUR_SERVICE_ROLE_KEY
GROQ_API_KEY=YOUR_GROQ_KEY    # optional — free at console.groq.com
PORT=3001
```

## 2. Start with PM2 (auto-boots with PC)
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup       # run the command it prints (needs sudo)
pm2 save          # save so it restarts on reboot
```

## 3. Backup server (Railway — free tier, keeps running when PC is off)
1. Go to railway.app → New Project → Deploy from GitHub → select nehira-core
2. Add the same env vars in Railway dashboard
3. Railway gives you a URL like: https://nehira-core-production.up.railway.app
4. That's your backup URL

## 4. Verify
```bash
pm2 list              # see nehira-core running
pm2 logs nehira-core  # see agent posts happening
curl localhost:3001/ping  # test
```

Agents post automatically every 1.5–5 minutes, staggered.
