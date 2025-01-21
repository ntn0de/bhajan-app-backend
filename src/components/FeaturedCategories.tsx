// import Image from "next/image";
// import Link from "next/link";
// import { Category, Subcategory } from "@/types";

// interface FeaturedCategoriesProps {
//   categories: (Category & {
//     subcategories: { id: string; name: string }[];
//   })[];
// }

// export default function FeaturedCategories({
//   categories,
// }: FeaturedCategoriesProps) {
//   // Helper function to determine the category URL based on whether it has subcategories
//   const getCategoryUrl = (
//     category: Category & { subcategories: Subcategory[] }
//   ) => {
//     return category.subcategories?.length > 0
//       ? `/categories/${category.slug}/subcategories`
//       : `/categories/${category.slug}/articles`;
//   };

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//       {categories.map((category: Category) => (
//         <Link
//           key={category.id}
//           href={getCategoryUrl(category)}
//           className="group relative block aspect-video overflow-hidden rounded-lg"
//         >
//           {/* Category Image with Overlay */}
//           <div className="absolute inset-0">
//             <Image
//               src={category.image_url}
//               alt={category.name}
//               fill
//               className="object-cover transition-transform duration-300 group-hover:scale-105"
//             />
//             {/* Dark overlay for better text readability */}
//             <div className="absolute inset-0 bg-black/40 transition-opacity duration-300 group-hover:bg-black/50" />
//           </div>

//           {/* Category Information */}
//           <div className="relative h-full flex flex-col justify-end p-6 text-white">
//             <h3 className="text-2xl font-bold mb-2">{category.name}</h3>

//             {/* Show different text based on whether there are subcategories */}
//             <div className="flex items-center space-x-2">
//               <span className="text-sm opacity-90">
//                 {category.subcategories?.length > 0
//                   ? `${category.subcategories.length} Subcategories`
//                   : "View Articles"}
//               </span>
//               <svg
//                 className="w-4 h-4 transform transition-transform group-hover:translate-x-1"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M9 5l7 7-7 7"
//                 />
//               </svg>
//             </div>
//           </div>
//         </Link>
//       ))}
//     </div>
//   );
// }
