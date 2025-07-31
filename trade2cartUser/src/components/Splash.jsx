import React from 'react';
import '../assets/style/splash.css';
import logo from '../assets/images/logo.png';

const Splash = () => {
  return (
    <div className="splash">
      <div className="logo">
        <img src={logo} alt="recycle" className="icon" />
        <h1>Trade2Cart</h1>
        <p>THE SMARTEST CHOICE</p>
      </div>
      <div className="quote">
        "Transform trash into Treasure"
      </div>
    </div>
  );
};

export default Splash;
