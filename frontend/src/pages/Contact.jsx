import React from 'react';

const Contact = () => {
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
                  <input type="text" className="form-control" placeholder="Your name" />
                </div>
                <div className="col-12">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" placeholder="you@example.com" />
                </div>
                <div className="col-12">
                  <label className="form-label">Message</label>
                  <textarea className="form-control" rows="3" placeholder="How can we help?"></textarea>
                </div>
                <div className="col-12">
                  <button type="button" className="btn btn-primary w-100">Send message</button>
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
