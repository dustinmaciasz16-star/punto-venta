import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { DashboardHome } from './DashboardHome';
import { PosPage } from './PosPage';
import { FacturasPage } from './FacturasPage';
import { ClientesPage } from './ClientesPage';
import { InventoryPage } from './InventoryPage';
import { MovementsPage } from './MovementsPage';
import { ComprasPage } from './ComprasPage';
import { ProveedoresPage } from './ProveedoresPage';
import { ReportsPage } from './ReportsPage';
import { ConfigPage } from './ConfigPage';

export const DashboardLayout = ({ user, onLogout }) => {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={`dashboard-container ${sidebarOpen ? 'sidebar-open' : ''}`}>

      <button
        className="menu-toggle"
        onClick={() => setSidebarOpen(true)}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      <Sidebar
        onLogout={onLogout}
        onClose={() => setSidebarOpen(false)}
      />

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="dashboard-content">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="pos" element={<PosPage />} />
          <Route path="facturas" element={<FacturasPage />} />
          <Route path="clientes" element={<ClientesPage />} />
          <Route path="inventario" element={<InventoryPage />} />
          <Route path="movimientos" element={<MovementsPage />} />
          <Route path="compras" element={<ComprasPage />} />
          <Route path="proveedores" element={<ProveedoresPage />} />
          <Route path="reportes" element={<ReportsPage />} />
          <Route path="configuracion" element={<ConfigPage />} />
        </Routes>
      </main>

    </div>
  );
};