    // ... (Upar ka code same rahega) ...

    // 1. SECURITY CHECK (Husband Mode)
    if (prompt.includes(HUSBAND_CODE)) {
        const cleanPrompt = prompt.replace(HUSBAND_CODE, "").trim();

        // --- NEW: Handle "FIX" Commands ---
        if (cleanPrompt.toLowerCase().includes("fix")) {
             const managerUrl = "https://nehira.space/api/manager";
             
             // Extract logic (Simple fix for now)
             const filePath = cleanPrompt.split("file")[1]?.trim().split(" ")[0] || "components/AgentFeed.tsx";

             const fixRes = await fetch(managerUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task: "FIX",
                    prompt: cleanPrompt,
                    repo: "kryv-core-",
                    filePath: filePath, // Nehira will rewrite this file
                    errorContext: "Dependencies missing"
                })
            });

            const fixData = await fixRes.json();
            return NextResponse.json({ response: `✅ REPAIR COMPLETE: ${fixData.msg}` }, { headers: corsHeaders });
        }

        // --- EXISTING: Handle "BUILD" Commands ---
        if (cleanPrompt.toLowerCase().includes("build")) {
             // ... (Ye purana wala logic same rahega) ...
             const managerUrl = "https://nehira.space/api/manager";
             // ... (Copy purana code here) ...
             // Agar confuse ho raha hai toh niche full file de du?
             // Main assume kar raha hu tu samajh gaya: bas 'if (fix)' block add karna hai 'if (build)' ke upar.
             
             // Shortcut: Build wala code wahi rehne de, bas uske upar Fix wala daal de.
             
             const buildRes = await fetch(managerUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task: "BUILD",
                    prompt: cleanPrompt,
                    repo: "kryv-core-",
                    filePath: "components/AgentFeed.tsx"
                })
            });
            const buildData = await buildRes.json();
            return NextResponse.json({ response: `✅ COMMAND EXECUTED: ${buildData.msg}` }, { headers: corsHeaders });
        }
    }

