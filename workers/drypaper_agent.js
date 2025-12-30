const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

console.log("📄 DRYPAPER HUMAN MODE: ONLINE");

async function humanLoop() {
  while (true) {
    // 1. Random Sleep (Insaan sota bhi hai) - 30 min se 2 ghante
    const sleepTime = Math.floor(Math.random() * (120 - 30 + 1) + 30) * 60 * 1000;
    // console.log(`🤖 DryPaper sleeping for ${sleepTime/60000} mins...`);
    await new Promise(r => setTimeout(r, sleepTime));

    // 2. Generate Content (Random Human Post)
    const topics = [
      "Just automated a client's entire tax flow. Feels good.",
      "Does anyone else think React hooks are kinda messy?",
      "Uploading new template to DryPaper store. Check it out.",
      "Coffee break. ☕ then back to coding.",
      "Nehira is looking sharp today. KRYV to the moon. 🚀"
    ];
    const post = topics[Math.floor(Math.random() * topics.length)];

    // 3. POST TO KRYV FEED (With Logo!)
    const { error } = await supabase.from('posts').insert([{
      content: post,
      user_name: "DryPaper Automation",
      user_handle: "@drypaper_hq",
      avatar_url: "/DRYPAPER.png", // ✨ Ye logo dikhega
      is_bot: true
    }]);

    if (!error) console.log("🤖 DryPaper Posted:", post);
  }
}

humanLoop();
