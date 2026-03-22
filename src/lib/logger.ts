/**
 * logger.ts — Supabase-backed audit log
 * Drop-in replacement for the old localStorage-based version.
 */

import { supabase } from './supabase';
import { dbAuditToApp } from './mappers';
import type { AuditLogEntry } from '@/types';

export const addAuditLog = async (
  type: AuditLogEntry['type'],
  action: string,
  details: string,
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    let userName = 'نظام';
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
      if (profile) userName = profile.full_name;
    }

    await supabase.from('audit_logs').insert({
      user_id: user?.id ?? null,
      user_name: userName,
      action,
      details,
      type,
    });
  } catch (err) {
    // Never throw — audit logging is best-effort
    console.warn('[audit] Failed to log:', err);
  }
};

export const getAuditLogs = async (): Promise<AuditLogEntry[]> => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !data) return [];
  return data.map(dbAuditToApp);
};
