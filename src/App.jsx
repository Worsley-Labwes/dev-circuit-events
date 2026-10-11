import { useEffect, useMemo, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import {
  ArrowDownUp,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  MapPin,
  Menu,
  Plus,
  Search,
  Send,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { supabase } from './supabase'
import './index.css'

const initialEvents = [
  {
    id: 'ai-builders',
    title: 'Nairobi AI Builders Night',
    organizer: 'Build in Nairobi',
    category: 'Meetup',
    city: 'Nairobi',
    venue: 'Nairobi Garage, Westlands',
    date: '2026-11-06',
    deadline: '2026-11-04',
    description: 'A show-and-tell for people shipping useful things with AI.',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=85',
    attendees: 84,
    spots: 120,
    registrationUrl: 'https://lu.ma/',
    format: 'In person',
    accent: 'coral',
  },
  {
    id: 'climate-hack',
    title: 'Build for the Coast Hackathon',
    organizer: 'Coast Innovation Lab',
    category: 'Hackathon',
    city: 'Mombasa',
    venue: 'Swahilipot Hub, Mombasa',
    date: '2026-11-14',
    deadline: '2026-11-09',
    description: '48 hours to prototype tech for a more resilient coastline.',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=85',
    attendees: 63,
    spots: 90,
    registrationUrl: 'https://lu.ma/',
    format: 'In person',
    accent: 'lime',
  },
  {
    id: 'product-design',
    title: 'Designing Products People Trust',
    organizer: 'Nairobi Product Community',
    category: 'Workshop',
    city: 'Nairobi',
    venue: 'iHub, Senteu Plaza',
    date: '2026-11-19',
    deadline: '2026-11-17',
    description: 'A practical evening on research, prototyping, and good defaults.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1000&q=85',
    attendees: 31,
    spots: 45,
    registrationUrl: 'https://lu.ma/',
    format: 'In person',
    accent: 'blue',
  },
  {
    id: 'open-source',
    title: 'Open Source Friday: Ship Together',
    organizer: 'Tech Community Kenya',
    category: 'Workshop',
    city: 'Online',
    venue: 'Online · Google Meet',
    date: '2026-11-27',
    deadline: '2026-11-26',
    description: 'Pair up, pick an issue, and make your first open-source PR.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=85',
    attendees: 112,
    spots: 200,
    registrationUrl: 'https://lu.ma/',
    format: 'Online',
    accent: 'yellow',
  },
  {
    id: 'data-for-good',
    title: 'Data for Good: Kisumu Sprint',
    organizer: 'Lake Region Developers',
    category: 'Hackathon',
    city: 'Kisumu',
    venue: 'LakeHub, Kisumu',
    date: '2026-12-05',
    deadline: '2026-11-29',
    description: 'Work with local organisations to make public data more useful.',
    image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85',
    attendees: 42,
    spots: 70,
    registrationUrl: 'https://lu.ma/',
    format: 'In person',
    accent: 'pink',
  },
  {
    id: 'africa-cloud',
    title: 'Africa Cloud Native Conference',
    organizer: 'Cloud Native Nairobi',
    category: 'Conference',
    city: 'Nairobi',
    venue: 'KICC, Nairobi',
    date: '2026-12-12',
    deadline: '2026-12-08',
    description: 'Two days of infrastructure, platform engineering, and community.',
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1000&q=85',
    attendees: 205,
    spots: 350,
    registrationUrl: 'https://lu.ma/',
    format: 'In person',
    accent: 'coral',
  },
]

const people = [
  { name: 'Amina Wanjiku', role: 'Frontend developer', city: 'Nairobi', lookingFor: 'A designer for a civic-tech hackathon team', initials: 'AW', color: 'peach' },
  { name: 'Brian Otieno', role: 'Data scientist', city: 'Kisumu', lookingFor: 'Teammates into climate data and maps', initials: 'BO', color: 'mint' },
  { name: 'Neema Hassan', role: 'Product designer', city: 'Mombasa', lookingFor: 'A builder for a weekend prototype', initials: 'NH', color: 'lilac' },
  { name: 'David Kimani', role: 'Backend engineer', city: 'Nairobi', lookingFor: 'Open-source collaborators', initials: 'DK', color: 'butter' },
]

const categories = ['All events', 'Hackathon', 'Workshop', 'Meetup', 'Conference']
const locations = ['Everywhere', 'Nairobi', 'Mombasa', 'Kisumu', 'Online']
const today = new Date().toISOString().slice(0, 10)
const firstCalendarMonth = new Date('2026-11-01T12:00:00')

function toLocalDate(dateString) {
  return new Date(`${dateString}T12:00:00`)
}

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatDate(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
  })
}

