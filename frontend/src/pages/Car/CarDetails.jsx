import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CarsData from '../../data/CarsData';

const CarDetails = () => {
    const { id } = useParams();

    const [carDetails, setCarDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getCarDetails = () => {
            const getCarInfo = CarsData.find(
                car => car.id === parseInt(id)
            );

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
        <div>
            <h2>{carDetails.name}</h2>
            <img src={carDetails.image} alt={carDetails.name} />
            <p>{carDetails.description}</p>
        </div>
    );
};

export default CarDetails;