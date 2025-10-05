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

  const supprimerProduit = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      try {
        await deleteDoc(doc(db, "produits", id));
        setProduits(produits.filter((p) => p.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const modifierProduit = (id) => {
    navigate(`/edit-produit/${id}`);
  };

  const styles = {
    container: { maxWidth: "1000px", margin: "20px auto", padding: "10px", fontFamily: "Arial, sans-serif" },
    filters: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", marginBottom: "15px", gap: "10px" },
    input: { flex: 1, padding: "10px", border: "1px solid #ccc", borderRadius: "8px", minWidth: "150px" },
    tableWrapper: { width: "100%", overflowX: "auto" },
    header: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", fontWeight: "700", padding: "10px 0", borderBottom: "2px solid #ccc", textAlign: "center" },
    row: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #eee", textAlign: "center" },
    image: { width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", margin: "auto" },
    reference: { fontWeight: "600" },
    prix: { fontWeight: "bold", color: "#007bff" },
    btn: { border: "none", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", transition: "all 0.3s ease" },
    editBtn: { background: "#ffca28", color: "#333" },
    deleteBtn: { background: "#e53935", color: "#fff" },
    responsiveCard: { display: "none" },
  };

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
          <div style={styles.filters}>
            <input type="text" placeholder="🔍 Rechercher par référence..." value={search} onChange={(e) => setSearch(e.target.value)} style={styles.input} />
            <input type="number" placeholder="💲 Prix max" value={maxPrix} onChange={(e) => setMaxPrix(e.target.value)} style={styles.input} />
          </div>

          <div style={styles.tableWrapper}>
            {/* Header */}
            <div style={styles.header}>
              <span>Référence</span>
              <span>Image</span>
              <span>Prix</span>
              <span>Modifier</span>
              <span>Supprimer</span>
            </div>

            {produitsFiltres.length > 0 ? (
              produitsFiltres.map((p) => (
                <React.Fragment key={p.id}>
                  {/* Version bureau */}
                  <div style={styles.row}>
                    <span style={styles.reference}>{p.reference || "N/A"}</span>
                    <img src={p.images?.[0] || "https://via.placeholder.com/80"} alt={p.reference} style={styles.image} />
                    <span style={styles.prix}>${p.prix}</span>
                    <button style={{ ...styles.btn, ...styles.editBtn, marginRight: "5px" }} onClick={() => modifierProduit(p.id)}>✏️ Modifier</button>
                    <button style={{ ...styles.btn, ...styles.deleteBtn }} onClick={() => supprimerProduit(p.id)}>🗑️ Supprimer</button>
                  </div>

                  {/* Version mobile */}
                  <div className="responsiveCard">
                    <p><strong>Réf :</strong> {p.reference}</p>

                    <div className="imagesContainer" style={{ display: "flex", overflowX: "auto", gap: "8px", paddingBottom: "5px" }}>
                      {p.images?.length > 0 ? (
                        p.images.map((img, idx) => <img key={idx} src={img} alt={`${p.reference}-${idx}`} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }} />)
                      ) : (
                        <img src="https://via.placeholder.com/80" alt="placeholder" style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }} />
                      )}
                    </div>

                    <p><strong>Prix :</strong> ${p.prix}</p>

                    <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "8px" }}>
                      <button style={{ ...styles.btn, ...styles.editBtn }} onClick={() => modifierProduit(p.id)}>✏️ Modifier</button>
                      <button style={{ ...styles.btn, ...styles.deleteBtn }} onClick={() => supprimerProduit(p.id)}>🗑️ Supprimer</button>
                    </div>
                  </div>
                </React.Fragment>
              ))
            ) : (
              <p style={{ textAlign: "center", marginTop: "20px", color: "#888" }}>Aucun produit trouvé ⚠️</p>
            )}
          </div>
        </>
      )}
      {/* Styles media query */}
      <style>{`
        @media (max-width: 700px) {
          .header, .row { display: none; }
          .responsiveCard { display: block; background: #fff; border: 1px solid #ddd; border-radius: 10px; padding: 10px; margin-bottom: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        }
      `}</style>
    </div>
  );
}
