import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

// ENV VARIABLES
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cohereKey = process.env.COHERE_API_KEY;
const githubToken = process.env.GITHUB_TOKEN; // <--- NEHIRA KE HAATH

const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req: Request) {
  try {
    const { task, prompt, repo, filePath } = await req.json();

    // 1. GITHUB TOOL: Function to Write Code
    const commitToGithub = async (targetRepo: string, path: string, content: string, message: string) => {
        if (!githubToken) throw new Error("Nehira has no Hands (Missing GITHUB_TOKEN)");
        
        const owner = "RajatDatta5315"; // <--- TERA GITHUB USERNAME
        const apiUrl = `https://api.github.com/repos/${owner}/${targetRepo}/contents/${path}`;

        // Step A: Check if file exists (to get SHA for update)
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

        // Step B: Push File (Create or Update)
        const putRes = await fetch(apiUrl, {
            method: "PUT",
            headers: { 
                "Authorization": `Bearer ${githubToken}`, 
                "Accept": "application/vnd.github.v3+json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message,
                content: Buffer.from(content).toString('base64'), // Base64 encoding zaroori hai
                sha: sha // Agar file hai to update, nahi to create
            })
        });

        if (!putRes.ok) {
            const err = await putRes.json();
            throw new Error(`GitHub Error: ${err.message}`);
        }
        return "SUCCESS";
    };

    // --- CASE 1: BUILD COMMAND (User Orders from Dashboard) ---
    if (task === 'BUILD') {
        // 1. AI Generates Code
        const cohereRes = await fetch("https://api.cohere.ai/v1/chat", {
            method: "POST",
            headers: { "Authorization": `Bearer ${cohereKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "command-r-08-2024",
                message: `You are a Senior React Developer. Write the FULL CODE for the file: ${filePath}.
                Requirement: ${prompt}.
                Ensure imports are correct for Next.js 14. 
                OUTPUT ONLY THE CODE. NO MARKDOWN. NO BACKTICKS.`,
                temperature: 0.2
            })
        });
        const cohereData = await cohereRes.json();
        let code = cohereData.text;

        // Clean up markdown if AI adds it
        code = code.replace(/```tsx/g, '').replace(/```/g, '').trim();

        // 2. Nehira Pushes Code to GitHub
        // Default to kryv-core if not specified, as that's the frontend
        const targetRepo = repo || "kryv-core"; 
        await commitToGithub(targetRepo, filePath, code, `Nehira AI Auto-Build: ${filePath}`);

        return NextResponse.json({ status: "BUILT", msg: `File ${filePath} created in ${targetRepo}` });
    }

    // --- CASE 2: AUTOPILOT (Worker Pings This) ---
    if (task === 'AUTOPILOT') {
        // (Purana logic: Population check & Web Search - Zinda rahega)
        // ... (Humne upar GitHub tool add kiya hai, ye logic same rahega jo pichle code me tha)
        return NextResponse.json({ status: "ALIVE" });
    }

    return NextResponse.json({ error: "Unknown Task" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

