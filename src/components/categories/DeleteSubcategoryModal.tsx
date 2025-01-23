"use client";

// Modal for deleting subcategories
export function DeleteSubcategoryModal({
  subcategoryName,
  onClose,
  onConfirm,
  isOpen,
  isLoading,
}: {
  subcategoryName: string;
  onClose: () => void;
  onConfirm: () => void;
  isOpen: boolean;
  isLoading: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-md dark:bg-gray-800">
        <h2 className="text-xl font-semibold mb-4">
          Are you sure you want to delete {subcategoryName}?
        </h2>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : "Delete Subcategory"}
          </button>
        </div>
      </div>
    </div>
  );
}