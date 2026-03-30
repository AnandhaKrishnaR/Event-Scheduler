import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Calendar, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
          <Calendar size={24} />
          <span>CampusEvents</span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/" end className="nav-link px-3">Home</NavLink>
            </li>
            {!user && (
              <>
                <li className="nav-item">
                  <NavLink to="/events" className="nav-link px-3">Events</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/schedule" className="nav-link px-3">Schedule</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/venues" className="nav-link px-3">Venues</NavLink>
                </li>
              </>
            )}
            {user && user.role === 'user' && (
              <>
                <li className="nav-item">
                  <NavLink to="/events" className="nav-link px-3">Events</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/schedule" className="nav-link px-3">Schedule</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/venues" className="nav-link px-3">Venues</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/my-events" className="nav-link px-3">My Events</NavLink>
                </li>
              </>
            )}
            {user && user.role === 'admin' && (
              <>
                <li className="nav-item">
                  <NavLink to="/events" className="nav-link px-3">Events</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/schedule" className="nav-link px-3">Schedule</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/venues" className="nav-link px-3">Venues</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/admin" className="nav-link px-3">Admin</NavLink>
                </li>
              </>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {user ? (
              <>
                <span className="text-secondary small">
                  {user.role === 'admin' && <span className="badge bg-secondary me-2">Admin</span>}
                  {user.name}
                </span>
                <button onClick={handleLogout} className="btn btn-outline-dark">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline-dark">Login</Link>
                <Link to="/login" className="btn btn-dark">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}