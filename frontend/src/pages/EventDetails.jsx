import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import {
  Calendar, Clock, MapPin, Users, Wifi,
  ArrowLeft, User, Building, Wrench, Trash2, Pencil
} from 'lucide-react'

export default function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchEventDetail()
  }, [id])

  const fetchEventDetail = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/schedules/${id}/`)
      setEvent(response.data)
    } catch (err) {
      setError('Event not found.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      setDeleting(true)
      try {
        await axios.delete(`http://127.0.0.1:8000/api/schedules/${id}/delete/`)
        navigate('/events')
      } catch (err) {
        setError('Failed to delete event.')
        setDeleting(false)
      }
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="py-5">
      <div className="container">

        {/* Top Bar — Back + Action Buttons */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <button
            className="btn btn-outline-dark d-flex align-items-center gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={18} />
            Back
          </button>

          {event && (
            <div className="d-flex gap-2">
              <Link
                to={`/event/${id}/edit`}
                className="btn btn-outline-dark d-flex align-items-center gap-2"
              >
                <Pencil size={18} />
                Edit Event
              </Link>
              <button
                className="btn btn-outline-danger d-flex align-items-center gap-2"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 size={18} />
                {deleting ? 'Deleting...' : 'Delete Event'}
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-5">
            <span className="spinner-border"></span>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <>
            {/* Page Header */}
            <div className="mb-4">
              <p className="text-mono text-secondary mb-1">Event Information</p>
              <h1 className="fw-bold">{event.event_name}</h1>
              <span className={`badge ${event.date >= today ? 'bg-success' : 'bg-secondary'}`}>
                {event.date >= today ? 'Upcoming' : 'Past'}
              </span>
            </div>

            <div className="row g-4">

              {/* Left Column - Event Details */}
              <div className="col-lg-7">
                <div className="card p-4 mb-4">
                  <h5 className="fw-semibold mb-4">📋 Event Details</h5>
                  <div className="row g-3">

                    <div className="col-md-6">
                      <div className="d-flex align-items-center gap-2 text-secondary small mb-1">
                        <User size={14} />
                        <span className="text-mono">Organizer</span>
                      </div>
                      <div className="fw-medium">{event.organizer}</div>
                    </div>

                    <div className="col-md-6">
                      <div className="d-flex align-items-center gap-2 text-secondary small mb-1">
                        <Building size={14} />
                        <span className="text-mono">Department</span>
                      </div>
                      <div className="fw-medium">{event.department}</div>
                    </div>

                    <div className="col-md-6">
                      <div className="d-flex align-items-center gap-2 text-secondary small mb-1">
                        <Users size={14} />
                        <span className="text-mono">Expected Participants</span>
                      </div>
                      <div className="fw-medium">{event.expected_participants} people</div>
                    </div>

                    <div className="col-md-6">
                      <div className="d-flex align-items-center gap-2 text-secondary small mb-1">
                        <Clock size={14} />
                        <span className="text-mono">Duration</span>
                      </div>
                      <div className="fw-medium">{event.duration} hour{event.duration > 1 ? 's' : ''}</div>
                    </div>

                    <div className="col-md-6">
                      <div className="d-flex align-items-center gap-2 text-secondary small mb-1">
                        <Wrench size={14} />
                        <span className="text-mono">Required Facility</span>
                      </div>
                      <div className="fw-medium">
                        <span className="badge bg-light text-dark border">
                          {event.required_facility}
                        </span>
                      </div>
                    </div>

                    {event.preferred_time && (
                      <div className="col-md-6">
                        <div className="d-flex align-items-center gap-2 text-secondary small mb-1">
                          <Clock size={14} />
                          <span className="text-mono">Preferred Start Time</span>
                        </div>
                        <div className="fw-medium text-warning">
                          {event.preferred_time}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Schedule Details */}
                <div className="card p-4">
                  <h5 className="fw-semibold mb-4">🗓️ Schedule Details</h5>
                  <div className="row g-3">

                    <div className="col-md-6">
                      <div className="d-flex align-items-center gap-2 text-secondary small mb-1">
                        <Calendar size={14} />
                        <span className="text-mono">Date</span>
                      </div>
                      <div className="fw-medium">{event.date}</div>
                    </div>

                    <div className="col-md-6">
                      <div className="d-flex align-items-center gap-2 text-secondary small mb-1">
                        <Clock size={14} />
                        <span className="text-mono">Time</span>
                      </div>
                      <div className="fw-medium">{event.start_time} — {event.end_time}</div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Right Column - Venue Details */}
              <div className="col-lg-5">
                <div className="card p-4 h-100">
                  <h5 className="fw-semibold mb-4">🏢 Assigned Venue</h5>

                  <h4 className="fw-bold mb-3">{event.venue_name}</h4>

                  <div className="d-flex flex-column gap-3 text-secondary small">
                    <div className="d-flex align-items-center gap-2">
                      <MapPin size={14} />
                      <div>
                        <div className="text-mono mb-1">Location</div>
                        <div className="fw-medium text-dark">{event.location}</div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <Users size={14} />
                      <div>
                        <div className="text-mono mb-1">Capacity</div>
                        <div className="fw-medium text-dark">{event.capacity} people</div>
                      </div>
                    </div>

                    <div className="d-flex align-items-start gap-2">
                      <Wifi size={14} className="mt-1" />
                      <div>
                        <div className="text-mono mb-1">Facilities</div>
                        <div className="d-flex gap-1 flex-wrap mt-1">
                          {event.facilities.split(',').map(f => (
                            <span key={f} className="badge bg-light text-dark border">
                              {f.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  )
}