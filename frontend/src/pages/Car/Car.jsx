import React from 'react'
import CarsData from '../../data/carsData.json'
import CarCard from '../../components/CarCard'
const Car = () => {
  return (
    <>
    <div style={{minHeight:'80vh',marginTop:'50px'}} >
      <h3 className='text-center mb-1'>Explore Our Car Collection</h3>
     <p className='text-center mb-5'>click on the car to view details and book your ride</p>
      <div className="d-flex flex-wrap justify-content-center gap-4">
        {CarsData.map((car) => (
          <CarCard car={car} key={car.id} />
        ))}
      </div>
    </div>
    </>
  )
}
export default Car
