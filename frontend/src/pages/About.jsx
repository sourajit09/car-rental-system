import React from 'react';

const About = () => {
  return (
    <>
      <div className="container section-pad" style={{ minHeight: '70vh' }}>
        <div className="row g-4 align-items-center">
          <div className="col-lg-6">
            <span className="eyebrow mb-3 d-inline-block">About Car Rental</span>
            <h2 className="mb-3">We’re building the most effortless way to get a great car, fast.</h2>
            <p className="text-muted mb-3">
              Car Rental keeps a curated fleet across the city so you can book confidently—no last-minute surprises,
              no confusing fees, just quality vehicles that match the moment.
            </p>
            <ul className="text-muted">
              <li className="mb-2">Modern fleet refreshed every season and cleaned before every handoff.</li>
              <li className="mb-2">Transparent daily pricing with insurance baked in.</li>
              <li className="mb-2">Real humans on call for changes, extensions, and support.</li>
            </ul>
          </div>
          <div className="col-lg-6">
            <div className="card-soft p-4">
              <h5 className="mb-2">Our promise</h5>
              <p className="text-muted mb-3">
                We obsess over uptime: vehicles are maintained on a strict schedule and verified before release.
                If something isn’t right, we’ll make it right—quickly.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <div className="stat-tile">
                  <div className="text-muted small">Avg. response time</div>
                  <div className="fw-bold fs-5">under 10 min</div>
                </div>
                <div className="stat-tile">
                  <div className="text-muted small">Repeat riders</div>
                  <div className="fw-bold fs-5">68%</div>
                </div>
                <div className="stat-tile">
                  <div className="text-muted small">Vehicles inspected</div>
                  <div className="fw-bold fs-5">2x weekly</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default About;
