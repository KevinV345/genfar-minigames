-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 17-09-2025 a las 01:42:57
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
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `genfy_encuentra_escenarios`
--

DROP TABLE IF EXISTS `genfy_encuentra_escenarios`;
CREATE TABLE IF NOT EXISTS `genfy_encuentra_escenarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `imagen_fondo` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `genfy_encuentra_escenarios`
--

INSERT INTO `genfy_encuentra_escenarios` (`id`, `imagen_fondo`) VALUES
(28, '/img/imagen-1758071688321-939753388.png');

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
(28, 4),
(28, 6);

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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `genfy_encuentra_objetos`
--

INSERT INTO `genfy_encuentra_objetos` (`id`, `escenario_id`, `imagen_objetivo`, `orden`, `enlace`) VALUES
(16, 28, '/img/imagen_objetivo-1758072308077-448895137.png', 1, 'http://localhost/phpmyadmin/index.php?route=/sql&pos=0&db=minijuegos&table=genfy_encuentra_objetos');

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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=140 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `logs_cambios`
--

INSERT INTO `logs_cambios` (`id`, `fecha`, `accion`, `detalle`) VALUES
(77, '2025-09-10 13:38:41', 'inició sesión', 'el usuario Administrador, inició sesión - Acceso al sistema - Panel de administración de minijuegos'),
(78, '2025-09-10 13:39:02', 'agregó una nueva pregunta', 'el usuario Administrador, agregó una nueva pregunta - Pregunta para Colombia, Peru, Ecuador - Juego Genfy Pregunta'),
(79, '2025-09-10 21:19:47', 'agregó una nueva pregunta', 'el usuario Administrador, agregó una nueva pregunta - Pregunta para Colombia, Peru, Ecuador - Juego Genfy Pregunta'),
(80, '2025-09-16 22:12:57', 'agregó una nueva pregunta', 'el usuario Administrador, agregó una nueva pregunta - Pregunta para Colombia - Juego Genfy Pregunta'),
(81, '2025-09-16 22:13:06', 'actualizó una pregunta', 'el usuario Administrador, actualizó una pregunta - Pregunta de Colombia - Juego Genfy Pregunta - ID: 3'),
(82, '2025-09-16 22:15:32', 'eliminó un tema de ruleta', 'el usuario Administrador, eliminó un tema de ruleta - Tema eliminado: toxicologia - Juego Ruleta - ID: 12'),
(83, '2025-09-16 22:15:36', 'agregó un nuevo tema de ruleta', 'el usuario Administrador, agregó un nuevo tema de ruleta - Tema: toxicologia - Juego Ruleta'),
(84, '2025-09-16 22:16:17', 'eliminó un tema de ruleta', 'el usuario Administrador, eliminó un tema de ruleta - Tema eliminado: toxicologia - Juego Ruleta - ID: 13'),
(85, '2025-09-16 22:26:17', 'agregó un nuevo país', 'el usuario Administrador, agregó un nuevo país - País: Colombia2 - Configuración general'),
(86, '2025-09-16 22:26:24', 'actualizó un país', 'el usuario Administrador, actualizó un país - País: Colombia2 - Configuración general - ID: 5'),
(87, '2025-09-16 22:27:42', 'creó un nuevo escenario', 'el usuario Administrador, creó un nuevo escenario - Escenario ID: 20'),
(88, '2025-09-16 22:39:12', 'eliminó un país', 'el usuario Administrador, eliminó un país - País eliminado: Colombia - Configuración general - ID: 2'),
(89, '2025-09-16 22:39:15', 'eliminó un país', 'el usuario Administrador, eliminó un país - País eliminado: Colombia2 - Configuración general - ID: 5'),
(90, '2025-09-16 22:39:20', 'agregó un nuevo país', 'el usuario Administrador, agregó un nuevo país - País: Colombia - Configuración general'),
(91, '2025-09-16 22:39:26', 'actualizó un país', 'el usuario Administrador, actualizó un país - País: Colombia - Configuración general - ID: 6'),
(92, '2025-09-16 22:40:58', 'creó un nuevo escenario', 'el usuario Administrador, creó un nuevo escenario - Escenario ID: 21'),
(93, '2025-09-16 22:41:08', 'actualizó un escenario', 'el usuario Administrador, actualizó un escenario - Escenario ID: 21'),
(94, '2025-09-16 22:51:06', 'agregó un nuevo país', 'el usuario Administrador, agregó un nuevo país - País: Venezuela - Configuración general'),
(95, '2025-09-16 22:52:22', 'creó un nuevo escenario', 'el usuario Administrador, creó un nuevo escenario - Escenario ID: 22'),
(96, '2025-09-16 22:52:29', 'actualizó un escenario', 'el usuario Administrador, actualizó un escenario - Escenario ID: 22'),
(97, '2025-09-16 23:02:40', 'agregó una nueva pregunta', 'el usuario Administrador, agregó una nueva pregunta - Pregunta para Colombia - Juego Genfy Pregunta'),
(98, '2025-09-16 23:04:16', 'eliminó un país', 'el usuario Administrador, eliminó un país - País eliminado: Venezuela - Configuración general - ID: 7'),
(99, '2025-09-16 23:04:22', 'agregó un nuevo país', 'el usuario Administrador, agregó un nuevo país - País: Colombia234 - Configuración general'),
(100, '2025-09-16 23:04:31', 'actualizó una pregunta', 'el usuario Administrador, actualizó una pregunta - Pregunta de Peru, Ecuador, Colombia, Colombia234 - Juego Genfy Pregunta - ID: 4'),
(101, '2025-09-16 23:05:37', 'eliminó un país', 'el usuario Administrador, eliminó un país - País eliminado: Colombia234 - Configuración general - ID: 8'),
(102, '2025-09-16 23:05:40', 'agregó un nuevo país', 'el usuario Administrador, agregó un nuevo país - País: Colombia2 - Configuración general'),
(103, '2025-09-16 23:05:56', 'agregó una nueva pregunta', 'el usuario Administrador, agregó una nueva pregunta - Pregunta para Peru, Ecuador, Colombia, Colombia2 - Juego Genfy Pregunta'),
(104, '2025-09-16 23:06:01', 'actualizó una pregunta', 'el usuario Administrador, actualizó una pregunta - Pregunta de Peru, Ecuador, Colombia, Colombia2 - Juego Genfy Pregunta - ID: 5'),
(105, '2025-09-16 23:07:34', 'creó un nuevo escenario', 'el usuario Administrador, creó un nuevo escenario - Escenario ID: 23'),
(106, '2025-09-16 23:07:40', 'actualizó un escenario', 'el usuario Administrador, actualizó un escenario - Escenario ID: 23'),
(107, '2025-09-16 23:07:55', 'creó un nuevo escenario', 'el usuario Administrador, creó un nuevo escenario - Escenario ID: 24'),
(108, '2025-09-16 23:30:54', 'eliminó un país', 'el usuario Administrador, eliminó un país - País eliminado: Colombia2 - Configuración general - ID: 9'),
(109, '2025-09-16 23:30:59', 'actualizó un país', 'el usuario Administrador, actualizó un país - País: Colombia - Configuración general - ID: 6'),
(110, '2025-09-16 23:31:09', 'agregó una nueva pregunta', 'el usuario Administrador, agregó una nueva pregunta - Pregunta para Colombia - Juego Genfy Pregunta'),
(111, '2025-09-16 23:31:16', 'actualizó una pregunta', 'el usuario Administrador, actualizó una pregunta - Pregunta de Colombia - Juego Genfy Pregunta - ID: 6'),
(112, '2025-09-16 23:31:44', 'creó un nuevo escenario', 'el usuario Administrador, creó un nuevo escenario - Escenario ID: 25'),
(113, '2025-09-16 23:31:49', 'actualizó un escenario', 'el usuario Administrador, actualizó un escenario - Escenario ID: 25'),
(114, '2025-09-16 23:36:03', 'creó un nuevo escenario', 'el usuario Administrador, creó un nuevo escenario - Escenario ID: 26'),
(115, '2025-09-16 23:36:08', 'actualizó un escenario', 'el usuario Administrador, actualizó un escenario - Escenario ID: 26'),
(116, '2025-09-16 23:41:00', 'agregó un nuevo objeto', 'el usuario Administrador, agregó un nuevo objeto - Objeto agregado al escenario 26'),
(117, '2025-09-16 23:43:04', 'actualizó un objeto', 'el usuario Administrador, actualizó un objeto - Objeto actualizado en el escenario - ID: 12'),
(118, '2025-09-16 23:44:04', 'eliminó un objeto', 'el usuario Administrador, eliminó un objeto - Objeto eliminado - ID: 12'),
(119, '2025-09-16 23:45:40', 'agregó un nuevo objeto', 'el usuario Administrador, agregó un nuevo objeto - Objeto agregado al escenario 26'),
(120, '2025-09-16 23:45:42', 'eliminó un objeto', 'el usuario Administrador, eliminó un objeto - Objeto eliminado - ID: 13'),
(121, '2025-09-16 23:45:50', 'agregó un nuevo objeto', 'el usuario Administrador, agregó un nuevo objeto - Objeto agregado al escenario 26'),
(122, '2025-09-16 23:48:43', 'creó un nuevo escenario', 'el usuario Administrador, creó un nuevo escenario - Escenario ID: 27'),
(123, '2025-09-16 23:48:55', 'agregó un nuevo objeto', 'el usuario Administrador, agregó un nuevo objeto - Objeto agregado al escenario 27'),
(124, '2025-09-17 00:00:06', 'guardó colliders', 'el usuario Administrador, guardó colliders - Objeto ID: 15'),
(125, '2025-09-17 00:16:08', 'eliminó un tema de ruleta', 'el usuario Administrador, eliminó un tema de ruleta - Tema eliminado: toxicologia - Juego Ruleta - ID: 14'),
(126, '2025-09-17 00:19:47', 'eliminó un tema de ruleta', 'el usuario Administrador, eliminó un tema de ruleta - Tema eliminado: toxicologia2 - Juego Ruleta - ID: 15'),
(127, '2025-09-17 00:33:48', 'agregó una nueva pregunta de ruleta', 'el usuario Administrador, agregó una nueva pregunta de ruleta - Pregunta para Colombia - Juego Ruleta'),
(128, '2025-09-17 00:41:20', 'eliminó un tema de ruleta', 'el usuario Administrador, eliminó un tema de ruleta - Tema eliminado: toxicologia - Juego Ruleta - ID: 16'),
(129, '2025-09-17 00:55:03', 'agregó una nueva pregunta de ruleta', 'el usuario Administrador, agregó una nueva pregunta de ruleta - Pregunta para Colombia - Juego Ruleta'),
(130, '2025-09-17 00:55:17', 'agregó una nueva pregunta de ruleta', 'el usuario Administrador, agregó una nueva pregunta de ruleta - Pregunta para Colombia - Juego Ruleta'),
(131, '2025-09-17 00:56:26', 'actualizó una pregunta de ruleta', 'el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de Colombia - Juego Ruleta - ID: 33'),
(132, '2025-09-17 00:56:41', 'actualizó un país', 'el usuario Administrador, actualizó un país - País: Colombia - Configuración general - ID: 6'),
(133, '2025-09-17 01:14:48', 'creó un nuevo escenario', 'el usuario Administrador, creó un nuevo escenario - Escenario ID: 28'),
(134, '2025-09-17 01:15:29', 'actualizó un escenario', 'el usuario Administrador, actualizó un escenario - Escenario ID: 28'),
(135, '2025-09-17 01:25:08', 'agregó un nuevo objeto', 'el usuario Administrador, agregó un nuevo objeto - Objeto agregado al escenario 28'),
(136, '2025-09-17 01:28:06', 'actualizó un objeto', 'el usuario Administrador, actualizó un objeto - Objeto actualizado en el escenario - ID: 16'),
(137, '2025-09-17 01:31:51', 'actualizó un objeto', 'el usuario Administrador, actualizó un objeto - Objeto actualizado en el escenario - ID: 16'),
(138, '2025-09-17 01:39:25', 'actualizó un objeto', 'el usuario Administrador, actualizó un objeto - Objeto actualizado en el escenario - ID: 16'),
(139, '2025-09-17 01:39:43', 'actualizó un objeto', 'el usuario Administrador, actualizó un objeto - Objeto actualizado en el escenario - ID: 16');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mision_genfy_sprites`
--

