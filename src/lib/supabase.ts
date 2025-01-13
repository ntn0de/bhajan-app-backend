import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// src/types/index.ts
export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  created_at: string;
}

export interface Subcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  author_id: string;
  category_id: string;
  subcategory_id?: string;
  description: any; // Rich text editor content
  audio_url?: string;
  youtube_url?: string;
  external_video_url?: string;
  is_featured: boolean;
  created_at: string;
}
