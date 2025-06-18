import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/listPage.css";

const API_URL = "http://13.202.37.246:6001";
const quantityOptionsGram = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 750];
const quantityOptionsOther = Array.from({ length: 51 }, (_, i) => i);
const unitOptions = ["கிராம்", "கிலோ", "pcs", "பாக்கெட்", "box", "Bottle", "ரூபாய்", "லிட்டர்"];
const getQtyOptions = (unit, currentQty) => {
  const base = unit === "கிராம்" ? quantityOptionsGram : quantityOptionsOther;
  return base.includes(currentQty) ? base : [...base, currentQty].sort((a, b) => a - b);
};


const ListPage2 = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { userName, userAddress, userPhone, listId, listName } = state || {};
  const username = JSON.parse(localStorage.getItem("currentUser"))?.username || "guest";

  const [homeItems, setHomeItems] = useState([]);
  const [sections, setSections] = useState([]);
  const [popupSection, setPopupSection] = useState(null);
  const [newItem, setNewItem] = useState({ name: "", quantity: 0, unit: "pcs", section: "" });
  const [editingTitle, setEditingTitle] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [tamilDate, setTamilDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedMinute, setSelectedMinute] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("AM");

  useEffect(() => {
    if (listId) {
      axios.get(`${API_URL}/api/list-items/${listId}`)
        .then((res) => setHomeItems(res.data || []))
        .catch(err => console.error("Fetch error:", err));

      axios.get(`${API_URL}/api/list-sections/${listId}`)
        .then((res) => setSections(res.data || []))
        .catch(err => console.error("Section fetch error:", err));
    }
  }, [listId]);

  const convertToTamilDate = (dateStr) => {
    if (!dateStr) return "";
    const parseLocalDate = (str) => {
      const [year, month, day] = str.split("-").map(Number);
      return new Date(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00`);
    };

    const tamilMonths = [
      { name: "சித்திரை", startDay: 14, startMonth: 4 },
      { name: "வைகாசி", startDay: 15, startMonth: 5 },
      { name: "ஆனி", startDay: 15, startMonth: 6 },
      { name: "ஆடி", startDay: 17, startMonth: 7 },
      { name: "ஆவணி", startDay: 17, startMonth: 8 },
      { name: "புரட்டாசி", startDay: 17, startMonth: 9 },
      { name: "ஐப்பசி", startDay: 17, startMonth: 10 },
      { name: "கார்த்திகை", startDay: 16, startMonth: 11 },
      { name: "மார்கழி", startDay: 16, startMonth: 12 },
      { name: "தை", startDay: 14, startMonth: 1 },
      { name: "மாசி", startDay: 13, startMonth: 2 },
      { name: "பங்குனி", startDay: 14, startMonth: 3 },
    ];

    const inputDate = parseLocalDate(dateStr);
    const inputYear = inputDate.getFullYear();

    const allMonthStarts = tamilMonths.map((month) => {
      const adjustedYear = month.startMonth < 4 ? inputYear + 1 : inputYear;
      const startDate = new Date(`${adjustedYear}-${String(month.startMonth).padStart(2, "0")}-${String(month.startDay).padStart(2, "0")}T00:00:00`);
      return { ...month, startDate };
    });

    let matchedMonth = null;
    for (let i = allMonthStarts.length - 1; i >= 0; i--) {
      if (inputDate >= allMonthStarts[i].startDate) {
        matchedMonth = allMonthStarts[i];
        break;
      }
    }

    if (!matchedMonth) return "";

    const dayDiff = Math.floor((inputDate - matchedMonth.startDate) / (1000 * 60 * 60 * 24)) + 1;
    return `${matchedMonth.name} ${dayDiff}`;
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setTamilDate(convertToTamilDate(date));
  };

  const handleQtyChange = async (id, qty) => {
    const updated = homeItems.map(item => item.id === id ? { ...item, quantity: qty } : item);
    setHomeItems(updated);
    try {
      await axios.put(`${API_URL}/api/list-items/${id}`, { quantity: qty });
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const handleUnitChange = async (id, unit) => {
    const updated = homeItems.map(item => item.id === id ? { ...item, unit } : item);
    setHomeItems(updated);
    try {
      await axios.put(`${API_URL}/api/list-items/${id}`, { unit });
    } catch (err) {
      console.error("Error updating unit:", err);
    }
  };

  const handleAdd = async () => {
    const trimmedName = newItem.name.trim();
    if (!trimmedName) return alert("Enter item name");

    const normalize = (str) => str.toLowerCase().replace(/\s+/g, "").trim();
    const alreadyExists = homeItems.some(item =>
      normalize(item.name) === normalize(trimmedName) && item.section === newItem.section
    );
    if (alreadyExists) return alert("Item already exists");

    try {
      const response = await axios.post(`${API_URL}/api/list-items`, {
        listId,
        name: trimmedName,
        quantity: newItem.quantity,
        unit: newItem.unit,
        section: newItem.section,
      });

      const addedItem = response.data;
      setHomeItems([...homeItems, addedItem]);
      setPopupSection(null);
      setNewItem({ name: "", quantity: 0, unit: "pcs", section: "" });
    } catch (err) {
      console.error("Error adding item:", err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    const trimmedName = editingItem.name.trim();
    if (!trimmedName) return alert("Item name cannot be empty");

    try {
      await axios.put(`${API_URL}/api/list-items/${editingItem.id}`, {
        name: trimmedName,
        quantity: editingItem.quantity,
        unit: editingItem.unit,
        section: editingItem.section
      });

      const updatedItems = homeItems.map(item =>
        item.id === editingItem.id ? { ...item, ...editingItem, name: trimmedName } : item
      );
      setHomeItems(updatedItems);
      setEditingItem(null);
    } catch (err) {
      console.error("Error updating item:", err);
    }
  };

  const saveTitle = async (sectionId) => {
    const section = sections.find(sec => sec.id === sectionId);
    if (!section) return;

    const oldTitle = homeItems.find(item => item.section === section.title)?.section;

    try {
      await axios.put(`${API_URL}/api/list-sections/${sectionId}`, { title: section.title });

      if (oldTitle) {
        await axios.put(`${API_URL}/api/list-items/section-update`, {
          oldSection: oldTitle,
          newSection: section.title,
          listId
        });
      }

      const refreshedItems = await axios.get(`${API_URL}/api/list-items/${listId}`);
      setHomeItems(refreshedItems.data || []);
      setEditingTitle(null);
    } catch (err) {
      console.error("Error saving section title:", err);
    }
  };

  const handleShare = () => {
  const unitMap = {
  g: "கிராம்",
  kg: "கிலோ",
  pcs: "pcs",
  box: "box",
  Bottle: "Bottle",
  ரூபாய்: "ரூபாய்",
  பாக்கெட்: "பாக்கெட்",
  லிட்டர்: "லிட்டர்",
  கிராம்: "கிராம்",
  கிலோ: "கிலோ"
};
const formatForWhatsAppBold = (text) => {
  if (!text) return "";
  const cleaned = text.replace(/\*/g, "").trim(); // remove asterisks and trim
  return `*${cleaned}*`;
};

    const separator = "*🌻🔯🕉🌸🕉🔯🌻🌻🔯🕉🌸*";
    let msg = `\n${separator}`;
    msg += `\n*சிவமயம்*\n*ஸ்ரீ கற்பக விநாயகர் துணை*`;
    
    // Add date/time only if valid
    if (selectedDate) {
      const [yyyy, mm, dd] = selectedDate.split("-");
      const formattedDate = `${dd}-${mm}-${yyyy}`;
      msg += `\n📅சுப நாள் ${formattedDate}`;
    }
    
    
    if (selectedDate && tamilDate) {
    msg += `\n📅 தமிழ் தேதி: ${tamilDate}`;
     }
     if (selectedHour && selectedMinute) {
      const formattedTime = `${selectedHour}:${selectedMinute} ${selectedPeriod}`;
      msg += `\n🕒 நேரம்: ${formattedTime}`;
     }
    
     msg += `\n\n${formatForWhatsAppBold(userName)}\n${formatForWhatsAppBold(userAddress)}\n${formatForWhatsAppBold(userPhone)}`;

    
     sections.forEach(({ title }) => {
      const filteredItems = homeItems.filter(item => item.section === title && item.quantity > 0);
      if (filteredItems.length > 0) {
       msg += `\n\n*${title}*\n`;
       filteredItems.forEach((item, index) => {
        const unitLabel = unitMap[item.unit] || item.unit;
msg += `${index + 1}. ${item.name} - ${item.quantity} ${unitLabel}\n`;

       });
      }
     });
    
     msg += `\n*🌻🔯🕉சுபம்🔯🕉🌸*`;
    
     window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
    };
    

  const renderSection = (section) => {
    const { id, title } = section;

    return (
      <div key={id}>
        <div className="section-title-editable">
          {editingTitle === id ? (
            <>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  const updated = sections.map(sec =>
                    sec.id === id ? { ...sec, title: e.target.value } : sec
                  );
                  setSections(updated);
                }}
                className="title-edit-input"
              />
              <button onClick={() => saveTitle(id)}>✅</button>
            </>
          ) : (
            <>
              <h3 className="section-title">{title}</h3>
              <button onClick={() => setEditingTitle(id)} className="edit-btn">✏️</button>
            </>
          )}
        </div>

        <ul className="item-list">
          {homeItems.filter(item => item.section === title).map((item, index) => (
            <li
              key={item.id}
              className={`item ${item.quantity > 0 ? "active" : "inactive"}`}
              onClick={() => setEditingItem({ ...item })}
            >
              <span className="item-number">{index + 1}.</span>
              <span className="item-name">{item.name}</span>
              <select
                value={item.quantity}
                onChange={(e) => handleQtyChange(item.id, parseInt(e.target.value))}
                className="quantity-dropdown"
              >
                {(item.unit === "கிராம்" ? quantityOptionsGram : quantityOptionsOther).map(qty => (
                  <option key={qty} value={qty}>{qty}</option>
                ))}
              </select>
              <select
                value={item.unit}
                onChange={(e) => handleUnitChange(item.id, e.target.value)}
                className="unit-select"
              >
                {unitOptions.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </li>
          ))}
        </ul>

        <button className="add-item-btn" onClick={() => {
          setPopupSection(title);
          setNewItem({ name: "", quantity: 0, unit: "pcs", section: title });
        }}>
          ➕ Add to {title}
        </button>
      </div>
    );
  };

  return (
    <div className="list-page-container">
      <button className="home-button" onClick={() => navigate("/")}>← Home</button>
      <h2>{listName || "கணபதி ஹோமம் (with contract)"}</h2>

      <div className="user-details">
        <h1>{userName}</h1>
        <p>{userAddress}</p>
        <p>{userPhone}</p>
      </div>

      <div className="scrollable-container">
        {sections.map(renderSection)}

        <div className="share-section">
        <label>
        சுப நாள்:
  <input type="date" value={selectedDate} onChange={handleDateChange} />
  {selectedDate && (
    <p style={{ marginTop: "4px", fontSize: "25px", color: "#555" }}>
      தேர்ந்தெடுத்த தேதி: {selectedDate.split("-").reverse().join("-")}
    </p>
  )}
</label>

          <label>
          தமிழ் தேதி:
            <input type="text" value={tamilDate} readOnly />
          </label>
          <label>
          நேரம்:
            <div className="time-selectors">
              <select value={selectedHour} onChange={(e) => setSelectedHour(e.target.value)}>
                <option value="">HH</option>
                {[...Array(12)].map((_, i) => {
                  const hour = String(i + 1).padStart(2, "0");
                  return <option key={hour} value={hour}>{hour}</option>;
                })}
              </select>
              :
              <select value={selectedMinute} onChange={(e) => setSelectedMinute(e.target.value)}>
                <option value="">MM</option>
                {[...Array(60)].map((_, i) => {
                  const min = String(i).padStart(2, "0");
                  return <option key={min} value={min}>{min}</option>;
                })}
              </select>
              <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </label>
          <button className="share-btn" onClick={handleShare}>📤 Share List</button>
        </div>
      </div>

      {/* Add Item Popup */}
      {popupSection && (
        <div className="popup">
          <div className="popup-content">
            <h3>Add New Item to <em>{popupSection}</em></h3>
            <input
              type="text"
              placeholder="Item Name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <select
  value={newItem.quantity}
  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) })}
>
  {getQtyOptions(newItem.unit, newItem.quantity).map(qty => (
    <option key={qty} value={qty}>{qty}</option>
  ))}
</select>

            <select
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            >
              {unitOptions.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            <div className="popup-actions">
              <button onClick={handleAdd}>Add</button>
              <button onClick={() => setPopupSection(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Popup */}
      {editingItem && (
        <div className="popup">
          <div className="popup-content">
            <h3>Edit Item</h3>
            <input
              type="text"
              value={editingItem.name}
              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
            />
            <select
  value={editingItem.quantity}
  onChange={(e) => setEditingItem({ ...editingItem, quantity: parseInt(e.target.value) })}
>
  {getQtyOptions(editingItem.unit, editingItem.quantity).map(qty => (
    <option key={qty} value={qty}>{qty}</option>
  ))}
</select>

            <select
              value={editingItem.unit}
              onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
            >
              {unitOptions.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            <div className="popup-actions">
              <button onClick={handleSaveEdit}>Save</button>
              <button onClick={() => setEditingItem(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPage2;
