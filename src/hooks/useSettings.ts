/**
 * useSettings — Supabase-backed app settings hook
 * useShipping — Supabase-backed shipping providers hook
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { dbSettingsToApp, appSettingsToDb, dbProviderToApp } from '@/lib/mappers';
import { addAuditLog } from '@/lib/logger';
import type { AppSettings, ShippingProvider } from '@/types';

// ─── APP SETTINGS ─────────────────────────────────────────────────────────────

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('app_settings')
        .select('*')
        .single();

      if (fetchErr) throw fetchErr;
      setSettings(dbSettingsToApp(data));
    } catch (err: any) {
      setError(err.message ?? 'خطأ في تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (updates: Partial<AppSettings>): Promise<boolean> => {
    if (!settings) return false;
    setSaving(true);
    setError(null);
    try {
      const { error: updateErr } = await supabase
        .from('app_settings')
        .update(appSettingsToDb(updates))
        .neq('id', '00000000-0000-0000-0000-000000000000'); // update the single row

      if (updateErr) throw updateErr;

      setSettings(prev => prev ? { ...prev, ...updates } : null);
      await addAuditLog('system', 'تحديث الإعدادات', 'تم تحديث إعدادات التطبيق');
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [settings]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  return { settings, loading, saving, error, fetchSettings, saveSettings };
}

// ─── SHIPPING PROVIDERS ───────────────────────────────────────────────────────

export function useShipping() {
  const [providers, setProviders] = useState<ShippingProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('shipping_providers')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchErr) throw fetchErr;
      setProviders((data ?? []).map(dbProviderToApp));
    } catch (err: any) {
      setError(err.message ?? 'خطأ في تحميل مزودي الشحن');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProvider = useCallback(async (
    id: string,
    updates: Partial<ShippingProvider>,
  ): Promise<boolean> => {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
      if (updates.apiKey !== undefined) dbUpdates.api_key = updates.apiKey;
      if (updates.apiId !== undefined) dbUpdates.api_id = updates.apiId;

      const { error: updateErr } = await supabase
        .from('shipping_providers')
        .update(dbUpdates)
        .eq('id', id);

      if (updateErr) throw updateErr;
      setProviders(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, []);

  const setActiveProvider = useCallback(async (providerId: string): Promise<boolean> => {
    try {
      // Deactivate all, then activate the chosen one
      await supabase.from('shipping_providers').update({ is_active: false }).neq('id', 'none');
      await supabase.from('shipping_providers').update({ is_active: true }).eq('id', providerId);

      // Also update app_settings.active_provider_id
      await supabase.from('app_settings').update({ active_provider_id: providerId })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      setProviders(prev => prev.map(p => ({ ...p, isActive: p.id === providerId })));
      const provider = providers.find(p => p.id === providerId);
      await addAuditLog('system', 'تغيير مزود الشحن', `تفعيل ${provider?.name}`);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [providers]);

  const activeProvider = providers.find(p => p.isActive) ?? providers[0] ?? null;

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  return { providers, activeProvider, loading, error, fetchProviders, updateProvider, setActiveProvider };
}
