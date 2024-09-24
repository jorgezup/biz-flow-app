'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import apiUrl from '@/utils/api';
import Pagination from '@/app/components/Pagination';
import { Customer, CustomerPendingPayment, PaginatedResponse } from '@/types';
import formatCurrency from '@/utils/currency';

const PaymentsPage = () => {
  const t = useTranslations('payments');
  const common = useTranslations('common');
  const locale = useLocale();

  // State management
  const [pendingPayments, setPendingPayments] = useState<CustomerPendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPendingAmount, setTotalPendingAmount] = useState(0);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Fetch pending payments data
  const fetchPendingPayments = async (page: number, pageSize: number) => {
    try {
      const query = `page=${page}&pageSize=${pageSize}`;
      const response = await fetch(`${apiUrl}/payments/pending-payments?${query}`);
      if (!response.ok) throw new Error('Failed to fetch pending payments');

      const { result, totalRecords }: PaginatedResponse = await response.json();
      setPendingPayments(result.customerPendingPayment);
      setTotalPendingAmount(result.totalPendingAmount);
      setTotalRecords(totalRecords);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${apiUrl}/customers`);
      if (!response.ok) throw new Error('Failed to fetch customers');
      setCustomers(await response.json())
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchPendingPayments(newPage, pageSize);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page after page size change
  };

  // Fetch pending payments on initial load and when relevant state changes
  useEffect(() => {
    fetchPendingPayments(currentPage, pageSize);
    fetchCustomers();
  }, [currentPage, pageSize]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">{common('loading')}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">{t('title')}</h1>


      {/* Navigation Buttons */}
      <div className="mb-20 text-center">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
          onClick={() => window.location.href = `/${locale}/payments/pending-payments`}
        >
          {t('pendingPayments')}
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={() => window.location.href = `/${locale}/payments/completed-payments`}
        >
          {t('completedPayments')}
        </button>
      </div>

      {/* Pending Payments Table */}
      {pendingPayments.length === 0 ? (
        <p className="text-red-500 text-center p-8">{t('noPendingPayments')}</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
          <div className="overflow-x-auto">
            <h3 className="text-3xl font-bold text-blue-900 mb-6 text-center">Vendas pendentes de pagamento</h3>
            {/* Display total pending amount */}
            <div className="mb-6 text-center">
              <span className="font-bold text-xl">{t('totalPendingAmount')}: </span>
              <span className="text-xl">{formatCurrency(locale, totalPendingAmount)}</span>
            </div>
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-center">{t('customer')}</th>
                  <th className="py-3 px-4 text-center">{t('pendingAmount')}</th>
                </tr>
              </thead>
              <tbody>
                {pendingPayments?.map((payment) => (
                  <tr key={payment.customerId} className="border-b hover:bg-gray-100">
                    <td className="py-3 px-4 text-center">{payment.customerName}</td>
                    <td className="py-3 px-4 text-center">{formatCurrency(locale, payment.totalPendingAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalRecords}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        translations={{
          previous: common('previous'),
          next: common('next'),
          page: common('page'),
          of: common('of'),
        }}
      />
    </div>
  );
};

export default PaymentsPage;
