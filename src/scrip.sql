DROP DATABASE IF EXISTS punto_venta;
CREATE DATABASE punto_venta;
USE punto_venta;

CREATE TABLE ciudad(
    id_ciudad INT PRIMARY KEY AUTO_INCREMENT,
    nombre_ciudad VARCHAR(100) NOT NULL
);

CREATE TABLE persona(
    id_persona INT PRIMARY KEY AUTO_INCREMENT,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    direccion VARCHAR(200) NOT NULL,
    id_ciudad INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    FOREIGN KEY (id_ciudad) REFERENCES ciudad(id_ciudad)
);

 CREATE TABLE usuario(
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    id_persona INT NOT NULL UNIQUE,
    nick_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    FOREIGN KEY (id_persona) REFERENCES persona(id_persona)
);

CREATE TABLE rol(
    id_rol INT PRIMARY KEY AUTO_INCREMENT,
    nombre_rol VARCHAR(50) NOT NULL,
    descripcion VARCHAR(200) NOT NULL
);

CREATE TABLE usuario_rol(
    id_usuario INT NOT NULL,
    id_rol INT NOT NULL,
    PRIMARY KEY (id_usuario, id_rol),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
);

CREATE TABLE permiso(
    id_permiso INT PRIMARY KEY AUTO_INCREMENT,
    nombre_permiso VARCHAR(50) NOT NULL,
    descripcion VARCHAR(200) NOT NULL
);

CREATE TABLE rol_permiso(
    id_rol INT NOT NULL,
    id_permiso INT NOT NULL,
    PRIMARY KEY (id_rol, id_permiso),
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
    FOREIGN KEY (id_permiso) REFERENCES permiso(id_permiso)
);

CREATE TABLE producto(
    id_producto INT PRIMARY KEY AUTO_INCREMENT,
    codigo_producto VARCHAR(20) NOT NULL UNIQUE,
    nombre_producto VARCHAR(100) NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL,
    stock_minimo INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    imagen_producto VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS movimientos (
    id_movimiento INT PRIMARY KEY AUTO_INCREMENT,
    id_producto INT NOT NULL,
    tipo_movimiento ENUM('ENTRADA', 'SALIDA') NOT NULL,
    cantidad INT NOT NULL,
    motivo VARCHAR(255),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

CREATE TABLE cliente(
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    id_persona INT NOT NULL UNIQUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    FOREIGN KEY (id_persona) REFERENCES persona(id_persona)
);

CREATE TABLE factura(
    id_factura INT PRIMARY KEY AUTO_INCREMENT,
    id_cliente INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    numero_factura VARCHAR(20) NOT NULL UNIQUE,
    subtotal DECIMAL(10, 2) NOT NULL,
    impuesto DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    estado ENUM('pendiente', 'pagada', 'cancelada') NOT NULL DEFAULT 'pendiente',
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE detalle_factura(
    id_detalle_factura INT PRIMARY KEY AUTO_INCREMENT,
    id_factura INT NOT NULL,
    id_producto INT NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    impuesto DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_factura) REFERENCES factura(id_factura),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

CREATE TABLE proveedor(
    id_proveedor INT PRIMARY KEY AUTO_INCREMENT,
    id_persona INT NOT NULL UNIQUE,
    codigo_proveedor VARCHAR(20) NOT NULL UNIQUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    FOREIGN KEY (id_persona) REFERENCES persona(id_persona)
);

CREATE TABLE  compra(
    id_compra INT PRIMARY KEY AUTO_INCREMENT,
    id_proveedor INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    numero_compra VARCHAR(20) NOT NULL UNIQUE,
    subtotal DECIMAL(10, 2) NOT NULL,
    impuesto DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    estado ENUM('pendiente', 'pagada', 'cancelada') NOT NULL DEFAULT 'pendiente',
    FOREIGN KEY (id_proveedor) REFERENCES proveedor(id_proveedor),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE detalle_compra(
    id_detalle_compra INT PRIMARY KEY AUTO_INCREMENT,
    id_compra INT NOT NULL,
    id_producto INT NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    impuesto DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_compra) REFERENCES compra(id_compra),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);

CREATE TABLE logs(
    id_log INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    accion VARCHAR(200) NOT NULL,
    tipo_accion ENUM('login', 'logout', 'crear', 'actualizar', 'eliminar', 'vender', 'comprar', 'cancelar') NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS configuracion (
    id_config INT PRIMARY KEY AUTO_INCREMENT,
    nombre_negocio VARCHAR(150) NOT NULL,
    ruc_nit VARCHAR(20) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    porcentaje_iva DECIMAL(5,2) DEFAULT 12.00,
    moneda VARCHAR(5) DEFAULT '$',
    mensaje_ticket VARCHAR(255) DEFAULT '¡Gracias por su compra!'
);

INSERT INTO ciudad (nombre_ciudad) VALUES ('Ciudad Principal');

INSERT INTO persona (cedula, nombre, apellido, telefono, correo, direccion, id_ciudad) 
VALUES ('0102030405', 'Admin', 'Sistema', '0999999999', 'admin@pos.com', 'Av. Principal 123', 1);

-- Contraseña encriptada de 'Admin123!' con BCRYPT
INSERT INTO usuario (id_persona, nick_usuario, contrasena, estado) 
VALUES (1, 'admin', 'Admin123!', 'activo');

INSERT INTO rol (nombre_rol, descripcion) VALUES ('Administrador', 'Control total del sistema');

INSERT INTO usuario_rol (id_usuario, id_rol) VALUES (1, 1);

--datos de configuración
INSERT INTO configuracion (nombre_negocio, ruc_nit, telefono, email, direccion, porcentaje_iva, moneda, mensaje_ticket)
VALUES ('Mi Negocio POS', '0999999999001', '0991234567', 'contacto@minegocio.com', 'Av. Principal #123', 12.00, '$', '¡Gracias por su compra!');