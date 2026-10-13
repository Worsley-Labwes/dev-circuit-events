import { useEffect, useRef, useState } from 'react'
import {
  ArrowUpRight,
  Bookmark,
  CalendarClock,
  Check,
  ChevronDown,
  Code,
  Compass,
  Globe,
  Hammer,
  MapPin,
  Mic,
  Plus,
  Search,
  Send,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { categories, cities, locations } from './data'
import { dateParts, eventStatus, formatDate, formatLongDate, relativeDays, todayKey } from './utils'

const categoryIcons = { Hackathon: Code, Workshop: Hammer, Meetup: Users, Conference: Mic }

export function PageHeader({ title, copy, action }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
      {action}
    </header>
  )
}

export function EventCard({ event, saved, onToggleSaved }) {
  const [imageFailed, setImageFailed] = useState(false)
  const status = eventStatus(event)
  const { day, month } = dateParts(event.date)
  const spotsLeft = Math.max(event.spots - event.attendees, 0)
  const filled = Math.min(100, Math.round((event.attendees / Math.max(event.spots, 1)) * 100))
  const Icon = event.format === 'Online' ? Globe : categoryIcons[event.category] || Compass
  const showImage = event.image && !imageFailed

  const deadlineText = status === 'ended'
    ? `Ended ${formatDate(event.date)}`
    : relativeDays(event.deadline, 'Registration closes')

  return (
    <article className={`event-card${status === 'open' ? '' : ' is-unavailable'}`} data-accent={event.accent || 'coral'}>
      <div className="event-media">
        {showImage
          ? <img src={event.image} alt="" loading="lazy" onError={() => setImageFailed(true)} />
          : <div className="event-placeholder" aria-hidden="true"><Icon size={44} strokeWidth={1.4} /></div>}
        <span className="event-category">{event.category}</span>
        <button
          type="button"
          className={`save-button${saved ? ' is-saved' : ''}`}
          aria-label={saved ? `Remove ${event.title} from saved events` : `Save ${event.title}`}
          aria-pressed={saved}
          onClick={() => onToggleSaved(event.id)}
        >
          <Bookmark size={18} fill={saved ? 'currentColor' : 'none'} />
        </button>
        <time className="event-date" dateTime={event.date} aria-label={formatLongDate(event.date)}>
          <strong>{day}</strong>
          <span>{month}</span>
        </time>
      </div>

      <div className="event-body">
        <p className="event-organizer">{event.organizer}</p>
        <h3>{event.title}</h3>
        <p className="event-description">{event.description}</p>
        <ul className="event-meta">
          <li><MapPin size={16} aria-hidden="true" />{event.venue}</li>
          <li className={status === 'open' && relativeDays(event.deadline).match(/today|tomorrow|in [1-3] days/) ? 'is-urgent' : ''}>
            <CalendarClock size={16} aria-hidden="true" />{deadlineText}
          </li>
        </ul>

        <div className="event-footer">
          <div className="capacity">
            <div className="capacity-bar" aria-hidden="true"><span style={{ width: `${filled}%` }} /></div>
            <span className="capacity-text">
              <strong>{event.attendees}</strong> going{status === 'ended' ? '' : ` · ${spotsLeft} ${spotsLeft === 1 ? 'spot' : 'spots'} left`}
            </span>
          </div>
          {status === 'open' && event.registrationUrl
            ? <a className="btn btn-primary btn-small" href={event.registrationUrl} target="_blank" rel="noreferrer">Register <ArrowUpRight size={16} aria-hidden="true" /></a>
            : <span className="btn btn-small btn-disabled">{{ full: 'Full', closed: 'Closed', ended: 'Ended', open: 'No link yet' }[status]}</span>}
        </div>
      </div>
    </article>
  )
}

