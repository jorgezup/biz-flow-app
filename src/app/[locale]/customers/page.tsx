"use client";

import EntityList from '@/app/components/EntityList';
import { Customer } from '@/types';
import { useLocale, useTranslations } from 'next-intl';

const CustomersPage = () => {
  const locale = useLocale();
  const t = useTranslations('common');

  return (
    <EntityList<Customer>
      endpoint="customers"
      entityName="Customer"
      createLink={`/${locale}/customers/new`}
      rowKey={(customer) => customer.customerId}
      columns={[
        { header: 'name', accessor: (customer) => customer.name },
        { header: 'email', accessor: (customer) => customer.email },
        { header: 'phoneNumber', accessor: (customer) => customer.phoneNumber },
        { header: 'address', accessor: (customer) => customer.address },
        {
          header: 'actions',
          accessor: (customer) => (
            <div className="space-x-2">
              <a href={`/${locale}/customers/${customer.customerId}`} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700 transition">
                {t('view')}
              </a>
              <a href={`/${locale}/customers/${customer.customerId}/edit`} className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-700 transition">
                {t('edit')}
              </a>
            </div>
          ),
        },
      ]}
    />
  );
};

export default CustomersPage;





// 'use client';

// import { useEffect, useState } from 'react';
// import { Customer } from '@/types';
// import Link from 'next/link';
// import apiUrl from '@/utils/api';
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useLocale, useTranslations } from 'next-intl'; 

// const CustomersPage = () => {
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);


//   const t = useTranslations('customers');
//   const c = useTranslations('common');
//   const m = useTranslations('messages');
//   const locale = useLocale();

//   useEffect(() => {
//     const fetchCustomers = async () => {
//       try {
//         const response = await fetch(`${apiUrl}/customers`);
//         if (!response.ok) {
//           throw new Error('Failed to fetch customers');
//         }
//         const data: Customer[] = await response.json();
//         setCustomers(data);
//       } catch (error: any) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCustomers();
//   }, []);

//   const filteredCustomers = customers.filter(customer =>
//     customer.name.toLowerCase().includes(searchTerm.toLowerCase())
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
//         <h1 className="text-3xl font-bold text-blue-900">{t('title')}</h1>
//         <Link className="bg-blue-500 text-white p-2 rounded" href={`/${locale}/customers/new`}>
//           {t('createCustomer')}
//         </Link>
//       </div>
//       <input
//         type="text"
//         placeholder={c('searchByName')}
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//         className="mt-2 p-2 border rounded w-full"
//       />
//       {filteredCustomers.length === 0 ? (
//         <div className="text-red-500 mt-4 text-center">{t('noCustomersFound')}</div>
//       ) : (
//         <table className="min-w-full bg-white mt-4">
//           <thead>
//             <tr>
//               <th className="py-2 px-4 border-b border-gray-200">{c('name')}</th>
//               <th className="py-2 px-4 border-b border-gray-200">{t('email')}</th>
//               <th className="py-2 px-4 border-b border-gray-200">{t('phoneNumber')}</th>
//               <th className="py-2 px-4 border-b border-gray-200">{t('address')}</th>
//               <th className="py-2 px-4 border-b border-gray-200">{c('actions')}</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredCustomers.map((customer) => (
//               <tr key={customer.customerId} className="hover:bg-gray-100">
//                 <td className="py-2 px-4 border-b border-gray-200">{customer.name}</td>
//                 <td className="py-2 px-4 border-b border-gray-200">{customer.email}</td>
//                 <td className="py-2 px-4 border-b border-gray-200">{customer.phoneNumber}</td>
//                 <td className="py-2 px-4 border-b border-gray-200">{customer.address}</td>
//                 <td className="py-2 px-4 border-b border-gray-200">
//                   <Link href={`/${locale}/customers/${customer.customerId}`} className="text-blue-500 hover:underline">
//                     {c('view')}
//                   </Link>
//                   <Link href={`/${locale}/customers/${customer.customerId}/edit`} className="text-yellow-500 hover:underline ml-4">
//                     {c('edit')}
//                   </Link>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//       <ToastContainer />
//     </div>
//   );
// };

// export default CustomersPage;
