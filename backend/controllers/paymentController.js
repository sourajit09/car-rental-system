import razorpay from '../config/razorpayHelper.js';
import bookingModel from '../models/bookingModel.js';
import crypto from 'crypto';

// CREATE ORDER
export const createOrder = async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        res.status(200).send({
            success: true,
            order,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: 'Error creating order', error });
    }
};

// VERIFY PAYMENT
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

         
        console.log("req.body:", req.body);  // ✅ add this
        console.log("KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);  // ✅ add this

        // crypto is available globally in Node.js — no import needed
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign)
            .digest('hex');


        console.log("expected:", expectedSignature);      // ✅ add this
        console.log("received:", razorpay_signature);

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).send({ success: false, message: 'Invalid payment signature' });
        }

        await bookingModel.findByIdAndUpdate(bookingId, {
            status: 'confirm',
            paymentId: razorpay_payment_id,
        });

        res.status(200).send({
            success: true,
            message: 'Payment verified successfully',
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({ success: false, message: 'Error verifying payment', error });
    }
};