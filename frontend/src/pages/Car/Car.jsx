import React, { useEffect } from 'react'
import CarsData from '../../data/carsData.json'
import CarCard from '../../components/CarCard'
import { useDispatch,useSelector } from 'react-redux'
import { getAllCars } from '../../store/features/carSlice.js'

const Car = () => {
  const dispatch=useDispatch();
  const {cars}=useSelector((state)=>state.cars)

  useEffect(()=>{
    const getcars=async()=>{
      try {
        dispatch(getAllCars())
      } catch (error) {
        console.log(error)
      }
    }
    getcars()
  },[dispatch])


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
