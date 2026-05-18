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
DROP TABLE IF EXISTS email_verification_token;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS user_notification_config;
DROP TABLE IF EXISTS user;
-- DROP TABLE IF EXISTS postal_code_geo;


CREATE TABLE IF NOT EXISTS user(
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20),
    profile_photo_key VARCHAR(255) comment 'Clave del archivo de la foto de perfil en S3',
    availability_description text DEFAULT NULL COMMENT 'Texto libre donde el usuario puede indicar sus horarios de disponibilidad',
    is_email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_notification_config (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    enable_email_notifications BOOLEAN DEFAULT TRUE,
    notify_on_new_rental_request BOOLEAN DEFAULT TRUE,
    notify_on_rental_update BOOLEAN DEFAULT TRUE,
    notify_on_return_reminder BOOLEAN DEFAULT TRUE,
    notify_on_new_review_received BOOLEAN DEFAULT TRUE,
    notify_on_new_message BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
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
    UNIQUE KEY unique_tool_rule (tool_id),
    FOREIGN KEY (tool_id) REFERENCES tool(tool_id)
);

CREATE TABLE IF NOT EXISTS tool_availability_exception (
    availability_exception_id  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tool_id       BIGINT UNSIGNED NOT NULL,
    `date`        DATE NOT NULL,
    UNIQUE KEY unique_tool_date (tool_id, `date`),
    FOREIGN KEY (tool_id) REFERENCES tool(tool_id)
);

