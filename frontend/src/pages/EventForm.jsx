import { useState } from 'react';
import axios from 'axios';

const EventForm = () => {
  const [formData, setFormData] = useState({
    event_name: '',
    organizer: '',
    department: '',
    expected_participants: '',
    required_facility: '',
    duration: '',
    preferred_month: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const facilities = ['projector', 'mic', 'computers', 'whiteboard', 'stage'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['event_name', 'organizer', 'department', 'expected_participants', 'required_facility', 'duration', 'preferred_month'];
    for (let field of requiredFields) {
      if (!formData[field]) {
        return `${field.replace('_', ' ').toUpperCase()} is required.`;
      }
    }
    if (formData.duration < 1 || formData.duration > 8) {
      return 'Duration must be between 1 and 8 hours.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/events/', {
        ...formData,
        expected_participants: parseInt(formData.expected_participants),
        duration: parseInt(formData.duration)
      });
      setSuccess(response.data);
      setFormData({
        event_name: '',
        organizer: '',
        department: '',
        expected_participants: '',
        required_facility: '',
        duration: '',
        preferred_month: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <h2 className="mb-4">Schedule New Event</h2>
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="event_name" className="form-label">Event Name</label>
              <input
                type="text"
                className="form-control"
                id="event_name"
                name="event_name"
                value={formData.event_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="organizer" className="form-label">Organizer Name</label>
              <input
                type="text"
                className="form-control"
                id="organizer"
                name="organizer"
                value={formData.organizer}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="department" className="form-label">Department</label>
              <input
                type="text"
                className="form-control"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="expected_participants" className="form-label">Expected Participants</label>
              <input
                type="number"
                className="form-control"
                id="expected_participants"
                name="expected_participants"
                value={formData.expected_participants}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label htmlFor="required_facility" className="form-label">Required Facility</label>
              <select
                className="form-select"
                id="required_facility"
                name="required_facility"
                value={formData.required_facility}
                onChange={handleChange}
                required
              >
                <option value="">Select Facility</option>
                {facilities.map(facility => (
                  <option key={facility} value={facility}>{facility.charAt(0).toUpperCase() + facility.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label htmlFor="duration" className="form-label">Duration (hours)</label>
              <input
                type="number"
                className="form-control"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="1"
                max="8"
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="preferred_month" className="form-label">Preferred Month</label>
            <select
              className="form-select"
              id="preferred_month"
              name="preferred_month"
              value={formData.preferred_month}
              onChange={handleChange}
              required
            >
              <option value="">Select Month</option>
              {months.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Scheduling...
              </>
            ) : (
              'Schedule Event'
            )}
          </button>
        </form>

        {error && (
          <div className="alert alert-danger mt-3" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="card mt-4">
            <div className="card-header bg-success text-white">
              Event Scheduled Successfully!
            </div>
            <div className="card-body">
              <h5 className="card-title">{success.event}</h5>
              <p className="card-text">
                <strong>Venue:</strong> {success.venue}<br />
                <strong>Location:</strong> {success.location}<br />
                <strong>Capacity:</strong> {success.capacity}<br />
                <strong>Date:</strong> {success.date}<br />
                <strong>Start Time:</strong> {success.start_time}<br />
                <strong>End Time:</strong> {success.end_time}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventForm;