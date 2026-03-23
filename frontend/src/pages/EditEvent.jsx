import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Save } from 'lucide-react'

const facilities = ['projector', 'mic', 'computers', 'whiteboard', 'stage']

export default function EditEvent() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [formData, setFormData] = useState({
    event_name: '',
    expected_participants: '',
    required_facility: '',
    duration: '',
  })

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/schedules/${id}/`)
      const e = response.data
      setFormData({
        event_name: e.event_name,
        expected_participants: e.expected_participants,
        required_facility: e.required_facility,
        duration: e.duration,
      })
    } catch (err) {
      setError('Event not found.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await axios.put(
        `http://127.0.0.1:8000/api/schedules/${id}/update/`,
        formData
      )
      setSuccess('Event updated successfully!')
      // Redirect to event details after 1.5 seconds
      setTimeout(() => navigate(`/event/${id}`), 1500)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update event.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="py-5">
      <div className="container">

        {/* Back Button */}
        <button
          className="btn btn-outline-dark d-flex align-items-center gap-2 mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Header */}
        <div className="mb-4">
          <p className="text-mono text-secondary mb-1">Edit</p>
          <h1 className="fw-bold">Edit Event</h1>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <span className="spinner-border"></span>
          </div>
        ) : (
          <div className="row justify-content-center">
            <div className="col-lg-7">

              {/* Success Alert */}
              {success && (
                <div className="alert alert-success mb-4">
                  ✅ {success}
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="alert alert-danger mb-4">
                  ❌ {error}
                </div>
              )}

              <div className="card p-4">
                <h5 className="fw-semibold mb-4">📝 Update Event Details</h5>
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">

                    <div className="col-12">
                      <label className="form-label small fw-medium">Event Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.event_name}
                        onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Expected Participants</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.expected_participants}
                        onChange={(e) => setFormData({ ...formData, expected_participants: e.target.value })}
                        required
                        min="1"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-medium">Duration (hours)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        required
                        min="1"
                        max="8"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-medium">Required Facility</label>
                      <select
                        className="form-select"
                        value={formData.required_facility}
                        onChange={(e) => setFormData({ ...formData, required_facility: e.target.value })}
                        required
                      >
                        <option value="">-- Select Facility --</option>
                        {facilities.map(f => (
                          <option key={f} value={f}>{f}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12 d-flex gap-2 mt-2">
                      <button
                        type="submit"
                        className="btn btn-dark d-flex align-items-center gap-2"
                        disabled={saving}
                      >
                        <Save size={16} />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-dark"
                        onClick={() => navigate(`/event/${id}`)}
                      >
                        Cancel
                      </button>
                    </div>

                  </div>
                </form>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}