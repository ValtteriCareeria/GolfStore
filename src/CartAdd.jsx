import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import paymentMethodService from "./services/PaymentMethod";
import deliveryOptionService from "./services/DeliveryOptionService";
import orderService from "./services/OrderService";
import addressService from "./services/AddressService";
import "./CartAdd.css";

const CartAdd = ({ cart, setCart, setMessage, setIsPositive, setShowMessage }) => {
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [deliveryOptionId, setDeliveryOptionId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      paymentMethodService.setToken(token);
      deliveryOptionService.setToken(token);
    }

    const fetchOptions = async () => {
      try {
        const deliveries = await deliveryOptionService.getAll();
        setDeliveryOptions(deliveries);

        const payments = await paymentMethodService.getAll();
        setPaymentMethods(payments);
      } catch (err) {
        console.error("Virhe vaihtoehtojen latauksessa", err);
      }
    };

    fetchOptions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const userId = parseInt(localStorage.getItem("userId"));
    orderService.setToken(token);
    addressService.setToken(token);

    try {
      const addressData = { userId, streetAddress, city, postalCode, country, isDefault: false };
      const addressResponse = await addressService.create(addressData);
      const addressId = addressResponse.addressId || addressResponse.data?.addressId;
      if (!addressId) throw new Error("Osoitteen luonti epäonnistui");

      const selectedDelivery = deliveryOptions.find(d => d.deliveryOptionId === parseInt(deliveryOptionId));
      const deliveryCost = selectedDelivery ? selectedDelivery.cost : 0;
      const itemsTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const totalAmount = itemsTotal + deliveryCost;

      const orderData = {
        buyerId: userId,
        paymentMethodId: parseInt(paymentMethodId),
        deliveryOptionId: parseInt(deliveryOptionId),
        addressId,
        orderDate: new Date().toISOString(),
        status: "Pending",
        totalAmount,
        orderItems: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.price
        }))
      };

      await orderService.create(orderData);
      setCart([]);
      localStorage.removeItem("cart");

      setMessage?.("Tilaus onnistui!");
      setIsPositive?.(true);
      setShowMessage?.(true);

      navigate("/myorders");
    } catch (err) {
      console.error("Virhe tilauksen luonnissa:", err.response?.data || err);
      setMessage?.("Virhe tilauksen luonnissa");
      setIsPositive?.(false);
      setShowMessage?.(true);
    }
  };

  if (!cart || cart.length === 0) return <p>Ostoskori on tyhjä.</p>;

  return (
    <div className="cartadd-container">
      <h2 className="cartadd-title">Tee tilaus</h2>
      <div className="cartadd-grid">
        {/* Ostoskori */}
        <div className="cart-summary">
          <h3>Ostoskori</h3>
          <ul>
            {cart.map(item => (
              <li key={item.productId}>
                {item.title} - {item.quantity} kpl - {item.price.toFixed(2)} €/kpl
              </li>
            ))}
          </ul>
          {(() => {
            const itemsTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const selectedDelivery = deliveryOptions.find(d => d.deliveryOptionId === parseInt(deliveryOptionId));
            const deliveryCost = selectedDelivery ? selectedDelivery.cost : 0;
            const totalAmount = itemsTotal + deliveryCost;
            return (
              <p className="cart-total">
                <strong>Yhteensä:</strong> {itemsTotal.toFixed(2)} € + toimitus {deliveryCost} € = {totalAmount.toFixed(2)} €
              </p>
            );
          })()}
        </div>

        {/* Tilaustiedot */}
        <form className="order-form" onSubmit={handleSubmit}>
          <h3>Osoitetiedot</h3>
          <input type="text" placeholder="Katuosoite" value={streetAddress} onChange={e => setStreetAddress(e.target.value)} required />
          <input type="text" placeholder="Kaupunki" value={city} onChange={e => setCity(e.target.value)} required />
          <input type="text" placeholder="Postinumero" value={postalCode} onChange={e => setPostalCode(e.target.value)} required />
          <input type="text" placeholder="Maa" value={country} onChange={e => setCountry(e.target.value)} required />

          <h3>Toimitustapa</h3>
          <select value={deliveryOptionId} onChange={e => setDeliveryOptionId(e.target.value)} required>
            <option value="">Valitse toimitustapa</option>
            {deliveryOptions.map(d => (
              <option key={d.deliveryOptionId} value={d.deliveryOptionId}>{d.name} - {d.cost} €</option>
            ))}
          </select>

          <h3>Maksutapa</h3>
          <select value={paymentMethodId} onChange={e => setPaymentMethodId(e.target.value)} required>
            <option value="">Valitse maksutapa</option>
            {paymentMethods.map(p => (
              <option key={p.paymentMethodId} value={p.paymentMethodId}>{p.name}</option>
            ))}
          </select>

          <button type="submit" className="submit-btn">Vahvista tilaus</button>
          <button type="button" className="back-btn" onClick={() => navigate(-1)}>Takaisin</button>
        </form>
      </div>
    </div>
  );
};

export default CartAdd;
