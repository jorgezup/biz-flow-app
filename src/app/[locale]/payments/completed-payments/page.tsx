'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import apiUrl from '@/utils/api';
import { format } from 'date-fns';
import { Customer, PaginatedResponse, Payment } from '@/types';
import formatCurrency from '@/utils/currency';
import Pagination from '@/app/components/Pagination';
import { getCustomerName } from '@/utils/utils';

const CompletedPaymentsPage = () => {
  const t = useTranslations('payments');
  const common = useTranslations('common');
  const locale = useLocale();

  // State management
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPayments, setTotalPayments] = useState(0);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const customersResponse = await fetch(`${apiUrl}/customers`);
      if (!customersResponse.ok) throw new Error('Failed to fetch customers');
      const customersData: Customer[] = await customersResponse.json();
      setCustomers(customersData);
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Fetch completed payments with filters and pagination
  const fetchCompletedPayments = async (
    page: number,
    pageSize: number,
    filters: { customerId?: string; startDate?: string; endDate?: string }
  ) => {
    try {
      const { customerId, startDate, endDate } = filters;
      let query = `page=${page}&pageSize=${pageSize}`;
      if (customerId) query += `&customerId=${customerId}`;
      if (startDate) query += `&startDate=${startDate}`;
      if (endDate) query += `&endDate=${endDate}`;

      const response = await fetch(`${apiUrl}/payments?${query}`);
      if (!response.ok) throw new Error('Failed to fetch completed payments');
      const { data, totalRecords }: PaginatedResponse = await response.json();

      setPayments(data);
      setTotalPayments(totalRecords);
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchCompletedPayments(newPage, pageSize, { customerId: selectedCustomerId, startDate, endDate });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Fetch customers and completed payments on initial load and when filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCustomers();
        await fetchCompletedPayments(currentPage, pageSize, { customerId: selectedCustomerId, startDate, endDate });
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, pageSize, selectedCustomerId, startDate, endDate]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">{common('loading')}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">{t('completedPayments')}</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        {/* Filters Section */}
        <div className="mb-6 flex space-x-4 items-center">
          {/* Customer Selector */}
          <select
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="p-2 border rounded w-1/3"
          >
            <option value="">{t('selectCustomer')}</option>
            {customers?.map((customer: Customer) => (
              <option key={customer.customerId} value={customer.customerId}>
                {customer.name}
              </option>
            ))}
          </select>

          <div className="w-2/3 flex space-x-4 items-center">
            {/* Date Filters */}
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

        {/* Completed Payments Table */}
        {payments.length === 0 ? (
          <p className="text-red-500 text-center p-8">{t('noCompletedPayments')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-24 text-left">{common('name')}</th>
                  <th className="py-3 px-4 text-left">{t('paymentDate')}</th>
                  <th className="py-3 px-4 text-center">{t('amount')}</th>
                  <th className="py-3 px-4 text-center">{t('paymentMethod')}</th>
                </tr>
              </thead>
              <tbody>
                {payments?.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-100">
                    <td className="py-3 px-24">{getCustomerName(customers, payment.customerId)}</td>
                    <td className="py-3 px-4">
                      {format(new Date(payment.paymentDate), locale === 'en' ? 'MM/dd/yyyy' : 'dd/MM/yyyy')}
                    </td>
                    <td className="py-3 px-4 text-center">{formatCurrency(locale, payment.amount)}</td>
                    <td className="py-3 px-4 text-center">{t(`${payment.paymentMethod.toLocaleLowerCase()}`)}</td>
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
      </div>
    </div>
  );
};

export default CompletedPaymentsPage;
