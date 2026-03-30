import { Routes, Route } from 'react-router-dom'
import Layout from './layout/Layout'
import HomePage from './pages/HomePage'
import EventsPage from './pages/EventsPage'
import CreateEvent from './pages/CreateEvent'
import SchedulePage from './pages/SchedulePage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import VenuePage from './pages/VenuePage'
import EventDetails from './pages/EventDetails'
import EditEvent from './pages/EditEvent'
import ManageEvents from './pages/admin/ManageEvents'
import EventApproval from './pages/admin/EventApproval'
import EventOverride from './pages/admin/EventOverride'
import ManageVenues from './pages/admin/ManageVenues'
import UserDashboard from './pages/UserDashboard'
import MyEvents from './pages/MyEvents'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRegister from './pages/AdminRegister'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="venues" element={<VenuePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="event/:id" element={<EventDetails />} />

        {/* User protected routes */}
        <Route path="dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
        <Route path="create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
        <Route path="event/:id/edit" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />

        {/* Admin protected routes */}
        <Route path="admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
        <Route path="admin/events" element={<ProtectedRoute adminOnly><ManageEvents /></ProtectedRoute>} />
        <Route path="admin/approval" element={<ProtectedRoute adminOnly><EventApproval /></ProtectedRoute>} />
        <Route path="admin/override" element={<ProtectedRoute adminOnly><EventOverride /></ProtectedRoute>} />
        <Route path="admin/venues" element={<ProtectedRoute adminOnly><ManageVenues /></ProtectedRoute>} />
        <Route path="admin/register" element={<AdminRegister />} />
      </Route>
    </Routes>
  )
}