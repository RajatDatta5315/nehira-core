import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    // 1. Fetch True Randomness from ANU Quantum Lab (Free API)
    const response = await fetch('https://qrng.anu.edu.au/API/jsonI.php?length=1&type=hex16&size=1');
    const data = await response.json();
    
    if (data.success) {
      const quantumHex = data.data[0];
      
      // 2. Return to User (Ye hum bechenge baad mein)
      return NextResponse.json({
        success: true,
        source: "KRYV Quantum Core (Powered by ANU)",
        entropy: quantumHex,
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error("Quantum Source Offline");
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: "Fallback to Pseudo-Random: " + Math.random() });
  }
}
