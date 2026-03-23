import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { ChevronLeft, ChevronRight, List, Grid, Calendar, Clock, MapPin } from 'lucide-react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('calendar')

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/schedules/')
      setSchedules(response.data)
    } catch (error) {
      console.error('Error fetching schedules:', error)
    } finally {
      setLoading(false)
    }
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getEventsForDate = (dateStr) => {
    return schedules.filter(s => s.date === dateStr)
  }

  // Filter schedules by current month and year
  const currentMonthSchedules = schedules.filter(s => {
    const eventDate = new Date(s.date)
    return eventDate.getFullYear() === year && eventDate.getMonth() === month
  })

  const calendarDays = []

  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i
    calendarDays.push({ day, isCurrentMonth: false, date: null })
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    calendarDays.push({ day: i, isCurrentMonth: true, date: dateStr })
  }

  // Next month days
  const remainingDays = 42 - calendarDays.length
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false, date: null })
  }

  const today = new Date()
  const isToday = (day, isCurrentMonth) => {
    return isCurrentMonth &&
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
  }

  return (
    <div className="py-5">
      <div className="container">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <p className="text-mono text-secondary mb-1">Your Schedule</p>
            <h1 className="fw-bold">Event Calendar</h1>
          </div>
          <div className="btn-group">
            <button
              className={`btn ${viewMode === 'calendar' ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setViewMode('calendar')}
            >
              <Grid size={18} />
            </button>
            <button
              className={`btn ${viewMode === 'list' ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <span className="spinner-border"></span>
          </div>
        ) : (
          <>
            {/* Calendar Card */}
            <div className="card mb-4">
              <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
                <button className="btn btn-outline-secondary btn-sm" onClick={prevMonth}>
                  <ChevronLeft size={18} />
                </button>
                <h5 className="mb-0 fw-semibold">{MONTHS[month]} {year}</h5>
                <button className="btn btn-outline-secondary btn-sm" onClick={nextMonth}>
                  <ChevronRight size={18} />
                </button>
              </div>

              {viewMode === 'calendar' ? (
                <div className="card-body p-0">
                  {/* Day Headers */}
                  <div className="calendar-grid" style={{ gridTemplateRows: 'auto' }}>
                    {DAYS.map((day) => (
                      <div key={day} className="calendar-header">{day}</div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="calendar-grid">
                    {calendarDays.map((item, index) => {
                      const events = item.date ? getEventsForDate(item.date) : []
                      return (
                        <div
                          key={index}
                          className={`calendar-day 
                            ${!item.isCurrentMonth ? 'other-month' : ''} 
                            ${isToday(item.day, item.isCurrentMonth) ? 'today' : ''}`}
                        >
                          <div className="calendar-day-number">{item.day}</div>
                          {events.length > 0 && (
                            <div className="mt-1">
                              {events.map((e) => (
                                // ✅ Clickable event name in calendar
                                <Link
                                  key={e.schedule_id}
                                  to={`/event/${e.schedule_id}`}
                                  className="text-dark text-decoration-none d-block"
                                  title={e.event_name}
                                >
                                  <span className="calendar-event-dot"></span>
                                  <span
                                    style={{ fontSize: '0.65rem' }}
                                    className="text-truncate d-inline-block"
                                  >
                                    {e.event_name.length > 10
                                      ? e.event_name.substring(0, 10) + '...'
                                      : e.event_name}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                // List View — filtered by current month
                <div className="card-body">
                  {currentMonthSchedules.length === 0 ? (
                    <div className="text-center text-secondary py-4">
                      No events scheduled in {MONTHS[month]} {year}.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {currentMonthSchedules.map((s) => (
                        <div
                          key={s.schedule_id}
                          className="d-flex justify-content-between align-items-center p-3 border rounded"
                        >
                          <div>
                            <span className="badge bg-secondary badge-category me-2">
                              Scheduled
                            </span>
                            {/* ✅ Clickable event name in list view */}
                            <Link
                              to={`/event/${s.schedule_id}`}
                              className="fw-semibold text-dark text-decoration-none"
                            >
                              {s.event_name}
                            </Link>
                          </div>
                          <div className="d-flex gap-4 text-secondary small">
                            <div className="d-flex align-items-center gap-1">
                              <MapPin size={14} />
                              <span>{s.venue_name}</span>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                              <Calendar size={14} />
                              <span>{s.date}</span>
                            </div>
                            <div className="d-flex align-items-center gap-1">
                              <Clock size={14} />
                              <span>{s.start_time} - {s.end_time}</span>
                            </div>
                            {/* ✅ View Details button */}
                            <Link
                              to={`/event/${s.schedule_id}`}
                              className="btn btn-outline-dark btn-sm"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="d-flex align-items-center gap-4 text-secondary small">
              <div className="d-flex align-items-center gap-2">
                <span className="calendar-event-dot"></span>
                <span>Event scheduled</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div style={{ width: 16, height: 16, backgroundColor: '#f0f0f0', borderRadius: 4 }}></div>
                <span>Today</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="fw-semibold">
                  {MONTHS[month]}: {currentMonthSchedules.length} event{currentMonthSchedules.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}