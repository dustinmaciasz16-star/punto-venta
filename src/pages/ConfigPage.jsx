// src/pages/ConfigPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './Inventory.css';

export const ConfigPage = () => {
  const [formData, setFormData] = useState({
    id_config: 1,
    nombre_negocio: '',
    ruc_nit: '',
    telefono: '',
    email: '',
    direccion: '',
    porcentaje_iva: '12',
    moneda: '$',
    mensaje_ticket: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/configuracion/index.php');
      if (res.data.status === 'success') {
        setFormData(res.data.data);
      }
    } catch (err) {
      console.error("Error al cargar la configuración", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await api.post('/configuracion/index.php', formData);
      if (res.data.status === 'success') {
        setMessage({ type: 'success', text: res.data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al actualizar la configuración.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content inventory-container">
      <h1 className="dashboard-header-title">⚙️ Configuración del Sistema y Negocio</h1>

      <div className="form-card">
        <h2 className="section-title">🏢 Datos de la Empresa / Establecimiento</h2>

        {message.text && (
          <div className={message.type === 'error' ? 'badge badge-danger' : 'badge badge-normal'} style={{ marginBottom: '1rem', padding: '0.6rem', display: 'block' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Nombre del Negocio *</label>
            <input 
              type="text" 
              name="nombre_negocio" 
              value={formData.nombre_negocio} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>RUC / NIT / Identificación Fiscal *</label>
            <input 
              type="text" 
              name="ruc_nit" 
              value={formData.ruc_nit} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>Teléfono de Contacto</label>
            <input 
              type="text" 
              name="telefono" 
              value={formData.telefono} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label>Correo Electrónico</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label>Porcentaje IVA / Impuesto (%)</label>
            <input 
              type="number" 
              step="0.01" 
              name="porcentaje_iva" 
              value={formData.porcentaje_iva} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label>Símbolo de Moneda</label>
            <input 
              type="text" 
              name="moneda" 
              value={formData.moneda} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group form-group-full">
            <label>Dirección Física</label>
            <input 
              type="text" 
              name="direccion" 
              value={formData.direccion} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group form-group-full">
            <label>Mensaje al pie del Ticket de Venta</label>
            <input 
              type="text" 
              name="mensaje_ticket" 
              value={formData.mensaje_ticket} 
              onChange={handleChange} 
            />
          </div>

          <button type="submit" className="btn-submit form-group-full" disabled={loading}>
            {loading ? 'Guardando...' : '💾 Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
};