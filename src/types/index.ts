
export type OrderStatus = 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type OrderType = 'standard' | 'sample';
export type UserRole = 'admin' | 'delivery';

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
}

export interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  name: string;
  phone: string;
  wilaya: string;
  total: number;
  status: OrderStatus;
  orderType: OrderType;
  notes: string;
  items: OrderItem[];
  createdAt: string;
  statusHistory: StatusHistoryItem[];
  trackingNumber?: string;
  shippingProvider?: string;
  companyName?: string;
  jobTitle?: string;
  industry?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  badge: string;
  description: string;
  stock: number;
  active: boolean;
  category: string;
}

export interface ShippingProvider {
  id: string;
  name: string;
  type: 'api' | 'token';
  apiKey?: string;
  apiId?: string;
  isActive: boolean;
  logoColor: string;
}

export interface AppSettings {
  contact_name: string;
  phone: string;
  email: string;
  role: string;
  shipping_fee: number;
  shipping_delay: string;
  min_order: number;
  hero_slogan: string;
  hero_kicker: string;
  hero_lead: string;
  hero_note: string;
  notif_sound: boolean;
  notif_whatsapp: boolean;
  notif_report: boolean;
  activeProviderId?: string;
}

export interface UserSession {
  username: string;
  role: UserRole;
  fullName: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  action: string;
  details: string;
  type: 'product' | 'order' | 'system' | 'sample';
}
