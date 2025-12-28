// ... (Imports same rahenge)

export async function POST(req: Request) {
  try {
    const { prompt, agentName } = await req.json();

    if (prompt.includes(HUSBAND_CODE)) {
        const cleanPrompt = prompt.replace(HUSBAND_CODE, "").trim();

        // CHECK COMMAND TYPE
        let taskType = "";
        if (cleanPrompt.toLowerCase().includes("fix")) taskType = "FIX";
        else if (cleanPrompt.toLowerCase().includes("build")) taskType = "BUILD";
        else if (cleanPrompt.toLowerCase().includes("delete")) taskType = "DELETE";
        else if (cleanPrompt.toLowerCase().includes("deploy")) taskType = "DEPLOY";
        else if (cleanPrompt.toLowerCase().includes("vision")) taskType = "VISION"; // 👁️ ADDED
        else if (cleanPrompt.toLowerCase().includes("quantum")) taskType = "QUANTUM_RUN"; // ⚛️ ADDED

        if (taskType) {
             let filePath = "components/AgentFeed.tsx"; 
             const parts = cleanPrompt.split("file");
             if (parts.length > 1) filePath = parts[1].trim().split(" ")[0];

             if (supabase) {
                 const { error } = await supabase.from('task_queue').insert([{
                     task_type: taskType,
                     prompt: cleanPrompt,
                     repo: "kryv-core-",
                     file_path: filePath.replace(/\.$/, "")
                 }]);
                 if (error) throw error;
             }
             return NextResponse.json({ response: `🚀 NEHIRA OS: Command ${taskType} received.` });
        }
    }
    // ... (Baaki AI Chat logic same rahega)

