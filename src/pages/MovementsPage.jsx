import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './Inventory.css';

export const MovementsPage = () => {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [formData, setFormData] = useState({
    id_producto: '',
    tipo_movimiento: 'ENTRADA',
    cantidad: '',
    motivo: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchMovements();
  }, []);

  const fetchProducts = async () => {
    const res = await api.get('/productos/index.php');
    if (res.data.status === 'success') setProducts(res.data.data);
  };

  const fetchMovements = async () => {
    const res = await api.get('/movimientos/index.php');
    if (res.data.status === 'success') setMovements(res.data.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post('/movimientos/index.php', {
        ...formData,
        cantidad: Number(formData.cantidad)
      });

      if (res.data.status === 'success') {
        alert(res.data.message);

        setFormData({
          id_producto: '',
          tipo_movimiento: 'ENTRADA',
          cantidad: '',
          motivo: ''
        });

        fetchProducts();
        fetchMovements();
      } else {
        alert(res.data.message);
      }

    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Error al registrar movimiento"
      );
    }
  };

  return (
    <div className="main-content inventory-container">
      {/* Formulario */}
      <div className="form-card">
        <h2 className="section-title">📋 Registrar Movimiento de Stock</h2>
        <form onSubmit={handleSubmit} className="product-form">
          <select
            name="id_producto"
            value={formData.id_producto}
            onChange={(e) => setFormData({ ...formData, id_producto: e.target.value })}
            required
            style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          >
            <option value="">Selecciona un Producto *</option>
            {products.map(p => (
              <option key={p.id_producto} value={p.id_producto}>
                {p.nombre_producto} (Stock: {p.stock})
              </option>
            ))}
          </select>

          <select
            name="tipo_movimiento"
            value={formData.tipo_movimiento}
            onChange={(e) => setFormData({ ...formData, tipo_movimiento: e.target.value })}
            style={{ padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          >
            <option value="ENTRADA">ENTRADA (Ajuste)</option>
            <option value="SALIDA">SALIDA (Ajuste / Merma)</option>
          </select>

          <input
            type="number"
            min="1"
            step="1"
            placeholder="Cantidad *"
            value={formData.cantidad}
            onChange={(e) =>
              setFormData({
                ...formData,
                cantidad: e.target.value
              })
            }
            required
          />

          <input
            type="text"
            placeholder="Motivo (Ej. Compra factura #123, Producto dañado)"
            value={formData.motivo}
            onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
            className="form-group-full"
          />

          <button type="submit" className="btn-submit form-group-full">Registrar Movimiento</button>
        </form>
      </div>

      {/* Historial */}
      <div className="table-card">
        <h2 className="section-title">📜 Historial de Movimientos</h2>
        <div className="table-responsive">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Stock resultante</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {movements.map(m => (
                <tr key={m.id_movimiento}>
                  <td>{new Date(m.fecha).toLocaleString()}</td>
                  <td><strong>{m.nombre_producto}</strong></td>
                  <td>
                    <span className={`badge ${m.tipo_movimiento === 'ENTRADA' ? 'badge-normal' : 'badge-danger'}`}>
                      {m.tipo_movimiento}
                    </span>
                  </td>
                  <td>{m.cantidad}</td>
                  <td> <strong>{m.stock_resultante}</strong> </td>
                  <td>{m.motivo || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};