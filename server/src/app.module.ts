import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { AdminModule } from './admin/admin.module'
import { AuthModule } from './auth/auth.module'
import { FeedbackModule } from './feedback/feedback.module'
import { LearningModule } from './learning/learning.module'
import { PublicModule } from './public/public.module'
import { UserModule } from './user/user.module'

const ONE_MINUTE_MS = 60_000
const REQUESTS_PER_MINUTE = 120

@Module({
	imports: [
		ConfigModule.forRoot(),
		// Baseline limit for every endpoint; auth endpoints tighten it further
		// with their own @Throttle. Before this there was no rate limiting at
		// all, so /api/auth/login could be brute-forced freely.
		ThrottlerModule.forRoot([
			{ ttl: ONE_MINUTE_MS, limit: REQUESTS_PER_MINUTE },
		]),
		AuthModule,
		FeedbackModule,
		UserModule,
		LearningModule,
		AdminModule,
		PublicModule
	],
	providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]
})
export class AppModule {}
