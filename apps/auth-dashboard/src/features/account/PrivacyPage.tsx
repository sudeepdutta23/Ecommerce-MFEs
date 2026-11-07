import { useState } from 'react';
import { Button, Card, CardBody, Notice, TextInput } from '@ecom/ui';
import { apiErrorMessage, authApi, endLocalSession } from '@ecom/utils';

/** Personal data export and the two ways to leave. Both leavings ask for the password again. */
export function PrivacyPage() {
  const [password, setPassword] = useState('');
  const [confirmErase, setConfirmErase] = useState(false);
  const [error, setError] = useState('');

  const download = async () => {
    setError('');
    try {
      const data = await authApi.exportData();
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'my-data.json';
      link.click();
      URL.revokeObjectURL(url);
    } catch (failure) {
      setError(apiErrorMessage(failure, 'Could not export your data.'));
    }
  };

  const leave = async (call: (password: string) => Promise<void>) => {
    setError('');
    try {
      await call(password);
      endLocalSession();
    } catch (failure) {
      setError(apiErrorMessage(failure, 'That did not work. Check your password.'));
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Privacy</h1>
      <Notice>{error}</Notice>

      <Card>
        <CardBody className="space-y-3 px-6 py-6 text-sm text-slate-600">
          <h2 className="text-base font-semibold text-slate-900">Your data</h2>
          <p>Download everything stored about you, as a JSON file.</p>
          <Button variant="secondary" onClick={() => void download()}>
            Download my data
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-3 px-6 py-6 text-sm text-slate-600">
          <h2 className="text-base font-semibold text-slate-900">Leave</h2>
          <TextInput
            label="Your password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <p>Deactivating signs you out and blocks sign-in. Your data stays.</p>
          <Button variant="secondary" disabled={!password} onClick={() => void leave(authApi.deactivate)}>
            Deactivate my account
          </Button>
          <p className="pt-2">Erasing removes your personal data for good. This cannot be undone.</p>
          {confirmErase ? (
            <span className="flex gap-2">
              <Button variant="danger" disabled={!password} onClick={() => void leave(authApi.erase)}>
                Yes, erase everything
              </Button>
              <Button variant="ghost" onClick={() => setConfirmErase(false)}>
                Keep my account
              </Button>
            </span>
          ) : (
            <Button variant="danger" onClick={() => setConfirmErase(true)}>
              Erase my account
            </Button>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
