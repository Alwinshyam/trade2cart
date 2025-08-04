import React, { useEffect, useState } from 'react';
import { FaHome, FaTasks, FaUserAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../assets/style/task.css';

const TaskPage = () => {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [otp, setOtp] = useState('');
  const userMobile = localStorage.getItem('userMobile');

  useEffect(() => {
    fetch('https://6879bd1aabb83744b7e9d65c.mockapi.io/api/v1/User')
      .then(res => res.json())
      .then(async data => {
        const user = data.find(u => u.phone === userMobile);
        if (user) {
          const currentStatus = user.Status || 'Pending';
          setStatus(currentStatus);

          // ✅ If status is "on-schedule", ensure OTP exists or generate & store a new one
          if (currentStatus.toLowerCase() === 'on-schedule') {
            let newOtp = user.otp;
            if (!newOtp || newOtp.length !== 4) {
              newOtp = Math.floor(1000 + Math.random() * 9000).toString();
              await fetch(`https://6879bd1aabb83744b7e9d65c.mockapi.io/api/v1/User/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp: newOtp }),
              });
            }
            setOtp(newOtp);
          } else if (user.otp) {
            // 🔁 If already has OTP even when not on-schedule, reuse it
            setOtp(user.otp);
          }
        }
        setLoading(false);
      });
  }, []);

  const statusSteps = [
    { title: 'Ordered' },
    { title: 'Shipped' },
    { title: 'Delivered' },
  ];

  const getStatusIndex = () => {
    if (status.toLowerCase() === 'pending') return 0;
    if (status.toLowerCase() === 'on-schedule') return 1;
    if (status.toLowerCase() === 'completed') return 2;
    return -1;
  };

  const statusIndex = getStatusIndex();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8f8f8]">
      <div className="px-4 pt-6 pb-2">
        <h2 className="text-xl font-bold mb-6">🚚 Trade Status Timeline</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="flex justify-between items-start relative bg-white p-5 rounded-xl shadow-md">
              {statusSteps.map((step, index) => (
                <div
                  key={index}
                  className={`text-center w-1/3 order-tracking ${
                    index <= statusIndex ? 'completed' : ''
                  }`}
                >
                  <span className="is-complete"></span>
                  <p className={`${index <= statusIndex ? 'text-black' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                </div>
              ))}
            </div>

            {/* 🔐 Only display OTP when status is on-schedule */}
            {status.toLowerCase() === 'on-schedule' && otp && (
              <div className="mt-5 p-3 bg-white rounded-lg shadow text-center">
                <p className="text-sm text-gray-600">Your OTP for this step:</p>
                <p className="text-lg font-bold tracking-widest text-green-700">{otp}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* ✅ Bottom Navigation Bar */}
      <div className="flex justify-around items-center mt-10 p-3 bg-white rounded-t-3xl shadow-inner">
        <Link to="/hello" className="flex flex-col items-center text-gray-500 no-underline">
          <FaHome />
          <span className="text-xs">Home</span>
        </Link>
        <Link to="/task" className="flex flex-col items-center text-green-600 no-underline">
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

export default TaskPage;
