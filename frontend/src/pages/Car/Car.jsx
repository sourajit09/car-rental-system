import React, { useEffect, useState } from 'react'
import CarCard from '../../components/CarCard'
import { useDispatch,useSelector } from 'react-redux'
import { getAllCars } from '../../store/features/carSlice.js'
import { Navigate } from 'react-router-dom'
import { getStoredUser, isOwnerUser } from '../../utils/authStorage.js'


const Car = () => {
  const dispatch=useDispatch();
  const { cars, loading, error } = useSelector((state)=>state.car)
  const [startDate,setStartDate]=useState("");
  const [returnDate,setReturnDate]=useState("");
  const user = getStoredUser();
  const ownerUser = isOwnerUser(user);

  useEffect(()=>{
    if (ownerUser) {
      return;
    }
    dispatch(getAllCars())
  },[dispatch, ownerUser])

  const handleFilter=()=>{
    dispatch(getAllCars({startDate,returnDate}))
  }

  if (ownerUser) {
    return <Navigate to="/owner/dashboard" replace />
  }

  return (
    <>
    <div className="container section-pad" >
      <h3 className='text-center mb-1'>Explore owner-listed vehicles</h3>
     <p className='text-center text-muted mb-4'>Select dates to check availability or browse all cars and bikes from verified owners.</p>

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
        {(cars || []).map((car) => (
          <CarCard car={car} key={car._id} />
        ))}
      </div>
      {!loading && !error && cars?.length === 0 && (
        <p className="text-center text-muted">No vehicles listed yet. Check back soon.</p>
      )}
    </div>
    </>
  )
}
export default Car
