'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('[GLOBAL ERROR]:', error);
  }, [error]);

  return (
    <html>
      <body className="bg-[#050816] text-white flex items-center justify-center min-h-screen p-4">
        <div className="max-w-md w-full glass-card rounded-2xl p-8 border border-blue-500/10 text-center space-y-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-slate-400 text-sm">
              An unexpected error occurred. Please refresh the page or try again later.
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl font-semibold transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
