import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!name || !email || !message) {
        return toast.error("Please provide all fields");
      }
      setLoading(true);
      const { data } = await axios.post('https://api.web3forms.com/submit', {
        access_key: 'afaf9515-364b-43b2-8e1d-8972f3d2a89e',  // ✅ paste your key here
        name,
        email,
        message,
      });
      if (data.success) {
        toast.success("Message sent successfully!");
        setName('');
        setEmail('');
        setMessage('');
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container section-pad" style={{ minHeight: '70vh' }}>
        <div className="row g-4 align-items-center">
          <div className="col-md-6">
            <span className="eyebrow mb-3 d-inline-block">Talk to our team</span>
            <h2 className="mb-3">Need help with a booking or fleet request?</h2>
            <p className="text-muted mb-3">
              We respond fast—whether you need a last-minute car, a long-term lease, or support on the road.
            </p>
            <div className="card-soft p-3">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="feature-icon"><i className="fa-solid fa-phone-volume"></i></div>
                <div>
                  <div className="fw-bold">Call us</div>
                  <div className="text-muted">+91 98765 43210</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3 mb-2">
                <div className="feature-icon"><i className="fa-solid fa-envelope"></i></div>
                <div>
                  <div className="fw-bold">Email</div>
                  <div className="text-muted">support@carrental.app</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="feature-icon"><i className="fa-solid fa-location-dot"></i></div>
                <div>
                  <div className="fw-bold">Visit</div>
                  <div className="text-muted">DriveHub, MG Road, Bengaluru</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card-soft p-4 h-100">
              <h5 className="mb-3">Drop a note</h5>
              <form className="row g-3">
                <div className="col-12">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="How can we help?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <div className="col-12">
                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Contact;