import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

const Sidebar = ({ isOpen }: { isOpen: boolean }) => {
  const t = useTranslations('sidebar');
  const locale = useLocale();

  return (
    <div className={`w-64 h-auto bg-blue-900 text-white sidebar ${isOpen ? 'block' : 'hidden'} md:block`}>
      <div className="flex flex-col items-center p-4">
        <div className="flex justify-between w-full">
          <div className="flex items-center text-xl font-bold">
            <Link href={`/${locale}`}>{t('title')}</Link>
          </div>
          <div className="flex justify-start space-x-2">
            <Link href={`/en`} locale="en" className={`p-2 ${locale === 'en' ? 'border-b-2 border-white' : 'hover:border-b-2 border-white transition duration-500 ease-in-out'}`}>
              <span className="text-xs">en</span>
            </Link>
            <Link href={`/pt-br`} locale="pt-br" className={`p-2 ${locale === 'pt-br' ? 'border-b-2 border-white' : 'hover:border-b-2 border-white transition duration-500 ease-in-out'}`}>
              <span className="text-xs">pt-br</span>
            </Link>
          </div>
        </div>
      </div>
      <hr className="border-t border-gray-400" />
      <nav className="mt-4">
        <ul>
          <li className="mb-4">
            <Link href={`/${locale}/customers`} locale={locale} className="block p-4 rounded transition duration-500 ease-in-out hover:bg-blue-800">
              {t('customers')}
            </Link>
          </li>
          <li className="mb-4">
            <Link href={`/${locale}/products`} locale={locale} className="block p-4 rounded transition duration-500 ease-in-out hover:bg-blue-800">
              {t('products')}
            </Link>
          </li>
          <li className="mb-4">
            <Link href={`/${locale}/orders`} locale={locale} className="block p-4 rounded transition duration-500 ease-in-out hover:bg-blue-800">
              {t('orders')}
            </Link>
          </li>
          <li className="mb-4">
            <Link href={`/${locale}/sales`} locale={locale} className="block p-4 rounded transition duration-500 ease-in-out hover:bg-blue-800">
              {t('sales')}
            </Link>
          </li>
          <li className="mb-4">
            <Link href={`/${locale}/payments`} locale={locale} className="block p-4 rounded transition duration-500 ease-in-out hover:bg-blue-800">
              {t('payments')}
            </Link>
          </li>
          <li className="mb-4">
            <Link href={`/${locale}/invoices`} locale={locale} className="block p-4 rounded transition duration-500 ease-in-out hover:bg-blue-800">
              {t('invoices')}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
