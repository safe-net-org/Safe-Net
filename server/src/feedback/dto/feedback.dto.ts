import { FeedbackStatus } from '@prisma/client'
import { Transform, Type } from 'class-transformer'
import {
	IsBoolean,
	IsEnum,
	IsInt,
	IsOptional,
	IsString,
	Max,
	MaxLength,
	Min,
	MinLength,
} from 'class-validator'

export class CreateFeedbackDto {
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(5)
	rating: number

	@IsString()
	@Transform(({ value }) =>
		typeof value === 'string' ? value.trim() : value
	)
	@MinLength(10)
	@MaxLength(2000)
	message: string

	@IsOptional()
	@IsString()
	@Transform(({ value }) =>
		typeof value === 'string' ? value.trim() : value
	)
	@MaxLength(200)
	sourcePage?: string
}

export class AdminFeedbackQueryDto {
	@IsOptional()
	@IsEnum(FeedbackStatus)
	status?: FeedbackStatus

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(5)
	rating?: number

	@IsOptional()
	@Transform(({ value }) =>
		value === 'true' ? true : value === 'false' ? false : value
	)
	@IsBoolean()
	featured?: boolean

	@IsOptional()
	@IsString()
	@MaxLength(200)
	search?: string

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page = 1

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit = 20
}

export class UpdateFeedbackDto {
	@IsOptional()
	@IsEnum(FeedbackStatus)
	status?: FeedbackStatus

	@IsOptional()
	@IsBoolean()
	featured?: boolean
}
