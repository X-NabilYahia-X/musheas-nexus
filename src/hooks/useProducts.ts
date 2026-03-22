/**
 * useProducts — Supabase-backed products hook
 * Replaces all MOCK_PRODUCTS usage with real-time data.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { dbProductToApp, appProductToDb } from '@/lib/mappers';
import { addAuditLog } from '@/lib/logger';
import type { Product } from '@/types';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchErr) throw fetchErr;
      setProducts((data ?? []).map(dbProductToApp));
    } catch (err: any) {
      setError(err.message ?? 'خطأ في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Create product ────────────────────────────────────────────────────────
  const createProduct = useCallback(async (product: Omit<Product, 'id'>): Promise<Product | null> => {
    try {
      const { data, error: insertErr } = await supabase
        .from('products')
        .insert(appProductToDb(product))
        .select()
        .single();

      if (insertErr) throw insertErr;

      const newProduct = dbProductToApp(data);
      setProducts(prev => [...prev, newProduct]);
      await addAuditLog('product', 'إضافة منتج', `إضافة "${product.name}" بسعر ${product.price} DA`);
      return newProduct;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, []);

  // ── Update product ────────────────────────────────────────────────────────
  const updateProduct = useCallback(async (
    id: string,
    updates: Partial<Omit<Product, 'id'>>,
  ): Promise<boolean> => {
    try {
      const { error: updateErr } = await supabase
        .from('products')
        .update(appProductToDb(updates))
        .eq('id', id);

      if (updateErr) throw updateErr;

      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
      await addAuditLog('product', 'تعديل منتج', `تعديل المنتج "${updates.name ?? id}"`);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, []);

  // ── Toggle active state ───────────────────────────────────────────────────
  const toggleProductActive = useCallback(async (id: string): Promise<boolean> => {
    const product = products.find(p => p.id === id);
    if (!product) return false;

    const newActive = !product.active;
    const ok = await updateProduct(id, { active: newActive });
    if (ok) {
      await addAuditLog(
        'product',
        newActive ? 'تفعيل منتج' : 'تعطيل منتج',
        `${newActive ? 'تفعيل' : 'تعطيل'} المنتج "${product.name}"`,
      );
    }
    return ok;
  }, [products, updateProduct]);

  // ── Bulk update stock ─────────────────────────────────────────────────────
  const updateStock = useCallback(async (id: string, stock: number): Promise<boolean> => {
    return updateProduct(id, { stock });
  }, [updateProduct]);

  // ── Delete product ────────────────────────────────────────────────────────
  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    try {
      const product = products.find(p => p.id === id);
      const { error: delErr } = await supabase.from('products').delete().eq('id', id);
      if (delErr) throw delErr;

      setProducts(prev => prev.filter(p => p.id !== id));
      await addAuditLog('product', 'حذف منتج', `حذف المنتج "${product?.name}"`);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [products]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    toggleProductActive,
    updateStock,
    deleteProduct,
  };
}
