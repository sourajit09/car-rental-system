import React, { useEffect, useState } from 'react'
import EditModal from '../../components/EditModal'
import BookingDetailsmodal from '../../components/BookingDetailsmodal'
import API from '../../api/API.jsx'
import { toast } from 'react-hot-toast'

const Profile = () => {

  const [editModal, setEditModal] = useState(false)
  const [bookingDetailsModal, setBookingDetailsModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(()=>{
    const fetchBookings = async()=>{
      try {
        setLoading(true);
        const { data } = await API.get("/booking/my");
        setBookings(data?.bookings || []);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };
    if(user?.token || localStorage.getItem("token")){
      fetchBookings();
    }
  },[]);

  return (
    <>
      <div className="container" style={{ minHeight: "70vh" }}>

        {/* PROFILE DETAILS */}
        <div className="mt-4">
          <p>Name : {user?.uname}</p>
          <p>Email : {user?.email}</p>
          <p>Phone : {user?.phone}</p>

          <button
            className="btn btn-warning"
            onClick={() => setEditModal(true)}
          >
            Edit Details
          </button>
        </div>


        {/* BOOKINGS SECTION */}
        <div className="mt-4">

          <h4>Your Bookings</h4>

          <table className="table table-bordered mt-3 text-center">

            <thead className="bg-dark text-white">
              <tr>
                <th>Car Name</th>
                <th>Journey Date</th>
                <th>Status</th>
                <th>View Details</th>
              </tr>
            </thead>

            <tbody>
              {loading && <tr><td colSpan="4">Loading...</td></tr>}
              {!loading && bookings?.length === 0 && <tr><td colSpan="4">No bookings found</td></tr>}
              {bookings?.map((b)=>(
                <tr key={b._id}>
                  <td>{b?.car?.name}</td>
                  <td>{new Date(b.startDate).toLocaleDateString()}</td>
                  <td className='text-capitalize'>{b.status}</td>
                  <td>
                    <i
                      className="fa-solid fa-eye text-primary"
                      style={{ cursor: "pointer" }}
                      onClick={()=>{setSelectedBooking(b);setBookingDetailsModal(true);}}
                    ></i>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>

      </div>

      {/* EDIT PROFILE MODAL */}
      {editModal && (
        <EditModal
          setEditModal={setEditModal}
        />
      )}
        {/* BOOKING DETAILS MODAL */}
     {bookingDetailsModal && (
  <BookingDetailsmodal
    setBookingDetailsModal={setBookingDetailsModal}
    booking={selectedBooking}
  />
)}
    </>
  )
}

export default Profile
