export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          phone: string | null;
          tier: string | null;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          tier?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          tier?: string | null;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          external_id: string;
          client_id: string | null;
          status: string;
          carrier: string | null;
          priority: string | null;
          total_items: number | null;
          customer_name: string | null;
          customer_email: string | null;
          customer_phone: string | null;
          customer_company: string | null;
          total_amount: number | null;
          currency: string | null;
          payment_status: string | null;
          sales_channel: string | null;
          tracking_number: string | null;
          shipping_address: string | null;
          billing_address: string | null;
          notes: string | null;
          warehouse_slot: string | null;
          promise_date: string | null;
          shipped_at: string | null;
          status_history: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          external_id: string;
          client_id?: string | null;
          status?: string;
          carrier?: string | null;
          priority?: string | null;
          total_items?: number | null;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          customer_company?: string | null;
          total_amount?: number | null;
          currency?: string | null;
          payment_status?: string | null;
          sales_channel?: string | null;
          tracking_number?: string | null;
          shipping_address?: string | null;
          billing_address?: string | null;
          notes?: string | null;
          warehouse_slot?: string | null;
          promise_date?: string | null;
          shipped_at?: string | null;
          status_history?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          external_id?: string;
          client_id?: string | null;
          status?: string;
          carrier?: string | null;
          priority?: string | null;
          total_items?: number | null;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string | null;
          customer_company?: string | null;
          total_amount?: number | null;
          currency?: string | null;
          payment_status?: string | null;
          sales_channel?: string | null;
          tracking_number?: string | null;
          shipping_address?: string | null;
          billing_address?: string | null;
          notes?: string | null;
          warehouse_slot?: string | null;
          promise_date?: string | null;
          shipped_at?: string | null;
          status_history?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'clients';
            referencedColumns: ['id'];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          sku: string;
          name: string;
          barcode: string | null;
          description: string | null;
          client_id: string | null;
          category: string | null;
          weight: number | null;
          width: number | null;
          height: number | null;
          length: number | null;
          minimum_stock: number | null;
          current_stock: number | null;
          unit: string | null;
          price: number | null;
          currency: string | null;
          active: boolean | null;
          warehouse_positions: Json | null;
          batches: Json | null;
          expiration_dates: Json | null;
          images: Json | null;
          attachments: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sku: string;
          name: string;
          barcode?: string | null;
          description?: string | null;
          client_id?: string | null;
          category?: string | null;
          weight?: number | null;
          width?: number | null;
          height?: number | null;
          length?: number | null;
          minimum_stock?: number | null;
          current_stock?: number | null;
          unit?: string | null;
          price?: number | null;
          currency?: string | null;
          active?: boolean | null;
          warehouse_positions?: Json | null;
          batches?: Json | null;
          expiration_dates?: Json | null;
          images?: Json | null;
          attachments?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          sku?: string;
          name?: string;
          barcode?: string | null;
          description?: string | null;
          client_id?: string | null;
          category?: string | null;
          weight?: number | null;
          width?: number | null;
          height?: number | null;
          length?: number | null;
          minimum_stock?: number | null;
          current_stock?: number | null;
          unit?: string | null;
          price?: number | null;
          currency?: string | null;
          active?: boolean | null;
          warehouse_positions?: Json | null;
          batches?: Json | null;
          expiration_dates?: Json | null;
          images?: Json | null;
          attachments?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'products_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'clients';
            referencedColumns: ['id'];
          },
        ];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          quantity: number;
          unit_price: number | null;
          sku: string | null;
          name: string | null;
          warehouse_location: string | null;
          in_stock: boolean | null;
          picked_quantity: number | null;
          packed: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          quantity?: number;
          unit_price?: number | null;
          sku?: string | null;
          name?: string | null;
          warehouse_location?: string | null;
          in_stock?: boolean | null;
          picked_quantity?: number | null;
          packed?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          quantity?: number;
          unit_price?: number | null;
          sku?: string | null;
          name?: string | null;
          warehouse_location?: string | null;
          in_stock?: boolean | null;
          picked_quantity?: number | null;
          packed?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey';
            columns: ['order_id'];
            isOneToOne: false;
            referencedRelation: 'orders';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'order_items_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      inventory: {
        Row: {
          id: string;
          product_id: string;
          quantity: number;
          location: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          quantity?: number;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          quantity?: number;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'inventory_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
      inventory_movements: {
        Row: {
          id: string;
          request_id: string;
          inventory_id: string | null;
          product_id: string | null;
          sku: string;
          location: string;
          delta: number;
          quantity_before: number;
          quantity_after: number;
          reason: string;
          actor_label: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          inventory_id?: string | null;
          product_id?: string | null;
          sku: string;
          location: string;
          delta: number;
          quantity_before: number;
          quantity_after: number;
          reason: string;
          actor_label?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          inventory_id?: string | null;
          product_id?: string | null;
          sku?: string;
          location?: string;
          delta?: number;
          quantity_before?: number;
          quantity_after?: number;
          reason?: string;
          actor_label?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'inventory_movements_inventory_id_fkey';
            columns: ['inventory_id'];
            isOneToOne: false;
            referencedRelation: 'inventory';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'inventory_movements_product_id_fkey';
            columns: ['product_id'];
            isOneToOne: false;
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      adjust_inventory: {
        Args: {
          p_inventory_id: string;
          p_delta: number;
          p_reason: string;
          p_request_id: string;
          p_actor_label?: string | null;
        };
        Returns: {
          movement_id: string;
          inventory_id: string;
          product_id: string | null;
          sku: string;
          location: string;
          delta: number;
          quantity_before: number;
          quantity_after: number;
          reason: string;
          actor_label: string | null;
          created_at: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
