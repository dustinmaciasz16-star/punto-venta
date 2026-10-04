import React from 'react';
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
  return (
    <div className="dashboard-container">
      {/* Componente Sidebar separado */}
      <Sidebar onLogout={onLogout} />

      {/* Área donde se renderizan las subpáginas */}
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
    </div>
  );
};