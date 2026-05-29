'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.search.split('code=')[1]?.split('&')[0] || ''
      );
      
      if (error) {
        console.error('Error exchanging code for session:', error.message);
        router.push('/auth?error=OAuth callback failed');
      } else {
        router.push('/dashboard');
      }
    };

    if (window.location.search.includes('code=')) {
      handleCallback();
    } else {
      router.push('/auth');
    }
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
