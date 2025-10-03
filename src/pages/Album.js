// src/pages/Album.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function Album() {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategorie, setSelectedCategorie] = useState("Tous");
  const [sousCategories, setSousCategories] = useState([]);
  const [selectedSousCategorie, setSelectedSousCategorie] = useState("Tous");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const q = query(collection(db, "produits"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const produitsData = [];
        querySnapshot.forEach((doc) => {
          produitsData.push({ id: doc.id, ...doc.data() });
        });
        setProduits(produitsData);

        const uniqueCats = ["Tous", ...new Set(produitsData.map((p) => p.categorie))];
        setCategories(uniqueCats);

        setLoading(false);
      } catch (error) {
        console.error("Erreur récupération produits :", error);
        setLoading(false);
      }
    };

    fetchProduits();
  }, []);

  const filteredProduits = produits.filter((p) => {
    if (selectedCategorie === "Tous") return true;
    if (selectedSousCategorie !== "Tous")
      return p.categorie === selectedCategorie && p.sousCategorie === selectedSousCategorie;
    return p.categorie === selectedCategorie;
  });

  useEffect(() => {
    if (selectedCategorie !== "Tous") {
      const sousCats = [
        "Tous",
        ...new Set(
          produits
            .filter((p) => p.categorie === selectedCategorie)
            .map((p) => p.sousCategorie)
            .filter((s) => s && s.trim() !== "")
        ),
      ];
      setSousCategories(sousCats);
    } else {
      setSousCategories([]);
    }
    setSelectedSousCategorie("Tous");
  }, [selectedCategorie, produits]);

  const styles = {
    container: {
      width: "100%",
      maxWidth: "600px",
      margin: "0 auto",
      padding: "0 10px",
      fontFamily: "'Inter', sans-serif",
      background: "#f8f9fb",
      boxSizing: "border-box",
    },
    header: {
      width: "100vw", // occupe toute la largeur
      marginLeft: "calc(-50vw + 50%)", // astuce pour sortir du conteneur
      background: "linear-gradient(135deg, rgba(0,0,0,0.75), rgba(20,20,20,0.8))",
      backdropFilter: "blur(10px)",
      color: "#fff",
      textAlign: "center",
      padding: "16px 0",
      fontSize: "20px",
      fontWeight: "600",
      letterSpacing: "0.5px",
      textTransform: "uppercase",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    },
    sectionSeparator: {
      width: "100%",
      height: "1px",
      background: "rgba(0,0,0,0.08)",
      margin: "10px 0",
    },
    filters: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "8px",
      padding: "5px 0",
    },
    button: (active) => ({
      padding: "8px 14px",
      border: active ? "none" : "1px solid #007bff",
      background: active ? "#007bff" : "#fff",
      color: active ? "#fff" : "#007bff",
      borderRadius: "20px",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      boxShadow: active ? "0 2px 5px rgba(0,123,255,0.3)" : "none",
      transition: "all 0.2s ease",
    }),
    produitCard: {
      width: "100%",
      borderRadius: "12px",
      marginBottom: "15px",
      background: "#fff",
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      display: "flex",
      flexDirection: "column",
      transition: "transform 0.2s ease",
    },
    image: {
      width: "100%",
      height: "220px",
      objectFit: "cover",
    },
    footer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 14px",
      fontSize: "15px",
      borderTop: "1px solid rgba(0,0,0,0.05)",
    },
    sousCategorie: {
      fontWeight: "500",
      color: "#333",
      textTransform: "capitalize",
    },
    prix: {
      fontWeight: "600",
      color: "#007bff",
    },
  };

  return (
    <div style={styles.container}>
      {/* Header pleine largeur */}
      <div style={styles.header}>Passer la Commande</div>

      {/* Filtres Catégories */}
      <div style={styles.filters}>
        {categories.map((cat, i) => (
          <button
            key={i}
            onClick={() => setSelectedCategorie(cat)}
            style={styles.button(selectedCategorie === cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Ligne de séparation */}
      {sousCategories.length > 0 && <div style={styles.sectionSeparator}></div>}

      {/* Filtres Sous-Catégories */}
      {selectedCategorie !== "Tous" && sousCategories.length > 0 && (
        <div style={styles.filters}>
          {sousCategories.map((sub, i) => (
            <button
              key={i}
              onClick={() => setSelectedSousCategorie(sub)}
              style={styles.button(selectedSousCategorie === sub)}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Ligne de séparation */}
      <div style={styles.sectionSeparator}></div>

      {/* Liste Produits */}
      {loading ? (
        <p style={{ textAlign: "center" }}>Chargement...</p>
      ) : filteredProduits.length === 0 ? (
        <p style={{ textAlign: "center" }}>Aucun produit trouvé.</p>
      ) : (
        filteredProduits.map((p) => (
          <div key={p.id} style={styles.produitCard}>
            <img src={p.imageUrl} alt={p.titre} style={styles.image} />
            <div style={styles.footer}>
              <span style={styles.sousCategorie}>
                {p.sousCategorie || "Sous-catégorie"}
              </span>
              <span style={styles.prix}>${p.prix}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
