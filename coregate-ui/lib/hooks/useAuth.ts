'use client';

import { useEffect, useState } from 'react';

interface SessionUser {
  id: string;
  username: string;
  name: string;
  role: 'buyer' | 'seller' | 'admin';
}

interface SessionData {
  user: SessionUser;
}

interface UseAuthResult {
  session: SessionData | null;
  loading: boolean;
}

const SESSION_STORAGE_KEY = 'coregate.session';

export function useRequireAuth(): UseAuthResult {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) {
        setSession(null);
      } else {
        setSession(JSON.parse(raw) as SessionData);
      }
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { session, loading };
}

export function useRequireRole(role: SessionUser['role']): UseAuthResult {
  const auth = useRequireAuth();
  if (!auth.session || hasRoleAccess(auth.session.user.role, role)) {
    return auth;
  }

  return { session: null, loading: false };
}

function hasRoleAccess(userRole: SessionUser['role'], requiredRole: SessionUser['role']) {
  if (userRole === requiredRole) return true;
  if (userRole === 'admin' && (requiredRole === 'seller' || requiredRole === 'buyer')) return true;
  return false;
}

export function saveSession(session: SessionData) {
  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}
