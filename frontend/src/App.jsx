import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import EventForm from './pages/EventForm'
import ScheduleList from './pages/ScheduleList'
import VenueList from './pages/VenueList'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<EventForm />} />
          <Route path="/schedules" element={<ScheduleList />} />
          <Route path="/venues" element={<VenueList />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App