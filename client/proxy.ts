import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
	if (request.nextUrl.pathname.startsWith('/api')) {
		return NextResponse.next()
	}
	const token = request.cookies.get('accessToken')?.value
	const protectedPaths = ['/dashboard']
	const pathname = request.nextUrl.pathname
	const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

	if (isProtectedPath && !token) {
		return NextResponse.redirect(new URL('/', request.url))
	}

	// This proxy is only a navigation hint. Signature, expiry, token type, and
	// user status are authoritatively verified by the API. Shipping the API's
	// signing secret to the web runtime—or inventing a fallback secret here—
	// would create a second, divergent security boundary.
	return NextResponse.next()
}
export const config = {
	matcher: ['/((?!_next|.*\\..*).*)', '/dashboard/:path*']
}
