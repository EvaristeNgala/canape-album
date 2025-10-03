// src/pages/Admin.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, setDoc, doc, query, orderBy } from "firebase/firestore";

export default function Admin() {
  // --- Admin WhatsApp ---
  const [whatsappAdmin, setWhatsappAdmin] = useState("");
  const [editingWhatsapp, setEditingWhatsapp] = useState(false);
  const [tempWhatsapp, setTempWhatsapp] = useState("");

  // --- AlbumPublic URL automatique ---
  const albumPublicUrl =
    window.location.hostname === "localhost"
      ? "http://localhost:3000/album-public"
      : "https://ton-site-vercel.vercel.app/album-public";

  // --- Formulaire produit ---
  const [prix, setPrix] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([null, null, null]); // 3 images max

  const [categories, setCategories] = useState([]);
  const [selectedCategorie, setSelectedCategorie] = useState("");
  const [newCategorie, setNewCategorie] = useState("");

  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategorie, setSelectedSubCategorie] = useState("");
  const [newSubCategorie, setNewSubCategorie] = useState("");

  const [uploading, setUploading] = useState(false);

  // --- Récupérer catégories ---
  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      const cats = snapshot.docs.map((doc) => doc.data().nom);
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  // --- Récupérer sous-catégories ---
  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!selectedCategorie || selectedCategorie === "new") return setSubCategories([]);
      const snapshot = await getDocs(
        collection(db, `categories/${selectedCategorie}/subcategories`)
      );
      const subs = snapshot.docs.map((doc) => doc.data().nom);
      setSubCategories(subs);
    };
    fetchSubCategories();
  }, [selectedCategorie]);

  // --- Récupérer numéro WhatsApp admin ---
  useEffect(() => {
    const fetchWhatsapp = async () => {
      const docSnap = await getDocs(collection(db, "settings"));
      docSnap.forEach((d) => {
        if (d.id === "admin") setWhatsappAdmin(d.data().whatsapp || "");
      });
    };
    fetchWhatsapp();
  }, []);

  // --- Gestion WhatsApp ---
  const handleSaveWhatsapp = async () => {
    if (!tempWhatsapp.trim()) return alert("Numéro vide !");
    if (!tempWhatsapp.startsWith("+"))
      return alert("Le numéro doit inclure le code pays, exemple +243XXXXXXXXX");
    await setDoc(doc(db, "settings", "admin"), { whatsapp: tempWhatsapp });
    setWhatsappAdmin(tempWhatsapp);
    setEditingWhatsapp(false);
    alert("Numéro WhatsApp mis à jour !");
  };

  // --- Ajouter catégorie ---
  const handleAddCategorie = async () => {
    if (!newCategorie.trim()) return alert("Nom de la catégorie vide !");
    await addDoc(collection(db, "categories"), { nom: newCategorie });
    setCategories([...categories, newCategorie]);
    setNewCategorie("");
    setSelectedCategorie("");
  };

  // --- Ajouter sous-catégorie ---
  const handleAddSubCategorie = async () => {
    if (!selectedCategorie || selectedCategorie === "new")
      return alert("Sélectionne une catégorie avant !");
    if (!newSubCategorie.trim()) return alert("Nom sous-catégorie vide !");
    await addDoc(
      collection(db, `categories/${selectedCategorie}/subcategories`),
      { nom: newSubCategorie }
    );
    setSubCategories([...subCategories, newSubCategorie]);
    setNewSubCategorie("");
  };

  // --- Gestion images ---
  const handleImageChange = (e, index) => {
    const newImgs = [...images];
    newImgs[index] = e.target.files[0];
    setImages(newImgs);
  };

  // --- Ajouter produit avec référence automatique ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategorie || !selectedSubCategorie)
      return alert("Sélectionne catégorie et sous-catégorie !");
    setUploading(true);

    // --- Générer la référence produit automatique ---
    const snapshot = await getDocs(collection(db, "produits"));
    const nextNumber = snapshot.docs.length + 1;
    const referenceProduit = `PRO-${nextNumber.toString().padStart(3, "0")}`;

    // --- Upload images ---
    const uploadedImages = [];
    for (let i = 0; i < images.length; i++) {
      if (!images[i]) continue;
      const reader = new FileReader();
      reader.readAsDataURL(images[i]);
      await new Promise((res) => {
        reader.onloadend = async () => {
          const base64 = reader.result.split(",")[1];
          const formData = new FormData();
          formData.append("image", base64);
          const response = await fetch(
            `https://api.imgbb.com/1/upload?key=a74abb2944d10f7a347056507044bac2`,
            { method: "POST", body: formData }
          );
          const data = await response.json();
          uploadedImages.push(data.data.url);
          res();
        };
      });
    }

    await addDoc(collection(db, "produits"), {
      reference: referenceProduit, // ✅ Référence automatique
      categorie: selectedCategorie,
      sousCategorie: selectedSubCategorie,
      prix: parseFloat(prix),
      description,
      images: uploadedImages,
      createdAt: new Date(),
    });

    setPrix("");
    setDescription("");
    setImages([null, null, null]);
    setSelectedCategorie("");
    setSelectedSubCategorie("");
    setUploading(false);
    alert(`Produit ajouté ! Référence: ${referenceProduit}`);
  };

  const styles = {
    container: {
      maxWidth: "600px",
      margin: "40px auto",
      padding: "20px",
      background: "#fff",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    },
    button: {
      padding: "12px",
      borderRadius: "8px",
      background: "#007bff",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      marginTop: "10px",
    },
    input: { padding: "10px", border: "1px solid #ccc", borderRadius: "8px", width: "100%" },
    smallButton: {
      padding: "10px",
      borderRadius: "8px",
      background: "green",
      color: "#fff",
      border: "none",
      cursor: "pointer",
    },
    imagePreview: { width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" },
    linkBox: {
      marginTop: "15px",
      padding: "10px",
      background: "#f0f0f0",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      gap: "10px",
      wordBreak: "break-all",
    },
    copyButton: { padding: "8px 12px", borderRadius: "8px", background: "#28a745", color: "#fff", border: "none", cursor: "pointer" },
  };

  return (
    <div style={styles.container}>
      <h2 style={{ textAlign: "center" }}>Paramètres admin</h2>

      {/* WhatsApp */}
      {!editingWhatsapp ? (
        <>
          <button
            style={styles.button}
            onClick={() => {
              setTempWhatsapp(whatsappAdmin);
              setEditingWhatsapp(true);
            }}
          >
            {whatsappAdmin ? `Modifier WhatsApp (${whatsappAdmin})` : "Saisir numéro WhatsApp"}
          </button>

          {/* Lien AlbumPublic avec bouton copier */}
          <div style={styles.linkBox}>
            <p style={{ margin: 0, flex: 1 }}>{albumPublicUrl}</p>
            <button
              style={styles.copyButton}
              onClick={() => {
                navigator.clipboard.writeText(albumPublicUrl);
                alert("Lien copié !");
              }}
            >
              📋 Copier
            </button>
          </div>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="+243XXXXXXXXX"
            value={tempWhatsapp}
            onChange={(e) => setTempWhatsapp(e.target.value)}
            style={styles.input}
          />
          <button style={styles.button} onClick={handleSaveWhatsapp}>💾 Valider</button>
          <button
            style={{ ...styles.button, background: "#6c757d" }}
            onClick={() => setEditingWhatsapp(false)}
          >
            Annuler
          </button>
        </>
      )}

      {/* === Formulaire produit === */}
      <h2 style={{ textAlign: "center", marginTop: "30px" }}>Ajouter un produit</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <input
          type="number"
          placeholder="Prix"
          value={prix}
          onChange={(e) => setPrix(e.target.value)}
          required
          style={styles.input}
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={{ ...styles.input, minHeight: "80px" }}
        />

        {/* Catégorie */}
        <select
          value={selectedCategorie}
          onChange={(e) => setSelectedCategorie(e.target.value)}
          style={styles.input}
        >
          <option value="">-- Choisir catégorie --</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
          <option value="new">+ Ajouter nouvelle catégorie</option>
        </select>
        {selectedCategorie === "new" && (
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Nouvelle catégorie"
              value={newCategorie}
              onChange={(e) => setNewCategorie(e.target.value)}
              style={styles.input}
            />
            <button type="button" onClick={handleAddCategorie} style={styles.smallButton}>
              Ajouter
            </button>
          </div>
        )}

        {/* Sous-catégorie */}
        <select
          value={selectedSubCategorie}
          onChange={(e) => setSelectedSubCategorie(e.target.value)}
          style={styles.input}
        >
          <option value="">-- Choisir sous-catégorie --</option>
          {subCategories.map((sub, i) => (
            <option key={i} value={sub}>
              {sub}
            </option>
          ))}
          <option value="new">+ Ajouter nouvelle sous-catégorie</option>
        </select>
        {selectedSubCategorie === "new" && (
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Nouvelle sous-catégorie"
              value={newSubCategorie}
              onChange={(e) => setNewSubCategorie(e.target.value)}
              style={styles.input}
            />
            <button type="button" onClick={handleAddSubCategorie} style={styles.smallButton}>
              Ajouter
            </button>
          </div>
        )}

        {/* Images */}
        {[0, 1, 2].map((i) => (
          <input key={i} type="file" accept="image/*" onChange={(e) => handleImageChange(e, i)} />
        ))}
        {images.map(
          (img, i) => img && <img key={i} src={URL.createObjectURL(img)} alt="preview" style={styles.imagePreview} />
        )}

        <button type="submit" disabled={uploading} style={styles.button}>
          {uploading ? "Envoi en cours..." : "Ajouter le produit"}
        </button>
      </form>
    </div>
  );
}
