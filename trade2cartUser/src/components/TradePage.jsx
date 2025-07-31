import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaHome, FaTasks, FaUserAlt } from 'react-icons/fa';

const TradePage = () => {
  const [entries, setEntries] = useState([]);
  const [userName, setUserName] = useState('');
  const [address, setAddress] = useState('');
  const [existingUserId, setExistingUserId] = useState(null);
  const navigate = useNavigate();

  const userMobile = localStorage.getItem('userMobile');
  const locationStored = localStorage.getItem('userLocation') || 'unknown';
  const languageStored = localStorage.getItem('userLanguage') || 'en';

  useEffect(() => {
    const localEntries = localStorage.getItem('wasteEntries');
    if (localEntries) setEntries(JSON.parse(localEntries));

    if (userMobile) {
      fetch("https://6879bd1aabb83744b7e9d65c.mockapi.io/api/v1/User")
        .then(res => res.json())
        .then(data => {
          const existingUser = data.find(u => u.phone === userMobile);
          if (existingUser) {
            setExistingUserId(existingUser.id);
            if (existingUser.name) setUserName(existingUser.name);
            if (existingUser.address) setAddress(existingUser.address);
          }
        })
        .catch(err => console.error("User fetch failed:", err));
    }
  }, []);

  const handleConfirmTrade = async () => {
    if (!userName.trim() || !address.trim()) {
      toast.error("Please enter your name and address.");
      return;
    }

    localStorage.setItem('userName', userName);
    localStorage.setItem('userAddress', address);

    const userPayload = {
      phone: userMobile,
      name: userName,
      address: address,
      language: languageStored,
      location: locationStored,
      timestamp: new Date().toISOString(),
      Status: "Pending"
    };

    try {
      if (existingUserId) {
        await fetch(`https://6879bd1aabb83744b7e9d65c.mockapi.io/api/v1/User/${existingUserId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userPayload)
        });
      } else {
        const res = await fetch("https://6879bd1aabb83744b7e9d65c.mockapi.io/api/v1/User", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userPayload)
        });
        const newUser = await res.json();
        setExistingUserId(newUser.id);
      }

      for (let entry of entries) {
        await fetch("https://6879bd1aabb83744b7e9d65c.mockapi.io/api/v1/WasteEntries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...entry,
            mobile: userMobile,
            timestamp: new Date().toISOString(),
          })
        });
      }

      toast.success('✅ Trade Confirmed!');
      localStorage.removeItem('wasteEntries');
      navigate('/hello');
    } catch (error) {
      toast.error("Something went wrong while saving your trade.");
      console.error("Trade error:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between p-4 bg-[#f2f7f8]">
      <div>
        <h2 className="text-xl font-semibold mb-4">Confirm Your Trade</h2>

        <div className="bg-gray-100 p-4 rounded mb-4">
          <input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          />
          <textarea
            placeholder="Enter your address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full p-2 border rounded"
          ></textarea>
        </div>

        <div className="space-y-4">
          {entries.map((entry, idx) => (
            <div key={idx} className="border p-3 rounded bg-white shadow">
              <p className="mb-2">{entry.text}</p>
              {entry.image && (
                <img src={entry.image} alt="Waste" className="w-full max-h-40 object-contain rounded" />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleConfirmTrade}
          className="w-full mt-6 py-2 bg-green-600 text-white rounded"
        >
          ✅ Confirm Trade
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="flex justify-around items-center mt-10 p-3 bg-white rounded-t-3xl shadow-inner">
        <Link to="/hello" className="flex flex-col items-center text-green-600 no-underline">
          <FaHome />
          <span className="text-xs">Home</span>
        </Link>
        <Link to="/task" className="flex flex-col items-center text-gray-500 no-underline">
          <FaTasks />
          <span className="text-xs">Tasks</span>
        </Link>
        <Link to="/account" className="flex flex-col items-center text-gray-500 no-underline">
          <FaUserAlt />
          <span className="text-xs">Account</span>
        </Link>
      </div>
    </div>
  );
};

export default TradePage;
