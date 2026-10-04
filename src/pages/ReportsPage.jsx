// src/pages/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './Inventory.css';

export const ReportsPage = () => {
  const [data, setData] = useState({
    resumen: { total_ventas: 0, total_ingresos: 0 },
    topProductos: [],
    ventasRecientes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/reportes/index.php');
      if (res.data.status === 'success') {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Error al cargar reportes:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="main-content"><p>Cargando reportes...</p></div>;

  return (
    <div className="main-content inventory-container">
      <h1 className="dashboard-header-title">📈 Reportes de Ventas e Inventario</h1>

      {/* Tarjetas Superiores */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-number">${parseFloat(data.resumen.total_ingresos || 0).toFixed(2)}</div>
          <div className="metric-label">Ingresos Totales</div>
        </div>

        <div className="metric-card">
          <div className="metric-number">{data.resumen.total_ventas}</div>
          <div className="metric-label">Ventas Realizadas</div>
        </div>
      </div>

      {/* Tabla 1: Top Productos Más Vendidos */}
      <div className="table-card">
        <h2 className="section-title">🏆 Top 5 Productos Más Vendidos</h2>
        <div className="table-responsive">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Unidades Vendidas</th>
                <th>Total Generado</th>
              </tr>
            </thead>
            <tbody>
              {data.topProductos.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center' }}>Aún no hay ventas registradas.</td></tr>
              ) : (
                data.topProductos.map((p, idx) => (
                  <tr key={idx}>
                    <td><strong>{p.nombre_producto}</strong></td>
                    <td>{p.total_vendido} u.</td>
                    <td>${parseFloat(p.total_generado).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabla 2: Ventas por Día */}
      <div className="table-card">
        <h2 className="section-title">📅 Historial de Ventas Recientes</h2>
        <div className="table-responsive">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>N° de Ventas</th>
                <th>Total del Día</th>
              </tr>
            </thead>
            <tbody>
              {data.ventasRecientes.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center' }}>Sin movimientos recientes.</td></tr>
              ) : (
                data.ventasRecientes.map((v, idx) => (
                  <tr key={idx}>
                    <td>{v.fecha_dia}</td>
                    <td>{v.cantidad_ventas}</td>
                    <td><strong>${parseFloat(v.total_dia).toFixed(2)}</strong></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};