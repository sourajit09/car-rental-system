import React from 'react';

const Footer = () => {
  return (
    <>
      <footer className="footer py-4">
        <div className="container d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div className="fw-semibold">Car Rental · Move better, book faster.</div>
          <div className="text-muted small">© {new Date().getFullYear()} All rights reserved.</div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
