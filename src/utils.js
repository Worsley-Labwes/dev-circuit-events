// All dates in the app are plain 'YYYY-MM-DD' strings in the visitor's local time.
// (The old code used toISOString(), which is UTC and flips the day for Nairobi after 21:00.)

export function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function todayKey() {
  return toDateKey(new Date())
}

export function toLocalDate(dateString) {
  return new Date(`${dateString}T12:00:00`)
}

export function formatDate(dateString) {
  return toLocalDate(dateString).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
}

export function formatLongDate(dateString) {
  return toLocalDate(dateString).toLocaleDateString('en-KE', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function dateParts(dateString) {
  const date = toLocalDate(dateString)
  return {
    day: date.toLocaleDateString('en-KE', { day: 'numeric' }),
    month: date.toLocaleDateString('en-KE', { month: 'short' }),
  }
}

export function daysUntil(dateString) {
  return Math.round((toLocalDate(dateString) - toLocalDate(todayKey())) / 86400000)
}

export function relativeDays(dateString, verb = 'Closes') {
  const days = daysUntil(dateString)
  if (days < 0) return `${verb === 'Closes' ? 'Closed' : 'Ended'} ${formatDate(dateString)}`
  if (days === 0) return `${verb} today`
  if (days === 1) return `${verb} tomorrow`
  return `${verb} in ${days} days`
}

// open | full | closed (deadline passed) | ended (event passed)
export function eventStatus(event) {
  const today = todayKey()
  if (event.date < today) return 'ended'
  if (event.deadline < today) return 'closed'
  if (event.attendees >= event.spots) return 'full'
  return 'open'
}

export function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function mapRemoteEvent(event) {
  return {
    id: event.id,
    title: event.title,
    organizer: event.organizer,
    category: event.category,
    city: event.city,
    venue: event.venue,
    date: event.event_date,
    deadline: event.deadline,
    description: event.description,
    image: event.image_url || '',
    attendees: event.attendees || 0,
    spots: event.spots || 100,
    registrationUrl: event.registration_url || '',
    format: event.is_virtual ? 'Online' : 'In person',
    accent: 'coral',
  }
}
