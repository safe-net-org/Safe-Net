import { Type } from 'class-transformer'
import {
	IsArray,
	IsNotEmpty,
	IsInt,
	Max,
	Min,
	IsOptional,
	IsString,
	ValidateNested,
} from 'class-validator'

class AnswerItemDto {
	@IsString()
	@IsNotEmpty()
	questionId: string

	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	selectedOptionIds?: string[]

	@IsOptional()
	@IsString()
	textAnswer?: string
}
export class SubmitTestDto {
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => AnswerItemDto)
	answers: AnswerItemDto[]

	@IsInt()
	@Min(0)
	@Max(86400)
	time: number
}
