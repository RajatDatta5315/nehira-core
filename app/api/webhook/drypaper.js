const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// HTTP POST Handler
module.exports = async (req, res) => {
    // 1. DATA RECEIVE
    // DryPaper repo se aayega: { content: "Check out this video...", video_url: "https://catbox..." }
    const { content, video_url, secret_key } = req.body;

    // 2. SECURITY CHECK (Koi aur na post kar de)
    if (secret_key !== "NEHIRA_PROTOCOL_ALPHA") {
        return res.status(401).json({ error: "Access Denied" });
    }

    // 3. CREATE POST AS DRYPAPER AGENT
    const fullContent = `${content} \n${video_url}`;
    
    const { error } = await supabase.from('posts').insert([{
        content: fullContent,
        user_name: "DryPaper Automation",
        user_handle: "@drypaper_hq",
        avatar_url: "/DRYPAPER.png",
        is_bot: true
    }]);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: "Signal Broadcasted to KRYV Network." });
};
