'use client'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/config/pages-url.config'
import { useI18n } from '@/i18n/LocaleProvider'
import { selectPlural } from '@/i18n/plural'
import { cn } from '@/lib/utils'
import { ITest } from '@/services/admin/admin.types'
import { m } from 'framer-motion'
import {
    ArrowUpRight,
    BookOpen,
    FileQuestion,
    MoreVertical,
    Trash2,
} from '@/components/ui/icons'
import Link from 'next/link'
import { useState } from 'react'

interface AppleTestCardProps {
  test: ITest
  index: number
  onDelete: (test: ITest) => void
}

export function AppleTestCard({ test, index, onDelete }: AppleTestCardProps) {
  const { locale, t } = useI18n()
  const c = t.adminTestComponents.appleTestCard
  const [isHovered, setIsHovered] = useState(false)
  const questionsCount = test.questions?.length ?? 0
  const questionWord = selectPlural(locale, questionsCount, {
    one: c.questionWordOne,
    few: c.questionWordFew,
    many: c.questionWordMany,
  })

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className='group'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`${ROUTES.ADMIN.LEARNING.TESTS}/${test.id}`}>
        <div
          className={cn(
            'relative min-h-[240px] p-5 rounded-2xl',
            'bg-gradient-to-br from-white/5 to-white/2',
            'border border-white/10',
            'transition-all duration-300',
            'group-hover:border-white/20 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:shadow-blue-500/10',
            'flex flex-col'
          )}
        >
          {/* Glow effect */}
          <m.div
            className='absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 pointer-events-none'
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Content */}
          <div className='relative flex flex-col flex-1'>
            {/* Header - dropdown top right */}
            <div className='absolute top-0 right-0 z-10'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={e => e.preventDefault()}>
                  <m.div
                    animate={{
                      opacity: isHovered ? 1 : 0,
                      scale: isHovered ? 1 : 0.8,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 hover:bg-white/2'
                      onClick={e => e.stopPropagation()}
                    >
                      <MoreVertical className='w-4 h-4' />
                    </Button>
                  </m.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  className='bg-overlay/95 border-white/10 backdrop-blur-xl'
                >
                  <DropdownMenuItem
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      onDelete(test)
                    }}
                    className='gap-2 text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer'
                  >
                    <Trash2 className='w-4 h-4' />
                    {c.delete}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Title & Description - fills available space */}
            <div className='flex-1 pr-8'>
              <h3 className='text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors'>
                {test.title}
              </h3>

              {test.description && (
                <p className='text-sm text-gray-400 line-clamp-2'>
                  {test.description}
                </p>
              )}
            </div>

            {/* Meta Footer - mt-auto pins it to the bottom */}
            <div className='mt-auto space-y-2.5 pt-4'>
              <div className='flex items-center gap-3'>
                <m.div
                  className='flex items-center gap-2'
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className='p-1.5 rounded-lg bg-blue-500/10'>
                    <FileQuestion className='w-3.5 h-3.5 text-blue-400' />
                  </div>
                  <span className='text-sm text-gray-300 font-medium'>
                    {c.questionsCountTemplate
                      .replace('{count}', String(questionsCount))
                      .replace('{questionWord}', questionWord)}
                  </span>
                </m.div>

                {test.course && (
                  <m.div
                    className='flex items-center gap-2 flex-1 min-w-0'
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className='p-1.5 rounded-lg bg-purple-500/10'>
                      <BookOpen className='w-3.5 h-3.5 text-purple-400' />
                    </div>
                    <span className='text-sm text-gray-300 truncate font-medium'>
                      {test.course.title}
                    </span>
                  </m.div>
                )}
              </div>

              {/* Arrow indicator */}
              <div className='flex items-center justify-between pt-2.5 border-t border-white/10'>
                <span className='text-xs text-gray-500 font-medium'>
                  {c.edit}
                </span>
                <m.div
                  animate={{
                    x: isHovered ? 4 : 0,
                    opacity: isHovered ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <ArrowUpRight className='w-4 h-4 text-blue-400' />
                </m.div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </m.div>
  )
}
