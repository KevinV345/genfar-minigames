CREATE DATABASE minijuegos;
use minijuegos;

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 10-09-2025 a las 21:37:34
-- Versión del servidor: 9.1.0
-- Versión de PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


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
  `punto_x` decimal(10,6) NOT NULL,
  `punto_y` decimal(10,6) NOT NULL,
  `indice` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `objeto_id` (`objeto_id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `genfy_encuentra_colliders`
--

INSERT INTO `genfy_encuentra_colliders` (`id`, `objeto_id`, `punto_x`, `punto_y`, `indice`) VALUES
(35, 11, 11.076605, 12.810559, 0),
(36, 11, 23.084886, 7.531056, 1),
(37, 11, 28.674948, 31.133540, 2),
(38, 11, 15.838509, 36.723602, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `genfy_encuentra_escenarios`
--

DROP TABLE IF EXISTS `genfy_encuentra_escenarios`;
CREATE TABLE IF NOT EXISTS `genfy_encuentra_escenarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `imagen_fondo` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `genfy_encuentra_escenarios`
--

INSERT INTO `genfy_encuentra_escenarios` (`id`, `imagen_fondo`) VALUES
(19, '/img/image-1757518290600-158825211.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `genfy_encuentra_escenarios_paises`
--

DROP TABLE IF EXISTS `genfy_encuentra_escenarios_paises`;
CREATE TABLE IF NOT EXISTS `genfy_encuentra_escenarios_paises` (
  `escenario_id` int NOT NULL,
  `pais_id` int NOT NULL,
  PRIMARY KEY (`escenario_id`,`pais_id`),
  KEY `pais_id` (`pais_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `genfy_encuentra_escenarios_paises`
--

INSERT INTO `genfy_encuentra_escenarios_paises` (`escenario_id`, `pais_id`) VALUES
(19, 2),
(19, 3),
(19, 4);

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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `genfy_encuentra_objetos`
--

INSERT INTO `genfy_encuentra_objetos` (`id`, `escenario_id`, `imagen_objetivo`, `orden`) VALUES
(11, 19, '/img/imagen_objetivo-1757518306900-392565176.png', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `genfy_pregunta`
--

DROP TABLE IF EXISTS `genfy_pregunta`;
CREATE TABLE IF NOT EXISTS `genfy_pregunta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pregunta` text NOT NULL,
  `respuesta_correcta` varchar(255) NOT NULL,
  `respuesta_1` varchar(255) NOT NULL,
  `respuesta_2` varchar(255) NOT NULL,
  `respuesta_3` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `genfy_pregunta`
--

INSERT INTO `genfy_pregunta` (`id`, `pregunta`, `respuesta_correcta`, `respuesta_1`, `respuesta_2`, `respuesta_3`) VALUES
(2, '1+1', '2', '3', '4', '5');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `genfy_pregunta_paises`
--

DROP TABLE IF EXISTS `genfy_pregunta_paises`;
CREATE TABLE IF NOT EXISTS `genfy_pregunta_paises` (
  `pregunta_id` int NOT NULL,
  `pais_id` int NOT NULL,
  PRIMARY KEY (`pregunta_id`,`pais_id`),
  KEY `pais_id` (`pais_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `genfy_pregunta_paises`
--

INSERT INTO `genfy_pregunta_paises` (`pregunta_id`, `pais_id`) VALUES
(2, 2),
(2, 3),
(2, 4);

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
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `logs_cambios`
--

INSERT INTO `logs_cambios` (`id`, `fecha`, `accion`, `detalle`) VALUES
(77, '2025-09-10 13:38:41', 'inició sesión', 'el usuario Administrador, inició sesión - Acceso al sistema - Panel de administración de minijuegos'),
(78, '2025-09-10 13:39:02', 'agregó una nueva pregunta', 'el usuario Administrador, agregó una nueva pregunta - Pregunta para Colombia, Peru, Ecuador - Juego Genfy Pregunta'),
(79, '2025-09-10 21:19:47', 'agregó una nueva pregunta', 'el usuario Administrador, agregó una nueva pregunta - Pregunta para Colombia, Peru, Ecuador - Juego Genfy Pregunta');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mision_genfy_sprites`
--

DROP TABLE IF EXISTS `mision_genfy_sprites`;
CREATE TABLE IF NOT EXISTS `mision_genfy_sprites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` enum('medicamento','bacteria') NOT NULL,
  `imagen_url` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `mision_genfy_sprites`
--

INSERT INTO `mision_genfy_sprites` (`id`, `tipo`, `imagen_url`) VALUES
(4, 'medicamento', '/img/imagen-1757518078932-9158939.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mision_genfy_sprites_paises`
--

DROP TABLE IF EXISTS `mision_genfy_sprites_paises`;
CREATE TABLE IF NOT EXISTS `mision_genfy_sprites_paises` (
  `sprite_id` int NOT NULL,
  `pais_id` int NOT NULL,
  PRIMARY KEY (`sprite_id`,`pais_id`),
  KEY `pais_id` (`pais_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `mision_genfy_sprites_paises`
--

INSERT INTO `mision_genfy_sprites_paises` (`sprite_id`, `pais_id`) VALUES
(4, 2),
(4, 3),
(4, 4);

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
-- Estructura de tabla para la tabla `ruleta_preguntas`
--

DROP TABLE IF EXISTS `ruleta_preguntas`;
CREATE TABLE IF NOT EXISTS `ruleta_preguntas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tema_id` int NOT NULL,
  `pregunta` text NOT NULL,
  `respuesta_correcta` varchar(255) NOT NULL,
  `respuesta_1` varchar(255) NOT NULL,
  `respuesta_2` varchar(255) NOT NULL,
  `respuesta_3` varchar(255) NOT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `tema_id` (`tema_id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `ruleta_preguntas`
--

INSERT INTO `ruleta_preguntas` (`id`, `tema_id`, `pregunta`, `respuesta_correcta`, `respuesta_1`, `respuesta_2`, `respuesta_3`, `activa`) VALUES
(30, 12, '1', '2', '3', '4', '5', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ruleta_preguntas_paises`
--

DROP TABLE IF EXISTS `ruleta_preguntas_paises`;
CREATE TABLE IF NOT EXISTS `ruleta_preguntas_paises` (
  `pregunta_id` int NOT NULL,
  `pais_id` int NOT NULL,
  PRIMARY KEY (`pregunta_id`,`pais_id`),
  KEY `pais_id` (`pais_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `ruleta_preguntas_paises`
--

INSERT INTO `ruleta_preguntas_paises` (`pregunta_id`, `pais_id`) VALUES
(30, 2),
(30, 3),
(30, 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ruleta_temas`
--

DROP TABLE IF EXISTS `ruleta_temas`;
CREATE TABLE IF NOT EXISTS `ruleta_temas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `color` varchar(7) NOT NULL DEFAULT '#3498db',
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `ruleta_temas`
--

INSERT INTO `ruleta_temas` (`id`, `nombre`, `color`, `activo`) VALUES
(12, 'toxicologia', '#ff0000', 1);

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
(1, 'Administrador', 'admin@minijuegos.com', '$2b$10$J1Om/N55Gp8H/5DkpAxCnOQRP6fm5g4CqBEqutgbZwtlcoGSiHSqu', 1);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `genfy_encuentra_colliders`
--
ALTER TABLE `genfy_encuentra_colliders`
  ADD CONSTRAINT `genfy_encuentra_colliders_ibfk_2` FOREIGN KEY (`objeto_id`) REFERENCES `genfy_encuentra_objetos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `genfy_encuentra_escenarios_paises`
--
ALTER TABLE `genfy_encuentra_escenarios_paises`
  ADD CONSTRAINT `genfy_encuentra_escenarios_paises_ibfk_1` FOREIGN KEY (`escenario_id`) REFERENCES `genfy_encuentra_escenarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `genfy_encuentra_escenarios_paises_ibfk_2` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `genfy_encuentra_objetos`
--
ALTER TABLE `genfy_encuentra_objetos`
  ADD CONSTRAINT `genfy_encuentra_objetos_ibfk_1` FOREIGN KEY (`escenario_id`) REFERENCES `genfy_encuentra_escenarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `genfy_pregunta_paises`
--
ALTER TABLE `genfy_pregunta_paises`
  ADD CONSTRAINT `genfy_pregunta_paises_ibfk_1` FOREIGN KEY (`pregunta_id`) REFERENCES `genfy_pregunta` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `genfy_pregunta_paises_ibfk_2` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `mision_genfy_sprites_paises`
--
ALTER TABLE `mision_genfy_sprites_paises`
  ADD CONSTRAINT `mision_genfy_sprites_paises_ibfk_1` FOREIGN KEY (`sprite_id`) REFERENCES `mision_genfy_sprites` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mision_genfy_sprites_paises_ibfk_2` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `ruleta_preguntas`
--
ALTER TABLE `ruleta_preguntas`
  ADD CONSTRAINT `ruleta_preguntas_ibfk_1` FOREIGN KEY (`tema_id`) REFERENCES `ruleta_temas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `ruleta_preguntas_paises`
--
ALTER TABLE `ruleta_preguntas_paises`
  ADD CONSTRAINT `ruleta_preguntas_paises_ibfk_1` FOREIGN KEY (`pregunta_id`) REFERENCES `ruleta_preguntas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ruleta_preguntas_paises_ibfk_2` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
