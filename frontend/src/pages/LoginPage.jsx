import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar } from 'lucide-react'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(isSignUp ? 'Account created!' : 'Logged in!')
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="card p-4">
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

          <form onSubmit={handleSubmit}>
            {isSignUp && (
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

            <button type="submit" className="btn btn-dark w-100 mb-3">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>

            <div className="text-center">
              <hr className="my-3" />
              <p className="text-secondary small mb-0">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button 
                  type="button"
                  className="btn btn-link p-0 text-dark"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </form>
        </div>

        <p className="text-center text-secondary small mt-3">
          <Link to="/" className="text-dark">Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