export function EventFilters({ category, setCategory, query, setQuery, location, setLocation }) {
  return (
    <div className="subpage-filters">
      <label className="search-field"><Search size={18} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search saved events" aria-label="Search events" /></label>
      <label className="select-field"><MapPin size={17} aria-hidden="true" /><select value={location} onChange={(event) => setLocation(event.target.value)} aria-label="Filter by location">{locations.map((place) => <option key={place}>{place}</option>)}</select><ChevronDown size={16} aria-hidden="true" /></label>
      <CategoryTabs category={category} setCategory={setCategory} />
    </div>
  )
}

export function CategoryTabs({ category, setCategory }) {
  return (
    <div className="category-tabs" role="group" aria-label="Event categories">
      {categories.map((item) => (
        <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>
      ))}
    </div>
  )
}

export function PersonCard({ person, connected, isOwn, onConnect, onEdit }) {
  return (
    <article className="person-card">
      <div className="person-top">
        <div className={`person-avatar person-${person.color}`} aria-hidden="true">{person.initials}</div>
        <div>
          <h3>{person.name}{isOwn && <span className="you-tag">You</span>}</h3>
          <p className="person-role">{person.role}</p>
        </div>
        <span className="person-city"><MapPin size={15} aria-hidden="true" />{person.city}</span>
      </div>
      <p className="person-label">Looking to</p>
      <p className="person-looking">{person.lookingFor}</p>
      <button type="button" className={`btn btn-block ${connected && !isOwn ? 'btn-done' : 'btn-secondary'}`} onClick={isOwn ? onEdit : onConnect}>
        {isOwn
          ? <><Sparkles size={16} aria-hidden="true" /> Edit your profile</>
          : connected
            ? <><Check size={16} aria-hidden="true" /> Request sent</>
            : <><Send size={16} aria-hidden="true" /> Say hello</>}
      </button>
    </article>
  )
}

const statusLabels = { open: 'Open', full: 'Full', closed: 'Closed', ended: 'Ended' }

export function OrganizerDashboard({ events, onCreate }) {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date))
  const upcoming = sorted.find((event) => event.date >= todayKey())
  const totalGoing = events.reduce((sum, event) => sum + event.attendees, 0)

  return (
    <section className="subpage">
      <PageHeader
        title="Organizer studio"
        copy="List your event and put it in front of builders across Kenya."
        action={<button type="button" className="btn btn-primary" onClick={onCreate}><Plus size={18} aria-hidden="true" /> Create event</button>}
      />

      <div className="stat-row">
        <div className="stat"><span>Listed events</span><strong>{events.length}</strong></div>
        <div className="stat"><span>People going</span><strong>{totalGoing.toLocaleString('en-KE')}</strong></div>
        <div className="stat"><span>Next event</span><strong>{upcoming ? formatDate(upcoming.date) : '—'}</strong></div>
      </div>

      <div className="section-head">
        <h2>Your listings</h2>
        <button type="button" className="link-button" onClick={onCreate}>Add an event <Plus size={16} aria-hidden="true" /></button>
      </div>

      <div className="listing-table" role="table" aria-label="Your listings">
        <div className="listing-row listing-head" role="row">
          <span role="columnheader">Event</span><span role="columnheader">Date</span><span role="columnheader">City</span><span role="columnheader">Going</span><span role="columnheader">Status</span>
        </div>
        {sorted.map((event) => {
          const status = eventStatus(event)
          return (
            <div className="listing-row" role="row" key={event.id}>
              <div className="listing-event" role="cell">
                <span className="accent-dot" data-accent={event.accent || 'coral'} aria-hidden="true" />
                <div><strong>{event.title}</strong><small>{event.category} · {event.organizer}</small></div>
              </div>
              <span role="cell">{formatLongDate(event.date)}</span>
              <span role="cell" className="col-city">{event.city}</span>
              <span role="cell" className="col-going">{event.attendees}/{event.spots}</span>
              <span role="cell"><span className={`status-pill status-${status}`}>{statusLabels[status]}</span></span>
            </div>
          )
        })}
      </div>

      <p className="note"><Sparkles size={18} aria-hidden="true" /><span><strong>Preview mode.</strong> Events you create here are saved in this browser only. Connect Supabase to share listings with every visitor.</span></p>
    </section>
  )
}

