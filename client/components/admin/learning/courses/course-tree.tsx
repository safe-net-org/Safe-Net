'use client'

import { DeleteCourseDialog } from '@/components/admin/learning/courses/delete-course-dialog'

import { ROUTES } from '@/config/pages-url.config'
import { adminService } from '@/services/admin/admin.service'
import {
	Difficulty,
	ICourse,
	IStageWithCourses,
} from '@/services/admin/admin.types'
import { getDifficultyLabel } from '@/services/learning/learning.types'
import { useI18n } from '@/i18n/LocaleProvider'
import { translateStageTitle } from '@/i18n/content-translations'
import { selectPlural } from '@/i18n/plural'
import { AnimatePresence, m } from 'framer-motion'
import { BookOpen, ChevronRight, Trash2 } from '@/components/ui/icons'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { DeleteStageDialog } from './delete-stage-dialog'

interface CourseTreeProps {
	stages: IStageWithCourses[]
	onRefetch: () => void
}

export default function CourseTree({ stages, onRefetch }: CourseTreeProps) {
	const { locale, t } = useI18n()
	const c = t.adminCourseComponents.courseTree
	const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set())
	const [deleteDialog, setDeleteDialog] = useState<{
		open: boolean
		course: ICourse | null
	}>({ open: false, course: null })
	const [deleteStageDialog, setDeleteStageDialog] = useState<{
		open: boolean
		stage: IStageWithCourses | null
	}>({ open: false, stage: null })
	const [hoveredCourse, setHoveredCourse] = useState<string | null>(null)
	const [hoveredStage, setHoveredStage] = useState<string | null>(null)

	const toggleStage = (stageId: string) => {
		const newExpanded = new Set(expandedStages)
		if (newExpanded.has(stageId)) {
			newExpanded.delete(stageId)
		} else {
			newExpanded.add(stageId)
		}
		setExpandedStages(newExpanded)
	}

	const handleDeleteCourse = async () => {
		if (!deleteDialog.course) return
		try {
			await adminService.deleteCourse(deleteDialog.course.id)
			toast.success(c.toasts.courseDeleted)
			onRefetch()
			setDeleteDialog({ open: false, course: null })
		} catch (error) {
			console.error('Delete error:', error)
			toast.error(c.toasts.courseDeleteError)
		}
	}

	const handleDeleteStage = async () => {
		if (!deleteStageDialog.stage) return
		try {
			await adminService.deleteStage(deleteStageDialog.stage.id)
			toast.success(c.toasts.stageDeleted)
			onRefetch()
			setDeleteStageDialog({ open: false, stage: null })
		} catch (error) {
			console.error('Delete stage error:', error)
			toast.error(c.toasts.stageDeleteError)
		}
	}

	const getDifficultyColor = (difficulty: string | undefined) => {
		switch (difficulty) {
			case 'EASY':
				return 'text-green-500'
			case 'MEDIUM':
				return 'text-yellow-500'
			case 'HARD':
				return 'text-red-500'
			default:
				return 'text-gray-500'
		}
	}

	const getCourseWord = (count: number): string => {
		return selectPlural(locale, count, {
			one: c.courseWordOne,
			few: c.courseWordFew,
			many: c.courseWordMany,
		})
	}

	return (
		<>
			<div className="space-y-3">
				{stages.map((stage, stageIndex) => {
					const isExpanded = expandedStages.has(stage.id)
					const coursesCount = stage.courses.length
					const isStageHovered = hoveredStage === stage.id

					return (
						<m.div
							key={stage.id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: stageIndex * 0.03, duration: 0.4 }}
							onHoverStart={() => setHoveredStage(stage.id)}
							onHoverEnd={() => setHoveredStage(null)}
							className="overflow-hidden rounded-[18px] border border-foreground/15 bg-foreground/[0.025] backdrop-blur-xl dark:border-white/[0.08] dark:bg-white/[0.03]"
						>
							{/* Stage Header - buttons are now siblings, not nested */}
							<div className="flex items-center transition-colors duration-200 hover:bg-foreground/[0.035] dark:hover:bg-white/2">
								{/* Toggle Button */}
								<m.button
									onClick={() => toggleStage(stage.id)}
									whileTap={{ scale: 0.995 }}
									className="flex-1 flex items-center gap-4 p-5 transition-all"
								>
									<m.div
										animate={{
											rotate: isExpanded ? 90 : 0,
										}}
										transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
										className="flex-shrink-0"
									>
										<div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/[0.06] dark:bg-white/[0.06]">
											<ChevronRight className="w-4 h-4 text-gray-400" />
										</div>
									</m.div>

									<div className="flex-1 text-left min-w-0">
										<h3 className="mb-0.5 truncate text-base font-semibold text-foreground">
											{translateStageTitle(locale, stage.title)}
										</h3>
										<p className="text-sm text-gray-500 truncate">
											{coursesCount} {getCourseWord(coursesCount)}
										</p>
									</div>
								</m.button>

								{/* Actions - outside the toggle button */}
								<div className="flex items-center gap-3 mr-5">
									{/* Delete Button */}
									<AnimatePresence>
										{isStageHovered && (
											<m.button
												initial={{ opacity: 0, scale: 0.8 }}
												animate={{ opacity: 1, scale: 1 }}
												exit={{ opacity: 0, scale: 0.8 }}
												transition={{ duration: 0.2 }}
												onClick={(e) => {
													e.stopPropagation()
													setDeleteStageDialog({ open: true, stage })
												}}
												whileHover={{ scale: 1.05 }}
												whileTap={{ scale: 0.95 }}
												className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center transition-colors hover:bg-red-500/20"
											>
												<Trash2 className="w-4 h-4 text-red-400" />
											</m.button>
										)}
									</AnimatePresence>

									{/* Stage Number Badge */}
									<div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
										<span className="text-xs font-bold text-purple-400">
											{stageIndex + 1}
										</span>
									</div>
								</div>
							</div>

							{/* Courses List */}
							<AnimatePresence>
								{isExpanded && (
									<m.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: 'auto', opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{
											duration: 0.3,
											ease: [0.4, 0, 0.2, 1],
										}}
										className="overflow-hidden"
									>
										<div className="px-5 pb-5 pt-2 space-y-2">
											{stage.courses.length > 0 ? (
												stage.courses.map((course, courseIndex) => {
													const isHovered = hoveredCourse === course.id

													return (
														<m.div
															key={course.id}
															initial={{ opacity: 0, x: -10 }}
															animate={{ opacity: 1, x: 0 }}
															transition={{
																delay: courseIndex * 0.03,
																duration: 0.3,
															}}
															onHoverStart={() => setHoveredCourse(course.id)}
															onHoverEnd={() => setHoveredCourse(null)}
														>
															<Link
																href={`${ROUTES.ADMIN.LEARNING.COURSES}/${course.id}/edit`}
															>
																<m.div
																	whileHover={{ x: 2 }}
																	whileTap={{ scale: 0.995 }}
																	className={`
                                    rounded-[14px] border bg-foreground/[0.035] p-4 transition-all duration-200
                                    dark:bg-white/[0.03]
                                    ${
																			isHovered
																				? 'border-foreground/20 bg-foreground/[0.06] dark:border-white/[0.12] dark:bg-white/[0.05]'
																				: 'border-foreground/10 dark:border-white/[0.06]'
																		}
                                  `}
																>
																	<div className="flex items-center gap-3">
																		<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/15 to-cyan-500/15 flex items-center justify-center flex-shrink-0 border border-blue-500/10">
																			<BookOpen className="w-5 h-5 text-blue-400" />
																		</div>

																		<div className="flex-1 min-w-0">
																			<h4 className="mb-1 truncate text-[15px] font-semibold text-foreground">
																				{course.title}
																			</h4>
																			<div className="flex items-center gap-2 text-xs">
																				<span
																					className={`font-medium ${getDifficultyColor(
																						course.difficulty,
																					)}`}
																				>
																					{
																	getDifficultyLabel(
																		course.difficulty || Difficulty.EASY,
																		t.dashboardLessonDetail.difficulty
																	)
																					}
																				</span>
																			</div>
																		</div>
																	</div>
																</m.div>
															</Link>
														</m.div>
													)
												})
											) : (
												<m.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													className="rounded-[14px] border border-dashed border-foreground/15 px-4 py-10 text-center dark:border-white/[0.08]"
												>
													<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-foreground/[0.04] dark:bg-white/[0.03]">
														<BookOpen className="w-6 h-6 text-gray-600" />
													</div>
													<p className="text-sm text-gray-500">
														{c.emptyStage}
													</p>
												</m.div>
											)}
										</div>
									</m.div>
								)}
							</AnimatePresence>
						</m.div>
					)
				})}
			</div>

			<DeleteCourseDialog
				open={deleteDialog.open}
				onOpenChange={(open) =>
					!open && setDeleteDialog({ open: false, course: null })
				}
				courseTitle={deleteDialog.course?.title ?? ''}
				lessonsCount={deleteDialog.course?.lessons?.length ?? 0}
				onConfirm={handleDeleteCourse}
			/>

			<DeleteStageDialog
				open={deleteStageDialog.open}
				onOpenChange={(open) =>
					!open && setDeleteStageDialog({ open: false, stage: null })
				}
				stageTitle={
					deleteStageDialog.stage
						? translateStageTitle(locale, deleteStageDialog.stage.title)
						: ''
				}
				coursesCount={deleteStageDialog.stage?.courses.length ?? 0}
				onConfirm={handleDeleteStage}
			/>
		</>
	)
}
