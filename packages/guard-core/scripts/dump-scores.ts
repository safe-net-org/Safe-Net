import { readFileSync } from 'node:fs'
import { analyzeUrl } from '../src/lib/url-analyzer'
import { scoreUrl } from '../src/model/score'

const urls = JSON.parse(readFileSync(process.argv[2], 'utf8')) as string[]
process.stdout.write(JSON.stringify(urls.map(url => {
  const result = scoreUrl(url, analyzeUrl(url))
  return { url, score: result.score, level: result.level, signals: result.signals.map(signal => signal.key) }
})))
