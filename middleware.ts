import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(pt|en)/:path*', '/((?!api|admin|render-slide|render-veu|render-reel-mae|_next|_vercel|.*\\..*).*)'],
};
