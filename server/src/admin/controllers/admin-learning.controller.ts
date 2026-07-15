import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    Patch,
    Post,
    Put,
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CreateBlockDto } from '../dto/create-block.dto'
import { CreateCourseDto } from '../dto/create-course.dto'
import { CreateLessonDto } from '../dto/create-lesson.dto'
import { CreateStageDto } from '../dto/create-stage.dto'
import { CreateTaskDto } from '../dto/create-task.dto'
import { CreateTestDto } from '../dto/create-test.dto'
import { AdminLearningService } from '../services/admin-learning.service'

@Controller('admin/learning')
@Auth(Role.ADMIN)
export class AdminLearningController {
	constructor(private readonly adminLearningService: AdminLearningService) {}

	// ==================== COURSES ====================
	@Get('courses/list')
	async getCoursesList() {
		return this.adminLearningService.getCoursesList()
	}

	@Get('courses/:id')
	async getCourse(@Param('id') id: string) {
		return this.adminLearningService.getCourse(id)
	}

	@HttpCode(200)
	@Post('courses')
	async createCourse(@Body() dto: CreateCourseDto) {
		return this.adminLearningService.createCourse(dto)
	}

	@Put('courses/:id')
	async updateCourse(@Param('id') id: string, @Body() dto: any) {
		return this.adminLearningService.updateCourse(id, dto)
	}

	@Delete('courses/:id')
	async deleteCourse(@Param('id') id: string) {
		return this.adminLearningService.deleteCourse(id)
	}

	// ==================== LESSONS ====================
	@Get('lessons/:id')
	async getLesson(@Param('id') id: string) {
		return this.adminLearningService.getLesson(id)
	}

	@HttpCode(200)
	@Post('lessons')
	async createLesson(@Body() dto: CreateLessonDto) {
		return this.adminLearningService.createLesson(dto)
	}

	@Put('lessons/:id')
	async updateLesson(@Param('id') id: string, @Body() dto: any) {
		return this.adminLearningService.updateLesson(id, dto)
	}

	@Delete('lessons/:id')
	async deleteLesson(@Param('id') id: string) {
		return this.adminLearningService.deleteLesson(id)
	}

	// ==================== BLOCKS ====================
	@HttpCode(200)
	@Post('blocks')
	async createBlock(@Body() dto: CreateBlockDto) {
		return this.adminLearningService.createBlock(dto)
	}

	@Patch('blocks/:id')
	async updateBlock(@Param('id') id: string, @Body() dto: Partial<CreateBlockDto>) {
		return this.adminLearningService.updateBlock(id, dto)
	}

	@Delete('blocks/:id')
	async deleteBlock(@Param('id') id: string) {
		return this.adminLearningService.deleteBlock(id)
	}

	// ==================== TASKS ====================
	@HttpCode(200)
	@Post('tasks')
	async createTask(@Body() dto: CreateTaskDto) {
		return this.adminLearningService.createTask(dto)
	}

	@Put('tasks/:id')
	async updateTask(@Param('id') id: string, @Body() dto: any) {
		return this.adminLearningService.updateTask(id, dto)
	}

	@Delete('tasks/:id')
	async deleteTask(@Param('id') id: string) {
		return this.adminLearningService.deleteTask(id)
	}

	// ==================== TESTS ====================
	@Get('tests')
	async getTests() {
		return this.adminLearningService.getTests()
	}

	@Get('tests/:id')
	async getTest(@Param('id') id: string) {
		return this.adminLearningService.getTest(id)
	}

	@HttpCode(200)
	@Post('tests')
	async createTest(@Body() dto: CreateTestDto) {
		return this.adminLearningService.createTest(dto)
	}

	@Put('tests/:id')
	async updateTest(@Param('id') id: string, @Body() dto: any) {
		return this.adminLearningService.updateTest(id, dto)
	}

	@Delete('tests/:id')
	async deleteTest(@Param('id') id: string) {
		return this.adminLearningService.deleteTest(id)
	}

	// ==================== TEST QUESTIONS ====================
	@HttpCode(200)
	@Post('tests/questions')
	async createTestQuestion(@Body() dto: any) {
		return this.adminLearningService.createTestQuestion(dto)
	}

	@Put('tests/questions/:id')
	async updateTestQuestion(@Param('id') id: string, @Body() dto: any) {
		return this.adminLearningService.updateTestQuestion(id, dto)
	}

	@Delete('tests/questions/:id')
	async deleteTestQuestion(@Param('id') id: string) {
		return this.adminLearningService.deleteTestQuestion(id)
	}

	// ==================== STAGES ====================
	@Get('stages')
	async getStages() {
		return this.adminLearningService.getStages()
	}

	@Get('stages/:id')
	async getStage(@Param('id') id: string) {
		return this.adminLearningService.getStage(id)
	}

	@HttpCode(200)
	@Post('stages')
	async createStage(@Body() dto: CreateStageDto) {
		return this.adminLearningService.createStage(dto)
	}

	@Put('stages/:id')
	async updateStage(@Param('id') id: string, @Body() dto: Partial<CreateStageDto>) {
		return this.adminLearningService.updateStage(id, dto)
	}

	@Delete('stages/:id')
	async deleteStage(@Param('id') id: string) {
		return this.adminLearningService.deleteStage(id)
	}
}
