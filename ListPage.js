import { useState, useEffect } from "react";
//import axios from "axios";
import "../styles/listPage.css";
import { useNavigate, useLocation } from "react-router-dom";


//const API_URL = "http://192.168.29.66:5000";

// Main List (38 items)
const defaultMainList = [
  { id: 1, name: "மஞ்சள் பொடி", quantity: 200, unit: "கிராம்" },
  { id: 2, name: "வரளி மஞ்சள்", quantity: 50, unit: "கிராம்" },
  { id: 3, name: "பச்சரிசி", quantity: 4, unit: "கிலோ" },
  { id: 4, name: "உளுந்து ( வெள்ளை)", quantity: 2, unit: "கிலோ" },
  { id: 5, name: "நெல்", quantity: 1, unit: "கிலோ" },
  { id: 6, name: "தேங்காய்", quantity: 16, unit: "pcs" },
  { id: 7, name: "விபூதி", quantity: 1, unit: "பாக்கெட்" },
  { id: 8, name: "சந்தனம்", quantity: 1, unit: "box" },
  { id: 9, name: "குங்குமம்", quantity: 1, unit: "பாக்கெட்" },
  { id: 10, name: "ஊதுபத்தி", quantity: 2, unit: "பாக்கெட்" },
  { id: 11, name: "சூடன்", quantity: 100, unit: "கிராம்" },
  { id: 12, name: "வெற்றிலை", quantity: 250, unit: "கிராம்" },
  { id: 13, name: "பாக்கு", quantity: 50, unit: "கிராம்" },
  { id: 14, name: "வாழைப்பழம்", quantity: 30, unit: "pcs" },
  { id: 15, name: "ஆப்பிள்", quantity: 3, unit: "pcs" },
  { id: 16, name: "ஆரஞ்சு", quantity: 3, unit: "pcs" },
  { id: 17, name: "திராட்சை", quantity: 250, unit: "கிராம்" },
  { id: 18, name: "கொய்யா", quantity: 3, unit: "pcs" },
  { id: 19, name: "மாதுளை", quantity: 3, unit: "pcs" },
  { id: 20, name: "மாம்பழம்", quantity: 1, unit: "pcs" },
  { id: 21, name: "அவல்", quantity: 750, unit: "கிராம்" },
  { id: 22, name: "பொரிகடலை", quantity: 200, unit: "கிராம்" },
  { id: 23, name: "பேரிச்சம்பழம்", quantity: 1, unit: "பாக்கெட்" },
  { id: 24, name: "கற்கண்டு", quantity: 200, unit: "கிராம்" },
  { id: 25, name: "நாட்டு சக்கரை", quantity: 200, unit: "கிராம்" },
  { id: 26, name: "தேன்", quantity: 100, unit: "கிராம்" },
  { id: 27, name: "முந்திரி பருப்பு", quantity: 100, unit: "கிராம்" },
  { id: 28, name: "கிஸ்மிஸ்", quantity: 100, unit: "கிராம்" },
  { id: 29, name: "ஏலக்காய்", quantity: 10, unit: "ரூபாய்" },
  { id: 30, name: "பச்சைக் கற்பூரம்", quantity: 10, unit: "ரூபாய்" },
  { id: 31, name: "நெய்", quantity: 750, unit: "கிராம்" },
  { id: 32, name: "நெல் பொரி", quantity: 1, unit: "லிட்டர்" },
  { id: 33, name: "சமித்து பெட்டி", quantity: 2, unit: "பாக்கெட்" },
  { id: 34, name: "ஹோம சாமான் பாக்கெட்", quantity: 1, unit: "பாக்கெட்" },
  { id: 35, name: "10-ம் நம்பர்  நூல்கண்டு", quantity: 1, unit: "box" },
  { id: 36, name: "ரோஸ் எசன்ஸ்", quantity: 1, unit: "Bottle" },
  { id: 37, name: "எலுமிச்சம்பழம்", quantity: 5, unit: "pcs" },
  { id: 38, name: "வெட்டிவேர், விளாமிச்சை வேர்", quantity: 10, unit: "ரூபாய்" },
  { id: 39, name: "கோதுமை", quantity: 100, unit: "கிராம்" },
  { id: 40, name: "துவரை", quantity: 100, unit: "கிராம்" },
  { id: 41, name: "தட்டாம் பயிறு", quantity: 100, unit: "கிராம்" },
  { id: 42, name: "பாசிப்பயறு", quantity: 100, unit: "கிராம்" },
  { id: 43, name: "கொண்டைக்கடலை", quantity: 100, unit: "கிராம்" },
  { id: 44, name: "வெள்ளை மொச்சை", quantity: 100, unit: "கிராம்" },
  { id: 45, name: "எள்", quantity: 100, unit: "கிராம்" },
  { id: 46, name: "உளுந்து ", quantity: 100, unit: "கிராம்" },
  { id: 47, name: "காணம்", quantity: 100, unit: "கிராம்" },
  { id: 48, name: "திரிநூல்", quantity: 20, unit: "ரூபாய்" },
  { id: 49, name: "கலர் கோலப்பொடி", quantity: 1, unit: "பாக்கெட்" },
  { id: 50, name: "நல்லெண்ணெய்", quantity: 1, unit: "little" },
  { id: 51, name: "வெள்ளைக் கோலப்பொடி", quantity: 1, unit: "பாக்கெட்" },
  { id: 52, name: "சீந்தில் கொடி", quantity: 250, unit: "கிராம்" },
  { id: 53, name: "வெண்கடுகு", quantity: 250, unit: "கிராம்" },
  { id: 54, name: "தொன்னை", quantity: 100, unit: "pcs" },
  { id: 55, name: "நவக்கிரக கிண்ணம்", quantity: 12, unit: "pcs" },
  { id: 56, name: "கொப்பரை தேங்காய்", quantity: 1, unit: "pcs" },
  { id: 57, name: "தர்ப்பை  கட்டு", quantity: 5, unit: "pcs" },

];

