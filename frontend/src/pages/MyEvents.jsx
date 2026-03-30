import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function MyEvents() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (user?.user_id) {
      loadEvents()
    }
  }, [user])

  const loadEvents = async () => {
    if (!user?.user_id) return
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/users/${user.user_id}/events/`)
      setEvents(response.data)
    } catch (error) {
      console.error('Error loading events:', error)
    }
  }

  const handleDelete = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return

    try {
      await axios.delete(`http://127.0.0.1:8000/api/schedules/${scheduleId}/delete/`)
      loadEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
    }
  }

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true
    return event.status === filter
  })

  const getStatusBadge = (status) => {
    const classes = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected'
    }
    return <span className={`badge ${classes[status] || ''}`}>{status}</span>
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <p className="text-mono">My Events</p>
          <h1 className="h3 mb-4">My Event Requests</h1>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn ${filter === 'all' ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`btn ${filter === 'pending' ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setFilter('pending')}
            >
              Pending
            </button>
            <button
              type="button"
              className={`btn ${filter === 'approved' ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setFilter('approved')}
            >
              Approved
            </button>
            <button
              type="button"
              className={`btn ${filter === 'rejected' ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setFilter('rejected')}
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          {filteredEvents.length > 0 ? (
            <div className="row">
              {filteredEvents.map((event, index) => (
                <div key={event.schedule_id || event.event_id || index} className="col-md-6 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{event.event_name}</h5>
                        {getStatusBadge(event.status)}
                      </div>
                      <p className="card-text small text-secondary mb-2">
                        <strong>Venue:</strong> {event.venue_name}
                      </p>
                      <p className="card-text small text-secondary mb-3">
                        <strong>Date & Time:</strong> {event.date} {event.start_time && `at ${event.start_time}`}
                      </p>
                      <div className="d-flex gap-2">
                        {event.status === 'approved' && event.schedule_id && (
                          <>
                            <Link to={`/event/${event.schedule_id}/edit`} className="btn btn-sm btn-outline-dark">
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(event.schedule_id)}
                              className="btn btn-sm btn-outline-danger"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-secondary">No events found in this category.</p>
              <Link to="/events" className="btn btn-dark">Submit New Event</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}