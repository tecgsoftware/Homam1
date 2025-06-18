import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";
import logo from "../assets/homam-logo.png";

const API_URL = "http://13.202.37.246:6001"; // matches your backend SERVER_IP


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState("Unknown");
  const navigate = useNavigate();

  // ✅ Check if the user is already logged in
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) navigate("/home"); // ✅ Redirect if already logged in
  }, [navigate]);

  // ✅ Detect user's location
  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((response) => response.json())
      .then((data) => setLocation(`${data.city}, ${data.country}`))
      .catch(() => setLocation("Unknown"));
  }, []);

  // ✅ Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Admin Login
    if (username === "admin" && password === "1234") {
      localStorage.setItem("currentUser", JSON.stringify({ username: "admin", role: "admin" }));
      navigate("/admin");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/login`, {
        username,
        password,
        location,
      });

      if (res.data.success) {
        localStorage.setItem("currentUser", JSON.stringify(res.data.user));
        navigate("/home"); // ✅ Instant navigation to Home
      } else {
        setError("❌ Wrong username or password.");
      }
    } catch (error) {
      setError("❌ Wrong username or password.");
    }
  };

  // ✅ Open WhatsApp Chat for New User / Forgot Password
  const redirectToWhatsApp = () => {
    const phoneNumber = "919444272827"; // ✅ +91 for India
    const message = encodeURIComponent("Hello, I need login credentials for the app.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <div className="login-page">
      <h2 className="welcome-text">Welcome</h2>
      <img src={logo} alt="Homam Logo" className="homam-logo" />

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleLogin}>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="input-group password-group">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "🔒" : "👁️"}
          </span>
        </div>

        {/* ✅ "Clear" text below Password Field */}
        <p className="clear-text" onClick={() => { setUsername(""); setPassword(""); }}>Clear</p>

        <button type="submit" className="login-btn">Login</button>
      </form>

      {/* ✅ Hyperlink for New User / Forgot Password */}
      <p className="new-user-text">
        <span onClick={redirectToWhatsApp} className="whatsapp-link">New User? / Forgot Password?</span>
      </p>
    </div>
  );
};

export default Login;
