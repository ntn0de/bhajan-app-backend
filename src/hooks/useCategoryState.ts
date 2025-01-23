import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { slugify } from "transliteration";
import { Category, Language, Subcategory } from "@/types";

const handleError = (message: string, error: any) => {
  console.error(`${message}:`, error);
};



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

  const uploadImage = useCallback(async (file: File, categoryName: string) => {
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
  }, []);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !newCategory.name) return;

      const imageUrl = await uploadImage(file, newCategory.name);
      setNewCategory((prev) => ({ ...prev, image_url: imageUrl }));
    },
    [newCategory.name, uploadImage]
  );


  // Fetch languages
  useEffect(() => {
    async function fetchLanguages() {
      const { data, error } = await supabase
        .from("languages")
        .select("*")
        .eq("is_active", true);

      if (error) {
        handleError("Error fetching languages", error);
        return;
      }

      setLanguages(data || []);
    }

    fetchLanguages();
  }, []);

  // Fetch categories with translations
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
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
      setCategories(data || []);
    } catch (error) {
      handleError("Error fetching categories", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddCategory = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        // First insert the category
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .insert([{
            name: newCategory.name,
            slug: slugify(newCategory.name),
            image_url: newCategory.image_url,
          }])
          .select()
          .single();

        if (categoryError) throw categoryError;

        // Then insert translations if any
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

        await fetchCategories();
        setNewCategory({ name: "", image_url: "" });
        setTranslations({});
      } catch (error) {
        handleError("Error adding category", error);
      } finally {
        setIsLoading(false);
      }
    },
    [newCategory, translations, fetchCategories]
  );

  const handleAddSubcategory = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!selectedCategory) return;

      setIsLoading(true);
      try {
        // First insert the subcategory
        const { data: subcategoryData, error: subcategoryError } = await supabase
          .from("subcategories")
          .insert([{
            name: newSubcategory.name,
            slug: slugify(newSubcategory.name),
            category_id: selectedCategory.id,
          }])
          .select()
          .single();

        if (subcategoryError) throw subcategoryError;

        // Then insert translations if any
        if (Object.keys(translations).length > 0) {
          const translationData = Object.entries(translations).map(([languageId, content]) => ({
            subcategory_id: subcategoryData.id,
            language_id: languageId,
            name: content.name,
          }));

          const { error: translationError } = await supabase
            .from("category_translations")
            .insert(translationData);

          if (translationError) throw translationError;
        }

        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === selectedCategory.id
              ? {
                  ...cat,
                  subcategories: [...(cat.subcategories || []), subcategoryData],
                }
              : cat
          )
        );
        setNewSubcategory({ name: "" });
        setSelectedCategory(null);
        setTranslations({});
      } catch (error) {
        handleError("Error adding subcategory", error);
      } finally {
        setIsLoading(false);
      }
    },
    [newSubcategory.name, selectedCategory, translations]
  );

  const handleDelete = useCallback(
    async (
      type: "category" | "subcategory",
      subId: string,
      category: Category
    ) => {
      setIsLoading(true);
      try {
        if (type === "subcategory") {
          const { error: articleError } = await supabase
            .from("articles")
            .update({
              subcategory_id: null,
            })
            .eq("subcategory_id", subId);
          if (articleError)
            handleError(
              "Error unlinking subcategory from article",
              articleError
            );
          const { error } = await supabase
            .from("subcategories")
            .delete()
            .eq("id", subId);
          if (error) throw error;

          setCategories((prev) =>
            prev.map((cat) =>
              cat.id === category.id
                ? {
                    ...cat,
                    subcategories:
                      cat.subcategories?.filter((sub) => sub.id !== subId) ||
                      [],
                  }
                : cat
            )
          );
        } else if (type === "category") {
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

          setCategories((prev) => prev.filter((c) => c.id !== category.id));
          setSelectedCategory(null);
          setDeleteModalOpen(false);
        }
      } catch (error) {
        handleError(`Error deleting ${type}`, error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

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
      setNewCategory,
      setSelectedCategory,
      setNewSubcategory,
      setDeleteModalOpen,
      setSelectedLanguage,
      setTranslations,
      fetchCategories,
      handleAddCategory,
      handleAddSubcategory,
      handleDelete,
      handleImageUpload,
    },
  };
};

export default useCategoryState;
