/**
 * Supabase ↔ App Type Mappers
 * Converts snake_case DB rows to camelCase app types and vice-versa.
 */

import type { Order, OrderItem, Product, ShippingProvider, AppSettings, AuditLogEntry, StatusHistoryItem } from '@/types';
import type { Database } from './database.types';

type DbOrder = Database['public']['Tables']['orders']['Row'];
type DbOrderItem = Database['public']['Tables']['order_items']['Row'];
type DbStatusHistory = Database['public']['Tables']['order_status_history']['Row'];
type DbProduct = Database['public']['Tables']['products']['Row'];
type DbShippingProvider = Database['public']['Tables']['shipping_providers']['Row'];
type DbSettings = Database['public']['Tables']['app_settings']['Row'];
type DbAuditLog = Database['public']['Tables']['audit_logs']['Row'];

// ─── ORDER ────────────────────────────────────────────────────────────────────

export function dbOrderToApp(
  row: DbOrder,
  items: DbOrderItem[] = [],
  history: DbStatusHistory[] = [],
): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    name: row.name,
    phone: row.phone,
    wilaya: row.wilaya,
    total: row.total,
    status: row.status,
    orderType: row.order_type,
    notes: row.notes ?? '',
    trackingNumber: row.tracking_number ?? undefined,
    shippingProvider: row.shipping_provider ?? undefined,
    companyName: row.company_name ?? undefined,
    jobTitle: row.job_title ?? undefined,
    industry: row.industry ?? undefined,
    createdAt: row.created_at,
    items: items.map(dbItemToApp),
    statusHistory: history.map(dbHistoryToApp),
  };
}

export function dbItemToApp(row: DbOrderItem): OrderItem {
  return {
    product_name: row.product_name,
    quantity: row.quantity,
    unit_price: row.unit_price,
  };
}

export function dbHistoryToApp(row: DbStatusHistory): StatusHistoryItem {
  return {
    status: row.status,
    timestamp: row.created_at,
  };
}

export function appOrderToDb(order: Partial<Order>): Database['public']['Tables']['orders']['Insert'] {
  return {
    ...(order.id && { id: order.id }),
    order_number: order.orderNumber!,
    name: order.name!,
    phone: order.phone!,
    wilaya: order.wilaya!,
    total: order.total!,
    status: order.status ?? 'new',
    order_type: order.orderType ?? 'standard',
    notes: order.notes ?? '',
    tracking_number: order.trackingNumber ?? null,
    shipping_provider: order.shippingProvider ?? null,
    company_name: order.companyName ?? null,
    job_title: order.jobTitle ?? null,
    industry: order.industry ?? null,
  };
}

// ─── PRODUCT ──────────────────────────────────────────────────────────────────

export function dbProductToApp(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    badge: row.badge ?? '',
    description: row.description ?? '',
    stock: row.stock,
    active: row.active,
    category: row.category,
  };
}

export function appProductToDb(product: Partial<Product>): Database['public']['Tables']['products']['Insert'] {
  return {
    ...(product.id && { id: product.id }),
    name: product.name!,
    price: product.price!,
    badge: product.badge ?? null,
    description: product.description ?? null,
    stock: product.stock ?? 0,
    active: product.active ?? true,
    category: product.category ?? 'أخرى',
  };
}

// ─── SHIPPING PROVIDER ────────────────────────────────────────────────────────

export function dbProviderToApp(row: DbShippingProvider): ShippingProvider {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    apiKey: row.api_key ?? undefined,
    apiId: row.api_id ?? undefined,
    isActive: row.is_active,
    logoColor: row.logo_color ?? '',
  };
}

// ─── APP SETTINGS ─────────────────────────────────────────────────────────────

export function dbSettingsToApp(row: DbSettings): AppSettings {
  return {
    contact_name: row.contact_name,
    phone: row.phone,
    email: row.email,
    role: row.role,
    shipping_fee: row.shipping_fee,
    shipping_delay: row.shipping_delay,
    min_order: row.min_order,
    hero_slogan: row.hero_slogan,
    hero_kicker: row.hero_kicker,
    hero_lead: row.hero_lead,
    hero_note: row.hero_note,
    notif_sound: row.notif_sound,
    notif_whatsapp: row.notif_whatsapp,
    notif_report: row.notif_report,
    activeProviderId: row.active_provider_id ?? undefined,
  };
}

export function appSettingsToDb(settings: Partial<AppSettings>): Database['public']['Tables']['app_settings']['Update'] {
  return {
    ...(settings.contact_name !== undefined && { contact_name: settings.contact_name }),
    ...(settings.phone !== undefined && { phone: settings.phone }),
    ...(settings.email !== undefined && { email: settings.email }),
    ...(settings.role !== undefined && { role: settings.role }),
    ...(settings.shipping_fee !== undefined && { shipping_fee: settings.shipping_fee }),
    ...(settings.shipping_delay !== undefined && { shipping_delay: settings.shipping_delay }),
    ...(settings.min_order !== undefined && { min_order: settings.min_order }),
    ...(settings.hero_slogan !== undefined && { hero_slogan: settings.hero_slogan }),
    ...(settings.hero_kicker !== undefined && { hero_kicker: settings.hero_kicker }),
    ...(settings.hero_lead !== undefined && { hero_lead: settings.hero_lead }),
    ...(settings.hero_note !== undefined && { hero_note: settings.hero_note }),
    ...(settings.notif_sound !== undefined && { notif_sound: settings.notif_sound }),
    ...(settings.notif_whatsapp !== undefined && { notif_whatsapp: settings.notif_whatsapp }),
    ...(settings.notif_report !== undefined && { notif_report: settings.notif_report }),
    ...(settings.activeProviderId !== undefined && { active_provider_id: settings.activeProviderId }),
  };
}

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────

export function dbAuditToApp(row: DbAuditLog): AuditLogEntry {
  return {
    id: row.id,
    timestamp: row.created_at,
    userName: row.user_name,
    action: row.action,
    details: row.details,
    type: row.type,
  };
}
