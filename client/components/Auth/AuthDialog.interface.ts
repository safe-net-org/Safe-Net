import { ReactNode } from 'react'


export interface IAuthDialog {
	triggerButton?: {
		text: string
		className?: string
		icon?: ReactNode
		position?: 'start' | 'end'
		smoothMotion?: boolean
	}
	dialogSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
	title?: string
	description?: string
	showNameField?: boolean
	children?: ReactNode
}
