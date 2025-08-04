import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Process = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location?.state?.order;
  const phone = location?.state?.vendormobile; // ✅ get vendor's number directly
  const vendorLocation = location?.state.vendorLocation;
  console.log("Order:", order);
  console.log("Vendor Mobile Number:", phone);
  console.log("loc "+vendorLocation);
  

  const [itemsList, setItemsList] = useState([]);
  const [billItems, setBillItems] = useState([{ item: '', rate: '', weight: '', total: 0 }]);
  const [totalBill, setTotalBill] = useState(0);
  const [user, setUser] = useState({});
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchUserDetails();
  }, [phone]);

  const fetchItems = async () => {
    try {
      const res = await axios.get('https://688ce883cd9d22dda5cee640.mockapi.io/api/v1/Data');
      setItemsList(res.data);
    } catch (err) {
      console.error('Error fetching items:', err);
    }
  };

  const fetchUserDetails = async () => {
    if (!phone) return;
    try {
      const res = await fetch(`https://688bc5782a52cabb9f52cc6c.mockapi.io/api/v1/vendodetails?phone=${phone}`);
      const data = await res.json();
      if (data.length > 0) {
        setUser(data[0]);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleItemChange = async (index, value) => {
  const updated = [...billItems];
  updated[index].item = value;

  // Find the selected item in itemsList
  const selectedItem = itemsList.find(i => i.name === value);

  if (!selectedItem) {
    // If not found, add it to DB
    try {
      await axios.post('https://688ce883cd9d22dda5cee640.mockapi.io/api/v1/Data', { name: value });
      fetchItems();
    } catch (err) {
      console.error('Failed to add new item:', err);
    }
  } else {
    // If found, set the rate based on vendor location
    let locationRate = 0;

    // Option 1: rates as object
    if (selectedItem.rates && typeof selectedItem.rates === 'object') {
      locationRate = selectedItem.rates[vendorLocation] || 0;
    }

    // Option 2: flat list with location
    if (selectedItem.location === vendorLocation) {
      locationRate = selectedItem.rate || 0;
    }

    updated[index].rate = locationRate;
    const weight = parseFloat(updated[index].weight) || 0;
    updated[index].total = locationRate * weight;
  }

  setBillItems(updated);
  updateTotalBill(updated);
};


  const handleInputChange = (index, field, value) => {
    const updated = [...billItems];
    updated[index][field] = value;
    const rate = parseFloat(updated[index].rate) || 0;
    const weight = parseFloat(updated[index].weight) || 0;
    updated[index].total = rate * weight;
    setBillItems(updated);
    updateTotalBill(updated);
  };

  const updateTotalBill = (items) => {
    const total = items.reduce((acc, item) => acc + item.total, 0);
    setTotalBill(total);
  };

  const addAnotherItem = () => {
    setBillItems([...billItems, { item: '', rate: '', weight: '', total: 0 }]);
  };

  const removeItem = (index) => {
    const updated = [...billItems];
    updated.splice(index, 1);
    setBillItems(updated);
    updateTotalBill(updated);
  };

  const handleSubmit = async () => {
  try {
    // 1. Save the bill data
    await axios.post('https://688f0261f21ab1769f87f16c.mockapi.io/api/v1/VendorDataStore', {
      billItems,
      totalBill,
      timestamp: new Date().toISOString(),
      mobile: order?.mobile || '',
      orderId: order?.id || '',
    });

    // 2. Find the user by mobile number
    const userResponse = await axios.get('https://6879bd1aabb83744b7e9d65c.mockapi.io/api/v1/User');
    const users = userResponse.data;
    const matchedUser = users.find(user => user.phone === order?.mobile);

    // 3. If user found, update their status to 'complete'
    if (matchedUser) {
      await axios.put(`https://6879bd1aabb83744b7e9d65c.mockapi.io/api/v1/User/${matchedUser.id}`, {
        ...matchedUser,
        Status: 'complete',
      });
    } else {
      console.warn('No user found with matching mobile number');
    }

    // 4. Reset and navigate
    alert('Bill saved and status updated!');
    setBillItems([{ item: '', rate: '', weight: '', total: 0 }]);
    setTotalBill(0);
    navigate('/dashboard', { state: { phone } });
  } catch (err) {
    console.error('Error in handleSubmit:', err);
    alert('Error saving bill or updating status');
  }
};

const closeBtnStyle = {
  backgroundColor: '#ccc',
  color: '#000',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '5px',
  cursor: 'pointer'
};
  return (
    <div className="p-4 max-w-xl mx-auto">
      {/* Header with profile */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className="text-xl font-bold">Generate Bill</h2>
        <div
          onClick={() => setShowProfile(true)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid #ccc',
            cursor: 'pointer',
            backgroundColor: '#eee',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {user?.profilePhoto ? (
            <img src={user.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span role="img" aria-label="user" style={{ fontSize: '20px' }}>👤</span>
          )}
        </div>
      </div>

      {/* User Profile Modal */}
      {showProfile && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '20px',
            borderRadius: '10px',
            width: '90%',
            maxWidth: '400px',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowProfile(false)}
              style={closeBtnStyle}
            >×</button>
            <h3>User Details</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li><strong>Name:</strong> {user.name}</li>
              <li><strong>Phone:</strong> {user.phone}</li>
              <li><strong>Location:</strong> {user.location}</li>
              <li><strong>Aadhaar:</strong> {user.aadhaar}</li>
              <li><strong>PAN:</strong> {user.pan}</li>
              <li><strong>License:</strong> {user.license}</li>
              <li><strong>Status:</strong> {user.status}</li>
            </ul>
          </div>
        </div>
      )}

      {/* Order info */}
      {order && (
        <div className="mb-4 bg-blue-50 p-3 rounded text-sm text-blue-700">
          <p><strong>Customer:</strong> {order.vendorName}</p>
          <p><strong>Mobile:</strong> {order.mobile}</p>
          <p><strong>Order ID:</strong> #{order.id}</p>
        </div>
      )}

      {/* Billing form */}
      {billItems.map((bill, index) => (
        <div key={index} className="bg-white p-4 mb-3 rounded shadow">
          <input
            className="w-full border mb-2 p-2 rounded"
            list="items"
            placeholder="Item"
            value={bill.item}
            onChange={e => handleItemChange(index, e.target.value)}
          />
          <datalist id="items">
            {itemsList.map((item, idx) => (
              <option key={idx} value={item.name} />
            ))}
          </datalist>
          <input
            className="w-full border mb-2 p-2 rounded"
            type="number"
            placeholder="Rate (₹)"
            value={bill.rate}
            onChange={e => handleInputChange(index, 'rate', e.target.value)}
          />
          <input
            className="w-full border mb-2 p-2 rounded"
            type="number"
            placeholder="Weight/Unit"
            value={bill.weight}
            onChange={e => handleInputChange(index, 'weight', e.target.value)}
          />
          <div className="flex justify-between">
            <span>Total: ₹{bill.total.toFixed(2)}</span>
            {billItems.length > 1 && (
              <button className="text-red-500 text-sm" onClick={() => removeItem(index)}>REMOVE</button>
            )}
          </div>
        </div>
      ))}

      <button className="text-blue-600 mb-4" onClick={addAnotherItem}>+ Add Another Item</button>

      <div className="bg-green-50 text-green-700 p-3 rounded font-semibold flex justify-between">
        <span>Total Bill</span>
        <span>₹{totalBill.toFixed(2)}</span>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          className="bg-gray-300 text-black w-1/2 py-2 rounded"
          onClick={() => navigate('/dashboard', { state: { phone } })}
        >Cancel</button>
        <button
          className="bg-green-600 text-white w-1/2 py-2 rounded"
          onClick={handleSubmit}
        >Save Bill</button>
      </div>
    </div>
  );
};

export default Process;
