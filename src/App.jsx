import { useEffect, useMemo, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronDown,
  Compass,
  MapPin,
  Search,
  Sparkles,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { supabase } from './supabase'
import { initialEvents, locations, people } from './data'
import {
  CategoryTabs,
  CreateEventModal,
  EmptyState,
  EventCard,
  EventFilters,
  OrganizerDashboard,
  PageHeader,
  PersonCard,
  ProfileModal,
} from './components'
import {
  daysUntil,
  dateParts,
  formatLongDate,
  mapRemoteEvent,
  readStored,
  relativeDays,
  toDateKey,
  toLocalDate,
  todayKey,
} from './utils'
import './index.css'

const navigation = [
  { label: 'Discover', icon: Compass },
  { label: 'Saved', icon: Bookmark },
  { label: 'Find a team', icon: Users },
  { label: 'Organizer studio', icon: Sparkles, short: 'Organizers' },
]

const isLocalEvent = (event) => String(event.id).startsWith('local-')

function App() {
  const [view, setView] = useState('Discover')
  const [category, setCategory] = useState('All events')
  const [location, setLocation] = useState('Everywhere')
  const [query, setQuery] = useState('')
  const [soonestFirst, setSoonestFirst] = useState(true)
  const [selectedDate, setSelectedDate] = useState()
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const next = [...initialEvents].filter((event) => event.date >= todayKey()).sort((a, b) => a.date.localeCompare(b.date))[0]
    return next ? toLocalDate(next.date) : new Date()
  })
  const [savedIds, setSavedIds] = useState(() => readStored('devcircuit-saved', []))
  const [connectedPeople, setConnectedPeople] = useState(() => readStored('devcircuit-connections', []))
  // Only events created in this browser are stored. Demo events always come fresh from data.js.
  const [localEvents, setLocalEvents] = useState(() => readStored('devcircuit-events', []).filter(isLocalEvent))
  const [remoteEvents, setRemoteEvents] = useState([])
  const [myProfile, setMyProfile] = useState(() => readStored('devcircuit-profile', null))
  const [showCreate, setShowCreate] = useState(false)
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [showTeamFilters, setShowTeamFilters] = useState(false)
  const [teamLocation, setTeamLocation] = useState('Everywhere')
  const [teamRole, setTeamRole] = useState('All roles')
  const [teamQuery, setTeamQuery] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!supabase) return undefined

    let active = true
    supabase
      .from('events')
      .select('*')
      .eq('published', true)
      .gte('event_date', todayKey())
      .order('event_date')
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setNotice('Showing preview events. Check your Supabase events table setup.')
          return
        }
        if (data?.length) setRemoteEvents(data.map(mapRemoteEvent))
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => localStorage.setItem('devcircuit-saved', JSON.stringify(savedIds)), [savedIds])
  useEffect(() => localStorage.setItem('devcircuit-connections', JSON.stringify(connectedPeople)), [connectedPeople])
  useEffect(() => localStorage.setItem('devcircuit-events', JSON.stringify(localEvents)), [localEvents])
  useEffect(() => localStorage.setItem('devcircuit-profile', JSON.stringify(myProfile)), [myProfile])

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 4500)
    return () => window.clearTimeout(timer)
  }, [notice])

  // Once Supabase returns published events they replace the demo events.
  const events = useMemo(() => [...localEvents, ...(remoteEvents.length ? remoteEvents : initialEvents)], [localEvents, remoteEvents])
  const today = todayKey()
  const upcoming = useMemo(() => events.filter((event) => event.date >= today).sort((a, b) => a.date.localeCompare(b.date)), [events, today])
  const nextEvent = upcoming.find((event) => event.deadline >= today) || upcoming[0]
  const cityCount = new Set(upcoming.map((event) => event.city).filter((city) => city !== 'Online')).size

  const filteredEvents = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const matches = events.filter((event) => {
      const matchesView = view === 'Saved' ? savedIds.includes(event.id) : event.date >= today
      const matchesCategory = category === 'All events' || event.category === category
      const matchesLocation = location === 'Everywhere' || event.city === location
      const matchesDate = !selectedDate || event.date === toDateKey(selectedDate)
      const searchText = `${event.title} ${event.organizer} ${event.description} ${event.city} ${event.venue} ${event.category}`.toLowerCase()
      return matchesView && matchesCategory && matchesLocation && matchesDate && searchText.includes(needle)
    })
    return matches.sort((a, b) => (soonestFirst ? 1 : -1) * a.date.localeCompare(b.date))
  }, [category, events, location, query, savedIds, selectedDate, soonestFirst, today, view])

  const eventDates = useMemo(() => upcoming.map((event) => toLocalDate(event.date)), [upcoming])
  const closingSoon = useMemo(
    () => upcoming.filter((event) => event.deadline >= today).sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 3),
    [upcoming, today],
  )

  const teamPeople = useMemo(() => (myProfile ? [myProfile, ...people] : people), [myProfile])
  const teamRoles = useMemo(() => [...new Set(teamPeople.map((person) => person.role))].sort(), [teamPeople])
  const filteredPeople = useMemo(() => teamPeople.filter((person) => {
    const matchesCity = teamLocation === 'Everywhere' || person.city === teamLocation
    const matchesRole = teamRole === 'All roles' || person.role === teamRole
    const searchText = `${person.name} ${person.role} ${person.city} ${person.lookingFor}`.toLowerCase()
    return matchesCity && matchesRole && searchText.includes(teamQuery.toLowerCase())
  }), [teamLocation, teamPeople, teamQuery, teamRole])

  const filtersActive = category !== 'All events' || location !== 'Everywhere' || query.trim() !== '' || Boolean(selectedDate)
  const teamFiltersActive = teamLocation !== 'Everywhere' || teamRole !== 'All roles' || teamQuery.trim() !== ''

  function toggleSaved(eventId) {
    setSavedIds((current) => current.includes(eventId)
      ? current.filter((id) => id !== eventId)
      : [...current, eventId])
  }

  function toggleConnection(id) {
    setConnectedPeople((current) => current.includes(id)
      ? current.filter((person) => person !== id)
      : [...current, id])
  }

  function createEvent(formData) {
    const city = formData.get('city')
    const newEvent = {
      id: `local-${Date.now()}`,
      title: formData.get('title').trim(),
      organizer: formData.get('organizer').trim() || 'Community organizer',
      category: formData.get('category'),
      city,
      venue: formData.get('venue').trim(),
      date: formData.get('date'),
      deadline: formData.get('deadline'),
      description: formData.get('description').trim(),
      image: formData.get('image').trim(),
      attendees: 0,
      spots: Math.max(Number(formData.get('spots')) || 80, 1),
      registrationUrl: formData.get('registrationUrl').trim(),
      format: city === 'Online' ? 'Online' : 'In person',
      accent: 'coral',
    }
    setLocalEvents((current) => [newEvent, ...current])
    setShowCreate(false)
    setNotice('Event published in this browser preview.')
  }

  function saveProfile(formData) {
    const name = formData.get('name').trim()
    const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
    setMyProfile({
      id: 'local-profile',
      name,
      initials,
      role: formData.get('role').trim(),
      city: formData.get('city'),
      lookingFor: formData.get('lookingFor').trim(),
      color: 'mint',
    })
    setShowProfileEditor(false)
    setNotice('Profile saved in this browser. You now appear in Find a team.')
  }

  function resetEventFilters() {
    setCategory('All events')
    setLocation('Everywhere')
    setQuery('')
    setSelectedDate(undefined)
  }

  function chooseView(nextView) {
    setView(nextView)
    resetEventFilters()
    window.scrollTo({ top: 0 })
  }

  function resetTeamFilters() {
    setTeamLocation('Everywhere')
    setTeamRole('All roles')
    setTeamQuery('')
  }

  const savedCount = savedIds.length
  const eventsEmpty = filteredEvents.length === 0
  const nextParts = nextEvent ? dateParts(nextEvent.date) : null

  const emptyForEvents = view === 'Saved' && !filtersActive
    ? { icon: Bookmark, title: 'Nothing saved yet', copy: 'Tap the bookmark on any event to keep it here.', actionLabel: 'Browse events', onAction: () => chooseView('Discover') }
    : filtersActive
      ? { icon: Search, title: 'No events match', copy: selectedDate ? `Nothing is listed for ${formatLongDate(toDateKey(selectedDate))}.` : 'Try a different search, city, or category.', actionLabel: 'Clear filters', onAction: resetEventFilters }
      : { icon: Compass, title: 'No upcoming events yet', copy: 'Be the first to put one on the circuit.', actionLabel: 'Create an event', onAction: () => setShowCreate(true) }

  const renderNav = (mobile) => {
    return navigation.map(({ label, icon: Icon, short }) => (
      <button
        key={label}
        type="button"
        className={`nav-item${view === label ? ' is-active' : ''}`}
        aria-current={view === label ? 'page' : undefined}
        onClick={() => chooseView(label)}
      >
        <Icon size={mobile ? 22 : 18} strokeWidth={1.9} aria-hidden="true" />
        <span>{mobile && short ? short : label}</span>
        {label === 'Saved' && savedCount > 0 && <span className="nav-count" aria-label={`${savedCount} saved`}>{savedCount}</span>}
      </button>
    ))
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#top" onClick={(event) => { event.preventDefault(); chooseView('Discover') }} aria-label="dev.circuit home">
            <span className="brand-mark"><Zap size={18} fill="currentColor" aria-hidden="true" /></span>
            <span>dev<span className="brand-dot">.</span>circuit</span>
          </a>
          <nav className="top-nav" aria-label="Main">{renderNav(false)}</nav>
          <button className="profile-button" type="button" onClick={() => setShowProfileEditor(true)} aria-label={myProfile ? 'Edit your profile' : 'Create your profile'}>
            <span className="profile-avatar">{myProfile?.initials || <User size={16} aria-hidden="true" />}</span>
            <span className="profile-label">{myProfile ? myProfile.name.split(' ')[0] : 'Create profile'}</span>
          </button>
        </div>
      </header>

      <div className="page" id="top">
        <main className="main-content">
          {view === 'Discover' && (
            <>
              <section className="hero">
                <div className="hero-text">
                  <h1>Make your next thing happen.</h1>
                  <p>Hackathons, workshops, and meetups where Kenya&apos;s builders show up. {upcoming.length} coming up across {cityCount} {cityCount === 1 ? 'city' : 'cities'} and online.</p>
                </div>
                {nextEvent && (
                  <a className="next-up" href={nextEvent.registrationUrl || undefined} target="_blank" rel="noreferrer" aria-label={`Next up: ${nextEvent.title}`}>
                    <span className="next-up-label">Next up</span>
                    <span className="next-up-date"><strong>{nextParts.day}</strong> {nextParts.month}</span>
                    <span className="next-up-title">{nextEvent.title}</span>
                    <span className="next-up-meta"><MapPin size={15} aria-hidden="true" />{nextEvent.venue}</span>
                    <span className="next-up-foot">{relativeDays(nextEvent.date, 'Starts')}{nextEvent.registrationUrl && <ArrowUpRight size={18} aria-hidden="true" />}</span>
                  </a>
                )}
              </section>

              <section className="search-panel" aria-label="Search and filter events">
                <label className="search-field"><Search size={19} aria-hidden="true" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events or venues" aria-label="Search events" />{query && <button type="button" className="clear-search" aria-label="Clear search" onClick={() => setQuery('')}><X size={16} /></button>}</label>
                <label className="select-field"><MapPin size={18} aria-hidden="true" /><select value={location} onChange={(event) => setLocation(event.target.value)} aria-label="Filter by location">{locations.map((place) => <option key={place} value={place}>{place === 'Everywhere' ? 'All locations' : place}</option>)}</select><ChevronDown size={16} aria-hidden="true" /></label>
              </section>

              <section className="events-section" aria-labelledby="events-heading">
                <div className="section-head">
                  <h2 id="events-heading">Coming up</h2>
                  <button type="button" className="link-button" onClick={() => setSoonestFirst((value) => !value)}>
                    {soonestFirst ? 'Soonest first' : 'Latest first'}
                    {soonestFirst ? <ArrowDown size={16} aria-hidden="true" /> : <ArrowUp size={16} aria-hidden="true" />}
                  </button>
                </div>
                <CategoryTabs category={category} setCategory={setCategory} />
                {selectedDate && (
                  <div className="date-chip">
                    <span>{formatLongDate(toDateKey(selectedDate))}</span>
                    <button type="button" onClick={() => setSelectedDate(undefined)} aria-label="Clear date filter"><X size={16} /></button>
                  </div>
                )}
                <p className="result-count" aria-live="polite">{filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}</p>
                <div className="event-grid">
                  {filteredEvents.map((event) => <EventCard key={event.id} event={event} saved={savedIds.includes(event.id)} onToggleSaved={toggleSaved} />)}
                </div>
                {eventsEmpty && <EmptyState {...emptyForEvents} />}
              </section>
            </>
          )}

          {view === 'Saved' && (
            <section className="subpage">
              <PageHeader title="Saved events" copy="The events you bookmarked, in one place." />
              <EventFilters category={category} setCategory={setCategory} query={query} setQuery={setQuery} location={location} setLocation={setLocation} />
              <p className="result-count" aria-live="polite">{filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}</p>
              <div className="event-grid">{filteredEvents.map((event) => <EventCard key={event.id} event={event} saved onToggleSaved={toggleSaved} />)}</div>
              {eventsEmpty && <EmptyState {...emptyForEvents} />}
            </section>
          )}

          {view === 'Find a team' && (
            <section className="subpage">
              <PageHeader title="Find a team" copy="Meet makers looking for a teammate, a fresh perspective, or a reason to start something." action={
                <button type="button" className="btn btn-secondary" onClick={() => setShowProfileEditor(true)}>{myProfile ? 'Edit your profile' : 'Create your profile'}</button>
              } />
              <div className="team-bar">
                <p><Users size={18} aria-hidden="true" /> {filteredPeople.length} {filteredPeople.length === 1 ? 'builder' : 'builders'} open to collaborating</p>
                <button type="button" className="btn btn-secondary btn-small" aria-expanded={showTeamFilters} onClick={() => setShowTeamFilters((open) => !open)}>Filters <ChevronDown size={16} aria-hidden="true" /></button>
              </div>
              {showTeamFilters && (
                <div className="team-filters">
                  <label className="search-field boxed"><Search size={17} aria-hidden="true" /><input value={teamQuery} onChange={(event) => setTeamQuery(event.target.value)} placeholder="Name, skill, or project" aria-label="Search people" /></label>
                  <label className="field">City<select value={teamLocation} onChange={(event) => setTeamLocation(event.target.value)}>{locations.map((place) => <option key={place}>{place}</option>)}</select></label>
                  <label className="field">Role<select value={teamRole} onChange={(event) => setTeamRole(event.target.value)}><option>All roles</option>{teamRoles.map((role) => <option key={role}>{role}</option>)}</select></label>
                  {teamFiltersActive && <button className="link-button" type="button" onClick={resetTeamFilters}>Clear filters</button>}
                </div>
              )}
              <div className="people-grid">
                {filteredPeople.map((person) => (
                  <PersonCard key={person.id} person={person} isOwn={person.id === 'local-profile'} connected={connectedPeople.includes(person.id)} onConnect={() => toggleConnection(person.id)} onEdit={() => setShowProfileEditor(true)} />
                ))}
              </div>
              {filteredPeople.length === 0 && <EmptyState icon={Users} title="No builders match those filters" copy="Try a different city, role, or search." actionLabel="Clear filters" onAction={resetTeamFilters} />}
            </section>
          )}

          {view === 'Organizer studio' && <OrganizerDashboard events={events} onCreate={() => setShowCreate(true)} />}
        </main>

        <aside className="rail" aria-label="Calendar and deadlines">
          <section className="rail-card calendar">
            <h2>Event calendar</h2>
            <DayPicker
              mode="single"
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              selected={selectedDate}
              onSelect={(date) => { setSelectedDate(date); if (date && view !== 'Saved') setView('Discover') }}
              modifiers={{ hasEvent: eventDates }}
              modifiersClassNames={{ hasEvent: 'has-event' }}
              weekStartsOn={1}
              showOutsideDays
              fixedWeeks
            />
            <p className="calendar-legend"><span className="legend-swatch" aria-hidden="true" />Days with an event. Tap one to filter.</p>
          </section>

          <section className="rail-card" aria-labelledby="closing-heading">
            <h2 id="closing-heading">Closing soon</h2>
            {closingSoon.length === 0
              ? <p className="rail-empty">No registrations closing right now.</p>
              : <ul className="deadline-list">
                {closingSoon.map((event) => (
                  <li key={event.id} className={daysUntil(event.deadline) <= 3 ? 'is-urgent' : ''}>
                    <strong>{event.title}</strong>
                    <span>{relativeDays(event.deadline)}</span>
                  </li>
                ))}
              </ul>}
          </section>

          <section className="rail-card community">
            <div className="community-avatars" aria-hidden="true">
              {teamPeople.slice(0, 4).map((person) => <span key={person.id} className={`person-${person.color}`}>{person.initials}</span>)}
            </div>
            <h2>Looking for a teammate?</h2>
            <p>{teamPeople.length} builders are open to collaborating on their next project.</p>
            <button type="button" className="link-button" onClick={() => chooseView('Find a team')}>Meet them <ArrowRight size={16} aria-hidden="true" /></button>
          </section>
        </aside>
      </div>

      <nav className="bottom-nav" aria-label="Main (mobile)">{renderNav(true)}</nav>

      {notice && <div className="toast" role="status"><Check size={18} aria-hidden="true" /><span>{notice}</span><button type="button" aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={16} /></button></div>}
      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} onSubmit={createEvent} />}
      {showProfileEditor && <ProfileModal profile={myProfile} onClose={() => setShowProfileEditor(false)} onSubmit={saveProfile} />}
    </div>
  )
}

export default App
