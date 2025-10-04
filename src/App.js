// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Admin from "./pages/Admin";
import Album from "./pages/Album";
import AlbumPublic from "./pages/AlbumPublic";
import ListeProduits from "./pages/ListeProduits";

// Menu conditionnel avec styles
function NavBar() {
  const location = useLocation();

  // Si on est sur /album-public, on ne montre pas Admin et Album
  if (location.pathname === "/album-public") return null;

  // Générer automatiquement le lien vers AlbumPublic
  const albumPublicUrl = `${window.location.origin}/album-public`;

  // Style commun des liens
  const linkStyle = {
    textDecoration: "none",
    color: "#333",
    fontWeight: "600",
    fontSize: "16px",
    padding: "6px 12px",
    borderRadius: "8px",
    transition: "0.3s",
  };

  const handleMouseEnter = (e) => (e.target.style.background = "#e5e7eb");
  const handleMouseLeave = (e) => (e.target.style.background = "transparent");

  return (
    <nav
      style={{
        marginBottom: "30px",
        display: "flex",
        justifyContent: "center",
        gap: "25px",
        background: "#f4f6f8",
        padding: "12px 0",
        borderRadius: "10px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      }}
    >
      <Link
        to="/admin"
        style={linkStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Admin
      </Link>

      <Link
        to="/album"
        style={linkStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Album
      </Link>

      <Link
        to="/listeproduit"
        style={linkStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        Liste de produit
      </Link>

      
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div
        style={{
          padding: "20px",
          fontFamily: "Arial, sans-serif",
          background: "#fafafa",
          minHeight: "100vh",
        }}
      >
        <NavBar />

        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/album" element={<Album />} />
          <Route path="/listeproduit" element={<ListeProduits />} />
          <Route path="/album-public" element={<AlbumPublic />} /> {/* Page publique */}
          <Route
            path="/"
            element={
              <h2 style={{ textAlign: "center", marginTop: "50px" }}>
                Bienvenue 👋 Choisis une page ci-dessus
              </h2>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
