// src/pages/FacturasPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './Facturas.css';

export const FacturasPage = () => {
  const [facturas, setFacturas] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacturas();
  }, []);

  const fetchFacturas = async () => {
    try {
      const res = await api.get('/facturas/index.php');
      if (res.data.status === 'success') {
        setFacturas(res.data.data);
      }
    } catch (err) {
      console.error("Error al cargar historial de facturas", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id_factura) => {
    try {
      const res = await api.get(`/facturas/index.php?id_factura=${id_factura}`);
      if (res.data.status === 'success') {
        setSelectedInvoice(res.data.factura);
        setInvoiceDetails(res.data.detalles);
        setModalOpen(true);
      }
    } catch (err) {
      alert("Error al cargar los detalles de la factura.");
    }
  };

  const handleAnularFactura = async (id_factura, numero_factura) => {
    const confirmacion = window.confirm(
      `¿Está seguro de que desea anular la factura N° ${numero_factura}?\nEsta acción devolverá los productos al inventario.`
    );

    if (!confirmacion) return;

    try {
      const res = await api.post('/facturas/anular.php', { id_factura });
      if (res.data.status === 'success') {
        alert("Factura anulada con éxito.");
        fetchFacturas();
        if (selectedInvoice && selectedInvoice.id_factura === id_factura) {
          setModalOpen(false);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error al anular la factura.");
    }
  };

  const filteredFacturas = facturas.filter(f =>
    (f.numero_factura && f.numero_factura.toLowerCase().includes(search.toLowerCase())) ||
    (f.cliente && f.cliente.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h2>🧾 Historial de Ventas</h2>
          <p className="subtitle">Consulta todas las facturas y comprobantes emitidos.</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="table-controls">
        <input 
          type="text" 
          placeholder="🔍 Buscar por Nº Factura o Cliente..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Tabla de Facturas */}
      <div className="table-card">
        {loading ? (
          <p className="loading-text">Cargando ventas...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº Factura</th>
                <th>Fecha y Hora</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredFacturas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">No se encontraron ventas registradas.</td>
                </tr>
              ) : (
                filteredFacturas.map((f) => (
                  <tr key={f.id_factura} className={f.estado === 'anulada' ? 'row-anulada' : ''}>
                    <td><strong>{f.numero_factura}</strong></td>
                    <td>{new Date(f.fecha).toLocaleString()}</td>
                    <td>{f.cliente || 'Consumidor Final'}</td>
                    <td>
                      <span className={`status-badge ${f.estado}`}>
                        {(f.estado || 'pagada').toUpperCase()}
                      </span>
                    </td>
                    <td className="amount">${parseFloat(f.total || 0).toFixed(2)}</td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn-action"
                          onClick={() => handleViewDetails(f.id_factura)}
                          title="Ver Detalle"
                        >
                          👁️ Ver Detalle
                        </button>
                        {f.estado !== 'anulada' && (
                          <button 
                            className="btn-action btn-danger-soft"
                            onClick={() => handleAnularFactura(f.id_factura, f.numero_factura)}
                            title="Anular Factura"
                          >
                            🚫 Anular
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Detalle de Factura */}
      {modalOpen && selectedInvoice && (
        <div className="modal-overlay">
          <div className="modal-container invoice-modal printable-area">
            <div className="modal-header">
              <h3>Detalle de Comprobante: {selectedInvoice.numero_factura}</h3>
              <button className="btn-close no-print" onClick={() => setModalOpen(false)}>×</button>
            </div>

            <div className="invoice-info-grid">
              <div><strong>Cliente:</strong> {selectedInvoice.nombre_cliente || 'Consumidor Final'}</div>
              <div><strong>Cédula/RUC:</strong> {selectedInvoice.cedula_cliente || 'N/A'}</div>
              <div><strong>Fecha:</strong> {new Date(selectedInvoice.fecha).toLocaleString()}</div>
              <div><strong>Vendedor:</strong> {selectedInvoice.vendedor || 'Sistema'}</div>
              <div>
                <strong>Estado:</strong>{' '}
                <span className={`status-badge ${selectedInvoice.estado}`}>
                  {(selectedInvoice.estado || 'pagada').toUpperCase()}
                </span>
              </div>
            </div>

            <table className="modal-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Cant.</th>
                  <th>P. Unit.</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {invoiceDetails.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.codigo_producto || '-'}</td>
                    <td>{item.descripcion}</td>
                    <td>{item.cantidad}</td>
                    <td>${parseFloat(item.precio_unitario || 0).toFixed(2)}</td>
                    <td>${parseFloat(item.subtotal || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="invoice-totals">
              <div className="total-row"><span>Subtotal:</span> <span>${parseFloat(selectedInvoice.subtotal || 0).toFixed(2)}</span></div>
              <div className="total-row"><span>IVA (12%):</span> <span>${parseFloat(selectedInvoice.impuesto || 0).toFixed(2)}</span></div>
              <div className="total-row grand-total"><span>Total Venta:</span> <span>${parseFloat(selectedInvoice.total || 0).toFixed(2)}</span></div>
            </div>

            <div className="modal-footer no-print">
              {selectedInvoice.estado !== 'anulada' && (
                <button 
                  className="btn-danger-outline" 
                  onClick={() => handleAnularFactura(selectedInvoice.id_factura, selectedInvoice.numero_factura)}
                >
                  🚫 Anular Factura
                </button>
              )}
              <button className="btn-secondary" onClick={() => window.print()}>🖨️ Imprimir</button>
              <button className="btn-primary" onClick={() => setModalOpen(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};