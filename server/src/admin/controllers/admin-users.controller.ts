import { Body, Controller, Get, Param, Put } from '@nestjs/common'
import { Role } from '@prisma/client'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { AdminUpdateUserDto } from '../dto/update-user.dto'
import { AdminUsersService } from '../services/admin-users.service'

// `@Auth(Role.ADMIN)` rather than `@Auth()` + a separate `@Roles(Role.ADMIN)`:
// decorators apply bottom-up, so @Auth()'s own Roles(Role.USER) overwrote the
// class-level @Roles(Role.ADMIN) underneath it and left the admin API open to
// every logged-in user. Passing the role to Auth is the one place it cannot be
// clobbered.
@Controller('admin/users')
@Auth(Role.ADMIN)
export class AdminUsersController {
	constructor(private readonly adminUsersService: AdminUsersService) {}
	@Get()
	async getUsers() {
		return this.adminUsersService.getUsers()
	}
	@Get(':id')
	async getUser(@Param('id') id: string) {
		return this.adminUsersService.getUserById(id)
	}
	@Put(':id')
	async updateUser(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
		return this.adminUsersService.updateUser(id, dto)
	}
}
