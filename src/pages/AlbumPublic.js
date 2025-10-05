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

  // --- fetch produits + categories + whatsapp admin
  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const q = query(collection(db, "produits"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const produitsData = [];
        snapshot.forEach((d) => produitsData.push({ id: d.id, ...d.data() }));
        setProduits(produitsData);

        const uniqueCats = [...new Set(produitsData.map((p) => p.categorie).filter(Boolean))];
        setCategories(uniqueCats);

        const adminDoc = await getDoc(doc(db, "settings", "admin"));
        if (adminDoc.exists()) setAdminWhatsapp(adminDoc.data().whatsapp || "");

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchProduits();
  }, []);

  // sous-cats calculées à partir de la sélection de catégorie
  const sousCategories = selectedCategorie
    ? [...new Set(produits.filter(p => p.categorie === selectedCategorie).map(p => p.sousCategorie).filter(Boolean))]
    : [];

  // filtrage
  const filteredProduits = produits.filter(p => {
    const matchCat = !selectedCategorie || p.categorie === selectedCategorie;
    const matchSub = !selectedSousCategorie || p.sousCategorie === selectedSousCategorie;
    return matchCat && matchSub;
  });

  // ouvrir WhatsApp pour commander
  const handleWhatsapp = (produit) => {
    const message = `Bonjour, je souhaite commander : ${produit.reference || ""} - ${produit.categorie || ""} - ${produit.sousCategorie || ""}, prix ${produit.prix || ""}$`;
    const phoneNumber = (adminWhatsapp || "").replace(/\D/g, "");
    if (!phoneNumber) return alert("Numéro admin WhatsApp non configuré.");
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
  };

  // centrage / espacement / styles et responsive via injection CSS pour garder JSX propre
  useEffect(() => {
    const css = `
      /* AlbumPublic custom styles */
      .ap-root { max-width:1000px; margin: 0 auto; padding: 4px; box-sizing: border-box; font-family: Arial, sans-serif; color:#333;}
      .ap-categories-wrap { position: sticky; top: 0; left: 0; right: 0; background:#fff; z-index:1200; padding:10px 8px; display:flex; gap:8px; align-items:center; overflow-x:auto; border-bottom: 1px solid rgba(0,0,0,0.06); }
      .ap-cat-btn { padding:8px 14px; border-radius:14px; border:1px solid #d1d5db; background:#fff; cursor:pointer; font-size:14px; white-space:nowrap; }
      .ap-cat-btn.active { background:#e7f0ff; border-color:#007bff; font-weight:600; }
      .ap-sub-wrap { margin: 8px 0 0 0; padding: 8px; overflow-x:auto; display:flex; gap:8px; align-items:center; border-bottom: 1px solid rgba(0,0,0,0.04); }
      .ap-sub-btn { padding:6px 12px; border-radius:12px; border:1px solid #e0e0e0; background:#fff; cursor:pointer; white-space:nowrap; }
      .ap-sub-btn.active { background:#e6ffed; border-color:#28a745; font-weight:600; }
      .produits-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:12px; margin-top:12px; align-items:start; }
      .produit-card { background:#fff; border-radius:10px 10px 0 0 ; overflow:hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.06); cursor:pointer; display:flex; flex-direction:column; }
      .produit-image-wrap { width:100%; aspect-ratio: 4 / 3; overflow:hidden; background:#f7f7f7; }
      .produit-image-wrap img { width:100%; height:100%; object-fit:cover; display:block; }
      .produit-info { display:flex; justify-content:space-between; align-items:center; padding:8px 10px; font-size:13px; }
      .produit-label { font-weight:600; color:#333; }
      .produit-prix { font-weight:700; color:#007bff; }
      /* popup */
      .ap-popup-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.55); display:flex; justify-content:center; align-items:center; z-index:1500; padding:12px; }
      .ap-popup { background:#fff; border-radius:12px; max-width:520px; width:100%; max-height:92vh; overflow:auto; padding:14px; box-sizing:border-box; }
      .ap-popup-main-img { width:100%; height:300px; object-fit:cover; border-radius:10px; margin-bottom:10px; }
      .ap-popup-slider { display:flex; gap:8px; overflow-x:auto; padding-bottom:6px; margin-bottom:10px; }
      .ap-popup-slider img { width:80px; height:50px; object-fit:cover; border-radius:6px; cursor:pointer; border:2px solid transparent; }
      .ap-popup-slider img.active { border-color:#007bff; }
      .ap-popup-controls { display:flex; justify-content:flex-end; gap:8px; margin-top:10px; }
      .ap-btn { padding:8px 12px; border-radius:8px; border:none; cursor:pointer; font-weight:600; }
      .ap-btn.cancel { background:#ccc; color:#222; }
      .ap-btn.order { background:#25D366; color:#fff; }
      /* responsive: mobile 2 columns and reduced gaps/margins */
      @media (max-width: 700px) {
        .produits-grid { grid-template-columns: repeat(2, 1fr); gap:6px; }
        .ap-categories-wrap { padding:8px 6px; gap:6px; }
        .ap-sub-wrap { padding: 8px 6px; margin-top:6px; }
        .ap-popup-main-img { height:220px; }
      }
    `;
    const styleEl = document.createElement("style");
    styleEl.setAttribute("data-ap-styles", "true");
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
    return () => {
      const el = document.querySelector('style[data-ap-styles="true"]');
      if (el) el.remove();
    };
  }, []);

  // reset main image index when popup produit change
  useEffect(() => {
    if (popupProduit) setMainImageIndex(0);
  }, [popupProduit]);

  return (
    <div className="ap-root">
      {loading ? (
        <p style={{ textAlign: "center", padding: 12 }}>Chargement...</p>
      ) : (
        <>
          {/* catégories sticky (plein largeur, alignées à gauche). "Toutes" réinitialise. */}
          <div className="ap-categories-wrap" role="toolbar" aria-label="Catégories">
            <button
              className={`ap-cat-btn ${selectedCategorie === null ? "active" : ""}`}
              onClick={() => { setSelectedCategorie(null); setSelectedSousCategorie(null); }}
            >
              Toutes
            </button>

            {categories.map((cat, i) => (
              <button
                key={i}
                className={`ap-cat-btn ${selectedCategorie === cat ? "active" : ""}`}
                onClick={() => {
                  // toggle catégorie
                  setSelectedCategorie(prev => prev === cat ? null : cat);
                  setSelectedSousCategorie(null);
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* sous catégories : séparées, scrollables, non sticky */}
          {selectedCategorie && sousCategories.length > 0 && (
            <div className="ap-sub-wrap" aria-label="Sous catégories">
              {sousCategories.map((sub, i) => (
                <button
                  key={i}
                  className={`ap-sub-btn ${selectedSousCategorie === sub ? "active" : ""}`}
                  onClick={() => setSelectedSousCategorie(prev => prev === sub ? null : sub)}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* grille produits */}
          <div className="produits-grid">
            {filteredProduits.map((p) => {
              // ensure images array exists
              const mainImg = (p.images && p.images.length && p.images[0]) ? p.images[0] : "https://via.placeholder.com/300x225";
              return (
                <article key={p.id} className="produit-card" onClick={() => setPopupProduit(p)} aria-label={`Produit ${p.reference || ""}`}>
                  <div className="produit-image-wrap">
                    <img src={mainImg} alt={p.sousCategorie || p.reference || "Produit"} loading="lazy" />
                  </div>
                  <div className="produit-info">
                    <span className="produit-label">{p.sousCategorie || "Sans sous-catégorie"}</span>
                    <span className="produit-prix">${p.prix}</span>
                  </div>
                </article>
              );
            })}
          </div>

          {/* popup produit */}
          {popupProduit && (
            <div className="ap-popup-overlay" onClick={() => setPopupProduit(null)}>
              <div className="ap-popup" onClick={(e) => e.stopPropagation()}>
                {/* image principale */}
                <img
                  className="ap-popup-main-img"
                  src={popupProduit.images && popupProduit.images[mainImageIndex] ? popupProduit.images[mainImageIndex] : "https://via.placeholder.com/600x400"}
                  alt=""
                />
                {/* slider miniatures */}
                <div className="ap-popup-slider">
                  {(popupProduit.images || []).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      className={i === mainImageIndex ? "active" : ""}
                      onClick={() => setMainImageIndex(i)}
                      alt={`mini-${i}`}
                      loading="lazy"
                    />
                  ))}
                </div>

                <div>
                  <p style={{ marginTop: 6 }}>{popupProduit.description}</p>
                  <p style={{ fontWeight: 700 }}>Prix: ${popupProduit.prix}</p>
                </div>

                <div className="ap-popup-controls">
                  <button className="ap-btn cancel" onClick={() => setPopupProduit(null)}>Annuler</button>
                  <button className="ap-btn order" onClick={() => handleWhatsapp(popupProduit)}>Commander</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
