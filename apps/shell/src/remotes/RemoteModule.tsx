import { lazy, Suspense, useMemo, useState } from 'react';
import { type RemoteAppModule, type RemoteDefinition } from '@ecom/types';
import { ErrorBoundary } from '@ecom/ui';
import { RemoteErrorFallback, RemoteLoadingFallback } from '@/components/RemoteFallback';
import { loadRemoteModule } from './load-remote';

interface RemoteModuleProps {
  remote: RemoteDefinition;
}

/**
 * Mounts a remote MFE with the full resilience stack:
 * Suspense loading fallback, error boundary, and a retry path that
 * re-attempts the federation load (the loader evicts failed containers).
 */
export function RemoteModule({ remote }: RemoteModuleProps) {
  const [attempt, setAttempt] = useState(0);

  const LazyRemote = useMemo(
    () => lazy(() => loadRemoteModule<RemoteAppModule>(remote)),
    // `attempt` is an intentional extra dependency: bumping it recreates the
    // lazy component, forcing a fresh load after a failure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [remote, attempt],
  );

  return (
    <ErrorBoundary
      key={`${remote.scope}-${attempt}`}
      onError={(error) => {
        // Central place to forward remote failures to observability tooling.
        console.error(`[shell] Remote "${remote.scope}" crashed:`, error);
      }}
      fallback={(error) => (
        <RemoteErrorFallback
          remote={remote}
          error={error}
          onRetry={() => setAttempt((n) => n + 1)}
        />
      )}
    >
      <Suspense fallback={<RemoteLoadingFallback remote={remote} />}>
        <LazyRemote />
      </Suspense>
    </ErrorBoundary>
  );
}
