'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      console.log('[DEBUG] Auth callback route reached');
      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');

      if (code) {
        console.log('[DEBUG] Auth code found, exchanging for session...');
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (error) {
          console.error('[DEBUG] Auth callback error:', error.message);
          router.push(`/auth?error=${encodeURIComponent(error.message)}`);
        } else {
          console.log('[DEBUG] Session established successfully:', !!data.session);
          router.push('/dashboard');
          router.refresh();
        }
      } else {
        console.warn('[DEBUG] No auth code found in URL');
        router.push('/auth');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-slate-400 animate-pulse">Completing authentication...</p>
      </div>
    </div>
  );
}


