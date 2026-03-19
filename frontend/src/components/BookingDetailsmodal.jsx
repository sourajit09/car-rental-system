import React from "react";

const BookingDetailsmodal = ({ setBookingDetailsModal }) => {
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
              <p>Journey Date :</p>
              <p>Return Date :</p>
              <p>Car Name :</p>
              <p>Total Price :</p>
              <p>Booking Status :</p>
            </div>

          </div>
        </div>
      </div>

      <div className="modal-backdrop fade show"></div>
    </>
  );
};

export default BookingDetailsmodal;