CREATE TABLE IF NOT EXISTS tool_photo(
    id SERIAL PRIMARY KEY,
    tool_id BIGINT UNSIGNED NOT NULL,
    photo_key VARCHAR(255) NOT NULL comment 'Clave del archivo en S3',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tool_photo_tool_id_created (tool_id, created_at),
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
    INDEX idx_rental_tool_status_dates (tool_id, `status`, `start_date`, `end_date`),
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
    INDEX idx_review_reviewee (reviewee_id),
    FOREIGN KEY (rental_id) REFERENCES rental(rental_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES user(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewee_id) REFERENCES user(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `notification`(
    notification_id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    `type` ENUM('RENTAL_REQUEST', 'RENTAL_REQUEST_CONFIRMATION', 'RENTAL_REQUEST_REJECTED', 'RETURN_REMINDER', 'REVIEW_RECEIVED', 'OTHER') NOT NULL,
    `message` TEXT NOT NULL,
    `read` BOOLEAN DEFAULT FALSE,
    redirect_path VARCHAR(255) COMMENT 'Ruta a la que se redirige al hacer clic (ej: /rentals/123)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_room (
    room_id SERIAL PRIMARY KEY,
    rental_id BIGINT UNSIGNED NOT NULL COMMENT 'Es obligatorio la vinculación a un alquiler',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rental_id) REFERENCES rental(rental_id) ON DELETE CASCADE
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
    INDEX idx_city (city),
    INDEX idx_postal_code_geo_lat_lng (latitude, longitude)
);

CREATE TABLE IF NOT EXISTS email_verification_token (
    id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(36) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS session_token (
    token_id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);



INSERT INTO category (category_id, `name`, icon_key) VALUES
(1, 'Jardinería',    'categories/jardineria.png'),
(2, 'Carpintería',   'categories/carpinteria.png'),
(3, 'Limpieza',      'categories/limpieza.png'),
(4, 'Electricidad',  'categories/electricidad.png'),
(5, 'Pintura',       'categories/pintura.png'),
(6, 'Construcción',  'categories/construccion.png'),
(7, 'Hogar',         'categories/hogar.png');


INSERT INTO `user` (user_id, name, email, password, postal_code, profile_photo_key, availability_description) 
VALUES(1, 'María Qingxuan Garrido', 'mariaqingxuan@gmail.com', '$2a$10$ygqL5sVv6299/nnrxrzw3OVZGBpNlPUIQ1KyrOFt7gm0ShVWPXXKa', '28011', 'user_avatars/071a76be-bf03-4ac6-ac11-a084746f7037.png', 'Por las mañanas');
-- '$2a$10$EwPGd7Qx/wjCOfljl8cnVuf4YL77lZZND8Us.sj5hhQIxXuaYJ9yC'
INSERT INTO `user` (user_id, name, email, password, postal_code, profile_photo_key, availability_description) 
VALUES(2, 'Cris', 'andreedev2@gmail.com', '$2a$10$ygqL5sVv6299/nnrxrzw3OVZGBpNlPUIQ1KyrOFt7gm0ShVWPXXKa', '28044', 'user_avatars/cefa37a1-29ae-4a35-91c0-4a73311db8b0.png', 'Por las tardes');

INSERT INTO `user` (user_id, name, email, password, postal_code, profile_photo_key, availability_description) 
VALUES(3, 'Carlos Soler', 'carlos.soler@gmail.com', '$2a$10$ygqL5sVv6299/nnrxrzw3OVZGBpNlPUIQ1KyrOFt7gm0ShVWPXXKa', '28004', null, 'Siempre');

INSERT INTO `user` (user_id, name, email, password, postal_code, profile_photo_key, availability_description) 
VALUES(4, 'Elena Latina', 'elena.latina@gmail.com', '$2a$10$ygqL5sVv6299/nnrxrzw3OVZGBpNlPUIQ1KyrOFt7gm0ShVWPXXKa', '28012', null, 'Por la noche a partir de las 20h');

INSERT INTO `user` (user_id, name, email, password, postal_code, profile_photo_key, availability_description) 
VALUES(5, 'Jorge Granvia', 'jorge.gv@gmail.com', '$2a$10$ygqL5sVv6299/nnrxrzw3OVZGBpNlPUIQ1KyrOFt7gm0ShVWPXXKa', '28013', null, 'Solo entre las 16h y las 19h');

INSERT INTO `user` (user_id, name, email, password, postal_code, profile_photo_key, availability_description) 
VALUES(6, 'Lucía Fernández', 'lucia.fernandez@gmail.com', '$2a$10$ygqL5sVv6299/nnrxrzw3OVZGBpNlPUIQ1KyrOFt7gm0ShVWPXXKa', '28005', null, 'A todas horas');

INSERT INTO `user` (user_id, name, email, password, postal_code, profile_photo_key, availability_description) 
VALUES (7, 'Pablo Martínez', 'pablo.martinez@gmail.com', '$2a$10$ygqL5sVv6299/nnrxrzw3OVZGBpNlPUIQ1KyrOFt7gm0ShVWPXXKa', '28014', null, 'Por la madrugada solo');

INSERT INTO `user` (user_id, name, email, password, postal_code, profile_photo_key, availability_description)
VALUES (8, 'Raúl Jiménez', 'raul.jimenez@gmail.com', '$2a$10$ygqL5sVv6299/nnrxrzw3OVZGBpNlPUIQ1KyrOFt7gm0ShVWPXXKa', '28023', null, 'Tardes y noches');

INSERT INTO `user` (user_id, name, email, password, postal_code, profile_photo_key, availability_description)
VALUES (9, 'Sofía Herrera', 'sofia.herrera@gmail.com', '$2a$10$ygqL5sVv6299/nnrxrzw3OVZGBpNlPUIQ1KyrOFt7gm0ShVWPXXKa', '28035', null, 'Fines de semana');

INSERT INTO `user` (user_id, name, email, password, postal_code, profile_photo_key, availability_description)
VALUES (10, 'Tomás Vidal', 'tomas.vidal@gmail.com', '$2a$10$ygqL5sVv6299/nnrxrzw3OVZGBpNlPUIQ1KyrOFt7gm0ShVWPXXKa', '28029', null, 'Mañanas entre semana');

INSERT INTO `user` (user_id, name, email, password, postal_code, profile_photo_key, availability_description)
VALUES (11, 'Ana González', 'ana.gonzalez@gmail.com', '$2a$10$ygqL5sVv6299/nnrxrzw3OVZGBpNlPUIQ1KyrOFt7gm0ShVWPXXKa', '28050', null, 'Cualquier hora');

INSERT INTO `user` (user_id, name, email, password, postal_code, profile_photo_key, availability_description)
VALUES (12, 'Miguel Ángel Sanz', 'miguelangel.sanz@gmail.com', '$2a$10$ygqL5sVv6299/nnrxrzw3OVZGBpNlPUIQ1KyrOFt7gm0ShVWPXXKa', '28033', null, 'Por las tardes');

INSERT INTO `user` (user_id, name, email, password, postal_code, profile_photo_key, availability_description)
VALUES (13, 'Carmen López', 'carmen.lopez@gmail.com', '$2a$10$ygqL5sVv6299/nnrxrzw3OVZGBpNlPUIQ1KyrOFt7gm0ShVWPXXKa', '28016', null, 'De lunes a viernes');

INSERT INTO `user` (user_id, name, email, password, postal_code, profile_photo_key, availability_description)
VALUES (14, 'David Ruiz', 'david.ruiz@gmail.com', '$2a$10$ygqL5sVv6299/nnrxrzw3OVZGBpNlPUIQ1KyrOFt7gm0ShVWPXXKa', '28042', null, 'Fines de semana y festivos');

INSERT INTO `user` (user_id, name, email, password, postal_code, profile_photo_key, availability_description)
VALUES (15, 'Isabel Moreno', 'isabel.moreno@gmail.com', '$2a$10$ygqL5sVv6299/nnrxrzw3OVZGBpNlPUIQ1KyrOFt7gm0ShVWPXXKa', '28046', null, 'Mañanas');

INSERT INTO user_notification_config (user_id) VALUES
(1),
(2),
(3),
(4),
(5),
(6),
(7),
(8),
(9),
(10),
(11),
(12),
(13),
(14),
(15);

INSERT INTO tool (tool_id, owner_id, category_id, `name`, `description`, price_per_day, security_deposit, `condition`) VALUES
(1, 1, 2, 'Taladro Percutor Bosch',    'Taladro percutor profesional 800W con maletín y accesorios.', 12.00, 30.00, 'Muy_bueno'),
(2, 1, 3, 'Calefactor de Aceite',      'Calefactor de aceite 2000W, silencioso y eficiente.',          8.00, 20.00, 'Excelente'),
(3, 6, 5, 'Lijadora Orbital',          'Lijadora orbital 300W ideal para muebles y paredes.',           9.00, 25.00, 'Bueno'),
(4, 2, 6, 'Martillo Demoledor',        'Martillo demoledor 1500W para obras y reformas.',              15.00, 40.00, 'Muy_bueno'),
(5, 2, 1, 'Escalera Telescópica',      'Escalera aluminio telescópica hasta 4.5m.',                   10.00, 35.00, 'Excelente'),
(6, 7, 4, 'Compresor de Aire',         'Compresor 50L 2HP con kit de manguera y pistola.',             18.00, 50.00, 'Bueno'),
(7, 3, 1, 'Cortasetos Eléctrico Stihl', 'Cortasetos ligero y potente, ideal para mantenimiento de jardines urbanos.', 15.00, 40.00, 'Excelente'),
(8, 4, 3, 'Vaporeta Karcher SC4', 'Limpiadora de vapor profesional. Desinfecta sin químicos. Incluye accesorios.', 20.00, 60.00, 'Nuevo'),
(9, 5, 2, 'Sierra de Calar Makita', 'Sierra de calar profesional con ajuste pendular y cambio rápido de hoja.', 11.00, 30.00, 'Muy_bueno'),
(10, 8,  6, 'Amoladora Radial Makita',          'Amoladora radial 115mm 720W. Incluye discos de corte y desbaste.',                          11.00, 35.00, 'Muy_bueno'),
(11, 9,  7, 'Barbacoa Eléctrica de Sobremesa',  'Barbacoa eléctrica 2000W con bandeja antigoteo y tapa. Ideal para terrazas y balcones.',    10.00, 30.00, 'Excelente'),
(12, 10, 4, 'Cargador de Batería de Coche',     'Cargador inteligente 12/24V con modo mantenimiento y protección contra cortocircuitos.',     6.00, 25.00, 'Bueno'),
(13, 11, 7, 'Carretilla de Mudanza',             'Carretilla de carga hasta 200kg con ruedas antivibraciones. Perfecta para mudanzas.',        8.00, 20.00, 'Bueno'),
(14, 12, 1, 'Cortacésped Eléctrico',             'Cortacésped eléctrico 1400W con anchura de corte 37cm y recogedor de 40L.',                16.00, 45.00, 'Muy_bueno'),
(15, 13, 3, 'Hidrolimpiadora Kärcher K4',        'Hidrolimpiadora 130 bar 1800W con lanza vario y cepillo rotativo incluidos.',               18.00, 50.00, 'Excelente'),
(16, 14, 2, 'Maletín de Carracas, Llaves y Vasos', 'Juego de 108 piezas: carracas 1/4" y 1/2", llaves combinadas y vasos métricos.',         9.00, 30.00, 'Muy_bueno'),
(17, 15, 1, 'Soplador de Hojas a Batería',       'Soplador de hojas 18V sin cable. Caudal de 230 km/h. Batería y cargador incluidos.',        8.00, 25.00, 'Bueno');

INSERT INTO tool_photo (tool_id, photo_key) VALUES
(1, 'tool_photos/taladro.png'),
(2, 'tool_photos/calefactor2.jpg'),
(3, 'tool_photos/lijadora.png'),
(4, 'tool_photos/martillo_demoledor.png'),
(5, 'tool_photos/escalera_telescopica.png'),
(6, 'tool_photos/compresor_aire.png'),
(7, 'tool_photos/cortasetos.jpg'),
(8, 'tool_photos/vaporeta.jpg'),
(9, 'tool_photos/sierra_calar.jpg'),
(10, 'tool_photos/amoladora_radial_1.jpg'),
(10, 'tool_photos/amoladora_radial_2.jpg'),
(10, 'tool_photos/amoladora_radial_3.jpg'),
(10, 'tool_photos/amoladora_radial_4.jpg'),
(11, 'tool_photos/barbacoa_electrica1.png'),
(11, 'tool_photos/barbacoa_electrica2.png'),
(11, 'tool_photos/barbacoa_electrica3.png'),
(12, 'tool_photos/cargador_bateria_coche1.png'),
(12, 'tool_photos/cargador_bateria_coche2.png'),
(12, 'tool_photos/cargador_bateria_coche3.png'),
(13, 'tool_photos/carretilla_mudanza1.png'),
(13, 'tool_photos/carretilla_mudanza2.png'),
(14, 'tool_photos/cortacesped.jpg'),
(14, 'tool_photos/cortacesped2.jpg'),
(14, 'tool_photos/cortacesped3.jpg'),
(14, 'tool_photos/cortacesped4.jpg'),
(14, 'tool_photos/cortacesped5.jpg'),
(15, 'tool_photos/hidrolimpiadora.png'),
(16, 'tool_photos/maletin_carracas_llaves_y_vasos_1.png'),
(16, 'tool_photos/maletin_carracas_llaves_y_vasos_2.png'),
(17, 'tool_photos/soplador_hojas1.png'),
(17, 'tool_photos/soplador_hojas2.png'),
(17, 'tool_photos/soplador_hojas3.png');


INSERT INTO rental (rental_id, tool_id, renter_id, start_date, end_date, daily_rate, subtotal_amount, deposit_amount, total_amount, total_days, `status`) VALUES
(1,  1, 2, CURRENT_DATE() + INTERVAL 5  DAY, CURRENT_DATE() + INTERVAL 7  DAY, 12.00,  24.00, 30.00,  54.00, 2, 'Pendiente'),
(2,  2, 2, CURRENT_DATE() - INTERVAL 30 DAY, CURRENT_DATE() - INTERVAL 28 DAY,  8.00,  16.00, 20.00,  36.00, 2, 'Rechazada'),
(3,  3, 2, CURRENT_DATE() + INTERVAL 10 DAY, CURRENT_DATE() + INTERVAL 12 DAY,  9.00,  18.00, 25.00,  43.00, 2, 'Aprobada'),
(4,  1, 2, CURRENT_DATE() - INTERVAL 3  DAY, CURRENT_DATE() + INTERVAL 1  DAY, 12.00,  48.00, 30.00,  78.00, 4, 'En_Uso'),
(5,  2, 2, CURRENT_DATE() - INTERVAL 15 DAY, CURRENT_DATE() - INTERVAL 11 DAY,  8.00,  32.00, 20.00,  52.00, 4, 'Completada'),
(6,  4, 1, CURRENT_DATE() + INTERVAL 4  DAY, CURRENT_DATE() + INTERVAL 6  DAY, 15.00,  30.00, 40.00,  70.00, 2, 'Pendiente'),
(7,  5, 1, CURRENT_DATE() - INTERVAL 25 DAY, CURRENT_DATE() - INTERVAL 23 DAY, 10.00,  20.00, 35.00,  55.00, 2, 'Rechazada'),
(8,  6, 1, CURRENT_DATE() + INTERVAL 12 DAY, CURRENT_DATE() + INTERVAL 15 DAY, 18.00,  54.00, 50.00, 104.00, 3, 'Aprobada'),
(9,  4, 1, CURRENT_DATE() - INTERVAL 1  DAY, CURRENT_DATE() + INTERVAL 2  DAY, 15.00,  45.00, 40.00,  85.00, 3, 'En_Uso'),
(10, 5, 1, CURRENT_DATE() - INTERVAL 20 DAY, CURRENT_DATE() - INTERVAL 15 DAY, 10.00,  50.00, 35.00,  85.00, 5, 'Completada'),
(11, 6, 1, CURRENT_DATE() - INTERVAL 25 DAY, CURRENT_DATE() - INTERVAL 22 DAY, 18.00,  54.00, 50.00, 104.00, 3, 'Completada');
 
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
 
INSERT INTO review (
    rental_id, 
    reviewer_id, 
    reviewee_id, 
    review_type, 
    user_rating, 
    user_tags, 
    tool_rating, 
    tool_tags, 
    comment
) VALUES
(5, 2, 1, 'RENTER_TO_OWNER', 5, '["Muy amable", "Comunicación excelente"]', 5, '["Perfecto estado", "Como en la foto"]', 'Herramienta en perfecto estado, muy buen trato.'),
(5, 1, 2, 'OWNER_TO_RENTER', 4, '["Muy puntual", "Responsable"]', 5, '["Devuelta en perfecto estado", "Sin daños"]', 'Arrendatario responsable y puntual.'),
(10, 1, 2, 'RENTER_TO_OWNER', 5, '["Cumplió lo prometido", "Flexible"]', 5, '["Completa", "Muy útil"]', 'Escalera en excelente estado, lo recomiendo.'),
(10, 2, 1, 'OWNER_TO_RENTER', 4, '["Buen comunicador", "Responsable"]', 4, '["Limpia y ordenada"]', 'Todo bien, sin incidencias.');

INSERT INTO tool_availability_rule (tool_id, rule_type) VALUES
(1, 'Lunes_a_Viernes'),
(2, 'Siempre'),
(3, 'Fines_de_semana'),
(4, 'Siempre'), 
(5, 'Lunes_a_Viernes'), 
(6, 'No_disponible'),
(7, 'Fines_de_semana'),
(8, 'Siempre'),
(9, 'Lunes_a_Viernes');


INSERT INTO tool_availability_exception (tool_id, `date`) VALUES
(1, '2026-05-02'),
(1, '2026-05-06'),
(2, '2026-05-01'),
(2, '2026-05-15'),
(3, '2026-05-08'),
(4, '2026-05-03'),
(4, '2026-05-04'),
(6, '2026-05-10'),
(6, '2026-05-11');

INSERT INTO chat_room (room_id, rental_id, created_at, updated_at) VALUES
(1, 4, TIMESTAMP(CURRENT_DATE() - INTERVAL 5 DAY, '10:00:00'), TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '18:30:00')),
(2, 9, TIMESTAMP(CURRENT_DATE() - INTERVAL 5 DAY, '09:15:00'), TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '16:45:00')),
(3, 3, TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '11:00:00'), TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '20:10:00')),
(4, 8, TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '14:30:00'), TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '09:00:00'));

