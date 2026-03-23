import React, { useEffect } from 'react'
import CarsData from '../../Data/carsData.json'
import CarCard from '../../components/CarCard'
import { useDispatch,useSelector } from 'react-redux'
import { getAllCars } from '../../store/features/carSlice.js'


const Car = () => {
  const dispatch=useDispatch();
  const { cars } = useSelector((state)=>state.car)

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
    <div className="container section-pad" >
      <h3 className='text-center mb-1'>Explore our car collection</h3>
     <p className='text-center text-muted mb-5'>Click a car to view details and book your ride.</p>
      <div className="d-flex flex-wrap justify-content-center gap-4">
        {(cars?.length ? cars : CarsData).map((car) => (
          <CarCard car={car} key={car.id} />
        ))}
      </div>
    </div>
    </>
  )
}
export default Car