export function EmptyState({ icon: Icon = Compass, title, copy, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><Icon size={24} aria-hidden="true" /></span>
      <h3>{title}</h3>
      <p>{copy}</p>
      {onAction && <button type="button" className="btn btn-secondary" onClick={onAction}>{actionLabel}</button>}
    </div>
  )
}

// Escape closes, page behind stops scrolling, focus returns to where it was.
function useModal(onClose) {
  const closeRef = useRef(onClose)
  useEffect(() => { closeRef.current = onClose })
  useEffect(() => {
    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    const onKey = (event) => { if (event.key === 'Escape') closeRef.current() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus()
    }
  }, [])
}

function Modal({ titleId, title, onClose, children }) {
  useModal(onClose)
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="modal-head">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20} /></button>
        </div>
        {children}
      </section>
    </div>
  )
}

export function CreateEventModal({ onClose, onSubmit }) {
  const [error, setError] = useState('')
  const today = todayKey()

  function handleSubmit(event) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if (data.get('deadline') > data.get('date')) {
      setError('Registration should close on or before the event date.')
      return
    }
    onSubmit(data)
  }

  return (
    <Modal titleId="create-event-title" title="Create an event" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label className="field field-wide">Event name<input name="title" placeholder="e.g. Nairobi AI Builders Night" required maxLength="80" autoFocus /></label>
        <label className="field">Category<select name="category" defaultValue="Meetup"><option>Meetup</option><option>Hackathon</option><option>Workshop</option><option>Conference</option></select></label>
        <label className="field">City<select name="city" defaultValue="Nairobi">{cities.map((city) => <option key={city}>{city}</option>)}</select></label>
        <label className="field">Event date<input name="date" type="date" min={today} required /></label>
        <label className="field">Registration closes<input name="deadline" type="date" min={today} required /></label>
        <label className="field field-wide">Venue<input name="venue" placeholder="Venue, or the online platform" required /></label>
        <label className="field field-wide">Short description<textarea name="description" rows="3" placeholder="What will people make, learn, or meet?" required maxLength="160" /></label>
        <label className="field">Capacity<input name="spots" type="number" min="1" max="100000" defaultValue="80" /></label>
        <label className="field">Organizer<input name="organizer" placeholder="Your community or company" /></label>
        <label className="field field-wide">Registration link<input name="registrationUrl" type="url" placeholder="https://" /></label>
        <label className="field field-wide">Cover image link <span className="optional">optional</span><input name="image" type="url" placeholder="https://" /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary"><Plus size={18} aria-hidden="true" /> Publish event</button>
        </div>
      </form>
    </Modal>
  )
}

export function ProfileModal({ profile, onClose, onSubmit }) {
  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(new FormData(event.currentTarget))
  }

  return (
    <Modal titleId="profile-title" title={profile ? 'Edit your profile' : 'Create your profile'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <label className="field field-wide">Your name<input name="name" defaultValue={profile?.name || ''} placeholder="e.g. Wanjiku Mwangi" required maxLength="60" autoFocus /></label>
        <label className="field field-wide">What do you do?<input name="role" defaultValue={profile?.role || ''} placeholder="e.g. Frontend developer" required maxLength="60" /></label>
        <label className="field field-wide">City<select name="city" defaultValue={profile?.city || 'Nairobi'}>{cities.map((city) => <option key={city}>{city}</option>)}</select></label>
        <label className="field field-wide">What are you looking to build?<textarea name="lookingFor" defaultValue={profile?.lookingFor || ''} rows="3" placeholder="The kind of teammate or project you have in mind" required maxLength="140" /></label>
        <p className="note field-wide"><Sparkles size={18} aria-hidden="true" /><span>This preview saves your profile in this browser only. It is not an account and other visitors can&apos;t see it.</span></p>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary"><Check size={18} aria-hidden="true" /> Save profile</button>
        </div>
      </form>
    </Modal>
  )
}

