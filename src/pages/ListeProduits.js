// src/pages/ListeProduits.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export default function ListeProduits() {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [maxPrix, setMaxPrix] = useState("");

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const q = query(collection(db, "produits"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const produitsData = [];
        snapshot.forEach((doc) => produitsData.push({ id: doc.id, ...doc.data() }));
        setProduits(produitsData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchProduits();
  }, []);

  // Styles
  const styles = {
    container: { maxWidth: "900px", margin: "20px auto", padding: "10px", fontFamily: "Arial, sans-serif" },
    filters: { display: "flex", justifyContent: "space-between", marginBottom: "15px", gap: "10px" },
    input: { flex: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "6px" },
    header: { display: "flex", justifyContent: "space-between", fontWeight: "700", padding: "10px 0", borderBottom: "2px solid #ccc" },
    row: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #eee", cursor: "pointer" },
    image: { width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px", marginRight: "10px" },
    reference: { fontWeight: "600", width: "150px" },
    prix: { fontWeight: "bold", color: "#007bff", width: "80px", textAlign: "right" }
  };

  // Filtrage des produits (référence, catégorie, sous-catégorie et prix max)
  const produitsFiltres = produits.filter((p) => {
    const searchText = search.toLowerCase();

    const matchSearch =
      p.reference?.toLowerCase().includes(searchText) ||
      p.categorie?.toLowerCase().includes(searchText) ||
      p.sousCategorie?.toLowerCase().includes(searchText);

    const matchPrix = maxPrix ? Number(p.prix) <= Number(maxPrix) : true;

    return matchSearch && matchPrix;
  });

  return (
    <div style={styles.container}>
      {loading ? (
        <p style={{ textAlign: "center" }}>Chargement...</p>
      ) : (
        <>
          {/* Zone de recherche et filtres */}
          <div style={styles.filters}>
            <input
              type="text"
              placeholder="🔍 Rechercher par référence, catégorie ou sous-catégorie..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.input}
            />
            <input
              type="number"
              placeholder="💲 Prix max"
              value={maxPrix}
              onChange={(e) => setMaxPrix(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Header */}
          <div style={styles.header}>
            <span>Référence</span>
            <span>Image</span>
            <span>Prix</span>
          </div>

          {/* Produits */}
          {produitsFiltres.length > 0 ? (
            produitsFiltres.map((p) => (
              <div key={p.id} style={styles.row}>
                <span style={styles.reference}>{p.reference || "N/A"}</span>
                <img
                  src={p.images?.[0] || "https://via.placeholder.com/80"}
                  alt={p.reference}
                  style={styles.image}
                />
                <span style={styles.prix}>${p.prix}</span>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", marginTop: "20px", color: "#888" }}>
              Aucun produit trouvé ⚠️
            </p>
          )}
        </>
      )}
    </div>
  );
}
