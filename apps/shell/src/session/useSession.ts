import { useEffect, useState } from 'react';
import { type SessionUser } from '@ecom/types';
import { eventBus, getStoredUser } from '@ecom/utils';

/**
 * Shell-side session view.
 *
 * The auth-dashboard remote OWNS authentication; the shell only observes it:
 * initial state comes from persisted session storage, transitions arrive over
 * the event bus. No store is shared across the boundary.
 */
export function useSession(): SessionUser | null {
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
