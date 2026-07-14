import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn, Button, Card, CardBody, Spinner, TextInput } from '@ecom/ui';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { clearError, login, register } from './auth.slice';

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
  const { status, error } = useAppSelector((state) => state.auth);

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
    const action = mode === 'signin' ? login : register;
    const result = await dispatch(action({ email, password }));
    if (action.fulfilled.match(result)) {
      navigate('..');
    }
  };

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
                  At least 8 characters, with a letter and a digit.
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
            <p className="text-center text-xs text-slate-400">
              Seeded demo account: user@example.com / User1234!
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
