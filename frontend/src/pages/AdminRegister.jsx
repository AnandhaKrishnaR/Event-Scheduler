import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Calendar, ShieldCheck } from 'lucide-react'

export default function AdminRegister() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    secret_key: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Check passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/api/auth/register/admin/',
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          department: formData.department,
          secret_key: formData.secret_key
        }
      )
      setSuccess('Admin account created successfully! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="card p-4">

          {/* Header */}
          <div className="text-center mb-4">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
              <Calendar size={28} />
              <span className="h5 mb-0 fw-bold">CampusEvents</span>
            </div>
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <ShieldCheck size={20} className="text-dark" />
              <h4 className="fw-semibold mb-0">Admin Registration</h4>
            </div>
            <p className="text-secondary small">
              This page is restricted to authorized personnel only.
            </p>
          </div>

          {/* Success Alert */}
          {success && (
            <div className="alert alert-success small">✅ {success}</div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger small">❌ {error}</div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-medium">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-medium">Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-medium">Department</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g., Administration"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-medium">Password</label>
              <input
                type="password"
                className="form-control"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-medium">Confirm Password</label>
              <input
                type="password"
                className="form-control"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            {/* Secret Key Field */}
            <div className="mb-4">
              <label className="form-label small fw-medium">
                🔑 Admin Secret Key
              </label>
              <input
                type="password"
                className="form-control"
                placeholder="Enter secret key"
                value={formData.secret_key}
                onChange={(e) => setFormData({ ...formData, secret_key: e.target.value })}
                required
              />
              <div className="form-text text-secondary small">
                Contact system administrator for the secret key.
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-dark w-100 mb-3"
              disabled={loading}
            >
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</>
                : 'Create Admin Account'
              }
            </button>

            <hr className="my-3" />
            <p className="text-center text-secondary small mb-0">
              Already have an account?{' '}
              <Link to="/login" className="text-dark">Login</Link>
            </p>
          </form>

        </div>
      </div>
    </div>
  )
}