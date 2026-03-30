import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { MapPin, Users, Wifi, Plus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function VenuePage() {
  const { user } = useAuth()
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVenues()
  }, [])

  const fetchVenues = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/venues/')
      setVenues(response.data)
    } catch (error) {
      console.error('Error fetching venues:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-5">
      <div className="container">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <p className="text-mono text-secondary mb-1">Facilities</p>
            <h1 className="fw-bold">Venue Management</h1>
          </div>
          {user?.role === 'admin' && (
            <Link
              to="/admin/venues"
              className="btn btn-dark d-flex align-items-center gap-2"
            >
              <Plus size={18} />
              Add Venue
            </Link>
          )}
        </div>

        {/* Venues Grid */}
        {loading ? (
          <div className="text-center py-5">
            <span className="spinner-border"></span>
          </div>
        ) : venues.length === 0 ? (
          <div className="alert alert-info">
            No venues found. Add one above!
          </div>
        ) : (
          <div className="row g-4">
            {venues.map(venue => (
              <div key={venue.venue_id} className="col-md-6">
                <div className="card h-100 p-4">

                  {/* Card Header */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="fw-semibold mb-0">🏢 {venue.venue_name}</h5>
                  </div>

                  {/* Card Details */}
                  <div className="d-flex flex-column gap-2 text-secondary small">
                    <div className="d-flex align-items-center gap-2">
                      <Users size={14} />
                      <span>{venue.capacity} people capacity</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <MapPin size={14} />
                      <span>{venue.location}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <Wifi size={14} />
                      <div className="d-flex gap-1 flex-wrap">
                        {venue.facilities.split(',').map(f => (
                          <span key={f} className="badge bg-light text-dark border">
                            {f.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}