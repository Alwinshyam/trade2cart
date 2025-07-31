import React, { useState, useEffect } from 'react';
import '../assets/style/LoginPage.css';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const LoginPage = ({ language, location }) => {
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [resendStatus, setResendStatus] = useState('');

  const navigate = useNavigate();

  // Save location/language to localStorage on first load
  useEffect(() => {
    if (location) localStorage.setItem('userLocation', location);
    if (language) localStorage.setItem('userLanguage', language);
  }, [location, language]);

  useEffect(() => {
    let interval;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const generateAndSendOtp = () => {
    try {
       const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otpCode);
    console.log('OTP sent to mobile:', otpCode); // Simulated SMS
    toast.success(`OTP has been successfully sent ${phone}`)
    } catch (error) {
      toast.error("invalid number")
    }
   
  };

  const handleGetOtp = () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setPhoneError('Enter a valid 10-digit Indian number');
      return;
    }

    setPhoneError('');
    generateAndSendOtp();
    setOtpSent(true);
    setTimer(60);
    setResendStatus('');
  };

  // Save user after OTP is verified
  const saveUserToMockAPI = async () => {
    try {
      const savedLocation = localStorage.getItem('userLocation') || 'Unknown';
      const savedLanguage = localStorage.getItem('userLanguage') || 'en';

      const response = await fetch('https://6879bd1aabb83744b7e9d65c.mockapi.io/api/v1/User', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          location: savedLocation,
          language: savedLanguage,
          createdAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        console.error('❌ Failed to save user:', response.statusText);
      } else {
        console.log('✅ User saved to MockAPI');
      }
    } catch (error) {
      console.error('❌ Error saving user:', error);
    }
  };

  const handleVerify = () => {
    if (timer === 0) {
      setOtpError('OTP expired. Please request a new one.');
      toast.error("Time Reachedout")
      return;
    }

    if (otp !== generatedOtp) {
      setOtpError('Invalid OTP');
      setOtpError()
      toast.error("OTP NOT MATCHED")

      return;
    }

    setOtpError('');
    saveUserToMockAPI();

    // ✅ Store the phone number in localStorage
    localStorage.setItem('userMobile', phone);

    navigate('/hello');
  };

  const handleResendOtp = () => {
    generateAndSendOtp();
    setOtp('');
    setOtpError('');
    setTimer(60);
    setResendStatus('OTP resent successfully!');
  };

  return (
    <div className="login-container">
      <h2>Login to Start</h2>

      <div className={`input-wrapper ${phoneError ? 'error' : ''}`}>
        <span className="country-code">+91 -</span>
        <input
          type="tel"
          placeholder="Enter mobile number"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            setPhoneError('');
          }}
          maxLength={10}
        />
      </div>
      {phoneError && <p className="error-text">{phoneError}</p>}

      <button onClick={handleGetOtp} className="get-otp-btn">GET OTP</button>

      {otpSent && (
        <>
          <div className={`input-wrapper otp-field ${otpError ? 'error' : ''}`}>
            <input
              type="text"
              placeholder="- - - - - -"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setOtpError('');
              }}
              maxLength={6}
            />
          </div>
          {otpError && <p className="error-text">{otpError}</p>}

          <button className="verify-btn" onClick={handleVerify}>
            Verify & Continue
          </button>

          <p className="timer-text">OTP valid for: {timer}s</p>

          <button className="resend-btn" onClick={handleResendOtp}>
            Resend OTP
          </button>
          {resendStatus && <p className="success-text">{resendStatus}</p>}
        </>
      )}
    </div>
  );
};

export default LoginPage;
