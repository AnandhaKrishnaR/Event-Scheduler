import { useState, useEffect } from 'react'
import axios from 'axios'
import { Calendar, Users, CheckCircle, Clock, MapPin } from 'lucide-react'

export default function AdminPage() {
  const [schedules, setSchedules] = useState([])
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [schedulesRes, venuesRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/schedules/'),
        axios.get('http://127.0.0.1:8000/api/venues/')
      ])
      setSchedules(schedulesRes.data)
      setVenues(venuesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Stats calculations
  const totalEvents = schedules.length
  const totalVenues = venues.length
  const today = new Date().toISOString().split('T')[0]
  const upcomingEvents = schedules.filter(s => s.date >= today).length
  const pastEvents = schedules.filter(s => s.date < today).length

  // Recent 5 events
  const recentSchedules = schedules.slice(-5).reverse()

  // Upcoming 5 events
  const upcomingSchedules = schedules
    .filter(s => s.date >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5)

  return (
    <div className="py-5">
      <div className="container">

        {/* Header */}
        <div className="mb-4">
          <p className="text-mono text-secondary mb-1">Administration</p>
          <h1 className="fw-bold">Admin Dashboard</h1>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <span className="spinner-border"></span>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="row g-4 mb-5">
              <div className="col-md-3">
                <div className="card p-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                      style={{ width: 48, height: 48 }}>
                      <Calendar size={24} />
                    </div>
                    <div>
                      <div className="h3 mb-0 fw-bold">{totalEvents}</div>
                      <div className="text-secondary small">Total Events</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card p-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                      style={{ width: 48, height: 48 }}>
                      <Clock size={24} />
                    </div>
                    <div>
                      <div className="h3 mb-0 fw-bold">{upcomingEvents}</div>
                      <div className="text-secondary small">Upcoming Events</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card p-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                      style={{ width: 48, height: 48 }}>
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <div className="h3 mb-0 fw-bold">{pastEvents}</div>
                      <div className="text-secondary small">Past Events</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card p-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center"
                      style={{ width: 48, height: 48 }}>
                      <Users size={24} />
                    </div>
                    <div>
                      <div className="h3 mb-0 fw-bold">{totalVenues}</div>
                      <div className="text-secondary small">Total Venues</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4">

              {/* Upcoming Events Table */}
              <div className="col-lg-7">
                <div className="card">
                  <div className="card-header bg-white py-3">
                    <h5 className="mb-0 fw-semibold">Upcoming Events</h5>
                  </div>
                  <div className="card-body p-0">
                    {upcomingSchedules.length === 0 ? (
                      <div className="p-4 text-center text-secondary">
                        No upcoming events found.
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-admin mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Event</th>
                              <th>Venue</th>
                              <th>Date</th>
                              <th>Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {upcomingSchedules.map((s) => (
                              <tr key={s.schedule_id}>
                                <td className="fw-medium">{s.event_name}</td>
                                <td>
                                  <div className="d-flex align-items-center gap-1">
                                    <MapPin size={12} className="text-secondary" />
                                    {s.venue_name}
                                  </div>
                                </td>
                                <td>{s.date}</td>
                                <td>{s.start_time} - {s.end_time}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Events */}
              <div className="col-lg-5">
                <div className="card">
                  <div className="card-header bg-white py-3">
                    <h5 className="mb-0 fw-semibold">Recent Events</h5>
                  </div>
                  <div className="card-body p-0">
                    {recentSchedules.length === 0 ? (
                      <div className="p-4 text-center text-secondary">
                        No events found.
                      </div>
                    ) : (
                      <ul className="list-group list-group-flush">
                        {recentSchedules.map((s) => (
                          <li key={s.schedule_id}
                            className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <div className="fw-medium">{s.event_name}</div>
                              <div className="text-secondary small">{s.venue_name} — {s.date}</div>
                            </div>
                            <span className={`status-badge ${s.date >= today ? 'status-approved' : 'status-rejected'}`}>
                              {s.date >= today ? 'upcoming' : 'past'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
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