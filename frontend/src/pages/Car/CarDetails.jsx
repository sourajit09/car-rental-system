import React, { useEffect, useState } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import BookingModal from "../../components/BookingModal";
import API from "../../api/API.jsx";
import { getStoredUser, isOwnerUser } from "../../utils/authStorage.js";

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [carDetails, setCarDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [pickupDate, setPickupDate] = useState(today);
  const [returnDate, setReturnDate] = useState(today);

  const user = getStoredUser();
  const ownerUser = isOwnerUser(user);

  const handleBooking = async () => {
    try {
      const payload = {
        car: carDetails?._id,
        startDate: pickupDate,
        returnDate: returnDate,
      };
      const { data } = await API.post("/booking/create", payload);
      if (data?.success) {
        toast.success("Car booked successfully");
        setShow(false);
      } else {
        toast.error(data?.message || "Booking failed");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed");
      if (error.response?.status === 401) {
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    if (ownerUser) {
      return;
    }

    const getCarDetails = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/car/${id}`);
        setCarDetails(data?.car || null);
      } catch (error) {
        console.error("Error fetching car details:", error);
        if (error.response?.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        toast.error(error.response?.data?.message || "Could not load vehicle");
        setCarDetails(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      getCarDetails();
    }
  }, [id, navigate, ownerUser]);

  if (ownerUser) {
    return <Navigate to="/owner/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="container section-pad">
        <p className="text-center">Loading vehicle…</p>
      </div>
    );
  }

  if (!carDetails) {
    return (
      <div className="container section-pad text-center">
        <h2>Vehicle not found</h2>
        <Link to="/cars" className="btn btn-primary mt-3">
          Back to listings
        </Link>
      </div>
    );
  }

  const ownerName =
    carDetails.owner?.uname || carDetails.owner?.email || "Owner";
  const price = carDetails.price ?? carDetails.pricePerDay;

  return (
    <>
      <div className="container section-pad">
        <div className="row g-4 align-items-center">
          <div className="col-md-6">
            <img
              src={carDetails.image}
              alt={carDetails.name}
              className="img-fluid rounded"
            />
          </div>
          <div className="col-md-6">
            <span className="eyebrow mb-2 d-inline-block">
              {carDetails.vehicleType === "bike" ? "Bike" : "Car"} ·{" "}
              {carDetails.numberPlate || "—"}
            </span>
            <h2 className="mb-2">{carDetails.name}</h2>
            <p className="text-muted small mb-1">
              Listed by <strong>{ownerName}</strong>
              {carDetails.owner?.phone && (
                <span className="text-muted"> · {carDetails.owner.phone}</span>
              )}
            </p>
            <p className="text-muted">{carDetails.about}</p>
            <table className="table">
              <tbody>
                <tr>
                  <th scope="row">Registration</th>
                  <td>{carDetails.numberPlate || "—"}</td>
                </tr>
                <tr>
                  <th scope="row">Colour</th>
                  <td>{carDetails.color || "—"}</td>
                </tr>
                <tr>
                  <th scope="row">Year</th>
                  <td>{carDetails.year}</td>
                </tr>
                <tr>
                  <th scope="row">Model</th>
                  <td>{carDetails.model}</td>
                </tr>
                <tr>
                  <th scope="row">Seats</th>
                  <td>{carDetails.seats}</td>
                </tr>
                <tr>
                  <th scope="row">Mileage</th>
                  <td>{carDetails.mileage}</td>
                </tr>
                <tr>
                  <th scope="row">Price per day</th>
                  <td>₹{price}</td>
                </tr>
              </tbody>
            </table>

            <div
              className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 mb-3"
              style={{
                background: "#0f172a",
                boxShadow: "0 6px 18px rgba(15,23,42,0.25)",
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  opacity: 0.9,
                }}
              >
                Rate
              </span>
              <span
                style={{
                  color: "#fff",
                  fontSize: "1.3rem",
                  fontWeight: "800",
                  letterSpacing: "-0.5px",
                }}
              >
                ₹{price}
              </span>
              <span
                style={{
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  opacity: 0.85,
                }}
              >
                /day
              </span>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <Link to={"/cars"} className="btn btn-outline-dark">
                Back to vehicles
              </Link>
              {!user ? (
                <Link to={"/login"} className="btn btn-primary">
                  Login to book
                </Link>
              ) : (
                <button
                  className="btn btn-primary"
                  onClick={() => setShow(!show)}
                >
                  Book now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {show && (
        <BookingModal
          show={show}
          setShow={setShow}
          price={price}
          pickupDate={pickupDate}
          setPickupDate={setPickupDate}
          returnDate={returnDate}
          setReturnDate={setReturnDate}
          handleBooking={handleBooking}
          carId={carDetails._id}
        />
      )}
    </>
  );
};

export default CarDetails;
