import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Calendar, Clock, MapPin, Search, Plus, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function EventsPage() {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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

  const filteredSchedules = schedules.filter(s =>
    s.event_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="py-5">
      <div className="container">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <p className="text-mono text-secondary mb-1">Discover</p>
            <h1 className="fw-bold">Campus Events</h1>
          </div>
          {user ? (
            <Link
              to="/create-event"
              className="btn btn-dark d-flex align-items-center gap-2"
            >
              <Plus size={18} />
              Add Event
            </Link>
          ) : (
            <Link
              to="/login"
              className="btn btn-outline-dark d-flex align-items-center gap-2"
            >
              <LogIn size={18} />
              Login to Add Event
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="card p-3 mb-4">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <Search size={18} className="text-secondary" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Events Grid from Database */}
        {loading ? (
          <div className="text-center py-5">
            <span className="spinner-border"></span>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-secondary">
              {searchQuery
                ? 'No events found matching your search.'
                : 'No events scheduled yet. Be the first to submit one!'}
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredSchedules.map((s) => (
              <div key={s.schedule_id} className="col-md-6 col-lg-4">
                <div className="card h-100 p-4">
                  <span
                    className="badge bg-secondary badge-category mb-3"
                    style={{ width: 'fit-content' }}
                  >
                    Scheduled
                  </span>
                  <h5 className="fw-semibold mb-3">{s.event_name}</h5>
                  <div className="d-flex flex-column gap-2 text-secondary small">
                    <div className="d-flex align-items-center gap-2">
                      <MapPin size={14} />
                      <span>{s.venue_name}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Calendar size={14} />
                      <span>{s.date}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Clock size={14} />
                      <span>{s.start_time} - {s.end_time}</span>
                    </div>
                  </div>
                  {/* ✅ View Details Button */}
                  <Link
                    to={`/event/${s.schedule_id}`}
                    className="btn btn-outline-dark btn-sm mt-3"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}