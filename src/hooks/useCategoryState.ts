import { useState, useCallback, useEffect } from "react";
import { Category, Language, Subcategory } from "@/types";
import { uploadCategoryImage, fetchCategories as fetchCategoriesUtil, addCategory, deleteCategory } from "@/utils/categories";
import { supabase } from "@/lib/supabase";

const useCategoryState = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({ name: "", image_url: "" });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newSubcategory, setNewSubcategory] = useState({ name: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [translations, setTranslations] = useState<Record<string, { name: string }>>({});

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !newCategory.name) return;

      const imageUrl = await uploadCategoryImage(file, newCategory.name);
      setNewCategory((prev) => ({ ...prev, image_url: imageUrl }));
    },
    [newCategory.name]
  );

  // Fetch categories with translations
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchCategoriesUtil();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddCategory = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const categoryData = await addCategory(newCategory.name, newCategory.image_url, translations);
        if (categoryData) {
          await fetchCategories();
          setNewCategory({ name: "", image_url: "" });
          setTranslations({});
        }
      } catch (error) {
        console.error("Error adding category:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [newCategory, translations, fetchCategories]
  );

  const handleAddSubcategory = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        if (!selectedCategory) return;

        const { data, error } = await supabase
          .from("subcategories")
          .insert([
            {
              name: newSubcategory.name,
              slug: newSubcategory.name.toLowerCase().replace(/\s+/g, "-"),
              category_id: selectedCategory.id,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        // If translations exist, add them
        if (Object.keys(translations).length > 0) {
          const translationData = Object.entries(translations).map(([languageId, content]) => ({
            subcategory_id: data.id,
            language_id: languageId,
            name: content.name,
          }));

          const { error: translationError } = await supabase
            .from("category_translations")
            .insert(translationData);

          if (translationError) throw translationError;
        }

        await fetchCategories();
        setNewSubcategory({ name: "" });
        setTranslations({});
        setSelectedCategory(null);
      } catch (error) {
        console.error("Error adding subcategory:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedCategory, newSubcategory, translations, fetchCategories]
  );

  const handleDelete = useCallback(async () => {
    if (!selectedCategory) return;
    setIsLoading(true);

    try {
      const success = await deleteCategory(selectedCategory);
      if (success) {
        await fetchCategories();
        setSelectedCategory(null);
        setDeleteModalOpen(false);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, fetchCategories]);

  return {
    categories,
    newCategory,
    selectedCategory,
    deleteModalOpen,
    newSubcategory,
    isLoading,
    languages,
    selectedLanguage,
    translations,
    actions: {
      handleImageUpload,
      handleAddCategory,
      handleAddSubcategory,
      handleDelete,
      setNewCategory,
      setSelectedCategory,
      setDeleteModalOpen,
      setNewSubcategory,
      setSelectedLanguage,
      setTranslations,
      fetchCategories
    }
  };
};

export default useCategoryState;