// More sections
const defaultVasthiram = [
{ id: 101, name: "(9*5)வேஷ்டி செட்", quantity: 2, unit: "pcs" },
{ id: 102, name: "கதர் சால்வை", quantity: 2, unit: "pcs" },
{ id: 103, name: "சீசன் துண்டு", quantity: 5, unit: "pcs" },
{ id: 104, name: "பூர்ணா ஹுதி பட்டு", quantity: 1, unit: "pcs" },
{ id: 105, name: "நவக்கிரக வஸ்திரம்", quantity: 9, unit: "pcs" },
{ id: 106, name: "பசுமாடு வேஷ்டி", quantity: 1, unit: "pcs" },
{ id: 107, name: "துண்டு", quantity: 1, unit: "pcs" },
];


const defaultPushpam = [
{ id: 201, name: "அருகம்புல் மாலை+உதிரி ", quantity: 1, unit: "pcs" },
{ id: 202, name: "கட்டி மாலை", quantity: 2, unit: "pcs" },
{ id: 203, name: "லேடீஸ் ஆரம்", quantity: 15, unit: "pcs" },
{ id: 204, name: "சரபந்து", quantity: 2, unit: "pcs" },
{ id: 205, name: "உதிரிப்பூ", quantity: 2, unit: "கிலோ" },
{ id: 206, name: "நிலைமாலை", quantity: 2, unit: "pcs" },
{ id: 207, name: "மல்லிகைப்பூ 2000", quantity: 1, unit: "pcs" },
{ id: 208, name: "தாமரைப்பூ", quantity: 1, unit: "pcs" },
{ id: 209, name: "பிச்சிப்பூ", quantity: 1, unit: "pcs" },
{ id: 210, name: "சுவாமி படங்களுக்கு தனி மாலை", quantity: 1, unit: "pcs" },
];


