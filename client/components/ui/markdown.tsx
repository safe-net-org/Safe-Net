import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownProps {
	children: string
	className?: string
}

export function Markdown({ children, className }: MarkdownProps) {
	return (
		<div
			className={cn(
				'prose prose-invert prose-sm sm:prose-base max-w-none',
				// Headings
				'prose-headings:font-black prose-headings:text-white prose-headings:tracking-tight',
				'prose-h1:text-2xl sm:prose-h1:text-3xl',
				'prose-h2:text-xl sm:prose-h2:text-2xl',
				'prose-h3:text-lg sm:prose-h3:text-xl',
				// Paragraphs
				'prose-p:text-white/80 prose-p:leading-relaxed prose-p:mb-4',
				// Bold and italic
				'prose-strong:text-white prose-strong:font-bold',
				'prose-em:text-white/90 prose-em:italic',
				// Lists
				'prose-ul:text-white/80 prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2',
				'prose-ol:text-white/80 prose-ol:list-decimal prose-ol:pl-6 prose-ol:space-y-2',
				'prose-li:text-white/80',
				// Links
				'prose-a:text-blue-400 prose-a:underline prose-a:decoration-blue-400/30',
				'hover:prose-a:text-blue-300 hover:prose-a:decoration-blue-300/50',
				// Code
				'prose-code:text-emerald-400 prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[""] prose-code:after:content-[""]',
				'prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl',
				// Quotes
				'prose-blockquote:border-l-4 prose-blockquote:border-blue-400/30 prose-blockquote:pl-4',
				'prose-blockquote:text-white/70 prose-blockquote:italic',
				className
			)}
		>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					h1: ({ children }) => (
						<h1 className='text-2xl sm:text-3xl font-black text-white mb-4 tracking-tight'>
							{children}
						</h1>
					),
					h2: ({ children }) => (
						<h2 className='text-xl sm:text-2xl font-black text-white mb-3 tracking-tight'>
							{children}
						</h2>
					),
					h3: ({ children }) => (
						<h3 className='text-lg sm:text-xl font-bold text-white mb-2'>
							{children}
						</h3>
					),
					p: ({ children }) => (
						<p className='text-sm sm:text-base text-white/80 leading-relaxed mb-4'>
							{children}
						</p>
					),
					strong: ({ children }) => (
						<strong className='font-bold text-white'>{children}</strong>
					),
					ul: ({ children }) => (
						<ul className='list-disc pl-6 space-y-2 text-sm sm:text-base text-white/80 mb-4'>
							{children}
						</ul>
					),
					ol: ({ children }) => (
						<ol className='list-decimal pl-6 space-y-2 text-sm sm:text-base text-white/80 mb-4'>
							{children}
						</ol>
					),
					li: ({ children }) => <li className='text-white/80'>{children}</li>,
						code: ({ children, className: codeClassName }) =>
							!codeClassName ? (
							<code className='text-emerald-400 bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono'>
								{children}
							</code>
						) : (
							<pre className='bg-white/5 border border-white/10 rounded-xl p-4 overflow-x-auto'>
								<code className='text-emerald-400 text-sm font-mono'>
									{children}
								</code>
							</pre>
						),
					blockquote: ({ children }) => (
						<blockquote className='border-l-4 border-blue-400/30 pl-4 text-white/70 italic my-4'>
							{children}
						</blockquote>
					),
					a: ({ children, href }) => (
						<a
							href={href}
							target='_blank'
							rel='noopener noreferrer'
							className='text-blue-400 underline decoration-blue-400/30 hover:text-blue-300 hover:decoration-blue-300/50 transition-colors'
						>
							{children}
						</a>
					),
				}}
			>
				{children}
			</ReactMarkdown>
		</div>
	)
}
