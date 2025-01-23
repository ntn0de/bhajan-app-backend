"use client";

import { useEffect } from "react";
import Image from "next/image";
import { CategoryCard } from "../../../components/categories/CategoryCard";
import { AddSubcategoryModal } from "../../../components/categories/AddSubcategoryModal";
import { DeleteCategoryModal } from "../../../components/categories/DeleteCategoryModal";
import useCategoryState from "@/hooks/useCategoryState";

export default function CategoryManagement() {
  const {
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
  } = useCategoryState();

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Category Management</h1>

      {/* Add Category Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6 dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
        <div className="flex gap-6">
          <form onSubmit={handleAddCategory} className="space-y-4 flex-1">
            <div>
              <label className="block text-sm font-medium mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 border rounded dark:border-gray-700 dark:text-black"
                required
                disabled={isLoading}
              />
            </div>



            <div>
              <label className="block text-sm font-medium mb-1">
                Category Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full"
                disabled={isLoading || !newCategory.name}
              />
              {newCategory.image_url && (
                <div className="mt-2">
                  <Image
                    src={newCategory.image_url}
                    alt="Category preview"
                    width={100}
                    height={100}
                    className="rounded"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={isLoading || !newCategory.name}
            >
              {isLoading ? "Adding..." : "Add Category"}
            </button>
          </form>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onAddSubcategory={() => {
              setSelectedCategory(category);
              setNewSubcategory({ name: "" });
              setDeleteModalOpen(false);
            }}
            onDelete={(type, subId) => {
              if (type === "category") {
                setSelectedCategory(category);
                setDeleteModalOpen(true);
              } else if (type === "subcategory" && subId) {
                handleDelete(type, subId, category);
              }
            }}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Modals */}
      {selectedCategory && !deleteModalOpen && (
        <AddSubcategoryModal
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
          subcategory={newSubcategory}
          onChange={(value) => setNewSubcategory({ name: value })}
          onSubmit={handleAddSubcategory}
          isLoading={isLoading}
        />
      )}

      <DeleteCategoryModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={() =>
          selectedCategory &&
          handleDelete("category", "", selectedCategory)
        }
        categoryName={selectedCategory?.name || ""}
        isLoading={isLoading}
      />
    </div>
  );
}
