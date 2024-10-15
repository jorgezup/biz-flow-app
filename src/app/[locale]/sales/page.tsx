'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import apiUrl from '@/utils/api';
import { format } from 'date-fns';
import { Customer, PaginatedResponse, Order } from '@/types';
import formatCurrency from '@/utils/currency';
import Pagination from '@/app/components/Pagination';
import { getPaymentMethod } from '@/utils/utils';
import CustomerSelect from '@/app/components/CustomerSelect';

const SalesPage = () => {
  const t = useTranslations('sales');
  const common = useTranslations('common');
  const payments = useTranslations('payments');
  const locale = useLocale();

  // State management
  const [sales, setSales] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('OrderDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalSales, setTotalSales] = useState(0);

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

  // Fetch sales data with filters, pagination, and sorting
  const fetchSales = async (
    page: number,
    pageSize: number,
    sortColumn: string,
    sortDirection: string,
    filters: { customerId?: string; startDate?: string; endDate?: string }
  ) => {
    try {
      const { customerId, startDate, endDate } = filters;
      let query = `page=${page}&pageSize=${pageSize}&sortColumn=${sortColumn}&sortDirection=${sortDirection}`;
      if (customerId) query += `&customerId=${customerId}`;
      query += `&status=Completed`;
      if (startDate) query += `&startDate=${startDate}`;
      if (endDate) query += `&endDate=${endDate}`;

      const salesResponse = await fetch(`${apiUrl}/orders?${query}`);
      if (!salesResponse.ok) throw new Error('Failed to fetch sales');
      const { data, totalRecords }: PaginatedResponse = await salesResponse.json();

      setSales(data);
      setTotalSales(totalRecords);
    } catch (error: any) {
      setError(error.message);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchSales(newPage, pageSize, sortColumn, sortDirection, {
      customerId: selectedCustomer?.customerId,
      startDate,
      endDate,
    });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Resetar para a primeira página após mudar o tamanho da página
    fetchSales(1, size, sortColumn, sortDirection, {
      customerId: selectedCustomer?.customerId,
      startDate,
      endDate,
    });
  };

  // Fetch customers and sales on initial load and when relevant state changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCustomers();
        await fetchSales(currentPage, pageSize, sortColumn, sortDirection, {
          customerId: selectedCustomer?.customerId,
          startDate,
          endDate,
        });
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, pageSize, sortColumn, sortDirection, selectedCustomer, startDate, endDate]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">{common('loading')}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">{t('title')}</h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        {/* Filters Section */}
        <div className="mb-6 flex space-x-4 items-center">
          {/* Customer Selector */}
          <div className="w-1/2">
            <CustomerSelect
              customers={customers}
              value={selectedCustomer}
              onChange={(customer) => {
                setSelectedCustomer(customer);
                setCurrentPage(1); // Resetar para a primeira página ao mudar o cliente
              }}
            />
          </div>

          <div className="w-2/3 flex space-x-4 items-center">
            {/* Date Filters */}
            <label htmlFor="start">{t('start')}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 border rounded w-1/2 text-center"
            />
            <label htmlFor="end">{t('end')}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 border rounded w-1/2 text-center"
            />
          </div>
        </div>

        {/* Sales Table */}
        {sales.length === 0 ? (
          <p className="text-red-500 text-center p-8">{t('noSalesFound')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-24 text-left">{common('name')}</th>
                  <th className="py-3 px-4 text-left">{t('saleDate')}</th>
                  <th className="py-3 px-4 text-center">{t('amount')}</th>
                  <th className="py-3 px-4 text-center">{payments('payment')}</th>
                  <th className="py-3 px-4 text-center">{common('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {sales?.map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-gray-100">
                    <td className="py-3 px-24">{sale.customerName}</td>
                    <td className="py-3 px-4">
                      {format(new Date(sale.orderDate), locale === 'en' ? 'MM/dd/yyyy' : 'dd/MM/yyyy')}
                    </td>
                    <td className="py-3 px-4 text-center">{formatCurrency(locale, sale.totalAmount)}</td>
                    <td className="py-3 px-4 text-center">{payments(`${getPaymentMethod(sale.paymentMethod)}`)}</td>
                    <td className="py-3 px-4 text-center">
                      <a
                        href={`/${locale}/orders/order-details/${sale.id}`}
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
          totalItems={totalSales}
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

export default SalesPage;