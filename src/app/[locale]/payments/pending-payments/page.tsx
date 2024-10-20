'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import apiUrl from '@/utils/api';
import { format } from 'date-fns';
import { Customer, PaginatedResponse, Order, PaymentMethod } from '@/types';
import formatCurrency from '@/utils/currency';
import Pagination from '@/app/components/Pagination';
import 'react-toastify/dist/ReactToastify.css';
import { FiSave } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import CustomerSelect from '@/app/components/CustomerSelect';

const PaymentsPage = () => {
  const t = useTranslations('payments');
  const common = useTranslations('common');
  const locale = useLocale();

  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<{ [orderId: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPendingAmount, setTotalPendingAmount] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  // Fetch customers
  // const fetchCustomers = async () => {
  //   try {
  //     const customersResponse = await fetch(`${apiUrl}/customers`);
  //     if (!customersResponse.ok) throw new Error('Failed to fetch customers');
  //     const customersData: Customer[] = await customersResponse.json();
  //     setCustomers(customersData);
  //   } catch (error: any) {
  //     setError(error.message);
  //   }
  // };

  // Fetch pending payments (orders) with filters and pagination
  const fetchPendingPayments = async (
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

      const response = await fetch(`${apiUrl}/payments/pending-payments?${query}`);
      if (!response.ok) throw new Error('Failed to fetch pending payments');
      const {orders, totalPendingAmount, customerPendingPayment} = await response.json();
      const totalRecords = orders.length;
      setOrders(orders);
      setTotalPendingAmount(totalPendingAmount);
      setTotalOrders(totalRecords);
      setCustomers(customerPendingPayment)
      console.log("oi")
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handlePaymentMethodChange = (orderId: string, method: string) => {
    setPaymentMethods((prevMethods) => ({
      ...prevMethods,
      [orderId]: method,
    }));
  };

  // Register a payment
  const registerPayment = async (orderId: string) => {
    try {
      const paymentMethod = paymentMethods[orderId];

      if (!paymentMethod) {
        toast.info(t('selectPaymentMethod'));
        return;
      }

      const paymentData = {
        orderId,
        paymentMethod,
        paymentDate: new Date().toISOString(),
      };

      await fetch(`${apiUrl}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      toast.success(t('paymentRegistered'));
      fetchPendingPayments(currentPage, pageSize, {
        customerId: selectedCustomer?.customerId,
        startDate,
        endDate,
      });
    } catch (error: any) {
      setError(error.message);
      toast.error(error.message);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchPendingPayments(newPage, pageSize, {
      customerId: selectedCustomer?.customerId,
      startDate,
      endDate,
    });
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    fetchPendingPayments(1, size, {
      customerId: selectedCustomer?.customerId,
      startDate,
      endDate,
    });
  };

  // Fetch customers and pending payments on initial load and when filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        // await fetchCustomers();
        await fetchPendingPayments(currentPage, pageSize, {
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
  }, [currentPage, pageSize, selectedCustomer, startDate, endDate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        {common('loading')}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">
        {t('pendingPaymentsTitle')}
      </h1>

      <div className="bg-white shadow-md rounded-lg overflow-hidden p-6">
        {/* Filters Section */}
        <div className="mb-6 flex space-x-4 items-center">
          {/* Customer Selector */}
          <div className="w-1/3">
            <CustomerSelect
              customers={customers}
              value={selectedCustomer}
              onChange={(customer) => {
                setSelectedCustomer(customer);
                setCurrentPage(1);
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

        {/* Pending Payments Table */}
        {orders.length === 0 ? (
          <p className="text-red-500 text-center p-8">{t('noPendingPayments')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-24 text-left">{common('name')}</th>
                  <th className="py-3 px-4 text-left">{t('saleDate')}</th>
                  <th className="py-3 px-4 text-center">{t('amount')}</th>
                  <th className="py-3 px-4 text-center">{common('actions')}</th>
                </tr>
              </thead>
              <tbody>
                {orders?.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-100">
                    <td className="py-3 px-24">{order.customerName}</td>
                    <td className="py-3 px-4">
                      {format(
                        new Date(order.orderDate),
                        locale === 'en' ? 'MM/dd/yyyy' : 'dd/MM/yyyy'
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {formatCurrency(locale, order.totalAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={paymentMethods[order.id] || ''}
                        onChange={(e) =>
                          handlePaymentMethodChange(order.id, e.target.value)
                        }
                        className="ml-2 border p-1 text-center rounded"
                      >
                        <option value="">{t('selectPaymentMethod')}</option>
                        {Object.keys(PaymentMethod).map((method) => (
                          <option key={method} value={method}>
                            {t(`${method.toLocaleLowerCase()}`)}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => registerPayment(order.id)}
                        className="text-blue-500 px-3 py-1 rounded hover:text-blue-900 transition"
                      >
                        <FiSave />
                      </button>
                    </td>
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
      <ToastContainer />
    </div>
  );
};

export default PaymentsPage;