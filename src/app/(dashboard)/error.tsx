'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the technical error to the console for developers
    console.error('[Dashboard Error Boundary]', error.message, error.stack);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
      <p className="text-slate-500 max-w-md mb-8">
        We encountered an unexpected error while rendering this page. 
        Don't worry, our team has been notified.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button 
          onClick={() => reset()}
          className="bg-slate-900 hover:bg-slate-800"
        >
          <RefreshCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        
        <Link href="/">
          <Button variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
        </Link>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 p-4 bg-slate-50 rounded-lg border border-slate-200 text-left max-w-2xl overflow-auto">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Developer Debug Info</p>
          <pre className="text-xs text-red-600 font-mono">
            {error.message}
            {'\n\n'}
            {error.stack}
          </pre>
        </div>
      )}
    </div>
  );
}
