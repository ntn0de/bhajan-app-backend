// useCategoryState.ts
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { slugify } from "transliteration";
import { Article, Category, Subcategory } from "@/types";

const useCategoryState = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({ name: "", image_url: "" });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newSubcategory, setNewSubcategory] = useState({ name: "" });
  const [isLoading, setIsLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select(
          `
          *,
          subcategories (
            id,
            name,
            slug
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !newCategory.name) return;

      const categoryNameSlug = slugify(newCategory.name);
      const fileName = `${Date.now()}_${categoryNameSlug}`;

      try {
        const { data, error } = await supabase.storage
          .from("images")
          .upload(`categories/${fileName}`, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from("images")
          .getPublicUrl(`categories/${fileName}`);

        setNewCategory((prev) => ({
          ...prev,
          image_url: urlData?.publicUrl || "",
        }));
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    },
    [newCategory.name]
  );

  const handleAddCategory = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const { error } = await supabase.from("categories").insert([
          {
            name: newCategory.name,
            slug: slugify(newCategory.name),
            image_url: newCategory.image_url,
          },
        ]);

        if (error) throw error;

        await fetchCategories();
        setNewCategory({ name: "", image_url: "" });
      } catch (error) {
        console.error("Error adding category:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [newCategory, fetchCategories]
  );

  const handleAddSubcategory = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!selectedCategory) return;

      setIsLoading(true);
      try {
        const newSubcategoryData = {
          name: newSubcategory.name,
          slug: slugify(newSubcategory.name),
          category_id: selectedCategory.id,
        };

        const { data, error } = await supabase
          .from("subcategories")
          .insert([newSubcategoryData])
          .select()
          .single();

        if (error) throw error;

        const updatedCategory = {
          ...selectedCategory,
          subcategories: [...(selectedCategory.subcategories || []), data],
        };

        setCategories((prevCategories) =>
          prevCategories.map((cat) =>
            cat.id === updatedCategory.id ? updatedCategory : cat
          )
        );
        setNewSubcategory({ name: "" });
        setSelectedCategory(null);
      } catch (error) {
        console.error("Error adding subcategory:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [newSubcategory.name, selectedCategory]
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
                      cat.subcategories?.filter(
                        (sub) => sub.id !== category.id
                      ) || [],
                  }
                : cat
            )
          );
        } else if (type === "category") {
          const { error: articlesError } = await supabase
            .from("articles")
            .update({ category_id: null, subcategory_id: null })
            .eq("category_id", category.id);
          if (articlesError) throw articlesError;

          const { error: subcategoriesError } = await supabase
            .from("subcategories")
            .delete()
            .eq("category_id", category.id);
          if (subcategoriesError) throw subcategoriesError;

          const { error } = await supabase
            .from("categories")
            .delete()
            .eq("id", category.id);
          if (error) throw error;
          // also delete image
          console.log({ category });
          // get last file name from "https://bddvcuswobczqbyjlevs.supabase.co/storage/v1/object/public/images/categories/1737470923362_ii-raaj-caaliisaa"
          const imageUrl = category.image_url.split("/").slice(-1)[0];
          try {
            await supabase.storage
              .from("images")
              .remove([`categories/${imageUrl}`]);
          } catch (error) {
            console.error(`Error deleting iamge:`, error);
          }

          if (error) throw error;

          setCategories((prev) => prev.filter((c) => c.id !== category.id));
          setSelectedCategory(null);
          setDeleteModalOpen(false);
        }
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
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
    actions: {
      setNewCategory,
      setSelectedCategory,
      setNewSubcategory,
      setDeleteModalOpen,
      fetchCategories,
      handleAddCategory,
      handleAddSubcategory,
      handleDelete,
      handleImageUpload,
    },
  };
};

export default useCategoryState;
