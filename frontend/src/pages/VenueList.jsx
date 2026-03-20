import { useState, useEffect } from 'react'
import axios from 'axios'

function VenueList() {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/venues/')
      .then(res => setVenues(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h3 className="mb-4 text-primary fw-bold">🏛️ Available Venues</h3>

      {loading ? (
        <div className="text-center">
          <span className="spinner-border text-primary"></span>
        </div>
      ) : (
        <div className="row">
          {venues.map(v => (
            <div className="col-md-6 mb-4" key={v.venue_id}>
              <div className="card shadow-sm h-100">
                <div className="card-header bg-primary text-white fw-bold">
                  🏢 {v.venue_name}
                </div>
                <div className="card-body">
                  <p><strong>Capacity:</strong> {v.capacity} people</p>
                  <p><strong>Location:</strong> {v.location}</p>
                  <p><strong>Facilities:</strong> {v.facilities}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default VenueList