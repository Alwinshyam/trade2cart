import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Dashboard = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const phone = state?.user?.phone || state?.phone || null;

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [otpModal, setOtpModal] = useState(null);
  const [otpInput, setOtpInput] = useState(['', '', '', '']);
  const otpRefs = useRef([]);
  const [usersMap, setUsersMap] = useState({});

  useEffect(() => {
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
    fetchUserDetails();
  }, [phone]);

  useEffect(() => {
    const fetchAssignedOrders = async () => {
      try {
        const res = await fetch(`https://688ce883cd9d22dda5cee640.mockapi.io/api/v1/Product`);
        const data = await res.json();
        const filtered = data.filter(order => order.vendorPhone === phone);
        setAssignedOrders(filtered);
      } catch (error) {
        console.error('Error fetching assigned orders:', error);
      }
    };
    if (phone) {
      fetchAssignedOrders();
    }
  }, [phone]);

  useEffect(() => {
    const fetchUsersMap = async () => {
      try {
        const res = await fetch('https://6879bd1aabb83744b7e9d65c.mockapi.io/api/v1/User');
        const users = await res.json();
        const map = {};
        users.forEach(user => {
          map[user.phone] = user.address || 'No address';
        });
        setUsersMap(map);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsersMap();
  }, []);

  const verifyOtpAndProceed = async () => {
    const enteredOtp = otpInput.join('');
    try {
      const res = await fetch(`https://6879bd1aabb83744b7e9d65c.mockapi.io/api/v1/User`);
      const users = await res.json();
      const customer = users.find(u => u.phone === otpModal.mobile);

      if (!customer) {
        toast.error('Customer not found in OTP database.');
        return;
      }

      if (customer.otp === enteredOtp) {
        navigate('/process', { state: { order: otpModal, vendormobile: phone, vendorLocation: user?.location || '', } });
        console.log(user?.location);
      } else {
        toast.error('Invalid OTP. Please try again.');
        setOtpInput(['', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error('OTP Verification failed:', err);
      toast.error('Something went wrong while verifying OTP.');
    }
  };

  const renderDashboard = () => {
    const groupedOrders = assignedOrders.reduce((acc, order) => {
      if (!acc[order.mobile]) {
        acc[order.mobile] = {
          mobile: order.mobile,
          vendorName: order.vendorName,
          products: [],
          totalAmount: 0,
          id: order.id
        };
      }
      acc[order.mobile].products.push(order.products);
      acc[order.mobile].totalAmount += parseFloat(order.totalAmount || 0);
      return acc;
    }, {});
    const groupedList = Object.values(groupedOrders);

    return (
      <div style={{ padding: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Dashboard</h2>
          <div onClick={() => setShowProfile(true)} style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid #ccc', cursor: 'pointer', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span role="img" aria-label="user" style={{ fontSize: '20px' }}>👤</span>
            )}
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={cardStyle}><p>Completed Today</p><h2 style={{ color: 'green' }}>0</h2></div>
          <div style={cardStyle}><p>Earnings Today</p><h2 style={{ color: 'purple' }}>₹0.00</h2></div>
          <div style={cardStyle}><p>Pending Work</p><h2 style={{ color: '#FF9800' }}>{groupedList.length}</h2></div>
        </div>

        <div style={{ marginTop: '30px', ...cardStyle }}>
          <h3>My Assigned Orders</h3>
          {groupedList.length === 0 ? <p>No assigned orders found.</p> : (
            <table style={{ width: '100%', marginTop: '10px' }}>
              <thead>
                <tr>
                  <th align="left">User</th>
                  <th align="left">Address</th>
                  <th align="left">Products</th>
                  <th align="left">Phone</th>
                  <th align="left">Total</th>
                  <th align="left">Action</th>
                </tr>
              </thead>
              <tbody>
                {groupedList.map((group, index) => (
                  <tr key={index}>
                    <td>{group.vendorName}</td>
                    <td>{usersMap[group.mobile] || 'N/A'}</td>
                    <td>{group.products.join(', ')}</td>
                    <td><a href={`tel:${group.mobile}`}>{group.mobile}</a></td>
                    <td>₹{group.totalAmount.toFixed(2)}</td>
                    <td>
                      <button style={buttonStyle} onClick={() => {
                        setOtpInput(['', '', '', '']);
                        setOtpModal(group);
                        setTimeout(() => otpRefs.current[0]?.focus(), 100);
                      }}>Process</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {otpModal && (
          <div style={modalOverlayStyle}>
            <div style={modalStyle}>
              <h3>Order Verification</h3>
              <p>Enter the 4-digit OTP from the customer's app to proceed with order <b>#{otpModal.id}</b>.</p>
              <p>Customer: <b>{otpModal.vendorName}</b></p>
              <a href={`tel:${otpModal.mobile}`}><button style={{ ...buttonStyle, marginBottom: '10px' }}>Call Customer ({otpModal.mobile})</button></a>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                {otpInput.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    maxLength={1}
                    style={{ width: '40px', height: '40px', textAlign: 'center', fontSize: '18px', border: '1px solid #ccc', borderRadius: '4px' }}
                    value={digit}
                    onChange={e => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      const newOtp = [...otpInput];
                      newOtp[i] = value;
                      setOtpInput(newOtp);
                      if (value && i < 3) otpRefs.current[i + 1]?.focus();
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace' && !otpInput[i] && i > 0) {
                        otpRefs.current[i - 1]?.focus();
                      }
                    }}
                  />
                ))}
              </div>
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setOtpModal(null)} style={closeBtnStyle}>Cancel</button>
                <button onClick={verifyOtpAndProceed} style={buttonStyle}>Verify & Proceed</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderHistory = () => (
    <div style={{ padding: '20px' }}>
      <h2>Order History</h2>
      <p>📋 No past orders to display.</p>
    </div>
  );

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh', backgroundColor: '#f5f5f5', paddingBottom: '70px' }}>
      <ToastContainer position="top-center" />
      {user ? (
        <>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'history' && renderHistory()}
        </>
      ) : (
        <p>Loading user data...</p>
      )}

      {showProfile && (
        <div style={modalOverlayStyle}>
          <div style={modalStyle}>
            <button onClick={() => setShowProfile(false)} style={closeBtnStyle}>×</button>
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

      <div style={bottomNavStyle}>
        <div onClick={() => setActiveTab('dashboard')} style={{ textAlign: 'center', color: activeTab === 'dashboard' ? '#2196F3' : '#888' }}>
          <div>🏠</div>
          <small>Dashboard</small>
        </div>
        <div onClick={() => setActiveTab('history')} style={{ textAlign: 'center', color: activeTab === 'history' ? '#2196F3' : '#888' }}>
          <div>📜</div>
          <small>History</small>
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  background: '#fff',
  padding: '16px',
  borderRadius: '10px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const buttonStyle = {
  backgroundColor: '#219653',
  color: '#fff',
  border: 'none',
  padding: '8px 12px',
  borderRadius: '5px',
  cursor: 'pointer'
};

const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999
};

const modalStyle = {
  background: '#fff',
  padding: '20px',
  borderRadius: '10px',
  width: '90%',
  maxWidth: '400px',
  position: 'relative'
};

const closeBtnStyle = {
  backgroundColor: '#ccc',
  color: '#000',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '5px',
  cursor: 'pointer'
};

const bottomNavStyle = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  height: '60px',
  backgroundColor: '#fff',
  borderTop: '1px solid #ccc',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  boxShadow: '0 -1px 5px rgba(0,0,0,0.1)'
};

export default Dashboard;
