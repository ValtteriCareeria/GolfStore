import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import orderService from "./services/OrderService";
import "./MyOrders.css";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        orderService.setToken(`Bearer ${token}`);
        const data = await orderService.getMyOrders(userId);
        setOrders(data);
      } catch (err) {
        console.error("Virhe tilausten haussa:", err);
      }
    };

    if (userId && token) fetchOrders();
  }, [userId, token]);

  const toggleExpand = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // Sivutus
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="myorders-wrapper">
        <h2 className="myorders-title">Omat tilaukset</h2>
        <p className="myorders-no-orders">Sinulla ei ole vielä tilauksia.</p>
        <button
          className="myorders-btn myorders-btn-back"
          onClick={() => navigate(-1)}
        >
          ← Takaisin
        </button>
      </div>
    );
  }

  return (
    <div className="myorders-wrapper">
      <div className="myorders-header">
        <h2 className="myorders-title">Omat tilaukset</h2>
        <button
          className="myorders-btn myorders-btn-back"
          onClick={() => navigate(-1)}
        >
          ← Takaisin
        </button>
      </div>

      <ul className="myorders-list">
        {currentOrders.map((order) => (
          <li key={order.orderId} className="myorders-card">
            <div
              className="myorders-summary"
              onClick={() => toggleExpand(order.orderId)}
            >
              <strong>Tilaus #{order.orderId}</strong> –{" "}
              <span className={`myorders-status ${order.status.toLowerCase()}`}>
                {order.status}
              </span>{" "}
              – {order.totalAmount} €
            </div>

            {expandedOrderId === order.orderId && (
              <div className="myorders-details">
                <h4>Toimitusosoite</h4>
                {order.address ? (
                  <p>
                    {order.address.streetAddress}, {order.address.postalCode}{" "}
                    {order.address.city}, {order.address.country}
                  </p>
                ) : (
                  <p>Ei osoitetta</p>
                )}

                <h4>Toimitustapa</h4>
                {order.deliveryOption ? (
                  <p>
                    {order.deliveryOption.name} ({order.deliveryOption.cost} €)
                  </p>
                ) : (
                  <p>Ei toimitustapaa</p>
                )}

                <h4>Maksutapa</h4>
                <p>{order.paymentMethod?.name || "Ei maksutapaa"}</p>

                <h4>Tuotteet</h4>
                <ul>
                  {order.orderItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        to={`/product/${item.productId}`}
                        className="myorders-product-link"
                      >
                        Tuote {item.productId}
                      </Link>{" "}
                      – {item.quantity} kpl – {item.priceAtPurchase} €/kpl
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="myorders-pagination">
          <button
            className="myorders-btn myorders-btn-small"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &laquo; Edellinen
          </button>
          <span className="myorders-page-info">
            Sivu {currentPage} / {totalPages}
          </span>
          <button
            className="myorders-btn myorders-btn-small"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Seuraava &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
