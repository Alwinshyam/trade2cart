import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import logo from '../assets/images/logo.png';
import '../assets/style/LoginPage.css';

const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleGetOtp = () => {
    if (phone.length === 10) {
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      toast.success(`OTP sent to +91 ${phone}: ${generatedOtp}`); // For testing, show the OTP

      // Navigate and pass phone & OTP
      setTimeout(() => {
        navigate('/otp', { state: { phone, generatedOtp } });
      }, 1000);
    } else {
      toast.error('Please enter a valid 10-digit mobile number.');
    }
  };

  return (
    <div className="login-container">
      <img src={logo} alt="Logo" className="logo" />
      <h2>Welcome<br />Partner!</h2>
      <p>Enter your phone number to continue.</p>
      <input
        type="tel"
        maxLength="10"
        placeholder="10-digit mobile"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
      />
      <button onClick={handleGetOtp}>Get OTP</button>
    </div>
  );
};

export default LoginPage;
