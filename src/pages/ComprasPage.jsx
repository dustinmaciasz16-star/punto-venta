// src/pages/ComprasPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export const ComprasPage = () => {
  const [compras, setCompras] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Formulario de Compra
  const [selectedProveedor, setSelectedProveedor] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [precioCosto, setPrecioCosto] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [resCompras, resProds] = await Promise.all([
        api.get('/compras/index.php'),
        api.get('/productos/index.php')
      ]);

      if (resCompras.data.status === 'success') {
        setCompras(resCompras.data.compras);
        setProveedores(resCompras.data.proveedores);
      }
      if (resProds.data.status === 'success') {
        setProductos(resProds.data.data);
      }
    } catch (err) {
      console.error("Error al cargar datos de compras", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!selectedProducto || !precioCosto || cantidad <= 0) {
      alert("Selecciona un producto, precio de costo y cantidad válida.");
      return;
    }

    const prodObj = productos.find(p => p.id_producto === parseInt(selectedProducto));
    if (!prodObj) return;

    setCart([
      ...cart,
      {
        id_producto: prodObj.id_producto,
        nombre_producto: prodObj.nombre_producto,
        cantidad: parseInt(cantidad),
        precio_unitario: parseFloat(precioCosto)
      }
    ]);

    setSelectedProducto('');
    setCantidad(1);
    setPrecioCosto('');
  };

  const handleRemoveItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);
  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.12;
  const total = subtotal + tax;

  const handleSubmitCompra = async (e) => {
    e.preventDefault();
    if (!selectedProveedor) return alert("Selecciona un proveedor.");
    if (cart.length === 0) return alert("Agrega al menos un producto a la compra.");

    try {
      const res = await api.post('/compras/index.php', {
        id_proveedor: selectedProveedor,
        items: cart,
        subtotal,
        impuesto: tax,
        total,
        id_usuario: 1
      });

      if (res.data.status === 'success') {
        alert(`¡Compra registrada! Nº ${res.data.numero_compra}`);
        setModalOpen(false);
        setCart([]);
        setSelectedProveedor('');
        loadInitialData();
      }
    } catch (err) {
      alert("Error al registrar la compra.");
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h2>🛍️ Registro y Reabastecimiento de Compras</h2>
          <p className="subtitle">Ingresa mercadería a tu almacén aumentando el stock automáticamente.</p>
        </div>
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          ➕ Registrar Nueva Compra
        </button>
      </div>

      {/* Tabla de Historial de Compras */}
      <div className="table-card">
        {loading ? (
          <p className="loading-text">Cargando compras...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº Compra</th>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>Estado</th>
                <th>Total Invertido</th>
              </tr>
            </thead>
            <tbody>
              {compras.length === 0 ? (
                <tr><td colSpan="5" className="no-data">No se han registrado compras.</td></tr>
              ) : (
                compras.map((c) => (
                  <tr key={c.id_compra}>
                    <td><strong>{c.numero_compra}</strong></td>
                    <td>{new Date(c.fecha).toLocaleString()}</td>
                    <td>{c.proveedor}</td>
                    <td><span className="status-badge pagada">{c.estado.toUpperCase()}</span></td>
                    <td className="amount">${parseFloat(c.total).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Nueva Compra */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-container" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>Ingresar Entrada de Stock (Compra)</h3>
              <button className="btn-close" onClick={() => setModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSubmitCompra} className="modal-form">
              <div className="form-group">
                <label>Proveedor *</label>
                <select value={selectedProveedor} onChange={(e) => setSelectedProveedor(e.target.value)} required>
                  <option value="">-- Seleccionar Proveedor --</option>
                  {proveedores.map(p => (
                    <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>
                  ))}
                </select>
              </div>

              {/* Agregar producto al detalle */}
              <div className="form-row" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Producto</label>
                  <select value={selectedProducto} onChange={(e) => setSelectedProducto(e.target.value)}>
                    <option value="">-- Seleccionar --</option>
                    {productos.map(p => (
                      <option key={p.id_producto} value={p.id_producto}>{p.nombre_producto} (Stock actual: {p.stock})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Precio Costo ($)</label>
                  <input type="number" step="0.01" value={precioCosto} onChange={(e) => setPrecioCosto(e.target.value)} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Cant.</label>
                  <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} min="1" />
                </div>
                <button type="button" className="btn-secondary" onClick={handleAddItem} style={{ marginTop: 'auto' }}>
                  Agregar
                </button>
              </div>

              {/* Items agregados */}
              <table className="modal-table" style={{ marginTop: '1rem' }}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>P. Costo</th>
                    <th>Subtotal</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>Agrega productos a la lista.</td></tr>
                  ) : (
                    cart.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.nombre_producto}</td>
                        <td>{item.cantidad}</td>
                        <td>${item.precio_unitario.toFixed(2)}</td>
                        <td>${(item.precio_unitario * item.cantidad).toFixed(2)}</td>
                        <td><button type="button" className="btn-remove" onClick={() => handleRemoveItem(idx)}>🗑️</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="invoice-totals">
                <div className="total-row"><span>Total + IVA:</span> <strong>${total.toFixed(2)}</strong></div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={cart.length === 0}>Guardar Entrada de Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};