INSERT INTO chat_participant (room_id, user_id, last_read_at, joined_at) VALUES
(1, 1, TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '15:30:00'), TIMESTAMP(CURRENT_DATE() - INTERVAL 5 DAY, '10:00:00')),
(1, 2, TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '15:30:00'), TIMESTAMP(CURRENT_DATE() - INTERVAL 5 DAY, '10:05:00')),
(2, 2, TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '13:00:00'), TIMESTAMP(CURRENT_DATE() - INTERVAL 5 DAY, '09:15:00')),
(2, 1, TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '13:00:00'), TIMESTAMP(CURRENT_DATE() - INTERVAL 5 DAY, '09:20:00')),
(3, 6, TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '08:00:00'), TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '11:00:00')),
(3, 2, TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '08:00:00'), TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '11:05:00')),
(4, 7, TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '08:00:00'), TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '14:30:00')),
(4, 1, TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '08:00:00'), TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '14:35:00'));

INSERT INTO chat_message (room_id, sender_id, message_text, message_type, created_at) VALUES
(1, 2, '¡Hola! Me han aprobado el alquiler del taladro. ¿Quedamos para recogerlo?', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 5 DAY, '10:05:00')),
(1, 1, 'Hola Cris, sí claro. Puedo mañana por la mañana si te viene bien.', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 5 DAY, '10:20:00')),
(1, 2, 'Perfecto, ¿a las 10h en tu portal?', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 5 DAY, '10:25:00')),
(1, 1, 'Perfecto, te espero. El taladro viene con maletín y brocas incluidas.', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 5 DAY, '10:30:00')),
(1, 2, '¡Genial, muchas gracias!', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 5 DAY, '10:32:00')),
(1, 1, 'Alquiler iniciado. Ya tienes el taladro, recuerda devolverlo el día 22.', 'SYSTEM', TIMESTAMP(CURRENT_DATE() - INTERVAL 4 DAY, '10:15:00')),
(1, 2, 'El taladro va perfecto, justo lo que necesitaba para el proyecto.', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '16:00:00')),
(1, 1, 'Me alegra que te esté siendo útil. Cualquier cosa me dices.', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '18:30:00')),
(1, 2, 'Mañana te lo devuelvo, ¿a la misma hora?', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '19:00:00')),
(1, 1, 'Sí, perfecto. ¡Hasta mañana!', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '19:10:00')),

