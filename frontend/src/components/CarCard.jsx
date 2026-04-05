import React from 'react'
import { Link } from 'react-router-dom'

const CarCard = ({ car }) => {
  if (!car?._id) {
    return null;
  }

  const ownerLabel = car?.owner?.uname || car?.owner?.email || 'Owner'
  const price = car?.price ?? car?.pricePerDay
  const plate = car?.numberPlate
  const color = car?.color
  const typeLabel = car?.vehicleType === 'bike' ? 'Bike' : 'Car'

  return (
    <Link to={`/cars/${car._id}`} className='text-decoration-none text-dark'>
      <div className="card h-100" style={{ width: "18rem" }}>
        <img
          src={car?.image}
          className="card-img-top"
          alt={car?.name}
          style={{ objectFit: 'cover', height: '11rem' }}
        />
        <div className="card-body d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
            <h5 className="card-title mb-0">{car?.name}</h5>
            <span className="badge text-bg-secondary">{typeLabel}</span>
          </div>
          <p className="text-muted small mb-1">by {ownerLabel}</p>
          {(plate || color) && (
            <p className="small mb-2">
              {plate && <span className="me-2"><strong>{plate}</strong></span>}
              {color && <span className="text-muted">{color}</span>}
            </p>
          )}
          <p className="card-text small flex-grow-1">
            {car?.about?.substring(0, 80) || "No description available"}
            {(car?.about?.length || 0) > 80 ? "…" : ""}
          </p>
          {price != null && (
            <p className="fw-semibold mb-0 mt-auto">₹{price} / day</p>
          )}
        </div>
      </div>
    </Link>
  )
}

export default CarCard
