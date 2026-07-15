import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role } from '@prisma/client'
import { RolesGuard } from './roles.guard'

/**
 * Regression tests for the privilege-escalation bug this guard shipped with:
 * it read role metadata from the handler only, so every admin controller —
 * which declares @Roles at the class level — resolved to "no roles required"
 * and let any authenticated user through.
 */
function buildContext(user: unknown): ExecutionContext {
	return {
		switchToHttp: () => ({ getRequest: () => ({ user }) }),
		getHandler: () => function handler() {},
		getClass: () => class Controller {},
	} as unknown as ExecutionContext
}

describe('RolesGuard', () => {
	const plainUser = { rights: [Role.USER] }
	const adminUser = { rights: [Role.ADMIN, Role.USER] }

	function guardWith(roles: Role[] | undefined, source: 'class' | 'handler') {
		const reflector = new Reflector()
		jest
			.spyOn(reflector, 'getAllAndOverride')
			.mockImplementation(() => roles as never)
		void source
		return new RolesGuard(reflector)
	}

	it('blocks a plain user from a class-level ADMIN route', () => {
		const guard = guardWith([Role.ADMIN], 'class')
		expect(() => guard.canActivate(buildContext(plainUser))).toThrow(
			ForbiddenException
		)
	})

	it('allows an admin through a class-level ADMIN route', () => {
		const guard = guardWith([Role.ADMIN], 'class')
		expect(guard.canActivate(buildContext(adminUser))).toBe(true)
	})

	it('allows a plain user through a USER route', () => {
		const guard = guardWith([Role.USER], 'handler')
		expect(guard.canActivate(buildContext(plainUser))).toBe(true)
	})

	it('allows anyone when no roles are declared', () => {
		const guard = guardWith(undefined, 'handler')
		expect(guard.canActivate(buildContext(plainUser))).toBe(true)
	})

	it('denies when a role is required but no user is attached', () => {
		const guard = guardWith([Role.ADMIN], 'class')
		expect(() => guard.canActivate(buildContext(undefined))).toThrow(
			ForbiddenException
		)
	})

	it('denies a user whose rights are missing entirely', () => {
		const guard = guardWith([Role.ADMIN], 'class')
		expect(() => guard.canActivate(buildContext({}))).toThrow(
			ForbiddenException
		)
	})
})
