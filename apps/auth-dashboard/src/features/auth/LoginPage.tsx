import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn, Button, Card, CardBody, Notice, Spinner, TextInput } from '@ecom/ui';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { clearError, login, register } from './auth.slice';
import { ResendVerification } from './PublicPages';

type Mode = 'signin' | 'register';

const MODE_COPY: Record<
  Mode,
  { emoji: string; title: string; subtitle: string; cta: string; busy: string }
> = {
  signin: {
    emoji: '👋',
    title: 'Welcome back',
    subtitle: 'Sign in to your SudeepMart account',
    cta: 'Sign in',
    busy: 'Signing in…',
  },
  register: {
    emoji: '✨',
    title: 'Join SudeepMart',
    subtitle: 'Create your account in seconds',
    cta: 'Create account',
    busy: 'Creating account…',
  },
};

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error, errorCode } = useAppSelector((state) => state.auth);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const copy = MODE_COPY[mode];

  const switchMode = (next: Mode) => {
    setMode(next);
    dispatch(clearError());
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (mode === 'register') {
      const result = await dispatch(register({ email, password }));
      if (register.fulfilled.match(result)) {
        setRegisteredEmail(email);
        setPassword('');
      }
      return;
    }
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      navigate('..');
    }
  };

  if (registeredEmail) {
    return (
      <div className="mx-auto max-w-md animate-fade-in-up">
        <Card>
          <CardBody className="space-y-4 px-6 py-6">
            <h1 className="text-xl font-bold text-slate-900">Check your inbox</h1>
            <Notice tone="success">
              We sent a confirmation link to {registeredEmail}. Open it to activate your account, then sign in.
            </Notice>
            <ResendVerification initialEmail={registeredEmail} />
            <Button variant="ghost" className="w-full" onClick={() => setRegisteredEmail('')}>
              Back to sign in
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md animate-fade-in-up">
      <Card className="overflow-hidden">
        {/* Gradient masthead */}
        <div className="bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 px-6 py-8 text-center text-white">
          <span
            key={mode}
            className="mx-auto flex h-14 w-14 animate-scale-in items-center justify-center rounded-2xl bg-white/15 text-3xl shadow-lg backdrop-blur-sm"
          >
            {copy.emoji}
          </span>
          <h1 className="mt-4 text-xl font-bold">{copy.title}</h1>
          <p className="mt-1 text-sm text-white/80">{copy.subtitle}</p>
        </div>

        <CardBody className="px-6 py-6">
          {/* Mode switch */}
          <div className="mb-5 flex rounded-lg bg-surface-sunken p-1" role="tablist" aria-label="Authentication mode">
            {(['signin', 'register'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={mode === tab}
                onClick={() => switchMode(tab)}
                className={cn(
                  'flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                  mode === tab
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700',
                )}
              >
                {tab === 'signin' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <TextInput
                label="Email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '180ms' }}>
              <TextInput
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                required
                error={error ?? undefined}
              />
              {mode === 'register' && !error ? (
                <p className="mt-1.5 text-xs text-slate-400">
                  At least 12 characters, not your email and not a common password.
                </p>
              ) : null}
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '260ms' }}>
              <Button type="submit" className="w-full" disabled={status === 'loading'}>
                {status === 'loading' ? (
                  <>
                    <Spinner size="sm" className="[&>span]:border-white/40 [&>span]:border-t-white" />
                    {copy.busy}
                  </>
                ) : (
                  copy.cta
                )}
              </Button>
            </div>
            {mode === 'signin' ? (
              <Link to="../forgot-password" className="block text-center text-sm font-semibold text-brand-600">
                Forgot your password?
              </Link>
            ) : null}
          </form>
          {errorCode === 'AUTH_EMAIL_NOT_VERIFIED' ? (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <ResendVerification initialEmail={email} />
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
