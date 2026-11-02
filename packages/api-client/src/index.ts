// @the-static/api-client
//
// Thin, typed wrapper around the Supabase client.
// The Supabase publishable (anon) key may live in the client.
// The service-role / secret key MUST never be bundled into mobile or browser code.

import { createClient, SupabaseClient } from "@supabase/supabase-js";

export interface TheStaticDatabase {
  // Tables are declared here so the client is typed against the real schema.
  // See supabase/migrations for the source of truth.
  public: {
    Tables: {
      members: {
        Row: { id: string; static_id: string; username: string; status: string; role: string; created_at: string; updated_at: string };
        Insert: { id?: string; static_id: string; username: string; status?: string; role?: string; created_at?: string; updated_at?: string };
        Update: { id?: string; static_id?: string; username?: string; status?: string; role?: string; created_at?: string; updated_at?: string };
      };
      member_profiles: {
        Row: { member_id: string; display_name: string | null; bio: string | null; interests: string[]; location: string | null; music_status: string | null; profile_photo_url: string | null; visibility: string; updated_at: string };
        Insert: { member_id?: string; display_name?: string | null; bio?: string | null; interests?: string[]; location?: string | null; music_status?: string | null; profile_photo_url?: string | null; visibility?: string; updated_at?: string };
        Update: { member_id?: string; display_name?: string | null; bio?: string | null; interests?: string[]; location?: string | null; music_status?: string | null; profile_photo_url?: string | null; visibility?: string; updated_at?: string };
      };
      member_devices: {
        Row: { id: string; member_id: string; name: string | null; platform: string; status: string; last_seen_at: string | null; created_at: string };
        Insert: { id?: string; member_id: string; name?: string | null; platform: string; status?: string; last_seen_at?: string | null; created_at?: string };
        Update: { id?: string; member_id?: string; name?: string | null; platform?: string; status?: string; last_seen_at?: string | null; created_at?: string };
      };
      follows: {
        Row: { follower_id: string; following_id: string; created_at: string };
        Insert: { follower_id: string; following_id: string; created_at?: string };
        Update: { follower_id?: string; following_id?: string; created_at?: string };
      };
      blocks: {
        Row: { blocker_id: string; blocked_id: string };
        Insert: { blocker_id: string; blocked_id: string };
        Update: { blocker_id?: string; blocked_id?: string };
      };
      posts: {
        Row: { id: string; author_id: string; audience: string; encryption_version: number; encrypted_content: string; encrypted_media_reference: string | null; audience_reference: string | null; created_at: string; updated_at: string; deleted_at: string | null };
        Insert: { id?: string; author_id: string; audience: string; encryption_version: number; encrypted_content: string; encrypted_media_reference?: string | null; audience_reference?: string | null; created_at?: string; updated_at?: string; deleted_at?: string | null };
        Update: { id?: string; author_id?: string; audience?: string; encryption_version?: number; encrypted_content?: string; encrypted_media_reference?: string | null; audience_reference?: string | null; created_at?: string; updated_at?: string; deleted_at?: string | null };
      };
      stories: {
        Row: { id: string; author_id: string; audience: string; encryption_version: number; encrypted_content: string; encrypted_media_reference: string | null; expires_at: string; created_at: string; deleted_at: string | null };
        Insert: { id?: string; author_id: string; audience: string; encryption_version: number; encrypted_content: string; encrypted_media_reference?: string | null; expires_at: string; created_at?: string; deleted_at?: string | null };
        Update: { id?: string; author_id?: string; audience?: string; encryption_version?: number; encrypted_content?: string; encrypted_media_reference?: string | null; expires_at?: string; created_at?: string; deleted_at?: string | null };
      };
      encrypted_messages: {
        Row: { id: string; conversation_id: string; sender_device_id: string; ciphertext: string; protocol_version: number; created_at: string; deleted_at: string | null };
        Insert: { id?: string; conversation_id: string; sender_device_id: string; ciphertext: string; protocol_version?: number; created_at?: string; deleted_at?: string | null };
        Update: { id?: string; conversation_id?: string; sender_device_id?: string; ciphertext?: string; protocol_version?: number; created_at?: string; deleted_at?: string | null };
      };
      marketplace_listings: {
        Row: { id: string; seller_id: string; category: string; status: string; created_at: string; updated_at: string };
        Insert: { id?: string; seller_id: string; category: string; status?: string; created_at?: string; updated_at?: string };
        Update: { id?: string; seller_id?: string; category?: string; status?: string; created_at?: string; updated_at?: string };
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

export type TheStaticSupabaseClient = SupabaseClient<TheStaticDatabase>;

export function createTheStaticClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
): TheStaticSupabaseClient {
  return createClient<TheStaticDatabase>(supabaseUrl, supabaseAnonKey);
}

export type Database = TheStaticDatabase;
