import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { User, Building, Users, Clock, Calendar, Loader2 } from 'lucide-react'

export default function EventApproval() {
  const [pendingEvents, setPendingEvents] = useState([])
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [approvalResult, setApprovalResult] = useState(null)
  const [rejectionMessage, setRejectionMessage] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [pendingRes, eventsRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/schedules/pending/'),
        axios.get('http://127.0.0.1:8000/api/events/list/')
      ])

      const pending = pendingRes.data
      const allEvents = eventsRes.data

      setPendingEvents(pending)
      setStats({
        pending: allEvents.filter((e) => e.status === 'pending').length,
        approved: allEvents.filter((e) => e.status === 'approved').length,
        rejected: allEvents.filter((e) => e.status === 'rejected').length,
      })
      setError(null)
    } catch (err) {
      console.error('Error fetching approval data:', err)
      setError('Failed to load approval data.')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (eventId) => {
    setActionLoading(eventId)
    setApprovalResult(null)
    setRejectionMessage(null)
    try {
      const res = await axios.put(`http://127.0.0.1:8000/api/events/${eventId}/approve/`)
      setApprovalResult(res.data)
      setPendingEvents((prev) => prev.filter((evt) => evt.event_id !== eventId))
      setStats((prev) => ({ ...prev, pending: Math.max(prev.pending - 1, 0), approved: prev.approved + 1 }))
      setError(null)
    } catch (err) {
      console.error('Error approving event:', err)
      setError(err.response?.data?.error || 'Approval failed.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (eventId) => {
    setActionLoading(eventId)
    setApprovalResult(null)
    setRejectionMessage(null)
    try {
      await axios.put(`http://127.0.0.1:8000/api/events/${eventId}/reject/`)
      setPendingEvents((prev) => prev.filter((evt) => evt.event_id !== eventId))
      setRejectionMessage('Event has been rejected successfully.')
      setStats((prev) => ({ ...prev, pending: Math.max(prev.pending - 1, 0), rejected: prev.rejected + 1 }))
      setError(null)
    } catch (err) {
      console.error('Error rejecting event:', err)
      setError(err.response?.data?.error || 'Rejection failed.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="py-5">
      <div className="container">

        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <p className="text-mono text-secondary mb-1">Administration</p>
            <h1 className="fw-bold">Event Approval</h1>
          </div>
          <Link to="/admin" className="btn btn-outline-dark align-self-start">← Back</Link>
        </div>

        {loading ? (
          <div className="text-center py-5"><span className="spinner-border"></span></div>
        ) : (
          <>
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="card p-3">
                  <div className="d-flex align-items-center gap-3">
                    <span className="badge bg-warning text-dark">Pending</span>
                    <div>
                      <div className="h3 mb-0 fw-bold">{stats.pending}</div>
                      <div className="text-secondary small">Pending</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card p-3">
                  <div className="d-flex align-items-center gap-3">
                    <span className="badge bg-success">Approved</span>
                    <div>
                      <div className="h3 mb-0 fw-bold">{stats.approved}</div>
                      <div className="text-secondary small">Approved</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card p-3">
                  <div className="d-flex align-items-center gap-3">
                    <span className="badge bg-danger">Rejected</span>
                    <div>
                      <div className="h3 mb-0 fw-bold">{stats.rejected}</div>
                      <div className="text-secondary small">Rejected</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && <div className="alert alert-danger mb-4">❌ {error}</div>}
            {rejectionMessage && <div className="alert alert-warning mb-4">{rejectionMessage}</div>}

            {approvalResult && (
              <div className="card border-success p-4 mb-4">
                <h5 className="text-success fw-semibold mb-3">✅ Event Approved & Venue Assigned!</h5>
                <div className="row g-2">
                  <div className="col-md-6"><strong>Event Name:</strong> {approvalResult.event_name}</div>
                  <div className="col-md-6"><strong>Venue Name:</strong> {approvalResult.venue}</div>
                  <div className="col-md-6"><strong>Location:</strong> {approvalResult.location}</div>
                  <div className="col-md-6"><strong>Date:</strong> {approvalResult.date}</div>
                  <div className="col-md-6"><strong>Time:</strong> {approvalResult.start_time} - {approvalResult.end_time}</div>
                </div>
              </div>
            )}

            {pendingEvents.length === 0 ? (
              <div className="text-center py-5 text-secondary">No pending events. All caught up! ✅</div>
            ) : (
              <div className="row g-3">
                {pendingEvents.map((evt) => (
                  <div key={evt.event_id} className="col-12">
                    <div className="card p-3 d-flex flex-wrap justify-content-between">
                      <div style={{ minWidth: '280px' }}>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="fw-semibold mb-0">{evt.event_name}</h5>
                          <span className="badge status-pending">Pending</span>
                        </div>
                        <div className="text-secondary small d-flex flex-column gap-2">
                          <div><User size={14} className="me-1" />Organizer: {evt.organizer}</div>
                          <div><Building size={14} className="me-1" />Department: {evt.department}</div>
                          <div><Users size={14} className="me-1" />Expected: {evt.expected_participants}</div>
                          <div><span className="badge bg-dark">{evt.required_facility}</span></div>
                          <div><Clock size={14} className="me-1" />Duration: {evt.duration} hour(s)</div>
                          <div><Calendar size={14} className="me-1" />Preferred month: {evt.preferred_month || 'Any'}</div>
                          {evt.preferred_time && (
                            <div><Clock size={14} className="me-1" />Preferred time: {evt.preferred_time}</div>
                          )}
                        </div>
                      </div>

                      <div className="d-flex gap-2 align-items-center mt-3 mt-md-0">
                        <button
                          className="btn btn-outline-success"
                          disabled={actionLoading === evt.event_id}
                          onClick={() => handleApprove(evt.event_id)}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          disabled={actionLoading === evt.event_id}
                          onClick={() => handleReject(evt.event_id)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
