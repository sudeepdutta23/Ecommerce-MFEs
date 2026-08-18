import { useEffect, useState } from 'react';
import { type SessionUser } from '@ecom/types';
import { eventBus, getStoredUser } from '@ecom/utils';

/**
 * Admin-side session view — same observation pattern as the shell's
 * useSession: the auth-dashboard remote OWNS authentication; this MFE only
 * hydrates from persisted session storage and tracks transitions on the bus.
 */
export function useAdminSession(): SessionUser | null {
  const [user, setUser] = useState<SessionUser | null>(() => getStoredUser());

  useEffect(() => {
    const offLogin = eventBus.on('auth:login', ({ user: nextUser }) => setUser(nextUser));
    const offLogout = eventBus.on('auth:logout', () => setUser(null));
    return () => {
      offLogin();
      offLogout();
    };
  }, []);

  return user;
}
