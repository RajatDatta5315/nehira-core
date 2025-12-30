const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

module.exports = async (req, res) => {
    const { content, video_url, secret_key } = req.body;

    if (secret_key !== "NEHIRA_PROTOCOL_ALPHA") {
        return res.status(401).json({ error: "Access Denied" });
    }

    const { error } = await supabase.from('posts').insert([{
        content: `${content} \n${video_url}`,
        user_name: "DryPaper Automation",
        user_handle: "@drypaper_hq",
        avatar_url: "/DRYPAPER.png",
        is_bot: true
    }]);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: "Broadcasted." });
};

