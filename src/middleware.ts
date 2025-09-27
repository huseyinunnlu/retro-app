import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { getTeamByInviteToken } from './actions/auth'

const publicRoutes = ['/login', '/register']

export async function middleware(request: NextRequest) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isAuthRoute = publicRoutes.includes(request.nextUrl.pathname)
    const url = new URL(request.url)

    // Handle register route with token for logged-in users
    if (user && request.nextUrl.pathname === '/register') {
        const token = url.searchParams.get('token')
        const redirectTo = url.searchParams.get('redirectTo')

        if (token && redirectTo) {
            // Validate the token
            const teamResult = await getTeamByInviteToken(token)

            if (teamResult.data) {
                // Token is valid, redirect to the specified path
                return NextResponse.redirect(new URL(redirectTo, request.url))
            }
        }

        // If no valid token or redirectTo, redirect to dashboard
        return NextResponse.redirect(new URL('/', request.url))
    }

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
