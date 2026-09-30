import { Type } from 'class-transformer'
import {
	IsArray,
	ArrayMaxSize,
	IsIn,
	IsInt,
	Min,
	MinLength,
	IsOptional,
	IsString,
	MaxLength,
	ValidateNested,
} from 'class-validator'

const RED_FLAG_LOCATIONS = ['from', 'subject', 'body', 'url', 'page'] as const
const MAX_SELECTION_LENGTH = 200

export class SelectedSpanDto {
	@IsIn(RED_FLAG_LOCATIONS)
	location: (typeof RED_FLAG_LOCATIONS)[number]

	@IsString()
	@MinLength(1)
	@MaxLength(MAX_SELECTION_LENGTH)
	text: string

	@IsInt()
	@Min(0)
	start: number

	@IsInt()
	@Min(1)
	end: number
}

export class AnswerTaskDto {
	@IsArray()
	@IsString({ each: true })
	selectedOptionIds: string[] = []

	@IsOptional()
	@IsString()
	textAnswer?: string

	/**
	 * What the learner highlighted in a PHISHING_EMAIL / PHISHING_SITE
	 * simulator, as raw text, source offsets, and which field it came from.
	 *
	 * Not red flag ids: the client is never sent the id list, because that list
	 * is the answer key.
	 */
	@IsOptional()
	@IsArray()
	@ArrayMaxSize(30)
	@ValidateNested({ each: true })
	@Type(() => SelectedSpanDto)
	selectedSpans?: SelectedSpanDto[]
}
