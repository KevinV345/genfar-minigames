-- Script SQL corregido y listo para usar en la consola de MySQL
-- Base de datos: railway

CREATE DATABASE minijuegos;
use minijuegos;
-- Script SQL corregido para la base de datos minijuegos
-- El orden de las tablas ha sido ajustado para evitar errores de clave foránea.

-- Eliminar tablas en orden inverso para evitar problemas de dependencias
DROP TABLE IF EXISTS genfy_encuentra_colliders;
DROP TABLE IF EXISTS genfy_encuentra_objetos;
DROP TABLE IF EXISTS genfy_encuentra_escenarios;
DROP TABLE IF EXISTS genfy_pregunta;
DROP TABLE IF EXISTS mision_genfy_sprites;
DROP TABLE IF EXISTS ruleta_preguntas;
DROP TABLE IF EXISTS ruleta_temas;
DROP TABLE IF EXISTS paises;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS logs_cambios;

CREATE DATABASE IF NOT EXISTS minijuegos;
use minijuegos;

-- Estructura de tabla paises (dependencia principal)
CREATE TABLE paises (
id int NOT NULL AUTO_INCREMENT,
nombre varchar(100) NOT NULL,
PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Datos de la tabla paises
INSERT INTO paises VALUES (2,'Colombia');
INSERT INTO paises VALUES (3,'Peru');
INSERT INTO paises VALUES (4,'Ecuador');

-- Estructura de tabla ruleta_temas
CREATE TABLE ruleta_temas (
id int NOT NULL AUTO_INCREMENT,
nombre varchar(100) NOT NULL,
color varchar(7) NOT NULL DEFAULT '#3498db' COMMENT 'Color hexadecimal para la ruleta',
activo tinyint(1) NOT NULL DEFAULT '1',
PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Datos de la tabla ruleta_temas
INSERT INTO ruleta_temas VALUES (1,'Cardiología','#ff1900',1);
INSERT INTO ruleta_temas VALUES (2,'Neurología','#8e44ad',1);
INSERT INTO ruleta_temas VALUES (3,'Gastroenterología','#27ae60',1);
INSERT INTO ruleta_temas VALUES (4,'Neumología','#2980b9',1);
INSERT INTO ruleta_temas VALUES (5,'Infectología','#f39c12',1);
INSERT INTO ruleta_temas VALUES (6,'Psiquiatría','#2c3e50',1);

-- Estructura de tabla ruleta_preguntas (depende de ruleta_temas)
CREATE TABLE ruleta_preguntas (
id int NOT NULL AUTO_INCREMENT,
tema_id int NOT NULL,
pregunta text NOT NULL,
respuesta_correcta varchar(255) NOT NULL,
respuesta_1 varchar(255) NOT NULL,
respuesta_2 varchar(255) NOT NULL,
respuesta_3 varchar(255) NOT NULL,
activa tinyint(1) NOT NULL DEFAULT '1',
PRIMARY KEY (id),
KEY tema_id (tema_id),
CONSTRAINT ruleta_preguntas_ibfk_1 FOREIGN KEY (tema_id) REFERENCES ruleta_temas (id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Datos de la tabla ruleta_preguntas
INSERT INTO ruleta_preguntas VALUES (14,1,'¿Cuál es el principal efecto adverso de los betabloqueadores?','Bradicardia','Taquicardia','Hipertensión','Insomnio',0);
INSERT INTO ruleta_preguntas VALUES (15,1,'¿Qué medicamento es de elección en una crisis hipertensiva?','Nitroprusiato','Paracetamol','Amoxicilina','Ibuprofeno',0);
INSERT INTO ruleta_preguntas VALUES (16,2,'¿Qué neurotransmisor está disminuido en la enfermedad de Parkinson?','Dopamina','Serotonina','Noradrenalina','GABA',1);
INSERT INTO ruleta_preguntas VALUES (17,2,'¿Cuál es el fármaco de primera línea para convulsiones tónico-clónicas?','Fenitoína','Omeprazol','Aspirina','Atorvastatina',1);
INSERT INTO ruleta_preguntas VALUES (18,3,'¿Qué inhibidor de bomba de protones se usa en úlcera gástrica?','Omeprazol','Aspirina','Losartán','Captopril',1);
INSERT INTO ruleta_preguntas VALUES (19,3,'¿Cuál es el mecanismo de acción de la ranitidina?','Bloqueo H2','Inhibición COX','Bloqueo dopaminérgico','Beta bloqueador',1);
INSERT INTO ruleta_preguntas VALUES (20,4,'¿Qué broncodilatador se usa en una crisis asmática?','Salbutamol','Aspirina','Furosemida','Metformina',1);
INSERT INTO ruleta_preguntas VALUES (21,4,'¿Cuál es el principal efecto adverso de los corticoides inhalados?','Candidiasis oral','Hipertensión','Hipoglucemia','Taquicardia',1);
INSERT INTO ruleta_preguntas VALUES (22,5,'¿Antibiótico de elección para faringitis estreptocócica?','Penicilina','Ibuprofeno','Metformina','Salbutamol',1);
INSERT INTO ruleta_preguntas VALUES (23,5,'¿Mecanismo de acción de los macrólidos?','Inhiben síntesis proteica 50S','Bloquean H2','Inhiben COX','Aumentan GABA',1);
INSERT INTO ruleta_preguntas VALUES (24,6,'¿Qué tipo de fármaco es la fluoxetina?','ISRS','Benzodiacepina','Antipsicótico','Beta bloqueador',1);
INSERT INTO ruleta_preguntas VALUES (25,6,'¿Principal efecto adverso de las benzodiacepinas?','Sedación','Hipertensión','Insomnio','Taquicardia',1);
INSERT INTO ruleta_preguntas VALUES (26,1,'¿Cuál es el principal efecto adverso de los betabloqueadores?','Bradicardia','Taquicardia','Hipertensión','Insomnio',1);
INSERT INTO ruleta_preguntas VALUES (27,1,'¿Qué medicamento es de elección en una crisis hipertensiva?','Nitroprusiato','Paracetamol','Amoxicilina','Ibuprofeno',1);

-- Estructura de tabla genfy_encuentra_escenarios (depende de paises)
CREATE TABLE genfy_encuentra_escenarios (
id int NOT NULL AUTO_INCREMENT,
pais_id int NOT NULL,
imagen_fondo text NOT NULL,
PRIMARY KEY (id),
KEY pais_id (pais_id),
CONSTRAINT genfy_encuentra_escenarios_ibfk_1 FOREIGN KEY (pais_id) REFERENCES paises (id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Datos de la tabla genfy_encuentra_escenarios
INSERT INTO genfy_encuentra_escenarios VALUES (16,2,'/img/image-1755900867375-138427226.png');
INSERT INTO genfy_encuentra_escenarios VALUES (17,2,'/img/image-1755900998477-523615190.jpg');

-- Estructura de tabla genfy_encuentra_objetos (depende de genfy_encuentra_escenarios)
CREATE TABLE genfy_encuentra_objetos (
id int NOT NULL AUTO_INCREMENT,
escenario_id int NOT NULL,
imagen_objetivo text NOT NULL,
orden int NOT NULL DEFAULT '1',
PRIMARY KEY (id),
KEY escenario_id (escenario_id),
CONSTRAINT genfy_encuentra_objetos_ibfk_1 FOREIGN KEY (escenario_id) REFERENCES genfy_encuentra_escenarios (id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Datos de la tabla genfy_encuentra_objetos
INSERT INTO genfy_encuentra_objetos VALUES (7,16,'/img/image-1755900879015-212599117.png',1);
INSERT INTO genfy_encuentra_objetos VALUES (8,17,'/img/image-1755901012165-536415484.jpg',1);
INSERT INTO genfy_encuentra_objetos VALUES (9,16,'/img/image-1755901560999-595575403.png',2);

-- Estructura de tabla genfy_encuentra_colliders (depende de genfy_encuentra_objetos)
CREATE TABLE genfy_encuentra_colliders (
id int NOT NULL AUTO_INCREMENT,
objeto_id int DEFAULT NULL,
punto_x decimal(10,6) NOT NULL COMMENT 'X coordinate as percentage (0-100)',
punto_y decimal(10,6) NOT NULL COMMENT 'Y coordinate as percentage (0-100)',
indice int NOT NULL,
PRIMARY KEY (id),
KEY objeto_id (objeto_id),
CONSTRAINT genfy_encuentra_colliders_ibfk_2 FOREIGN KEY (objeto_id) REFERENCES genfy_encuentra_objetos (id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Datos de la tabla genfy_encuentra_colliders
INSERT INTO genfy_encuentra_colliders VALUES (23,8,'53.209110','62.640722',0);
INSERT INTO genfy_encuentra_colliders VALUES (24,8,'60.455487','48.665567',1);
INSERT INTO genfy_encuentra_colliders VALUES (25,8,'69.772257','57.361219',2);
INSERT INTO genfy_encuentra_colliders VALUES (26,8,'60.869565','72.578610',3);
INSERT INTO genfy_encuentra_colliders VALUES (27,7,'10.973085','12.111801',0);
INSERT INTO genfy_encuentra_colliders VALUES (28,7,'22.774327','8.074534',1);
INSERT INTO genfy_encuentra_colliders VALUES (29,7,'28.571429','31.987578',2);
INSERT INTO genfy_encuentra_colliders VALUES (30,7,'16.977226','37.267081',3);
INSERT INTO genfy_encuentra_colliders VALUES (31,9,'55.900621','65.217391',0);
INSERT INTO genfy_encuentra_colliders VALUES (32,9,'69.565217','72.049689',1);
INSERT INTO genfy_encuentra_colliders VALUES (33,9,'78.260870','30.434783',2);
INSERT INTO genfy_encuentra_colliders VALUES (34,9,'63.975155','23.913043',3);

-- Estructura de tabla genfy_pregunta (depende de paises)
CREATE TABLE genfy_pregunta (
id int NOT NULL AUTO_INCREMENT,
pais_id int NOT NULL,
pregunta text NOT NULL,
respuesta_correcta varchar(255) NOT NULL,
respuesta_1 varchar(255) NOT NULL,
respuesta_2 varchar(255) NOT NULL,
respuesta_3 varchar(255) NOT NULL,
PRIMARY KEY (id),
KEY pais_id (pais_id),
CONSTRAINT genfy_pregunta_ibfk_1 FOREIGN KEY (pais_id) REFERENCES paises (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Estructura de tabla mision_genfy_sprites (depende de paises)
CREATE TABLE mision_genfy_sprites (
id int NOT NULL AUTO_INCREMENT,
pais_id int NOT NULL,
tipo enum('medicamento','bacteria') NOT NULL,
imagen_url text NOT NULL,
PRIMARY KEY (id),
KEY pais_id (pais_id),
CONSTRAINT mision_genfy_sprites_ibfk_1 FOREIGN KEY (pais_id) REFERENCES paises (id) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Datos de la tabla mision_genfy_sprites
INSERT INTO mision_genfy_sprites VALUES (1,2,'medicamento','/img/image-1754949895930-556720746.png');
INSERT INTO mision_genfy_sprites VALUES (2,2,'medicamento','/img/imagen-1755898485792-456600864.png');
INSERT INTO mision_genfy_sprites VALUES (3,2,'medicamento','/img/imagen-1757293619903-56080050.png');

-- Estructura de tabla usuarios
CREATE TABLE usuarios (
id int NOT NULL AUTO_INCREMENT,
nombre varchar(100) NOT NULL,
correo varchar(100) NOT NULL,
contrasena_hash varchar(255) NOT NULL,
es_admin tinyint(1) NOT NULL DEFAULT '0',
PRIMARY KEY (id),
UNIQUE KEY correo (correo)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Datos de la tabla usuarios
INSERT INTO usuarios VALUES (1,'Administrador','admin@minijuegos.com','2b10J1Om/N55Gp8H/5DkpAxCnOQRP6fm5g4CqBEqutgbZwtlcoGSiHSqu',1);
INSERT INTO usuarios VALUES (2,'kevin','vargasparrakevin@gmail.com','2b10WaFmHPoXGazcUfjKekC4deRRRGVcG2BgH.XDFJQJr818GFWKv/Vve',0);

-- Estructura de tabla logs_cambios
CREATE TABLE logs_cambios (
id int NOT NULL AUTO_INCREMENT,
fecha timestamp NULL DEFAULT CURRENT_TIMESTAMP,
accion varchar(255) NOT NULL,
detalle text,
PRIMARY KEY (id)
) ENGINE=InnoDB AUTO_INCREMENT=77 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Datos de la tabla logs_cambios
INSERT INTO logs_cambios VALUES (1,'2025-08-11 21:28:48.000','Insert','Nuevo país: Colombia');
INSERT INTO logs_cambios VALUES (2,'2025-08-11 21:28:58.000','Insert','Nuevo escenario para país ID: 1');
INSERT INTO logs_cambios VALUES (3,'2025-08-11 21:32:25.000','Delete','Escenario eliminado ID: 1');
INSERT INTO logs_cambios VALUES (4,'2025-08-11 21:32:36.000','Insert','Nuevo escenario para país ID: 1');
INSERT INTO logs_cambios VALUES (5,'2025-08-11 21:34:51.000','Insert','Nuevo escenario para país ID: 1');
INSERT INTO logs_cambios VALUES (6,'2025-08-11 21:35:46.000','Delete','Escenario eliminado ID: 2');
INSERT INTO logs_cambios VALUES (7,'2025-08-11 21:37:10.000','Insert','Nuevo escenario para país ID: 1');
INSERT INTO logs_cambios VALUES (8,'2025-08-11 21:38:38.000','Delete','Escenario eliminado ID: 3');
INSERT INTO logs_cambios VALUES (9,'2025-08-11 21:38:40.000','Delete','Escenario eliminado ID: 4');
INSERT INTO logs_cambios VALUES (10,'2025-08-11 21:41:03.000','Insert','Nuevo escenario para país ID: 1');
INSERT INTO logs_cambios VALUES (11,'2025-08-11 21:41:15.000','Insert','Nuevo collider polígono para escenario ID: 5 con 4 puntos');
INSERT INTO logs_cambios VALUES (12,'2025-08-11 21:45:55.000','Insert','Nuevo usuario: kevin (vargasparrakevin@gmail.com)');
INSERT INTO logs_cambios VALUES (13,'2025-08-11 21:59:19.000','Delete','País eliminado ID: 1');
INSERT INTO logs_cambios VALUES (14,'2025-08-11 21:59:29.000','Insert','Nuevo país: Colombia');
INSERT INTO logs_cambios VALUES (15,'2025-08-11 22:04:55.000','Insert','Nuevo sprite tipo medicamento para país ID: 2');
INSERT INTO logs_cambios VALUES (16,'2025-08-11 22:05:19.000','Insert','Nuevo escenario para país ID: 2');
INSERT INTO logs_cambios VALUES (17,'2025-08-11 22:05:31.000','Delete','Escenario eliminado ID: 6');
INSERT INTO logs_cambios VALUES (18,'2025-08-11 22:08:47.000','Insert','Nuevo escenario para país ID: 2');
INSERT INTO logs_cambios VALUES (19,'2025-08-11 22:09:04.000','Delete','Escenario eliminado ID: 7');
INSERT INTO logs_cambios VALUES (20,'2025-08-11 22:09:13.000','Insert','Nuevo escenario para país ID: 2');
INSERT INTO logs_cambios VALUES (21,'2025-08-11 22:09:22.000','Insert','Nuevo collider polígono para escenario ID: 8 con 4 puntos');
INSERT INTO logs_cambios VALUES (22,'2025-08-11 22:15:41.000','Insert','Nuevo país: Peru');
INSERT INTO logs_cambios VALUES (23,'2025-08-11 22:15:53.000','Insert','Nuevo escenario para país ID: 3');
INSERT INTO logs_cambios VALUES (24,'2025-08-11 22:15:58.000','Insert','Nuevo collider polígono para escenario ID: 9 con 4 puntos');
INSERT INTO logs_cambios VALUES (25,'2025-08-11 22:20:53.000','Insert','Nuevo país: Ecuador');
INSERT INTO logs_cambios VALUES (26,'2025-08-22 21:23:03.000','agregó un nuevo escenario','el usuario Administrador, agregó un nuevo escenario - Escenario de Colombia - Juego Genfy Encuentra');
INSERT INTO logs_cambios VALUES (27,'2025-08-22 21:23:55.000','agregó un objeto','el usuario Administrador, agregó un objeto - Objeto ''wally'' al escenario de Colombia - Juego Genfy Encuentra');
INSERT INTO logs_cambios VALUES (28,'2025-08-22 21:34:45.000','agregó un nuevo sprite','el usuario Administrador, agregó un nuevo sprite - Sprite tipo ''medicamento'' para Colombia - Juego Misión Genfy');
INSERT INTO logs_cambios VALUES (29,'2025-08-22 21:36:02.000','eliminó un escenario','el usuario Administrador, eliminó un escenario - Escenario de Colombia eliminado - Juego Genfy Encuentra - ID: 10');
INSERT INTO logs_cambios VALUES (30,'2025-08-22 21:36:07.000','agregó un nuevo escenario','el usuario Administrador, agregó un nuevo escenario - Escenario para Colombia - Juego Genfy Encuentra');
INSERT INTO logs_cambios VALUES (31,'2025-08-22 21:36:29.000','agregó un objeto','el usuario Administrador, agregó un objeto - Objeto ''wally'' al escenario de Colombia - Juego Genfy Encuentra');
INSERT INTO logs_cambios VALUES (32,'2025-08-22 21:40:21.000','agregó un nuevo escenario','el usuario Administrador, agregó un nuevo escenario - Escenario para Colombia - Juego Genfy Encuentra');
INSERT INTO logs_cambios VALUES (33,'2025-08-22 21:40:34.000','agregó un objeto','el usuario Administrador, agregó un objeto - Objeto ''wally'' al escenario de Colombia - Juego Genfy Encuentra');
INSERT INTO logs_cambios VALUES (34,'2025-08-22 21:40:43.000','configuró colliders','el usuario Administrador, configuró colliders - Polígono de 4 puntos para objeto ''wally'' de Colombia - Juego Genfy Encuentra');
INSERT INTO logs_cambios VALUES (35,'2025-08-22 21:41:06.000','eliminó un escenario','el usuario Administrador, eliminó un escenario - Escenario de Colombia eliminado - Juego Genfy Encuentra - ID: 11');
INSERT INTO logs_cambios VALUES (36,'2025-08-22 21:41:08.000','eliminó un escenario','el usuario Administrador, eliminó un escenario - Escenario de Colombia eliminado - Juego Genfy Encuentra - ID: 12');
INSERT INTO logs_cambios VALUES (37,'2025-08-22 21:59:27.000','agregó un nuevo escenario','el usuario Administrador, agregó un nuevo escenario - Escenario para Colombia - Juego Genfy Encuentra');
INSERT INTO logs_cambios VALUES (38,'2025-08-22 22:00:35.000','eliminó un escenario','el usuario Administrador, eliminó un escenario - Escenario de Colombia eliminado - Juego Genfy Encuentra - ID: 13');
INSERT INTO logs_cambios VALUES (39,'2025-08-22 22:00:43.000','agregó un nuevo escenario','el usuario Administrador, agregó un nuevo escenario - Escenario para Colombia - Juego Genfy Encuentra');
INSERT INTO logs_cambios VALUES (40,'2025-08-22 22:06:28.000','eliminó un escenario','el usuario Administrador, eliminó un escenario - Escenario de Colombia eliminado - Juego Genfy Encuentra - ID: 14');
INSERT INTO logs_cambios VALUES (41,'2025-08-22 22:06:35.000','agregó un nuevo escenario','el usuario Administrador, agregó un nuevo escenario - Escenario para Colombia - Juego Genfy Encuentra');
INSERT INTO logs_cambios VALUES (42,'2025-08-22 22:14:09.000','eliminó un escenario','el usuario Administrador, eliminó un escenario - Escenario de Colombia eliminado - Juego Genfy Encuentra - ID: 15');
INSERT INTO logs_cambios VALUES (43,'2025-08-22 22:14:27.000','agregó un nuevo escenario','el usuario Administrador, agregó un nuevo escenario - Escenario para Colombia - Juego Genfy Encuentra');
INSERT INTO logs_cambios VALUES (44,'2025-08-22 22:14:39.000','agregó un objeto','el usuario Administrador, agregó un objeto - Objeto al escenario de Colombia - Juego Genfy Encuentra');
INSERT INTO logs_cambios VALUES (45,'2025-08-22 22:14:51.000','configuró colliders','el usuario Administrador, configuró colliders - Polígono de 4 puntos para objeto del escenario de Colombia - Juego Genfy Encuentra');
INSERT INTO logs_cambios VALUES (46,'2025-08-22 22:16:38.000','agregó un nuevo escenario','el usuario Administrador, agregó un nuevo escenario - Escenario para Colombia - Juego Genfy Encuentra');
INSERT INTO logs_cambios VALUES (47,'2025-08-22 22:16:52.000','agregó un objeto','el usuario Administrador, agregó un objeto - Objeto al escenario de Colombia - Juego Genfy Encuentra');
INSERT INTO logs_cambios VALUES (48,'2025-08-22 22:17:03.000','configuró colliders','el usuario Administrador, configuró colliders - Polígono de 4 puntos para objeto del escenario de Colombia - Juego Genfy Encuentra');
INSERT INTO logs_cambios VALUES (49,'2025-08-22 22:24:51.000','configuró colliders','el usuario Administrador, configuró colliders - Polígono de 4 puntos para objeto del escenario de Colombia - Juego Genfy Encuentra');
INSERT INTO logs_cambios VALUES (50,'2025-08-22 22:26:01.000','agregó un objeto','el usuario Administrador, agregó un objeto - Objeto al escenario de Colombia - Juego Genfy Encuentra');
INSERT INTO logs_cambios VALUES (51,'2025-08-22 22:26:14.000','configuró colliders','el usuario Administrador, configuró colliders - Polígono de 4 puntos para objeto del escenario de Colombia - Juego Genfy Encuentra');
INSERT INTO logs_cambios VALUES (52,'2025-09-08 01:07:17.000','agregó un nuevo sprite','el usuario Administrador, agregó un nuevo sprite - Sprite tipo ''medicamento'' para Colombia - Juego Misión Genfy');
INSERT INTO logs_cambios VALUES (53,'2025-09-08 01:11:56.000','eliminó un tema de ruleta','el usuario Administrador, eliminó un tema de ruleta - Tema eliminado: Arte - Juego Ruleta de Temas - ID: 4');
INSERT INTO logs_cambios VALUES (54,'2025-09-08 01:12:15.000','eliminó un tema de ruleta','el usuario Administrador, eliminó un tema de ruleta - Tema eliminado: Ciencia - Juego Ruleta de Temas - ID: 2');
INSERT INTO logs_cambios VALUES (55,'2025-09-08 01:12:17.000','eliminó un tema de ruleta','el usuario Administrador, eliminó un tema de ruleta - Tema eliminado: Deportes - Juego Ruleta de Temas - ID: 3');
INSERT INTO logs_cambios VALUES (56,'2025-09-08 01:12:19.000','eliminó un tema de ruleta','el usuario Administrador, eliminó un tema de ruleta - Tema eliminado: Geografía - Juego Ruleta de Temas - ID: 5');
INSERT INTO logs_cambios VALUES (57,'2025-09-08 01:12:21.000','eliminó un tema de ruleta','el usuario Administrador, eliminó un tema de ruleta - Tema eliminado: Historia - Juego Ruleta de Temas - ID: 1');
INSERT INTO logs_cambios VALUES (58,'2025-09-08 01:12:22.000','eliminó un tema de ruleta','el usuario Administrador, eliminó un tema de ruleta - Tema eliminado: Tecnología - Juego Ruleta de Temas - ID: 6');
INSERT INTO logs_cambios VALUES (59,'2025-09-08 01:12:39.000','agregó un nuevo tema de ruleta','el usuario Administrador, agregó un nuevo tema de ruleta - Tema: toxicologia - Juego Ruleta de Temas');
INSERT INTO logs_cambios VALUES (60,'2025-09-08 01:13:04.000','agregó una nueva pregunta de ruleta','el usuario Administrador, agregó una nueva pregunta de ruleta - Pregunta para tema toxicologia - Juego Ruleta de Temas');
INSERT INTO logs_cambios VALUES (61,'2025-09-08 14:56:02.000','eliminó un tema de ruleta','el usuario Administrador, eliminó un tema de ruleta - Tema eliminado: toxicologia - Juego Ruleta de Temas - ID: 7');
INSERT INTO logs_cambios VALUES (62,'2025-09-08 15:23:15.000','agregó un nuevo tema de ruleta','el usuario Administrador, agregó un nuevo tema de ruleta - Tema: toxicologia - Juego Ruleta de Temas');
INSERT INTO logs_cambios VALUES (63,'2025-09-08 15:23:19.000','eliminó un tema de ruleta','el usuario Administrador, eliminó un tema de ruleta - Tema eliminado: toxicologia - Juego Ruleta de Temas - ID: 8');
INSERT INTO logs_cambios VALUES (64,'2025-09-08 15:27:58.000','actualizó un tema de ruleta','el usuario Administrador, actualizó un tema de ruleta - Tema: Cardiología - Juego Ruleta de Temas - ID: 1');
INSERT INTO logs_cambios VALUES (65,'2025-09-08 15:28:03.000','actualizó un tema de ruleta','el usuario Administrador, actualizó un tema de ruleta - Tema: Cardiología2 - Juego Ruleta de Temas - ID: 1');
INSERT INTO logs_cambios VALUES (66,'2025-09-08 15:28:09.000','actualizó un tema de ruleta','el usuario Administrador, actualizó un tema de ruleta - Tema: Cardiología - Juego Ruleta de Temas - ID: 1');
INSERT INTO logs_cambios VALUES (67,'2025-09-08 15:28:22.000','actualizó una pregunta de ruleta','el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de tema Cardiología - Juego Ruleta de Temas - ID: 14');
INSERT INTO logs_cambios VALUES (68,'2025-09-08 15:29:16.000','actualizó una pregunta de ruleta','el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de tema Cardiología - Juego Ruleta de Temas - ID: 15');
INSERT INTO logs_cambios VALUES (69,'2025-09-08 15:31:24.000','actualizó una pregunta de ruleta','el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de tema Gastroenterología - Juego Ruleta de Temas - ID: 19');
INSERT INTO logs_cambios VALUES (70,'2025-09-08 15:31:32.000','actualizó una pregunta de ruleta','el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de tema Gastroenterología - Juego Ruleta de Temas - ID: 19');
INSERT INTO logs_cambios VALUES (71,'2025-09-08 15:31:50.000','agregó una nueva pregunta de ruleta','el usuario Administrador, agregó una nueva pregunta de ruleta - Pregunta para tema Cardiología - Juego Ruleta de Temas');
INSERT INTO logs_cambios VALUES (72,'2025-09-08 15:33:32.000','agregó una nueva pregunta de ruleta','el usuario Administrador, agregó una nueva pregunta de ruleta - Pregunta para tema Cardiología - Juego Ruleta de Temas');
INSERT INTO logs_cambios VALUES (73,'2025-09-08 15:34:58.000','actualizó una pregunta de ruleta','el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de tema Cardiología - Juego Ruleta de Temas - ID: 26');
INSERT INTO logs_cambios VALUES (74,'2025-09-08 15:36:13.000','actualizó una pregunta de ruleta','el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de tema Cardiología - Juego Ruleta de Temas - ID: 27');
INSERT INTO logs_cambios VALUES (75,'2025-09-08 15:46:29.000','inició sesión','el usuario Administrador, inició sesión - Acceso al sistema - Panel de administración de minijuegos');
INSERT INTO logs_cambios VALUES (76,'2025-09-08 17:29:00.000','inició sesión','el usuario Administrador, inició sesión - Acceso al sistema - Panel de administración de minijuegos');