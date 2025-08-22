-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 22-08-2025 a las 22:35:46
-- Versión del servidor: 9.1.0
-- Versión de PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";
SET FOREIGN_KEY_CHECKS = 0;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `minijuegos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `genfy_encuentra_colliders`
--

DROP TABLE IF EXISTS `genfy_encuentra_colliders`;
CREATE TABLE IF NOT EXISTS `genfy_encuentra_colliders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `objeto_id` int DEFAULT NULL,
  `punto_x` decimal(10,6) NOT NULL COMMENT 'X coordinate as percentage (0-100)',
  `punto_y` decimal(10,6) NOT NULL COMMENT 'Y coordinate as percentage (0-100)',
  `indice` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `objeto_id` (`objeto_id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `genfy_encuentra_colliders`
--

INSERT INTO `genfy_encuentra_colliders` (`id`, `objeto_id`, `punto_x`, `punto_y`, `indice`) VALUES
(23, 8, 53.209110, 62.640722, 0),
(24, 8, 60.455487, 48.665567, 1),
(25, 8, 69.772257, 57.361219, 2),
(26, 8, 60.869565, 72.578610, 3),
(27, 7, 10.973085, 12.111801, 0),
(28, 7, 22.774327, 8.074534, 1),
(29, 7, 28.571429, 31.987578, 2),
(30, 7, 16.977226, 37.267081, 3),
(31, 9, 55.900621, 65.217391, 0),
(32, 9, 69.565217, 72.049689, 1),
(33, 9, 78.260870, 30.434783, 2),
(34, 9, 63.975155, 23.913043, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `genfy_encuentra_escenarios`
--

DROP TABLE IF EXISTS `genfy_encuentra_escenarios`;
CREATE TABLE IF NOT EXISTS `genfy_encuentra_escenarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pais_id` int NOT NULL,
  `imagen_fondo` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pais_id` (`pais_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `genfy_encuentra_escenarios`
--

INSERT INTO `genfy_encuentra_escenarios` (`id`, `pais_id`, `imagen_fondo`) VALUES
(16, 2, '/img/image-1755900867375-138427226.png'),
(17, 2, '/img/image-1755900998477-523615190.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `genfy_encuentra_objetos`
--

DROP TABLE IF EXISTS `genfy_encuentra_objetos`;
CREATE TABLE IF NOT EXISTS `genfy_encuentra_objetos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `escenario_id` int NOT NULL,
  `imagen_objetivo` text NOT NULL,
  `orden` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `escenario_id` (`escenario_id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `genfy_encuentra_objetos`
--

INSERT INTO `genfy_encuentra_objetos` (`id`, `escenario_id`, `imagen_objetivo`, `orden`) VALUES
(7, 16, '/img/image-1755900879015-212599117.png', 1),
(8, 17, '/img/image-1755901012165-536415484.jpg', 1),
(9, 16, '/img/image-1755901560999-595575403.png', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `genfy_pregunta`
--

DROP TABLE IF EXISTS `genfy_pregunta`;
CREATE TABLE IF NOT EXISTS `genfy_pregunta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pais_id` int NOT NULL,
  `pregunta` text NOT NULL,
  `respuesta_correcta` varchar(255) NOT NULL,
  `respuesta_1` varchar(255) NOT NULL,
  `respuesta_2` varchar(255) NOT NULL,
  `respuesta_3` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pais_id` (`pais_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `logs_cambios`
--

DROP TABLE IF EXISTS `logs_cambios`;
CREATE TABLE IF NOT EXISTS `logs_cambios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fecha` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `accion` varchar(255) NOT NULL,
  `detalle` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `logs_cambios`
--

INSERT INTO `logs_cambios` (`id`, `fecha`, `accion`, `detalle`) VALUES
(1, '2025-08-11 21:28:48', 'Insert', 'Nuevo país: Colombia'),
(2, '2025-08-11 21:28:58', 'Insert', 'Nuevo escenario para país ID: 1'),
(3, '2025-08-11 21:32:25', 'Delete', 'Escenario eliminado ID: 1'),
(4, '2025-08-11 21:32:36', 'Insert', 'Nuevo escenario para país ID: 1'),
(5, '2025-08-11 21:34:51', 'Insert', 'Nuevo escenario para país ID: 1'),
(6, '2025-08-11 21:35:46', 'Delete', 'Escenario eliminado ID: 2'),
(7, '2025-08-11 21:37:10', 'Insert', 'Nuevo escenario para país ID: 1'),
(8, '2025-08-11 21:38:38', 'Delete', 'Escenario eliminado ID: 3'),
(9, '2025-08-11 21:38:40', 'Delete', 'Escenario eliminado ID: 4'),
(10, '2025-08-11 21:41:03', 'Insert', 'Nuevo escenario para país ID: 1'),
(11, '2025-08-11 21:41:15', 'Insert', 'Nuevo collider polígono para escenario ID: 5 con 4 puntos'),
(12, '2025-08-11 21:45:55', 'Insert', 'Nuevo usuario: kevin (vargasparrakevin@gmail.com)'),
(13, '2025-08-11 21:59:19', 'Delete', 'País eliminado ID: 1'),
(14, '2025-08-11 21:59:29', 'Insert', 'Nuevo país: Colombia'),
(15, '2025-08-11 22:04:55', 'Insert', 'Nuevo sprite tipo medicamento para país ID: 2'),
(16, '2025-08-11 22:05:19', 'Insert', 'Nuevo escenario para país ID: 2'),
(17, '2025-08-11 22:05:31', 'Delete', 'Escenario eliminado ID: 6'),
(18, '2025-08-11 22:08:47', 'Insert', 'Nuevo escenario para país ID: 2'),
(19, '2025-08-11 22:09:04', 'Delete', 'Escenario eliminado ID: 7'),
(20, '2025-08-11 22:09:13', 'Insert', 'Nuevo escenario para país ID: 2'),
(21, '2025-08-11 22:09:22', 'Insert', 'Nuevo collider polígono para escenario ID: 8 con 4 puntos'),
(22, '2025-08-11 22:15:41', 'Insert', 'Nuevo país: Peru'),
(23, '2025-08-11 22:15:53', 'Insert', 'Nuevo escenario para país ID: 3'),
(24, '2025-08-11 22:15:58', 'Insert', 'Nuevo collider polígono para escenario ID: 9 con 4 puntos'),
(25, '2025-08-11 22:20:53', 'Insert', 'Nuevo país: Ecuador'),
(26, '2025-08-22 21:23:03', 'agregó un nuevo escenario', 'el usuario Administrador, agregó un nuevo escenario - Escenario de Colombia - Juego Genfy Encuentra'),
(27, '2025-08-22 21:23:55', 'agregó un objeto', 'el usuario Administrador, agregó un objeto - Objeto \'wally\' al escenario de Colombia - Juego Genfy Encuentra'),
(28, '2025-08-22 21:34:45', 'agregó un nuevo sprite', 'el usuario Administrador, agregó un nuevo sprite - Sprite tipo \'medicamento\' para Colombia - Juego Misión Genfy'),
(29, '2025-08-22 21:36:02', 'eliminó un escenario', 'el usuario Administrador, eliminó un escenario - Escenario de Colombia eliminado - Juego Genfy Encuentra - ID: 10'),
(30, '2025-08-22 21:36:07', 'agregó un nuevo escenario', 'el usuario Administrador, agregó un nuevo escenario - Escenario para Colombia - Juego Genfy Encuentra'),
(31, '2025-08-22 21:36:29', 'agregó un objeto', 'el usuario Administrador, agregó un objeto - Objeto \'wally\' al escenario de Colombia - Juego Genfy Encuentra'),
(32, '2025-08-22 21:40:21', 'agregó un nuevo escenario', 'el usuario Administrador, agregó un nuevo escenario - Escenario para Colombia - Juego Genfy Encuentra'),
(33, '2025-08-22 21:40:34', 'agregó un objeto', 'el usuario Administrador, agregó un objeto - Objeto \'wally\' al escenario de Colombia - Juego Genfy Encuentra'),
(34, '2025-08-22 21:40:43', 'configuró colliders', 'el usuario Administrador, configuró colliders - Polígono de 4 puntos para objeto \'wally\' de Colombia - Juego Genfy Encuentra'),
(35, '2025-08-22 21:41:06', 'eliminó un escenario', 'el usuario Administrador, eliminó un escenario - Escenario de Colombia eliminado - Juego Genfy Encuentra - ID: 11'),
(36, '2025-08-22 21:41:08', 'eliminó un escenario', 'el usuario Administrador, eliminó un escenario - Escenario de Colombia eliminado - Juego Genfy Encuentra - ID: 12'),
(37, '2025-08-22 21:59:27', 'agregó un nuevo escenario', 'el usuario Administrador, agregó un nuevo escenario - Escenario para Colombia - Juego Genfy Encuentra'),
(38, '2025-08-22 22:00:35', 'eliminó un escenario', 'el usuario Administrador, eliminó un escenario - Escenario de Colombia eliminado - Juego Genfy Encuentra - ID: 13'),
(39, '2025-08-22 22:00:43', 'agregó un nuevo escenario', 'el usuario Administrador, agregó un nuevo escenario - Escenario para Colombia - Juego Genfy Encuentra'),
(40, '2025-08-22 22:06:28', 'eliminó un escenario', 'el usuario Administrador, eliminó un escenario - Escenario de Colombia eliminado - Juego Genfy Encuentra - ID: 14'),
(41, '2025-08-22 22:06:35', 'agregó un nuevo escenario', 'el usuario Administrador, agregó un nuevo escenario - Escenario para Colombia - Juego Genfy Encuentra'),
(42, '2025-08-22 22:14:09', 'eliminó un escenario', 'el usuario Administrador, eliminó un escenario - Escenario de Colombia eliminado - Juego Genfy Encuentra - ID: 15'),
(43, '2025-08-22 22:14:27', 'agregó un nuevo escenario', 'el usuario Administrador, agregó un nuevo escenario - Escenario para Colombia - Juego Genfy Encuentra'),
(44, '2025-08-22 22:14:39', 'agregó un objeto', 'el usuario Administrador, agregó un objeto - Objeto al escenario de Colombia - Juego Genfy Encuentra'),
(45, '2025-08-22 22:14:51', 'configuró colliders', 'el usuario Administrador, configuró colliders - Polígono de 4 puntos para objeto del escenario de Colombia - Juego Genfy Encuentra'),
(46, '2025-08-22 22:16:38', 'agregó un nuevo escenario', 'el usuario Administrador, agregó un nuevo escenario - Escenario para Colombia - Juego Genfy Encuentra'),
(47, '2025-08-22 22:16:52', 'agregó un objeto', 'el usuario Administrador, agregó un objeto - Objeto al escenario de Colombia - Juego Genfy Encuentra'),
(48, '2025-08-22 22:17:03', 'configuró colliders', 'el usuario Administrador, configuró colliders - Polígono de 4 puntos para objeto del escenario de Colombia - Juego Genfy Encuentra'),
(49, '2025-08-22 22:24:51', 'configuró colliders', 'el usuario Administrador, configuró colliders - Polígono de 4 puntos para objeto del escenario de Colombia - Juego Genfy Encuentra'),
(50, '2025-08-22 22:26:01', 'agregó un objeto', 'el usuario Administrador, agregó un objeto - Objeto al escenario de Colombia - Juego Genfy Encuentra'),
(51, '2025-08-22 22:26:14', 'configuró colliders', 'el usuario Administrador, configuró colliders - Polígono de 4 puntos para objeto del escenario de Colombia - Juego Genfy Encuentra');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mision_genfy_sprites`
--

DROP TABLE IF EXISTS `mision_genfy_sprites`;
CREATE TABLE IF NOT EXISTS `mision_genfy_sprites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pais_id` int NOT NULL,
  `tipo` enum('medicamento','bacteria') NOT NULL,
  `imagen_url` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pais_id` (`pais_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `mision_genfy_sprites`
--

INSERT INTO `mision_genfy_sprites` (`id`, `pais_id`, `tipo`, `imagen_url`) VALUES
(1, 2, 'medicamento', '/img/image-1754949895930-556720746.png'),
(2, 2, 'medicamento', '/img/imagen-1755898485792-456600864.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paises`
--

DROP TABLE IF EXISTS `paises`;
CREATE TABLE IF NOT EXISTS `paises` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `paises`
--

INSERT INTO `paises` (`id`, `nombre`) VALUES
(2, 'Colombia'),
(3, 'Peru'),
(4, 'Ecuador');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `contrasena_hash` varchar(255) NOT NULL,
  `es_admin` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo` (`correo`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `correo`, `contrasena_hash`, `es_admin`) VALUES
(1, 'Administrador', 'admin@minijuegos.com', '$2b$10$J1Om/N55Gp8H/5DkpAxCnOQRP6fm5g4CqBEqutgbZwtlcoGSiHSqu', 1),
(2, 'kevin', 'vargasparrakevin@gmail.com', '$2b$10$WaFmHPoXGazcUfjKekC4deRRRGVcG2BgH.XDFJQJr818GFWKv/Vve', 0);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `genfy_encuentra_colliders`
--
ALTER TABLE `genfy_encuentra_colliders`
  ADD CONSTRAINT `genfy_encuentra_colliders_ibfk_2` FOREIGN KEY (`objeto_id`) REFERENCES `genfy_encuentra_objetos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `genfy_encuentra_escenarios`
--
ALTER TABLE `genfy_encuentra_escenarios`
  ADD CONSTRAINT `genfy_encuentra_escenarios_ibfk_1` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `genfy_encuentra_objetos`
--
ALTER TABLE `genfy_encuentra_objetos`
  ADD CONSTRAINT `genfy_encuentra_objetos_ibfk_1` FOREIGN KEY (`escenario_id`) REFERENCES `genfy_encuentra_escenarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `genfy_pregunta`
--
ALTER TABLE `genfy_pregunta`
  ADD CONSTRAINT `genfy_pregunta_ibfk_1` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `mision_genfy_sprites`
--
ALTER TABLE `mision_genfy_sprites`
  ADD CONSTRAINT `mision_genfy_sprites_ibfk_1` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
SET FOREIGN_KEY_CHECKS = 1;