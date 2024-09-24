'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { SaleDetail } from '@/types';
import apiUrl from '@/utils/api';
import { useLocale, useTranslations } from 'next-intl';
import formatCurrency from '@/utils/currency';

const SaleDetailsPage = () => {
  const common = useTranslations('common');
  const sd = useTranslations('saleDetails');
  const locale = useLocale();
  const [saleDetails, setSaleDetails] = useState<SaleDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchSaleDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}/order-details/order/${id}`);
        const data: SaleDetail[] = await response.json();
        setSaleDetails(data);
      } catch (error) {
        console.error('Failed to fetch sale details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSaleDetails();
  }, [id]);

  const totalAmount = saleDetails.reduce((total, detail) => total + detail.subtotal, 0);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">{common('loading')}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">{sd('title')}</h1>
      <div className="bg-white shadow-md rounded-lg overflow-hidden mx-auto">
        <div className="p-4">
          {saleDetails.length > 0 && (
            <p className="text-gray-900">{sd('customerName')}: <span className="font-bold">{saleDetails[0].customerName}</span></p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">{sd('productName')}</th>
                <th className="py-3 px-4 text-center">{sd('quantity')}</th>
                <th className="py-3 px-4 text-right">{sd('unitPrice')}</th>
                <th className="py-3 px-4 text-right">{sd('subtotal')}</th>
              </tr>
            </thead>
            <tbody>
              {saleDetails.map((detail) => (
                <tr key={detail.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{detail.productName}</td>
                  <td className="py-3 px-4 text-center">{detail.quantity}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(locale, detail.unitPrice)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(locale, detail.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 text-right">
          <p className="text-lg font-semibold">
            {sd('total')}: {formatCurrency(locale, totalAmount)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailsPage;
