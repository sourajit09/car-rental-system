import React, { useEffect, useState } from 'react';
import { Link,useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import BookingModal from '../../components/BookingModal';
import API from '../../api/API.jsx';
import CarsData from '../../Data/carsData.json';

const CarDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [carDetails, setCarDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [show,setShow]=useState(false);
    const today = new Date().toISOString().split('T')[0];
    const [pickupDate,setPickupDate]=useState(today);
    const [returnDate,setReturnDate]=useState(today);
      
    const user = JSON.parse(localStorage.getItem("user"));

    // booking function
    const handleBooking = async () =>{
        try {
            const payload = {
                car: carDetails?._id,
                startDate: pickupDate,
                returnDate: returnDate,
            };
            const { data } = await API.post("/booking/create", payload);
            if(data?.success){
                toast.success("Car booked successfully");
                setShow(false);
            }else{
                toast.error(data?.message || "Booking failed");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Booking failed");
            if(error.response?.status === 401){
                navigate("/login");
            }
        }
    }
   
   useEffect(() => {
    const getCarDetails = async () => {
        setLoading(true);
        try {
            // if looks like a Mongo ObjectId, hit API, else use fallback JSON
            if(id && id.length === 24){
                const { data } = await API.get(`/car/${id}`);
                setCarDetails(data?.car);
            } else {
                const fallback = CarsData.find(car => String(car.id) === String(id));
                setCarDetails(fallback || null);
            }
        } catch (error) {
            console.error("Error fetching car details:", error);
            // try fallback data if API fails
            const fallback = CarsData.find(car => String(car.id) === String(id));
            if(fallback){
                setCarDetails(fallback);
            } else {
                toast.error("Could not load car details");
            }
        } finally {
            setLoading(false);
        }
    };
    getCarDetails();
}, [id]);
      
    if (loading) {
        return <h2>Loading...</h2>;
    }

    if (!carDetails) {
        return <h2>Car Not Found</h2>;
    }

    return (
        <>
        {loading ? (
            <h2 className='text-center'>Loading...</h2>
        ) : (
            <>
            <div className='container section-pad'>
              <div className='row g-4 align-items-center'>
                <div className='col-md-6'>
                    <img
                        src={carDetails.image}
                        alt={carDetails.name}
                        className='img-fluid rounded'/>
                        </div>
                <div className='col-md-6'>
                    <span className='eyebrow mb-2 d-inline-block'>Ready to rent</span>
                    <h2 className='mb-2'>{carDetails.name}</h2>
                    <p className='text-muted'>{carDetails.about}</p>
                    <table className='table'>
                        <tbody>
                            <tr>
                                <th scope='row'>Year</th>
                                <td>{carDetails.year}</td>
                            </tr>
                            <tr>
                                <th scope='row'>Model</th>
                                <td>{carDetails.model}</td>
                            </tr>
                                <tr>
                                <th scope='row'>Seats</th>
                                <td>{carDetails.seats}</td>
                            </tr>
                                <tr>
                                <th scope='row'>Mileage</th>
                                <td>{carDetails.mileage}</td>
                            </tr>
                                <tr>
                                <th scope='row'>Price per day</th>
                                <td>₹{carDetails.price ?? carDetails.pricePerDay}</td>
                            </tr>
                        </tbody>
                    </table>
                  
<div className='d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 mb-3'
    style={{
        background: '#0f172a',
        boxShadow: '0 6px 18px rgba(15,23,42,0.25)'
    }}>
    <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '600', opacity: 0.9 }}>Rate</span>
    <span style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
        ₹{carDetails.price ?? carDetails.pricePerDay}
    </span>
    <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '500', opacity: 0.85 }}>/day</span>
</div>
<div className='d-flex gap-2'>
    <Link to={'/cars'} className="btn btn-outline-dark">Back to cars</Link>
    {!user ? (
        <Link to={'/login'} className="btn btn-primary">
            Please Login to book
        </Link>
    ) : (
        <button className="btn btn-primary" onClick={() => setShow(!show)}>Book Now</button>
    )}
</div>
                </div>
              </div>
            </div>

            {/* model */}
            {show && <BookingModal show={show} setShow={setShow} price={carDetails?.price ?? carDetails?.pricePerDay}
            pickupDate={pickupDate} setPickupDate={setPickupDate} 
            returnDate={returnDate} setReturnDate={setReturnDate} 
            handleBooking={handleBooking}
            />}
            </>
            )}
        </>
    );
};

export default CarDetails;
