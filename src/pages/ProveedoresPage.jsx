// src/pages/ProveedoresPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './Proveedor.css';

export const ProveedoresPage = () => {
  const [proveedores, setProveedores] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    direccion: ''
  });

  useEffect(() => {
    fetchProveedores();
  }, []);

  const fetchProveedores = async () => {
    try {
      const res = await api.get('/proveedores/index.php');
      if (res.data.status === 'success') {
        setProveedores(res.data.data);
      }
    } catch (err) {
      console.error("Error al cargar proveedores", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNewProveedor = () => {
    setEditingId(null);

    setFormData({
      cedula: '',
      nombre: '',
      apellido: '',
      telefono: '',
      correo: '',
      direccion: ''
    });

    setModalOpen(true);
  };

  const handleEdit = (proveedor) => {
    setEditingId(proveedor.id_proveedor);

    setFormData({
      cedula: proveedor.cedula || '',
      nombre: proveedor.nombre || '',
      apellido: proveedor.apellido || '',
      telefono: proveedor.telefono || '',
      correo: proveedor.correo || '',
      direccion: proveedor.direccion || ''
    });

    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      let res;

      if (editingId === null) {

        // Crear proveedor
        res = await api.post('/proveedores/index.php', formData);

      } else {

        // Editar proveedor
        res = await api.put('/proveedores/index.php', {
          id_proveedor: editingId,
          ...formData
        });
      }

      if (res.data.status === 'success') {

        alert(res.data.message);

        setModalOpen(false);

        setEditingId(null);

        setFormData({
          cedula: '',
          nombre: '',
          apellido: '',
          telefono: '',
          correo: '',
          direccion: ''
        });

        fetchProveedores();
      }

    } catch (err) {

      console.error("Error:", err);

      alert(
        err.response?.data?.message ||
        "Error al guardar el proveedor."
      );
    }
  };

  const handleDelete = async (idProveedor) => {

    const confirmar = window.confirm(
      "¿Seguro que deseas desactivar este proveedor?"
    );

    if (!confirmar) {
      return;
    }

    try {

      const res = await api.delete('/proveedores/index.php', {
        data: {
          id_proveedor: idProveedor
        }
      });

      if (res.data.status === 'success') {

        alert(res.data.message);

        fetchProveedores();
      }

    } catch (err) {

      console.error("Error:", err);

      alert(
        err.response?.data?.message ||
        "Error al desactivar el proveedor."
      );
    }
  };



  const filteredProveedores = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.cedula.includes(search) ||
    p.codigo_proveedor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h2>🚚 Gestión de Proveedores</h2>
          <p className="subtitle">Administra a tus distribuidores de productos y suministros.</p>
        </div>
        <button className="btn-primary" onClick={handleNewProveedor}>
          ➕ Nuevo Proveedor
        </button>
      </div>

      <div className="table-controls">
        <input
          type="text"
          placeholder="🔍 Buscar por RUC/Cédula, Razón Social o Código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-card">
        {loading ? (
          <p className="loading-text">Cargando proveedores...</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Razón Social / Nombre</th>
                <th>RUC / Cédula</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Dirección</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProveedores.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">No se encontraron proveedores.</td>
                </tr>
              ) : (
                filteredProveedores.map((p) => (
                  <tr key={p.id_proveedor}>
                    <td><strong>{p.codigo_proveedor}</strong></td>
                    <td>{p.nombre} {p.apellido}</td>
                    <td>{p.cedula}</td>
                    <td>{p.telefono || '-'}</td>
                    <td>{p.correo || '-'}</td>
                    <td>{p.direccion || '-'}</td>
                    <td>
                      <span className={`status-badge ${p.estado}`}>
                        {p.estado.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-secondary"
                        onClick={() => handleEdit(p)}
                      >
                        ✏️
                      </button>

                      {p.estado === 'activo' && (
                        <button
                          className="btn-danger"
                          onClick={() => handleDelete(p.id_proveedor)}
                        >
                          🗑️
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Nuevo Proveedor */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>
                {editingId === null
                  ? 'Registrar Proveedor'
                  : 'Editar Proveedor'}
              </h3>
              <button className="btn-close" onClick={() => setModalOpen(false)}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>RUC / Cédula *</label>
                  <input type="text" name="cedula" value={formData.cedula} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Razón Social / Empresa *</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contacto / Nombre Representante</label>
                  <input type="text" name="apellido" value={formData.apellido} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input type="text" name="telefono" value={formData.telefono} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Correo Electrónico</label>
                <input type="email" name="correo" value={formData.correo} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label>Dirección Comercial</label>
                <input type="text" name="direccion" value={formData.direccion} onChange={handleInputChange} />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-primary">
                  {editingId === null
                    ? 'Guardar Proveedor'
                    : 'Actualizar Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};