DROP TABLE IF EXISTS `mision_genfy_sprites`;
CREATE TABLE IF NOT EXISTS `mision_genfy_sprites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo` enum('medicamento','bacteria') NOT NULL,
  `imagen_url` text NOT NULL,
  `enlace` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `mision_genfy_sprites`
--

INSERT INTO `mision_genfy_sprites` (`id`, `tipo`, `imagen_url`, `enlace`) VALUES
(8, 'medicamento', '/img/imagen-1758073287544-934798050.png', 'http://localhost/phpmyadmin/index.php?route=/sql&pos=0&db=minijuegos&table=genfy_encuentra_objetos');

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
(8, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paises`
--

DROP TABLE IF EXISTS `paises`;
CREATE TABLE IF NOT EXISTS `paises` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `genfy_pregunta_visible` tinyint(1) DEFAULT '1',
  `genfy_encuentra_visible` tinyint(1) DEFAULT '1',
  `mision_genfy_visible` tinyint(1) DEFAULT '1',
  `ruleta_visible` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `paises`
--

INSERT INTO `paises` (`id`, `nombre`, `genfy_pregunta_visible`, `genfy_encuentra_visible`, `mision_genfy_visible`, `ruleta_visible`) VALUES
(3, 'Peru', 1, 1, 1, 1),
(4, 'Ecuador', 1, 1, 1, 1),
(6, 'Colombia', 1, 0, 1, 1);

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
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `ruleta_preguntas`
--

INSERT INTO `ruleta_preguntas` (`id`, `tema_id`, `pregunta`, `respuesta_correcta`, `respuesta_1`, `respuesta_2`, `respuesta_3`, `activa`) VALUES
(33, 17, '1+1', '2', '3', '4', '5', 1);

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
(33, 6);

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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `ruleta_temas`
--

INSERT INTO `ruleta_temas` (`id`, `nombre`, `color`, `activo`) VALUES
(17, 'toxicologia', '#3498db', 1);

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
