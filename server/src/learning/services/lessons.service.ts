import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { CreateLessonBlockDto } from '../dto/create-lesson-block.dto'
import { LessonBlockDto } from '../dto/lesson-block.dto'
import { buildSimulatorContent } from '../answers/simulator-content'
import { LessonDetailsDto } from '../dto/lesson-details.dto'
import { UpdateLessonBlockDto } from '../dto/update-lesson-block.dto'

@Injectable()
export class LessonsService {
	constructor(private readonly prisma: PrismaService) {}

	async getLessonDetails(lessonId: string): Promise<LessonDetailsDto> {
		const lesson = await this.prisma.lesson.findUnique({
			where: { id: lessonId },
			include: {
				course: {
					select: {
						title: true,
						slug: true,
					},
				},
				blocks: {
					orderBy: { order: 'asc' },
				},
				tasks: {
					orderBy: { order: 'asc' },
					include: {
						options: {
							orderBy: { order: 'asc' },
						},
					},
				},
			},
		})

		if (!lesson) throw new NotFoundException('Lesson not found')

		return {
			id: lesson.id,
			courseTitle: lesson.course.title,
			courseSlug: lesson.course.slug,
			order: lesson.order,
			title: lesson.title,
			estimatedDuration: lesson.estimatedDuration,
			blocks: lesson.blocks.map(block => ({
				id: block.id,
				order: block.order,
				type: block.type,
				title: block.title,
				content: block.content,
			})),
			tasks: lesson.tasks.map(task => ({
				id: task.id,
				order: task.order,
				type: task.type,
				title: task.title,
				question: task.question,
				points: task.points,
				difficulty: task.difficulty,
				options: task.options.map(o => ({
					id: o.id,
					text: o.text,
				})),
				...buildSimulatorContent(task.meta),
			})),
		}
	}

	async createBlock(dto: CreateLessonBlockDto): Promise<LessonBlockDto> {
		return await this.prisma.$transaction(async tx => {
			const lesson = await tx.lesson.findUnique({
				where: { id: dto.lessonId },
				include: {
					blocks: true,
					tasks: true,
				},
			})

			if (!lesson) throw new NotFoundException('Lesson not found')

			// Create the block
			const block = await tx.lessonBlock.create({
				data: {
					lessonId: dto.lessonId,
					order: dto.order,
					type: dto.type ?? 'THEORY',
					title: dto.title,
					content: dto.content,
				},
			})

			// Recalculate and update duration
			const newEstimatedDuration = this.calculateEstimatedDuration(
				lesson.blocks.length + 1,
				lesson.tasks.length
			)

			await tx.lesson.update({
				where: { id: dto.lessonId },
				data: {
					estimatedDuration: newEstimatedDuration,
				},
			})

			return {
				id: block.id,
				order: block.order,
				type: block.type,
				title: block.title,
				content: block.content,
			}
		})
	}

	async updateBlock(
		blockId: string,
		dto: UpdateLessonBlockDto
	): Promise<LessonBlockDto> {
		const block = await this.prisma.lessonBlock.findUnique({
			where: { id: blockId },
		})

		if (!block) throw new NotFoundException('Block not found')

		const updated = await this.prisma.lessonBlock.update({
			where: { id: blockId },
			data: dto,
		})

		return {
			id: updated.id,
			order: updated.order,
			type: updated.type,
			title: updated.title,
			content: updated.content,
		}
	}

	async deleteBlock(blockId: string): Promise<void> {
		const block = await this.prisma.lessonBlock.findUnique({
			where: { id: blockId },
		})

		if (!block) throw new NotFoundException('Block not found')

		await this.prisma.lessonBlock.delete({
			where: { id: blockId },
		})
	}

	async getBlocksByLesson(lessonId: string): Promise<LessonBlockDto[]> {
		const lesson = await this.prisma.lesson.findUnique({
			where: { id: lessonId },
		})

		if (!lesson) throw new NotFoundException('Lesson not found')

		const blocks = await this.prisma.lessonBlock.findMany({
			where: { lessonId },
			orderBy: { order: 'asc' },
		})

		return blocks.map(block => ({
			id: block.id,
			order: block.order,
			type: block.type,
			title: block.title,
			content: block.content,
		}))
	}

	private calculateEstimatedDuration(
		blocksCount: number,
		tasksCount: number
	): number {
		const BASE_TIME = 2 // base time per lesson
		const TIME_PER_BLOCK = 2 // 2 minutes per theory block
		const TIME_PER_TASK = 5 // 5 minutes per task

		return BASE_TIME + blocksCount * TIME_PER_BLOCK + tasksCount * TIME_PER_TASK
	}
}
