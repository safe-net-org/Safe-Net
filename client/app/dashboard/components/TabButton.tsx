import { cn } from '@/lib/utils'
import { memo, type MouseEventHandler, type ReactNode } from 'react'

interface TabButtonProps {
	active: boolean
	onClick: MouseEventHandler<HTMLButtonElement>
	children: ReactNode
}

export const TabButton = memo(({ active, onClick, children }: TabButtonProps) => {
	return (
		<button
			type='button'
			onClick={onClick}
			className={cn(
				'relative px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-300',
				active ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
			)}
		>
			{active && <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-xl" />}
			<span className="relative z-10 flex items-center">{children}</span>
		</button>
	)
})
TabButton.displayName = 'TabButton'
