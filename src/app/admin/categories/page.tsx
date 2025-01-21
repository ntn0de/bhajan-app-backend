"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { supabase } from "@/lib/supabase";
import { Category, Subcategory } from "@/types";
import { slugify } from "transliteration";

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);

  const [newCategory, setNewCategory] = useState({ name: "", image_url: "" });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [deleteCategory, setDeleteCategory] = useState<boolean>(false);
  const [newSubcategory, setNewSubcategory] = useState({ name: "" });

  // Fetch categories with their subcategories
  const fetchCategories = async () => {
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

    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add new category
  const handleAddCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const slug = slugify(newCategory.name);

    const { error } = await supabase.from("categories").insert([
      {
        name: newCategory.name,
        slug,
        image_url: newCategory.image_url,
      },
    ]);

    if (error) {
      console.error("Error adding category:", error);
      return;
    }

    setNewCategory({ name: "", image_url: "" });
    fetchCategories();
  };

  // Add new subcategory
  const handleAddSubcategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCategory) {
      console.error("No category selected for adding subcategory.");
      return;
    }

    const slug = slugify(newSubcategory.name);

    const { error } = await supabase.from("subcategories").insert([
      {
        name: newSubcategory.name,
        slug,
        category_id: selectedCategory.id,
      },
    ]);

    if (error) {
      console.error("Error adding subcategory:", error);
      return;
    }

    setNewSubcategory({ name: "" });
    fetchCategories();
  };

  const uploadImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log(file);
    if (!file) {
      console.error("No file selected for upload.");
      return;
    }
    const categoryNameSlug = newCategory.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const fileName = `${Date.now()}_${categoryNameSlug}`;
    const { data, error } = await supabase.storage
      .from("images")
      .upload(`categories/${fileName}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error("Error uploading image:", error);
      return;
    }

    const publicUrl = supabase.storage
      .from("images")
      .getPublicUrl(`categories/${fileName}`).data?.publicUrl;

    if (publicUrl) {
      setNewCategory((prev) => ({ ...prev, image_url: publicUrl }));
    }
  };
  const deleteSelectedCategory = async (category: Category) => {
    try {
      await supabase.from("categories").delete().eq("id", category.id);
      await supabase
        .from("subcategories")
        .delete()
        .eq("category_id", category.id);
      // refresh categories
      fetchCategories();
      // toast.success("Category deleted successfully!");
      console.log("Category deleted successfully!");
      setSelectedCategory(null);
      setDeleteCategory(false);
    } catch (error) {
      // toast.error("Error deleting category!");
      console.log("Error deleting category!");
    }
  };
  const deleteSelectedSubCategory = async (sub: Subcategory) => {
    try {
      await supabase.from("subcategories").delete().eq("id", sub.id);
      // refresh categories
      fetchCategories();
      // toast.success("Subcategory deleted successfully!");
      console.log("Subcategory deleted successfully!");
    } catch (error) {
      // toast.error("Error deleting subcategory!");
      console.log("Error deleting subcategory!");
    }
  };

  return (
    <div>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Category Management</h1>

        {/* Add Category Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-6 dark:bg-gray-800">
          <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Category Name
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
                className="w-full px-3 py-2 border rounded dark:border-gray-700 dark:text-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Image{" "}
                {newCategory.name == "" ? "(Type category name first)" : false}
              </label>
              <div className="mt-2">
                <label
                  className={`px-4 py-2  text-white rounded hover:bg-blue-700 cursor-pointer inline-block ${
                    newCategory.name == ""
                      ? "bg-gray-400 opacity-50"
                      : "bg-blue-600"
                  }`}
                >
                  Upload Image
                  <input
                    disabled={newCategory.name == "" ? true : false}
                    type="file"
                    onChange={uploadImage}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <button
              type="submit"
              className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
                newCategory.image_url == "" ? "bg-gray-400 opacity-50" : ""
              }`}
            >
              Add Category
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white p-6 rounded-lg shadow dark:bg-gray-800"
            >
              <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
              <p className="text-sm text-gray-500 mb-4">
                Slug: {category.slug}
              </p>

              {/* Subcategories */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">Subcategories:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {category.subcategories?.map((sub: Subcategory) => (
                    <li key={sub.id} className="text-sm">
                      {sub.name}{" "}
                      <span className="text-gray-500">({sub.slug})</span>
                      <button
                        onClick={() => {
                          deleteSelectedSubCategory(sub);
                        }}
                        className="text-white-600 hover:text-red-800 rounded-full bg-red-800 hover:bg-white px-1 ml-2 cursor-pointer"
                      >
                        x
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Add Subcategory Form */}
              <button
                onClick={() => setSelectedCategory(category)}
                className="text-blue-600 hover:text-blue-800"
              >
                Add Subcategory
              </button>
              {/* Remove Category Modal */}
              <button
                onClick={() => {
                  setSelectedCategory(category);
                  setDeleteCategory(true);
                }}
                className="text-red-600 hover:text-red-800"
              >
                Remove Category
              </button>
            </div>
          ))}
        </div>

        {/* Add Subcategory Modal */}
        {selectedCategory && !deleteCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ">
            <div className="bg-white p-6 rounded-lg w-full max-w-md dark:bg-gray-800">
              <h2 className="text-xl font-semibold mb-4">
                Add Subcategory to {selectedCategory.name}
              </h2>
              <form onSubmit={handleAddSubcategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Subcategory Name
                  </label>
                  <input
                    type="text"
                    value={newSubcategory.name}
                    onChange={(e) =>
                      setNewSubcategory({
                        ...newSubcategory,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border rounded dark:border-gray-700 dark:text-black"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add Subcategory
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Delete Category Modal */}
        {selectedCategory && deleteCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ">
            <div className="bg-white p-6 rounded-lg w-full max-w-md dark:bg-gray-800">
              <h2 className="text-xl font-semibold mb-4">
                Are you sure you want to delete this category?
              </h2>
              <button
                onClick={() => deleteSelectedCategory(selectedCategory)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete Category
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
