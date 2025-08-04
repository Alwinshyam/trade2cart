import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPage = () => {
  const [vendors, setVendors] = useState([]);
  const [vendorDetails, setVendorDetails] = useState([]);
  const [users, setUsers] = useState([]);
  const [wasteEntries, setWasteEntries] = useState([]);
  const [products, setProducts] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [showDetails, setShowDetails] = useState({});
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', rate: '', unit: '', category: '', location: '' });
  const [editItemId, setEditItemId] = useState(null);
  const [productEditMap, setProductEditMap] = useState({});

  const api = {
    vendors: 'https://688bc5782a52cabb9f52cc6c.mockapi.io/api/v1/Vendor',
    vendorDetails: 'https://688bc5782a52cabb9f52cc6c.mockapi.io/api/v1/vendodetails',
    users: 'https://6879bd1aabb83744b7e9d65c.mockapi.io/api/v1/User',
    items: 'https://688ce883cd9d22dda5cee640.mockapi.io/api/v1/Data',
    waste: 'https://6879bd1aabb83744b7e9d65c.mockapi.io/api/v1/WasteEntries',
    products: 'https://688ce883cd9d22dda5cee640.mockapi.io/api/v1/Product'
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [vendorsRes, detailsRes, usersRes, wasteRes, productsRes, itemsRes] = await Promise.all([
          axios.get(api.vendors),
          axios.get(api.vendorDetails),
          axios.get(api.users),
          axios.get(api.waste),
          axios.get(api.products),
          axios.get(api.items)
        ]);
        setVendors(vendorsRes.data);
        setVendorDetails(detailsRes.data);
        setUsers(usersRes.data);
        setWasteEntries(wasteRes.data);
        setProducts(productsRes.data);
        setItems(itemsRes.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };
    fetchAllData();
  }, []);

  const verifyVendor = async (id, status) => {
    try {
      await axios.put(`${api.vendorDetails}/${id}`, { status });
      setVendorDetails(prev => prev.map(v => (v.id === id ? { ...v, status } : v)));
    } catch (error) {
      console.error('Verification failed', error);
    }
  };

  const toggleDetails = (id) => {
    setShowDetails(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAssignChange = (mobile, vendorId) => {
    setAssignments(prev => ({ ...prev, [mobile]: vendorId }));
  };

  const confirmGroupAssignment = async (mobile) => {
  const vendorId = assignments[mobile];
  if (!vendorId) {
    alert('Please select a vendor for this mobile number.');
    return;
  }

  const vendor = vendorDetails.find(v => v.id === vendorId);
  const entries = wasteEntries.filter(w => w.mobile === mobile && !assignedWasteIds.has(w.id));

  try {
    for (const entry of entries) {
      const productDesc = `${entry.category} (${entry.quantity} ${entry.unit})`;

      const payload = {
        mobile: entry.mobile,
        wasteEntryId: entry.id,
        vendorId: vendor.id,
        vendorName: vendor.name,
        vendorPhone: vendor.phone,
        products: productDesc,
        totalAmount: entry.total,
        assignedAt: new Date().toISOString(),
        status: 'assigned'
      };

      await axios.post(api.products, payload);
    }

    const updatedProducts = await axios.get(api.products);
    setProducts(updatedProducts.data);

    // 🆕 Update User Status to "On-Schedule" only if currently "Pending"
    const user = users.find(u => u.phone === mobile);
    if (user && user.Status === 'Pending') {
      await axios.put(`${api.users}/${user.id}`, { ...user, Status: 'On-Schedule' });
      // Update local state too
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, Status: 'On-Schedule' } : u));
    }

    // 🆕 Schedule Log (optional)
    const schedulePayload = {
      mobile,
      vendorName: vendor.name,
      vendorPhone: vendor.phone,
      scheduledAt: new Date().toISOString(),
      message: `Waste entries for ${mobile} scheduled with vendor ${vendor.name}`
    };
    const logRes = await axios.post(api.scheduleLogs, schedulePayload);
    setScheduledLogs(prev => [...prev, logRes.data]);

    alert(`All entries from ${mobile} assigned to ${vendor.name}`);
  } catch (error) {
    console.error('Group assignment failed:', error);
  }
};


  const handleProductUpdate = async (productId) => {
    const newVendorId = productEditMap[productId];
    const vendor = vendorDetails.find(v => v.id === newVendorId);
    const product = products.find(p => p.id === productId);

    if (!newVendorId || !vendor) {
      alert('Please select a valid vendor.');
      return;
    }

    try {
      await axios.put(`${api.products}/${productId}`, {
        ...product,
        vendorId: vendor.id,
        vendorName: vendor.name,
        vendorPhone: vendor.phone,
        updatedAt: new Date().toISOString()
      });
      const refreshed = await axios.get(api.products);
      setProducts(refreshed.data);
      alert('Vendor updated successfully.');
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const approvedVendors = vendorDetails.filter(v => v.status === 'approved');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateItem = async () => {
    try {
      const res = await axios.post(api.items, newItem);
      setItems(prev => [...prev, res.data]);
      setNewItem({ name: '', rate: '', unit: '', category: '', location: '' });
    } catch (error) {
      console.error('Item creation failed:', error);
    }
  };

  const handleEditItem = (item) => {
    setNewItem(item);
    setEditItemId(item.id);
  };

  const handleUpdateItem = async () => {
    try {
      await axios.put(`${api.items}/${editItemId}`, newItem);
      const updatedItems = await axios.get(api.items);
      setItems(updatedItems.data);
      setNewItem({ name: '', rate: '', unit: '', category: '', location: '' });
      setEditItemId(null);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Are you sure to delete this item?")) {
      try {
        await axios.delete(`${api.items}/${id}`);
        setItems(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const assignedWasteIds = new Set(products.map(p => p.wasteEntryId));
  const unassignedWasteEntries = wasteEntries.filter(w => !assignedWasteIds.has(w.id));

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>

      {/* Overview */}
      <section>
        <h2>Overview</h2>
        <p>Total Users: {users.length}</p>
        <p>Total Vendors: {vendors.length}</p>
        <p>Waste Entries: {wasteEntries.length}</p>
        <p>Products: {products.length}</p>
      </section>

      <hr />

      {/* Vendor Verification */}
      <section>
        <h2>Vendor Verification</h2>
        {vendorDetails.map(v => (
          <div key={v.id} style={{ border: '1px solid #ccc', marginBottom: 10, padding: 10 }}>
            <p><strong>{v.name}</strong> ({v.phone})</p>
            <p>Status: {v.status}</p>
            <button onClick={() => verifyVendor(v.id, 'approved')} style={{ marginRight: 10 }}>Approve</button>
            <button onClick={() => verifyVendor(v.id, 'rejected')}>Reject</button>
            <button onClick={() => toggleDetails(v.id)}>
              {showDetails[v.id] ? 'Hide Details' : 'Show Details'}
            </button>

            {showDetails[v.id] && (
              <div style={{ marginTop: 10 }}>
                <p><strong>Location:</strong> {v.location}</p>
                <p><strong>Aadhaar:</strong> {v.aadhaar}</p>
                <img src={v.aadhaarPhoto} alt="Aadhaar" style={{ width: 200 }} />
                <p><strong>PAN:</strong> {v.pan}</p>
                <img src={v.panPhoto} alt="PAN" style={{ width: 200 }} />
                <p><strong>License:</strong> {v.license}</p>
                <img src={v.licensePhoto} alt="License" style={{ width: 200 }} />
              </div>
            )}
          </div>
        ))}
      </section>

      <hr />

      {/* Assign Waste by Mobile */}
      <section>
        <h2>Assign Orders (Manual)</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={cellStyle}>#</th>
              <th style={cellStyle}>Mobile</th>
              <th style={cellStyle}>Entries Summary</th>
              <th style={cellStyle}>Vendor</th>
              <th style={cellStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(
              unassignedWasteEntries.reduce((acc, entry) => {
                if (!acc[entry.mobile]) acc[entry.mobile] = [];
                acc[entry.mobile].push(entry);
                return acc;
              }, {})
            ).map(([mobile, entries], index) => (
              <tr key={mobile}>
                <td style={cellStyle}>{index + 1}</td>
                <td style={cellStyle}>{mobile}</td>
                <td style={{ ...cellStyle, textAlign: 'left' }}>
                  <ul style={{ paddingLeft: 20 }}>
                    {entries.map((entry) => (
                      <li key={entry.id}>
                        {entry.category} - {entry.quantity} {entry.unit} (₹{entry.total})
                      </li>
                    ))}
                  </ul>
                </td>
                <td style={cellStyle}>
                  <select onChange={(e) => handleAssignChange(mobile, e.target.value)} value={assignments[mobile] || ''}>
                    <option value="">-- Select Vendor --</option>
                    {approvedVendors.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.location})
                      </option>
                    ))}
                  </select>
                </td>
                <td style={cellStyle}>
                  <button onClick={() => confirmGroupAssignment(mobile)}>Confirm</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <hr />

      {/* Product Management */}
      {/* Product Management */}
<section>
  <h2>Product Management</h2>
  {approvedVendors.map(vendor => {
    const vendorProducts = products.filter(p => p.vendorId === vendor.id);
    if (vendorProducts.length === 0) return null;

    // Group by user mobile number
    const groupedByMobile = vendorProducts.reduce((acc, p) => {
      const wasteEntry = wasteEntries.find(w => w.id === p.wasteEntryId);
      const mobile = wasteEntry ? wasteEntry.mobile : 'Unknown';
      if (!acc[mobile]) acc[mobile] = [];
      acc[mobile].push(p);
      return acc;
    }, {});

    return (
      <div key={vendor.id} style={{ marginBottom: 30, padding: 10, border: '1px solid #aaa' }}>
        <h3>{vendor.name} ({vendor.phone})</h3>
        {Object.entries(groupedByMobile).map(([mobile, mobileProducts]) => (
          <div key={mobile} style={{ marginBottom: 20, paddingLeft: 20 }}>
            <h4>User Mobile: {mobile}</h4>
            {mobileProducts.map(product => (
              <div key={product.id} style={{ borderBottom: '1px solid #ccc', padding: 10 }}>
                <p><strong>Product:</strong> {product.products}</p>
                <p><strong>Amount:</strong> ₹{product.totalAmount}</p>
                <p><strong>Status:</strong> {product.status}</p>
                <select
                  value={productEditMap[product.id] || ''}
                  onChange={e => setProductEditMap(prev => ({ ...prev, [product.id]: e.target.value }))}
                >
                  <option value="">-- Change Vendor --</option>
                  {approvedVendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
                <button onClick={() => handleProductUpdate(product.id)}>Update</button>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  })}
</section>

      <hr />

      {/* Item Management */}
      <section>
        <h2>Item Management (CRUD)</h2>
        <div>
          <input name="name" value={newItem.name} placeholder="Name" onChange={handleInputChange} />
          <input name="rate" value={newItem.rate} placeholder="Rate" onChange={handleInputChange} />
          <input name="unit" value={newItem.unit} placeholder="Unit" onChange={handleInputChange} />
          <input name="category" value={newItem.category} placeholder="Category" onChange={handleInputChange} />
          <input name="location" value={newItem.location} placeholder="Location" onChange={handleInputChange} />
          {editItemId ? (
            <button onClick={handleUpdateItem}>Update</button>
          ) : (
            <button onClick={handleCreateItem}>Add</button>
          )}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={cellStyle}>Name</th>
              <th style={cellStyle}>Rate</th>
              <th style={cellStyle}>Unit</th>
              <th style={cellStyle}>Category</th>
              <th style={cellStyle}>Location</th>
              <th style={cellStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td style={cellStyle}>{item.name}</td>
                <td style={cellStyle}>{item.rate}</td>
                <td style={cellStyle}>{item.unit}</td>
                <td style={cellStyle}>{item.category}</td>
                <td style={cellStyle}>{item.location}</td>
                <td style={cellStyle}>
                  <button onClick={() => handleEditItem(item)}>Edit</button>
                  <button onClick={() => handleDeleteItem(item.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

const cellStyle = {
  padding: '8px',
  border: '1px solid #ddd',
  textAlign: 'center'
};

export default AdminPage;
