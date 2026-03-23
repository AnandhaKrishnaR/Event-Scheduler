import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Calendar, Clock, MapPin, Search, Plus, X } from 'lucide-react'

const months = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December']
const facilities = ['projector', 'mic', 'computers', 'whiteboard', 'stage']

export default function EventsPage() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    event_name: '',
    organizer: '',
    department: '',
    expected_participants: '',
    required_facility: '',
    duration: '',
    preferred_month: ''
  })

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    setError(null)
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/events/', formData)
      setResult(response.data)
      setShowForm(false)
      fetchSchedules()
      setFormData({
        event_name: '', organizer: '', department: '',
        expected_participants: '', required_facility: '',
        duration: '', preferred_month: ''
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.')
    } finally {
      setSubmitting(false)
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
          <button
            className="btn btn-dark d-flex align-items-center gap-2"
            onClick={() => {
              setShowForm(!showForm)
              setResult(null)
              setError(null)
            }}
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? 'Close' : 'Submit Event'}
          </button>
        </div>

        {/* Success Result */}
        {result && (
          <div className="card border-success p-4 mb-4">
            <h5 className="text-success fw-semibold mb-3">✅ {result.message}</h5>
            <div className="row g-2 small">
              <div className="col-md-4"><strong>Event:</strong> {result.event}</div>
              <div className="col-md-4"><strong>Venue:</strong> {result.venue}</div>
              <div className="col-md-4"><strong>Location:</strong> {result.location}</div>
              <div className="col-md-4"><strong>Capacity:</strong> {result.capacity}</div>
              <div className="col-md-4"><strong>Date:</strong> {result.date}</div>
              <div className="col-md-4"><strong>Time:</strong> {result.start_time} - {result.end_time}</div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-danger mb-4">❌ {error}</div>
        )}

        {/* Event Submission Form */}
        {showForm && (
          <div className="card p-4 mb-4">
            <h5 className="fw-semibold mb-4">Submit New Event</h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Event Name</label>
                  <input type="text" className="form-control"
                    value={formData.event_name}
                    onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                    required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Organizer Name</label>
                  <input type="text" className="form-control"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Department</label>
                  <input type="text" className="form-control"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Expected Participants</label>
                  <input type="number" className="form-control"
                    value={formData.expected_participants}
                    onChange={(e) => setFormData({ ...formData, expected_participants: e.target.value })}
                    required min="1" />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-medium">Required Facility</label>
                  <select className="form-select"
                    value={formData.required_facility}
                    onChange={(e) => setFormData({ ...formData, required_facility: e.target.value })}
                    required>
                    <option value="">-- Select --</option>
                    {facilities.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-medium">Duration (hours)</label>
                  <input type="number" className="form-control"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required min="1" max="8" />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-medium">Preferred Month</label>
                  <select className="form-select"
                    value={formData.preferred_month}
                    onChange={(e) => setFormData({ ...formData, preferred_month: e.target.value })}
                    required>
                    <option value="">-- Select Month --</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-dark" disabled={submitting}>
                    {submitting
                      ? <><span className="spinner-border spinner-border-sm me-2"></span>Scheduling...</>
                      : 'Schedule Event'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

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