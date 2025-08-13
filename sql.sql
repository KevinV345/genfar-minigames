-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 11-08-2025 a las 21:23:53
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
  `escenario_id` int NOT NULL,
  `punto_x` float NOT NULL,
  `punto_y` float NOT NULL,
  `indice` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `escenario_id` (`escenario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `genfy_encuentra_escenarios`
--

DROP TABLE IF EXISTS `genfy_encuentra_escenarios`;
CREATE TABLE IF NOT EXISTS `genfy_encuentra_escenarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pais_id` int NOT NULL,
  `imagen_fondo` text NOT NULL,
  `imagen_objetivo` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pais_id` (`pais_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paises`
--

DROP TABLE IF EXISTS `paises`;
CREATE TABLE IF NOT EXISTS `paises` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  ADD CONSTRAINT `genfy_encuentra_colliders_ibfk_1` FOREIGN KEY (`escenario_id`) REFERENCES `genfy_encuentra_escenarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `genfy_encuentra_escenarios`
--
ALTER TABLE `genfy_encuentra_escenarios`
  ADD CONSTRAINT `genfy_encuentra_escenarios_ibfk_1` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`id`) ON DELETE CASCADE;

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
