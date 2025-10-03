// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Admin from "./pages/Admin";
import Album from "./pages/Album";

function App() {
  return (
    <Router>
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        {/* Menu de navigation */}
        <nav style={{ marginBottom: "20px" }}>
          <Link to="/admin" style={{ marginRight: "15px" }}>
            Admin
          </Link>
          
          <Link to="/album">Album</Link>
        </nav>

        {/* Définition des routes */}
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/album" element={<Album />} />
          <Route
            path="/"
            element={<h2>Bienvenue 👋 Choisis une page ci-dessus</h2>}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
