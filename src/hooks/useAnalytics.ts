/**
 * useAnalytics — Supabase analytics views hook
 * Powers the Overview and Analytics dashboard pages.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface OrderAnalytics {
  total_orders: number;
  new_orders: number;
  confirmed_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  avg_order_value: number;
  sample_orders: number;
  orders_last_30_days: number;
}

export interface ProductSale {
  product_name: string;
  total_quantity_sold: number;
  total_revenue: number;
  order_count: number;
}

export interface WilayaRevenue {
  wilaya: string;
  order_count: number;
  total_revenue: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  order_count: number;
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<OrderAnalytics | null>(null);
  const [productSales, setProductSales] = useState<ProductSale[]>([]);
  const [wilayaRevenue, setWilayaRevenue] = useState<WilayaRevenue[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all views in parallel
      const [analyticsRes, productSalesRes, wilayaRes, dailyRes] = await Promise.all([
        supabase.from('order_analytics').select('*').single(),
        supabase.from('product_sales').select('*').limit(10),
        supabase.from('revenue_by_wilaya').select('*').limit(10),
        // Daily revenue for the last 7 days via raw SQL
        supabase.rpc('get_daily_revenue', { days_back: 7 }).maybeSingle(),
      ]);

      if (analyticsRes.data) setAnalytics(analyticsRes.data as OrderAnalytics);
      if (productSalesRes.data) setProductSales(productSalesRes.data as ProductSale[]);
      if (wilayaRes.data) setWilayaRevenue(wilayaRes.data as WilayaRevenue[]);

      // Fallback: compute daily revenue client-side from orders if RPC not available
      if (!dailyRes.data) {
        const { data: recentOrders } = await supabase
          .from('orders')
          .select('created_at, total, status')
          .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())
          .order('created_at', { ascending: true });

        if (recentOrders) {
          const byDay: Record<string, DailyRevenue> = {};
          recentOrders.forEach(order => {
            const date = order.created_at.slice(0, 10);
            if (!byDay[date]) byDay[date] = { date, revenue: 0, order_count: 0 };
            byDay[date].order_count++;
            if (order.status === 'delivered') byDay[date].revenue += order.total;
          });
          setDailyRevenue(Object.values(byDay));
        }
      }
    } catch (err: any) {
      setError(err.message ?? 'خطأ في تحميل الإحصائيات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  return { analytics, productSales, wilayaRevenue, dailyRevenue, loading, error, fetchAnalytics };
}
