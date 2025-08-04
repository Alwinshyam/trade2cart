import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaTasks, FaUserAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import axios from 'axios';

const API_URL = 'https://6879bd1aabb83744b7e9d65c.mockapi.io/api/v1/User';

const AccountPage = () => {
  const [expandedSection, setExpandedSection] = useState(null);
  const [userData, setUserData] = useState([]);
  const [userMobile, setUserMobile] = useState('');

  const toggleSection = (section) => {
    setExpandedSection(prev => (prev === section ? null : section));
  };

  useEffect(() => {
    const mobile = localStorage.getItem('userMobile');
    setUserMobile(mobile);
  }, []);

  useEffect(() => {
    if (!userMobile) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(API_URL);
        setUserData(res.data || []);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };

    fetchData();
  }, [userMobile]);

  const filteredHistory = userData.filter(user => user.phone === userMobile);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8f8f8]">
      <div className="px-4 pt-6 pb-2">
        <h2 className="text-xl font-bold mb-6">Account</h2>

        <div className="space-y-4 bg-white p-4 rounded-xl shadow-md">

          {/* 🔒 Privacy Policy */}
          <div onClick={() => toggleSection('privacy')} className="cursor-pointer">
            <div className="flex justify-between items-center border-b pb-3 text-gray-800 font-medium">
              <span>Privacy Policy</span>
              {expandedSection === 'privacy' ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedSection === 'privacy' && (
              <div className="mt-3 text-sm text-gray-600">
                We respect your privacy. Your data is securely stored and not shared.
              </div>
            )}
          </div>

          {/* 📄 Terms & Conditions */}
          <div onClick={() => toggleSection('terms')} className="cursor-pointer">
            <div className="flex justify-between items-center border-b pb-3 text-gray-800 font-medium">
              <span>Terms & Conditions</span>
              {expandedSection === 'terms' ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedSection === 'terms' && (
              <div className="mt-3 text-sm text-gray-600">
                By using our services, you agree to our terms and policies.
              </div>
            )}
          </div>

          {/* 📜 History */}
          <div onClick={() => toggleSection('history')} className="cursor-pointer">
            <div className="flex justify-between items-center text-gray-800 font-medium">
              <span>History</span>
              {expandedSection === 'history' ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {expandedSection === 'history' && (
              <div className="mt-3 text-sm text-gray-600 space-y-3">
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-gray-100 p-3 rounded-lg border-l-4 border-green-500 shadow-sm"
                    >
                      <div><strong>Name:</strong> {entry.name}</div>
                      <div><strong>Status:</strong> {entry.Status || 'Pending'}</div>
                      <div><strong>Date:</strong> {new Date(entry.timestamp).toLocaleString()}</div>
                      <div><strong>Address:</strong> {entry.address}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-red-500">No history found for your number.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Bottom Navigation Bar */}
      <div className="flex justify-around items-center mt-10 p-3 bg-white rounded-t-3xl shadow-inner">
        <Link to="/hello" className="flex flex-col items-center text-gray-500 no-underline">
          <FaHome />
          <span className="text-xs">Home</span>
        </Link>
        <Link to="/task" className="flex flex-col items-center text-gray-500 no-underline">
          <FaTasks />
          <span className="text-xs">Tasks</span>
        </Link>
        <Link to="/account" className="flex flex-col items-center text-green-600 no-underline">
          <FaUserAlt />
          <span className="text-xs">Account</span>
        </Link>
      </div>
    </div>
  );
};

export default AccountPage;
