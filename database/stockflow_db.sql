CREATE DATABASE stockflow_db;

CREATE TABLE rol (
    id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre  VARCHAR(30) NOT NULL UNIQUE
);

INSERT INTO rol (nombre) VALUES ('ADMIN'), ('VENDEDOR'), ('ALMACENERO');

CREATE TABLE usuario (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    email           VARCHAR(120) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    activo          BOOLEAN      NOT NULL DEFAULT TRUE,
    rol_id          BIGINT       NOT NULL REFERENCES rol (id),
    fecha_creacion  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE categoria (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre       VARCHAR(80)  NOT NULL UNIQUE,
    descripcion  VARCHAR(255)
);

CREATE TABLE producto (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sku           VARCHAR(40)    NOT NULL UNIQUE,
    nombre        VARCHAR(120)   NOT NULL,
    descripcion   VARCHAR(255),
    precio        NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    stock_actual  INTEGER        NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo  INTEGER        NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    activo        BOOLEAN        NOT NULL DEFAULT TRUE,
    categoria_id  BIGINT         NOT NULL REFERENCES categoria (id)
);

CREATE INDEX idx_producto_categoria ON producto (categoria_id);

CREATE TABLE cliente (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre     VARCHAR(120) NOT NULL,
    documento  VARCHAR(20)  NOT NULL UNIQUE,
    email      VARCHAR(120),
    telefono   VARCHAR(20),
    direccion  VARCHAR(255)
);

CREATE TABLE pedido (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cliente_id      BIGINT         NOT NULL REFERENCES cliente (id),
    usuario_id      BIGINT         NOT NULL REFERENCES usuario (id),
    estado          VARCHAR(20)    NOT NULL DEFAULT 'PENDIENTE'
                    CHECK (estado IN ('PENDIENTE', 'COMPLETADO', 'CANCELADO')),
    total           NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
    observacion     VARCHAR(255),
    fecha_creacion  TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pedido_cliente ON pedido (cliente_id);
CREATE INDEX idx_pedido_usuario ON pedido (usuario_id);
CREATE INDEX idx_pedido_estado ON pedido (estado);

CREATE TABLE detalle_pedido (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pedido_id        BIGINT         NOT NULL REFERENCES pedido (id) ON DELETE CASCADE,
    producto_id      BIGINT         NOT NULL REFERENCES producto (id),
    cantidad         INTEGER        NOT NULL CHECK (cantidad > 0),
    precio_unitario  NUMERIC(10, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal         NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0)
);

CREATE INDEX idx_detalle_pedido ON detalle_pedido (pedido_id);
CREATE INDEX idx_detalle_producto ON detalle_pedido (producto_id);

CREATE TABLE movimiento_inventario (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    producto_id  BIGINT      NOT NULL REFERENCES producto (id),
    usuario_id   BIGINT      NOT NULL REFERENCES usuario (id),
    pedido_id    BIGINT      REFERENCES pedido (id),
    tipo         VARCHAR(20) NOT NULL CHECK (tipo IN ('ENTRADA', 'SALIDA', 'AJUSTE')),
    cantidad     INTEGER     NOT NULL,
    motivo       VARCHAR(255),
    fecha        TIMESTAMP   NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_movimiento_cantidad CHECK (
        (tipo IN ('ENTRADA', 'SALIDA') AND cantidad > 0)
        OR (tipo = 'AJUSTE' AND cantidad <> 0)
    )
);

CREATE INDEX idx_movimiento_producto ON movimiento_inventario (producto_id);
CREATE INDEX idx_movimiento_pedido ON movimiento_inventario (pedido_id);
CREATE INDEX idx_movimiento_fecha ON movimiento_inventario (fecha);