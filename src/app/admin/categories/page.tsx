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
                Category Name
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
                Image {!newCategory.name && "(Type category name first)"}
              </label>
              <div className="mt-2">
                <label
                  className={`px-4 py-2 text-white rounded hover:bg-blue-700 cursor-pointer inline-block ${
                    !newCategory.name || isLoading
                      ? "bg-gray-400 opacity-50"
                      : "bg-blue-600"
                  }`}
                >
                  Upload Image
                  <input
                    type="file"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={!newCategory.name || isLoading}
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={!newCategory.image_url || isLoading}
              className={`px-4 py-2 text-white rounded ${
                !newCategory.image_url || isLoading
                  ? "bg-gray-400 opacity-50"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading ? "Adding..." : "Add Category"}
            </button>
          </form>

          {/* Image Preview */}
          {newCategory.image_url && (
            <div className="flex-shrink-0 flex items-center">
              <Image
                src={newCategory.image_url}
                alt="Category preview"
                width={200}
                height={200}
                className="w-32 h-32 object-cover rounded-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            onAddSubcategory={() => setSelectedCategory(category)}
            onDeleteCategory={() => {
              setSelectedCategory(category);
              setDeleteModalOpen(true);
            }}
            onDeleteSubcategory={(subId) =>
              handleDelete("subcategory", subId, category)
            }
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Modals */}
      {selectedCategory && !deleteModalOpen && (
        <AddSubcategoryModal
          category={selectedCategory}
          subcategory={newSubcategory}
          onClose={() => setSelectedCategory(null)}
          onSubmit={handleAddSubcategory}
          onChange={(value) => setNewSubcategory({ name: value })}
          isLoading={isLoading}
        />
      )}

      {selectedCategory && deleteModalOpen && (
        <DeleteCategoryModal
          category={selectedCategory}
          onClose={() => {
            setSelectedCategory(null);
            setDeleteModalOpen(false);
          }}
          onDelete={() => handleDelete("category", "", selectedCategory)}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
