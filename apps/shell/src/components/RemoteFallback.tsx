import { type RemoteDefinition } from '@ecom/types';
import { Button, Card, CardBody, Spinner } from '@ecom/ui';

export function RemoteLoadingFallback({ remote }: { remote: RemoteDefinition }) {
  return (
    <div className="flex min-h-[50vh] animate-fade-in flex-col items-center justify-center gap-3">
      <Spinner size="lg" label={`Loading ${remote.displayName}`} />
      <p className="animate-pulse text-sm text-slate-500">Loading {remote.displayName}…</p>
    </div>
  );
}

interface RemoteErrorFallbackProps {
  remote: RemoteDefinition;
  error: Error;
  onRetry: () => void;
}

export function RemoteErrorFallback({ remote, error, onRetry }: RemoteErrorFallbackProps) {
  return (
    <div className="mx-auto mt-16 max-w-lg animate-fade-in-up">
      <Card>
        <CardBody className="flex flex-col items-center gap-4 py-10 text-center">
          <span className="flex h-12 w-12 animate-wiggle items-center justify-center rounded-full bg-red-50 text-2xl">
            ⚠️
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {remote.displayName} is unavailable
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              This section could not be loaded. The rest of the application is unaffected.
            </p>
            <p className="mt-3 rounded bg-surface-sunken px-3 py-2 font-mono text-xs text-slate-500">
              {error.message}
            </p>
          </div>
          <Button onClick={onRetry}>Try again</Button>
        </CardBody>
      </Card>
    </div>
  );
}
