import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Patch,
	Post,
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { CreateLessonBlockDto } from '../dto/create-lesson-block.dto'
import { UpdateLessonBlockDto } from '../dto/update-lesson-block.dto'
import { LessonsService } from '../services/lessons.service'

// `GET :id` used to live here too, duplicating ProgressController's
// `GET learning/lessons/:id`. Both matched the same path, ProgressController
// won, and this one was dead code that silently diverged — a fix applied here
// had no effect on the route the client actually calls.
@Auth()
@Controller('learning/lessons')
export class LessonsController {
	constructor(private readonly lessonsService: LessonsService) {}

	@Get(':id/blocks')
	async getBlocks(@Param('id') lessonId: string) {
		return this.lessonsService.getBlocksByLesson(lessonId)
	}

	@HttpCode(200)
	@Post('blocks')
	@Roles(Role.ADMIN)
	async createBlock(@Body() dto: CreateLessonBlockDto) {
		return this.lessonsService.createBlock(dto)
	}

	@Patch('blocks/:id')
	@Roles(Role.ADMIN)
	async updateBlock(
		@Param('id') id: string,
		@Body() dto: UpdateLessonBlockDto
	) {
		return this.lessonsService.updateBlock(id, dto)
	}

	@Delete('blocks/:id')
	@Roles(Role.ADMIN)
	async deleteBlock(@Param('id') id: string) {
		await this.lessonsService.deleteBlock(id)
		return { message: 'Block deleted successfully' }
	}
}
