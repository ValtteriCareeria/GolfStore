import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Cart.css';

const Cart = ({ cart, setCart }) => {
  const navigate = useNavigate();

  const removeItem = (productId) => {
    const updatedCart = cart.filter(item => item.productId !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const changeQuantity = (productId, quantity) => {
    const updatedCart = cart.map(item =>
      item.productId === productId ? { ...item, quantity: Number(quantity) } : item
    );
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-page">
      <h2 className="cart-title">Ostoskorisi</h2>
      {cart.length === 0 ? (
        <p className="empty-cart">Ostoskori on tyhjä.</p>
      ) : (
        <>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Tuote</th>
                <th>Hinta</th>
                <th>Määrä</th>
                <th>Yhteensä</th>
                <th>Toiminnot</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.productId} className="cart-row">
                  <td>{item.title}</td>
                  <td>{item.price.toFixed(2)} €</td>
                  <td>
                    <input
                      type="number"
                      value={item.quantity}
                      min="1"
                      className="quantity-input"
                      onChange={(e) => changeQuantity(item.productId, e.target.value)}
                    />
                  </td>
                  <td>{(item.price * item.quantity).toFixed(2)} €</td>
                  <td>
                    <button className="remove-btn" onClick={() => removeItem(item.productId)}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3"><strong>Yhteensä</strong></td>
                <td colSpan="2">{total.toFixed(2)} €</td>
              </tr>
            </tfoot>
          </table>

          <div className="cart-buttons">
            <button className="checkout-btn" onClick={() => navigate("/order")}>Siirry tilaamaan</button>
            <button className="back-btn" onClick={() => navigate(-1)}>Takaisin</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
