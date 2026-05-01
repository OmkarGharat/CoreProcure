'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error but don't crash the server
    console.error('[Dashboard Error Boundary]', error.message, error.digest);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-red-100 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-500 mb-6">
            An unexpected error occurred while loading this page. This has been logged and our team will investigate.
          </p>
          {error.digest && (
            <p className="text-xs text-slate-400 mb-4 font-mono">Error ID: {error.digest}</p>
          )}
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/')}
              className="border-slate-200"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            <Button
              onClick={reset}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
