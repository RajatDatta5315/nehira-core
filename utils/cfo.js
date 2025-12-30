import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function logTransaction(userId, type, amount, desc, isPrivate = false) {
    // 1. PRIVACY CHECK
    // Agar private hai (Chocolate), toh description encrypt/hide kar sakte hain
    // Ya phir ek 'visibility' column use kar sakte hain
    
    const visibility = isPrivate ? 'PRIVATE' : 'PUBLIC';
    
    console.log(`💰 CFO LOG [${visibility}]: ${type} $${amount} - ${desc}`);

    await supabase.from('ledger').insert([{
        user_id: userId, // Kiska kharcha hai
        type: type,
        amount: amount,
        description: desc,
        visibility: visibility // Supabase RLS ispe lagayenge
    }]);

    // Admin Alert (Sirf tere liye)
    if (type === 'DEBIT' && amount > 100) {
        // High expense alert logic
    }
}
