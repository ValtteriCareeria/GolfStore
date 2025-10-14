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

  // useEffect: Tilausten haku käyttäjän ID:n perusteella
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Asetetaan todennus-token palveluun
        orderService.setToken(`Bearer ${token}`);
        // Haetaan kaikki käyttäjän tilaukset
        const data = await orderService.getMyOrders(userId);
        setOrders(data);
      } catch (err) {
        // Virheen käsittely tilausten latauksessa
        console.error("Virhe tilausten haussa:", err);
      }
    };

    // Suoritetaan haku vain, jos käyttäjä on tunnistettu ja token löytyy
    if (userId && token) fetchOrders();
  }, [userId, token]);

  // Käsittelijä tilauskortin avaamiseen/sulkemiseen
  const toggleExpand = (orderId) => {
    // Jos sama tilaus on jo auki, suljetaan se (null), muuten avataan se
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // **Sivutuslogiikka**
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  // Leikataan nykyisen sivun tilaukset näytettäväksi
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  // Lasketaan kokonaissivumäärä
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  // Käsittelijä sivun vaihtamiselle
  const handlePageChange = (pageNumber) => {
    // Varmistetaan, että sivunumero on sallitulla alueella
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Ehdollinen renderöinti: Näytä viesti, jos tilauksia ei ole
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

  // Päärenderöinti: Tilauslista ja sivutus
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
        {/* Iteroidaan ja renderöidään nykyisen sivun tilaukset */}
        {currentOrders.map((order) => (
          <li key={order.orderId} className="myorders-card">
            <div
              className="myorders-summary"
              // Tilauskortin otsikko toimii avaamis-/sulkevipainikkeena
              onClick={() => toggleExpand(order.orderId)}
            >
              <strong>Tilaus #{order.orderId}</strong> –{" "}
              <span className={`myorders-status ${order.status.toLowerCase()}`}>
                {order.status}
              </span>{" "}
              – {order.totalAmount} €
            </div>

            {/* Näytetään lisätiedot vain, jos tilaus on laajennettu */}
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
                  {/* Iteroidaan ja renderöidään tilausrivit */}
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

      {/* Sivutuskomponentti näkyy vain, jos sivuja on enemmän kuin yksi */}
      {totalPages > 1 && (
        <div className="myorders-pagination">
          <button
            className="myorders-btn myorders-btn-small"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1} // Poista käytöstä, jos olemme ensimmäisellä sivulla
          >
            &laquo; Edellinen
          </button>
          <span className="myorders-page-info">
            Sivu {currentPage} / {totalPages}
          </span>
          <button
            className="myorders-btn myorders-btn-small"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages} // Poista käytöstä, jos olemme viimeisellä sivulla
          >
            Seuraava &raquo;
          </button>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
