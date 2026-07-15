import { registerContent } from '@/src/app/content'

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    registerContent()
  },
})
