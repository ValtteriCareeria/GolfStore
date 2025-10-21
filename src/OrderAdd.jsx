import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OrderService from "./services/OrderService";
import UserService from "./services/User";
import PaymentMethodService from "./services/PaymentMethod";
import DeliveryOptionService from "./services/DeliveryOptionService";
import "./OrderAdd.css"; 

const OrderAdd = ({ setMessage, setIsPositive, setShowMessage }) => {
  const navigate = useNavigate();

  const [buyers, setBuyers] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [deliveryOptions, setDeliveryOptions] = useState([]);

  const [newOrder, setNewOrder] = useState({
    buyerId: "",
    paymentMethodId: "",
    deliveryOptionId: "",
    orderDate: new Date().toISOString().slice(0, 10),
    status: "Pending",
    totalAmount: 0,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    UserService.setToken(token);
    PaymentMethodService.setToken(token);
    DeliveryOptionService.setToken(token);

    UserService.getAll().then((data) => setBuyers(data));
    PaymentMethodService.getAll().then((data) => setPaymentMethods(data));
    DeliveryOptionService.getAll().then((data) => setDeliveryOptions(data));
  }, []);

  const handleAdd = async () => {
    if (
      !newOrder.buyerId ||
      !newOrder.paymentMethodId ||
      !newOrder.deliveryOptionId
    ) {
      setMessage("Valitse ostaja, maksutapa ja toimitustapa");
      setIsPositive(false);
      setShowMessage(true);
      return;
    }
    try {
      await OrderService.create(newOrder);
      setMessage("Tilaus lisätty onnistuneesti!");
      setIsPositive(true);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
      navigate("/admin/orders");
    } catch (err) {
      console.error(err);
      setMessage("Tilausta ei voitu lisätä");
      setIsPositive(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 6000);
    }
  };

  return (
    <div className="addpage-container">
      <h2 className="addpage-title">Lisää uusi tilaus</h2>

      <form className="addpage-form">
        <div className="form-group">
          <label>Ostaja</label>
          <select
            value={newOrder.buyerId}
            onChange={(e) =>
              setNewOrder({ ...newOrder, buyerId: e.target.value })
            }
          >
            <option value="">Valitse</option>
            {buyers.map((b) => (
              <option key={b.userId} value={b.userId}>
                {b.firstName} {b.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Maksutapa</label>
          <select
            value={newOrder.paymentMethodId}
            onChange={(e) =>
              setNewOrder({ ...newOrder, paymentMethodId: e.target.value })
            }
          >
            <option value="">Valitse</option>
            {paymentMethods.map((p) => (
              <option key={p.paymentMethodId} value={p.paymentMethodId}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Toimitustapa</label>
          <select
            value={newOrder.deliveryOptionId}
            onChange={(e) =>
              setNewOrder({ ...newOrder, deliveryOptionId: e.target.value })
            }
          >
            <option value="">Valitse</option>
            {deliveryOptions.map((d) => (
              <option key={d.deliveryOptionId} value={d.deliveryOptionId}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Päivämäärä</label>
          <input
            type="date"
            value={newOrder.orderDate}
            onChange={(e) =>
              setNewOrder({ ...newOrder, orderDate: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <input
            type="text"
            value={newOrder.status}
            onChange={(e) =>
              setNewOrder({ ...newOrder, status: e.target.value })
            }
          />
        </div>

        <div className="form-group">
          <label>Summa (€)</label>
          <input
            type="number"
            step="0.01"
            value={newOrder.totalAmount}
            onChange={(e) =>
              setNewOrder({
                ...newOrder,
                totalAmount: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>

        <div className="addpage-buttons">
          <button
            type="button"
            className="addpage-btn-save"
            onClick={handleAdd}
          >
            Lisää tilaus
          </button>
          <button
            type="button"
            className="addpage-btn-cancel"
            onClick={() => navigate(-1)}
          >
            Takaisin
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderAdd;
