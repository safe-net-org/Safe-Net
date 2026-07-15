'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Markdown } from '@/components/ui/markdown'
import { cn } from '@/lib/utils'
import {
	ILesson,
	ITaskAnswerResponse,
} from '@/services/learning/learning.types'
import { m } from 'framer-motion'
import { BookOpen, CheckCircle2, PlayCircle, Target } from 'lucide-react'
import { useState } from 'react'
import { AnswerPayload, TaskModal } from './TaskModal'

interface AppleLessonDetailProps {
	lesson: ILesson & { courseTitle: string }
	answerTask: (
		taskId: string,
		payload: AnswerPayload
	) => Promise<ITaskAnswerResponse>
	isAnswering: boolean
	hasNextLesson?: boolean
	hasPrevLesson?: boolean
	onNextLesson?: () => void
	onPrevLesson?: () => void
}

export function AppleLessonDetail({
	lesson,
	answerTask,
	isAnswering,
	hasNextLesson = false,
	hasPrevLesson = false,
	onNextLesson,
	onPrevLesson,
}: AppleLessonDetailProps) {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [currentTaskIndex, setCurrentTaskIndex] = useState(0)

	const tasks = lesson.tasks || []
	const blocks = lesson.blocks || []
	const completed = tasks.filter(t => t.completed).length
	const total = tasks.length

	const handleOpenTask = (taskIndex: number) => {
		setCurrentTaskIndex(taskIndex)
		setIsModalOpen(true)
	}

	return (
		<>
			<div className='space-y-4 sm:space-y-5'>
				{/* ✅ THEORY: Content blocks */}
				{blocks.length > 0 && (
					<m.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.1 }}
					>
						<Card className='bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden'>
							<CardContent className='p-5 sm:p-6 lg:p-8 space-y-5'>
								<div className='flex items-center gap-3'>
									<div className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-linear-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center shadow-xl'>
										<BookOpen className='w-5 h-5 sm:w-6 sm:h-6' />
									</div>
									<div>
										<h3 className='text-base sm:text-lg lg:text-xl font-black text-white'>
											Theory material
										</h3>
										<p className='text-xs sm:text-sm text-white/60'>
											{blocks.length}{' '}
											{blocks.length === 1 ? 'block' : 'blocks'} to study
										</p>
									</div>
								</div>

								<div className='space-y-4'>
									{blocks.map((block, idx) => (
										<div
											key={block.id}
											className='rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 space-y-3'
										>
											{block.title && (
												<div className='flex items-start gap-3'>
													<div className='w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/10 text-white flex items-center justify-center text-xs sm:text-sm font-bold'>
														{idx + 1}
													</div>
													<h4 className='text-sm sm:text-base font-bold text-white flex-1'>
														{block.title}
													</h4>
												</div>
											)}

											<div className='prose prose-invert prose-sm sm:prose-base max-w-none'>
												<Markdown className='text-xs sm:text-sm text-white/80 leading-relaxed'>
													{block.content}
												</Markdown>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</m.div>
				)}

				{/* ✅ PRACTICE: Tasks */}
				{tasks.length > 0 && (
					<m.div
						initial={{ opacity: 0, y: 12 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.15 }}
					>
						<Card className='bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden hover:border-white/20 transition-all duration-500'>
							<CardContent className='p-5 sm:p-6 lg:p-8 space-y-5'>
								<div className='flex items-center gap-3'>
									<div className='w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-linear-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-xl'>
										<Target className='w-5 h-5 sm:w-6 sm:h-6' />
									</div>
									<div>
										<h3 className='text-base sm:text-lg lg:text-xl font-black text-white'>
											Practice tasks
										</h3>
										<p className='text-xs sm:text-sm text-white/60'>
											{completed}/{total}{' '}
											{total === 1 ? 'task' : 'tasks'} completed
										</p>
									</div>
								</div>

								<div className='space-y-2.5 sm:space-y-3'>
									{tasks.map((task: any, taskIdx: number) => (
										<button
											key={task.id}
											type='button'
											onClick={() => handleOpenTask(taskIdx)}
											className='w-full flex items-center justify-between rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 px-3.5 sm:px-4 py-3 sm:py-3.5 text-left group'
										>
											<div className='flex items-center gap-3 min-w-0 flex-1'>
												<div className='w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/10 text-white flex items-center justify-center text-xs sm:text-sm font-bold'>
													{taskIdx + 1}
												</div>
												<div className='min-w-0 flex-1'>
													<span className='text-sm sm:text-base text-white font-medium block truncate'>
														{task.title}
													</span>
													<div className='flex items-center gap-2 mt-1'>
														<Badge className='bg-white/5 border-white/10 text-white/60 text-[10px] sm:text-xs px-2 py-0.5 rounded-md'>
															{task.points} XP
														</Badge>
														<Badge
															className={cn(
																'text-[10px] sm:text-xs px-2 py-0.5 rounded-md',
																task.difficulty === 'EASY' &&
																	'bg-green-500/10 border-green-500/20 text-green-400',
																task.difficulty === 'MEDIUM' &&
																	'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
																task.difficulty === 'HARD' &&
																	'bg-red-500/10 border-red-500/20 text-red-400'
															)}
														>
															{task.difficulty === 'EASY' && 'Easy'}
															{task.difficulty === 'MEDIUM' && 'Medium'}
															{task.difficulty === 'HARD' && 'Hard'}
														</Badge>
													</div>
												</div>
											</div>
											<div className='flex items-center gap-2'>
												{task.completed ? (
													<CheckCircle2 className='w-5 h-5 sm:w-6 sm:h-6 text-emerald-400' />
												) : (
													<PlayCircle className='w-5 h-5 sm:w-6 sm:h-6 text-white/50 group-hover:text-white/70 transition-colors' />
												)}
											</div>
										</button>
									))}
								</div>
							</CardContent>
						</Card>
					</m.div>
				)}

				{/* No content */}
				{blocks.length === 0 && tasks.length === 0 && (
					<Card className='bg-white/3 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl text-center p-8 sm:p-10 lg:p-12'>
						<div className='w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 sm:mb-6 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl flex items-center justify-center border border-white/20 shadow-lg'>
							<BookOpen className='w-8 h-8 sm:w-10 sm:h-10 text-white/30' />
						</div>
						<h3 className='text-base sm:text-lg lg:text-xl font-black text-white mb-2 sm:mb-3'>
							Lesson materials are being prepared
						</h3>
						<p className='text-xs sm:text-sm text-white/60 max-w-md mx-auto leading-relaxed'>
							Theory and tasks for this lesson will be added soon.
						</p>
					</Card>
				)}
			</div>

			{tasks.length > 0 && (
				<TaskModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					tasks={tasks}
					currentTaskIndex={currentTaskIndex}
					onTaskChange={setCurrentTaskIndex}
					lessonId={lesson.id}
					courseSlug={lesson.courseSlug}
					hasNextLesson={hasNextLesson}
					hasPrevLesson={hasPrevLesson}
					onNextLesson={onNextLesson}
					onPrevLesson={onPrevLesson}
					answerTask={answerTask}
					isAnswering={isAnswering}
				/>
			)}
		</>
	)
}
