import React from 'react';
import { Link } from 'react-router-dom';
import CarsData from '../Data/carsData.json';
import heroCar from '../assets/images/car.gif';

const Home = () => {
  const highlights = [
    { label: 'Avg. pickup time', value: '8 mins' },
    { label: 'Locations served', value: '45+' },
    { label: 'Happy drivers', value: '12k+' },
  ];

  const reasons = [
    { icon: 'fa-clock', title: 'Instant pickup', copy: 'Reserve online and collect your keys in minutes at any of our partner hubs.' },
    { icon: 'fa-shield', title: 'Fully insured', copy: 'Every ride includes primary cover plus 24/7 roadside assistance.' },
    { icon: 'fa-bolt', title: 'Transparent pricing', copy: 'Flat daily rates with no hidden add-ons—fuel and tolls stay yours.' },
  ];

  const steps = [
    'Choose your ride from our curated fleet',
    'Pick dates and location that fit your trip',
    'Confirm and get your keys—no paperwork surprises',
  ];

  return (
    <>
      <section className="hero container">
        <div className="row align-items-center g-4">
          <div className="col-lg-6">
            <span className="eyebrow mb-3">Premium Car Rental</span>
            <h1>Book the right car for today’s journey in a few clicks.</h1>
            <p className="lead mb-4">
              From city commutes to weekend escapes, we keep modern, well‑maintained cars ready
              so you can focus on where you’re heading, not how you’ll get there.
            </p>
            <div className="d-flex gap-3 flex-wrap">
              <Link to="/cars" className="btn btn-primary px-4 py-2">Browse cars</Link>
              <Link to="/contact" className="btn btn-outline-dark px-4 py-2">Talk to us</Link>
            </div>
            <div className="d-flex gap-3 mt-4 flex-wrap">
              {highlights.map((item) => (
                <div key={item.label} className="stat-tile">
                  <div className="text-muted small">{item.label}</div>
                  <div className="fw-bold fs-5">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-6 text-center">
            <img src={heroCar} alt="Car rental hero" className="img-fluid" />
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <span className="eyebrow mb-2 d-inline-block">Why ride with us</span>
              <h3 className="mb-2">Built for drivers who value time, comfort, and clarity.</h3>
              <p className="text-muted mb-0">Premium fleet, clear pricing, real humans when you need help.</p>
            </div>
            <Link to="/about" className="btn btn-link text-decoration-none">Learn more →</Link>
          </div>
          <div className="row g-4">
            {reasons.map((item) => (
              <div className="col-md-4" key={item.title}>
                <div className="card-soft p-4 h-100">
                  <div className="feature-icon mb-3">
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <h5 className="mb-2">{item.title}</h5>
                  <p className="text-muted mb-0">{item.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad" style={{ background: '#0f172a', color: '#e2e8f0' }}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <span className="eyebrow mb-2 d-inline-block">Featured fleet</span>
              <h3 className="mb-1">Our most booked cars this month</h3>
              <p className="text-muted mb-0">Reliable picks ready to roll—click any card to view details.</p>
            </div>
            <Link to="/cars" className="btn btn-light">View all cars</Link>
          </div>
          <div className="row g-4">
            {CarsData.slice(0, 3).map((car) => (
              <div className="col-md-4" key={car.id}>
                <div className="card-soft p-3 h-100 fleet-card bg-white text-dark">
                  <img src={car.image} alt={car.name} className="w-100 mb-3" />
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="mb-1">{car.name}</h5>
                      <div className="pill">Seats {car.seats}</div>
                    </div>
                    <div className="fw-bold">₹{car.price}/day</div>
                  </div>
                  <p className="text-muted small mb-3">{car.about.slice(0, 90)}...</p>
                  <Link className="btn btn-primary w-100" to={`/cars/${car.id}`}>View & book</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-md-6">
              <span className="eyebrow mb-2 d-inline-block">How it works</span>
              <h3 className="mb-3">Keys in hand in three simple steps.</h3>
              <ol className="list-unstyled m-0 p-0">
                {steps.map((step, idx) => (
                  <li key={step} className="d-flex gap-3 mb-3">
                    <div className="feature-icon" style={{ width: 38, height: 38 }}>{idx + 1}</div>
                    <div className="text-muted">{step}</div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="col-md-6">
              <div className="card-soft p-4">
                <h5 className="mb-2">Ready to roll?</h5>
                <p className="text-muted mb-3">Pick a car and secure your dates now. We’ll have it prepped, cleaned, and fueled.</p>
                <Link to="/cars" className="btn btn-primary w-100 mb-2">Start booking</Link>
                <Link to="/contact" className="btn btn-outline-dark w-100">Need a custom quote?</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
