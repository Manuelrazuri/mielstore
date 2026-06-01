CREATE DATABASE IF NOT EXISTS miel_db;
USE miel_db;

-- Tabla Usuarios
CREATE TABLE IF NOT EXISTS Usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    rol ENUM('admin','cliente') DEFAULT 'cliente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Productos
CREATE TABLE IF NOT EXISTS Productos (
    id_producto INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    precio_normal DECIMAL(10,2) NOT NULL,
    precio_mayor DECIMAL(10,2) NOT NULL,
    stock INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla Pedidos
CREATE TABLE IF NOT EXISTS Pedidos (
    id_pedido INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT NOT NULL,
    fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    estado ENUM('pendiente','pagado','enviado','entregado','cancelado') DEFAULT 'pendiente',
    direccion_entrega TEXT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
);

-- Tabla DetallePedido
CREATE TABLE IF NOT EXISTS DetallePedido (
    id_detalle INT PRIMARY KEY AUTO_INCREMENT,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES Pedidos(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES Productos(id_producto)
);

-- Insertar productos
INSERT INTO Productos (nombre, tipo, precio_normal, precio_mayor, stock) VALUES
('Miel de Abeja 1kg', '1kg', 45.00, 40.00, 100),
('Miel de Abeja 1/2kg', '1/2kg', 30.00, 20.00, 100);

-- Insertar usuario admin (password: admin123)
INSERT INTO Usuarios (nombre, email, password, rol) VALUES
('Admin', 'admin@miel.com', '$2a$10$r0Yi0vJ/0t6qRxjU3lY0FOiJ5u5nLxQvKjZxHc8K.hkY7sFqJXtqW', 'admin');

-- SP Calcular precio por mayor
DELIMITER //
CREATE PROCEDURE CalcularPrecioProducto(
    IN p_tipo VARCHAR(10),
    IN p_cantidad INT,
    OUT p_precio DECIMAL(10,2)
)
BEGIN
    IF p_cantidad >= 5 THEN
        IF p_tipo = '1kg' THEN
            SET p_precio = 40.00;
        ELSE
            SET p_precio = 20.00;
        END IF;
    ELSE
        IF p_tipo = '1kg' THEN
            SET p_precio = 45.00;
        ELSE
            SET p_precio = 30.00;
        END IF;
    END IF;
END //
DELIMITER ;


-- SP para crear pedido
DELIMITER //
CREATE PROCEDURE CrearPedido(
    IN p_id_usuario INT,
    IN p_direccion TEXT
)
BEGIN
    INSERT INTO Pedidos (id_usuario, direccion_entrega, estado, total)
    VALUES (p_id_usuario, p_direccion, 'pendiente', 0);
    
    SELECT LAST_INSERT_ID() as id_pedido;
END //
DELIMITER ;