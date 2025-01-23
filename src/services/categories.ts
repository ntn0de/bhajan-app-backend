import { supabase } from '@/config/supabase';
import { Category, CategoryTranslation } from '@/types';
import { PAGINATION } from '@/constants';

type CategoryWithTranslations = Category & {
  translations?: CategoryTranslation[];
};

export const CategoryService = {
  async getAll(page = 1): Promise<{ data: CategoryWithTranslations[]; count: number | null }> {
    const { data, error, count } = await supabase
      .from('categories')
      .select(`
        *,
        translations:category_translations(language_id, name),
        subcategories(*)
      `, { count: 'exact' })
      .range(
        (page - 1) * PAGINATION.DEFAULT_PAGE_SIZE,
        page * PAGINATION.DEFAULT_PAGE_SIZE - 1
      );

    if (error) throw error;
    return { data: data as CategoryWithTranslations[], count };
  },

  async getBySlug(slug: string): Promise<CategoryWithTranslations> {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        *,
        translations:category_translations(language_id, name),
        subcategories(*, translations:category_translations(language_id, name))
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  async create(category: Omit<Category, 'id' | 'created_at'> & { translations?: Omit<CategoryTranslation, 'id' | 'category_id' | 'created_at' | 'updated_at'>[] }) {
    const { translations, ...categoryData } = category;
    
    const { data: newCategory, error: categoryError } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();

    if (categoryError) throw categoryError;

    if (translations?.length) {
      const translationData = translations.map(translation => ({
        category_id: newCategory.id,
        language_id: translation.language_id,
        name: translation.name
      }));

      const { error: translationError } = await supabase
        .from('category_translations')
        .insert(translationData);

      if (translationError) throw translationError;
    }

    return newCategory;
  },

  async update(id: string, category: Partial<Category> & { translations?: Omit<CategoryTranslation, 'id' | 'category_id' | 'created_at' | 'updated_at'>[] }) {
    const { translations, ...categoryData } = category;
    
    const { data: updatedCategory, error: categoryError } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single();

    if (categoryError) throw categoryError;

    if (translations?.length) {
      await supabase
        .from('category_translations')
        .delete()
        .eq('category_id', id);

      const translationData = translations.map(translation => ({
        category_id: id,
        language_id: translation.language_id,
        name: translation.name
      }));

      const { error: translationError } = await supabase
        .from('category_translations')
        .insert(translationData);

      if (translationError) throw translationError;
    }

    return updatedCategory;
  },

  async delete(id: string) {
    await supabase
      .from('category_translations')
      .delete()
      .eq('category_id', id);

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};