import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const months = ['January','February','March','April','May','June',
                 'July','August','September','October','November','December']
const facilities = ['projector', 'mic', 'computers', 'whiteboard', 'stage']

export default function CreateEvent() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    event_name: '',
    organizer: '',
    department: '',
    expected_participants: '',
    required_facility: '',
    duration: '',
    preferred_month: ''
  })

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        organizer: user.name,
        department: user.department
      }))
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    setError(null)
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/events/', formData)
      setResult(response.data)
      // Redirect to events page after success
      setTimeout(() => navigate('/events'), 1500)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="py-5">
      <div className="container">

        {/* Back Button */}
        <button
          className="btn btn-outline-dark d-flex align-items-center gap-2 mb-4"
          onClick={() => navigate('/events')}
        >
          <ArrowLeft size={18} />
          Back to Events
        </button>

        {/* Header */}
        <div className="mb-4">
          <p className="text-mono text-secondary mb-1">Create</p>
          <h1 className="fw-bold">New Event</h1>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">

            {/* Success Result */}
            {result && (
              <div className="card border-warning p-4 mb-4">
                <h5 className="text-warning fw-semibold mb-2">✅ Event Submitted for Approval!</h5>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge status-pending">Pending</span>
                  <small className="text-secondary">An admin will review your request shortly.</small>
                </div>
                <div className="row g-2 small">
                  <div className="col-md-6"><strong>Event Name:</strong> {result.event_name}</div>
                  <div className="col-md-6"><strong>Event ID:</strong> {result.event_id}</div>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="alert alert-danger mb-4">❌ {error}</div>
            )}

            <div className="card p-4">
              <h5 className="fw-semibold mb-4">📝 Submit New Event</h5>
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Event Name</label>
                    <input type="text" className="form-control"
                      value={formData.event_name}
                      onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                      required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Organizer Name</label>
                    <input type="text" className="form-control"
                      value={formData.organizer}
                      readOnly />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Department</label>
                    <input type="text" className="form-control"
                      value={formData.department}
                      readOnly />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Expected Participants</label>
                    <input type="number" className="form-control"
                      value={formData.expected_participants}
                      onChange={(e) => setFormData({ ...formData, expected_participants: e.target.value })}
                      required min="1" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-medium">Required Facility</label>
                    <select className="form-select"
                      value={formData.required_facility}
                      onChange={(e) => setFormData({ ...formData, required_facility: e.target.value })}
                      required>
                      <option value="">-- Select --</option>
                      {facilities.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-medium">Duration (hours)</label>
                    <input type="number" className="form-control"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      required min="1" max="8" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-medium">Preferred Month</label>
                    <select className="form-select"
                      value={formData.preferred_month}
                      onChange={(e) => setFormData({ ...formData, preferred_month: e.target.value })}
                      required>
                      <option value="">-- Select Month --</option>
                      {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-dark" disabled={submitting}>
                      {submitting
                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Scheduling...</>
                        : 'Schedule Event'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}