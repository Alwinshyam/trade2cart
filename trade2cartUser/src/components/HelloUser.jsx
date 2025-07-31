// HelloUser.js
import React, { useEffect, useState } from "react";
import {
  FaHome,
  FaTasks,
  FaUserAlt,
  FaMapMarkerAlt,
  FaBell,
  FaShoppingCart,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const HelloUser = ({ location: propLocation, userMobile }) => {
  const [location, setLocation] = useState(propLocation || "Unknown");
  const [showForm, setShowForm] = useState(false);
  const [formFields, setFormFields] = useState([{ text: "", image: null }]);
  const [savedData, setSavedData] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!propLocation) {
      const savedLocation = localStorage.getItem("userLocation");
      if (savedLocation) setLocation(savedLocation);
    }
  }, [propLocation]);

  useEffect(() => {
    const stored = localStorage.getItem("wasteEntries");
    if (stored) setSavedData(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("wasteEntries", JSON.stringify(savedData));
  }, [savedData]);

  const handleAddField = () => {
    setFormFields([...formFields, { text: "", image: null }]);
  };

  const handleChange = (index, field, value) => {
    const updated = [...formFields];
    updated[index][field] = value;
    setFormFields(updated);
  };

  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSave = async () => {
    const entries = await Promise.all(
      formFields.map(async (entry) => ({
        text: entry.text,
        image: entry.image ? await toBase64(entry.image) : null,
        mobile: userMobile || localStorage.getItem("userMobile") || "unknown",
      }))
    );

    setSavedData([...savedData, ...entries]);
    setFormFields([{ text: "", image: null }]);
    setShowForm(false);
    setShowCart(true);
  };

  const handleRemove = (index) => {
    const filtered = savedData.filter((_, i) => i !== index);
    setSavedData(filtered);
  };

  const handleImageUpdate = (file, index) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...savedData];
      updated[index].image = reader.result;
      setSavedData(updated);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#f2f7f8] p-4 flex flex-col justify-between text-gray-800">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow">
          <FaMapMarkerAlt className="text-green-500" />
          <span className="text-sm font-medium">{location || "Unknown"}</span>
        </div>
        <div className="flex items-center gap-3">
          <FaBell />
          <FaShoppingCart
            className="cursor-pointer"
            onClick={() => setShowCart(true)}
          />
        </div>
      </div>

      {showCart ? (
        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Your Waste Entries</h2>
          {savedData.length === 0 ? (
            <p className="text-gray-500 text-sm">No entries saved yet.</p>
          ) : (
            savedData.map((entry, idx) => (
              <div key={idx} className="mb-4 p-3 border rounded">
                <input
                  type="text"
                  value={entry.text}
                  onChange={(e) => {
                    const updated = [...savedData];
                    updated[idx].text = e.target.value;
                    setSavedData(updated);
                  }}
                  className="w-full mb-2 p-2 border rounded"
                />
                {entry.image && (
                  <img
                    src={entry.image}
                    alt="Uploaded"
                    className="w-full max-h-40 object-contain rounded mb-2"
                  />
                )}
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpdate(e.target.files[0], idx)}
                    className="flex-1"
                  />
                  <button
                    onClick={() => handleRemove(idx)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                  >
                    🗑 Remove
                  </button>
                </div>
              </div>
            ))
          )}
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowCart(false)}
              className="flex-1 py-2 bg-gray-300 text-black rounded"
            >
              🔙 Back
            </button>
            <button
              onClick={() => navigate("/trade")}
              className="flex-1 py-2 bg-green-600 text-white rounded"
            >
              🛒 Checkout
            </button>
          </div>
        </div>
      ) : showForm ? (
        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold mb-2">Add Waste Items</h2>
          {formFields.map((field, index) => (
            <div key={index} className="mb-4">
              <input
                type="text"
                placeholder="Enter description"
                value={field.text}
                onChange={(e) => handleChange(index, "text", e.target.value)}
                className="w-full mb-2 p-2 border rounded"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleChange(index, "image", e.target.files[0])}
                className="w-full mb-2"
              />
            </div>
          ))}
          <div className="flex gap-3">
            <button
              onClick={handleAddField}
              className="flex-1 py-2 bg-blue-500 text-white rounded"
            >
              ➕ Add
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 bg-green-500 text-white rounded"
            >
              ✅ Save
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-4 rounded-2xl shadow-lg">
          <h2 className="text-lg font-semibold">Hello, User!</h2>
          <p className="text-sm text-gray-500 mb-4">Ready to make a difference?</p>
          <div className="w-full h-24 mb-4 bg-gradient-to-r from-teal-100 via-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
            <div className="w-3 h-3 bg-yellow-400 rounded-full mx-1"></div>
            <div className="w-3 h-3 bg-red-500 rounded-full mx-1"></div>
          </div>
          <button
            className="w-full py-3 bg-green-500 text-white rounded-xl font-medium shadow hover:bg-green-600 transition"
            onClick={() => setShowForm(true)}
          >
            ♻️ Trade Your Waste
          </button>
        </div>
      )}

    
      {/* Bottom Navigation */}
<div className="flex justify-around items-center mt-8 p-3 bg-white rounded-t-3xl shadow-inner">
  <Link
    to="/hello"
    className="flex flex-col items-center text-green-600 no-underline"
  >
    <FaHome />
    <span className="text-xs">Home</span>
  </Link>
  <Link
    to="/task"
    className="flex flex-col items-center text-gray-500 no-underline"
  >
    <FaTasks />
    <span className="text-xs">Tasks</span>
  </Link>
  <Link
    to="/account"
    className="flex flex-col items-center text-gray-500 no-underline"
  >
    <FaUserAlt />
    <span className="text-xs">Account</span>
  </Link>
</div>

    </div>
  );
};

export default HelloUser;
