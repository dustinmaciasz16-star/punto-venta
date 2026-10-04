// src/pages/DashboardHome.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export const DashboardHome = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    totalProductos: 0,
    totalMovimientos: 0,
    sinStock: 0,
    stockBajo: 0
  });
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/stats.php');
      if (response.data.status === 'success') {
        setMetrics({
          totalProductos: response.data.data.totalProductos,
          totalMovimientos: response.data.data.totalMovimientos,
          sinStock: response.data.data.sinStock,
          stockBajo: response.data.data.stockBajo
        });
        setProductos(response.data.data.productos || []);
      }
    } catch (error) {
      console.error("Error al cargar métricas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="main-content">
      <h1 className="dashboard-header-title">Dashboard General</h1>

      {/* Grilla de Métricas en Tiempo Real */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-number">{loading ? '...' : metrics.totalProductos}</div>
          <div className="metric-label">Total Productos</div>
        </div>

        <div className="metric-card">
          <div className="metric-number">{loading ? '...' : metrics.totalMovimientos}</div>
          <div className="metric-label">Total Movimientos</div>
        </div>

        <div className="metric-card">
          <div className="metric-number" style={{ color: metrics.sinStock > 0 ? '#e11d48' : '#2b7a9b' }}>
            {loading ? '...' : metrics.sinStock}
          </div>
          <div className="metric-label">Sin Stock</div>
        </div>

        <div className="metric-card">
          <div className="metric-number" style={{ color: metrics.stockBajo > 0 ? '#d97706' : '#2b7a9b' }}>
            {loading ? '...' : metrics.stockBajo}
          </div>
          <div className="metric-label">Stock Bajo</div>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="action-card">
        <h3>Alertas de Stock</h3>
        <div className="buttons-group">
          <button className="btn-primary" onClick={fetchStats} disabled={loading}>
            {loading ? 'Cargando...' : 'Actualizar Dashboard'}
          </button>
          <button className="btn-warning" onClick={() => navigate('/dashboard/inventario')}>
            Ver Alertas de Stock
          </button>
        </div>
      </div>

      {/* Tabla de Productos Recientes / Resumen de Inventario */}
      <div className="table-card" style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>📦 Resumen de Productos en Inventario</h3>
          <button className="btn-secondary" onClick={() => navigate('/dashboard/inventario')}>
            Ver Todo el Inventario ➔
          </button>
        </div>

        {loading ? (
          <p className="loading-text">Cargando productos...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio Venta</th>
                <th>Stock</th>
                <th>Estado Stock</th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">No hay productos para mostrar.</td>
                </tr>
              ) : (
                productos.map((prod) => {
                  let badgeClass = "status-badge pagada";
                  let badgeText = "Normal";

                  if (prod.stock === 0) {
                    badgeClass = "status-badge anulada";
                    badgeText = "Agotado";
                  } else if (prod.stock <= prod.stock_minimo) {
                    badgeClass = "status-badge pendiente";
                    badgeText = "Bajo Stock";
                  }

                  return (
                    <tr key={prod.id_producto}>
                      <td><strong>{prod.codigo_producto}</strong></td>
                      <td>{prod.nombre_producto}</td>
                      <td>{prod.nombre_categoria || 'Sin Categoría'}</td>
                      <td className="amount">${parseFloat(prod.precio_venta).toFixed(2)}</td>
                      <td><strong>{prod.stock}</strong></td>
                      <td>
                        <span className={badgeClass}>{badgeText}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};