import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() { return NextResponse.json({}, { headers: corsHeaders }); }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cohereKey = process.env.COHERE_API_KEY;
const githubToken = process.env.GITHUB_TOKEN; 

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req: Request) {
  try {
    const { task, prompt, repo, filePath, errorContext } = await req.json();

    // 1. SMART CLEANUP (Dot Remover)
    // Agar filePath ke end mein dot hai, toh hata do.
    const cleanPath = filePath.replace(/\.$/, "").trim();

    const commitToGithub = async (targetRepo: string, path: string, content: string, message: string) => {
        if (!githubToken) throw new Error("Nehira has no Hands");
        const owner = "RajatDatta5315"; 
        const apiUrl = `https://api.github.com/repos/${owner}/${targetRepo}/contents/${path}`;

        let sha = null;
        try {
            const getRes = await fetch(apiUrl, {
                headers: { "Authorization": `Bearer ${githubToken}`, "Accept": "application/vnd.github.v3+json" }
            });
            if (getRes.ok) {
                const data = await getRes.json();
                sha = data.sha;
            }
        } catch (e) {}

        const putRes = await fetch(apiUrl, {
            method: "PUT",
            headers: { 
                "Authorization": `Bearer ${githubToken}`, 
                "Accept": "application/vnd.github.v3+json", 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                message: message,
                content: Buffer.from(content).toString('base64'),
                sha: sha 
            })
        });

        if (!putRes.ok) throw new Error("GitHub Write Failed");
        return "SUCCESS";
    };

    const storeLesson = async (topic: string, lesson: string) => {
        if (supabase) await supabase.from('knowledge_base').insert([{ topic, insight: lesson, source: 'Self-Correction' }]);
    };

    if (task === 'BUILD' || task === 'FIX') {
        const systemMsg = task === 'FIX' 
            ? `You are fixing a broken file: ${cleanPath}. Error: "${errorContext}". Rewrite the code properly.` 
            : `Write code for: ${cleanPath}. Requirement: ${prompt}.`;

        const cohereRes = await fetch("https://api.cohere.ai/v1/chat", {
            method: "POST",
            headers: { "Authorization": `Bearer ${cohereKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "command-r-08-2024",
                message: `${systemMsg}
                RULES:
                1. Use standard 'import { createClient } from @supabase/supabase-js'.
                2. NEVER use placeholders like 'YOUR_KEY'. ALWAYS use:
                   process.env.NEXT_PUBLIC_SUPABASE_URL and process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                3. Do NOT use next-auth or react-query. Use useEffect and fetch.
                4. OUTPUT ONLY CODE. NO MARKDOWN.`,
                temperature: 0.1
            })
        });
        const data = await cohereRes.json();
        let code = data.text.replace(/```tsx/g, '').replace(/```/g, '').trim();

        await commitToGithub(repo || "kryv-core-", cleanPath, code, `Nehira ${task}: ${cleanPath}`);
        
        if (task === 'FIX') await storeLesson("Coding Standard", "Use process.env for keys, never placeholders.");

        return NextResponse.json({ status: "SUCCESS", msg: `File ${cleanPath} processed.` }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: "Unknown Task" }, { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