(2, 1, 'Hola, ¿puedo pasar a recoger el martillo demoledor esta tarde?', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 5 DAY, '09:20:00')),
(2, 2, 'Claro, estoy en casa a partir de las 17h.', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 5 DAY, '09:45:00')),
(2, 1, 'Perfecto, allí estaré. ¿Necesito llevar algo?', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 5 DAY, '09:50:00')),
(2, 2, 'No, solo el DNI para verificar. El equipo viene completo.', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 5 DAY, '10:00:00')),
(2, 1, 'Alquiler iniciado. Herramienta recogida.', 'SYSTEM', TIMESTAMP(CURRENT_DATE() - INTERVAL 4 DAY, '17:05:00')),
(2, 1, '¡Funciona genial! Ya he terminado la obra en el baño.', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '14:30:00')),
(2, 2, 'Qué bien, me alegra. Para mañana lo devuelves, ¿no?', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '15:00:00')),
(2, 1, 'Sí, mañana mismo. Muchas gracias por la herramienta.', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '15:05:00')),

(3, 2, 'Hola Lucía, vi que aprobaste el alquiler de la lijadora. ¿Cuándo puedo recogerla?', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '11:05:00')),
(3, 6, 'Hola Cris, el día 28 a la hora que quieras. Por la mañana mejor.', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '11:30:00')),
(3, 2, '¿A las 9h te viene bien?', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '11:35:00')),
(3, 6, 'Perfecto, te la tengo preparada con el papel de lija incluido.', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '11:40:00')),
(3, 2, '¿La devolución también en tu casa?', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '12:00:00')),
(3, 6, 'Sí, misma dirección. Sin problema.', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '12:05:00')),
(3, 2, '¿Tienes algún consejo para lijar madera antigua sin dañarla?', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '09:00:00')),
(3, 6, 'Empieza con papel grano 80 y termina con 180. Movimientos circulares.', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '10:15:00')),
(3, 2, 'Perfecto, muchas gracias por el tip!', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '10:20:00')),

