import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [accessLevelId, setAccessLevelId] = useState(null);

  useEffect(() => {
    const storedAccessLevelId = localStorage.getItem("accessLevelId");
    if (storedAccessLevelId) {
      setAccessLevelId(parseInt(storedAccessLevelId, 10));
    }
  }, []);

  if (accessLevelId !== 1) {
    return (
      <div className="admin-noaccess">
        <h2>Access denied</h2>
        <p>Sinulla ei ole oikeuksia tähän sivuun.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1 className="admin-title">Admin Dashboard</h1>

      <div className="admin-cards">
        <div className="admin-card">
          <h2>Payment Methods</h2>
          <p>Hallinnoi maksutapoja (lisää, poista, muokkaa)</p>
          <button onClick={() => navigate("/admin/paymentmethods")} className="admin-btn">
            Hallinnoi
          </button>
        </div>

        <div className="admin-card">
          <h2>Orders</h2>
          <p>Katso kaikki tilaukset ja hallinnoi niitä</p>
          <button onClick={() => navigate("/admin/orders")} className="admin-btn">
            Hallinnoi
          </button>
        </div>

        <div className="admin-card">
          <h2>Delivery Options</h2>
          <p>Hallinnoi toimitustapoja</p>
          <button onClick={() => navigate("/admin/deliveryoptions")} className="admin-btn">
            Hallinnoi
          </button>
        </div>

        <div className="admin-card">
          <h2>Brands</h2>
          <p>Hallinnoi mailamerkkejä (lisää, poista)</p>
          <button onClick={() => navigate("/admin/brands")} className="admin-btn">
            Hallinnoi
          </button>
        </div>
        
        <div className="admin-card">
          <h2>Models</h2>
          <p>Hallinnoi mailamalleja (lisää, poista, muokkaa)</p>
          <button onClick={() => navigate("/admin/models")} className="admin-btn">
            Hallinnoi
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
