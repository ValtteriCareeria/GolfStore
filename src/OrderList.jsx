import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OrderService from "./services/OrderService";
import './OrderList.css'

const OrderList = ({ setMessage, setIsPositive, setShowMessage }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        OrderService.setToken(token);
        const data = await OrderService.getAll();
        setOrders(data);
        setLoading(false);
      } catch (err) {
        setError("Tilauksien haku epäonnistui.");
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(`Haluatko poistaa tilauksen ${id}?`)) return;
    try {
      await OrderService.remove(id);
      setOrders(orders.filter(o => o.orderId !== id));
      setMessage(`Tilauksen ${id} poisto onnistui.`);
      setIsPositive(true);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
    } catch (err) {
      setMessage("Tilauksen poisto epäonnistui.");
      setIsPositive(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 6000);
    }
  };

  // Sivutus
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  if (loading) return <p>Ladataan...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="orders-container">
      <h2 className="orders-title">Orders</h2>

      <div className="orders-actions">
        <button 
          onClick={() => navigate("/admin/orders/add")} 
          className="orders-btn"
        >
          ➕ Add New Order
        </button>
        <button 
          className="orders-btn-back" 
          onClick={() => navigate("/admin")}
        >
          ⬅ Takaisin
        </button>
      </div>

      <table className="orders-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Buyer</th>
            <th>Status</th>
            <th>Delivery</th>
            <th>Payment</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentOrders.map(o => (
            <tr key={o.orderId}>
              <td>{o.orderId}</td>
              <td>{o.buyer?.firstName} {o.buyer?.lastName}</td>
              <td>{o.status}</td>
              <td>{o.deliveryOption?.name}</td>
              <td>{o.paymentMethod?.name}</td>
              <td>{o.totalAmount.toFixed(2)} €</td>
              <td>
                <button 
                  className="orders-btn-edit" 
                  onClick={() => navigate(`/admin/orders/edit/${o.orderId}`)}
                >
                   Edit
                </button>
                <button 
                  className="orders-btn-delete" 
                  onClick={() => handleDelete(o.orderId)}
                >
                   Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Sivutus */}
      <div className="orders-pagination">
        <button 
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
          disabled={currentPage === 1}
        >
          ⬅ Edellinen
        </button>
        <span>Sivu {currentPage} / {totalPages}</span>
        <button 
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
          disabled={currentPage === totalPages}
        >
          Seuraava ➡
        </button>
      </div>
    </div>
  );
};

export default OrderList;
