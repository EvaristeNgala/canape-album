import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

export default function Admin() {
  const [prix, setPrix] = useState("");
  const [description, setDescription] = useState("");
  const [fournisseur, setFournisseur] = useState("");
  const [adresseFournisseur, setAdresseFournisseur] = useState("");
  const [numeroFournisseur, setNumeroFournisseur] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // --- Catégories ---
  const [categories, setCategories] = useState([]);
  const [selectedCategorie, setSelectedCategorie] = useState("");
  const [newCategorie, setNewCategorie] = useState("");

  // --- Sous-catégories ---
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategorie, setSelectedSubCategorie] = useState("");
  const [newSubCategorie, setNewSubCategorie] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const cats = [];
      querySnapshot.forEach((doc) => {
        cats.push(doc.data().nom);
      });
      setCategories(cats);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (!selectedCategorie || selectedCategorie === "new") {
        setSubCategories([]);
        return;
      }
      const querySnapshot = await getDocs(
        collection(db, `categories/${selectedCategorie}/subcategories`)
      );
      const subs = [];
      querySnapshot.forEach((doc) => {
        subs.push(doc.data().nom);
      });
      setSubCategories(subs);
    };
    fetchSubCategories();
  }, [selectedCategorie]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      alert("Choisis une image !");
      return;
    }

    try {
      setUploading(true);

      const reader = new FileReader();
      reader.readAsDataURL(image);

      reader.onloadend = async () => {
        const base64Image = reader.result.split(",")[1];
        const formData = new FormData();
        formData.append("image", base64Image);

        const response = await fetch(
          `https://api.imgbb.com/1/upload?key=a74abb2944d10f7a347056507044bac2`,
          { method: "POST", body: formData }
        );

        const data = await response.json();
        const imageUrl = data.data.url;

        let finalCategorie = selectedCategorie;
        let finalSubCategorie = selectedSubCategorie;

        // nouvelle catégorie
        if (selectedCategorie === "new" && newCategorie.trim() !== "") {
          await addDoc(collection(db, "categories"), { nom: newCategorie });
          finalCategorie = newCategorie;
        }

        // nouvelle sous-catégorie
        if (
          selectedSubCategorie === "new" &&
          newSubCategorie.trim() !== "" &&
          finalCategorie
        ) {
          await addDoc(
            collection(db, `categories/${finalCategorie}/subcategories`),
            { nom: newSubCategorie }
          );
          finalSubCategorie = newSubCategorie;
        }

        // ✅ titre = catégorie choisie
        await addDoc(collection(db, "produits"), {
          titre: finalCategorie,
          prix: parseFloat(prix),
          description,
          fournisseur,
          adresseFournisseur,
          numeroFournisseur,
          categorie: finalCategorie,
          sousCategorie: finalSubCategorie,
          imageUrl,
          createdAt: new Date(),
        });

        alert("Produit ajouté avec succès !");
        setPrix("");
        setDescription("");
        setFournisseur("");
        setAdresseFournisseur("");
        setNumeroFournisseur("");
        setImage(null);
        setSelectedCategorie("");
        setNewCategorie("");
        setSelectedSubCategorie("");
        setNewSubCategorie("");
        setUploading(false);
      };
    } catch (error) {
      console.error("Erreur :", error);
      alert("Échec de l’ajout du produit");
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        padding: "20px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      {/* ✅ Nouveau titre */}
      <h2
        style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}
      >
        Ajouter un meuble
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        {/* ⚡️ Champ Titre supprimé */}

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
          style={styles.textarea}
        />

        {/* Catégorie */}
        <select
          value={selectedCategorie}
          onChange={(e) => setSelectedCategorie(e.target.value)}
          required
          style={styles.input}
        >
          <option value="">-- Choisir une catégorie --</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
          <option value="new">+ Ajouter une nouvelle catégorie</option>
        </select>

        {selectedCategorie === "new" && (
          <input
            type="text"
            placeholder="Nouvelle catégorie"
            value={newCategorie}
            onChange={(e) => setNewCategorie(e.target.value)}
            required
            style={styles.input}
          />
        )}

        {/* Sous-catégorie */}
        <select
          value={selectedSubCategorie}
          onChange={(e) => setSelectedSubCategorie(e.target.value)}
          style={styles.input}
        >
          <option value="">-- Choisir une sous-catégorie --</option>
          {subCategories.map((sub, i) => (
            <option key={i} value={sub}>
              {sub}
            </option>
          ))}
          <option value="new">+ Ajouter une nouvelle sous-catégorie</option>
        </select>

        {selectedSubCategorie === "new" && (
          <input
            type="text"
            placeholder="Nouvelle sous-catégorie"
            value={newSubCategorie}
            onChange={(e) => setNewSubCategorie(e.target.value)}
            required
            style={styles.input}
          />
        )}

        <input
          type="text"
          placeholder="Fournisseur"
          value={fournisseur}
          onChange={(e) => setFournisseur(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Adresse du fournisseur"
          value={adresseFournisseur}
          onChange={(e) => setAdresseFournisseur(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Numéro du fournisseur"
          value={numeroFournisseur}
          onChange={(e) => setNumeroFournisseur(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
          style={styles.input}
        />

        {image && (
          <img
            src={URL.createObjectURL(image)}
            alt="Aperçu"
            style={{
              width: "100%",
              height: "200px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
        )}

        <button type="submit" disabled={uploading} style={styles.button}>
          {uploading ? "Envoi en cours..." : "Ajouter le produit"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "14px",
  },
  textarea: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "14px",
    minHeight: "80px",
  },
  button: {
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#007bff",
    color: "#fff",
    fontSize: "16px",
    cursor: "pointer",
  },
};
