// src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logoutService } from '../service/authService';
import './Sidebar.css'; // Asegúrate de tener un archivo CSS para estilos del Sidebar

export const Sidebar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutService();
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-title">QASO SYSTEM</div>
      
      <nav className="sidebar-menu">
        {/* Principal */}
        <NavLink 
          to="/dashboard" 
          end 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          📊 Dashboard
        </NavLink>

        {/* Módulo de Ventas / Operaciones diarias */}
        <div className="menu-group-label">VENTAS</div>
        <NavLink 
          to="/dashboard/pos" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          🛒 Caja / Ventas (POS)
        </NavLink>

        <NavLink 
          to="/dashboard/facturas" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          🧾 Historial Ventas
        </NavLink>

        <NavLink 
          to="/dashboard/clientes" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          👥 Clientes
        </NavLink>

        {/* Módulo de Inventario y Mercadería */}
        <div className="menu-group-label">ALMACÉN</div>
        <NavLink 
          to="/dashboard/inventario" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          📦 Productos
        </NavLink>

        <NavLink 
          to="/dashboard/movimientos" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          📋 Audit. Stock
        </NavLink>

        {/* Módulo de Compras a Proveedores */}
        <div className="menu-group-label">COMPRAS</div>
        <NavLink 
          to="/dashboard/compras" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          🛍️ Registro Compras
        </NavLink>

        <NavLink 
          to="/dashboard/proveedores" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          🚚 Proveedores
        </NavLink>

        {/* Control e Informes */}
        <div className="menu-group-label">SISTEMA</div>
        <NavLink 
          to="/dashboard/reportes" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          📈 Contabilidad
        </NavLink>

        <NavLink 
          to="/dashboard/configuracion" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
        >
          ⚙️ Ajustes Negocio
        </NavLink>
      </nav>

      <button 
        onClick={handleLogout} 
        className="menu-item logout-btn" 
        style={{ marginTop: 'auto', color: '#f87171' }}
      >
        🚪 Cerrar Sesión
      </button>
    </aside>
  );
};