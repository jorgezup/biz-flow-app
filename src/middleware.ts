import {NextRequest, NextResponse} from 'next/server';
import createMiddleware from 'next-intl/middleware';
import {defaultLocale, locales} from './config';

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAppRoute = pathname === '/app' || pathname.startsWith('/app/');

  const intlMiddleware = createMiddleware({
    locales,
    defaultLocale
  });

  if (isAppRoute) {
    // Add a hint that we can read in `i18n.ts`
    request.headers.set('x-app-route', 'true');
    return NextResponse.next({request: {headers: request.headers}});
  } else {
    return intlMiddleware(request);
  }
}

// export const config = {
//   // Match only internationalized pathnames
//   matcher: ['/', '/(pt|en)/:path*', '/app/:path*']
// };
// export const config = {
//   // Match only internationalized pathnames
//   matcher: [
//     '/((?!api|_next/static|_next/image|favicon.ico|apple-touch-icon.png|favicon.svg|images/books|icons|manifest).*)'
//   ]
// };
export const config = {
  matcher: [
     '/((?!api|_next/static|_next/image|favicon.ico|apple-touch-icon.png|favicon.svg|images/books|icons|manifest).*)',
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/([\\w-]+)?/customers/(.+)',
    '/([\\w-]+)?/products/(.+)',
    '/([\\w-]+)?/orders/(.+)',
    '/([\\w-]+)?/sales/(.+)',
    '/([\\w-]+)?/sale-details/(.+)'

  ],
};

// export default createMiddleware({
//   // A list of all locales that are supported
//   locales: ['en', 'pt'],
 
//   // Used when no locale matches
//   defaultLocale: 'en'
// });
 
// export const config = {
//   // Match only internationalized pathnames
//   matcher: ['/', '/(pt|en)/:path*']
// };