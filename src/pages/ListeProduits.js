// src/pages/ListeProduits.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function ListeProduits() {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [maxPrix, setMaxPrix] = useState("");
  const [selectedProduit, setSelectedProduit] = useState(null); // produit à afficher dans la fenêtre modale
  const navigate = useNavigate();

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

  const modifierProduit = (id) => navigate(`/edit-produit/${id}`);

  // Styles
  const styles = {
    container: {
      maxWidth: "1000px",
      margin: "20px auto",
      padding: "10px",
      fontFamily: "Arial, sans-serif",
    },
    filters: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: "15px",
      gap: "10px",
    },
    input: {
      flex: 1,
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      minWidth: "150px",
    },
    header: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
      fontWeight: "700",
      padding: "10px 0",
      borderBottom: "2px solid #ccc",
      textAlign: "center",
    },
    row: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
      alignItems: "center",
      padding: "10px 0",
      borderBottom: "1px solid #eee",
      textAlign: "center",
    },
    image: {
      width: "80px",
      height: "80px",
      objectFit: "cover",
      borderRadius: "8px",
      margin: "auto",
    },
    prix: { fontWeight: "bold", color: "#007bff" },
    btn: {
      border: "none",
      padding: "8px 12px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      transition: "all 0.3s ease",
    },
    editBtn: { background: "#ffca28", color: "#333" },
    deleteBtn: { background: "#e53935", color: "#fff" },
    viewBtn: { background: "#4caf50", color: "#fff" },
    modalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    modalContent: {
      background: "#fff",
      padding: "20px",
      borderRadius: "10px",
      width: "90%",
      maxWidth: "400px",
      textAlign: "center",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    },
    closeBtn: {
      marginTop: "15px",
      background: "#999",
      color: "#fff",
      padding: "8px 12px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
    },
    callBtn: {
      margin: "8px 5px",
      background: "#007bff",
      color: "#fff",
      padding: "8px 12px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
    },
    whatsappBtn: {
      margin: "8px 5px",
      background: "#25d366",
      color: "#fff",
      padding: "8px 12px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
    },
  };

  const produitsFiltres = produits.filter((p) => {
    const searchText = search.toLowerCase();
    const matchSearch = p.reference?.toLowerCase().includes(searchText);
    const matchPrix = maxPrix ? Number(p.prix) <= Number(maxPrix) : true;
    return matchSearch && matchPrix;
  });

  const handleAppel = (numero, type) => {
    if (type === "normal") {
      window.location.href = `tel:${numero}`;
    } else {
      const whatsappLink = `https://wa.me/${numero.replace(/[^0-9]/g, "")}`;
      window.open(whatsappLink, "_blank");
    }
  };

  return (
    <div style={styles.container}>
      {loading ? (
        <p style={{ textAlign: "center" }}>Chargement...</p>
      ) : (
        <>
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

          <div>
            <div style={styles.header}>
              <span>Référence</span>
              <span>Image</span>
              <span>Prix</span>
              <span>Voir</span>
              <span>Modifier</span>
              <span>Supprimer</span>
            </div>

            {produitsFiltres.length > 0 ? (
              produitsFiltres.map((p) => (
                <div key={p.id} style={styles.row}>
                  <span>{p.reference || "N/A"}</span>
                  <img src={p.images?.[0] || "https://via.placeholder.com/80"} alt={p.reference} style={styles.image} />
                  <span style={styles.prix}>${p.prix}</span>

                  <button
                    style={{ ...styles.btn, ...styles.viewBtn }}
                    onClick={() => setSelectedProduit(p)}
                  >
                    Voir
                  </button>

                  <button
                    style={{ ...styles.btn, ...styles.editBtn }}
                    onClick={() => modifierProduit(p.id)}
                  >
                    Modifier
                  </button>

                  <button
                    style={{ ...styles.btn, ...styles.deleteBtn }}
                    onClick={() => supprimerProduit(p.id)}
                  >
                    Supprimer
                  </button>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", marginTop: "20px", color: "#888" }}>
                Aucun produit trouvé ⚠️
              </p>
            )}
          </div>
        </>
      )}

      {/* Fenêtre modale d'informations */}
      {selectedProduit && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3>Informations du produit</h3>
            <p><strong>Référence :</strong> {selectedProduit.reference}</p>
            <p><strong>Fournisseur :</strong> {selectedProduit.fournisseur || "Non défini"}</p>
            <p><strong>Adresse :</strong> {selectedProduit.adresse || "Non définie"}</p>
            <p><strong>Numéro :</strong> {selectedProduit.numero || "Non défini"}</p>

            {selectedProduit.numero && (
              <div>
                <button
                  style={styles.callBtn}
                  onClick={() => handleAppel(selectedProduit.numero, "normal")}
                >
                  Appel normal
                </button>
                <button
                  style={styles.whatsappBtn}
                  onClick={() => handleAppel(selectedProduit.numero, "whatsapp")}
                >
                  WhatsApp
                </button>
              </div>
            )}

            <button style={styles.closeBtn} onClick={() => setSelectedProduit(null)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
