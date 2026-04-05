CREATE TABLE IF NOT EXISTS user(
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20),
    profile_photo_key VARCHAR(255) comment 'Clave del archivo de la foto de perfil en S3',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS category (
    category_id SERIAL PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    icon_key VARCHAR(255) COMMENT 'Para mostrar el icono en la UI'
);

CREATE TABLE IF NOT EXISTS tool(
    tool_id SERIAL PRIMARY KEY,
    owner_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    price_per_day DECIMAL(10, 2) NOT NULL COMMENT 'Precio de alquiler por día',
    security_deposit DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Fianza que se entrega al inicio y se devuelve al final',
    condition ENUM('Nuevo', 'Excelente', 'Muy bueno', 'Bueno', 'Aceptable') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category(category_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS tool_availability (
    tool_availability_id SERIAL PRIMARY KEY,
    tool_id BIGINT UNSIGNED NOT NULL,
    `date` DATE NOT NULL COMMENT 'Día específico bloqueado o disponible',
    is_available BOOLEAN DEFAULT FALSE COMMENT 'FALSE si el dueño lo bloquea manualmente',
    UNIQUE KEY unique_tool_date (tool_id, `date`),
    FOREIGN KEY (tool_id) REFERENCES tool(tool_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tool_photo(
    id SERIAL PRIMARY KEY,
    tool_id BIGINT UNSIGNED NOT NULL,
    photo_key VARCHAR(255) NOT NULL comment 'Clave del archivo en S3',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tool_id) REFERENCES tool(tool_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rental(
    rental_id SERIAL PRIMARY KEY,
    tool_id BIGINT UNSIGNED NOT NULL,
    renter_id BIGINT UNSIGNED NOT NULL comment 'ID del arrendatario que alquila la herramienta',
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    price_per_day_at_rental DECIMAL(10, 2) NOT NULL COMMENT 'Precio por día al momento del alquiler',
    total_rental_price DECIMAL(10, 2) NOT NULL COMMENT 'Precio total calculado al momento del alquiler',
    security_deposit_at_rental DECIMAL(10, 2) NOT NULL COMMENT 'Monto de la fianza al momento del alquiler',
    `status` ENUM('Pendiente', 'Rechazada', 'Aprobada', 'En Uso', 'Completada') DEFAULT 'Pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tool_id) REFERENCES tool(tool_id) ON DELETE CASCADE,
    FOREIGN KEY (renter_id) REFERENCES user(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payment(
    payment_id SERIAL PRIMARY KEY,
    rental_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    `concept` ENUM('Alquiler', 'Fianza') NOT NULL,
    `status` ENUM('Pendiente', 'Pagado', 'Devuelto') DEFAULT 'Pendiente',
    confirmed_by_owner BOOLEAN DEFAULT FALSE,
    confirmed_by_renter BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rental_id) REFERENCES rental(rental_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_code(
    verification_code_id SERIAL PRIMARY KEY,
    rental_id BIGINT UNSIGNED NOT NULL,
    code VARCHAR(6) NOT NULL,
    type ENUM('PICKUP', 'RETURN') NOT NULL COMMENT 'Tipo de código: recogida o devolución',
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rental_id) REFERENCES rental(rental_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorite(
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    tool_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tool_id) REFERENCES tool(tool_id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, tool_id)
);

CREATE TABLE IF NOT EXISTS review(
    review_id SERIAL PRIMARY KEY,
    rental_id BIGINT UNSIGNED NOT NULL,
    reviewer_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario que escribe la reseña',
    reviewee_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario que recibe la reseña',
    rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_rental_reviewer (rental_id, reviewer_id),
    FOREIGN KEY (rental_id) REFERENCES rental(rental_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES user(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `notification`(
    notification_id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `read` BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_room (
    room_id SERIAL PRIMARY KEY,
    rental_id BIGINT UNSIGNED NULL COMMENT 'Opcional: liga el chat a un alquiler específico',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rental_id) REFERENCES rental(rental_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS chat_participant (
    room_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Para saber hasta dónde leyó',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (room_id, user_id),
    FOREIGN KEY (room_id) REFERENCES chat_room(room_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_message (
    message_id SERIAL PRIMARY KEY,
    room_id BIGINT UNSIGNED NOT NULL,
    sender_id BIGINT UNSIGNED NOT NULL,
    message_text TEXT NOT NULL,
    message_type ENUM('text', 'system') DEFAULT 'text',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_room(room_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES user(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS postal_code_geo (
    postal_code VARCHAR(20) PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL COMMENT 'Latitud del código postal',
    longitude DECIMAL(11, 8) NOT NULL COMMENT 'Longitud del código postal',
    city VARCHAR(255) COMMENT 'Municipio o localidad',
    province VARCHAR(255) COMMENT 'Provincia (ej: Madrid, Barcelona, Sevilla)',
    community VARCHAR(255) COMMENT 'Comunidad Autónoma (ej: Comunidad de Madrid, Cataluña)'
);