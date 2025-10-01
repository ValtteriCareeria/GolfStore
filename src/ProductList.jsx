import React, { useState, useEffect } from 'react';
import ProductService from './services/Product';
import BrandService from './services/BrandService';
import ModelService from './services/ModelService';
import ProductAdd from './ProductAdd';
import ProductEdit from './ProductEdit';
import { useNavigate } from "react-router-dom";
import './ProductList.css';

const ProductList = ({ cart, setCart, setMessage, setIsPositive, setShowMessage }) => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);

  const [lisäystila, setLisäystila] = useState(false);
  const [muokkaustila, setMuokkaustila] = useState(false);
  const [muokattavaProduct, setMuokattavaProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [priceSort, setPriceSort] = useState("");
  const [reload, setReload] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);

  const loggedInUserId = parseInt(localStorage.getItem("userId"));
  const accessLevelId = parseInt(localStorage.getItem("accessLevelId"));
  const navigate = useNavigate();

  // Hae tuotteet
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token');
        ProductService.setToken(token);
        const data = await ProductService.getAll();
        setProducts(data);
      } catch (err) {
        console.error(err);
        setMessage('Tuotteiden lataaminen epäonnistui.');
        setIsPositive(false);
        setShowMessage(true);
      }
    };
    fetchProducts();
  }, [lisäystila, muokkaustila, reload]);

  // Hae brandit ja mallit dropdowniin
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const brandData = await BrandService.getAll();
        setBrands(brandData);

        const modelData = await ModelService.getAll();
        setModels(modelData);
      } catch (err) {
        console.error("Virhe haettaessa brandejä/malleja:", err);
      }
    };
    fetchFilters();
  }, []);

  // Suodatus ja järjestys
  useEffect(() => {
    let filtered = [...products];

    if (search) {
      filtered = filtered.filter(p =>
        p.title?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (brandFilter) {
      filtered = filtered.filter(p => p.brand?.brandID === parseInt(brandFilter));
    }
    if (modelFilter) {
      filtered = filtered.filter(p => p.model?.modelID === parseInt(modelFilter));
    }
    if (priceSort === "asc") filtered.sort((a, b) => a.price - b.price);
    if (priceSort === "desc") filtered.sort((a, b) => b.price - a.price);

    setFilteredProducts(filtered);
    setVisibleCount(8);
  }, [products, search, brandFilter, modelFilter, priceSort]);

  const handleAddNewClick = () => setLisäystila(true);
  const handleEditClick = (product) => { setMuokattavaProduct(product); setMuokkaustila(true); };

  const deleteProduct = (product) => {
    if (!(product.userId === loggedInUserId || accessLevelId === 1)) return;
    if (window.confirm(`Poista tuote ${product.title}?`)) {
      ProductService.remove(product.productId)
        .then(() => {
          setMessage(`Tuote ${product.title} poistettu onnistuneesti.`);
          setIsPositive(true);
          setShowMessage(true);
          setReload(!reload);
        })
        .catch(err => {
          setMessage(`Poisto epäonnistui: ${err.message}`);
          setIsPositive(false);
          setShowMessage(true);
        });
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.productId);
    const newCart = existingItem
      ? cart.map(item => item.productId === product.productId ? { ...item, quantity: item.quantity + 1 } : item)
      : [...cart, { ...product, quantity: 1 }];

    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    setMessage(`Tuote '${product.title}' lisätty ostoskoriin.`);
    setIsPositive(true);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 2000);
  };

  const clearFilters = () => {
    setSearch(""); setBrandFilter(""); setModelFilter(""); setPriceSort(""); setVisibleCount(8);
  };

  return (
    <div >
      <div className="product-top-bar">
        <h1>Products</h1>
        {!lisäystila && !muokkaustila && (
          <>
            <input placeholder="Etsi Nimellä" value={search} onChange={e => setSearch(e.target.value)} />

            <select value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
              <option value="">Kaikki merkit</option>
              {brands.map(b => <option key={b.brandID} value={b.brandID}>{b.name}</option>)}
            </select>

            <select value={modelFilter} onChange={e => setModelFilter(e.target.value)}>
              <option value="">Kaikki mallit</option>
              {models.map(m => <option key={m.modelID} value={m.modelID}>{m.name}</option>)}
            </select>

            <select value={priceSort} onChange={e => setPriceSort(e.target.value)}>
              <option value="">Järjestä hinnan mukaan</option>
              <option value="asc">Pienin ensin</option>
              <option value="desc">Suurin ensin</option>
            </select>

            <button className="myproducts-btn" onClick={clearFilters}>Clear filters</button>
            <button className="myproducts-btn" onClick={handleAddNewClick}>Lisää uusi</button>
          </>
        )}
      </div>

      {lisäystila ? (
        <ProductAdd
          setLisäystila={setLisäystila}
          setIsPositive={setIsPositive}
          setMessage={setMessage}
          setShowMessage={setShowMessage}
          onProductAdded={(newProduct) => setProducts([newProduct, ...products])}
        />
      ) : muokkaustila ? (
        <ProductEdit
          setMuokkaustila={setMuokkaustila}
          muokattavaProduct={muokattavaProduct}
          setIsPositive={setIsPositive}
          setMessage={setMessage}
          setShowMessage={setShowMessage}
          onProductUpdated={(updatedProduct) => setProducts(products.map(p => p.productId === updatedProduct.productId ? updatedProduct : p))}
        />
      ) : (
        <div className="row">
          {filteredProducts.length > 0 ? (
            filteredProducts.slice(0, visibleCount).map(p => (
              <div key={p.productId} className="col-12 col-md-6 col-lg-3 mb-4">
                <div className="product-item">
                  <div className="product-image">
                    {p.imageUrl 
                      ? <img src={p.imageUrl} alt={p.title} /> 
                      : <div className="placeholder-icon">📦</div>}
                  </div>
                  <h3 onClick={() => navigate(`/products/${p.productId}`)} style={{ cursor: "pointer" }}>{p.title}</h3>
                  <p><strong>Merkki:</strong> {p.brand?.name || '-'}</p>
                  <p><strong>Malli:</strong> {p.model?.name || '-'}</p>
                  <p><strong>Hinta:</strong> {p.price} €</p>
                  
                  {p.seller && <div className="seller-info">
                    <p><strong>Myyjä:</strong> {p.seller.firstName} {p.seller.lastName}</p>
                  </div>}
                  <div className="myproducts-buttons">
                    <button className="myproducts-btn" onClick={() => navigate(`/products/${p.productId}`)}>Lisätietoja</button>
                    <button className="myproducts-btn" onClick={() => addToCart(p)}>Lisää ostoskoriin</button>
                    {(p.userId === loggedInUserId || accessLevelId === 1) && (
                      <>
                        <button className="myproducts-btn" onClick={() => handleEditClick(p)}>Muokkaa</button>
                        <button className="myproducts-btn myproducts-btn-danger" onClick={() => deleteProduct(p)}>Poista</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : <p>Tuotteita ei löytynyt.</p>}
          
          {!lisäystila && !muokkaustila && filteredProducts.length > visibleCount && (
            <div className="load-more">
              <button className="myproducts-btn" onClick={() => setVisibleCount(prev => prev + 8)}>Lataa lisää</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;
