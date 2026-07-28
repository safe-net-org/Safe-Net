import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { RolesGuard } from 'src/auth/guard/roles.guard'
import { PrismaService } from 'src/prisma.service'
import { AdminFeedbackController } from './admin-feedback.controller'
import { FeedbackController } from './feedback.controller'
import { FeedbackService } from './feedback.service'

@Module({
	imports: [AuthModule],
	controllers: [FeedbackController, AdminFeedbackController],
	providers: [FeedbackService, PrismaService, RolesGuard],
	exports: [FeedbackService],
})
export class FeedbackModule {}
