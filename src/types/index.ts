// src/types/index.ts

// Represents a supported language in the system
export interface Language {
  id: string; // Unique identifier
  code: string; // Language code (e.g., 'en', 'hi')
  name: string; // Display name (e.g., 'English', 'Hindi')
  is_default: boolean; // Whether this is the default language
  is_active: boolean; // Whether this language is currently active
  created_at: string; // Timestamp of creation
}

// Represents translations for categories and subcategories
export interface CategoryTranslation {
  id: string; // Unique identifier
  category_id?: string; // Reference to the category (optional if subcategory_id is present)
  subcategory_id?: string; // Reference to the subcategory (optional if category_id is present)
  language_id: string; // Reference to the language
  name: string; // Translated name
  created_at: string; // Timestamp of creation
  updated_at: string; // Timestamp of last update
}

// Represents translations for articles
export interface ArticleTranslation {
  id: string; // Unique identifier
  article_id: string; // Reference to the article
  language_id: string; // Reference to the language
  title: string; // Translated title
  description: string; // Translated content
  created_at: string; // Timestamp of creation
  updated_at: string; // Timestamp of last update
}

// Represents a category in our application
export interface Category {
  id: string; // Unique identifier
  name: string; // Default language name of the category
  slug: string; // URL-friendly version of the name
  image_url: string; // URL to the category's image
  created_at: string; // Timestamp of creation
  translations?: CategoryTranslation[]; // Translations for this category
  subcategories: Subcategory[]; // Subcategories associated with the category
  articles: Article[]; // Articles associated with the category
}

// Represents a subcategory that belongs to a category
export interface Subcategory {
  id: string; // Unique identifier
  category_id: string; // Reference to parent category
  name: string; // Display name of the subcategory
  slug: string; // URL-friendly version of the name
  created_at: string; // Timestamp of creation
  articles: Article[]; // Articles associated with the subcategory
  translations?: CategoryTranslation[]; // Translations for this subcategory
}

// Represents the structure of an article
export interface Article {
  id: string; // Unique identifier
  title: string; // Default language title
  slug: string; // URL-friendly version of the title
  author_id: string; // Reference to the author (from auth.users)
  category_id: string; // Reference to the category
  subcategory_id?: string; // Optional reference to subcategory
  description: string; // Default language content
  featured_image?: string; // Optional URL to featured image
  audio_url?: string; // Optional URL to audio content
  youtube_url?: string; // Optional URL to YouTube video
  external_video_url?: string; // Optional URL to external video
  is_featured: boolean; // Whether the article is featured
  created_at: string; // Timestamp of creation
  translations?: ArticleTranslation[]; // Translations for this article
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
  translations?: ArticleTranslation[];
}

// Type for localized content
export interface LocalizedContent<T> {
  default: T;
  translations: Record<string, T>;
}
