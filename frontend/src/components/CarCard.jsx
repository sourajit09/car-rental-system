import React from 'react'
import { Link } from 'react-router-dom'

const CarCard = ({ car }) => {
  return (
    <Link to={`/cars/${car?.id}`} className='text-decoration-none text-dark'>
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
        </div>
      </div>
    </Link>
  )
}

export default CarCard