import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuth = !!token;
        const isDashboardPage = req.nextUrl.pathname.startsWith('/dashboard');
        const isAdminPage = req.nextUrl.pathname.startsWith('/admin');
        const isAdminSetup = req.nextUrl.pathname.startsWith('/admin-setup');

        // Admin setup page is public — skip all checks
        if (isAdminSetup) return NextResponse.next();

        if (isAdminPage) {
            if (!isAuth) {
                return NextResponse.redirect(new URL('/auth/signin', req.url));
            }
            if (token?.role !== 'admin') {
                // Show a helpful message instead of silent redirect
                const url = new URL('/dashboard', req.url);
                url.searchParams.set('adminDenied', '1');
                return NextResponse.redirect(url);
            }
        }

        if (isDashboardPage && !isAuth) {
            return NextResponse.redirect(new URL('/auth/signin', req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            // Allow the middleware function to run for all matched routes.
            // The authorized callback is mainly used to short-circuit — we handle
            // all logic manually above, so we allow all.
            authorized: () => true,
        },
    }
);

export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*'],
};
