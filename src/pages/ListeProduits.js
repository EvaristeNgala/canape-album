import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./ListeProduits.css"; // <-- Import CSS

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
        const produitsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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

  const modifierProduit = (id) => navigate(`/edit-produit/${id}`);

  const produitsFiltres = produits.filter((p) => {
    const searchText = search.toLowerCase();
    const matchSearch = p.reference?.toLowerCase().includes(searchText);
    const matchPrix = maxPrix ? Number(p.prix) <= Number(maxPrix) : true;
    return matchSearch && matchPrix;
  });

  return (
    <div className="container">
      {loading ? (
        <p style={{ textAlign: "center" }}>Chargement...</p>
      ) : (
        <>
          <div className="filters">
            <input
              type="text"
              placeholder="🔍 Rechercher par référence..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <input
              type="number"
              placeholder="💲 Prix max"
              value={maxPrix}
              onChange={(e) => setMaxPrix(e.target.value)}
            />
          </div>

          <div className="tableWrapper">
            <div className="header">
              <span>Référence</span>
              <span>Image</span>
              <span>Prix</span>
              <span>Modifier</span>
              <span>Supprimer</span>
            </div>

            {produitsFiltres.length > 0 ? (
              produitsFiltres.map((p) => (
                <React.Fragment key={p.id}>
                  <div className="row">
                    <span className="reference">{p.reference}</span>
                    <img src={p.images?.[0] || "https://via.placeholder.com/80"} alt={p.reference} className="image" />
                    <span className="prix">${p.prix}</span>
                    <button className="btn editBtn" onClick={() => modifierProduit(p.id)}>✏️ Modifier</button>
                    <button className="btn deleteBtn" onClick={() => supprimerProduit(p.id)}>🗑️ Supprimer</button>
                  </div>

                  <div className="responsiveCard">
                    <p><strong>Réf :</strong> {p.reference}</p>
                    <img src={p.images?.[0] || "https://via.placeholder.com/80"} alt={p.reference} />
                    <p><strong>Prix :</strong> ${p.prix}</p>
                    <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "8px" }}>
                      <button className="btn editBtn" onClick={() => modifierProduit(p.id)}>✏️ Modifier</button>
                      <button className="btn deleteBtn" onClick={() => supprimerProduit(p.id)}>🗑️ Supprimer</button>
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
    </div>
  );
}
