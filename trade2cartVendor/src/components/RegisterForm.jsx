import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../assets/style/RegisterForm.css';
import { toast } from 'react-toastify';

const RegisterForm = () => {
  const { state } = useLocation();
  const phone = state?.phone || '';
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    location: '',
    aadhaar: '',
    pan: '',
    license: '',
    status: 'pending',
    aadhaarPhoto: null,
    panPhoto: null,
    licensePhoto: null,
    profilePhoto: null
  });

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e, key) => {
    setForm({ ...form, [key]: e.target.files[0] });
  };

  const convertToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleSubmit = async () => {
    if (!form.name || !form.location || !form.aadhaar || !form.pan || !form.license) {
      toast.info('Please fill all required fields.', { position: 'top-center' });
      return;
    }

    try {
      const aadhaarPhoto = form.aadhaarPhoto ? await convertToBase64(form.aadhaarPhoto) : '';
      const panPhoto = form.panPhoto ? await convertToBase64(form.panPhoto) : '';
      const licensePhoto = form.licensePhoto ? await convertToBase64(form.licensePhoto) : '';
      const profilePhoto = form.profilePhoto ? await convertToBase64(form.profilePhoto) : '';

      const formData = {
        ...form,
        phone,
        aadhaarPhoto,
        panPhoto,
        licensePhoto,
        profilePhoto
      };

      await fetch(`https://688bc5782a52cabb9f52cc6c.mockapi.io/api/v1/vendodetails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      toast.success('Registered successfully!', { position: 'top-right' });
      navigate('/dashboard', { state: { user: formData } });
    } catch (err) {
      toast.error('Submission failed. Please try again.', { position: 'bottom-center' });
    }
  };

  return (
    <div className="login-container">
      <h2>Become a Partner</h2>
      <p>Please provide your details to get started.</p>

      <input name="name" placeholder="Full Name" onChange={handleInput} />
      <input name="location" placeholder="Location (City, State)" onChange={handleInput} />
      <input name="aadhaar" placeholder="Aadhaar Number" onChange={handleInput} />
      <label>Aadhaar Card Photo <input type="file" onChange={(e) => handleFile(e, 'aadhaarPhoto')} /></label>
      <input name="pan" placeholder="PAN Card Number" onChange={handleInput} />
      <label>PAN Card Photo <input type="file" onChange={(e) => handleFile(e, 'panPhoto')} /></label>
      <input name="license" placeholder="Driving License No." onChange={handleInput} />
      <label>Driving License Photo <input type="file" onChange={(e) => handleFile(e, 'licensePhoto')} /></label>
      <label>Profile Photo <input type="file" onChange={(e) => handleFile(e, 'profilePhoto')} /></label>

      <button onClick={handleSubmit}>Submit for Verification</button>
    </div>
  );
};

export default RegisterForm;
