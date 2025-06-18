import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (!user) {
      navigate("homama-test/login"); // ✅ Redirect to login if not logged in
    }
  }, [navigate]);

  return children;
};

export default ProtectedRoute;
