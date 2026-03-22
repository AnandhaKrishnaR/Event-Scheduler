import { Routes, Route } from 'react-router-dom'
import Layout from './layout/Layout'
import HomePage from './pages/HomePage'
import EventsPage from './pages/EventsPage'
import SchedulePage from './pages/SchedulePage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import VenuePage from './pages/VenuePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="venues" element={<VenuePage />} />
      </Route>
    </Routes>
  )
}