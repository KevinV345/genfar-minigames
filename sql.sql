-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 23-11-2025 a las 20:38:00
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
-- Estructura de tabla para la tabla `game_open`
--

DROP TABLE IF EXISTS `game_open`;
CREATE TABLE IF NOT EXISTS `game_open` (
  `pais_id` int NOT NULL,
  `game_id` int NOT NULL,
  `fecha` datetime NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `genfy_encuentra_escenarios`
--

DROP TABLE IF EXISTS `genfy_encuentra_escenarios`;
CREATE TABLE IF NOT EXISTS `genfy_encuentra_escenarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `imagen_fondo` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  `enlace` text,
  PRIMARY KEY (`id`),
  KEY `escenario_id` (`escenario_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  `tipo` enum('medicamento','bacteria') NOT NULL,
  `nombre_terapia` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `imagen_url` text NOT NULL,
  `enlace` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mision_genfy_terapias`
--

DROP TABLE IF EXISTS `mision_genfy_terapias`;
CREATE TABLE IF NOT EXISTS `mision_genfy_terapias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `medicamento_id` int NOT NULL,
  `bacteria_id` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_terapia_unica` (`medicamento_id`,`bacteria_id`),
  KEY `bacteria_id` (`bacteria_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paises`
--

DROP TABLE IF EXISTS `paises`;
CREATE TABLE IF NOT EXISTS `paises` (
  `legal1` text NOT NULL,
  `legal2` text NOT NULL,
  `legal3` text NOT NULL,
  `legal4` text NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `genfy_pregunta_visible` tinyint(1) DEFAULT '1',
  `genfy_encuentra_visible` tinyint(1) DEFAULT '1',
  `mision_genfy_visible` tinyint(1) DEFAULT '1',
  `ruleta_visible` tinyint(1) DEFAULT '1',
  `img` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'def.png',
  `lega1` text NOT NULL,
  `lega2` text NOT NULL,
  `lega3` text NOT NULL,
  `lega4` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paises_legal_imagenes`
--

DROP TABLE IF EXISTS `paises_legal_imagenes`;
CREATE TABLE IF NOT EXISTS `paises_legal_imagenes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `pais_id` int NOT NULL,
  `legal_numero` int NOT NULL COMMENT '1, 2, 3 o 4 - indica cual texto legal',
  `imagen_url` text NOT NULL,
  `orden` int DEFAULT '0' COMMENT 'Orden de visualización de la imagen',
  PRIMARY KEY (`id`),
  KEY `pais_id` (`pais_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paises_open`
--

DROP TABLE IF EXISTS `paises_open`;
CREATE TABLE IF NOT EXISTS `paises_open` (
  `pais_id` int NOT NULL,
  `fecha` datetime NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
-- Filtros para la tabla `mision_genfy_terapias`
--
ALTER TABLE `mision_genfy_terapias`
  ADD CONSTRAINT `mision_genfy_terapias_ibfk_1` FOREIGN KEY (`medicamento_id`) REFERENCES `mision_genfy_sprites` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mision_genfy_terapias_ibfk_2` FOREIGN KEY (`bacteria_id`) REFERENCES `mision_genfy_sprites` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `paises_legal_imagenes`
--
ALTER TABLE `paises_legal_imagenes`
  ADD CONSTRAINT `paises_legal_imagenes_ibfk_1` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`id`) ON DELETE CASCADE;

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
