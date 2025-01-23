"use client";
import { useState } from "react";
import { Category } from "@/types";
import Image from "next/image";
import { TranslationModal } from "./TranslationModal";
import { DeleteSubcategoryModal } from "./DeleteSubcategoryModal";

export function CategoryCard({
  category,
  onAddSubcategory,
  onDelete,
  isLoading,
}: {
  category: Category;
  onAddSubcategory: () => void;
  onDelete: (type: "category" | "subcategory", subId?: string) => void;
  isLoading: boolean;
}) {
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ item: any; type: "category" | "subcategory" } | null>(null);
  const [deleteSubcategoryModalOpen, setDeleteSubcategoryModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<{ id: string; name: string } | null>(null);

  return (
    <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800 w-full">
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-xl font-semibold">{category.name}</h3>
                <p className="text-sm text-gray-500">Slug: {category.slug}</p>
              </div>
              <div className="flex-shrink-0 ml-4">
                <Image
                  src={category.image_url}
                  alt={category.name}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />
              </div>
            </div>
            <div className="mt-2">
              <h4 className="text-sm font-medium text-gray-600">Available Translations:</h4>
              <div className="flex flex-wrap gap-2 mt-1">
                {category.translations?.map((translation) => (
                  <span
                    key={translation.language_id}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {translation.name}
                  </span>
                )) || <span className="text-sm text-gray-500">No translations available</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium">Subcategories</h4>
            <button
              onClick={onAddSubcategory}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Add Subcategory
            </button>
          </div>
          
          {category.subcategories && category.subcategories.length > 0 ? (
            <div className="space-y-4">
              {category.subcategories.map((sub) => (
                <div key={sub.id} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-medium">{sub.name}</h5>
                      <p className="text-sm text-gray-500">{sub.slug}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedItem({ item: sub, type: "subcategory" });
                          setShowTranslationModal(true);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Manage Translations
                      </button>
                      <button
                        onClick={() => {
                          setSelectedSubcategory({ id: sub.id, name: sub.name });
                          setDeleteSubcategoryModalOpen(true);
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <h6 className="text-xs font-medium text-gray-600 mb-1">Translations:</h6>
                    <div className="flex flex-wrap gap-2">
                      {sub.translations?.map((translation) => (
                        <span
                          key={translation.language_id}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {translation.name}
                        </span>
                      )) || <span className="text-xs text-gray-500">No translations</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No subcategories yet</p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4 flex justify-end">
          <button
            onClick={() => onDelete("category")}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            Delete Category
          </button>
        </div>
      </div>

      {selectedItem && (
        <TranslationModal
          isOpen={showTranslationModal}
          onClose={() => {
            setShowTranslationModal(false);
            setSelectedItem(null);
          }}
          item={selectedItem.item}
          type={selectedItem.type}
          isLoading={isLoading}
        />
      )}

      <DeleteSubcategoryModal
        isOpen={deleteSubcategoryModalOpen}
        onClose={() => {
          setDeleteSubcategoryModalOpen(false);
          setSelectedSubcategory(null);
        }}
        onConfirm={() => {
          if (selectedSubcategory) {
            onDelete("subcategory", selectedSubcategory.id);
            setDeleteSubcategoryModalOpen(false);
            setSelectedSubcategory(null);
          }
        }}
        subcategoryName={selectedSubcategory?.name || ""}
        isLoading={isLoading}
      />
    </div>
  );
}
