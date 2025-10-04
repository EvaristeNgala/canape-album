// src/pages/AlbumPublic.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";

export default function AlbumPublic() {
  const [produits, setProduits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategorie, setSelectedCategorie] = useState(null);
  const [selectedSousCategorie, setSelectedSousCategorie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popupProduit, setPopupProduit] = useState(null);
  const [adminWhatsapp, setAdminWhatsapp] = useState("");
  const [mainImageIndex, setMainImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const q = query(collection(db, "produits"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const produitsData = [];
        snapshot.forEach((doc) => produitsData.push({ id: doc.id, ...doc.data() }));
        setProduits(produitsData);

        const uniqueCats = [...new Set(produitsData.map((p) => p.categorie))];
        setCategories(uniqueCats);

        const adminDoc = await getDoc(doc(db, "settings", "admin"));
        if (adminDoc.exists()) setAdminWhatsapp(adminDoc.data().whatsapp);

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchProduits();
  }, []);

  const sousCategories = selectedCategorie
    ? [...new Set(produits.filter(p => p.categorie === selectedCategorie).map(p => p.sousCategorie))]
    : [];

  const filteredProduits = produits.filter(p => {
    const matchCat = !selectedCategorie || p.categorie === selectedCategorie;
    const matchSub = !selectedSousCategorie || p.sousCategorie === selectedSousCategorie;
    return matchCat && matchSub;
  });

  const handleWhatsapp = (produit) => {
    const message = `Bonjour, je souhaite commander : ${produit.reference || ""} - ${produit.categorie} - ${produit.sousCategorie}, prix ${produit.prix}$`;
    const phoneNumber = adminWhatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const styles = {
    container: { 
      maxWidth: "1000px", 
      margin: "0 auto", 
      padding: "2px", 
      fontFamily: "Arial, sans-serif", 
      color: "#333" 
    },
    categoryList: { display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "10px" },
    categoryBtn: { padding: "8px 14px", borderRadius: "20px", border: "1px solid #ccc", cursor: "pointer", background: "#fff", transition: "all 0.2s", fontSize: "14px" },
    categoryBtnActive: { borderColor: "#007bff", fontWeight: "600", background: "#e7f0ff" },
    subCategoryList: { display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "15px" },
    subCategoryBtn: { padding: "6px 12px", borderRadius: "16px", border: "1px solid #ccc", cursor: "pointer", background: "#fff", fontSize: "13px", transition: "all 0.2s" },
    subCategoryBtnActive: { borderColor: "#28a745", fontWeight: "600", background: "#e6ffed" },
    grid: { 
      display: "grid", 
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", 
      gap: "10px", 
      justifyContent: "center",
    },
    card: { 
      display: "flex", 
      flexDirection: "column", 
      borderRadius: "10px 10px 0 0 ", 
      overflow: "hidden", 
      background: "#fff", 
      boxShadow: "0 4px 10px rgba(0,0,0,0.08)", 
      cursor: "pointer", 
      transition: "transform 0.2s",
      maxWidth: "220px",
      margin: "0 auto"
    },
    image: { width: "100%", height: "140px", objectFit: "cover" },
    infoRow: { display: "flex", justifyContent: "space-between", padding: "8px", alignItems: "center" },
    label: { fontSize: "14px", fontWeight: "600", color: "#333" },
    prix: { fontSize: "14px", fontWeight: "bold", color: "#007bff" },
    popup: { position: "fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.6)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:1000 },
    popupContent: { background:"#fff", padding:"15px", borderRadius:"12px", maxWidth:"450px", width:"90%", maxHeight:"80vh", overflowY:"auto" },
    popupImage: { width:"100%", height:"200px", objectFit:"cover", borderRadius:"12px", marginBottom:"10px" },
    popupSlider: { display:"flex", overflowX:"auto", gap:"8px", marginBottom:"10px", paddingBottom:"5px" },
    popupSliderImage: { width:"80px", height:"50px", objectFit:"cover", borderRadius:"6px", cursor:"pointer", border:"2px solid transparent" },
    popupSliderImageActive: { border:"2px solid #007bff" },
    popupButton: { padding:"8px 12px", borderRadius:"6px", border:"none", cursor:"pointer", marginRight:"8px", fontWeight:"600" },
    closeBtn: { background:"#ccc", color:"#333" },
    orderBtn: { background:"#25D366", color:"#fff" }
  };

  useEffect(() => {
    if (popupProduit) setMainImageIndex(0);
  }, [popupProduit]);

  // ✅ Style responsive : 2 colonnes sur mobile + marges réduites
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @media (max-width: 700px) {
        .produits-grid {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 8px !important;
        }
        .produits-grid .card {
          max-width: 100% !important;
        }
        body {
          margin: 0;
          padding: 0;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div style={styles.container}>
      {loading ? (
        <p style={{textAlign:"center"}}>Chargement...</p>
      ) : (
        <>
          {/* Catégories */}
          <div style={styles.categoryList}>
            {categories.map((cat,i) => (
              <div key={i} 
                style={{...styles.categoryBtn, ...(selectedCategorie===cat?styles.categoryBtnActive:{})}}
                onClick={()=>{setSelectedCategorie(cat); setSelectedSousCategorie(null)}}
              >
                {cat}
              </div>
            ))}
          </div>

          {/* Sous-catégories */}
          {selectedCategorie && sousCategories.length > 0 && (
            <div style={styles.subCategoryList}>
              {sousCategories.map((sub,i) => (
                <div key={i} 
                  style={{...styles.subCategoryBtn, ...(selectedSousCategorie===sub?styles.subCategoryBtnActive:{})}}
                  onClick={()=>setSelectedSousCategorie(sub)}
                >
                  {sub}
                </div>
              ))}
            </div>
          )}

          {/* ✅ Pas de bouton retour */}

          {/* Produits */}
          <div className="produits-grid" style={styles.grid}>
            {filteredProduits.map(p => (
              <div key={p.id} className="card" style={styles.card} onClick={()=>setPopupProduit(p)}>
                <img src={p.images?.[0] || "https://via.placeholder.com/300x200"} alt={p.sousCategorie} style={styles.image} />
                <div style={styles.infoRow}>
                  <span style={styles.label}>{p.sousCategorie || "Sans sous-catégorie"}</span>
                  <span style={styles.prix}>${p.prix}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Popup produit */}
          {popupProduit && (
            <div style={styles.popup} onClick={()=>setPopupProduit(null)}>
              <div style={styles.popupContent} onClick={e=>e.stopPropagation()}>
                <img src={popupProduit.images[mainImageIndex]} alt="" style={styles.popupImage} />
                <div style={styles.popupSlider}>
                  {popupProduit.images?.map((img,i)=>(
                    <img key={i} src={img} alt=""
                      style={{...styles.popupSliderImage, ...(i===mainImageIndex?styles.popupSliderImageActive:{})}}
                      onClick={()=>setMainImageIndex(i)}
                    />
                  ))}
                </div>
                <p>{popupProduit.description}</p>
                <p style={{fontWeight:"bold"}}>Prix: ${popupProduit.prix}</p>
                <div style={{marginTop:"10px", display:"flex", justifyContent:"flex-end"}}>
                  <button onClick={()=>setPopupProduit(null)} style={{...styles.popupButton, ...styles.closeBtn}}>Annuler</button>
                  <button onClick={()=>handleWhatsapp(popupProduit)} style={{...styles.popupButton, ...styles.orderBtn}}>Commander</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
