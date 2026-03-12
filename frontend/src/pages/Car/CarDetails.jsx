import React, { useEffect, useState } from 'react';
import { Link,useParams } from 'react-router-dom';
import CarsData from '../../data/CarsData';
import BookingModal from '../../components/BookingModal';

const CarDetails = () => {
    const { id } = useParams();

    const [carDetails, setCarDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [show,setShow]=useState(false);
    const [pickupDate,setPickupDate]=useState("new Date().toISOString().split('T')[0]");
        const [returnDate,setReturnDate]=useState("new Date().toISOString().split('T')[0]");
      
        // booking function
        const handleBooking = () =>{
            toast.success("Car booked successfully");
            setShow(false);
        }
        
const user = JSON.parse(localStorage.getItem("user"));
   useEffect(() => {
    const getCarDetails = async () => {
        setLoading(true);
        let getCarInfo = null;  

        try {
            getCarInfo = CarsData.find(
                car => car.id === parseInt(id)
            );
        } catch (error) {
            console.error("Error fetching car details:", error);
        }

        setCarDetails(getCarInfo);
        setLoading(false);
    };

    getCarDetails();
}, [id]);
      console.log("cardetails",CarDetails);
      
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
            <div className='row my-4' style={{minHeight: "70vh"}}>
                <div className='col-md-6'>
                    <img
                        src={carDetails.image}
                        alt={carDetails.name}
                        className='img-fluid rounded'/>
                        </div>
                <div className='col-md-6'>
                    <h2>{carDetails.name}</h2>
                    <p>{carDetails.about}</p>
                    <table className='table w-75'>
                        <tbody>
                            <tr>
                                <th scope='row'>year</th>
                                <td>{carDetails.year}</td>
                            </tr>
                            <tr>
                                <th scope='row'>Model</th>
                                <td>{carDetails.model}</td>
                            </tr>
                                <tr>
                                <th scope='row'>Seat</th>
                                <td>{carDetails.seats}</td>
                            </tr>
                                <tr>
                                <th scope='row'>Mileage</th>
                                <td>{carDetails.mileage}</td>
                            </tr>
                                <tr>
                                <th scope='row'>Price per day</th>
                                <td>{carDetails.pricePerDay}</td>
                            </tr>
                        </tbody>
                    </table>
                  
<div className='d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 mb-3'
    style={{
        background: '#fd0d0d',
        boxShadow: '0 4px 14px rgba(13,110,253,0.35)'
    }}>
    <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '500', opacity: 0.85 }}>Price:</span>
    <span style={{ color: '#fff', fontSize: '1.3rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
        Rs {carDetails.pricePerDay}
    </span>
    <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: '500', opacity: 0.85 }}>/day</span>
</div>
<div>
    {!user ? (
        <Link to={'/login'} className="btn btn-primary">
            Please Login to book this car
        </Link>
    ) : (
        <button className="btn btn-primary" onClick={() => setShow(!show)}>Book Now</button>
    )}
</div>
                </div>
            </div>

            {/* model */}
            {show && <BookingModal show={show} setShow={setShow} pricePerDay={carDetails?.pricePerDay}
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