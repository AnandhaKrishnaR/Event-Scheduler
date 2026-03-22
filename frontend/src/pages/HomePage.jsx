import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Calendar, Users, MapPin, Clock, ArrowRight } from 'lucide-react'

export default function HomePage() {
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

  // Get only latest 3 events for upcoming section
  const upcomingEvents = schedules.slice(-3).reverse()

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <p className="text-mono text-secondary mb-3">College Event Scheduler</p>
              <h1 className="display-4 fw-bold mb-4" style={{ letterSpacing: '-0.02em' }}>
                Discover & Schedule Campus Events
              </h1>
              <p className="lead text-secondary mb-4">
                Your central hub for all college events. Find workshops, concerts, career fairs, and more.
              </p>
              <div className="d-flex gap-3">
                <Link to="/events" className="btn btn-dark btn-lg px-4">Browse Events</Link>
                <Link to="/schedule" className="btn btn-outline-dark btn-lg px-4">View Calendar</Link>
              </div>
            </div>

            {/* Stats from Database */}
            <div className="col-lg-6 mt-5 mt-lg-0">
              {loading ? (
                <div className="text-center">
                  <span className="spinner-border"></span>
                </div>
              ) : (
                <div className="row g-3">
                  <div className="col-6">
                    <div className="card stat-card">
                      <div className="stat-number">{schedules.length}</div>
                      <div className="stat-label mt-2">Events Scheduled</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card stat-card">
                      <div className="stat-number">{venues.length}</div>
                      <div className="stat-label mt-2">Available Venues</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card stat-card">
                      <div className="stat-number">
                        {schedules.reduce((sum, s) => sum + 1, 0) > 0
                          ? [...new Set(schedules.map(s => s.venue_name))].length
                          : 0}
                      </div>
                      <div className="stat-label mt-2">Venues In Use</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="card stat-card">
                      <div className="stat-number">
                        {schedules.filter(s => s.date >= new Date().toISOString().split('T')[0]).length}
                      </div>
                      <div className="stat-label mt-2">Upcoming Events</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events from Database */}
      <section className="py-5">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="section-title mb-0">Recent Events</h2>
            <Link to="/events" className="btn btn-link text-dark text-decoration-none d-flex align-items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-4">
              <span className="spinner-border"></span>
            </div>
          ) : upcomingEvents.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-secondary">No events scheduled yet.</p>
              <Link to="/events" className="btn btn-dark btn-sm">Schedule First Event</Link>
            </div>
          ) : (
            <div className="row g-4">
              {upcomingEvents.map((s) => (
                <div key={s.schedule_id} className="col-md-4">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <h2 className="section-title text-center mb-5">How It Works</h2>
          <div className="row g-4">
            <div className="col-md-4 text-center">
              <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 64, height: 64 }}>
                <Calendar size={28} />
              </div>
              <h5 className="fw-semibold">Browse Events</h5>
              <p className="text-secondary small">Explore all scheduled events on campus.</p>
            </div>
            <div className="col-md-4 text-center">
              <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 64, height: 64 }}>
                <Users size={28} />
              </div>
              <h5 className="fw-semibold">Submit Your Event</h5>
              <p className="text-secondary small">Fill in your event details and let the system find the best venue.</p>
            </div>
            <div className="col-md-4 text-center">
              <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 64, height: 64 }}>
                <MapPin size={28} />
              </div>
              <h5 className="fw-semibold">Auto Venue Assignment</h5>
              <p className="text-secondary small">System automatically assigns the best available venue with no conflicts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <Calendar size={20} />
                <span className="fw-bold">CampusEvents</span>
              </div>
              <p className="text-secondary small">Your central hub for college events.</p>
            </div>
            <div className="col-md-2">
              <h6 className="text-mono text-secondary mb-3">Navigation</h6>
              <ul className="list-unstyled small">
                <li className="mb-2"><Link to="/" className="text-dark text-decoration-none">Home</Link></li>
                <li className="mb-2"><Link to="/events" className="text-dark text-decoration-none">Events</Link></li>
                <li className="mb-2"><Link to="/schedule" className="text-dark text-decoration-none">Schedule</Link></li>
                <li className="mb-2"><Link to="/venues" className="text-dark text-decoration-none">Venues</Link></li>
              </ul>
            </div>
            <div className="col-md-2">
              <h6 className="text-mono text-secondary mb-3">Account</h6>
              <ul className="list-unstyled small">
                <li className="mb-2"><Link to="/login" className="text-dark text-decoration-none">Login</Link></li>
                <li className="mb-2"><Link to="/login" className="text-dark text-decoration-none">Sign Up</Link></li>
                <li className="mb-2"><Link to="/admin" className="text-dark text-decoration-none">Admin</Link></li>
              </ul>
            </div>
          </div>
          <hr className="my-4" />
          <p className="text-secondary small mb-0">2026 CampusEvents. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}