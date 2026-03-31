import React, { useEffect, useState } from 'react'
import CarsData from '../../Data/carsData.json'
import CarCard from '../../components/CarCard'
import { useDispatch,useSelector } from 'react-redux'
import { getAllCars } from '../../store/features/carSlice.js'


const Car = () => {
  const dispatch=useDispatch();
  const { cars, loading, error } = useSelector((state)=>state.car)
  const [startDate,setStartDate]=useState("");
  const [returnDate,setReturnDate]=useState("");

  useEffect(()=>{
    dispatch(getAllCars())
  },[dispatch])

  const handleFilter=()=>{
    dispatch(getAllCars({startDate,returnDate}))
  }

  return (
    <>
    <div className="container section-pad" >
      <h3 className='text-center mb-1'>Explore our car collection</h3>
     <p className='text-center text-muted mb-4'>Select dates to check availability or browse all cars.</p>

     <div className="row g-3 mb-4 justify-content-center">
      <div className="col-md-3">
        <label className="form-label">Pickup Date</label>
        <input type="date" className="form-control" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
      </div>
      <div className="col-md-3">
        <label className="form-label">Return Date</label>
        <input type="date" className="form-control" value={returnDate} onChange={(e)=>setReturnDate(e.target.value)} />
      </div>
      <div className="col-md-2 d-flex align-items-end">
        <button className="btn btn-primary w-100" onClick={handleFilter}>Check</button>
      </div>
      <div className="col-md-2 d-flex align-items-end">
        <button className="btn btn-outline-secondary w-100" onClick={()=>{setStartDate("");setReturnDate("");dispatch(getAllCars())}}>Reset</button>
      </div>
     </div>

      {loading && <p className="text-center">Loading cars...</p>}
      {error && <p className="text-center text-danger">{error}</p>}
      <div className="d-flex flex-wrap justify-content-center gap-4">
        {(cars?.length ? cars : CarsData).map((car) => (
          <CarCard car={car} key={car._id || car.id} />
        ))}
      </div>
    </div>
    </>
  )
}
export default Car
