import { ProductCategory } from '../types';

export interface DbUser {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role: 'admin' | 'staff' | 'customer';
  created_at?: string;
  updated_at?: string;
}

export interface DbProduct {
  id: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  image: string;
  badge?: string | null;
  rating?: number;
  review_count?: number;
  customizable?: boolean;
  available?: boolean;
  options?: any;
  created_at?: string;
  updated_at?: string;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  display_order: number;
  created_at?: string;
}

export interface DbSiteConfig {
  id: string;
  phone_display: string;
  phone_raw: string;
  profile_image: string;
  profile_bio_1: string;
  profile_bio_2: string;
  profile_bio_3: string;
  founder_name: string;
  founder_title: string;
  logo_url: string;
  logo_slogan: string;
  favicon_url?: string | null;
  updated_at?: string;
}

export interface DbBanner {
  id: string;
  title: string;
  subtitle?: string | null;
  image_url: string;
  link?: string | null;
  active: boolean;
  display_order: number;
  created_at?: string;
}

export interface DbContact {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  message: string;
  status: 'pendente' | 'respondido' | 'arquivado';
  created_at?: string;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: DbUser;
        Insert: Partial<DbUser>;
        Update: Partial<DbUser>;
        Relationships: [];
      };
      produtos: {
        Row: DbProduct;
        Insert: Partial<DbProduct>;
        Update: Partial<DbProduct>;
        Relationships: [];
      };
      categorias: {
        Row: DbCategory;
        Insert: Partial<DbCategory>;
        Update: Partial<DbCategory>;
        Relationships: [];
      };
      configuracoes: {
        Row: DbSiteConfig;
        Insert: Partial<DbSiteConfig>;
        Update: Partial<DbSiteConfig>;
        Relationships: [];
      };
      banners: {
        Row: DbBanner;
        Insert: Partial<DbBanner>;
        Update: Partial<DbBanner>;
        Relationships: [];
      };
      contatos: {
        Row: DbContact;
        Insert: Partial<DbContact>;
        Update: Partial<DbContact>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
