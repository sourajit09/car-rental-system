import React from 'react'

const BookingModal = (prop) => {

  const { show, setShow, price, pickupDate, setPickupDate, returnDate, setReturnDate, handleBooking } = prop;

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

              <p>Price : {price}/- per day</p>
              <p>Note: please return before 10.00 AM else extra charges will apply</p>

              <h4>Grand Total : {calculateTotal()}</h4>

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
                onClick={handleBooking}
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