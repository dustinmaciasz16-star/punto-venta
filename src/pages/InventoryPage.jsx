// src/pages/InventoryPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './Inventory.css';

export const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [presentations, setPresentations] = useState([]);
  const [showPresentations, setShowPresentations] = useState(false);
  const [showPresentationForm, setShowPresentationForm] = useState(false);

  const initialPresentationState = {
    nombre_presentacion: '',
    cantidad_unidades: '',
    precio_venta: ''
  };

  const [presentationForm, setPresentationForm] = useState(initialPresentationState);

  const initialFormState = {
    nombre_producto: '',
    descripcion: '',
    stock_minimo: '5',
    stock_maximo: '50'
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/productos/index.php');
      if (res.data.status === 'success') {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error("Error al cargar productos", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePresentaciones = async (product) => {
    try {
      const res = await api.get(
        `/productos/presentaciones.php?id_producto=${product.id_producto}`
      );

      if (res.data.status === 'success') {
        setSelectedProduct(product);
        setPresentations(res.data.data);
        setShowPresentations(true);
      }
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Error al cargar las presentaciones."
      );
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePresentationChange = (e) => {
    setPresentationForm({
      ...presentationForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePresentationSubmit = async (e) => {
    e.preventDefault();

    try {
      let res;

      if (editingPresentationId) {
        res = await api.put('/productos/presentaciones.php', {
          id_presentacion: editingPresentationId,
          nombre_presentacion: presentationForm.nombre_presentacion,
          cantidad_unidades: presentationForm.cantidad_unidades,
          precio_venta: presentationForm.precio_venta
        });
      } else {
        res = await api.post('/productos/presentaciones.php', {
          id_producto: selectedProduct.id_producto,
          nombre_presentacion: presentationForm.nombre_presentacion,
          cantidad_unidades: presentationForm.cantidad_unidades,
          precio_venta: presentationForm.precio_venta
        });
      }

      if (res.data.status === 'success') {
        alert(
          editingPresentationId
            ? "Presentación actualizada correctamente."
            : "Presentación guardada correctamente."
        );

        const updated = await api.get(
          `/ productos / presentaciones.php ? id_producto = ${selectedProduct.id_producto} `
        );

        setPresentations(updated.data.data);

        setPresentationForm(initialPresentationState);
        setEditingPresentationId(null);
        setShowPresentationForm(false);
      }

    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Error al guardar la presentación."
      );
    }
  };

  const handleEditPresentation = (presentation) => {
    setPresentationForm({
      nombre_presentacion: presentation.nombre_presentacion,
      cantidad_unidades: presentation.cantidad_unidades,
      precio_venta: presentation.precio_venta
    });

    setEditingPresentationId(presentation.id_presentacion);
    setShowPresentationForm(true);
  };

  const handleDeletePresentation = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta presentación?")) {
      return;
    }

    try {
      const res = await api.delete(
        `/productos/presentaciones.php?id=${id}`
      );

      if (res.data.status === 'success') {
        alert("Presentación eliminada correctamente.");

        const updated = await api.get(
          `/productos/presentaciones.php?id_producto=${selectedProduct.id_producto}`
        );

        setPresentations(updated.data.data);
      }

    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Error al eliminar la presentación."
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingId) {
        res = await api.put('/productos/index.php', { ...formData, id_producto: editingId });
      } else {
        res = await api.post('/productos/index.php', formData);
      }

      if (res.data?.status === 'success' || res.status === 200) {
        alert(editingId ? "Producto actualizado correctamente." : "Producto guardado correctamente.");
        resetForm();
        fetchProducts();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error al guardar el producto.");
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id_producto);
    setFormData({
      nombre_producto: p.nombre_producto || '',
      descripcion: p.descripcion || '',
      stock_minimo: p.stock_minimo || '5',
      stock_maximo: p.stock_maximo || '50'
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este producto?")) {
      try {
        const res = await api.delete(`/ productos / index.php ? id = ${id} `);
        if (res.data.status === 'success') {
          fetchProducts();
        }
      } catch (err) {
        alert(err.response?.data?.message || "Error al eliminar el producto.");
      }
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(initialFormState);
  };

  const filteredProducts = products.filter(p => {
    const code = (p.codigo_producto || '').toLowerCase();
    const name = (p.nombre_producto || '').toLowerCase();
    const searchTerm = search.toLowerCase();

    return code.includes(searchTerm) || name.includes(searchTerm);
  });

  return (
    <div className="main-content inventory-container">

      {/* Formulario */}
      <div className="form-card">
        <h2 className="section-title">{editingId ? '✏️ Editar Producto' : '📦 Nuevo Producto'}</h2>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <input
              type="text"
              name="nombre_producto"
              placeholder="Nombre *"
              value={formData.nombre_producto}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="number"
              min="0"
              name="stock_minimo"
              placeholder="Stock Mínimo"
              value={formData.stock_minimo}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <input
              type="number"
              min="0"
              name="stock_maximo"
              placeholder="Stock Máximo"
              value={formData.stock_maximo}
              onChange={handleChange}
            />
          </div>

          <div className="form-group form-group-full">
            <input
              type="text"
              name="descripcion"
              placeholder="Descripción opcional"
              value={formData.descripcion}
              onChange={handleChange}
            />
          </div>

          <div className="buttons-group form-group-full">
            <button type="submit" className="btn-submit">{editingId ? 'Guardar Cambios' : 'Guardar Producto'}</button>
            {editingId && <button type="button" onClick={resetForm} className="btn-warning">Cancelar</button>}
          </div>
        </form>
      </div>

      {/* Tabla con Buscador */}
      <div className="table-card">
        <div className="inventory-header-controls">
          <h2 className="section-title">📊 Catálogo de Inventario</h2>
          <input
            type="text"
            placeholder="🔍 Buscar por código o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        {loading ? (
          <p className="loading-text">Cargando inventario...</p>
        ) : (
          <div className="table-responsive">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-data">No se encontraron productos en inventario.</td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const currentStock = parseInt(p.stock || 0, 10);
                    const minStock = parseInt(p.stock_minimo || 0, 10);

                    return (
                      <tr key={p.id_producto}>
                        <td><strong>{p.codigo_producto}</strong></td>
                        <td>{p.nombre_producto}</td>
                        <td><strong>{currentStock}</strong></td>
                        <td>
                          {currentStock <= 0 ? (
                            <span className="badge badge-danger">Sin Stock</span>
                          ) : currentStock <= minStock ? (
                            <span className="badge badge-warning">Bajo Stock</span>
                          ) : (
                            <span className="badge badge-normal">Normal</span>
                          )}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="btn-action" onClick={() => handleEdit(p)} title="Editar Producto">✏️ Editar</button>
                            <button className="btn-action" onClick={() => handlePresentaciones(p)} > 📦 Presentaciones </button>
                            <button className="btn-action btn-danger-soft" onClick={() => handleDelete(p.id_producto)} title="Eliminar Producto">🗑️ Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {showPresentations && selectedProduct && (
        <div className="modal-overlay">
          <div className="presentation-modal">

            <div className="modal-header">
              <div>
                <h2>📦 Presentaciones</h2>
                <p>
                  {selectedProduct.nombre_producto} - {selectedProduct.codigo_producto}
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() => {
                  setShowPresentations(false);
                  setShowPresentationForm(false);
                }}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">

              {presentations.length === 0 ? (
                <p className="no-presentations">
                  Este producto todavía no tiene presentaciones.
                </p>
              ) : (
                <div className="presentations-list">
                  {presentations.map((presentation) => (
                    <div
                      className="presentation-item"
                      key={presentation.id_presentacion}
                    >
                      <div>
                        <strong>{presentation.nombre_presentacion}</strong>
                        <span>
                          {presentation.cantidad_unidades} unidad(es)
                        </span>
                      </div>

                      <strong>
                        ${parseFloat(presentation.precio_venta).toFixed(2)}
                      </strong>
                      <div className="presentation-actions">
                        <button className="btn-action" onClick={() => handleEditPresentation(presentation)} > ✏️ </button>
                        <button className="btn-action btn-danger-soft" onClick={() => handleDeletePresentation(presentation.id_presentacion)} > 🗑️ </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!showPresentationForm && (
                <button
                  className="btn-submit"
                  onClick={() => setShowPresentationForm(true)}
                >
                  + Agregar presentación
                </button>
              )}

              {showPresentationForm && (
                <form
                  onSubmit={handlePresentationSubmit}
                  className="presentation-form"
                >
                  <h3>
                    {editingPresentationId
                      ? 'Editar presentación'
                      : 'Nueva presentación'}
                  </h3>

                  <input
                    type="text"
                    name="nombre_presentacion"
                    placeholder="Nombre (Ej: Caja x12)"
                    value={presentationForm.nombre_presentacion}
                    onChange={handlePresentationChange}
                    required
                  />

                  <input
                    type="number"
                    name="cantidad_unidades"
                    placeholder="Cantidad de unidades"
                    min="1"
                    value={presentationForm.cantidad_unidades}
                    onChange={handlePresentationChange}
                    required
                  />

                  <input
                    type="number"
                    name="precio_venta"
                    placeholder="Precio de venta"
                    min="0"
                    step="0.01"
                    value={presentationForm.precio_venta}
                    onChange={handlePresentationChange}
                    required
                  />

                  <div className="buttons-group">
                    <button type="submit" className="btn-submit">
                      {editingPresentationId ? 'Guardar cambios' : 'Guardar'}
                    </button>

                    <button
                      type="button"
                      className="btn-warning"
                      onClick={() => {
                        setShowPresentationForm(false);
                        setPresentationForm(initialPresentationState);
                        setEditingPresentationId(null);
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};