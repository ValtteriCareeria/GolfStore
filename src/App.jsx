import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import ProductList from './ProductList';
import Login from './Login';
import UserList from './UserList';
import AdminDashboard from './AdminDashboard';
import PaymentMethodList from './PaymentMethodList';
import DeliveryOptionList from './DeliveryOptionList';
import DeliveryOptionAdd from './DeliveryOptionAdd';
import DeliveryOptionEdit from './DeliveryOptionEdit';
import OrderList from './OrderList';
import OrderAdd from './OrderAdd';
import OrderEdit from './OrderEdit';
import BrandManagement from './BrandManagement';
import ModelManagement from './ModelManagement';
import Cart from "./Cart";
import CartAdd from "./CartAdd";
import MyOrders from "./MyOrders";
import MyProducts from './MyProducts';
import ProductDetails from './ProductDetails';
import Register from './Register';
import UserProfile from './UserProfile';
import HomePage from './HomePage';
import CartSidebar from './CartSidebar';
import Privacy from "./Privacy";
import Terms from "./Terms";
import Contact from "./Contact";
import DeliveryInfo from './DeliveryInfo';
import ChangePassword from "./ChangePassword";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavLink } from 'react-router-dom';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Message from './Message'; // Oletus, että Message.jsx on olemassa
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import { SiVisa, SiMastercard, SiAmericanexpress, SiPaypal } from 'react-icons/si';
import './Footer.css';


