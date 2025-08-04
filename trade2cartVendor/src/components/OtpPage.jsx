import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.png';
import '../assets/style/OtpPage.css';
import { toast } from 'react-toastify';

const OtpPage = () => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const navigate = useNavigate();
  const { state } = useLocation();
  const phone = state?.phone || '';
  const actualOtp = state?.generatedOtp || '';

  useEffect(() => {
    if (actualOtp) {
      console.log(`Generated OTP for +91${phone} is: ${actualOtp}`);
    }
  }, [actualOtp, phone]);

  const handleChange = (index, value) => {
    if (/^\d?$/.test(value)) {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);
      if (value && index < 3) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleSubmit = async () => {
    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 4) {
      toast.info('Please enter all 4 digits of the OTP.', { position: 'top-center' });
      return;
    }

    if (enteredOtp !== actualOtp) {
      toast.warning('❌ Incorrect OTP. Please try again.', { position: 'bottom-center' });
      return;
    }

    toast.success('🎉 OTP Verified Successfully!', { position: 'top-right' });

    try {
      // ✅ Check if user exists in Vendor DB
      const checkRes = await fetch(
        `https://688bc5782a52cabb9f52cc6c.mockapi.io/api/v1/Vendor`
      );
      const allUsers = await checkRes.json();
      const existing = allUsers.find((u) => u.phone === phone);

      if (existing) {
        // ✅ Fetch full user details by ID
        const fullUserRes = await fetch(
          `https://688bc5782a52cabb9f52cc6c.mockapi.io/api/v1/Vendor/${existing.id}`
        );
        const fullUser = await fullUserRes.json();

        toast.success('User already registered. Redirecting...', { position: 'top-center' });
        navigate('/dashboard', { state: { user: fullUser } });
      } else {
        // ❌ User not found → create new record with phone
        const postRes = await fetch(
          `https://688bc5782a52cabb9f52cc6c.mockapi.io/api/v1/Vendor`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
          }
        );
        const newUser = await postRes.json();

        toast.info('New user created. Please complete registration.', { position: 'top-center' });
        navigate('/register', { state: { phone: newUser.phone, id: newUser.id } });
      }
    } catch (error) {
      console.error('Error checking/creating user:', error);
      toast.error('Something went wrong. Please try again.', { position: 'top-center' });
    }
  };

  return (
    <div className="login-container">
      <img src={logo} alt="Logo" className="logo" />
      <h2>Verify Your Number</h2>
      <p>Enter the 4-digit OTP sent to +91 {phone}.</p>

      <div className="otp-box">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
          />
        ))}
      </div>

      <button onClick={handleSubmit}>Verify & Continue</button>
      <p className="change-number" onClick={() => navigate('/')}>
        Change number
      </p>
    </div>
  );
};

export default OtpPage;
