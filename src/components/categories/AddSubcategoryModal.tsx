"use client";
import { Category } from "@/types";

// Modal for adding subcategories
export function AddSubcategoryModal({
  category,
  subcategory,
  onClose,
  onSubmit,
  onChange,
  isLoading,
}: {
  category: Category;
  subcategory: { name: string };
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (value: string) => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">
          Add Subcategory to {category.name}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Subcategory Name
            </label>
            <input
              type="text"
              value={subcategory.name}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:border-gray-700 dark:text-black"
              required
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Adding..." : "Add Subcategory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
