export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      bible_books: { Row: { id: number; name: string; slug: string; testament: "old" | "new"; canonical_order: number; chapter_count: number; created_at: string }; Insert: Omit<Database["public"]["Tables"]["bible_books"]["Row"], "created_at"> & { created_at?: string }; Update: Partial<Database["public"]["Tables"]["bible_books"]["Insert"]> };
      bible_chapters: { Row: { book_id: number; chapter_number: number; verse_count: number }; Insert: Database["public"]["Tables"]["bible_chapters"]["Row"]; Update: Partial<Database["public"]["Tables"]["bible_chapters"]["Insert"]> };
      bible_passages: { Row: { passage_key: string; book_id: number; chapter_start: number; verse_start: number | null; chapter_end: number; verse_end: number | null; whole_chapter: boolean; created_at: string }; Insert: Omit<Database["public"]["Tables"]["bible_passages"]["Row"], "created_at"> & { created_at?: string }; Update: Partial<Database["public"]["Tables"]["bible_passages"]["Insert"]> };
      admin_users: { Row: { user_id: string; role: "owner" | "admin"; is_active: boolean; created_at: string }; Insert: Omit<Database["public"]["Tables"]["admin_users"]["Row"], "created_at"> & { created_at?: string }; Update: Partial<Database["public"]["Tables"]["admin_users"]["Insert"]> };
      scripture_works: { Row: { id: string; passage_key: string; title: string; description: string | null; cover_path: string | null; media_path: string; media_type: "video" | "image" | "gif"; status: "draft" | "published"; featured: boolean; internal_production_ref: string | null; published_at: string | null; created_at: string; updated_at: string }; Insert: Omit<Database["public"]["Tables"]["scripture_works"]["Row"], "id" | "created_at" | "updated_at" | "status" | "featured" | "description" | "cover_path" | "internal_production_ref" | "published_at"> & { id?: string; created_at?: string; updated_at?: string; status?: "draft" | "published"; featured?: boolean; description?: string | null; cover_path?: string | null; internal_production_ref?: string | null; published_at?: string | null }; Update: Partial<Database["public"]["Tables"]["scripture_works"]["Insert"]> };
      scripture_wallpapers: { Row: { id: string; work_id: string; label: string; width_px: number; height_px: number; storage_path: string; file_name: string | null; status: "draft" | "published"; published_at: string | null; sort_order: number; created_at: string; updated_at: string }; Insert: Omit<Database["public"]["Tables"]["scripture_wallpapers"]["Row"], "id" | "created_at" | "updated_at" | "file_name" | "status" | "published_at" | "sort_order"> & { id?: string; created_at?: string; updated_at?: string; file_name?: string | null; status?: "draft" | "published"; published_at?: string | null; sort_order?: number }; Update: Partial<Database["public"]["Tables"]["scripture_wallpapers"]["Insert"]> };
      films: { Row: { id: string; passage_key: string; slug: string; title: string; description: string | null; cover_path: string | null; film_path: string; status: "draft" | "published"; featured: boolean; internal_production_ref: string | null; duration_seconds: number | null; published_at: string | null; created_at: string; updated_at: string }; Insert: Omit<Database["public"]["Tables"]["films"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string }; Update: Partial<Database["public"]["Tables"]["films"]["Insert"]> };
    };
    Views: Record<string, never>;
    Functions: {
      /** Derives and stores the canonical passage key for an admin-chosen range. */
      ensure_bible_passage: {
        Args: {
          p_book_slug: string;
          p_chapter_start: number;
          p_verse_start: number | null;
          p_chapter_end: number;
          p_verse_end: number | null;
          p_whole_chapter?: boolean;
        };
        Returns: string;
      };
      /** True when the current authenticated user is an active HOLY8BIT administrator. */
      is_holy8bit_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: { bible_testament: "old" | "new"; work_status: "draft" | "published"; scripture_media_type: "video" | "image" | "gif" };
    CompositeTypes: Record<string, never>;
  };
};
