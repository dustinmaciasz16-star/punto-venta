// src/pages/InventoryPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './Inventory.css';

export const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const initialFormState = {
    nombre_producto: '',
    descripcion: '',
    stock: '',
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      stock: p.stock || '',
      stock_minimo: p.stock_minimo || '5',
      stock_maximo: p.stock_maximo || '50'
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar este producto?")) {
      try {
        const res = await api.delete(`/productos/index.php?id=${id}`);
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
              name="stock"
              placeholder="Stock *"
              value={formData.stock}
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

    </div>
  );
};