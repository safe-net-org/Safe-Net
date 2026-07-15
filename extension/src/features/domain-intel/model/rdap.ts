import type { RdapInfo } from './types'

const TIMEOUT_MS = 6500

interface RdapEvent { eventAction?: string; eventDate?: string }
interface RdapEntity {
  roles?: string[]
  vcardArray?: [string, unknown[]]
}
interface RdapNameserver { ldhName?: string }
interface RdapResponse {
  events?: RdapEvent[]
  entities?: RdapEntity[]
  status?: string[]
  nameservers?: RdapNameserver[]
}

function parseDate(value: string | undefined): number | null {
  if (!value) return null
  const t = Date.parse(value)
  return Number.isFinite(t) ? t : null
}

function findEventDate(events: RdapEvent[] | undefined, action: string): number | null {
  if (!events) return null
  for (const ev of events) {
    if (ev.eventAction === action) return parseDate(ev.eventDate)
  }
  return null
}

function extractRegistrarName(entities: RdapEntity[] | undefined): string | null {
  if (!entities) return null
  for (const e of entities) {
    if (!e.roles?.includes('registrar') || !e.vcardArray) continue
    const items = e.vcardArray[1]
    for (const item of items) {
      if (Array.isArray(item) && item[0] === 'fn' && typeof item[3] === 'string') {
        return item[3]
      }
    }
  }
  return null
}

export async function fetchRdap(domain: string): Promise<RdapInfo | null> {
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      signal: controller.signal,
      headers: { Accept: 'application/rdap+json' },
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const data = (await res.json()) as RdapResponse

    return {
      registrar: extractRegistrarName(data.entities),
      createdAt: findEventDate(data.events, 'registration'),
      expiresAt: findEventDate(data.events, 'expiration'),
      updatedAt: findEventDate(data.events, 'last changed'),
      status: data.status ?? [],
      nameservers: (data.nameservers ?? [])
        .map((n) => n.ldhName)
        .filter((n): n is string => typeof n === 'string'),
    }
  } catch {
    return null
  }
}
