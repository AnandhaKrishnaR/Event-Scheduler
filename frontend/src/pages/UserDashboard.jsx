import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function UserDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ total: 0, upcoming: 0, pending: 0 })
  const [recentEvents, setRecentEvents] = useState([])

  useEffect(() => {
    if (user?.user_id) {
      loadDashboard()
    }
  }, [user])

  const loadDashboard = async () => {
    if (!user?.user_id) return
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/users/${user.user_id}/events/`)
      const events = response.data

      const total = events.length
      const upcoming = events.filter(e => e.status === 'approved' && new Date(e.date) > new Date()).length
      const pending = events.filter(e => e.status === 'pending').length

      setStats({ total, upcoming, pending })
      setRecentEvents(events.slice(0, 5))
    } catch (error) {
      console.error('Error loading dashboard:', error)
    }
  }

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
          <h1 className="text-mono">Welcome back, {user.name}! 👋</h1>
          <p className="h4 mb-4">Your Dashboard</p>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-4 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="card-title">{stats.total}</h3>
              <p className="card-text text-mono">Total My Events</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="card-title">{stats.upcoming}</h3>
              <p className="card-text text-mono">Upcoming Events</p>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3">
          <div className="card text-center">
            <div className="card-body">
              <h3 className="card-title">{stats.pending}</h3>
              <p className="card-text text-mono">Pending Approval</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <h5 className="text-mono">Quick Actions</h5>
          <div className="d-flex gap-2 flex-wrap">
            <Link to="/events" className="btn btn-dark">Submit New Event</Link>
            <Link to="/schedule" className="btn btn-outline-dark">View Schedule</Link>
            <Link to="/venues" className="btn btn-outline-dark">Browse Venues</Link>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <h5 className="text-mono">My Recent Events</h5>
          {recentEvents.length > 0 ? (
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Event Name</th>
                        <th>Venue</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEvents.map((event, index) => (
                        <tr key={event.schedule_id || event.event_id || index}>
                          <td>{event.event_name}</td>
                          <td>{event.venue_name}</td>
                          <td>{event.date}</td>
                          <td>{getStatusBadge(event.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-end mt-3">
                  <Link to="/my-events" className="btn btn-outline-dark">View All</Link>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-secondary">No events yet. <Link to="/events">Submit your first event!</Link></p>
          )}
        </div>
      </div>
    </div>
  )
}