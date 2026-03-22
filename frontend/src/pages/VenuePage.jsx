import { useState, useEffect } from 'react'
import axios from 'axios'
import { MapPin, Users, Wifi, Plus, X, Pencil, Trash2 } from 'lucide-react'

export default function VenuePage() {
  const [venues, setVenues] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingVenue, setEditingVenue] = useState(null)
  const [formData, setFormData] = useState({
    venue_name: '',
    capacity: '',
    location: '',
    facilities: ''
  })

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingVenue) {
        // ✅ Fixed URL
        await axios.put(`http://127.0.0.1:8000/api/venues/${editingVenue.venue_id}/update/`, formData)
      } else {
        await axios.post('http://127.0.0.1:8000/api/venues/create/', formData)
      }
      fetchVenues()
      setShowForm(false)
      setEditingVenue(null)
      setFormData({ venue_name: '', capacity: '', location: '', facilities: '' })
    } catch (error) {
      console.error('Error saving venue:', error)
    }
  }

  const handleEdit = (venue) => {
    setEditingVenue(venue)
    setFormData({
      venue_name: venue.venue_name,
      capacity: venue.capacity,
      location: venue.location,
      facilities: venue.facilities
    })
    setShowForm(true)
  }

  const handleDelete = async (venueId) => {
    if (window.confirm('Are you sure you want to delete this venue?')) {
      try {
        // ✅ Fixed URL
        await axios.delete(`http://127.0.0.1:8000/api/venues/${venueId}/delete/`)
        fetchVenues()
      } catch (error) {
        console.error('Error deleting venue:', error)
      }
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
          <button
            className="btn btn-dark d-flex align-items-center gap-2"
            onClick={() => {
              setShowForm(!showForm)
              setEditingVenue(null)
              setFormData({ venue_name: '', capacity: '', location: '', facilities: '' })
            }}
          >
            {showForm ? <X size={18} /> : <Plus size={18} />}
            {showForm ? 'Close' : 'Add Venue'}
          </button>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="card p-4 mb-4">
            <h5 className="fw-semibold mb-4">
              {editingVenue ? 'Edit Venue' : 'Add New Venue'}
            </h5>
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Venue Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.venue_name}
                    onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Capacity</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Facilities</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.facilities}
                    onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                    placeholder="e.g., projector,mic,whiteboard"
                    required
                  />
                </div>
                <div className="col-12 d-flex gap-2">
                  <button type="submit" className="btn btn-dark">
                    {editingVenue ? 'Update Venue' : 'Add Venue'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={() => {
                      setShowForm(false)
                      setEditingVenue(null)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

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
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-dark"
                        onClick={() => handleEdit(venue)}
                        title="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(venue.venue_id)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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