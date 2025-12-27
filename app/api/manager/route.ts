import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

// CORS HEADERS (Safety First)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() { return NextResponse.json({}, { headers: corsHeaders }); }

// ENV VARIABLES
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cohereKey = process.env.COHERE_API_KEY;
const githubToken = process.env.GITHUB_TOKEN; 

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req: Request) {
  try {
    const { task, prompt, repo, filePath, errorContext } = await req.json();

    // --- TOOL 1: WRITE TO GITHUB ---
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

        if (!putRes.ok) throw new Error("GitHub Write Failed");
        return "SUCCESS";
    };

    // --- TOOL 2: LEARN & STORE (Knowledge Base) ---
    const storeLesson = async (topic: string, lesson: string) => {
        if (supabase) {
            await supabase.from('knowledge_base').insert([{ 
                topic: topic, 
                insight: lesson, 
                source: 'Self-Correction' 
            }]);
        }
    };

    // === CASE 1: BUILD (Create New) ===
    if (task === 'BUILD') {
        const cohereRes = await fetch("https://api.cohere.ai/v1/chat", {
            method: "POST",
            headers: { "Authorization": `Bearer ${cohereKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "command-r-08-2024",
                message: `You are a Senior React Developer. Write the FULL CODE for: ${filePath}.
                Requirement: ${prompt}.
                IMPORTANT: Do NOT use external libraries like 'next-auth' or 'react-query' unless asked. 
                Use standard 'fetch' and 'useEffect' for Supabase.
                OUTPUT ONLY THE CODE. NO MARKDOWN.`,
                temperature: 0.1
            })
        });
        const data = await cohereRes.json();
        let code = data.text.replace(/```tsx/g, '').replace(/```/g, '').trim();

        await commitToGithub(repo || "kryv-core-", filePath, code, `Nehira Created: ${filePath}`);
        return NextResponse.json({ status: "SUCCESS", msg: `File ${filePath} created.` }, { headers: corsHeaders });
    }

    // === CASE 2: FIX (Self-Heal) ===
    if (task === 'FIX') {
        // 1. Nehira sochegi ki galti kya thi
        const cohereRes = await fetch("https://api.cohere.ai/v1/chat", {
            method: "POST",
            headers: { "Authorization": `Bearer ${cohereKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "command-r-08-2024",
                message: `You are fixing a broken file: ${filePath}.
                The user complained about: "${prompt}".
                CURRENT ERROR CONTEXT: The previous code used missing libraries (next-auth/react-query).
                TASK: Rewrite the code using ONLY standard React hooks (useState, useEffect) and Supabase Client.
                OUTPUT ONLY THE CLEAN CODE.`,
                temperature: 0.1
            })
        });
        const data = await cohereRes.json();
        let fixedCode = data.text.replace(/```tsx/g, '').replace(/```/g, '').trim();

        // 2. Code Rewrite karegi
        await commitToGithub(repo || "kryv-core-", filePath, fixedCode, `Nehira Fixed: ${filePath}`);

        // 3. Lesson Store karegi (Database mein)
        await storeLesson("Coding Standard", "Avoid using next-auth/react-query. Use standard fetch for stability.");

        return NextResponse.json({ status: "FIXED", msg: `I have rewritten ${filePath} and learned a new lesson.` }, { headers: corsHeaders });
    }

    return NextResponse.json({ error: "Unknown Task" }, { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
}

