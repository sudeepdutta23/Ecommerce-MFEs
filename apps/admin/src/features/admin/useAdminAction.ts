import { useState } from 'react';
import { apiErrorMessage } from '@ecom/utils';

/** Runs a change, showing a failure, then reloads. The backend records each one in its audit log. */
export function useAdminAction(reload: () => Promise<unknown>) {
  const [error, setError] = useState('');

  const run = async (call: () => Promise<unknown>) => {
    setError('');
    try {
      await call();
      await reload();
    } catch (failure) {
      setError(apiErrorMessage(failure));
    }
  };

  return { error, run };
}
