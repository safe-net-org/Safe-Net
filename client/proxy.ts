import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
	if (request.nextUrl.pathname.startsWith('/api')) {
		return NextResponse.next()
	}

	// Authentication is enforced by the API. Its HttpOnly cookie can be scoped
	// to a separate API host, so a Next.js proxy must not redirect based on an
	// absent frontend cookie.
	return NextResponse.next()
}
export const config = {
	matcher: ['/((?!_next|.*\\..*).*)', '/dashboard/:path*']
}