function formatLongDate(dateString) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString('en-KE', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function mapRemoteEvent(event) {
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
    image: event.image_url || initialEvents[0].image,
    attendees: event.attendees || 0,
    spots: event.spots || 100,
    registrationUrl: event.registration_url || '#',
    format: event.is_virtual ? 'Online' : 'In person',
    accent: 'coral',
  }
}

function readStored(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function App() {
  const [view, setView] = useState('Discover')
  const [category, setCategory] = useState('All events')
  const [location, setLocation] = useState('Everywhere')
  const [query, setQuery] = useState('')
  const [selectedDate, setSelectedDate] = useState()
  const [calendarMonth, setCalendarMonth] = useState(firstCalendarMonth)
  const [savedIds, setSavedIds] = useState(() => readStored('devcircuit-saved', []))
  const [connectedPeople, setConnectedPeople] = useState(() => readStored('devcircuit-connections', []))
  const [events, setEvents] = useState(() => readStored('devcircuit-events', initialEvents))
  const [showCreate, setShowCreate] = useState(false)
  const [notice, setNotice] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!supabase) return undefined

    let active = true
    supabase
      .from('events')
      .select('*')
      .eq('published', true)
      .gte('event_date', new Date().toISOString().slice(0, 10))
      .order('event_date')
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setNotice('Showing preview events. Check your Supabase events table setup.')
          return
        }
        if (data?.length) {
          setEvents((current) => {
            return [...data.map(mapRemoteEvent), ...current.filter((event) => !data.some((item) => String(item.id) === String(event.id)))]
          })
        }
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => localStorage.setItem('devcircuit-saved', JSON.stringify(savedIds)), [savedIds])
  useEffect(() => localStorage.setItem('devcircuit-connections', JSON.stringify(connectedPeople)), [connectedPeople])
  useEffect(() => localStorage.setItem('devcircuit-events', JSON.stringify(events)), [events])

  const filteredEvents = useMemo(() => events.filter((event) => {
    const matchesView = view !== 'Saved' || savedIds.includes(event.id)
    const matchesCategory = category === 'All events' || event.category === category
    const matchesLocation = location === 'Everywhere' || event.city === location
    const matchesDate = !selectedDate || event.date === toDateKey(selectedDate)
    const searchText = `${event.title} ${event.organizer} ${event.description} ${event.city} ${event.category}`.toLowerCase()
    return matchesView && matchesCategory && matchesLocation && matchesDate && searchText.includes(query.toLowerCase())
  }), [category, events, location, query, savedIds, selectedDate, view])
  const eventDates = useMemo(() => events.map((event) => toLocalDate(event.date)), [events])
  const cityCount = new Set(events.map((event) => event.city).filter((city) => city !== 'Online')).size

  function toggleSaved(eventId) {
    setSavedIds((current) => current.includes(eventId)
      ? current.filter((id) => id !== eventId)
      : [...current, eventId])
  }

  function toggleConnection(name) {
    setConnectedPeople((current) => current.includes(name)
      ? current.filter((person) => person !== name)
      : [...current, name])
  }

  function createEvent(formData) {
    const newEvent = {
      id: `local-${Date.now()}`,
      title: formData.get('title').trim(),
      organizer: formData.get('organizer').trim() || 'Community organizer',
      category: formData.get('category'),
      city: formData.get('city'),
      venue: formData.get('venue').trim(),
      date: formData.get('date'),
      deadline: formData.get('deadline'),
      description: formData.get('description').trim(),
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1000&q=85',
      attendees: 0,
      spots: 80,
      registrationUrl: formData.get('registrationUrl').trim() || '#',
      format: formData.get('city') === 'Online' ? 'Online' : 'In person',
      accent: 'coral',
    }
    setEvents((current) => [newEvent, ...current])
    setShowCreate(false)
    setNotice('Your event is live in this browser preview.')
    window.setTimeout(() => setNotice(''), 3500)
  }

  function chooseView(nextView) {
    setView(nextView)
    setMobileMenuOpen(false)
    setCategory('All events')
    setQuery('')
    setSelectedDate(undefined)
  }

  const navigation = [
    { label: 'Discover', icon: Compass },
    { label: 'Saved', icon: Bookmark, count: savedIds.length },
    { label: 'Find a team', icon: Users },
  ]

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" onClick={() => chooseView('Discover')} aria-label="DevCircuit home">
          <span className="brand-symbol"><Zap size={19} fill="currentColor" /></span>
          <span>dev<span className="brand-dot">.</span>circuit</span>
        </a>
        <div className="topbar-center"><span className="live-dot" /> Kenya&apos;s builder calendar</div>
        <div className="topbar-actions">
          <button className="organizer-link" type="button" onClick={() => chooseView('Organizer studio')}>For organizers <ArrowUpRight size={15} /></button>
          <button className="avatar-button" type="button" aria-label="Open profile menu" onClick={() => setNotice('Profile sign-in is coming soon.')}>M</button>
          <button className="mobile-menu-button icon-button" type="button" aria-label="Toggle navigation" onClick={() => setMobileMenuOpen((open) => !open)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <div className="app-layout" id="top">
        <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
          <div className="sidebar-label">YOUR CIRCUIT</div>
          <nav className="side-nav" aria-label="Main navigation">
            {navigation.map(({ label, icon: Icon, count }) => (
              <button key={label} className={`nav-item ${view === label ? 'nav-item-active' : ''}`} type="button" onClick={() => chooseView(label)}>
                <Icon size={18} strokeWidth={1.8} />
                <span>{label}</span>
                {count > 0 && <span className="nav-count">{count}</span>}
              </button>
            ))}
            <div className="nav-divider" />
            <button className={`nav-item ${view === 'Organizer studio' ? 'nav-item-active' : ''}`} type="button" onClick={() => chooseView('Organizer studio')}>
              <Sparkles size={18} strokeWidth={1.8} /><span>Organizer studio</span>
            </button>
          </nav>

          <div className="sidebar-city-card">
            <div className="city-card-top"><span className="city-pin"><MapPin size={16} /></span><span className="city-live">ON THE MAP</span></div>
            <strong>Good things<br />are happening.</strong>
            <p>Across 4 cities and online.</p>
            <div className="city-dots" aria-label="Nairobi, Mombasa, Kisumu and online">
              <span>NBO</span><span>MSA</span><span>KSM</span><span>+ online</span>
            </div>
          </div>

          <div className="sidebar-footer">
            <span className="footer-spark">✳</span>
            <span>Built for people<br />who build things.</span>
          </div>
        </aside>

        <main className="main-content">
          <div className="mobile-location"><MapPin size={15} /> Nairobi, Kenya <ChevronDown size={14} /></div>

          {view === 'Discover' && (
            <>
              <section className="intro-block">
                <div className="eyebrow"><span className="eyebrow-line" /> THE PEOPLE. THE IDEAS. THE NEXT BIG THING.</div>
                <h1>Make your next<br /><span>thing happen.</span></h1>
                <p className="intro-copy">Find the rooms where Kenya&apos;s tech community is making moves.</p>
                <div className="intro-stats"><strong>{events.length}</strong> events on the circuit <span className="stat-divider">/</span> <strong>{cityCount}</strong> cities connected</div>
                <div className="intro-scribble" aria-hidden="true">Let&apos;s build <ArrowRight size={16} /></div>
              </section>

              <section className="search-panel" aria-label="Search and filter events">
                <label className="search-input-wrap"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try ‘AI’, ‘design’, or ‘Nairobi’" aria-label="Search events" />{query && <button type="button" className="clear-search" aria-label="Clear search" onClick={() => setQuery('')}><X size={15} /></button>}</label>
                <label className="select-wrap"><MapPin size={17} /><select value={location} onChange={(event) => setLocation(event.target.value)} aria-label="Filter by location">{locations.map((place) => <option key={place} value={place}>{place}</option>)}</select><ChevronDown size={15} /></label>
              </section>

              <section className="events-section">
                <div className="section-heading-row">
                  <div><div className="section-kicker">FIND YOUR PEOPLE</div><h2>Coming up <span className="heading-asterisk">✳</span></h2></div>
                  <button type="button" className="sort-button" onClick={() => setNotice('Events are sorted by soonest date.')}>Soonest first <ArrowDownUp size={15} /></button>
                </div>
                <div className="category-tabs" role="tablist" aria-label="Event categories">
                  {categories.map((item) => <button key={item} type="button" role="tab" aria-selected={category === item} className={category === item ? 'category-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}
                </div>
                {selectedDate && <div className="selected-date-filter">Showing {formatLongDate(toDateKey(selectedDate))}<button type="button" onClick={() => setSelectedDate(undefined)} aria-label="Clear date filter"><X size={14} /></button></div>}
                <div className="event-grid">
                  {filteredEvents.map((event) => <EventCard key={event.id} event={event} saved={savedIds.includes(event.id)} onToggleSaved={toggleSaved} />)}
                </div>
                {filteredEvents.length === 0 && <EmptyState view={view} onReset={() => { setCategory('All events'); setLocation('Everywhere'); setQuery(''); setSelectedDate(undefined); }} />}
              </section>

              <section className="bottom-banner">
                <div className="banner-icon"><Users size={21} /></div>
                <div><strong>Better ideas happen together.</strong><p>Find your next teammate in the community.</p></div>
                <button type="button" onClick={() => chooseView('Find a team')}>Meet the community <ArrowRight size={16} /></button>
              </section>
            </>
          )}

          {view === 'Saved' && (
            <section className="subpage-section">
              <div className="eyebrow"><span className="eyebrow-line" /> YOUR PERSONAL SHORTLIST</div>
              <h1 className="subpage-title">Saved for<br /><span>later.</span></h1>
              <p className="subpage-copy">Good plans deserve a second look.</p>
              <EventFilters category={category} setCategory={setCategory} query={query} setQuery={setQuery} location={location} setLocation={setLocation} />
              <div className="event-grid">{filteredEvents.map((event) => <EventCard key={event.id} event={event} saved onToggleSaved={toggleSaved} />)}</div>
              {filteredEvents.length === 0 && <EmptyState view="Saved" onReset={() => chooseView('Discover')} />}
            </section>
          )}

          {view === 'Find a team' && (
            <section className="subpage-section team-page">
              <div className="eyebrow"><span className="eyebrow-line" /> GOOD PEOPLE, GOOD WORK</div>
              <h1 className="subpage-title">Build your<br /><span>people.</span></h1>
              <p className="subpage-copy">Meet makers looking for a teammate, a fresh perspective, or a reason to start.</p>
              <div className="team-callout"><Sparkles size={18} /><span>Showing builders open to collaborating</span><button type="button" onClick={() => setNotice('More profile filters are coming soon.')}>Filters <ChevronDown size={14} /></button></div>
              <div className="people-grid">{people.map((person) => <PersonCard key={person.name} person={person} connected={connectedPeople.includes(person.name)} onConnect={() => toggleConnection(person.name)} />)}</div>
              <div className="profile-note"><span className="note-asterisk">✳</span><p>Your people are out there. <button type="button" onClick={() => setNotice('Profile creation is coming soon.')}>Create your profile <ArrowRight size={14} /></button></p></div>
            </section>
          )}

          {view === 'Organizer studio' && <OrganizerDashboard events={events} onCreate={() => setShowCreate(true)} />}
        </main>

        <aside className="right-rail">
          <div className="rail-topline"><span><MapPin size={14} /> NAIROBI, KENYA</span><button type="button" aria-label="Change location" onClick={() => setLocation('Everywhere')}><ChevronDown size={14} /></button></div>
          <div className="rail-date"><span>EVENT CALENDAR</span><DayPicker mode="single" month={calendarMonth} onMonthChange={setCalendarMonth} selected={selectedDate} onSelect={setSelectedDate} modifiers={{ hasEvent: eventDates }} modifiersClassNames={{ hasEvent: 'has-event' }} weekStartsOn={1} showOutsideDays /></div>
          <div className="rail-divider" />
          <div className="rail-events-heading"><div><span className="section-kicker">DON&apos;T MISS</span><h3>Closing soon</h3></div><Clock3 size={17} /></div>
          <div className="deadline-list">{events.slice(0, 3).map((event, index) => <div className="deadline-item" key={event.id}><div className={`deadline-number deadline-${index}`}>{String(index + 1).padStart(2, '0')}</div><div><strong>{event.title}</strong><span>Apply by {formatDate(event.deadline)}</span></div></div>)}</div>
          <div className="rail-divider" />
          <div className="rail-community"><div className="community-avatars"><span className="community-avatar avatar-a">A</span><span className="community-avatar avatar-b">K</span><span className="community-avatar avatar-c">N</span><span className="community-avatar avatar-more">+8</span></div><strong>Good company, guaranteed.</strong><p>Join 2,400+ builders finding their next thing.</p><button type="button" onClick={() => chooseView('Find a team')}>Meet the community <ArrowRight size={15} /></button></div>
        </aside>
      </div>

      {notice && <div className="toast" role="status"><Check size={17} />{notice}<button type="button" aria-label="Dismiss notification" onClick={() => setNotice('')}><X size={15} /></button></div>}
      {showCreate && <CreateEventModal onClose={() => setShowCreate(false)} onSubmit={createEvent} />}
    </div>
  )
}

function EventCard({ event, saved, onToggleSaved }) {
  return (
    <article className={`event-card accent-${event.accent || 'coral'}`}>
      <div className="event-image-wrap">
        <img src={event.image} alt="" loading="lazy" />
        <div className="image-shade" />
        <span className="event-category-tag">{event.category}</span>
        <button type="button" className={`save-button ${saved ? 'is-saved' : ''}`} aria-label={saved ? `Remove ${event.title} from saved events` : `Save ${event.title}`} aria-pressed={saved} onClick={() => onToggleSaved(event.id)}><Bookmark size={17} fill={saved ? 'currentColor' : 'none'} /></button>
        <span className="event-date-tile"><strong>{formatDate(event.date).split(' ')[0]}</strong><span>{formatDate(event.date).split(' ')[1]}</span></span>
      </div>
      <div className="event-card-body">
        <div className="event-organizer">{event.organizer}</div>
        <h3>{event.title}</h3>
        <p className="event-description">{event.description}</p>
        <div className="event-meta"><span><MapPin size={14} />{event.venue}</span><span><Clock3 size={14} />Apply by {formatDate(event.deadline)}</span></div>
        <div className="event-card-bottom"><div className="attendee-stack"><span className="attendee-dot attendee-one">J</span><span className="attendee-dot attendee-two">W</span><span className="attendee-dot attendee-three">+{Math.max(event.attendees - 2, 0)}</span></div><span className="spots-label">{event.attendees} going</span><a className="register-link" href={event.registrationUrl} target="_blank" rel="noreferrer">Details <ArrowUpRight size={14} /></a></div>
      </div>
    </article>
  )
}

function EventFilters({ category, setCategory, query, setQuery, location, setLocation }) {
  return (
    <div className="subpage-filters">
      <label className="search-input-wrap"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events" aria-label="Search events" /></label>
      <label className="select-wrap"><MapPin size={16} /><select value={location} onChange={(event) => setLocation(event.target.value)} aria-label="Filter by location">{locations.map((place) => <option key={place}>{place}</option>)}</select><ChevronDown size={14} /></label>
      <div className="category-tabs">{categories.map((item) => <button key={item} type="button" className={category === item ? 'category-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
    </div>
  )
}

function PersonCard({ person, connected, onConnect }) {
  return (
    <article className="person-card">
      <div className={`person-avatar person-${person.color}`}>{person.initials}<span className="person-online" /></div>
      <div className="person-heading"><div><h3>{person.name}</h3><span>{person.role}</span></div><span className="person-city"><MapPin size={13} />{person.city}</span></div>
      <div className="looking-for-label">LOOKING TO</div>
      <p>{person.lookingFor}</p>
      <button type="button" className={`connect-button ${connected ? 'connected' : ''}`} onClick={onConnect}>{connected ? <><Check size={15} /> Request sent</> : <><Send size={14} /> Say hello</>}</button>
    </article>
  )
}

function OrganizerDashboard({ events, onCreate }) {
  return (
    <section className="subpage-section organizer-page">
      <div className="organizer-heading"><div><div className="eyebrow"><span className="eyebrow-line" /> YOUR COMMUNITY, YOUR STAGE</div><h1 className="subpage-title">Organizer<br /><span>studio.</span></h1><p className="subpage-copy">Bring the right people into the room.</p></div><button type="button" className="primary-button" onClick={onCreate}><Plus size={17} /> Create event</button></div>
      <div className="organizer-stats"><div><span>LISTED EVENTS</span><strong>{events.length.toString().padStart(2, '0')}</strong><small>Across the circuit</small></div><div><span>COMMUNITY REACH</span><strong>2.4k</strong><small>Builders and counting</small></div><div><span>UP NEXT</span><strong>{events[0] ? formatDate(events[0].date) : '—'}</strong><small>Next event date</small></div></div>
      <div className="organizer-events-head"><div><span className="section-kicker">YOUR LISTINGS</span><h2>Events on the circuit</h2></div><button type="button" className="text-button" onClick={onCreate}>Add an event <Plus size={15} /></button></div>
      <div className="organizer-table"><div className="table-header"><span>EVENT</span><span>DATE</span><span>LOCATION</span><span>STATUS</span></div>{events.slice(0, 5).map((event) => <div className="table-row" key={event.id}><div className="table-event"><span className={`table-event-dot accent-dot-${event.accent || 'coral'}`} /><div><strong>{event.title}</strong><small>{event.category} · {event.organizer}</small></div></div><span>{formatLongDate(event.date)}</span><span>{event.city}</span><span className="status-pill"><i /> Live</span></div>)}</div>
      <div className="demo-note"><Sparkles size={17} /><p><strong>Preview mode</strong> Event listings created here are saved in this browser. Connect Supabase to load shared community listings.</p></div>
    </section>
  )
}

function EmptyState({ view, onReset }) {
  return <div className="empty-state"><span className="empty-icon"><Compass size={22} /></span><h3>{view === 'Saved' ? 'Your shortlist is taking shape.' : 'No events found just yet.'}</h3><p>{view === 'Saved' ? 'Tap the bookmark on any event to keep it close.' : 'Try another search or widen your filters.'}</p><button type="button" onClick={onReset}>Explore all events <ArrowRight size={15} /></button></div>
}

function CreateEventModal({ onClose, onSubmit }) {
  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(new FormData(event.currentTarget))
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="create-modal" role="dialog" aria-modal="true" aria-labelledby="create-event-title">
        <div className="modal-heading"><div><span className="section-kicker">PUT IT ON THE CIRCUIT</span><h2 id="create-event-title">Create an event</h2></div><button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20} /></button></div>
        <form onSubmit={handleSubmit}>
          <label className="form-field form-wide">Event name<input name="title" placeholder="e.g. Nairobi AI Builders Night" required maxLength="80" /></label>
          <label className="form-field">Category<select name="category" defaultValue="Meetup"><option>Meetup</option><option>Hackathon</option><option>Workshop</option><option>Conference</option></select></label>
          <label className="form-field">City<select name="city" defaultValue="Nairobi"><option>Nairobi</option><option>Mombasa</option><option>Kisumu</option><option>Online</option></select></label>
          <label className="form-field">Event date<input name="date" type="date" min={today} required /></label>
          <label className="form-field">Registration deadline<input name="deadline" type="date" min={today} required /></label>
          <label className="form-field form-wide">Venue<input name="venue" placeholder="Venue or online platform" required /></label>
          <label className="form-field form-wide">Short description<textarea name="description" rows="3" placeholder="What will people make, learn, or meet?" required maxLength="160" /></label>
          <label className="form-field form-wide">Registration link<input name="registrationUrl" type="url" placeholder="https://" /></label>
          <label className="form-field form-wide">Organizer name<input name="organizer" placeholder="Your community or organization" /></label>
          <div className="modal-actions"><button type="button" className="cancel-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button"><Plus size={16} /> Publish event</button></div>
        </form>
      </section>
    </div>
  )
}

export default App
