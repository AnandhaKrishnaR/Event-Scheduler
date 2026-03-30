import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (isSignUp) {
      // Sign Up
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.')
        setLoading(false)
        return
      }

      try {
        const response = await axios.post('http://127.0.0.1:8000/api/auth/register/', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          department: formData.department
        })
        login(response.data)
        navigate('/dashboard')
      } catch (err) {
        setError(err.response?.data?.error || 'Registration failed.')
      }
    } else {
      // Login
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/auth/login/', {
          email: formData.email,
          password: formData.password
        })
        login(response.data)
        if (response.data.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/dashboard')
        }
      } catch (err) {
        setError('Invalid email or password.')
      }
    }
    setLoading(false)
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <div className="card">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                  <Calendar size={28} />
                  <span className="h5 mb-0 fw-bold">CampusEvents</span>
                </div>
                <h4 className="fw-semibold">{isSignUp ? 'Create Account' : 'Welcome Back'}</h4>
                <p className="text-secondary small">
                  {isSignUp ? 'Sign up to start scheduling events' : 'Sign in to your account'}
                </p>
              </div>

              {error && (
                <div className="alert alert-danger small" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {isSignUp && (
                  <>
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
                      <label className="form-label small fw-medium">Department</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        required
                      />
                    </div>
                  </>
                )}

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
                  <label className="form-label small fw-medium">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                {isSignUp && (
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
                )}

                <button type="submit" className="btn btn-dark w-100 mb-3" disabled={loading}>
                  {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </button>

                <div className="text-center">
                  <hr className="my-3" />
                  <p className="text-secondary small mb-0">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                      type="button"
                      className="btn btn-link p-0 text-dark"
                      onClick={() => {
                        setIsSignUp(!isSignUp)
                        setError('')
                        setFormData({
                          name: '',
                          email: '',
                          department: '',
                          password: '',
                          confirmPassword: ''
                        })
                      }}
                    >
                      {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
 