import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import './Pos.css';

export const PosPage = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [cashReceived, setCashReceived] = useState('');
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/productos/index.php');
      if (res.data.status === 'success') {
        setProducts(res.data.data);
      }
    } catch (err) {
      console.error("Error al cargar productos", err);
    }
  };

  const addToCart = (product) => {
    if (parseFloat(product.stock) <= 0) {
      alert("Producto sin stock disponible");
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id_producto === product.id_producto);
      if (existingItem) {
        if (existingItem.cantidad < product.stock) {
          return prevCart.map(item =>
            item.id_producto === product.id_producto
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          );
        } else {
          alert("Límite de stock alcanzado para este producto");
          return prevCart;
        }
      }
      return [...prevCart, { ...product, cantidad: 1 }];
    });
  };

  // Manejador para escanear código de barras con Enter
  const handleKeyDownSearch = (e) => {
    if (e.key === 'Enter') {
      const matchedProduct = products.find(p => 
        p.codigo_producto.toLowerCase() === search.trim().toLowerCase()
      );
      if (matchedProduct) {
        addToCart(matchedProduct);
        setSearch('');
      }
    }
  };

  const updateQuantity = (id_producto, delta) => {
    setCart(prevCart =>
      prevCart
        .map(item => {
          if (item.id_producto === id_producto) {
            const newQty = item.cantidad + delta;
            return newQty <= item.stock ? { ...item, cantidad: newQty } : item;
          }
          return item;
        })
        .filter(item => item.cantidad > 0)
    );
  };

  const removeFromCart = (id_producto) => {
    setCart(prevCart => prevCart.filter(item => item.id_producto !== id_producto));
  };

  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.precio) * item.cantidad), 0);
  const tax = subtotal * 0.12; // IVA 12%
  const total = subtotal + tax;
  const cashNum = parseFloat(cashReceived) || 0;
  const change = cashNum - total;

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Agrega productos al carrito.");
    if (cashNum < total) return alert("El dinero recibido es menor al total.");

    setLoading(true);
    try {
      const res = await api.post('/pos/vender.php', {
        cart,
        subtotal,
        impuesto: tax,
        total,
        id_cliente: 1, // Consumidor final
        id_usuario: 1
      });

      if (res.data.status === 'success') {
        alert(`¡Venta completada con éxito! Nº ${res.data.numero_factura}`);
        setCart([]);
        setCashReceived('');
        setSearch('');
        fetchProducts(); // Refresca stock real desde el servidor
        if (searchInputRef.current) searchInputRef.current.focus();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error al procesar la venta.");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.nombre_producto.toLowerCase().includes(search.toLowerCase()) ||
    p.codigo_producto.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="main-content pos-container">
      {/* Panel Izquierdo: Catálogo de Productos */}
      <div className="pos-catalog">
        <div className="pos-search-bar">
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="🔍 Escanear código de barras o buscar..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDownSearch}
            autoFocus
          />
        </div>

        <div className="products-grid">
          {filteredProducts.map(p => {
            const isOutOfStock = parseFloat(p.stock) <= 0;
            return (
              <div 
                key={p.id_producto} 
                className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
                onClick={() => !isOutOfStock && addToCart(p)}
              >
                <div className="product-code">{p.codigo_producto}</div>
                <div className="product-name">{p.nombre_producto}</div>
                <div className="product-footer">
                  <span className="product-price">${parseFloat(p.precio).toFixed(2)}</span>
                  <span className={`product-stock ${isOutOfStock ? 'empty' : ''}`}>
                    {isOutOfStock ? 'Agotado' : `${p.stock} u.`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel Derecho: Carrito y Cobro */}
      <div className="pos-checkout">
        <h2 className="section-title">🛒 Orden de Compra</h2>

        <div className="cart-items-list">
          {cart.length === 0 ? (
            <div className="empty-cart-msg">
              <p>El carrito está vacío</p>
              <small>Selecciona productos del catálogo para iniciar la venta</small>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id_producto} className="cart-item">
                <div className="cart-item-info">
                  <strong>{item.nombre_producto}</strong>
                  <span>${parseFloat(item.precio).toFixed(2)} c/u</span>
                </div>
                <div className="cart-item-controls">
                  <button type="button" onClick={() => updateQuantity(item.id_producto, -1)}>-</button>
                  <span className="qty-badge">{item.cantidad}</span>
                  <button type="button" onClick={() => updateQuantity(item.id_producto, 1)}>+</button>
                  <button type="button" onClick={() => removeFromCart(item.id_producto)} className="btn-remove" title="Eliminar">🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Resumen de Valores */}
        <div className="checkout-summary">
          <div className="summary-row"><span>Subtotal:</span> <span>${subtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>IVA (12%):</span> <span>${tax.toFixed(2)}</span></div>
          <div className="summary-row total-row"><span>Total:</span> <span>${total.toFixed(2)}</span></div>

          <div className="cash-input-group">
            <label>Efectivo Recibido:</label>
            <input 
              type="number" 
              step="0.01" 
              placeholder="$0.00" 
              value={cashReceived} 
              onChange={(e) => setCashReceived(e.target.value)} 
            />
          </div>

          {cashReceived !== '' && (
            <div className={`change-display ${change < 0 ? 'negative' : ''}`}>
              {change < 0 ? (
                <span>Faltan: <strong>${Math.abs(change).toFixed(2)}</strong></span>
              ) : (
                <span>Cambio: <strong>${change.toFixed(2)}</strong></span>
              )}
            </div>
          )}

          <button 
            className="btn-checkout" 
            onClick={handleCheckout} 
            disabled={loading || cart.length === 0 || change < 0}
          >
            {loading ? 'Procesando Venta...' : '💳 Registrar Venta'}
          </button>
        </div>
      </div>
    </div>
  );
};