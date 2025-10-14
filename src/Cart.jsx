import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './Cart.css';

// Cart-komponentti näyttää ostoskorin sisällön ja mahdollistaa muutokset.
// Se saa propsina ostoskorin tilan (cart) ja sen päivitysfunktion (setCart).
const Cart = ({ cart, setCart }) => {
  const navigate = useNavigate();

  // removeItem: Poistaa tuotteen ostoskorista productId:n perusteella.
  const removeItem = (productId) => {
    // Luodaan uusi kori, joka sisältää vain ne tuotteet, joiden ID ei ole poistettavan tuotteen ID.
    const updatedCart = cart.filter(item => item.productId !== productId);
    
    // Päivitetään Reactin tila ja localStorage synkronoidusti.
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // changeQuantity: Muuttaa tietyn tuotteen määrää ostoskorissa.
  const changeQuantity = (productId, quantity) => {
    // Käydään läpi kori ja päivitetään tuote, jonka ID täsmää.
    const updatedCart = cart.map(item =>
      item.productId === productId 
      // Jos ID täsmää, luodaan uusi objekti uudella määrällä.
      ? { ...item, quantity: Number(quantity) } 
      // Muuten palautetaan tuote muuttumattomana.
      : item
    );
    
    // Päivitetään Reactin tila ja localStorage.
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Lasketaan ostoskorin kokonaissumma (tuotteen hinta * määrä).
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-page">
      <h2 className="cart-title">Ostoskorisi</h2>
      {/* Tarkistetaan, onko ostoskori tyhjä */}
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
              {/* Iteroidaan ostoskorin tuotteet ja näytetään ne taulukon riveinä */}
              {cart.map(item => (
                <tr key={item.productId} className="cart-row">
                  <td>{item.title}</td>
                  <td>{item.price.toFixed(2)} €</td>
                  <td>
                    {/* Määrän muutoskenttä, joka kutsuu changeQuantity-funktiota */}
                    <input
                      type="number"
                      value={item.quantity}
                      min="1"
                      className="quantity-input"
                      onChange={(e) => changeQuantity(item.productId, e.target.value)}
                    />
                  </td>
                  {/* Lasketaan rivikohtainen summa */}
                  <td>{(item.price * item.quantity).toFixed(2)} €</td>
                  <td>
                    {/* Poistonappi, joka kutsuu removeItem-funktiota */}
                    <button className="remove-btn" onClick={() => removeItem(item.productId)}>×</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3"><strong>Yhteensä</strong></td>
                {/* Näytetään koko korin kokonaissumma */}
                <td colSpan="2">{total.toFixed(2)} €</td>
              </tr>
            </tfoot>
          </table>

          <div className="cart-buttons">
            {/* Siirtyminen tilausprosessiin */}
            <button className="checkout-btn" onClick={() => navigate("/order")}>Siirry tilaamaan</button>
            {/* Navigointi takaisin edelliselle sivulle */}
            <button className="back-btn" onClick={() => navigate(-1)}>Takaisin</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
