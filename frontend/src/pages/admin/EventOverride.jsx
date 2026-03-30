import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Search, AlertTriangle, Clock, MapPin, Calendar, X, CheckCircle } from 'lucide-react'

export default function EventOverride() {
  const [schedules, setSchedules] = useState([])
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [overrideForm, setOverrideForm] = useState(null)
  const [overrideData, setOverrideData] = useState({
    venue_id: '',
    start_time: '',
    end_time: ''
  })
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [schedulesRes, venuesRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/schedules/'),
        axios.get('http://127.0.0.1:8000/api/venues/')
      ])
      setSchedules(schedulesRes.data)
      setVenues(venuesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
      setErrorMessage('Failed to load data.')
    } finally {
      setLoading(false)
    }
  }

  const handleOverrideClick = (schedule) => {
    setOverrideForm(schedule.schedule_id)
    setOverrideData({
      venue_id: schedule.venue_id || '',
      start_time: schedule.start_time,
      end_time: schedule.end_time
    })
    setSuccessMessage(null)
    setErrorMessage(null)
  }

  const handleCancelOverride = () => {
    setOverrideForm(null)
    setOverrideData({ venue_id: '', start_time: '', end_time: '' })
  }

  const handleApplyOverride = async () => {
    setActionLoading(true)
    setSuccessMessage(null)
    setErrorMessage(null)
    try {
      const res = await axios.put(`http://127.0.0.1:8000/api/schedules/${overrideForm}/override/`, overrideData)
      setSuccessMessage(res.data)
      // Update the schedule in the list
      setSchedules(schedules.map(s =>
        s.schedule_id === overrideForm
          ? { ...s, venue_name: venues.find(v => v.venue_id === overrideData.venue_id)?.venue_name || s.venue_name, start_time: overrideData.start_time, end_time: overrideData.end_time }
          : s
      ))
      setOverrideForm(null)
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'Override failed.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelEvent = async (scheduleId) => {
    if (window.confirm('Are you sure you want to cancel this event?')) {
      setActionLoading(true)
      try {
        await axios.delete(`http://127.0.0.1:8000/api/schedules/${scheduleId}/delete/`)
        setSchedules(schedules.filter(s => s.schedule_id !== scheduleId))
        setOverrideForm(null)
      } catch (err) {
        setErrorMessage('Failed to cancel event.')
      } finally {
        setActionLoading(false)
      }
    }
  }

  const filteredSchedules = schedules.filter(s =>
    s.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.venue_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusBadge = (status) => {
    const classes = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected'
    }
    return <span className={`badge ${classes[status] || 'bg-secondary'}`}>{status || 'Scheduled'}</span>
  }

  return (
    <div className="py-5">
      <div className="container">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <p className="text-mono text-secondary mb-1">Administration</p>
            <h1 className="fw-bold">Conflict Override</h1>
          </div>
          <Link to="/admin" className="btn btn-outline-dark">← Back</Link>
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
              placeholder="Search events by name or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="alert alert-success mb-4">
            <CheckCircle size={18} className="me-2" />
            {successMessage.message}<br />
            <small>Event: {successMessage.event_name} | Venue: {successMessage.new_venue} | Time: {successMessage.start_time} - {successMessage.end_time}</small>
          </div>
        )}
        {errorMessage && (
          <div className="alert alert-danger mb-4">
            <AlertTriangle size={18} className="me-2" />
            {errorMessage}
          </div>
        )}

        {/* Events Table */}
        {loading ? (
          <div className="text-center py-5">
            <span className="spinner-border"></span>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            No events found.
          </div>
        ) : (
          <div className="card">
            <div className="table-responsive">
              <table className="table table-admin mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Event Name</th>
                    <th>Current Venue</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.map((s) => (
                    <tr key={s.schedule_id}>
                      <td className="text-secondary">{s.schedule_id}</td>
                      <td className="fw-medium">{s.event_name}</td>
                      <td>
                        <div className="d-flex align-items-center gap-1 text-secondary small">
                          <MapPin size={12} />
                          {s.venue_name}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1 text-secondary small">
                          <Calendar size={12} />
                          {s.date}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1 text-secondary small">
                          <Clock size={12} />
                          {s.start_time} - {s.end_time}
                        </div>
                      </td>
                      <td>{getStatusBadge(s.status)}</td>
                      <td>
                        <button
                          className="btn btn-outline-dark btn-sm"
                          onClick={() => handleOverrideClick(s)}
                          disabled={overrideForm === s.schedule_id}
                        >
                          Override
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Override Form */}
        {overrideForm && (
          <div className="card mt-3 p-4">
            <h5 className="fw-semibold mb-4">Override Schedule</h5>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-medium">Change Venue</label>
                <select
                  className="form-select"
                  value={overrideData.venue_id}
                  onChange={(e) => setOverrideData({ ...overrideData, venue_id: e.target.value })}
                >
                  <option value="">-- Select Venue --</option>
                  {venues.map(v => (
                    <option key={v.venue_id} value={v.venue_id}>
                      {v.venue_name} (Capacity: {v.capacity})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-medium">Start Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={overrideData.start_time}
                  onChange={(e) => setOverrideData({ ...overrideData, start_time: e.target.value })}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-medium">End Time</label>
                <input
                  type="time"
                  className="form-control"
                  value={overrideData.end_time}
                  onChange={(e) => setOverrideData({ ...overrideData, end_time: e.target.value })}
                />
              </div>
              <div className="col-12">
                <small className="text-secondary">College hours: 9:00 AM to 6:00 PM</small>
              </div>
            </div>
            <div className="d-flex gap-2 mt-4">
              <button
                className="btn btn-dark"
                onClick={handleApplyOverride}
                disabled={actionLoading}
              >
                {actionLoading ? 'Applying...' : 'Apply Override'}
              </button>
              <button
                className="btn btn-outline-danger"
                onClick={() => handleCancelEvent(overrideForm)}
                disabled={actionLoading}
              >
                Cancel Event
              </button>
              <button
                className="btn btn-outline-dark"
                onClick={handleCancelOverride}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}