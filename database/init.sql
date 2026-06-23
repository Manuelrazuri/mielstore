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
DROP PROCEDURE IF EXISTS CalcularPrecioProducto;
DELIMITER //
CREATE PROCEDURE CalcularPrecioProducto(
    IN p_tipo VARCHAR(10),
    IN p_cantidad INT,
    OUT p_precio DECIMAL(10,2)
)
BEGIN
    IF p_cantidad >= 6 THEN
        IF p_tipo = '1kg' THEN
            SET p_precio = 35.00;
        ELSE
            SET p_precio = 25.00;
        END IF;
    ELSE
        IF p_tipo = '1kg' THEN
            SET p_precio = 40.00;
        ELSE
            SET p_precio = 28.00;
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

CREATE TABLE IF NOT EXISTS FechasRecojo (
    id_fecha INT PRIMARY KEY AUTO_INCREMENT,
    fecha DATE NOT NULL UNIQUE,
    disponible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar algunas fechas de ejemplo (próximos 30 días, de lunes a sábado)
INSERT INTO FechasRecojo (fecha, disponible)
SELECT DATE_ADD(CURDATE(), INTERVAL n DAY), TRUE
FROM (
    SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
) nums
WHERE WEEKDAY(DATE_ADD(CURDATE(), INTERVAL n DAY)) BETWEEN 0 AND 5;  -- lunes a sábado

ALTER TABLE Pedidos
ADD COLUMN tipo_entrega ENUM('recojo', 'delivery') NOT NULL DEFAULT 'delivery',
ADD COLUMN costo_envio DECIMAL(10,2) DEFAULT 0,
ADD COLUMN fecha_entrega DATE,
ADD COLUMN lugar_recojo VARCHAR(255) NULL;

-- Agregar columna activo a Productos
ALTER TABLE Productos ADD COLUMN activo BOOLEAN DEFAULT TRUE;

-- Agregar columna activo a FechasRecojo (opcional: aunque ya tiene disponible, pero para consistencia)
ALTER TABLE FechasRecojo ADD COLUMN activo BOOLEAN DEFAULT TRUE;

-- Si quieres también en Usuarios (para deshabilitar cuentas), pero no es obligatorio
-- ALTER TABLE Usuarios ADD COLUMN activo BOOLEAN DEFAULT TRUE;

-- Índice para mejorar búsquedas
CREATE INDEX idx_productos_activo ON Productos(activo);
CREATE INDEX idx_fechas_activo ON FechasRecojo(activo);

-- Obtener fechas activas (no eliminadas lógicamente)
DROP PROCEDURE IF EXISTS SP_Admin_GetAllDates;
DELIMITER //
CREATE PROCEDURE SP_Admin_GetAllDates()
BEGIN
    SELECT fecha, disponible, activo FROM FechasRecojo WHERE activo = 1 ORDER BY fecha;
END //
DELIMITER ;

-- Insertar o actualizar fecha (la marca como activa)
DROP PROCEDURE IF EXISTS SP_Admin_UpsertDate;
DELIMITER //
CREATE PROCEDURE SP_Admin_UpsertDate(
    IN p_fecha DATE,
    IN p_disponible BOOLEAN
)
BEGIN
    INSERT INTO FechasRecojo (fecha, disponible, activo) 
    VALUES (p_fecha, p_disponible, 1)
    ON DUPLICATE KEY UPDATE disponible = p_disponible, activo = 1;
    
    SELECT 'Fecha procesada' AS message;
END //
DELIMITER ;

-- Eliminado lógico de fecha
DROP PROCEDURE IF EXISTS SP_Admin_DeleteDate;
DELIMITER //
CREATE PROCEDURE SP_Admin_DeleteDate(
    IN p_fecha DATE
)
BEGIN
    UPDATE FechasRecojo SET activo = 0 WHERE fecha = p_fecha;
    SELECT 'Fecha eliminada lógicamente' AS message;
END //
DELIMITER ;

-- Obtener todos los usuarios (activos)
DROP PROCEDURE IF EXISTS SP_Admin_GetAllUsers;
DELIMITER //
CREATE PROCEDURE SP_Admin_GetAllUsers()
BEGIN
    SELECT id_usuario, nombre, email, rol, created_at 
    FROM Usuarios 
    WHERE activo = 1   -- si agregaste la columna, si no, omite el WHERE
    ORDER BY id_usuario;
END //
DELIMITER ;

-- Cambiar rol (solo si activo)
DROP PROCEDURE IF EXISTS SP_Admin_UpdateUserRole;
DELIMITER //
CREATE PROCEDURE SP_Admin_UpdateUserRole(
    IN p_user_id INT,
    IN p_new_role VARCHAR(20)
)
BEGIN
    IF p_new_role NOT IN ('admin', 'cliente') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Rol inválido';
    END IF;
    
    UPDATE Usuarios SET rol = p_new_role WHERE id_usuario = p_user_id;
    SELECT 'Rol actualizado' AS message;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_Admin_GetAllOrders;
DELIMITER //
CREATE PROCEDURE SP_Admin_GetAllOrders()
BEGIN
    SELECT p.*, u.nombre AS cliente_nombre, u.email 
    FROM Pedidos p 
    JOIN Usuarios u ON p.id_usuario = u.id_usuario
    ORDER BY p.fecha_pedido DESC;
END //
DELIMITER ;

DROP PROCEDURE IF EXISTS SP_Admin_UpdateOrderStatus;
DELIMITER //
CREATE PROCEDURE SP_Admin_UpdateOrderStatus(
    IN p_order_id INT,
    IN p_new_status VARCHAR(20)
)
BEGIN
    IF p_new_status NOT IN ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estado inválido';
    END IF;
    
    UPDATE Pedidos SET estado = p_new_status WHERE id_pedido = p_order_id;
    SELECT 'Estado actualizado' AS message;
END //
DELIMITER ;


DROP PROCEDURE IF EXISTS SP_Admin_GetStats;
DELIMITER //
CREATE PROCEDURE SP_Admin_GetStats()
BEGIN
    -- 1. Ventas totales y número de pedidos
    SELECT 
        COALESCE(SUM(total), 0) AS total_ventas,
        COUNT(*) AS total_pedidos
    FROM Pedidos;

    -- 2. Pedidos por estado
    SELECT 
        estado, 
        COUNT(*) AS cantidad
    FROM Pedidos
    GROUP BY estado;

    -- 3. Ventas por producto (usando variedad + presentacion)
    SELECT 
        p.id_producto,
        CONCAT(p.variedad, ' (', p.presentacion, ')') AS producto,
        COALESCE(SUM(d.cantidad), 0) AS unidades_vendidas,
        COALESCE(SUM(d.subtotal), 0) AS ingreso
    FROM Productos p
    LEFT JOIN DetallePedido d ON p.id_producto = d.id_producto
    WHERE p.activo = 1
    GROUP BY p.id_producto
    ORDER BY unidades_vendidas DESC;

    -- 4. Ventas por distrito (extrae distrito de la dirección de entrega)
    SELECT 
        CASE 
            WHEN direccion_entrega LIKE '%San Miguel%' THEN 'San Miguel'
            WHEN direccion_entrega LIKE '%Miraflores%' THEN 'Miraflores'
            WHEN direccion_entrega LIKE '%San Isidro%' THEN 'San Isidro'
            WHEN direccion_entrega LIKE '%Surco%' THEN 'Surco'
            WHEN direccion_entrega LIKE '%La Molina%' THEN 'La Molina'
            ELSE 'Otros'
        END AS distrito,
        COUNT(*) AS total_pedidos,
        COALESCE(SUM(total), 0) AS ingreso
    FROM Pedidos
    WHERE tipo_entrega = 'delivery'
    GROUP BY distrito
    ORDER BY ingreso DESC;

    -- 5. Ventas por tipo de entrega
    SELECT 
        tipo_entrega,
        COUNT(*) AS cantidad,
        COALESCE(SUM(total), 0) AS ingreso
    FROM Pedidos
    GROUP BY tipo_entrega;

    -- 6. Top 5 productos más vendidos (usando variedad + presentacion)
    SELECT 
        p.id_producto,
        CONCAT(p.variedad, ' (', p.presentacion, ')') AS nombre,
        SUM(d.cantidad) AS total_unidades
    FROM DetallePedido d
    JOIN Productos p ON d.id_producto = p.id_producto
    GROUP BY d.id_producto
    ORDER BY total_unidades DESC
    LIMIT 5;
END //
DELIMITER ;

ALTER TABLE Usuarios ADD COLUMN activo BOOLEAN DEFAULT TRUE;
ALTER TABLE FechasRecojo ADD COLUMN activo BOOLEAN DEFAULT TRUE;

--Obtener productos creados---

DROP PROCEDURE IF EXISTS SP_Admin_GetAllProducts;
DELIMITER //
CREATE PROCEDURE SP_Admin_GetAllProducts()
BEGIN
    SELECT id_producto, variedad, presentacion, precio_normal, precio_mayor, stock, activo, created_at
    FROM Productos
    WHERE activo = 1
    ORDER BY id_producto;
END //
DELIMITER ;


--Crear Productos---

DROP PROCEDURE IF EXISTS SP_Admin_CreateProduct;
DELIMITER //
CREATE PROCEDURE SP_Admin_CreateProduct(
    IN p_variedad VARCHAR(100),
    IN p_presentacion VARCHAR(20),
    IN p_precio_normal DECIMAL(10,2),
    IN p_precio_mayor DECIMAL(10,2),
    IN p_stock INT
)
BEGIN
    INSERT INTO Productos (variedad, presentacion, precio_normal, precio_mayor, stock, activo)
    VALUES (p_variedad, p_presentacion, p_precio_normal, p_precio_mayor, p_stock, 1);
    SELECT LAST_INSERT_ID() AS new_id;
END //
DELIMITER ;

---Actualizar Productos--

DROP PROCEDURE IF EXISTS SP_Admin_UpdateProduct;
DELIMITER //
CREATE PROCEDURE SP_Admin_UpdateProduct(
    IN p_id INT,
    IN p_variedad VARCHAR(100),
    IN p_presentacion VARCHAR(20),
    IN p_precio_normal DECIMAL(10,2),
    IN p_precio_mayor DECIMAL(10,2),
    IN p_stock INT
)
BEGIN
    UPDATE Productos 
    SET variedad = p_variedad,
        presentacion = p_presentacion,
        precio_normal = p_precio_normal,
        precio_mayor = p_precio_mayor,
        stock = p_stock
    WHERE id_producto = p_id AND activo = 1;
    SELECT ROW_COUNT() AS affected_rows, 'Producto actualizado' AS message;
END //
DELIMITER ;

--Eliminado Logico del producto---
DROP PROCEDURE IF EXISTS SP_Admin_DeleteProduct;
DELIMITER //
CREATE PROCEDURE SP_Admin_DeleteProduct(IN p_id INT)
BEGIN
    UPDATE Productos SET activo = 0 WHERE id_producto = p_id;
    SELECT 'Producto eliminado lógicamente' AS message;
END //
DELIMITER ;


ALTER TABLE Productos CHANGE COLUMN nombre variedad VARCHAR(100) NOT NULL;
ALTER TABLE Productos CHANGE COLUMN tipo presentacion VARCHAR(20) NOT NULL;
ALTER TABLE Productos ADD COLUMN imagen_url VARCHAR(255) NULL;


-- Agregar columnas de pago
ALTER TABLE Pedidos 
ADD COLUMN metodo_pago ENUM('yape', 'plin', 'contraentrega') NOT NULL DEFAULT 'contraentrega',
ADD COLUMN evidencia_pago VARCHAR(255) NULL,
ADD COLUMN estado_pago ENUM('pendiente', 'pagado', 'rechazado') DEFAULT 'pendiente',
ADD COLUMN numero_operacion VARCHAR(50) NULL;

-- SP para cliente: obtener pedidos con info de pago
DROP PROCEDURE IF EXISTS SP_GetMisPedidos;
DELIMITER //
CREATE PROCEDURE SP_GetMisPedidos(IN p_user_id INT)
BEGIN
    SELECT 
        p.id_pedido,
        p.fecha_pedido,
        p.total,
        p.estado,
        p.direccion_entrega,
        p.tipo_entrega,
        p.costo_envio,
        p.fecha_entrega,
        p.lugar_recojo,
        p.metodo_pago,
        p.estado_pago,
        p.evidencia_pago,
        p.numero_operacion,
        GROUP_CONCAT(CONCAT(d.cantidad, 'x ', pr.variedad, ' (', pr.presentacion, ')') SEPARATOR ', ') AS productos
    FROM Pedidos p
    JOIN DetallePedido d ON p.id_pedido = d.id_pedido
    JOIN Productos pr ON d.id_producto = pr.id_producto
    WHERE p.id_usuario = p_user_id
    GROUP BY p.id_pedido
    ORDER BY p.fecha_pedido DESC;
END //
DELIMITER ;

-- SP para admin: actualizar estado de pago
DROP PROCEDURE IF EXISTS SP_Admin_UpdatePaymentStatus;
DELIMITER //
CREATE PROCEDURE SP_Admin_UpdatePaymentStatus(
    IN p_order_id INT,
    IN p_new_status VARCHAR(20)
)
BEGIN
    IF p_new_status NOT IN ('pendiente', 'pagado', 'rechazado') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estado de pago inválido';
    END IF;
    UPDATE Pedidos SET estado_pago = p_new_status WHERE id_pedido = p_order_id;
    SELECT 'Estado de pago actualizado' AS message;
END //
DELIMITER ;