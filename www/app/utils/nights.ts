/**
 * The Hub's recurring club nights: the single source of truth for landing pages,
 * homepage cards and schema.org Event data. Copy lives in i18n (NightPages.ts).
 */
export type NightKey = 'latin' | 'saturday'

export interface Night {
  key: NightKey
  /** Route name (see i18n `pages` in nuxt.config.ts for localized slugs). */
  route: 'latin-night' | 'saturday-night'
  /** schema.org day name. */
  day: 'Friday' | 'Saturday'
  /** JS weekday, 0 = Sunday. */
  weekday: 5 | 6
  doors: string
  close: string
  image: string
  /** 1200x630 share card. */
  og: string
  /** DJ lineup, resident first. Feeds schema.org `performer`. */
  djs: string[]
}

export const NIGHTS: Record<NightKey, Night> = {
  latin: { key: 'latin', route: 'latin-night', day: 'Friday', weekday: 5, doors: '22:00', close: '04:00', image: img('latin-night'), og: ogImg('latin-night'), djs: ['DJ Seizure', 'DJ VK'] },
  saturday: { key: 'saturday', route: 'saturday-night', day: 'Saturday', weekday: 6, doors: '22:00', close: '04:00', image: img('saturday'), og: ogImg('saturday'), djs: ['DJ Junior', 'DJ Perry'] }
}

const TZ = 'America/Kentucky/Louisville'

/** Offset like "-05:00" for a date in Louisville (handles DST). */
function louisvilleOffset(date: Date): string {
  const part = new Intl.DateTimeFormat('en-US', { timeZone: TZ, timeZoneName: 'longOffset' })
    .formatToParts(date).find(p => p.type === 'timeZoneName')?.value ?? 'GMT-05:00'
  return part.replace('GMT', '') || '+00:00'
}

/**
 * Next `count` occurrences as ISO start/end pairs in Louisville time.
 * The site is statically generated, so these are as fresh as the last deploy;
 * a weekly rebuild keeps them current (the recurring `eventSchedule` never goes stale).
 */
/** Nights run until 4AM: before then it's still the previous night (Sat 1AM = Friday's Latin Night). */
export const NIGHT_CUTOFF_HOUR = 4

/**
 * The club's "party date" in Louisville: wall-clock time there, shifted back by the
 * 4AM cutoff, so getDay() answers "which night is it?" rather than "which calendar day?".
 */
export function partyClock(now: Date = new Date()): Date {
  const local = new Date(now.toLocaleString('en-US', { timeZone: TZ }))
  local.setHours(local.getHours() - NIGHT_CUTOFF_HOUR)
  return local
}

/** Which weekly night is on right now (Fri 4AM-cutoff window → 'latin', Sat → 'saturday'). */
export function tonightKey(now: Date = new Date()): NightKey | null {
  const day = partyClock(now).getDay()
  return (Object.values(NIGHTS).find(n => n.weekday === day)?.key) ?? null
}

export function upcomingDates(night: Night, count = 4, from = new Date()) {
  const out: { start: string, end: string }[] = []
  // Party date, so a night still in progress (e.g. Sat 1AM during Friday's Latin Night) stays listed.
  const local = partyClock(from)
  const d = new Date(local.getFullYear(), local.getMonth(), local.getDate())
  d.setDate(d.getDate() + ((night.weekday - d.getDay() + 7) % 7))
  for (let i = 0; i < count; i++) {
    const startDay = new Date(d)
    startDay.setDate(d.getDate() + i * 7)
    const endDay = new Date(startDay)
    endDay.setDate(startDay.getDate() + 1)
    const ymd = (x: Date) => `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`
    out.push({
      start: `${ymd(startDay)}T${night.doors}:00${louisvilleOffset(startDay)}`,
      end: `${ymd(endDay)}T${night.close}:00${louisvilleOffset(endDay)}`
    })
  }
  return out
}
