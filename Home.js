import { useState, useEffect } from "react";
import { auth } from "../firebase-config";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/home.css";
import logo from "../assets/homam-logo.png";

const API_URL = "http://13.202.37.246:6001";

const Home = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editDetails, setEditDetails] = useState(false);
  const [userName, setUserName] = useState("Loading...");
  const [userAddress, setUserAddress] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [customLists, setCustomLists] = useState([]);
  const [editingListId, setEditingListId] = useState(null);
  const [editedListName, setEditedListName] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [newListName, setNewListName] = useState("");

  // 🆕 Delete Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [listToDelete, setListToDelete] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const username = currentUser?.username;
  const listKey = `customLists-${username}`;

  useEffect(() => {
    if (username) {
      axios.get(`${API_URL}/api/user/${username}`).then((res) => {
        setUserName(res.data.name || "Unknown");
        setUserAddress(res.data.address || "No Address");
        setUserPhone(res.data.phone || "No Phone");
      });

      axios.get(`${API_URL}/api/user-lists/${username}`).then((res) => {
        const lists = res.data.map((list) => ({
          id: list.list_id,
          name: list.list_name,
        }));
        setCustomLists(lists);
      });
      
    }
  }, [username, listKey]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("currentUser");
      navigate("/");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleSaveDetails = () => {
    axios
      .post(`${API_URL}/api/user/update`, {
        username,
        name: userName,
        address: userAddress,
        phone: userPhone,
      })
      .then(() => {
        setEditDetails(false);
        const updatedUser = { ...currentUser, name: userName, phone: userPhone };
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      });
  };

  const addNewList = () => {
    setShowAddModal(true);
  };

  const handleAddListSave = async () => {
    if (!newListName.trim()) return;
  
    try {
      const response = await axios.post(`${API_URL}/api/user-lists`, {
        username,
        listName: newListName,
      });
  
      const newList = {
        id: response.data.list_id, // backend should return this
        name: newListName,
      };
  
      const updatedLists = [...customLists, newList];
      setCustomLists(updatedLists);
      localStorage.setItem(listKey, JSON.stringify(updatedLists));
      setNewListName("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding list:", error);
    }
  };
  

  const handleSaveEditedList = async (id) => {
    try {
      await axios.put(`${API_URL}/api/user-lists/${id}`, {
        listName: editedListName,
      });
  
      const updatedLists = customLists.map((list) =>
        list.id === id ? { ...list, name: editedListName } : list
      );
      setCustomLists(updatedLists);
      localStorage.setItem(listKey, JSON.stringify(updatedLists));
      setEditingListId(null);
      setEditedListName("");
    } catch (error) {
      console.error("Error editing list:", error);
    }
  };
  

  // ✅ Delete modal open trigger
  const handleDeleteList = (id) => {
    setListToDelete(id);
    setShowDeleteModal(true);
  };

  // ✅ Confirm delete
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${API_URL}/api/user-lists/${listToDelete}`);
  
      const updatedLists = customLists.filter((list) => list.id !== listToDelete);
      setCustomLists(updatedLists);
      localStorage.setItem(listKey, JSON.stringify(updatedLists));
      setShowDeleteModal(false);
      setListToDelete(null);
    } catch (error) {
      console.error("Error deleting list:", error);
    }
  };
  

  // ✅ Cancel delete
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setListToDelete(null);
  };

  return (
    <div className="home-container">
      <div className="profile-icon" onClick={() => setSidebarOpen(true)}>👤</div>

      <div className={`sidebar-menu ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h3>Profile</h3>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>✖</button>
        </div>

        <button className="details-btn" onClick={() => setEditDetails(!editDetails)}>Edit Profile</button>

        {editDetails && (
          <div className="details-section">
            <input type="text" className="details-input" value={userName} onChange={(e) => setUserName(e.target.value)} />
            <input type="text" className="details-input" value={userAddress} onChange={(e) => setUserAddress(e.target.value)} />
            <input type="text" className="details-input" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} placeholder="Enter phone number" />
            <button className="save-btn" onClick={handleSaveDetails}>Save</button>
          </div>
        )}

        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)}></div>}

      <img src={logo} alt="Homam Logo" className="homam-logo" />
      <h2 className="welcome-text">Welcome</h2>
      <h3 className="username-text">{userName} 🎉</h3>

      <div className="list-container">
        <button className="list-btn" onClick={() => navigate("/list-page", { state: { userName, userAddress, userPhone } })}>
          கணபதி ஹோமம்
        </button>

        <button className="list-btn" onClick={() => navigate("/list-page-2", { state: { userName, userAddress, userPhone } })}>
          கணபதி ஹோமம் (with contract)
        </button>

        {customLists.map((list) => (
          <div key={list.id} className="list-item">
            {editingListId === list.id ? (
              <>
                <input
                  type="text"
                  value={editedListName}
                  onChange={(e) => setEditedListName(e.target.value)}
                  className="edit-list-input"
                />
                <button className="save-list-btn" onClick={() => handleSaveEditedList(list.id)}>Save</button>
              </>
            ) : (
              <>
                <button
                  className="list-btn"
                  onClick={() =>
                    navigate(`/dynamic-list/${list.id}`, {
                      state: {
                        listId: list.id,
                        listName: list.name,
                        userName,
                        userAddress,
                        userPhone,
                      },
                    })
                  }
                >
                  {list.name}
                </button>
                <button className="edit-btn" onClick={() => { setEditingListId(list.id); setEditedListName(list.name); }}>✏️</button>
                <button className="delete-btn" onClick={() => handleDeleteList(list.id)}>🗑️</button>
              </>
            )}
          </div>
        ))}

        <button className="add-list-btn" onClick={addNewList}>➕ Add New List</button>
      </div>

      {/* Add List Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Add New List</h3>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Enter list name"
              className="modal-input"
            />
            <div className="modal-buttons">
              <button className="modal-save" onClick={handleAddListSave}>Save</button>
              <button className="modal-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this list?</p>
            <div className="modal-buttons">
              <button className="modal-save" onClick={handleConfirmDelete}>Yes, Delete</button>
              <button className="modal-cancel" onClick={handleCancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
