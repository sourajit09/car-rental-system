import React from "react";

const BookingDetailsmodal = ({ setBookingDetailsModal, booking }) => {
  return (
    <>
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-sm">
          <div className="modal-content">

            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title">Your Booking details</h5>

              <button
                className="btn-close bg-light"
                onClick={() => setBookingDetailsModal(false)}
              ></button>
            </div>

            <div className="modal-body">
              <p>Journey Date : {booking ? new Date(booking.startDate).toLocaleDateString() : "-"}</p>
              <p>Return Date : {booking ? new Date(booking.returnDate).toLocaleDateString() : "-"}</p>
              <p>Car Name : {booking?.car?.name}</p>
              <p>Total Price : ₹{booking?.totalPrice}</p>
              <p>Booking Status : {booking?.status}</p>
            </div>

          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default BookingDetailsmodal;
