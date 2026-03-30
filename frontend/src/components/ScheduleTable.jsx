const ScheduleTable = ({ schedules }) => {
  return (
    <div className="card shadow-sm">
      <div className="card-header bg-primary text-white">
        <h5 className="mb-0">Recent Schedules</h5>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Event</th>
                <th>Venue</th>
                <th>Date</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map(schedule => (
                <tr key={schedule.schedule_id}>
                  <td className="fw-semibold">{schedule.event_name}</td>
                  <td>{schedule.venue_name}</td>
                  <td>{schedule.date}</td>
                  <td>{schedule.start_time} - {schedule.end_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTable;