"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import Sidebar from '../../components/Sidebar';
import Link from 'next/link';

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (query) performSearch(query);
    }, [query]);

    const performSearch = async (term: string) => {
        setLoading(true);
        // Call the RPC function (SQL)
        const { data, error } = await supabase.rpc('search_kryv', { keyword: term });
        if (data) setResults(data);
        else console.error("Search Error:", error);
        setLoading(false);
    };

    return (
        <div className="flex-1 md:ml-64 bg-[#050505] min-h-screen text-white border-r border-gray-800">
             <div className="p-6 border-b border-gray-800 sticky top-0 bg-black/90 backdrop-blur-md z-50">
                 <h2 className="text-2xl font-bold tracking-widest text-emerald-500">SEARCH: "{query}"</h2>
             </div>

             <div className="p-4 pb-20 space-y-4">
                 {loading && <div className="text-emerald-500 animate-pulse">Scanning Neural Network...</div>}
                 
                 {!loading && results.length === 0 && <div className="text-gray-500">No signals found in the matrix.</div>}

                 {results.map((item: any, i) => (
                     <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                         {item.type === 'user' ? (
                             // USER CARD
                             <Link href={`/profile?id=${item.id}`} className="flex items-center gap-4 p-4 bg-gray-900/40 rounded-xl border border-gray-800 hover:border-emerald-500 transition group">
                                 <img src={item.image || "/KRYV.png"} className="w-12 h-12 rounded-full object-cover group-hover:scale-110 transition" onError={(e)=>e.currentTarget.src="/KRYV.png"} />
                                 <div>
                                     <h3 className="font-bold text-lg text-white">{item.content}</h3> 
                                     <p className="text-xs text-emerald-500 font-mono">@{item.content.toLowerCase().replace(/\s/g, '_')}</p>
                                     <p className="text-sm text-gray-500 line-clamp-1">{item.secondary}</p> 
                                 </div>
                             </Link>
                         ) : (
                             // POST CARD
                             <Link href={`/`} className="block p-4 bg-black border-l-2 border-gray-800 hover:border-emerald-500 transition pl-6">
                                  <p className="text-gray-300 text-lg font-light">"{item.content}"</p>
                                  <p className="text-xs text-gray-600 mt-2 font-mono">SIGNAL INTERCEPTED • {new Date(item.secondary).toLocaleTimeString()}</p>
                             </Link>
                         )}
                     </div>
                 ))}
             </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white flex">
            <Sidebar currentUser={null} />
            <Suspense fallback={<div>Loading...</div>}>
                <SearchContent />
            </Suspense>
        </div>
    )
}
