// src/pages/ClientesPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './Cliente.css';

export const ClientesPage = () => {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    nombre: '',
    apellido: '',
    tipo_documento: 'CEDULA',
    num_documento: '',
    telefono: '',
    email: '',
    direccion: '',
    tipo_cliente: 'FINAL'
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      const res = await api.get('/clientes/index.php');
      if (res.data.status === 'success') {
        setClientes(res.data.data);
      }
    } catch (err) {
      console.error("Error al obtener clientes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenModal = (cliente = null) => {
    if (cliente) {
      setEditingId(cliente.id_cliente);
      setFormData({
        nombre: cliente.nombre || '',
        apellido: cliente.apellido || '',
        tipo_documento: cliente.tipo_documento || 'CEDULA',
        num_documento: cliente.num_documento || '',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        direccion: cliente.direccion || '',
        tipo_cliente: cliente.tipo_cliente || 'FINAL'
      });
    } else {
      setEditingId(null);
      setFormData(initialFormState);
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (editingId) {
        res = await api.put('/clientes/index.php', { ...formData, id_cliente: editingId });
      } else {
        res = await api.post('/clientes/index.php', formData);
      }

      if (res.data.status === 'success') {
        alert(editingId ? "Cliente actualizado exitosamente." : "Cliente registrado exitosamente.");
        setModalOpen(false);
        setFormData(initialFormState);
        setEditingId(null);
        fetchClientes();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error al procesar la solicitud del cliente.");
    }
  };

  const handleToggleEstado = async (id_cliente, estadoActual) => {
    const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
    try {
      const res = await api.put('/clientes/estado.php', { id_cliente, estado: nuevoEstado });
      if (res.data.status === 'success') {
        fetchClientes();
      }
    } catch (err) {
      alert("Error al cambiar el estado del cliente.");
    }
  };

  const filteredClientes = clientes.filter(c => {
    const fullName = `${c.nombre || ''} ${c.apellido || ''}`.toLowerCase();
    const doc = (c.num_documento || '').toLowerCase();
    const code = (c.codigo_cliente || '').toLowerCase();
    const searchTerm = search.toLowerCase();

    return fullName.includes(searchTerm) || doc.includes(searchTerm) || code.includes(searchTerm);
  });

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h2>👥 Gestión de Clientes</h2>
          <p className="subtitle">Administra los clientes y sus datos para facturación.</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          ➕ Nuevo Cliente
        </button>
      </div>

      {/* Buscador */}
      <div className="table-controls">
        <input 
          type="text" 
          placeholder="🔍 Buscar por nombre, cédula/RUC o código..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Tabla de Clientes */}
      <div className="table-card">
        {loading ? (
          <p className="loading-text">Cargando lista de clientes...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre / Razón Social</th>
                <th>Documento</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">No se encontraron clientes registradas.</td>
                </tr>
              ) : (
                filteredClientes.map((c) => (
                  <tr key={c.id_cliente} className={c.estado === 'inactivo' ? 'row-inactiva' : ''}>
                    <td><strong>{c.codigo_cliente}</strong></td>
                    <td>{c.nombre} {c.apellido}</td>
                    <td><small className="doc-label">{c.tipo_documento}:</small> {c.num_documento}</td>
                    <td>{c.telefono || '-'}</td>
                    <td>{c.email || '-'}</td>
                    <td><span className="category-tag">{c.tipo_cliente}</span></td>
                    <td>
                      <span className={`status-badge ${c.estado}`}>
                        {(c.estado || 'activo').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="btn-action" 
                          onClick={() => handleOpenModal(c)}
                          title="Editar Cliente"
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          className={`btn-action ${c.estado === 'activo' ? 'btn-danger-soft' : 'btn-success-soft'}`}
                          onClick={() => handleToggleEstado(c.id_cliente, c.estado)}
                          title={c.estado === 'activo' ? 'Desactivar' : 'Activar'}
                        >
                          {c.estado === 'activo' ? '🚫' : '✅'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal para Crear / Editar Cliente */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{editingId ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}</h3>
              <button className="btn-close" onClick={() => setModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo Documento *</label>
                  <select name="tipo_documento" value={formData.tipo_documento} onChange={handleInputChange}>
                    <option value="CEDULA">Cédula</option>
                    <option value="RUC">RUC</option>
                    <option value="PASAPORTE">Pasaporte</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Nº Documento *</label>
                  <input type="text" name="num_documento" value={formData.num_documento} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nombre / Razón Social *</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Apellido</label>
                  <input type="text" name="apellido" value={formData.apellido} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono</label>
                  <input type="text" name="telefono" value={formData.telefono} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Correo Electrónico</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tipo de Cliente</label>
                  <select name="tipo_cliente" value={formData.tipo_cliente} onChange={handleInputChange}>
                    <option value="FINAL">Consumidor Final</option>
                    <option value="FRECUENTE">Frecuente</option>
                    <option value="VIP">VIP</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Dirección</label>
                  <input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">{editingId ? 'Guardar Cambios' : 'Guardar Cliente'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};