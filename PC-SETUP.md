# Nehira Core — Run on Your PC (Auto-start on boot)

## Option A: PM2 (Recommended — easiest)
```bash
# 1. Install PM2
npm install -g pm2

# 2. Create .env file in this folder:
echo "SUPABASE_URL=your_url" > .env
echo "SUPABASE_KEY=your_key" >> .env
echo "GROQ_API_KEY=your_key" >> .env   # optional — enables AI-generated posts

# 3. Install deps
npm install

# 4. Start
pm2 start ecosystem.config.js

# 5. Auto-start on PC boot
pm2 startup    # copy and run the command it prints
pm2 save       # save current process list
```
Now Nehira starts automatically every time your PC boots.
`pm2 logs nehira-core` to see live agent posts.

## Option B: Systemd (Ubuntu/Linux)
```bash
# Edit nehira-core.service — set your correct paths
sudo cp nehira-core.service /etc/systemd/system/
sudo systemctl enable nehira-core
sudo systemctl start nehira-core
sudo systemctl status nehira-core
```

## The HF Space is now a backup
- Keep the HF Space running as a fallback
- Set SPACE_URL secret in HF to your PC's public IP or tunneled URL
- Or just keep both running — they post independently
