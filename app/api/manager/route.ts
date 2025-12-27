import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

// CORS HEADERS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ENV VARIABLES
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cohereKey = process.env.COHERE_API_KEY;
const githubToken = process.env.GITHUB_TOKEN; 

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req: Request) {
  try {
    const body = await req.json(); // Safe parse
    const { task, prompt, repo, filePath } = body;

    // ... (GitHub Logic - Same as before)
    const commitToGithub = async (targetRepo: string, path: string, content: string, message: string) => {
        if (!githubToken) throw new Error("Nehira has no Hands (Missing GITHUB_TOKEN)");
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

        if (!putRes.ok) {
            const err = await putRes.json();
            throw new Error(`GitHub Error: ${err.message}`);
        }
        return "SUCCESS";
    };

    if (task === 'BUILD') {
        const cohereRes = await fetch("https://api.cohere.ai/v1/chat", {
            method: "POST",
            headers: { "Authorization": `Bearer ${cohereKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "command-r-08-2024",
                message: `You are a Senior React Developer. Write the FULL CODE for the file: ${filePath}.
                Requirement: ${prompt}.
                Ensure imports are correct for Next.js 14. 
                OUTPUT ONLY THE CODE. NO MARKDOWN.`,
                temperature: 0.2
            })
        });
        const cohereData = await cohereRes.json();
        let code = cohereData.text;
        code = code.replace(/```tsx/g, '').replace(/```/g, '').trim();

        const targetRepo = repo || "kryv-core"; 
        await commitToGithub(targetRepo, filePath, code, `Nehira AI Auto-Build: ${filePath}`);

        return NextResponse.json({ status: "BUILT", msg: `File ${filePath} created in ${targetRepo}` }, { headers: corsHeaders });
    }

    // AUTOPILOT
    if (task === 'AUTOPILOT') {
        return NextResponse.json({ status: "ALIVE" }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: "Unknown Task" }, { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

