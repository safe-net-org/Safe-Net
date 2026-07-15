import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { AchievementsController } from './controllers/achievements.controller'
import { CertificatesController } from './controllers/certificates.controller'
import { CoursesController } from './controllers/courses.controller'
import { ProgressController } from './controllers/progress.controller'
import { StagesController } from './controllers/stages.controller'
import { TestsController } from './controllers/tests.controller'
import { AchievementStatsCollector } from './achievements/achievement-stats.collector'
import { AchievementsService } from './services/achievements.service'
import { CertificatesService } from './services/certificates.service'
import { CoursesService } from './services/courses.service'
import { ProgressService } from './services/progress.service'
import { StagesService } from './services/stages.service'
import { TestsService } from './services/tests.service'

@Module({
	controllers: [
		StagesController,
		CoursesController,
		TestsController,
		ProgressController,
		CertificatesController,
		AchievementsController,
	],
	providers: [
		PrismaService,
		StagesService,
		CoursesService,
		TestsService,
		ProgressService,
		CertificatesService,
		AchievementsService,
		AchievementStatsCollector,
	],
	exports: [
		StagesService,
		CoursesService,
		ProgressService,
		AchievementsService,
	],
})
export class LearningModule {}
