import React from 'react'
import EditModal from '../../components/EditModal'
import BookingDetailsmodal from '../../components/BookingDetailsmodal'

const Profile = () => {

  const [editModal, setEditModal] = React.useState(false)
    const [BookingDetailsModal, setBookingDetailsModal] = React.useState(false)

  return (
    <>
      <div className="container" style={{ minHeight: "70vh" }}>

        {/* PROFILE DETAILS */}
        <div className="mt-4">
          <p>Name : Your Name</p>
          <p>Email : Your Email</p>
          <p>Phone : Your Phone</p>

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
              <tr>
                <td>BMW m3</td>
                <td>01-10-2025</td>
                <td>Pending</td>
                <td>
                  <i
                    className="fa-solid fa-eye text-primary"
                    style={{ cursor: "pointer" }}
                    onClick={()=>setBookingDetailsModal(true)}
                  ></i>
                </td>
              </tr>
            </tbody>

          </table>

        </div>

      </div>

      {/* EDIT PROFILE MODAL */}
      {editModal && (
        <EditModal
          editModal={editModal}
          setEditModal={setEditModal}
        />
      )}
        {/* BOOKING DETAILS MODAL */}
     {BookingDetailsModal && (
  <BookingDetailsmodal
    setBookingDetailsModal={setBookingDetailsModal}
  />
)}
    </>
  )
}

export default Profile