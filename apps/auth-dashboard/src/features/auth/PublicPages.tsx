import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button, Card, CardBody, Notice, TextInput } from '@ecom/ui';
import { apiErrorMessage, authApi, getAuthToken, organizationsApi } from '@ecom/utils';

const PASSWORD_HINT = 'At least 12 characters, not your email and not a common password.';

function SingleCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md animate-fade-in-up">
      <Card>
        <CardBody className="space-y-4 px-6 py-6">
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
          {children}
        </CardBody>
      </Card>
    </div>
  );
}

/** Opened from the emailed link. */
export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [state, setState] = useState<'working' | 'done' | string>('working');
  // A link works once: React's double effect in development must not spend it twice.
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    authApi
      .verifyEmail(token)
      .then(() => setState('done'))
      .catch((error) => setState(apiErrorMessage(error, 'This link is invalid or has expired.')));
  }, [token]);

  return (
    <SingleCard title="Confirm your email">
      {state === 'working' ? <Notice tone="info">Confirming…</Notice> : null}
      {state === 'done' ? (
        <>
          <Notice tone="success">Your email is confirmed. You can sign in now.</Notice>
          <Link to="/account/login">
            <Button className="w-full">Sign in</Button>
          </Link>
        </>
      ) : null}
      {state !== 'working' && state !== 'done' ? (
        <>
          <Notice>{state}</Notice>
          <ResendVerification />
        </>
      ) : null}
    </SingleCard>
  );
}

export function ResendVerification({ initialEmail = '' }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await authApi.resendVerification(email);
      setMessage('If that address has an unconfirmed account, a new link is on its way.');
    } catch (failure) {
      setError(apiErrorMessage(failure));
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-3">
      <TextInput label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <Notice>{error}</Notice>
      <Notice tone="success">{message}</Notice>
      <Button type="submit" variant="secondary" className="w-full">
        Send a new confirmation link
      </Button>
    </form>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (failure) {
      setError(apiErrorMessage(failure));
    }
  };

  return (
    <SingleCard title="Reset your password">
      {sent ? (
        <Notice tone="success">If that address has an account, a reset link is on its way.</Notice>
      ) : (
        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <TextInput label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <Notice>{error}</Notice>
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </form>
      )}
      <Link to="/account/login" className="block text-center text-sm font-semibold text-brand-600">
        Back to sign in
      </Link>
    </SingleCard>
  );
}

/** Opened from the emailed link. */
export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await authApi.resetPassword(params.get('token') ?? '', password);
      setDone(true);
    } catch (failure) {
      setError(apiErrorMessage(failure, 'This link is invalid or has expired.'));
    }
  };

  return (
    <SingleCard title="Choose a new password">
      {done ? (
        <>
          <Notice tone="success">Your password was changed, and every device was signed out.</Notice>
          <Link to="/account/login">
            <Button className="w-full">Sign in</Button>
          </Link>
        </>
      ) : (
        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <TextInput
            label="New password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <p className="text-xs text-slate-400">{PASSWORD_HINT}</p>
          <Notice>{error}</Notice>
          <Button type="submit" className="w-full">
            Change password
          </Button>
        </form>
      )}
    </SingleCard>
  );
}

/** Opened from the emailed link; works only signed in with the invited address. */
export function AcceptInvitationPage() {
  const [params] = useSearchParams();
  const [joined, setJoined] = useState('');
  const [error, setError] = useState('');

  if (!getAuthToken()) {
    return (
      <SingleCard title="You have been invited">
        <Notice tone="info">Sign in with the invited email address, then open the link again.</Notice>
        <Link to="/account/login">
          <Button className="w-full">Sign in</Button>
        </Link>
      </SingleCard>
    );
  }

  const accept = async () => {
    setError('');
    try {
      const organization = await organizationsApi.acceptInvitation(params.get('token') ?? '');
      setJoined(organization.name);
    } catch (failure) {
      setError(apiErrorMessage(failure, 'This invitation is invalid, expired, or meant for another address.'));
    }
  };

  return (
    <SingleCard title="You have been invited">
      <Notice>{error}</Notice>
      {joined ? (
        <>
          <Notice tone="success">You joined {joined}.</Notice>
          <Link to="/account/seller">
            <Button className="w-full">Go to your shops</Button>
          </Link>
        </>
      ) : (
        <Button className="w-full" onClick={() => void accept()}>
          Accept invitation
        </Button>
      )}
    </SingleCard>
  );
}
