// HelloUser.jsx
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
  const [customFormFields, setCustomFormFields] = useState([
    { text: "", quantity: 1, rate: 0, unit: "kg", total: 0 },
  ]);
  const [savedData, setSavedData] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);

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

  useEffect(() => {
    fetch("https://688ce883cd9d22dda5cee640.mockapi.io/api/v1/Data")
      .then((res) => res.json())
      .then((data) => setAvailableProducts(data))
      .catch((err) => console.error("Failed to fetch product list", err));
  }, []);

  const handleChange = (index, field, value) => {
    const updated = [...customFormFields];
    updated[index][field] = value;

    if (field === "quantity" || field === "rate") {
      const quantity = parseFloat(updated[index].quantity || 0);
      const rate = parseFloat(updated[index].rate || 0);
      updated[index].total = (quantity * rate).toFixed(2);
    }

    setCustomFormFields(updated);
  };

  const handleSave = () => {
    const entries = customFormFields
      .filter((entry) => entry.text.trim() && parseFloat(entry.quantity) > 0)
      .map((entry) => ({
        ...entry,
        image: null,
        mobile: userMobile || localStorage.getItem("userMobile") || "unknown",
      }));

    setSavedData([...savedData, ...entries]);
    setCustomFormFields([{ text: "", quantity: 1, rate: 0, unit: "kg", total: 0 }]);
    setShowForm(false);
    setShowCart(true);
  };

  const ProductCard = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
    const totalPrice = (parseFloat(product.rate || 0) * quantity).toFixed(2);

    const handleAdd = () => {
      const newEntry = {
        text: product.name,
        rate: product.rate,
        unit: product.unit,
        category: product.category,
        location: product.location,
        quantity,
        total: totalPrice,
        image: product.image || null,
        mobile: userMobile || localStorage.getItem("userMobile") || "unknown",
      };
      setSavedData((prev) => [...prev, newEntry]);
    };

    return (
      <div className="bg-white p-4 rounded shadow border">
        <h3 className="text-md font-bold mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-1">
          ₹{product.rate} per {product.unit}
        </p>
        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-32 object-cover rounded mb-2"
          />
        )}
        <div className="flex items-center justify-between text-sm mb-2">
          <input
            type="number"
            step="0.1"
            min="0.1"
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.max(0.1, parseFloat(e.target.value || 1)))
            }
            className="w-20 border rounded p-1 text-center"
          />
          <span className="text-sm">{product.unit}</span>
          <div className="font-semibold">₹{totalPrice}</div>
        </div>
        <button
          className="w-full bg-blue-500 text-white py-2 rounded"
          onClick={handleAdd}
        >
          ➕ Add
        </button>
      </div>
    );
  };

  const handleCheckout = () => {
    const encodeImage = (file) =>
      new Promise((resolve) => {
        if (!file) return resolve(null);
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

    Promise.all([encodeImage(image1), encodeImage(image2)]).then(
      ([base64Image1, base64Image2]) => {
        const name = localStorage.getItem("userName") || "Guest";
        const address = localStorage.getItem("userAddress") || "Not Provided";
        const mobile = userMobile || localStorage.getItem("userMobile") || "unknown";

        const enriched = savedData.map((entry) => ({
          ...entry,
          image1: base64Image1,
          image2: base64Image2,
          name,
          address,
          mobile,
        }));

        localStorage.setItem("checkoutData", JSON.stringify(enriched));
        localStorage.setItem("wasteEntries", JSON.stringify(enriched));
        setSavedData(enriched); // update state with enriched data

        navigate("/trade");
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f2f7f8] p-4 text-gray-800">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow">
          <FaMapMarkerAlt className="text-green-500" />
          <span className="text-sm font-medium">{location}</span>
        </div>
        <div className="flex items-center gap-3">
          <FaBell />
          <div className="relative cursor-pointer" onClick={() => setShowCart(true)}>
            <FaShoppingCart />
            {savedData.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                {savedData.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Product List */}
      {!showForm && !showCart && (
        <>
          <h2 className="text-lg font-semibold mb-4 text-center">
            Available Products in {location}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableProducts
              .filter((p) => p.location?.toLowerCase() === location.toLowerCase())
              .map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
          </div>
          <div className="text-center mt-6">
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700"
            >
              ➕ Add Custom Product
            </button>
          </div>
        </>
      )}

      {/* Custom Form */}
      {showForm && !showCart && (
        <div className="bg-white p-4 rounded shadow mt-4">
          <h2 className="text-lg font-semibold mb-4">Add Custom Waste Items</h2>
          {customFormFields.map((field, index) => (
            <div key={index} className="mb-4">
              <input
                type="text"
                placeholder="Enter description"
                value={field.text}
                onChange={(e) => handleChange(index, "text", e.target.value)}
                className="w-full mb-2 p-2 border rounded"
              />
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  placeholder="Quantity (kg)"
                  value={field.quantity}
                  onChange={(e) => handleChange(index, "quantity", e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Rate ₹/kg"
                  value={field.rate}
                  onChange={(e) => handleChange(index, "rate", e.target.value)}
                  className="flex-1 p-2 border rounded"
                />
              </div>
              <p className="text-sm text-gray-600">
                Total: ₹{field.total || 0} ({field.quantity} kg @ ₹{field.rate}/kg)
              </p>
            </div>
          ))}
          <div className="flex gap-3">
            <button
              onClick={() =>
                setCustomFormFields([
                  ...customFormFields,
                  { text: "", quantity: 1, rate: 0, unit: "kg", total: 0 },
                ])
              }
              className="flex-1 py-2 bg-blue-500 text-white rounded"
            >
              ➕ Add More
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 bg-green-500 text-white rounded"
            >
              ✅ Save
            </button>
          </div>
        </div>
      )}

      {/* Cart View */}
      {showCart && (
        <div className="bg-white p-4 rounded shadow mt-4">
          <h2 className="text-lg font-semibold mb-4">Your Waste Entries</h2>
          {savedData.length === 0 ? (
            <p className="text-gray-500">No entries saved yet.</p>
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
                <div className="text-sm text-gray-600">
                  Quantity: {entry.quantity || 1} {entry.unit} | Rate: ₹{entry.rate} / {entry.unit} | Total: ₹{entry.total}
                </div>
              </div>
            ))
          )}
          <div className="mt-4">
            <p className="font-medium mb-1">Upload Two Images for Entire Checkout (optional):</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage1(e.target.files[0])}
              className="w-full mb-2"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage2(e.target.files[0])}
              className="w-full mb-4"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowCart(false)}
              className="flex-1 py-2 bg-gray-300 text-black rounded"
            >
              🔙 Back
            </button>
            <button
              onClick={handleCheckout}
              className="flex-1 py-2 bg-green-600 text-white rounded"
            >
              🛒 Checkout
            </button>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="flex justify-around items-center mt-8 p-3 bg-white rounded-t-3xl shadow-inner">
        <button
          onClick={() => {
            setShowForm(false);
            setShowCart(false);
          }}
          className="flex flex-col items-center text-green-600"
        >
          <FaHome />
          <span className="text-xs">Home</span>
        </button>
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

export default HelloUser;
