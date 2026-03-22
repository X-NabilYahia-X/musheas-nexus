/**
 * useAuth — Supabase Auth hook
 * Manages login, logout, and session state.
 * Replaces the old localStorage-based musheas_session.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserSession } from '@/types';

export function useAuth() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSession = useCallback(async () => {
    const { data: { session: supaSession } } = await supabase.auth.getSession();

    if (!supaSession) {
      setSession(null);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, full_name, role')
      .eq('id', supaSession.user.id)
      .single();

    if (profile) {
      setSession({
        username: profile.username,
        fullName: profile.full_name,
        role: profile.role,
      });
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setError(null);
    const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
    if (loginErr) {
      setError('بيانات الدخول غير صحيحة');
      return false;
    }
    await loadSession();
    return true;
  }, [loadSession]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const isAdmin = session?.role === 'admin';
  const isDelivery = session?.role === 'delivery';

  useEffect(() => {
    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      loadSession();
    });

    return () => subscription.unsubscribe();
  }, [loadSession]);

  return { session, loading, error, login, logout, isAdmin, isDelivery };
}