function App() {
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [message, setMessage] = useState('');
    const [isPositive, setIsPositive] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [cartQuantity, setCartQuantity] = useState(0);
    const [cart, setCart] = useState(() => {
        const storedCart = localStorage.getItem("cart");
        return storedCart ? JSON.parse(storedCart) : [];
    });

    // Taustan gradientit
    const gradients = [
        'linear-gradient(135deg, #4b3658, #0f2027, #0f2027)',
        'linear-gradient(135deg, #0f2027, #4b3658, #0f2027)',
        'linear-gradient(135deg, #0f2027, #0f2027, #4b3658)',
        'linear-gradient(135deg, #640606ff, #0f2027, #0f2027)',
        'linear-gradient(135deg, #0f2027, #640606ff, #0f2027)',
        'linear-gradient(135deg, #0f2027, #0f2027, #640606ff)',
        'linear-gradient(135deg, #ff5f6d, #0f2027, #0f2027)',
        'linear-gradient(135deg, #0f2027, #ff5f6d, #0f2027)',
        'linear-gradient(135deg, #0f2027, #0f2027, #ff5f6d)',
        'linear-gradient(135deg, #ffc371, #0f2027, #0f2027)',
        'linear-gradient(135deg, #0f2027, #ffc371, #0f2027)',
        'linear-gradient(135deg, #0f2027, #0f2027, #ffc371)'
        
        
    ];
    const [bgIndex, setBgIndex] = useState(0);

    // Taustan vaihtuva efekti
    useEffect(() => {
        const interval = setInterval(() => {
            setBgIndex(prev => (prev + 1) % gradients.length);
        }, 10000); 
        return () => clearInterval(interval);
    }, []);

    // Päivitetään bodyn tausta
    useEffect(() => {
        document.body.style.background = gradients[bgIndex];
        document.body.style.transition = 'background 1s ease';
    }, [bgIndex]);

    // Kirjautumisen hallinta
    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setLoggedInUser(storedUsername);
        }
    }, []);

    useEffect(() => {
        const storedCart = localStorage.getItem("cart");
        if (storedCart) setCart(JSON.parse(storedCart));
    }, []);

    useEffect(() => {
        setCartQuantity(cart.reduce((sum, item) => sum + item.quantity, 0));
    }, [cart]);

    // Logout-napin tapahtumankäsittelijä
    const logout = () => {
    const confirmLogout = window.confirm("Haluatko varmasti kirjautua ulos?");
    if (confirmLogout) {
        localStorage.clear();
        setLoggedInUser(null);
    }
};
const Footer = () => {
  return (
    <footer className="footer-gradient">
      <div className="footer-top container">
        {/* Kaupan tiedot */}
        <div className="footer-section">
          <h4>GolfStore</h4>
          <p>Osoite: Esimerkkikatu 1, 00100 Helsinki</p>
          <p>Sähköposti: info@golfstore.fi</p>
          <p>Puhelin: +358 40 123 4567</p>
        </div>

        {/* Linkit */}
        <div className="footer-section">
          <h4>Tietoa</h4>
          <ul className="footer-links">
            <li><a href="/privacy">Tietosuojaseloste</a></li>
            <li><a href="/terms">Käyttöehdot</a></li>
            <li><a href="/contact">Ota yhteyttä</a></li>
            <li><a href="/delivery">Toimitustiedot</a></li>
          </ul>
        </div>

        {/* Sosiaalinen media */}
        <div className="footer-section">
          <h4>Seuraa meitä</h4>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-btn facebook">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-btn instagram">
              <FaInstagram />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-btn twitter">
              <FaTwitter />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-btn linkedin">
              <FaLinkedinIn />
            </a>
          </div>
        </div>

        {/* Maksukortit */}
        <div className="footer-section">
          <h4>Hyväksytyt maksutavat</h4>
          <div className="payment-icons">
            <SiVisa className="payment-btn" />
            <SiMastercard className="payment-btn" />
            <SiAmericanexpress className="payment-btn" />
            <SiPaypal className="payment-btn" />
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 GolfStore. Kaikki oikeudet pidätetään.</p>
      </div>
    </footer>
  );
};
    

    const isAdmin = localStorage.getItem("accessLevelId") === "1";

    return (
        <Router>
            <div className="App d-flex flex-column min-vh-100">
              <div className="background-container">
                    {gradients.map((g, i) => (
                        <div
                            key={i}
                            className={`background-layer ${i === bgIndex ? 'active' : ''}`}
                            style={{ background: g }}
                        />
                    ))}
                    {/* Liikkuva valoefekti */}
                   <div className="particles">
      {Array.from({ length: 50 }).map((_, i) => {
        const startX = Math.random();
        const startY = Math.random();
        const endX = Math.random();
        const endY = Math.random();
        const duration = 5 + Math.random() * 10;

        return (
          <div
            key={i}
            className="particle"
            style={{
              '--rand-x': startX,
              '--rand-y': startY,
              '--rand-x-end': endX,
              '--rand-y-end': endY,
              animationDuration: `${duration}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        );
      })}
    </div>
  </div>
                {/* Navigointipalkki näkyy aina */}
                <Navbar expand="lg" className="shadow navbar-custom">
                    <div className="container-fluid">
                        <Navbar.Brand as={NavLink} to="/">GolfStore</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ms-auto">
                            <Nav.Link as={NavLink} to="/" end>Etusivu</Nav.Link>
                            <Nav.Link as={NavLink} to="/products" end>Tuotteet</Nav.Link>
                            <Nav.Link as={NavLink} to="/register">Rekisteröidy</Nav.Link>
                            {loggedInUser && <Nav.Link as={NavLink} to="/profile">Profiili</Nav.Link>}
                            {isAdmin && <>
                            <Nav.Link as={NavLink} to="/users">Users</Nav.Link>
                            <Nav.Link as={NavLink} to="/admin">Admin</Nav.Link>
                            </>}
                            {!loggedInUser ? <Nav.Link as={NavLink} to="/login">Kirjaudu</Nav.Link> 
                            : <Nav.Link onClick={logout}>Kirjaudu Ulos</Nav.Link>}
                            <CartSidebar cart={cart} setCart={setCart} />
                        </Nav>
                        </Navbar.Collapse>
                    </div>
                    </Navbar>

                <main className="flex-grow-1 p-4">
                    <div className="container mt-4">
                        {/* Näytetään viestikomponentti, jos showMessage on true */}
                        {showMessage && <Message message={message} isPositive={isPositive} />}
                        
                        {/* Renderoidaan reitit */}
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/products" element={<ProductList cart={cart} setCart={setCart} setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} />} />
                            <Route path="/login" element={<Login setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} setLoggedInUser={setLoggedInUser} />} />
                            <Route path="/cart" element={<Cart cart={cart} setCart={setCart} />} />
                            
                            <Route path="/order" element={<CartAdd cart={cart} setCart={setCart} />} />
                            <Route path="/myorders" element={<MyOrders />} />
                            <Route path="/product/:id" element={<ProductDetails cart={cart} setCart={setCart} setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} />} />
                            <Route path="/products/:id" element={<ProductDetails cart={cart} setCart={setCart} setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} />} />
                            <Route path="/myproducts" element={<MyProducts setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} />} />
                            <Route path="/register" element={<Register setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} />} />
                            <Route path="/profile" element={<UserProfile />} />
                            <Route path="/privacy" element={<Privacy />} />
                            <Route path="/terms" element={<Terms />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/delivery" element={<DeliveryInfo />} />
                            <Route path="/changepassword" element={<ChangePassword setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} />} />


                            {/* Users only for admin */}
                            <Route path="/users" element={isAdmin ? <UserList setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} /> : <Navigate to="/login" replace />} />

                            {/* Admin dashboard */}
                            <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/login" replace />} />

                            {/* Admin subpages */}
                            <Route path="/admin/paymentmethods" element={isAdmin ? <PaymentMethodList setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} /> : <Navigate to="/login" replace />} />                     
                            <Route path="/admin/orders" element={isAdmin ? <OrderList setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} /> : <Navigate to="/login" replace />} />
                            <Route path="/admin/orders/add" element={isAdmin ? <OrderAdd setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} /> : <Navigate to="/login" replace />} />
                            <Route path="/admin/orders/edit/:id" element={isAdmin ? <OrderEdit setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} /> : <Navigate to="/login" replace />} />
                            <Route path="/admin/deliveryoptions" element={isAdmin ? <DeliveryOptionList setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} /> : <Navigate to="/login" replace />} /> 
                            <Route path="/admin/deliveryoptions/add" element={isAdmin ? <DeliveryOptionAdd setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} /> : <Navigate to="/login" replace />} />
                            <Route path="/admin/deliveryoptions/edit/:id" element={isAdmin ? <DeliveryOptionEdit setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} /> : <Navigate to="/login" replace />} />
                            <Route path="/admin/brands" element={isAdmin ? <BrandManagement setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} /> : <Navigate to="/login" replace />} /> 
                            <Route path="/admin/models" element={isAdmin ? <ModelManagement setMessage={setMessage} setIsPositive={setIsPositive} setShowMessage={setShowMessage} /> : <Navigate to="/login" replace />} /> 
                        </Routes>
                    </div>
                </main>
                <Footer />

            </div>
        </Router>
        
    );
}

export default App;
