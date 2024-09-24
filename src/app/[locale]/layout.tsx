import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getNow, getTimeZone, getMessages } from 'next-intl/server';
import ClientRootLayout from './clientRootLayout';
import './styles/globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BizFlow - Manage your business with ease',
  description:
    'A business management system that allows you to manage customers, products, sales and customer preferences in an easy and fast way.',
};

export default async function RootLayout({ children }: any) {
  const locale = await getLocale();
  const now = await getNow();
  const timeZone = await getTimeZone();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="flex flex-col min-h-screen">
        <NextIntlClientProvider
          locale={locale}
          now={now}
          timeZone={timeZone}
          messages={messages}
        >
          <ClientRootLayout>
            {children}
          </ClientRootLayout>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}


