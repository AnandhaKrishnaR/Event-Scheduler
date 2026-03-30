import { Pencil, Trash2 } from 'lucide-react'

const VenueCard = ({ venue, onEdit, onDelete }) => {
  return (
    <div className="card shadow h-100">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{venue.venue_name}</h5>

        <div>
          {onEdit && (
            <button
              onClick={() => onEdit(venue)}
              className="btn btn-sm btn-outline-primary me-2"
              title="Edit"
            >
              <Pencil size={16} />
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(venue.venue_id)}
              className="btn btn-sm btn-outline-danger"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="card-body">
        <div className="row">
          <div className="col-sm-6">
            <p className="mb-2">
              <strong>Capacity:</strong> {venue.capacity} people
            </p>
          </div>

          <div className="col-sm-6">
            <p className="mb-2">
              <strong>Location:</strong> {venue.location}
            </p>
          </div>
        </div>

        <p className="mb-0">
          <strong>Facilities:</strong> {venue.facilities}
        </p>
      </div>
    </div>
  );
};

export default VenueCard;