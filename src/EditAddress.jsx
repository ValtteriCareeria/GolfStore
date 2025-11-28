import React, { useState, useEffect } from 'react';
import ProductService from './services/Product';
import BrandService from './services/BrandService';
import ModelService from './services/ModelService';
import './ProductEdit.css'
import NoAccessPopup from './NoAccessPopup';

const ProductEdit = ({
    setMuokkaustila,
    muokattavaProduct,
    setIsPositive,
    setMessage,
    setShowMessage,
    onProductUpdated
}) => {
    const [product, setProduct] = useState({ ...muokattavaProduct });
    const [hasPermission, setHasPermission] = useState(true);
    const [showPopup, setShowPopup] = useState(false);

    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [filteredModels, setFilteredModels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setProduct({
            ...muokattavaProduct,
            BrandID: muokattavaProduct.brand?.brandID || '',
            ModelID: muokattavaProduct.model?.modelID || ''
        });

        const loggedInUserId = Number(localStorage.getItem('userId'));
        const accessLevelId = Number(localStorage.getItem('accessLevelId'));

        if (loggedInUserId !== muokattavaProduct.userId && accessLevelId !== 1) {
            setHasPermission(false);
            setShowPopup(true);
        }
    }, [muokattavaProduct]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const brandData = await BrandService.getAll();
                const modelData = await ModelService.getAll();
                setBrands(brandData || []);
                setModels(modelData || []);
                setLoading(false);
            } catch (err) {
                console.error("Virhe haettaessa brandejä/malleja:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (product.BrandID) {
            const selectedBrandId = parseInt(product.BrandID);
            const filtered = models.filter(m => parseInt(m.brand?.brandID) === selectedBrandId);
            setFilteredModels(filtered);
        } else {
            setFilteredModels(models);
        }
    }, [product.BrandID, models]);

    const handleInputChange = (event) => {
        const { name, value, type } = event.target;
        
        let finalValue = value;
        if (name === 'inventoryCount') {
            // InventoryCount: sallitaan tyhjä syöte tilassa, mutta varmistetaan kokonaisluku
            finalValue = value === '' ? '' : Math.max(0, Math.floor(Number(value)));
        } else if (type === 'number') {
            // Muut numerokentät (esim. Price)
            finalValue = value === '' ? '' : Math.max(0, Number(value));
        }
        
        if (name === 'BrandID') {
            setProduct({ ...product, [name]: finalValue, ModelID: '' });
        } else {
            setProduct({ ...product, [name]: finalValue });
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!hasPermission) return;

        // TARKISTUS 1: Pakolliset merkkijonokentät
        console.log('*** START HANDLESUBMIT ***');
        console.log('Nykyinen product tila:', product);

        if (!product.title || !product.description || !product.imageUrl) {
            console.log('VALIDOINTIVIRHE: Merkkijonokenttä puuttuu.');
            setMessage('Tuotteen nimi, kuvaus ja kuvan URL ovat pakollisia.');
            setIsPositive(false);
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 5000);
            return;
        }

        // TARKISTUS 2: Hinnan validointi (> 0)
        const priceValue = Number(product.price);
        console.log('Laskettu hinta (priceValue):', priceValue);
        
        if (priceValue <= 0) {
            console.log('VALIDOINTIVIRHE: Hinta on nolla tai negatiivinen.');
            setMessage('Tuotteen hinnan on oltava suurempi kuin 0.');
            setIsPositive(false);
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 5000);
            return;
        }

        try {
            // Luo payload varmistamalla oikeat tietotyypit backendille
            const inventoryValue = Number(product.inventoryCount);

            const payload = {
                productId: product.productId, 
                             
                title: product.title.trim() || '',
                description: product.description.trim() || '',
                price: priceValue,
                imageUrl: product.imageUrl.trim() || '',
                
                inventoryCount: Number.isInteger(inventoryValue) ? Math.max(0, inventoryValue) : 0, 

                brandID: product.BrandID === '' ? null : Number(product.BrandID),
                modelID: product.ModelID === '' ? null : Number(product.ModelID)
            };

            // TÄRKEIN LOGI: Näytä lopullinen lähetettävä payload
            console.log('Lopullinen lähetettävä payload:', payload);

            await ProductService.update(payload);
            
            console.log('Päivitys onnistui.');

            onProductUpdated(payload);
            
            setMessage('Tuote päivitetty onnistuneesti!');
            setIsPositive(true);
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 5000);
            setMuokkaustila(false);
        } catch (error) {
            console.error("Update error: Koko virheobjekti:", error);
            
            // Pyri näyttämään tarkempi virhesanoma, jos se on saatavilla
            let errorMessage = 'Tuotteen päivitys epäonnistui. Tarkista syötteet.';
            if (error.response && error.response.data) {
                console.error("Backendin virhetiedot (error.response.data):", error.response.data);
                if (error.response.data.errors) {
                    errorMessage += " Tarkista seuraavat kentät: " + Object.keys(error.response.data.errors).join(', ');
                }
            }
            
            setMessage(errorMessage);
            setIsPositive(false);
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 6000);
        }
        console.log('*** END HANDLESUBMIT ***');
    };

    if (loading) {
        return <div className="editpage-loading">Ladataan tietoja...</div>;
    }

    return (
        <div className="editpage-container">
            {showPopup && (
                <NoAccessPopup
                    show={showPopup}
                    onClose={() => {
                        setShowPopup(false);
                        setMuokkaustila(false);
                    }}
                />
            )}

            {hasPermission && (
                <>
                    <h2 className="editpage-title">Muokkaa tuotetta</h2>
                    <form onSubmit={handleSubmit} className="editpage-form">
                        
                        <div className="editpage-form-group">
                            <label htmlFor="title">Tuotteen nimi</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={product.title || ''}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="editpage-form-group">
                            <label htmlFor="description">Kuvaus</label>
                            <textarea
                                id="description"
                                name="description"
                                value={product.description || ''}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="editpage-form-group">
                            <label htmlFor="price">Hinta (€)</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={product.price || ''}
                                onChange={handleInputChange}
                                step="0.01"
                                required
                            />
                        </div>

                        {/* InventoryCount-kenttä */}
                        <div className="editpage-form-group">
                            <label htmlFor="inventoryCount">Varastomäärä</label>
                            <input
                                type="number"
                                id="inventoryCount"
                                name="inventoryCount"
                                // Näytetään aina nolla tai pyöristetty kokonaisluku
                                value={Number.isInteger(product.inventoryCount) ? product.inventoryCount : 0} 
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="editpage-form-group">
                            <label htmlFor="imageUrl">Kuvan URL</label>
                            <input
                                type="text"
                                id="imageUrl"
                                name="imageUrl"
                                value={product.imageUrl || ''}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="editpage-form-group">
                            <label htmlFor="brandId">Valitse merkki</label>
                            <select
                                id="BrandID"
                                name="BrandID"
                                value={product.BrandID || ''}
                                onChange={handleInputChange}
                            >
                                <option value="">-- Valitse merkki --</option>
                                {Array.isArray(brands) && brands.map(b => (
                                    <option key={b.brandID} value={b.brandID}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="editpage-form-group">
                            <label htmlFor="modelId">Mailan malli</label>
                            <select
                                id="ModelID"
                                name="ModelID"
                                value={product.ModelID || ''}
                                onChange={handleInputChange}
                            >
                                <option value="">-- Valitse malli --</option>
                                {Array.isArray(filteredModels) && filteredModels.map(m => (
                                    <option key={m.modelID} value={m.modelID}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="editpage-buttons">
                            <button type="submit" className="editpage-btn-save"> Tallenna</button>
                            <button
                                type="button"
                                className="editpage-btn-cancel"
                                onClick={() => setMuokkaustila(false)}
                            >
                                ✖ Peruuta
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

export default ProductEdit;