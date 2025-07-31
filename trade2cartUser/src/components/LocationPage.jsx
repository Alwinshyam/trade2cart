import React from 'react';
import '../assets/style/LocationPage.css';
import { FaMapMarkerAlt } from 'react-icons/fa';

const LocationPage = ({ onSelectLocation }) => {
  return (
    <div className="location-container">
      <h2>Select Your Location</h2>
      <div className="location-option" onClick={() => onSelectLocation('Vellore')}>
        <FaMapMarkerAlt /> Vellore
      </div>
      <div className="location-option" onClick={() => onSelectLocation('Chennai')}>
        <FaMapMarkerAlt /> Chennai
      </div>
      <div className="location-option" onClick={() => onSelectLocation('Bangalore')}>
        <FaMapMarkerAlt /> Bangalore
      </div>
    </div>
  );
};

export default LocationPage;
