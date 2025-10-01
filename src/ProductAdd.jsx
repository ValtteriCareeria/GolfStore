import React, { useState, useEffect } from 'react';
import ProductService from './services/Product';
import BrandService from './services/BrandService'; 
import ModelService from './services/ModelService'; 
import './ProductAdd.css';

const ProductAdd = ({ setLisäystila, setIsPositive, setMessage, setShowMessage, onProductAdded }) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [brandId, setBrandId] = useState('');
  const [modelId, setModelId] = useState('');
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);

  const loggedInUserId = parseInt(localStorage.getItem('userId'));

  // Hae brandit ja mallit
  useEffect(() => {
    const fetchData = async () => {
      try {
        const brandData = await BrandService.getAll();
        const modelData = await ModelService.getAll();
        setBrands(brandData || []);
        setModels(modelData || []);
      } catch (err) {
        console.error("Virhe haettaessa tietoja:", err);
      }
    };
    fetchData();
  }, []);

  // Suodata mallit valitun merkin perusteella
  const filteredModels = models.filter(m => m.brand?.brandID === parseInt(brandId));
 

  const handleBrandChange = (e) => {
    setBrandId(e.target.value);
    setModelId(''); // Nollaa malli, kun merkki vaihtuu
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!loggedInUserId) {
      setMessage('Et ole kirjautunut sisään.');
      setIsPositive(false);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 5000);
      return;
    }

    const newProduct = {
      userId: loggedInUserId,
      title: newTitle,
      description: newDescription,
      price: parseFloat(newPrice),
      imageUrl: newImageUrl,
      listingDate: new Date().toISOString(),      
      brandId: brandId ? parseInt(brandId) : null,
      modelId: modelId ? parseInt(modelId) : null
    };

    ProductService.create(newProduct)
      .then(response => {
        const createdProduct = response.data;
        setMessage(`Lisättiin uusi tuote: ${createdProduct.title}`);
        setIsPositive(true);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 5000);

        if (typeof onProductAdded === 'function') {
          onProductAdded(createdProduct);
        }
        setLisäystila(false);

        setNewTitle('');
        setNewDescription('');
        setNewPrice('');
        setNewImageUrl('');      
        setBrandId('');
        setModelId('');
      })
      .catch(error => {
        setMessage(error.message || 'Tuotteen lisäys epäonnistui.');
        setIsPositive(false);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 6000);
      });
  };

  return (
    <div className="addpage-container">
      <h2 className="addpage-title">Lisää uusi tuote</h2>
      <form onSubmit={handleSubmit} className="addpage-form">
        <input type="text" placeholder="Tuotteen nimi" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
        <textarea placeholder="Kuvaus" value={newDescription} onChange={e => setNewDescription(e.target.value)} />
        <input type="number" placeholder="Hinta (€)" step="0.01" value={newPrice} onChange={e => setNewPrice(e.target.value)} required />
        <input type="text" placeholder="Kuvan URL" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} />

        <select value={brandId} onChange={handleBrandChange}>
          <option value="">Valitse merkki</option>
          {brands.map(b => <option key={b.brandID} value={b.brandID}>{b.name}</option>)}
        </select>

        <select value={modelId} onChange={e => setModelId(e.target.value)}>
          <option value="">Valitse malli</option>
          {filteredModels.map(m => <option key={m.modelID} value={m.modelID}>{m.name}</option>)}
        </select>

        <div className="addpage-buttons">
          <button type="submit" className="addpage-btn-save">Tallenna</button>
          <button type="button" className="addpage-btn-cancel" onClick={() => setLisäystila(false)}>Peruuta</button>
        </div>
      </form>
    </div>
  );
};

export default ProductAdd;
