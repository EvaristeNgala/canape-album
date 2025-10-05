import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams, useNavigate } from "react-router-dom";

export default function EditProduit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [produit, setProduit] = useState({
    reference: "",
    prix: "",
    categorie: "",
    sousCategorie: "",
    description: "",
    images: ["", "", ""], // 3 images max
  });
  const [loading, setLoading] = useState(true);
  const [newImages, setNewImages] = useState([null, null, null]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchProduit = async () => {
      try {
        const docRef = doc(db, "produits", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduit({
            ...data,
            images: data.images.length === 3 ? data.images : [...data.images, ...Array(3 - data.images.length).fill("")],
          });
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

  const handleImageChange = (e, index) => {
    const imgs = [...newImages];
    imgs[index] = e.target.files[0];
    setNewImages(imgs);
  };

  const uploadImage = async (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        const base64 = reader.result.split(",")[1];
        const formData = new FormData();
        formData.append("image", base64);
        try {
          const response = await fetch(
            `https://api.imgbb.com/1/upload?key=a74abb2944d10f7a347056507044bac2`,
            { method: "POST", body: formData }
          );
          const data = await response.json();
          resolve(data.data.url);
        } catch (err) {
          console.error(err);
          reject(err);
        }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const uploadedImages = [...produit.images];

    for (let i = 0; i < 3; i++) {
      if (newImages[i]) {
        uploadedImages[i] = await uploadImage(newImages[i]);
      }
    }

    try {
      const docRef = doc(db, "produits", id);
      await updateDoc(docRef, {
        reference: produit.reference,
        prix: Number(produit.prix),
        categorie: produit.categorie,
        sousCategorie: produit.sousCategorie,
        description: produit.description,
        images: uploadedImages,
      });
      alert("Produit mis à jour !");
      navigate("/liste-produits");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour !");
    }
    setUploading(false);
  };

  if (loading) return <p style={{ textAlign: "center" }}>Chargement...</p>;

  const styles = {
    container: { maxWidth: "600px", margin: "30px auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" },
    input: { width: "95%", padding: "10px", margin: "10px 0", border: "1px solid #ccc", borderRadius: "6px" },
    textarea: { width: "100%", padding: "10px", margin: "10px 0", border: "1px solid #ccc", borderRadius: "6px", minHeight: "80px" },
    button: { padding: "12px", borderRadius: "8px", background: "#007bff", color: "#fff", border: "none", cursor: "pointer", fontWeight: "600" },
    imagePreview: { width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px", marginRight: "10px" },
    imagesContainer: { display: "flex", gap: "10px", marginBottom: "10px" },
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
          style={styles.textarea}
        />

        <div style={styles.imagesContainer}>
          {produit.images.map((img, i) => img && <img key={i} src={img} alt={`img${i}`} style={styles.imagePreview} />)}
        </div>

        {[0, 1, 2].map((i) => (
          <input key={i} type="file" accept="image/*" onChange={(e) => handleImageChange(e, i)} />
        ))}

        <button type="submit" disabled={uploading} style={styles.button}>
          {uploading ? "Envoi en cours..." : "💾 Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
}
