DROP TABLE IF EXISTS chat_message;
DROP TABLE IF EXISTS chat_participant;
DROP TABLE IF EXISTS chat_room;
DROP TABLE IF EXISTS `notification`;
DROP TABLE IF EXISTS review;
DROP TABLE IF EXISTS tool_favorite;
DROP TABLE IF EXISTS verification_code;
DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS rental;
DROP TABLE IF EXISTS tool_photo;
DROP TABLE IF EXISTS tool_availability_exception;
DROP TABLE IF EXISTS tool_availability_rule;
DROP TABLE IF EXISTS tool;
DROP TABLE IF EXISTS session_token;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS user;
-- DROP TABLE IF EXISTS postal_code_geo;


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
    `condition` ENUM('Nuevo', 'Excelente', 'Muy_bueno', 'Bueno', 'Aceptable') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES category(category_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS tool_availability_rule (
    rule_id       BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tool_id       BIGINT UNSIGNED NOT NULL,
    rule_type     ENUM('Siempre', 'Lunes_a_Viernes', 'Fines_de_semana', 'No_disponible') NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tool_id) REFERENCES tool(tool_id)
);

CREATE TABLE IF NOT EXISTS tool_availability_exception (
    availability_exception_id  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tool_id       BIGINT UNSIGNED NOT NULL,
    `date`        DATE NOT NULL,
    is_available  BOOLEAN NOT NULL DEFAULT FALSE,
    UNIQUE KEY unique_tool_date (tool_id, `date`),
    FOREIGN KEY (tool_id) REFERENCES tool(tool_id)
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

    daily_rate DECIMAL(10, 2) NOT NULL COMMENT 'Precio por día pactado',
    subtotal_amount DECIMAL(10, 2) NOT NULL COMMENT 'Costo total de días (sin fianza)',
    deposit_amount DECIMAL(10, 2) NOT NULL COMMENT 'Monto de la fianza/garantía',
    total_amount DECIMAL(10, 2) NOT NULL COMMENT 'Monto final (subtotal + fianza)',

    total_days INT NOT NULL COMMENT 'Número total de días del alquiler',
    `status` ENUM('Pendiente', 'Rechazada', 'Aprobada', 'En_Uso', 'Completada') DEFAULT 'Pendiente',
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
    type ENUM('RECOGIDA', 'DEVOLUCION') NOT NULL COMMENT 'Tipo de código: recogida o devolución',
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rental_id) REFERENCES rental(rental_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tool_favorite(
    tool_favorite_id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    tool_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (tool_id) REFERENCES tool(tool_id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, tool_id)
);

CREATE TABLE IF NOT EXISTS review (
    review_id SERIAL PRIMARY KEY,
    rental_id BIGINT UNSIGNED NOT NULL,
    reviewer_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario que escribe la reseña',
    reviewee_id BIGINT UNSIGNED NOT NULL COMMENT 'Usuario que recibe la reseña',
    review_type ENUM('RENTER_TO_OWNER', 'OWNER_TO_RENTER') NOT NULL,
    user_rating TINYINT NOT NULL CHECK (user_rating >= 1 AND user_rating <= 5),
    user_tags JSON DEFAULT NULL COMMENT 'Tags como: Muy amable, Responsable, Devolvió a tiempo',
    tool_rating TINYINT NOT NULL CHECK (tool_rating >= 1 AND tool_rating <= 5),
    tool_tags JSON DEFAULT NULL COMMENT 'Tags como: Perfecto estado, Sin daños, Limpia y ordenada',
    comment VARCHAR(300) DEFAULT NULL COMMENT 'Máximo 300 caracteres según el contador 0/300 de la UI',
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
    redirect_path VARCHAR(255) COMMENT 'Ruta a la que se redirige al hacer clic (ej: /rentals/123)',
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
    chat_participant_id SERIAL PRIMARY KEY,
    room_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Para saber hasta dónde leyó',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_room(room_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_message (
    message_id SERIAL PRIMARY KEY,
    room_id BIGINT UNSIGNED NOT NULL,
    sender_id BIGINT UNSIGNED NOT NULL,
    message_text TEXT NOT NULL,
    message_type ENUM('TEXT', 'SYSTEM') DEFAULT 'TEXT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES chat_room(room_id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES user(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS postal_code_geo (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    postal_code VARCHAR(20) NOT NULL COMMENT 'Código postal',
    latitude DECIMAL(10, 8) NOT NULL COMMENT 'Latitud del código postal',
    longitude DECIMAL(11, 8) NOT NULL COMMENT 'Longitud del código postal',
    city VARCHAR(255) COMMENT 'Municipio o localidad',
    province VARCHAR(255) COMMENT 'Provincia (ej: Madrid, Barcelona, Sevilla)',
    community VARCHAR(255) COMMENT 'Comunidad Autónoma (ej: Comunidad de Madrid, Cataluña)',
    PRIMARY KEY (id),
    INDEX idx_postal_code (postal_code),
    INDEX idx_city (city)
);

CREATE TABLE IF NOT EXISTS session_token (
    token_id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);


-- ─────────────────────────────────────────
-- CATEGORIES
-- ─────────────────────────────────────────
INSERT INTO category (category_id, `name`, icon_key) VALUES
(1, 'Jardinería',    'categories/jardineria.png'),
(2, 'Carpintería',   'categories/carpinteria.png'),
(3, 'Limpieza',      'categories/limpieza.png'),
(4, 'Electricidad',  'categories/electricidad.png'),
(5, 'Pintura',       'categories/pintura.png'),
(6, 'Construcción',  'categories/construccion.png');


INSERT INTO `user` (user_id, name, email, password, postal_code, profile_photo_key, created_at, updated_at) VALUES(1, 'María Qingxuan Garrido', 'mariaqingxuan@gmail.com', '$2a$10$EwPGd7Qx/wjCOfljl8cnVuf4YL77lZZND8Us.sj5hhQIxXuaYJ9yC', '28011', 'user_avatars/071a76be-bf03-4ac6-ac11-a084746f7037.png', '2026-04-19 18:41:31', '2026-04-19 18:41:31');
INSERT INTO `user` (user_id, name, email, password, postal_code, profile_photo_key, created_at, updated_at) VALUES(2, 'Cris', 'andreedev2@gmail.com', '$2a$10$ygqL5sVv6299/nnrxrzw3OVZGBpNlPUIQ1KyrOFt7gm0ShVWPXXKa', '23411', 'user_avatars/cefa37a1-29ae-4a35-91c0-4a73311db8b0.png', '2026-04-19 22:19:30', '2026-04-19 22:19:30');

-- ─────────────────────────────────────────
-- TOOLS (María = owner_id 1, Gato = owner_id 2)
-- ─────────────────────────────────────────
INSERT INTO tool (tool_id, owner_id, category_id, `name`, `description`, price_per_day, security_deposit, `condition`) VALUES
(1, 1, 2, 'Taladro Percutor Bosch',    'Taladro percutor profesional 800W con maletín y accesorios.', 12.00, 30.00, 'Muy_bueno'),
(2, 1, 3, 'Calefactor de Aceite',      'Calefactor de aceite 2000W, silencioso y eficiente.',          8.00, 20.00, 'Excelente'),
(3, 1, 5, 'Lijadora Orbital',          'Lijadora orbital 300W ideal para muebles y paredes.',           9.00, 25.00, 'Bueno'),
(4, 2, 6, 'Martillo Demoledor',        'Martillo demoledor 1500W para obras y reformas.',              15.00, 40.00, 'Muy_bueno'),
(5, 2, 1, 'Escalera Telescópica',      'Escalera aluminio telescópica hasta 4.5m.',                   10.00, 35.00, 'Excelente'),
(6, 2, 4, 'Compresor de Aire',         'Compresor 50L 2HP con kit de manguera y pistola.',             18.00, 50.00, 'Bueno');

-- ─────────────────────────────────────────
-- TOOL PHOTOS
-- ─────────────────────────────────────────
INSERT INTO tool_photo (tool_id, photo_key) VALUES
(1, 'tool_photos/calefactor.jpg'),
(2, 'tool_photos/calefactor.jpg'),
(3, 'tool_photos/calefactor.jpg'),
(4, 'tool_photos/calefactor.jpg'),
(5, 'tool_photos/calefactor.jpg'),
(6, 'tool_photos/calefactor.jpg');

-- ─────────────────────────────────────────────────────────────────────────────
-- RENTALS
-- María (1) alquila tools de Gato (2)  → renter_id = 1
-- Gato  (2) alquila tools de María (1) → renter_id = 2
-- Todos los estados: Pendiente, Rechazada, Aprobada, En_Uso, Completada
-- ─────────────────────────────────────────────────────────────────────────────

-- Gato alquila a María (renter=2, tool de owner=1)
INSERT INTO rental (rental_id, tool_id, renter_id, start_date, end_date, daily_rate, subtotal_amount, deposit_amount, total_amount, total_days, `status`) VALUES
(1,  1, 2, '2026-04-25', '2026-04-27', 12.00,  24.00, 30.00,  54.00, 2, 'Pendiente'),
(2,  2, 2, '2026-03-01', '2026-03-03',  8.00,  16.00, 20.00,  36.00, 2, 'Rechazada'),
(3,  3, 2, '2026-04-28', '2026-04-30',  9.00,  18.00, 25.00,  43.00, 2, 'Aprobada'),
(4,  1, 2, '2026-04-18', '2026-04-22', 12.00,  48.00, 30.00,  78.00, 4, 'En_Uso'),
(5,  2, 2, '2026-02-10', '2026-02-14',  8.00,  32.00, 20.00,  52.00, 4, 'Completada');
 
-- María alquila a Gato (renter=1, tool de owner=2)
INSERT INTO rental (rental_id, tool_id, renter_id, start_date, end_date, daily_rate, subtotal_amount, deposit_amount, total_amount, total_days, `status`) VALUES
(6,  4, 1, '2026-04-26', '2026-04-28', 15.00,  30.00, 40.00,  70.00, 2, 'Pendiente'),
(7,  5, 1, '2026-03-05', '2026-03-07', 10.00,  20.00, 35.00,  55.00, 2, 'Rechazada'),
(8,  6, 1, '2026-04-29', '2026-05-02', 18.00,  54.00, 50.00, 104.00, 3, 'Aprobada'),
(9,  4, 1, '2026-04-19', '2026-04-21', 15.00,  45.00, 40.00,  85.00, 3, 'En_Uso'),
(10, 5, 1, '2026-01-15', '2026-01-20', 10.00,  50.00, 35.00,  85.00, 5, 'Completada'),
(11, 6, 1, '2026-02-20', '2026-02-23', 18.00,  54.00, 50.00, 104.00, 3, 'Completada');
 
-- ─────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────
INSERT INTO payment (rental_id, amount, `concept`, `status`, confirmed_by_owner, confirmed_by_renter) VALUES
(4,  48.00, 'Alquiler', 'Pagado',   TRUE,  TRUE),
(4,  30.00, 'Fianza',   'Pagado',   TRUE,  TRUE),
(5,  32.00, 'Alquiler', 'Pagado',   TRUE,  TRUE),
(5,  20.00, 'Fianza',   'Devuelto', TRUE,  TRUE),
(9,  45.00, 'Alquiler', 'Pagado',   TRUE,  TRUE),
(9,  40.00, 'Fianza',   'Pagado',   TRUE,  TRUE),
(10, 50.00, 'Alquiler', 'Pagado',   TRUE,  TRUE),
(10, 35.00, 'Fianza',   'Devuelto', TRUE,  TRUE),
(11, 54.00, 'Alquiler', 'Pagado',   TRUE,  TRUE),
(11, 50.00, 'Fianza',   'Devuelto', TRUE,  TRUE),
(1,  24.00, 'Alquiler', 'Pendiente', FALSE, FALSE),
(1,  30.00, 'Fianza',   'Pendiente', FALSE, FALSE),
(6,  30.00, 'Alquiler', 'Pendiente', FALSE, FALSE),
(6,  40.00, 'Fianza',   'Pendiente', FALSE, FALSE);
 
-- ─────────────────────────────────────────
-- REVIEWS (solo rentals Completadas)
-- ─────────────────────────────────────────
INSERT INTO review (rental_id, reviewer_id, reviewee_id, rating, comment) VALUES
(5,  2, 1, 5, 'Herramienta en perfecto estado, muy buen trato.'),
(5,  1, 2, 4, 'Arrendatario responsable y puntual.'),
(10, 1, 2, 5, 'Escalera en excelente estado, lo recomiendo.'),
(10, 2, 1, 4, 'Todo bien, sin incidencias.'),
(11, 1, 2, 5, 'Compresor potente y bien mantenido.'),
(11, 2, 1, 5, 'Perfecto arrendatario, volvería a alquilar.');


-- ─────────────────────────────────────────
-- TOOL AVAILABILITY RULES  (one per tool — base rule)
-- ─────────────────────────────────────────
INSERT INTO tool_availability_rule (tool_id, rule_type) VALUES
(1, 'Lunes_a_Viernes'),   -- Taladro Percutor Bosch   → solo entre semana
(2, 'Siempre'),            -- Calefactor de Aceite     → cualquier día
(3, 'Fines_de_semana'),    -- Lijadora Orbital          → solo fines de semana
(4, 'Siempre'),            -- Martillo Demoledor        → cualquier día
(5, 'Lunes_a_Viernes'),   -- Escalera Telescópica      → solo entre semana
(6, 'No_disponible');      -- Compresor de Aire         → bloqueado por defecto

-- ─────────────────────────────────────────
-- TOOL AVAILABILITY EXCEPTIONS  (overrides puntuales sobre la regla base)
-- ─────────────────────────────────────────
-- Tool 1 (Lunes_a_Viernes): habilitar un sábado puntual + bloquear un miércoles
INSERT INTO tool_availability_exception (tool_id, `date`, is_available) VALUES
(1, '2026-05-02', TRUE),   -- sábado habilitado como excepción
(1, '2026-05-06', FALSE),  -- miércoles bloqueado manualmente

-- Tool 2 (Siempre): bloquear días concretos que el dueño no puede atender
(2, '2026-05-01', FALSE),  -- festivo nacional bloqueado
(2, '2026-05-15', FALSE),  -- día bloqueado por el dueño

-- Tool 3 (Fines_de_semana): habilitar un viernes puntual
(3, '2026-05-08', TRUE),   -- viernes habilitado como excepción

-- Tool 4 (Siempre): bloquear un par de días por mantenimiento
(4, '2026-05-03', FALSE),
(4, '2026-05-04', FALSE),

-- Tool 6 (No_disponible por defecto): abrir una ventana puntual disponible
(6, '2026-05-10', TRUE),
(6, '2026-05-11', TRUE);