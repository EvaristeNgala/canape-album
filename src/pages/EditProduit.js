import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";

export default function EditProduit() {
  const { id } = useParams(); // ID du produit dans l’URL
  const navigate = useNavigate();
  const [produit, setProduit] = useState({
    reference: "",
    prix: "",
    categorie: "",
    sousCategorie: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduit = async () => {
      try {
        const docRef = doc(db, "produits", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduit(docSnap.data());
        } else {
          alert("Produit non trouvé !");
          navigate("/liste-produits");
        }
        setLoading(false);
      } catch (error) {
        console.error(error);
        alert("Erreur lors du chargement du produit.");
        setLoading(false);
      }
    };

    fetchProduit();
  }, [id, navigate]);

  // Mise à jour du produit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "produits", id);
      await updateDoc(docRef, {
        reference: produit.reference,
        prix: Number(produit.prix),
        categorie: produit.categorie,
        sousCategorie: produit.sousCategorie,
        description: produit.description,
      });
      alert("Produit mis à jour avec succès !");
      navigate("/liste-produits");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la mise à jour du produit.");
    }
  };

  if (loading) return <p style={{ textAlign: "center" }}>Chargement...</p>;

  const styles = {
    container: { maxWidth: "500px", margin: "30px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" },
    input: { width: "100%", padding: "10px", margin: "10px 0", border: "1px solid #ccc", borderRadius: "6px" },
    button: {
      width: "100%",
      padding: "10px",
      background: "#007bff",
      color: "white",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "600",
    },
    title: { textAlign: "center", marginBottom: "20px", fontSize: "20px", fontWeight: "700" },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Modifier le produit</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Référence"
          value={produit.reference}
          onChange={(e) => setProduit({ ...produit, reference: e.target.value })}
          style={styles.input}
          required
        />
        <input
          type="number"
          placeholder="Prix"
          value={produit.prix}
          onChange={(e) => setProduit({ ...produit, prix: e.target.value })}
          style={styles.input}
          required
        />
        <input
          type="text"
          placeholder="Catégorie"
          value={produit.categorie}
          onChange={(e) => setProduit({ ...produit, categorie: e.target.value })}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Sous-catégorie"
          value={produit.sousCategorie}
          onChange={(e) => setProduit({ ...produit, sousCategorie: e.target.value })}
          style={styles.input}
        />
        <textarea
          placeholder="Description"
          value={produit.description}
          onChange={(e) => setProduit({ ...produit, description: e.target.value })}
          style={{ ...styles.input, height: "100px" }}
        />
        <button type="submit" style={styles.button}>
          💾 Enregistrer les modifications
        </button>
      </form>
    </div>
  );
}
