import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

const publicRoutes = ['/login', '/register']

export async function middleware(request: NextRequest) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isAuthRoute = publicRoutes.includes(request.nextUrl.pathname)

    if (user && isAuthRoute) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    if (!user && !isAuthRoute) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|favicon.ico).*)',
    ],
}
