
import { slugify } from 'transliteration';
import { Article } from '@/types';
import { supabase } from '@/lib/supabase';

const handleError = (message: string, error: any) => {
  console.error(`${message}:`, error);
};

export const fetchArticles = async () => {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select(`
        *,
        category:categories(id, name),
        subcategory:subcategories(id, name),
        translations:article_translations(language_id, title, description)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError("Error fetching articles", error);
    return [];
  }
};

export const addArticle = async (article: Omit<Article, 'id' | 'created_at'>) => {
  try {
    const { translations, ...articleData } = article;
    
    // First insert the article
    const { data: newArticle, error: articleError } = await supabase
      .from("articles")
      .insert([{
        ...articleData,
        slug: slugify(article.title),
      }])
      .select()
      .single();

    if (articleError) throw articleError;

    // Then insert translations if any
    if (translations && translations.length > 0) {
      const translationData = translations.map((translation) => ({
        article_id: newArticle.id,
        language_id: translation.language_id,
        title: translation.title,
        description: translation.description,
      }));

      const { error: translationError } = await supabase
        .from("article_translations")
        .insert(translationData);

      if (translationError) throw translationError;
    }

    return newArticle;
  } catch (error) {
    handleError("Error adding article", error);
    return null;
  }
};

export const updateArticle = async (id: string, article: Partial<Article>) => {
  try {
    const { translations, ...articleData } = article;
    
    // Update the article
    const { error: articleError } = await supabase
      .from("articles")
      .update({
        ...articleData,
        slug: article.title ? slugify(article.title) : undefined,
      })
      .eq("id", id);

    if (articleError) throw articleError;

    // Update translations if provided
    if (translations && translations.length > 0) {
      // Delete existing translations
      await supabase
        .from("article_translations")
        .delete()
        .eq("article_id", id);

      // Insert new translations
      const translationData = translations.map((translation) => ({
        article_id: id,
        language_id: translation.language_id,
        title: translation.title,
        description: translation.description,
      }));

      const { error: translationError } = await supabase
        .from("article_translations")
        .insert(translationData);

      if (translationError) throw translationError;
    }

    return true;
  } catch (error) {
    handleError("Error updating article", error);
    return false;
  }
};

export const deleteArticle = async (id: string) => {
  try {
    // Delete translations first
    await supabase
      .from("article_translations")
      .delete()
      .eq("article_id", id);

    // Then delete the article
    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  } catch (error) {
    handleError("Error deleting article", error);
    return false;
  }
};