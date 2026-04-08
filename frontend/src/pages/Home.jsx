import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import heroCar from '../assets/images/car.gif';
import {
  AUTH_UPDATED_EVENT,
  getStoredToken,
  getStoredUser,
  isOwnerUser,
} from '../utils/authStorage.js';

const Home = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const sync = () => {
      setLoggedIn(Boolean(getStoredToken()));
      setIsOwner(isOwnerUser(getStoredUser()));
    };
    sync();
    window.addEventListener(AUTH_UPDATED_EVENT, sync);
    return () => window.removeEventListener(AUTH_UPDATED_EVENT, sync);
  }, []);

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
    'Sign in to browse vehicles listed by individual owners',
    'Pick dates and book the car or bike that fits your trip',
    'Meet the owner and drive—share live location during the rental when you choose',
  ];

  return (
    <>
      <section className="hero container">
        <div className="row align-items-center g-4">
          <div className="col-lg-6">
            <span className="eyebrow mb-3">Premium Car Rental</span>
            <h1>Book the right car for today’s journey in a few clicks.</h1>
            <p className="lead mb-4">
              Verified owners list their own cars and bikes with real registration details and pricing.
              Sign in to explore the marketplace—listings are not shown to guests.
            </p>
            <div className="d-flex gap-3 flex-wrap">
              {loggedIn ? (
                <Link
                  to={isOwner ? "/owner/dashboard" : "/cars"}
                  className="btn btn-primary px-4 py-2"
                >
                  {isOwner ? "Open owner dashboard" : "Browse vehicles"}
                </Link>
              ) : (
                <>
                  <Link to="/login?role=customer" className="btn btn-primary px-4 py-2">Customer login</Link>
                  <Link to="/register?role=customer" className="btn btn-outline-dark px-4 py-2">Customer sign up</Link>
                  <Link to="/login?role=owner" className="btn btn-dark px-4 py-2">Owner login</Link>
                  <Link to="/register?role=owner" className="btn btn-outline-secondary px-4 py-2">Owner sign up</Link>
                </>
              )}
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
          <div className="row g-4 align-items-center">
            <div className="col-lg-7">
              <span className="eyebrow mb-2 d-inline-block">Marketplace</span>
              <h3 className="mb-3">Listings from many owners in one place</h3>
              <p className="text-muted mb-0">
                Each owner sets their own daily price. After you sign in, you can compare vehicles,
                see registration and colour details, and book the trip that fits you.
              </p>
            </div>
            <div className="col-lg-5 text-lg-end">
              {!loggedIn && (
                <p className="small text-muted mb-2">Start by choosing whether you are an owner or a customer.</p>
              )}
              <div className="d-flex flex-wrap gap-2 justify-content-lg-end">
                <Link to="/login?role=customer" className="btn btn-light">Customer login</Link>
                <Link to="/register?role=customer" className="btn btn-light">I’m renting (customer)</Link>
                <Link to="/login?role=owner" className="btn btn-dark">Owner login</Link>
                <Link to="/register?role=owner" className="btn btn-outline-light">I’m an owner</Link>
                {loggedIn && (
                  <Link to={isOwner ? "/owner/dashboard" : "/cars"} className="btn btn-primary">
                    {isOwner ? "Go to dashboard" : "Go to vehicles"}
                  </Link>
                )}
              </div>
            </div>
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
                <p className="text-muted mb-3">
                  {loggedIn
                    ? isOwner
                      ? 'Open your owner dashboard to list vehicles, manage bookings, and track live customer routes.'
                      : 'Open the vehicle list to check availability and prices from every owner on the platform.'
                    : 'Log in or create a customer account first—the catalogue is only available to signed-in users.'}
                </p>
                {loggedIn ? (
                  <Link to={isOwner ? "/owner/dashboard" : "/cars"} className="btn btn-primary w-100 mb-2">
                    {isOwner ? "Open owner dashboard" : "Browse vehicles"}
                  </Link>
                ) : (
                  <Link to="/login?role=customer" className="btn btn-primary w-100 mb-2">Log in to continue</Link>
                )}
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
