"use client";
import { Category } from "@/types";
import Image from "next/image";

export function CategoryCard({
  category,
  onAddSubcategory,
  onDeleteCategory,
  onDeleteSubcategory,
  isLoading,
}: {
  category: Category;
  onAddSubcategory: () => void;
  onDeleteCategory: () => void;
  onDeleteSubcategory: (subId: string) => void;
  isLoading: boolean;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow dark:bg-gray-800">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold mb-2">{category.name}</h3>
          <p className="text-sm text-gray-500 mb-4">Slug: {category.slug}</p>

          <div className="mb-4">
            <h4 className="font-medium mb-2">Subcategories:</h4>
            <ul className="list-disc pl-5 space-y-1">
              {category.subcategories?.map((sub) => (
                <li key={sub.id} className="text-sm">
                  {sub.name} <span className="text-gray-500">({sub.slug})</span>
                  <button
                    onClick={() => onDeleteSubcategory(sub.id)}
                    disabled={isLoading}
                    className="text-white hover:text-red-800 rounded-full bg-red-800 hover:bg-white px-1 ml-2 cursor-pointer disabled:opacity-50"
                  >
                    x
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-x-4">
            <button
              onClick={onAddSubcategory}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              Add Subcategory
            </button>
            <button
              onClick={onDeleteCategory}
              disabled={isLoading}
              className="text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Remove Category
            </button>
          </div>
        </div>

        <div className="flex-shrink-0">
          <Image
            src={category.image_url}
            alt={category.name}
            width={200}
            height={200}
            className="w-24 h-24 object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
