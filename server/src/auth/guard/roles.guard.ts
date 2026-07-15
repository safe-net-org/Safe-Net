import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role, User } from '@prisma/client'
import { Request } from 'express'

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		// getAllAndOverride, not get(getHandler()): the previous version read
		// method metadata only, so every controller that declared @Roles(ADMIN)
		// at the *class* level — the entire admin API — resolved to `undefined`
		// and fell through to "no roles required, allow everyone". Any logged-in
		// user could list, block and re-role accounts.
		const roles = this.reflector.getAllAndOverride<Role[]>('roles', [
			context.getHandler(),
			context.getClass(),
		])

		if (!roles || roles.length === 0) {
			return true
		}

		const request = context.switchToHttp().getRequest<Request>()
		const user = request.user as User | undefined

		// Missing user means this guard ran without JwtAuthGuard ahead of it.
		// Denying is the only safe reading of "role required, identity unknown".
		if (!user?.rights) {
			throw new ForbiddenException('You do not have permission!')
		}

		const hasRole = user.rights.some(role => roles.includes(role))
		if (!hasRole) {
			throw new ForbiddenException('You do not have permission!')
		}

		return true
	}
}