// Home checklist
const defaultHomeItems = [
{ id: 301, name: "சுவாமி படம்", quantity: 1, unit: "pcs" },
{ id: 302, name: "குத்துவிளக்கு", quantity: 2, unit: "pcs" },
{ id: 303, name: "வாழை இலை", quantity: 10, unit: "pcs" },
{ id: 304, name: "மாவிலை", quantity: 10, unit: "pcs" },
{ id: 305, name: "பால் தயிர்", quantity: 250, unit: "கிராம்" },
{ id: 306, name: "பசு சாணம், பசு நீர்", quantity: 100, unit: "கிராம்" },
{ id: 317, name: "சில்லரை நாணயங்கள்", quantity: 50, unit: "pcs" },
{ id: 318, name: "நிறை நாழி", quantity: 1, unit: "pcs" },
{ id: 319, name: "கிண்ணங்கள்", quantity: 5, unit: "pcs" },
{ id: 310, name: "தாம்பாளம்", quantity: 6, unit: "pcs" },
{ id: 311, name: "செங்கல்", quantity: 20, unit: "pcs" },
{ id: 312, name: "மணல் மூட்டை", quantity: 1, unit: "pcs" },
{ id: 313, name: "உமி", quantity: 500, unit: "கிராம்" },  
{ id: 314, name: "விறகு துண்டுகள்", quantity: 20, unit: "pcs" },  
{ id: 315, name: "கத்திரிக்கோல்", quantity: 1, unit: "pcs" },
{ id: 316, name: "அரிவாள்", quantity: 1, unit: "pcs" },
{ id: 317, name: "தீப்பெட்டி", quantity: 1, unit: "pcs" },
];


const ListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userName, userAddress, userPhone } = location.state || {};

  const [mainList, setMainList] = useState([]);
  const [vasthiram, setVasthiram] = useState([]);
  const [pushpam, setPushpam] = useState([]);
  const [homeItems, setHomeItems] = useState([]);

  const [popupSection, setPopupSection] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [tamilDate, setTamilDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [selectedMinute, setSelectedMinute] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("AM");
  const [newItem, setNewItem] = useState({ name: "", quantity: 0, unit: "pcs" });

  // ✅ Prevent back navigation from exiting the app
  useEffect(() => {
    console.log("ListPage2 component updated - force rebuild");
    window.history.pushState(null, "", window.location.pathname); // Push current page state

    const handleBackButton = () => {
      navigate("/home"); // Force back to home
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate]);

  // ✅ Load Data from Local Storage
  useEffect(() => {
    const storedMain = JSON.parse(localStorage.getItem("mainList"));
    const storedVasthiram = JSON.parse(localStorage.getItem("vasthiram"));
    const storedPushpam = JSON.parse(localStorage.getItem("pushpam"));
    const storedHome = JSON.parse(localStorage.getItem("homeItems"));

    setMainList(storedMain || defaultMainList);
    setVasthiram(storedVasthiram || defaultVasthiram);
    setPushpam(storedPushpam || defaultPushpam);
    setHomeItems(storedHome || defaultHomeItems);
  }, [])
  

  const quantityOptionsGram = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 750];
  const quantityOptionsOther = Array.from({ length: 51 }, (_, i) => i);

  const handleQtyChange = (section, id, qty) => {
    const update = (list, setter, key) => {
      const updated = list.map(item => item.id === id ? { ...item, quantity: qty } : item);
      setter(updated);
      localStorage.setItem(key, JSON.stringify(updated)); // Save to localStorage
    };
  
    if (section === "main") update(mainList, setMainList, "mainList");
    if (section === "vasthiram") update(vasthiram, setVasthiram, "vasthiram");
    if (section === "pushpam") update(pushpam, setPushpam, "pushpam");
    if (section === "home") update(homeItems, setHomeItems, "homeItems");
  };
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
      return {
       ...month,
       startDate: new Date(`${adjustedYear}-${String(month.startMonth).padStart(2, "0")}-${String(month.startDay).padStart(2, "0")}T00:00:00`)
      };
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
    
  

  const handleAdd = () => {
    if (newItem.name.trim() === "") return alert("Enter item name");
    const entry = { id: Date.now(), ...newItem };
    if (popupSection === "main") setMainList([...mainList, entry]);
    if (popupSection === "vasthiram") setVasthiram([...vasthiram, entry]);
    if (popupSection === "pushpam") setPushpam([...pushpam, entry]);
    if (popupSection === "home") setHomeItems([...homeItems, entry]);
    setPopupSection(null);
    setNewItem({ name: "", quantity: 0, unit: "pcs" });
  };


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

  const handleDateChange = (e) => {
     const date = e.target.value;
     setSelectedDate(date);
     setTamilDate(convertToTamilDate(date));
    };
    
  const handleShare = () => {
    const formatForWhatsAppBold = (text) => {
  if (!text) return "";
  const cleaned = text.replace(/\*/g, "").trim(); // remove asterisks and trim
  return `*${cleaned}*`;
};
    const center = (text) => {
      const totalLength = 30;
      const padding = Math.max(0, Math.floor((totalLength - text.length) / 2));
      return " ".repeat(padding) + text;
    };
  
    const separator = "*🌻🔯🕉🌸🕉🔯🌻🌻🔯🕉🌸*"; // Full-width bold separator
    let msg = `\n🌻🔯🕉🌸🕉🔯🌻🌻🔯🕉🌸`;
       msg += `\n*சிவமயம்*`;
    msg += `\n*ஸ்ரீ கற்பக விநாயகர் துணை*`;

    if (selectedDate) {
      const [yyyy, mm, dd] = selectedDate.split("-");
      const formattedDate = `${dd}-${mm}-${yyyy}`;
      msg += `\n📅சுப நாள் ${formattedDate}`;
    }
  if (selectedDate && tamilDate) msg += `\n📅 தமிழ் தேதி: ${tamilDate}`;
  if (selectedHour && selectedMinute) {
    msg += `\n🕒 நேரம்: ${selectedHour}:${selectedMinute} ${selectedPeriod}`;
  }
    

    msg += `\n\n${formatForWhatsAppBold(userName)}\n${formatForWhatsAppBold(userAddress)}\n${formatForWhatsAppBold(userPhone)}`;
  
    msg += `\n*🌿 பூஜை மற்றும் ஹோம சாமான்கள் 🌿*\n`;
    let count = 1;
    mainList.forEach((item) => {
      if (item.quantity > 0) {
        const unitLabel = unitMap[item.unit] || item.unit;
msg += `${count++}. ${item.name} - ${item.quantity} ${unitLabel}\n`;

      }
    });
    msg += `${separator}\n`; // Full-width separator after Pooja Saman
  
    msg += `\n*👕 வஸ்திரம் 👕*\n`;
    count = 1;
    vasthiram.forEach((item) => {
      if (item.quantity > 0) {
        const unitLabel = unitMap[item.unit] || item.unit;
msg += `${count++}. ${item.name} - ${item.quantity} ${unitLabel}\n`;

      }
    });
    msg += `${separator}\n`; // Full-width separator after Vasthiram
  
    msg += `\n*🌸 புஷ்பம் 🌸*\n`;
    count = 1;
    pushpam.forEach((item) => {
      if (item.quantity > 0) {
        const unitLabel = unitMap[item.unit] || item.unit;
msg += `${count++}. ${item.name} - ${item.quantity} ${unitLabel}\n`;

      }
    });
    msg += `${separator}\n`; // Full-width separator after Pushpam
  
    msg += `\n*🏠 வீட்டில் எடுத்து வைக்க வேண்டிய பொருட்கள் 🏠*\n`;
    count = 1;
    homeItems.forEach((item) => {
      if (item.quantity > 0) {
        const unitLabel = unitMap[item.unit] || item.unit;
msg += `${count++}. ${item.name} - ${item.quantity} ${unitLabel}\n`;

      }
    });
    msg += `\n*🌻🔯🕉சுபம்🔯🕉🌸*`;
  
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };
  
  
  
  
  
  
  
  return (
    <div className="list-page-container">
    {/* Home Button */}
    <button className="home-button" onClick={() => navigate("/")}>← Home</button>
    <h2>கணபதி ஹோமம்</h2>
  
      <div>
      <h1>{userName || "No Name"}</h1>
      <p>{userAddress || "No Address"}</p>
      <p>{userPhone || "No Phone"}</p>
      <h2>பூஜை மற்றும் ஹோம சாமான்கள்</h2>

    </div>
      <div className="scrollable-container">
        {/* MAIN LIST */}
        <ul className="item-list">
  {mainList.map((item, index) => (
    <li key={item.id} className={`item ${item.quantity > 0 ? "active" : "inactive"}`}>
      <span className="item-number">{index + 1}.</span>
      <span className="item-name">{item.name}</span>

      <select
        value={item.quantity}
        onChange={(e) => handleQtyChange("main", item.id, parseInt(e.target.value))}
        className="quantity-dropdown"
      >
        {(item.unit === "கிராம்" ? quantityOptionsGram : quantityOptionsOther).map(qty => (
          <option key={qty} value={qty}>{qty}</option>
        ))}
      </select>

      <select
  value={item.unit}
  onChange={(e) => {
    const updated = mainList.map(i => i.id === item.id ? { ...i, unit: e.target.value } : i);
    setMainList(updated);
    localStorage.setItem("mainList", JSON.stringify(updated));
  }}
  className="unit-select"
>
  <option value="கிராம்">கிராம்</option>
  <option value="கிலோ">கிலோ</option>
  <option value="pcs">pcs</option>
  <option value="பாக்கெட்">பாக்கெட்</option>
  <option value="box">box</option>
  <option value="Bottle">Bottle</option>
  <option value="ரூபாய்">ரூபாய்</option>
  <option value="லிட்டர்">லிட்டர்</option>
</select>

    </li>
  ))}
</ul>

        <button className="add-item-btn" onClick={() => setPopupSection("main")}>➕ Add to பூஜை மற்றும் ஹோம சாமான்கள்</button>
  
        {/* VASTHIRAM */}
        <h3 className="section-title">👕 வஸ்திரம்</h3>
        <ul className="item-list">
  {vasthiram.map((item, index) => (
    <li key={item.id} className={`item ${item.quantity > 0 ? "active" : "inactive"}`}>
      <span className="item-number">{index + 1}.</span>
      <span className="item-name">{item.name}</span>

      <select
        value={item.quantity}
        onChange={(e) => handleQtyChange("vasthiram", item.id, parseInt(e.target.value))}
        className="quantity-dropdown"
      >
        {(item.unit === "கிராம்" ? quantityOptionsGram : quantityOptionsOther).map(qty => (
          <option key={qty} value={qty}>{qty}</option>
        ))}
      </select>

      <select
  value={item.unit}
  onChange={(e) => {
    const updated = vasthiram.map(i => i.id === item.id ? { ...i, unit: e.target.value } : i);
    setVasthiram(updated);
    localStorage.setItem("vasthiram", JSON.stringify(updated));
  }}
  className="unit-select"
>
  <option value="கிராம்">கிராம்</option>
  <option value="கிலோ">கிலோ</option>
  <option value="pcs">pcs</option>
  <option value="பாக்கெட்">பாக்கெட்</option>
  <option value="box">box</option>
  <option value="Bottle">Bottle</option>
  <option value="ரூபாய்">ரூபாய்</option>
  <option value="லிட்டர்">லிட்டர்</option>
</select>

    </li>
  ))}
</ul>


<button className="add-item-btn" onClick={() => setPopupSection("vasthiram")}>➕ Add to வஸ்திரம்</button>

  
        {/* PUSHPAM */}
        <h3 className="section-title">🌸 புஷ்பம்</h3>
        <ul className="item-list">
  {pushpam.map((item, index) => (
    <li key={item.id} className={`item ${item.quantity > 0 ? "active" : "inactive"}`}>
      <span className="item-number">{index + 1}.</span>
      <span className="item-name">{item.name}</span>

      <select
        value={item.quantity}
        onChange={(e) => handleQtyChange("pushpam", item.id, parseInt(e.target.value))}
        className="quantity-dropdown"
      >
        {(item.unit === "கிராம்" ? quantityOptionsGram : quantityOptionsOther).map(qty => (
          <option key={qty} value={qty}>{qty}</option>
        ))}
      </select>

      <select
  value={item.unit}
  onChange={(e) => {
    const updated = pushpam.map(i => i.id === item.id ? { ...i, unit: e.target.value } : i);
    setPushpam(updated);
    localStorage.setItem("pushpam", JSON.stringify(updated));
  }}
  className="unit-select"
>
  <option value="கிராம்">கிராம்</option>
  <option value="கிலோ">கிலோ</option>
  <option value="pcs">pcs</option>
  <option value="பாக்கெட்">பாக்கெட்</option>
  <option value="box">box</option>
  <option value="Bottle">Bottle</option>
  <option value="ரூபாய்">ரூபாய்</option>
  <option value="லிட்டர்">லிட்டர்</option>
</select>

    </li>
  ))}
</ul>


<button className="add-item-btn" onClick={() => setPopupSection("pushpam")}>➕ Add to புஷ்பம்</button>

  
        {/* HOME CHECKLIST */}
        <h3 className="section-title">🏠 வீட்டில் எடுத்து வைக்க வேண்டியது</h3>
        <ul className="item-list">
  {homeItems.map((item, index) => (
    <li key={item.id} className={`item ${item.quantity > 0 ? "active" : "inactive"}`}>
      <span className="item-number">{index + 1}.</span>
      <span className="item-name">{item.name}</span>

      <select
        value={item.quantity}
        onChange={(e) => handleQtyChange("home", item.id, parseInt(e.target.value))}
        className="quantity-dropdown"
      >
        {(item.unit === "கிராம்" ? quantityOptionsGram : quantityOptionsOther).map(qty => (
          <option key={qty} value={qty}>{qty}</option>
        ))}
      </select>

      <select
  value={item.unit}
  onChange={(e) => {
    const updated = homeItems.map(i => i.id === item.id ? { ...i, unit: e.target.value } : i);
    setHomeItems(updated);
    localStorage.setItem("homeItems", JSON.stringify(updated));
  }}
  className="unit-select"
>
  <option value="கிராம்">கிராம்</option>
  <option value="கிலோ">கிலோ</option>
  <option value="pcs">pcs</option>
  <option value="பாக்கெட்">பாக்கெட்</option>
  <option value="box">box</option>
  <option value="Bottle">Bottle</option>
  <option value="ரூபாய்">ரூபாய்</option>
  <option value="லிட்டர்">லிட்டர்</option>
</select>

    </li>
  ))}
</ul>


<button className="add-item-btn" onClick={() => setPopupSection("home")}>➕ Add to வீட்டில் எடுத்து வைக்க வேண்டிய பொருட்கள்</button>

  
        {/* SHARE BUTTON */}
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
</div>
        <button className="share-btn" onClick={handleShare}>📤 Share List</button>
      </div>
  
      {/* POPUP */}
      {popupSection && (
        <div className="popup">
          <div className="popup-content">
            <h3>Add New Item ({popupSection})</h3>
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
              {(newItem.unit === "கிராம்" ? quantityOptionsGram : quantityOptionsOther).map(qty => (
                <option key={qty} value={qty}>{qty}</option>
              ))}
            </select>
            <select
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
            >
              <option value="கிராம்">கிராம்</option>
              <option value="கிலோ">கிலோ</option>
              <option value="pcs">pcs</option>
              <option value="பாக்கெட்">பாக்கெட்</option>
              <option value="box">box</option>
              <option value="Bottle">Bottle</option>
              <option value="ரூபாய்">ரூபாய்</option>
              <option value="லிட்டர்">லிட்டர்</option>
            </select>
            <button onClick={handleAdd}>Add</button>
            <button onClick={() => setPopupSection(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListPage;