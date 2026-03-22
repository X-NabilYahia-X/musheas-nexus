export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus = 'new' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type OrderType = 'standard' | 'sample';
export type UserRole = 'admin' | 'delivery';
export type AuditType = 'product' | 'order' | 'system' | 'sample';
export type ShippingProviderType = 'api' | 'token';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          full_name?: string;
          role?: UserRole;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          price: number;
          badge: string | null;
          description: string | null;
          stock: number;
          active: boolean;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          price: number;
          badge?: string | null;
          description?: string | null;
          stock?: number;
          active?: boolean;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          price?: number;
          badge?: string | null;
          description?: string | null;
          stock?: number;
          active?: boolean;
          category?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          name: string;
          phone: string;
          wilaya: string;
          total: number;
          status: OrderStatus;
          order_type: OrderType;
          notes: string | null;
          tracking_number: string | null;
          shipping_provider: string | null;
          company_name: string | null;
          job_title: string | null;
          industry: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          name: string;
          phone: string;
          wilaya: string;
          total: number;
          status?: OrderStatus;
          order_type?: OrderType;
          notes?: string | null;
          tracking_number?: string | null;
          shipping_provider?: string | null;
          company_name?: string | null;
          job_title?: string | null;
          industry?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          phone?: string;
          wilaya?: string;
          total?: number;
          status?: OrderStatus;
          order_type?: OrderType;
          notes?: string | null;
          tracking_number?: string | null;
          shipping_provider?: string | null;
          company_name?: string | null;
          job_title?: string | null;
          industry?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_name: string;
          quantity: number;
          unit_price: number;
          created_at?: string;
        };
        Update: {
          quantity?: number;
          unit_price?: number;
        };
      };
      order_status_history: {
        Row: {
          id: string;
          order_id: string;
          status: OrderStatus;
          changed_by: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          status: OrderStatus;
          changed_by?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: never;
      };
      shipping_providers: {
        Row: {
          id: string;
          slug: string;
          name: string;
          type: ShippingProviderType;
          api_key: string | null;
          api_id: string | null;
          token: string | null;
          is_active: boolean;
          logo_color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          type?: ShippingProviderType;
          api_key?: string | null;
          api_id?: string | null;
          token?: string | null;
          is_active?: boolean;
          logo_color?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          type?: ShippingProviderType;
          api_key?: string | null;
          api_id?: string | null;
          token?: string | null;
          is_active?: boolean;
          logo_color?: string | null;
          updated_at?: string;
        };
      };
      app_settings: {
        Row: {
          id: string;
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
          active_provider_id: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          contact_name?: string;
          phone?: string;
          email?: string;
          role?: string;
          shipping_fee?: number;
          shipping_delay?: string;
          min_order?: number;
          hero_slogan?: string;
          hero_kicker?: string;
          hero_lead?: string;
          hero_note?: string;
          notif_sound?: boolean;
          notif_whatsapp?: boolean;
          notif_report?: boolean;
          active_provider_id?: string | null;
          updated_at?: string;
        };
        Update: {
          contact_name?: string;
          phone?: string;
          email?: string;
          role?: string;
          shipping_fee?: number;
          shipping_delay?: string;
          min_order?: number;
          hero_slogan?: string;
          hero_kicker?: string;
          hero_lead?: string;
          hero_note?: string;
          notif_sound?: boolean;
          notif_whatsapp?: boolean;
          notif_report?: boolean;
          active_provider_id?: string | null;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_id: string | null;
          user_name: string;
          action: string;
          details: string;
          type: AuditType;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          user_name?: string;
          action: string;
          details?: string;
          type: AuditType;
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: {
      order_analytics: {
        Row: {
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
        };
      };
      product_sales: {
        Row: {
          product_name: string;
          total_quantity_sold: number;
          total_revenue: number;
          order_count: number;
        };
      };
      revenue_by_wilaya: {
        Row: {
          wilaya: string;
          order_count: number;
          total_revenue: number;
        };
      };
    };
    Enums: {
      order_status: OrderStatus;
      order_type: OrderType;
      user_role: UserRole;
      audit_type: AuditType;
      shipping_provider_type: ShippingProviderType;
    };
  };
}