(4, 1, 'Hola, acabo de ver que aprobaste mi solicitud. ¡Gracias!', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '14:35:00')),
(4, 7, 'Claro, ¿para qué lo necesitas si puede saberse?', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '15:00:00')),
(4, 1, 'Para pintar el garaje con pistola de aire. Es más rápido y uniforme.', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '15:05:00')),
(4, 7, 'Perfecto para eso. Ven el día 29 por la mañana y te explico cómo funciona.', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '15:10:00')),
(4, 1, '¿A las 10h?', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '15:12:00')),
(4, 7, 'Sí, perfecto. Trae ropa vieja, la pistola puede salpicar al inicio.', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '15:15:00')),
(4, 1, '¡Buen consejo! Gracias, hasta el día 29.', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 3 DAY, '15:18:00')),
(4, 7, '¿Todo bien con el compresor?', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '09:00:00')),
(4, 1, 'Aún no lo he recogido, mañana lo recojo. Todo ok.', 'TEXT', TIMESTAMP(CURRENT_DATE() - INTERVAL 1 DAY, '09:15:00'));


INSERT INTO `notification` (user_id, title, `type`, `message`, `read`, redirect_path) VALUES


-- USUARIO 1 (María)
(1, 'Nueva solicitud de alquiler',    'RENTAL_REQUEST',              'Cris quiere alquilar tu "Taladro Percutor Bosch" del 25 al 27 de abril.',                                    FALSE, '/app/my-tools/loans'),
(1, 'Solicitud aprobada con éxito',   'RENTAL_REQUEST_CONFIRMATION', 'Has aprobado el alquiler de tu "Lijadora Orbital" a Cris (28–30 abr).',                                      TRUE,  '/app/my-rentals'),
(1, 'Solicitud pendiente',            'RENTAL_REQUEST',              'Tu solicitud del "Martillo Demoledor" está pendiente de aprobación.',                                        TRUE,  '/app/my-tools/loans'),
(1, 'Solicitud rechazada',            'RENTAL_REQUEST_REJECTED',     'Tu solicitud de la "Escalera Telescópica" (5–7 mar) ha sido rechazada.',                                     TRUE,  '/app/my-rentals'),
(1, 'Solicitud aprobada',             'RENTAL_REQUEST_CONFIRMATION', 'Tu solicitud del "Compresor de Aire" ha sido aprobada (29 abr – 2 may). ¡Ya podeís coordinaros!',            FALSE, '/app/my-rentals'),
(1, 'Recordatorio de devolución',     'RETURN_REMINDER',             'Recuerda devolver el "Martillo Demoledor" antes del 21 de abril.',                                           TRUE,  null),
(1, 'Pago confirmado',                'OTHER',                       'El pago de 50,00 € por el alquiler de la "Escalera Telescópica" ha sido confirmado.',                        TRUE,  null),
(1, 'Fianza devuelta',                'OTHER',                       'Se han devuelto 35,00 € de fianza del alquiler de la "Escalera Telescópica".',                                TRUE, null),
(1, 'Pago confirmado',                'OTHER',                       'El pago de 54,00 € por el alquiler del "Compresor de Aire" ha sido confirmado.',                             TRUE,  null),
(1, 'Fianza devuelta',                'OTHER',                       'Se han devuelto 50,00 € de fianza del alquiler del "Compresor de Aire".',                                    FALSE, null),
(1, 'Nueva reseña recibida',          'REVIEW_RECEIVED',             'Cris te ha dejado una reseña de 5★ por el alquiler del "Calefactor de Aceite". ¡Enhorabuena!',              TRUE,  '/app/tool/2'),
(1, 'Nueva reseña recibida',          'REVIEW_RECEIVED',             'Cris te ha dejado una reseña de 4★ por el alquiler de la "Escalera Telescópica".',                           FALSE, '/app/tool/5'),

