// src/components/Login.jsx
import React, { useState } from 'react';
import { loginService } from '../service/authService';
import './Login.css';

export const Login = ({ onLoginSuccess }) => {
  const [nickUsuario, setNickUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Información de la empresa (se puede parametrizar o traer del backend después)
  const empresa = {
    nombre: "Nombre de la Empresa",
    slogan: "Su Slogan Aquí",
    direccion: "Av. Principal 123, Centro",
    telefono: "+593 99 999 9999",
    correo: "contacto@micomercio.com",
    logoUrl: "logo.png" // Asegúrate de tener este logo en la carpeta public o ajusta la ruta según corresponda
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nickUsuario.trim() || !contrasena.trim()) {
      setError('Por favor, ingresa tu usuario y contraseña.');
      return;
    }

    setLoading(true);

    try {
      const response = await loginService(nickUsuario, contrasena);
      if (onLoginSuccess) {
        onLoginSuccess(response.data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card-container">
        
        {/* Panel Izquierdo: Información de la Empresa */}
        <div className="company-section">
          <div className="company-brand">
            <img src={empresa.logoUrl} alt="Logo Empresa" className="company-logo" />
            <h1 className="company-title">{empresa.nombre}</h1>
            <p className="company-slogan">"{empresa.slogan}"</p>
          </div>

          <div className="company-info">
            <div className="info-item">
              <span>📍 {empresa.direccion}</span>
            </div>
            <div className="info-item">
              <span>📞 {empresa.telefono}</span>
            </div>
            <div className="info-item">
              <span>✉️ {empresa.correo}</span>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Formulario de Autenticación */}
        <div className="form-section">
          <h2 className="form-title">Iniciar Sesión</h2>
          <p className="form-subtitle">Accede con tus credenciales de usuario</p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nickUsuario">Usuario</label>
              <input
                type="text"
                id="nickUsuario"
                value={nickUsuario}
                onChange={(e) => setNickUsuario(e.target.value)}
                placeholder="Ej. admin"
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contrasena">Contraseña</label>
              <input
                type="password"
                id="contrasena"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? 'Cargando...' : 'Ingresar'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};