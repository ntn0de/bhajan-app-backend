import { supabase } from '@/lib/supabase';
import { slugify } from 'transliteration';
import { Category, Language } from '@/types';

const handleError = (message: string, error: any) => {
  console.error(`${message}:`, error);
};

export const uploadCategoryImage = async (file: File, categoryName: string) => {
  const categoryNameSlug = slugify(categoryName);
  const fileName = `${Date.now()}_${categoryNameSlug}`;

  try {
    const { error } = await supabase.storage
      .from("images")
      .upload(`categories/${fileName}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(`categories/${fileName}`);

    return urlData?.publicUrl || "";
  } catch (error) {
    handleError("Error uploading image", error);
    return "";
  }
};

export const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select(
        `
        *,
        translations:category_translations(language_id, name),
        subcategories (id, name, slug, translations:category_translations(language_id, name))
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError("Error fetching categories", error);
    return [];
  }
};

export const addCategory = async (name: string, imageUrl: string, translations: Record<string, { name: string }>) => {
  try {
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .insert([{
        name,
        slug: slugify(name),
        image_url: imageUrl,
      }])
      .select()
      .single();

    if (categoryError) throw categoryError;

    if (Object.keys(translations).length > 0) {
      const translationData = Object.entries(translations).map(([languageId, content]) => ({
        category_id: categoryData.id,
        language_id: languageId,
        name: content.name,
      }));

      const { error: translationError } = await supabase
        .from("category_translations")
        .insert(translationData);

      if (translationError) throw translationError;
    }

    return categoryData;
  } catch (error) {
    handleError("Error adding category", error);
    return null;
  }
};

export const deleteCategory = async (category: Category) => {
  try {
    await supabase
      .from("articles")
      .update({
        category_id: null,
        subcategory_id: null,
      })
      .eq("category_id", category.id);

    await supabase
      .from("subcategories")
      .delete()
      .eq("category_id", category.id);

    const imageName = category.image_url.split("/").pop();
    if (imageName) {
      await supabase.storage
        .from("images")
        .remove([`categories/${imageName}`]);
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", category.id);

    if (error) throw error;
    return true;
  } catch (error) {
    handleError("Error deleting category", error);
    return false;
  }
};