'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import apiUrl from '@/utils/api';
import { format } from 'date-fns';
import { Order, PaginatedResponse, Payment } from '@/types';
import formatCurrency from '@/utils/currency';
import Pagination from '@/app/components/Pagination';
import { useParams } from 'next/navigation';

const CustomerPaymentsPage = () => {
  const t = useTranslations('payments');
  const common = useTranslations('common');
  const locale = useLocale();
  // const router = useRouter();
  const { id: customerId } = useParams();

  // State management
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPayments, setTotalPayments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPendingAmount, setTotalPendingAmount] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  // Fetch payments by customerId with filters and pagination
  const fetchPayments = async (
    page: number,
    pageSize: number,
    filters: { startDate?: string; endDate?: string }
  ) => {
    try {
      const { startDate, endDate } = filters;
      let query = `page=${page}&pageSize=${pageSize}&customerId=${customerId}`;
      if (startDate) query += `&startDate=${startDate}`;
      if (endDate) query += `&endDate=${endDate}`;

      const response = await fetch(`${apiUrl}/payments?${query}`);
      if (!response.ok) throw new Error('Failed to fetch payments');
      const { data, totalRecords }: PaginatedResponse = await response.json();

      setPayments(data);
      setTotalPayments(totalRecords);
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Fetch pending payments (orders) for the customer
  const fetchPendingPayments = async (
    page: number,
    pageSize: number,
    filters: { startDate?: string; endDate?: string }
  ) => {
    try {
      const { startDate, endDate } = filters;
      let query = `page=${page}&pageSize=${pageSize}&customerId=${customerId}`;
      if (startDate) query += `&startDate=${startDate}`;
      if (endDate) query += `&endDate=${endDate}`;

      const response = await fetch(`${apiUrl}/payments/pending-payments?${query}`);
      if (!response.ok) throw new Error('Failed to fetch pending payments');
      const { data, totalRecords }: PaginatedResponse = await response.json();

      setOrders(data);
      setTotalOrders(totalRecords);
      setTotalPendingAmount(data.reduce((acc, order) => acc + order.totalAmount, 0));
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Handle page change for payments
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchPayments(newPage, pageSize, { startDate, endDate });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Fetch payments and pending payments when page loads or filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchPayments(currentPage, pageSize, { startDate, endDate });
        await fetchPendingPayments(currentPage, pageSize, { startDate, endDate });
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (customerId) fetchData();
  }, [customerId, currentPage, pageSize, startDate, endDate]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">{common('loading')}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">{t('customerPaymentsTitle')}</h1>

      {/* Filters Section */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        <div className="mb-6 flex space-x-4 items-center">
          <div className="w-2/3 flex space-x-4 items-center">
            <label htmlFor="start">{t('start')}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border rounded w-1/2 text-center"
            />
            <label htmlFor="end">{t('end')}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border rounded w-1/2 text-center"
            />
          </div>
        </div>

        {/* Payments Table */}
        {payments.length === 0 ? (
          <p className="text-red-500 text-center p-8">{t('noPayments')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-24 text-left">{t('paymentDate')}</th>
                  <th className="py-3 px-4 text-left">{t('amount')}</th>
                  <th className="py-3 px-4 text-left">{t('paymentMethod')}</th>
                  <th className="py-3 px-24 text-left">{common('order')}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-100">
                    <td className="py-3 px-24">
                      {format(new Date(payment.paymentDate), locale === 'en' ? 'MM/dd/yyyy' : 'dd/MM/yyyy')}
                    </td>
                    <td className="py-3 px-4">{formatCurrency(locale, payment.amount)}</td>
                    <td className="py-3 px-4">{payment.paymentMethod}</td>
                    <td className="py-3 px-4">
                      <a
                        href={`/${locale}/orders/order-details/${payment.orderId}`}
                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                      >
                        {common('view')}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={totalPayments}
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

        {/* Pending Payments Table */}
        <h2 className="text-2xl font-bold text-blue-900 mt-8 mb-4 text-center">{t('pendingPaymentsTitle')}</h2>

        {orders.length === 0 ? (
          <p className="text-red-500 text-center p-8">{t('noPendingPayments')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-24 text-left">{t('orderDate')}</th>
                  <th className="py-3 px-4 text-left">{t('amount')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-100">
                    <td className="py-3 px-24">
                      {format(new Date(order.orderDate), locale === 'en' ? 'MM/dd/yyyy' : 'dd/MM/yyyy')}
                    </td>
                    <td className="py-3 px-4">{formatCurrency(locale, order.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={totalOrders}
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
    </div>
  );
};

export default CustomerPaymentsPage;
