import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/admin.css";

const API_URL = "http://13.202.37.246:6001"; // matches your backend SERVER_IP

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    name: "",
    address: "",
    phone: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users`);
      setUsers(res.data);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.name || !newUser.address || !newUser.phone) {
      alert("All fields are required!");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/add-user`, newUser);
      alert(res.data.message);
      setNewUser({ username: "", password: "", name: "", address: "", phone: "" });
      fetchUsers();
    } catch (error) {
      alert("Failed to add user: " + (error.response?.data?.error || error.message));
    }
  };

  const handleBlockUser = async (username) => {
    try {
      await axios.post(`${API_URL}/api/block-user`, { username });
      alert(`User ${username} has been blocked and logged out.`);
      fetchUsers();
    } catch (error) {
      console.error("❌ Error blocking user:", error);
    }
  };

  const handleTogglePayment = async (username, currentStatus) => {
  try {
    const newStatus = currentStatus === "Yes" ? "No" : "Yes";
    await axios.post(`${API_URL}/api/update-payment`, { username, payment_status: newStatus });
    fetchUsers();
  } catch (err) {
    console.error("❌ Error updating payment status:", err);
  }
};


  const handleUnblockUser = async (username) => {
    try {
      await axios.post(`${API_URL}/api/unblock-user`, { username });
      alert(`User ${username} has been unblocked.`);
      fetchUsers();
    } catch (error) {
      console.error("❌ Error unblocking user:", error);
    }
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Are you sure you want to delete ${username}?`)) return;

    try {
      await axios.post(`${API_URL}/api/delete-user`, { username });
      alert(`User ${username} has been deleted.`);
      fetchUsers();
    } catch (error) {
      console.error("❌ Error deleting user:", error);
    }
  };
  const formatDate = (isoString) => {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};


  // ✅ Fix Logout Issue: Remove session from DB
  const handleLogout = async () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
      navigate("/");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/logout`, { username: currentUser.username });
      localStorage.removeItem("currentUser");
      navigate("/");
    } catch (error) {
      console.error("❌ Error logging out:", error);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Panel</h2>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="add-user-form">
        <input type="text" placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
        <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
        <input type="text" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
        <input type="text" placeholder="Address" value={newUser.address} onChange={(e) => setNewUser({ ...newUser, address: e.target.value })} />
        <input type="text" placeholder="Phone Number" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
        <button onClick={handleAddUser} className="add-btn">Add User</button>
      </div>

      <table>
        <thead>
          <tr>
  <th>User ID</th>
  <th>Username</th>
  <th>Name</th>
  <th>Address</th>
  <th>Phone</th>
  <th>Password</th>
  <th>Devices Logged In</th>
  <th>Location</th>
  <th>Status</th>
  <th>Blocked Reason</th>
  <th>Date of Joining</th>
  <th>Payment Status</th>
  <th>Actions</th>
</tr>

        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="11">No users found.</td>
            </tr>
          ) : (
            users.map(user => (
 <tr key={user.userid}>
  <td>{user.userid}</td>
  <td>{user.username}</td>
  <td>{user.name}</td>
  <td>{user.address}</td>
  <td>{user.phone || "N/A"}</td>
  <td>{user.plain_password || "N/A"}</td>
  <td>{user.devices_logged_in || 0}</td>
  <td>{user.location || "Unknown"}</td>
  <td>{user.status}</td>
  <td>{user.blocked_reason || "N/A"}</td>
  <td>{user.date_of_joining ? formatDate(user.date_of_joining) : "N/A"}</td>

  <td>
  <span className={`payment-status ${user.payment_status === "Yes" ? "yes" : "no"}`}>
    {user.payment_status || "N/A"}
  </span>
  <button 
    onClick={() => handleTogglePayment(user.username, user.payment_status)} 
    className="payment-btn"
  >
    Mark as {user.payment_status === "Yes" ? "No" : "Yes"}
  </button>
</td>

    <td>
      {user.blocked ? (
        <button 
          onClick={() => handleUnblockUser(user.username)} 
          className="unblock-btn"
        >
          Unblock
        </button>
      ) : (
        <button 
          onClick={() => handleBlockUser(user.username)} 
          className="block-btn"
        >
          Block
        </button>
      )}
      <button 
        onClick={() => handleDeleteUser(user.username)} 
        className="delete-btn"
      >
        Delete
      </button>
    </td>
  </tr>
))

          )}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
