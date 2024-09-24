"use client";

import EntityList from '@/app/components/EntityList';
import { Product } from '@/types';
import formatCurrency from '@/utils/currency';
import { useLocale, useTranslations } from 'next-intl';

const ProductsPage = () => {
  const locale = useLocale();
  const t = useTranslations('common');

  return (
    <EntityList<Product>
      endpoint="products"
      entityName="Product"
      createLink={`/${locale}/products/new`}
      rowKey={(product) => product.productId}
      columns={[
        { header: 'name', accessor: (product) => product.name },
        { header: 'price', accessor: (product) => formatCurrency(locale, product.price) },
        { header: 'unitOfMeasure', accessor: (product) => t(`${product.unitOfMeasure}`) },
        {
          header: 'actions',
          accessor: (product) => (
            <div className="space-x-2">
              <a href={`/${locale}/products/${product.productId}`} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 transition">
                {t('view')}
              </a>
              <a href={`/${locale}/products/${product.productId}/edit`} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-700 transition">
                {t('edit')}
              </a>
            </div>
          ),
        },
      ]}
    />
  );
};

export default ProductsPage;





// 'use client';

// import { useEffect, useState } from 'react';
// import { Product } from '@/types';
// import Link from 'next/link';
// import apiUrl from '@/utils/api';
// import { useLocale, useTranslations } from 'next-intl';
// import formatCurrency from '@/utils/currency';

// const ProductsPage = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const p = useTranslations('products');
//   const m = useTranslations('messages');
//   const c = useTranslations('common');
//   const locale = useLocale();

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await fetch(`${apiUrl}/products`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch products');
//         }
//         const data: Product[] = await response.json();
//         setProducts(data);
//       } catch (error: any) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, []);

//   const filteredProducts = products.filter(product =>
//     product.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   if (loading) {
//     return <div className="flex justify-center items-center h-screen">{m('loading')}</div>;
//   }

//   if (error) {
//     return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
//   }

//   return (
//     <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-3xl font-bold text-blue-900">{p('title')}</h1>
//         <Link className="bg-blue-500 text-white p-2 rounded" href={`/${locale}/products/new`}>
//           {p('createProduct')}
//         </Link>
//       </div>
//       <input
//         type="text"
//         placeholder={c('searchByName')}
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         className="mt-2 p-2 border rounded w-full"
//       />
//       {products.length === 0 ? (
//         <div className="text-red-500 mt-4 text-center">{p('noProductsFound')}</div>
//       ) : (
//         <table className="mt-4 w-full bg-white">
//           <thead>
//             <tr>
//               <th className="py-2 px-4 border-b border-gray-200">{c('name')}</th>
//               <th className="py-2 px-4 border-b border-gray-200">{p('price')}</th>
//               <th className="py-2 px-4 border-b border-gray-200">{p('unitOfMeasure')}</th>
//               <th className="py-2 px-4 border-b border-gray-200">{c('actions')}</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredProducts.map((product) => (
//               <tr key={product.productId} className="hover:bg-gray-100">
//                 <td className="py-2 px-4 border-b border-gray-200">
//                   <Link href={`/${locale}/products/${product.productId}`} className="text-blue-500 hover:underline">
//                     {product.name}
//                   </Link>
//                 </td>
//                 <td className="py-2 px-4 border-b border-gray-200 text-center">{formatCurrency(locale, product.price)}</td>
//                 <td className="py-2 px-4 border-b border-gray-200 text-center">
//                   {product.unitOfMeasure === 'liter' ? p('liter') : p('kg')}
//                 </td>
//                 <td className="py-2 px-4 border-b border-gray-200 text-center">
//                   <Link className="bg-yellow-500 text-white p-1 rounded" href={`/${locale}/products/${product.productId}/edit`}>
//                     {c('edit')}
//                   </Link>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default ProductsPage;
