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

    // Tarkista omistus & admin
    useEffect(() => {
        setProduct({
            ...muokattavaProduct,
            BrandID: muokattavaProduct.brand?.brandID || '',
            ModelID: muokattavaProduct.model?.modelID || '',
            inventoryCount: muokattavaProduct.inventoryCount
        });

        const loggedInUserId = Number(localStorage.getItem('userId'));
        const accessLevelId = Number(localStorage.getItem('accessLevelId'));

        if (loggedInUserId !== muokattavaProduct.userId && accessLevelId !== 1) {
            setHasPermission(false);
            setShowPopup(true);
        }
    }, [muokattavaProduct]);

    // Hae brändit ja mallit
    useEffect(() => {
        const fetchData = async () => {
            try {
                const brandData = await BrandService.getAll();
                const modelData = await ModelService.getAll();
                setBrands(brandData || []);
                setModels(modelData || []);
            } catch (err) {
                console.error("Virhe haettaessa brandejä/malleja:", err);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    // Suodata mallit brändin mukaan
    useEffect(() => {
        if (product.BrandID) {
            const selectedBrandId = parseInt(product.BrandID);
            const filtered = models.filter(m => parseInt(m.brand?.brandID) === selectedBrandId);
            setFilteredModels(filtered);
        } else {
            setFilteredModels(models);
        }
    }, [product.BrandID, models]);

    // Lomakkeen syötteiden muutokset
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'BrandID') {
            setProduct({ ...product, [name]: value, ModelID: '' });
        } else {
            setProduct({ ...product, [name]: value });
        }
    };

    // Lomakkeen lähetys
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!hasPermission) return;

        try {
            const payload = {
                productId: product.productId,
                userId: product.userId,
                title: product.title,
                description: product.description,
                price: product.price,
                imageUrl: product.imageUrl,
                brandID: Number(product.BrandID) || null,
                modelID: Number(product.ModelID) || null,
                inventoryCount: Number(product.inventoryCount) // ⬅ LISÄTTY
            };

            await ProductService.update(payload);

            onProductUpdated(payload);

            setMessage('Tuote päivitetty onnistuneesti!');
            setIsPositive(true);
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 5000);
            setMuokkaustila(false);
        } catch (error) {
            setMessage('Tuotteen päivitys epäonnistui.');
            setIsPositive(false);
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 6000);
            console.error(error);
        }
    };

    if (loading) {
        return <div className="editpage-loading">Ladataan tietoja...</div>;
    }

    const accessLevelId = Number(localStorage.getItem('accessLevelId'));

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
                                step="0.01"
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
                            <label htmlFor="BrandID">Valitse merkki</label>
                            <select
                                id="BrandID"
                                name="BrandID"
                                value={product.BrandID || ''}
                                onChange={handleInputChange}
                            >
                                <option value="">-- Valitse merkki --</option>
                                {brands.map(b => (
                                    <option key={b.brandID} value={b.brandID}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="editpage-form-group">
                            <label htmlFor="ModelID">Mailan malli</label>
                            <select
                                id="ModelID"
                                name="ModelID"
                                value={product.ModelID || ''}
                                onChange={handleInputChange}
                            >
                                <option value="">-- Valitse malli --</option>
                                {filteredModels.map(m => (
                                    <option key={m.modelID} value={m.modelID}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* ⭐ InventoryCount vain adminille ⭐ */}
                        {accessLevelId === 1 && (
                            <div className="editpage-form-group">
                                <label htmlFor="inventoryCount">Tuotteen näkyvyys</label>
                                <select
                                    id="inventoryCount"
                                    name="inventoryCount"
                                    value={product.inventoryCount}
                                    onChange={handleInputChange}
                                >
                                    <option value={1}>Näkyvissä (varastossa)</option>
                                    <option value={0}>Piilotettu / Loppu</option>
                                </select>
                            </div>
                        )}

                        <div className="editpage-buttons">
                            <button type="submit" className="editpage-btn-save">💾 Tallenna</button>
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
