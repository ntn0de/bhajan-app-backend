import { supabase } from '@/config/supabase';
import { Article, ArticleTranslation } from '@/types';
import { PAGINATION } from '@/constants';

type ArticleWithTranslations = Article & {
  translations?: ArticleTranslation[];
  languages?: { id: string; code: string; name: string }[];
};

export const ArticleService = {
  async getAll(page = 1) {
    const { data, error, count } = await supabase
      .from('articles')
      .select(`
        *,
        translations:article_translations(language_id, title, description),
        languages:article_translations(languages(*))
      `, { count: 'exact' })
      .range(
        (page - 1) * PAGINATION.DEFAULT_PAGE_SIZE,
        page * PAGINATION.DEFAULT_PAGE_SIZE - 1
      );

    if (error) throw error;
    return { data: data as ArticleWithTranslations[], count };
  },

  async getBySlug(slug: string): Promise<ArticleWithTranslations> {
    const { data, error } = await supabase
      .from('articles')
      .select(`
        *,
        translations:article_translations(language_id, title, description),
        languages:article_translations(languages(*))
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  async create(article: Omit<Article, 'id' | 'created_at'> & { translations?: Omit<ArticleTranslation, 'id' | 'article_id' | 'created_at' | 'updated_at'>[] }) {
    const { translations, ...articleData } = article;
    
    const { data: newArticle, error: articleError } = await supabase
      .from('articles')
      .insert([articleData])
      .select()
      .single();

    if (articleError) throw articleError;

    if (translations?.length) {
      const translationData = translations.map(translation => ({
        article_id: newArticle.id,
        language_id: translation.language_id,
        title: translation.title,
        description: translation.description
      }));

      const { error: translationError } = await supabase
        .from('article_translations')
        .insert(translationData);

      if (translationError) throw translationError;
    }

    return newArticle;
  },

  async update(id: string, article: Partial<Article> & { translations?: Omit<ArticleTranslation, 'id' | 'article_id' | 'created_at' | 'updated_at'>[] }) {
    const { translations, ...articleData } = article;
    
    const { data: updatedArticle, error: articleError } = await supabase
      .from('articles')
      .update(articleData)
      .eq('id', id)
      .select()
      .single();

    if (articleError) throw articleError;

    if (translations?.length) {
      await supabase
        .from('article_translations')
        .delete()
        .eq('article_id', id);

      const translationData = translations.map(translation => ({
        article_id: id,
        language_id: translation.language_id,
        title: translation.title,
        description: translation.description
      }));

      const { error: translationError } = await supabase
        .from('article_translations')
        .insert(translationData);

      if (translationError) throw translationError;
    }

    return updatedArticle;
  },

  async delete(id: string) {
    await supabase
      .from('article_translations')
      .delete()
      .eq('article_id', id);

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};