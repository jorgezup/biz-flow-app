'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Product } from '@/types';
import apiUrl from '@/utils/api';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import formatCurrency from '@/utils/currency';
import FormattedDate from '@/app/components/FormattedDate';

const ProductDetailsPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);

  const c = useTranslations('common');
  const p = useTranslations('products');
  const m = useTranslations('messages');
  const locale = useLocale();

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const response = await fetch(`${apiUrl}/products/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch product');
          }
          const data: Product = await response.json();
          setProduct(data);
        } catch (error) {
          console.error('Error fetching product:', error);
        }
      };

      fetchProduct();
    }
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`${apiUrl}/products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      toast.success(c('successDelete'));
      setTimeout(() => {
        router.push(`/${locale}/products`);
      }, 2000);
    } catch (error) {
      toast.error(c('errorDelete'));
      console.error('Error deleting product:', error);
    }
  };

  if (!product) {
    return <div className="flex justify-center items-center h-screen">{m('loading')}</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">{product.name}</h1>
      <div className="space-y-4">
        <p><strong>{p('description')}:</strong> {product.description}</p>
        <p><strong>{p('unitOfMeasure')}:</strong> {product.unitOfMeasure}</p>
        <p><strong>{p('price')}:</strong> {formatCurrency(locale, product.price)}</p>
        <p><strong>{c('createdAt')}:</strong> <FormattedDate dateString={product.createdAt} withHours={true}/> </p>
        <p><strong>{c('updatedAt')}:</strong> <FormattedDate dateString={product.updatedAt} withHours={true}/></p>
      </div>
      <div className="mt-6 flex space-x-4">
        <Link className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-700" href={`/${locale}/products/${product.productId}/edit`}>
          {c('edit')}
        </Link>
        <button
          onClick={handleDelete}
          className="p-2 bg-red-500 text-white rounded hover:bg-red-700"
        >
          {c('delete')}
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ProductDetailsPage;