-- USUARIO 2 (Cris)
(2, 'Nueva solicitud de alquiler',    'RENTAL_REQUEST',              'María quiere alquilar tu "Martillo Demoledor" del 26 al 28 de abril.',                         FALSE, '/app/my-tools/loans'),
(2, 'Solicitud aprobada con éxito',   'RENTAL_REQUEST_CONFIRMATION', 'Has aprobado el alquiler de tu "Compresor de Aire" a María (29 abr – 2 may).',               TRUE,  '/app/my-tools/loans'),
(2, 'Solicitud pendiente',             'RENTAL_REQUEST',              'Tu solicitud del "Taladro Percutor Bosch" está pendiente de aprobación (25–27 abr).',         FALSE, '/app/my-rentals'),
(2, 'Solicitud rechazada',             'RENTAL_REQUEST_REJECTED',     'Tu solicitud del "Calefactor de Aceite" (1–3 mar) ha sido rechazada.',                        TRUE,  '/app/my-rentals'),
(2, 'Solicitud aprobada',             'RENTAL_REQUEST_CONFIRMATION', 'Tu solicitud de la "Lijadora Orbital" ha sido aprobada (28–30 abr). ¡Ya podeís coordinaros!',  TRUE,  '/app/my-rentals'),
(2, 'Recordatorio de devolución',     'RETURN_REMINDER',             'Recuerda devolver el "Taladro Percutor Bosch" antes del 22 de abril.',                        TRUE,  '/app/my-rentals'),
(2, 'Pago confirmado',                'OTHER',                       'El pago de 32,00 € por el alquiler del "Calefactor de Aceite" ha sido confirmado.',           TRUE,  null),
(2, 'Fianza devuelta',                'OTHER',                       'Se han devuelto 20,00 € de fianza del alquiler del "Calefactor de Aceite".',                 TRUE,  null),
(2, 'Pago confirmado',                'OTHER',                       'El pago de 48,00 € por el alquiler del "Taladro Percutor Bosch" ha sido confirmado.',         TRUE,  null),
(2, 'Nueva reseña recibida',          'REVIEW_RECEIVED',             'María te ha dejado una reseña de 4★ por el alquiler del "Calefactor de Aceite".',             TRUE,  '/app/tool/2'),
(2, 'Nueva reseña recibida',          'REVIEW_RECEIVED',             'María te ha dejado una reseña de 5★ por el alquiler de la "Escalera Telescópica".',           TRUE,  '/app/tool/5');