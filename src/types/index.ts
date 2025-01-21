// src/types/index.ts

// Represents a category in our application
export interface Category {
  id: string; // Unique identifier
  name: string; // Display name of the category
  slug: string; // URL-friendly version of the name
  image_url: string; // URL to the category's image
  created_at: string; // Timestamp of creation
  subcategories: Subcategory[]; // Subcategories associated with the category
}

// Represents a subcategory that belongs to a category
export interface Subcategory {
  id: string; // Unique identifier
  category_id: string; // Reference to parent category
  name: string; // Display name of the subcategory
  slug: string; // URL-friendly version of the name
  created_at: string; // Timestamp of creation
}

// Represents the structure of an article
export interface Article {
  id: string; // Unique identifier
  title: string; // Article title
  slug: string; // URL-friendly version of the title
  author_id: string; // Reference to the author (from auth.users)
  category_id: string; // Reference to the category
  subcategory_id?: string; // Optional reference to subcategory
  description: string; // Rich text content (could be more specifically typed based on your editor)
  featured_image?: string; // Optional URL to featured image
  audio_url?: string; // Optional URL to audio content
  youtube_url?: string; // Optional URL to YouTube video
  external_video_url?: string; // Optional URL to external video
  is_featured: boolean; // Whether the article is featured
  created_at: string; // Timestamp of creation
}

// Represents a user in our application
export interface User {
  id: string; // Unique identifier
  email: string; // User's email address
  full_name: string; // User's full name
  avatar_url?: string; // Optional URL to user's avatar
  role: "admin" | "author" | "user"; // User's role in the system
}

// Custom types for when we need related data
export interface CategoryWithSubcategories extends Category {
  subcategories: Subcategory[];
}

export interface ArticleWithRelations extends Article {
  category: Category;
  subcategory?: Subcategory;
  author: User;
}
