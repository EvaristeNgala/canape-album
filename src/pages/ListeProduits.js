// src/pages/ListeProduits.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";

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

  // Supprimer un produit
  const supprimerProduit = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      try {
        await deleteDoc(doc(db, "produits", id));
        setProduits(produits.filter((p) => p.id !== id));
        alert("Produit supprimé avec succès ✅");
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la suppression ❌");
      }
    }
  };

  // Modifier un produit (rediriger vers une page admin par exemple)
  const modifierProduit = (id) => {
    alert(`🔧 Fonction à venir : Modifier le produit avec ID ${id}`);
    // Tu pourras plus tard rediriger vers une page /edit/:id
  };

  // Styles
  const styles = {
    container: { maxWidth: "950px", margin: "20px auto", padding: "10px", fontFamily: "Arial, sans-serif" },
    filters: { display: "flex", justifyContent: "space-between", marginBottom: "15px", gap: "10px" },
    input: { flex: 1, padding: "8px", border: "1px solid #ccc", borderRadius: "6px" },
    header: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
      fontWeight: "700",
      padding: "10px 0",
      borderBottom: "2px solid #ccc",
      textAlign: "center",
    },
    row: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
      alignItems: "center",
      padding: "10px 0",
      borderBottom: "1px solid #eee",
      textAlign: "center",
    },
    image: { width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px", margin: "auto" },
    reference: { fontWeight: "600" },
    prix: { fontWeight: "bold", color: "#007bff" },
    btn: {
      border: "none",
      padding: "6px 10px",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "600",
      transition: "0.3s",
    },
    editBtn: { background: "#f0ad4e", color: "white" },
    deleteBtn: { background: "#d9534f", color: "white" },
  };

  // Filtrage : uniquement sur la référence
  const produitsFiltres = produits.filter((p) => {
    const searchText = search.toLowerCase();
    const matchSearch = p.reference?.toLowerCase().includes(searchText);
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
              placeholder="🔍 Rechercher par référence..."
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
            <span>Modifier</span>
            <span>Supprimer</span>
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

                <button
                  style={{ ...styles.btn, ...styles.editBtn }}
                  onClick={() => modifierProduit(p.id)}
                >
                  ✏️ Modifier
                </button>

                <button
                  style={{ ...styles.btn, ...styles.deleteBtn }}
                  onClick={() => supprimerProduit(p.id)}
                >
                  🗑️ Supprimer
                </button>
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
