import { Link } from 'react-router-dom';
import { Button } from '@ecom/ui';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <span className="animate-float text-6xl" aria-hidden>
        🛸
      </span>
      <p className="animate-fade-in-up text-6xl font-bold text-slate-200">404</p>
      <h1 className="animate-fade-in-up text-xl font-semibold text-slate-900" style={{ animationDelay: '100ms' }}>
        Page not found
      </h1>
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <Link to="/">
          <Button variant="secondary">Back to home</Button>
        </Link>
      </div>
    </div>
  );
}
