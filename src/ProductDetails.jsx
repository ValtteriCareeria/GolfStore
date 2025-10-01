import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productService from "./services/Product";
import "./ProductDetails.css";

const ProductDetails = ({ cart, setCart, setMessage, setIsPositive, setShowMessage }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getById(id);
        setProduct(data);
      } catch (err) {
        console.error("Virhe tuotteen haussa:", err);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.productId);
    let newCart;
    if (existingItem) {
      newCart = cart.map(item =>
        item.productId === product.productId ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    setMessage(`Tuote '${product.title}' lisätty ostoskoriin.`);
    setIsPositive(true);
    setShowMessage(true);
  };

  if (!product) return <p className="productdetails-loading">Ladataan tuotetta...</p>;

  return (
    <div className="productdetails-wrapper">
      <div className="productdetails-card">
        {/* Kuva vasemmalle */}
        <div className="productdetails-image-section">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.title} className="productdetails-image" />
          ) : (
            <div className="productdetails-image-placeholder">Ei kuvaa</div>
          )}
        </div>

        {/* Tiedot oikealle */}
        <div className="productdetails-info">
          <h1 className="productdetails-title">{product.title}</h1>
          <p className="productdetails-description">{product.description}</p>

          <p className="productdetails-price">{product.price} €</p>

          <p><strong>Merkki:</strong> {product.brandName || "Ei asetettu"}</p>
          <p><strong>Malli:</strong> {product.modelName || "Ei asetettu"}</p>

          <p><strong>Julkaisupäivä:</strong> {new Date(product.listingDate).toLocaleDateString()}</p>
          <p><strong>Tuotteen ID:</strong> {product.productId}</p>

          <div className="productdetails-buttons">
            <button className="productdetails-btn" onClick={() => addToCart(product)}>
              Lisää ostoskoriin
            </button>
            <button className="productdetails-btn productdetails-btn-back" onClick={() => navigate(-1)}>
              Takaisin
            </button>
          </div>
        </div>
      </div>

      {/* Myyjän tiedot erillisenä korttina */}
      {product.seller && (
        <div className="productdetails-seller-card">
          <h3>Myyjän tiedot</h3>
          <p><strong>Nimi:</strong> {product.seller.firstName} {product.seller.lastName}</p>
          <p><strong>Email:</strong> {product.seller.email}</p>
          <p><strong>Puhelin:</strong> {product.seller.phoneNumber}</p>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
