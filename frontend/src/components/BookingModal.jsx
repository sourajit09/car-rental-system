import React from 'react'
import { toast } from 'react-hot-toast';
import axios from "axios"

const BookingModal = (prop) => {

  const {  setShow, price, pickupDate, setPickupDate, returnDate, setReturnDate, handleBooking ,carId} = prop;

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

  // const onBook = () => {
  //   if(!pickupDate || !returnDate){
  //     return toast.error("Select pickup and return dates");
  //   }
  //   if(new Date(returnDate) < new Date(pickupDate)){
  //     return toast.error("Return date must be after pickup");
  //   }
  //   handleBooking();
  // }

   const handlePayment = async () => {
    if (!pickupDate || !returnDate) {
      return toast.error("Select pickup and return dates");
    }
    if (new Date(returnDate) < new Date(pickupDate)) {
      return toast.error("Return date must be after pickup");
    }

    try {
      const totalAmount = calculateTotal();

      // Step 1 — Create booking first (status: pending)
      const bookingRes = await axios.post(
        'http://localhost:8080/api/v1/booking/create',
        {
          car: carId,
          startDate: pickupDate,
          returnDate: returnDate,
          totalPrice: totalAmount,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (!bookingRes.data.success) {
        return toast.error(bookingRes.data.message);
      }
      

      const bookingId = bookingRes.data.booking._id;
      console.log(bookingId)

      // Step 2 — Create Razorpay order
      const orderRes = await axios.post(
        'http://localhost:8080/api/v1/payment/create-order',
        { amount: totalAmount },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (!orderRes.data.success) {
        return toast.error("Failed to create payment order");
      }

      const order = orderRes.data.order;
      const user = JSON.parse(localStorage.getItem('user'));

      // Step 3 — Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'DriveHub',
        description: 'Car Rental Booking',
        order_id: order.id,

        // Step 4 — On payment success
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              'http://localhost:8080/api/v1/payment/verify-payment',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId,
              },
              {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
              }
            );

            if (verifyRes.data.success) {
              toast.success("Booking Confirmed! Payment Successful 🎉");
              setShow(false);
            } else {
              toast.error("Payment verification failed");
            }
          } catch (error) {
            console.log(error);
            toast.error("Verification error");
          }
        },

        prefill: {
          name: user?.uname,
          email: user?.email,
        },

        theme: {
          color: '#0d6efd'  // Bootstrap primary blue
        },

        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
          }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
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
                onClick={handlePayment}
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
