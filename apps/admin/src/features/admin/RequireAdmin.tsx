import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody } from '@ecom/ui';
import { useAdminSession } from './useAdminSession';
import { ShieldIcon } from './icons';

function Gate({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-navy via-[#252e4f] to-[#131828] px-6 py-12 font-sans animate-fade-in-up">
      <p className="text-xl font-bold tracking-tight text-white">
        SudeepMart <span className="text-brand-400">Ops</span>
      </p>
      <Card className="w-full max-w-md text-center">
        <CardBody className="px-8 py-10">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <ShieldIcon className="h-7 w-7" />
          </span>
          <h2 className="mt-5 text-lg font-semibold text-slate-900">{title}</h2>
          <div className="mt-2 text-sm text-slate-500">{children}</div>
        </CardBody>
      </Card>
      <Link to="/" className="text-sm text-white/60 transition-colors hover:text-white">
        ← Back to SudeepMart
      </Link>
    </div>
  );
}

/**
 * Role gate for the whole console. UI-level enforcement only — real
 * protection lives in the backend, which checks the ADMIN role on every
 * request. This keeps non-admin sessions from even seeing ops tooling.
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const user = useAdminSession();

  if (!user) {
    return (
      <Gate title="Sign in required">
        <p>The admin console is only available to signed-in administrators.</p>
        <Link to="/account" className="mt-5 inline-block">
          <Button>Go to sign in</Button>
        </Link>
      </Gate>
    );
  }

  if (user.role !== 'admin') {
    return (
      <Gate title="Admin access only">
        <p>
          You are signed in as <b className="font-semibold text-slate-700">{user.email}</b> with a
          customer account. Ask an administrator to grant you the ADMIN role.
        </p>
      </Gate>
    );
  }

  return <>{children}</>;
}
