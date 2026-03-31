import React from 'react'
import { Link } from 'react-router-dom'

const CarCard = ({ car }) => {
  const carId = car?._id || car?.id;
  return (
    <Link to={`/cars/${carId}`} className='text-decoration-none text-dark'>
      <div className="card" style={{ width: "18rem" }}>
        <img
          src={car?.image}
          className="card-img-top"
          alt={car?.name}
        />
        <div className="card-body">
          <h5 className="card-title">{car?.name}</h5>
          <p className="card-text">
            {car?.about?.substring(0, 80) || "No description available"}...
          </p>
          { (car?.price || car?.pricePerDay) && <p className="fw-semibold mb-0">₹{car.price ?? car.pricePerDay} / day</p>}
        </div>
      </div>
    </Link>
  )
}

export default CarCard
