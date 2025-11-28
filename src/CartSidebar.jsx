import { useState, useEffect } from "react";
import { Offcanvas } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";
import './CartSidebar.css';

const CartSidebar = ({ cart, setCart }) => {
  const [show, setShow] = useState(false);
  const [animateBadge, setAnimateBadge] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Poista tuote
  const removeItem = (productId) => {
    const updatedCart = cart.filter(item => item.productId !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // Lasketaan yhteishinta ja tuotteiden määrä
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const cartCount = cart.length;

  useEffect(() => {
    if (cartCount > 0) {
      setAnimateBadge(true);
      const timer = setTimeout(() => setAnimateBadge(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  return (
    <>
      {/* Ostoskori-ikoni */}
      <button className="mycart-toggle" onClick={handleShow}>
        <FaShoppingCart size={24} />
        {cartCount > 0 && (
          <span className={`mycart-badge ${animateBadge ? 'animate' : ''}`}>
            {cartCount}
          </span>
        )}
      </button>

      {/* Offcanvas */}
      <Offcanvas show={show} onHide={handleClose} placement="end" className="mycart-offcanvas">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="mycart-title">Ostoskori</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {cart.length === 0 ? (
            <p className="mycart-empty">Ostoskori on tyhjä.</p>
          ) : (
            <>
              <ul className="mycart-list">
                {cart.map((item) => (
                  <li key={item.productId} className="mycart-item">
                    <div className="mycart-item-info">
                      <strong>{item.title}</strong>
                      <span>{item.price.toFixed(2)} €</span>
                    </div>
                    <button className="mycart-remove" onClick={() => removeItem(item.productId)}>×</button>
                  </li>
                ))}
              </ul>

              <h5 className="mycart-total">Yhteensä: {total.toFixed(2)} €</h5>

              <button
                className="mycart-btn"
                onClick={() => {
                  handleClose();
                  navigate("/cart");
                }}
              >
                Näytä koko ostoskori
              </button>

              <button
                className="mycart-btn mycart-order-btn"
                onClick={() => {
                  handleClose();
                  navigate("/order");
                }}
              >
                Siirry tilaamaan
              </button>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default CartSidebar;
