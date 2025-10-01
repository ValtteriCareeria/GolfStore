import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import OrderService from "./services/OrderService";
import UserService from "./services/User";
import DeliveryOptionService from "./services/DeliveryOptionService";
import PaymentMethodService from "./services/PaymentMethod";

const OrderEdit = ({ setMessage, setIsPositive, setShowMessage }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [buyers, setBuyers] = useState([]);
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Hae dropdown-tiedot
    UserService.setToken(token);
    UserService.getAll().then(setBuyers);

    DeliveryOptionService.setToken(token);
    DeliveryOptionService.getAll().then(setDeliveryOptions);

    PaymentMethodService.setToken(token);
    PaymentMethodService.getAll().then(setPaymentMethods);

    // Hae muokattava tilaus
    OrderService.setToken(token);
    OrderService.getById(id)
      .then(data => {
        setOrder({
          buyerId: data.buyerId,
          status: data.status,
          deliveryOptionId: data.deliveryOptionId,
          paymentMethodId: data.paymentMethodId,
          totalAmount: data.totalAmount
        });
        setLoading(false);
      })
      .catch(err => {
        setMessage("Tilauksen haku epäonnistui");
        setIsPositive(false);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 6000);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrder({ ...order, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      OrderService.setToken(token);
      await OrderService.update(id, {
        ...order,
        totalAmount: parseFloat(order.totalAmount)
      });
      setMessage("Tilauksen muokkaus onnistui.");
      setIsPositive(true);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
      navigate("/admin/orders");
    } catch (err) {
      setMessage("Tilauksen muokkaus epäonnistui.");
      setIsPositive(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 6000);
    }
  };

  if (loading) return <p>Ladataan tilaus...</p>;
  if (!order) return <p>Tilausta ei löytynyt</p>;

  return (
    <div className="order-edit-container">
      <h2>Edit Order</h2>
      <form onSubmit={handleSubmit} className="edit-form">
        <label>Buyer</label>
        <select name="buyerId" value={order.buyerId} onChange={handleChange} required>
          <option value="">Select buyer</option>
          {buyers.map(b => (
            <option key={b.userId} value={b.userId}>{b.firstName} {b.lastName}</option>
          ))}
        </select>

        <label>Status</label>
        <input type="text" name="status" value={order.status} onChange={handleChange} required />

        <label>Delivery Option</label>
        <select name="deliveryOptionId" value={order.deliveryOptionId} onChange={handleChange} required>
          <option value="">Select delivery option</option>
          {deliveryOptions.map(d => (
            <option key={d.deliveryOptionId} value={d.deliveryOptionId}>{d.name} ({d.cost.toFixed(2)}€)</option>
          ))}
        </select>

        <label>Payment Method</label>
        <select name="paymentMethodId" value={order.paymentMethodId} onChange={handleChange} required>
          <option value="">Select payment method</option>
          {paymentMethods.map(p => (
            <option key={p.paymentMethodId} value={p.paymentMethodId}>{p.name}</option>
          ))}
        </select>

        <label>Total Amount</label>
        <input type="number" name="totalAmount" value={order.totalAmount} onChange={handleChange} step="0.01" required />

        <div className="edit-buttons">
          <button type="submit" className="btn-save">Save Changes</button>
          <button type="button" className="btn-cancel" onClick={() => navigate("/admin/orders")}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default OrderEdit;
