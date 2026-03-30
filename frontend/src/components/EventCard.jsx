const EventCard = ({ event }) => {
  return (
    <div className="card shadow h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{event.event_name}</h5>
        <span className="badge bg-primary">Scheduled</span>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-sm-6">
            <p className="mb-2"><strong>Organizer:</strong> {event.organizer}</p>
            <p className="mb-2"><strong>Department:</strong> {event.department}</p>
          </div>
          <div className="col-sm-6">
            <p className="mb-2"><strong>Participants:</strong> {event.expected_participants}</p>
            <p className="mb-2"><strong>Facility:</strong> {event.required_facility}</p>
            <p className="mb-0"><strong>Duration:</strong> {event.duration} hours</p>
            {event.preferred_time && (
              <p className="mb-0 text-warning mt-2"><strong>Pref. Time:</strong> {event.preferred_time}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;