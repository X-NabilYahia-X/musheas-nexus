/**
 * useOrders — Supabase-backed orders hook
 * Replaces all MOCK_ORDERS usage with real-time data.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { dbOrderToApp, appOrderToDb } from '@/lib/mappers';
import { addAuditLog } from '@/lib/logger';
import type { Order, OrderStatus, OrderItem } from '@/types';

interface CreateOrderInput {
  orderNumber: string;
  name: string;
  phone: string;
  wilaya: string;
  total: number;
  status?: OrderStatus;
  orderType?: 'standard' | 'sample';
  notes?: string;
  items: OrderItem[];
  companyName?: string;
  jobTitle?: string;
  industry?: string;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch all orders with items + history ──────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: ordersData, error: ordersErr } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          order_status_history(*)
        `)
        .order('created_at', { ascending: false });

      if (ordersErr) throw ordersErr;

      const mapped = (ordersData ?? []).map((row: any) =>
        dbOrderToApp(row, row.order_items ?? [], row.order_status_history ?? [])
      );
      setOrders(mapped);
    } catch (err: any) {
      setError(err.message ?? 'خطأ في تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Create a new order ────────────────────────────────────────────────────
  const createOrder = useCallback(async (input: CreateOrderInput): Promise<Order | null> => {
    try {
      const { data: orderRow, error: orderErr } = await supabase
        .from('orders')
        .insert(appOrderToDb({
          orderNumber: input.orderNumber,
          name: input.name,
          phone: input.phone,
          wilaya: input.wilaya,
          total: input.total,
          status: input.status ?? 'new',
          orderType: input.orderType ?? 'standard',
          notes: input.notes ?? '',
          companyName: input.companyName,
          jobTitle: input.jobTitle,
          industry: input.industry,
        }))
        .select()
        .single();

      if (orderErr) throw orderErr;

      // Insert order items
      if (input.items.length > 0) {
        const { error: itemsErr } = await supabase.from('order_items').insert(
          input.items.map(item => ({
            order_id: orderRow.id,
            product_name: item.product_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
          }))
        );
        if (itemsErr) throw itemsErr;
      }

      // Insert initial status history
      await supabase.from('order_status_history').insert({
        order_id: orderRow.id,
        status: input.status ?? 'new',
      });

      await addAuditLog('order', 'إنشاء طلب', `طلب جديد #${input.orderNumber} لـ ${input.name}`);
      await fetchOrders();

      return orders.find(o => o.id === orderRow.id) ?? null;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [fetchOrders, orders]);

  // ── Update order status ───────────────────────────────────────────────────
  const updateOrderStatus = useCallback(async (
    orderId: string,
    newStatus: OrderStatus,
    trackingNumber?: string,
  ): Promise<boolean> => {
    try {
      const currentOrder = orders.find(o => o.id === orderId);
      if (!currentOrder || currentOrder.status === newStatus) return false;

      const updateData: any = { status: newStatus };
      if (trackingNumber) updateData.tracking_number = trackingNumber;

      const { error: updateErr } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (updateErr) throw updateErr;

      // Append status history
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('order_status_history').insert({
        order_id: orderId,
        status: newStatus,
        changed_by: user?.id ?? null,
      });

      await addAuditLog(
        'order',
        'تحديث حالة',
        `تغيير حالة الطلب #${currentOrder.orderNumber} من ${currentOrder.status} إلى ${newStatus}`,
      );

      // Optimistic update
      setOrders(prev => prev.map(o => {
        if (o.id !== orderId) return o;
        const timestamp = new Date().toISOString();
        return {
          ...o,
          status: newStatus,
          trackingNumber: trackingNumber ?? o.trackingNumber,
          statusHistory: [...o.statusHistory, { status: newStatus, timestamp }],
        };
      }));

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [orders]);

  // ── Update order notes ────────────────────────────────────────────────────
  const updateOrderNotes = useCallback(async (orderId: string, notes: string): Promise<boolean> => {
    try {
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ notes })
        .eq('id', orderId);

      if (updateErr) throw updateErr;

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, notes } : o));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, []);

  // ── Delete order ─────────────────────────────────────────────────────────
  const deleteOrder = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      const order = orders.find(o => o.id === orderId);
      const { error: delErr } = await supabase.from('orders').delete().eq('id', orderId);
      if (delErr) throw delErr;

      await addAuditLog('order', 'حذف طلب', `حذف الطلب #${order?.orderNumber}`);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [orders]);

  // ── Real-time subscription ────────────────────────────────────────────────
  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    updateOrderNotes,
    deleteOrder,
  };
}
