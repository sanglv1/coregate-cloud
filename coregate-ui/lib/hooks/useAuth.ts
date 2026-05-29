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
const ADMIN_AUTH_STORAGE_KEY = 'coregate.admin.auth';

export interface AdminCredentials {
  username: string;
  password: string;
}

export function readSession(): SessionData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export function useRequireAuth(): UseAuthResult {
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function sync() {
      setSession(readSession());
      setLoading(false);
    }
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('coregate:session-changed', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('coregate:session-changed', sync);
    };
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
  window.dispatchEvent(new Event('coregate:session-changed'));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
  clearAdminCredentials();
  window.dispatchEvent(new Event('coregate:session-changed'));
}

export function saveAdminCredentials(credentials: AdminCredentials) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(credentials));
}

export function getAdminCredentials(): AdminCredentials | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AdminCredentials;
  } catch {
    return null;
  }
}

export function clearAdminCredentials() {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
}
