import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Search, Eye, Pencil, Trash2, Calendar, Clock, MapPin } from 'lucide-react'

export default function ManageEvents() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleting, setDeleting] = useState(null)
  const navigate = useNavigate()

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

  const handleDelete = async (scheduleId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setDeleting(scheduleId)
      try {
        await axios.delete(`http://127.0.0.1:8000/api/schedules/${scheduleId}/delete/`)
        fetchSchedules()
      } catch (error) {
        console.error('Error deleting event:', error)
      } finally {
        setDeleting(null)
      }
    }
  }

  const today = new Date().toISOString().split('T')[0]

  const filteredSchedules = schedules.filter(s =>
    s.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.venue_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="py-5">
      <div className="container">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <p className="text-mono text-secondary mb-1">Administration</p>
            <h1 className="fw-bold">Manage Events</h1>
          </div>
          <div className="d-flex gap-2">
            <Link to="/admin" className="btn btn-outline-dark">
              ← Admin Dashboard
            </Link>
            <Link to="/events" className="btn btn-dark">
              + New Event
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card p-3 text-center">
              <div className="h4 fw-bold mb-0">{schedules.length}</div>
              <div className="text-secondary small">Total Events</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 text-center">
              <div className="h4 fw-bold mb-0">
                {schedules.filter(s => s.date >= today).length}
              </div>
              <div className="text-secondary small">Upcoming Events</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-3 text-center">
              <div className="h4 fw-bold mb-0">
                {schedules.filter(s => s.date < today).length}
              </div>
              <div className="text-secondary small">Past Events</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="card p-3 mb-4">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <Search size={18} className="text-secondary" />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by event name or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

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
                    <th>Venue</th>
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
                      <td>
                        <span className={`status-badge ${s.date >= today ? 'status-approved' : 'status-rejected'}`}>
                          {s.date >= today ? 'upcoming' : 'past'}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Link
                            to={`/event/${s.schedule_id}`}
                            className="btn btn-sm btn-outline-dark"
                            title="View"
                          >
                            <Eye size={14} />
                          </Link>
                          <Link
                            to={`/event/${s.schedule_id}/edit`}
                            className="btn btn-sm btn-outline-dark"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </Link>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete"
                            disabled={deleting === s.schedule_id}
                            onClick={() => handleDelete(s.schedule_id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}