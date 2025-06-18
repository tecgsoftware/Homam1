import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import ListPage from "./components/ListPage";
import Admin from "./components/Admin";
import ListPage2 from "./components/ListPage2"; // ✅ Import ListPage2
import ProtectedRoute from "./components/ProtectedRoute"; // ✅ Import Protected Route
import DynamicListPage from "./components/DynamicListPage";


function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Login Page (Default Route) */}
        <Route path="/" element={<Login />} />

        {/* ✅ Protected Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/list-page"
          element={
            <ProtectedRoute>
              <ListPage />
            </ProtectedRoute>
          }
          />
          <Route
            path="/list-page-2" // ✅ New Route for ListPage2
            element={
              <ProtectedRoute>
                <ListPage2 />
              </ProtectedRoute>
            }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dynamic-list/:id"
          element={
            <ProtectedRoute>
              <DynamicListPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
