import React from 'react'
import { toast } from 'react-hot-toast';

const BookingModal = (prop) => {

  const {  setShow, price, pickupDate, setPickupDate, returnDate, setReturnDate, handleBooking } = prop;

  // total
  const calculateTotal = () => {
    if (pickupDate && returnDate) {
      const days = Math.max(
        1,
        Math.ceil(
          (new Date(returnDate) - new Date(pickupDate)) /
          (1000 * 60 * 60 * 24)
        )
      );
      return days * price;
    }
    return price;
  };

  const onBook = () => {
    if(!pickupDate || !returnDate){
      return toast.error("Select pickup and return dates");
    }
    if(new Date(returnDate) < new Date(pickupDate)){
      return toast.error("Return date must be after pickup");
    }
    handleBooking();
  }

  return (
    <>
      <div className="modal d-flex w-50" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">

            <div className="modal-header bg-dark text-light">
              <h5 className="modal-title">Select your journey</h5>

              <button
                type="button"
                className="btn-close bg-light"
                aria-label="Close"
                onClick={() => setShow(false)}
              ></button>
            </div>

            <div className="modal-body">

              <div className="mb-3">
                <label htmlFor="pickupDate" className="form-label">Pickup Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="pickupDate"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="returnDate" className="form-label">Return Date</label>
                <input
                  type="date"
                  className="form-control"
                  id="returnDate"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                />
              </div>

              <p>Price : ₹{price}/day</p>
              <p className="text-muted small mb-1">Note: please return before 10.00 AM else extra charges will apply</p>

              <h5>Grand Total : ₹{calculateTotal()}</h5>

            </div>

            <div className="modal-footer">

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShow(false)}
              >
                Close
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={onBook}
              >
                Book
              </button>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default BookingModal;
