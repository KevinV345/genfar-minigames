-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1:3306
-- Tiempo de generación: 17-09-2025 a las 21:47:43
-- Versión del servidor: 9.1.0
-- Versión de PHP: 8.3.14
drop database if exists minijuegos;
CREATE database minijuegos;
use minijuegos;
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
) ENGINE=InnoDB AUTO_INCREMENT=46 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `genfy_encuentra_colliders`
--

INSERT INTO `genfy_encuentra_colliders` (`id`, `objeto_id`, `punto_x`, `punto_y`, `indice`) VALUES
(42, 17, 10.766046, 12.330163, 0),
(43, 17, 23.188406, 7.361219, 1),
(44, 17, 29.606625, 30.963703, 2),
(45, 17, 16.356108, 36.553766, 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `genfy_encuentra_escenarios`
--

DROP TABLE IF EXISTS `genfy_encuentra_escenarios`;
CREATE TABLE IF NOT EXISTS `genfy_encuentra_escenarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `imagen_fondo` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `genfy_encuentra_escenarios`
--

INSERT INTO `genfy_encuentra_escenarios` (`id`, `imagen_fondo`) VALUES
(32, '/img/imagen-1758121953371-847381927.png');

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
(32, 2);

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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `genfy_encuentra_objetos`
--

INSERT INTO `genfy_encuentra_objetos` (`id`, `escenario_id`, `imagen_objetivo`, `orden`, `enlace`) VALUES
(17, 32, '/img/imagen_objetivo-1758121967002-805143331.png', 1, '');

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
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `genfy_pregunta`
--

INSERT INTO `genfy_pregunta` (`id`, `pregunta`, `respuesta_correcta`, `respuesta_1`, `respuesta_2`, `respuesta_3`) VALUES
(8, '¿Cuál es la capital de Australia?', 'Canberra', 'Sídney', 'Melbourne', 'Brisbane'),
(9, '¿Qué planeta es conocido como el \"Planeta Rojo\"?', 'Marte', 'Júpiter', 'Venus', 'Saturno'),
(10, '¿Quién pintó la Mona Lisa?', 'Leonardo da Vinci', 'Pablo Picasso', 'Vincent van Gogh', 'Claude Monet'),
(11, '¿En qué año llegó el hombre a la luna?', '1969', '1957', '1975', '1981'),
(12, '¿Cuál es el océano más grande del mundo?', 'Océano Pacífico', 'Océano Atlántico', 'Océano Índico', 'Océano Ártico'),
(13, '¿Qué animal es el mamífero terrestre más grande?', 'Elefante africano', 'Jirafa', 'Rinoceronte', 'Hipopótamo'),
(14, '¿Cuál es el elemento químico con el símbolo \"O\"?', 'Oxígeno', 'Oro', 'Osmio', 'Plata'),
(15, '¿Qué país es el mayor productor de café del mundo?', 'Brasil', 'Colombia', 'Vietnam', 'Etiopía'),
(16, '¿Cuántos huesos tiene el cuerpo humano adulto?', '206', '200', '210', '212'),
(17, '¿Cuál es el río más largo del mundo?', 'Río Nilo', 'Río Amazonas', 'Río Misisipi', 'Río Yangtsé');

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
(8, 2),
(9, 2),
(10, 2),
(11, 2),
(12, 2),
(13, 2),
(14, 2),
(15, 2),
(16, 2),
(17, 2);

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
) ENGINE=InnoDB AUTO_INCREMENT=181 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(139, '2025-09-17 01:39:43', 'actualizó un objeto', 'el usuario Administrador, actualizó un objeto - Objeto actualizado en el escenario - ID: 16'),
(140, '2025-09-17 14:27:01', 'actualizó un usuario', 'el usuario Administrador2, actualizó un usuario - Usuario: Administrador2 (admin@minijuegos.com) - Sistema de administración - ID: 1'),
(141, '2025-09-17 14:27:20', 'actualizó un usuario', 'el usuario Administrador, actualizó un usuario - Usuario: Administrador (admin@minijuegos.com) - Sistema de administración - ID: 1'),
(142, '2025-09-17 14:51:47', 'actualizó un país', 'el usuario Administrador, actualizó un país - País: Colombia - Configuración general - ID: 6'),
(143, '2025-09-17 14:52:00', 'actualizó un país', 'el usuario Administrador, actualizó un país - País: Colombia - Configuración general - ID: 6'),
(144, '2025-09-17 14:52:20', 'agregó una nueva pregunta', 'el usuario Administrador, agregó una nueva pregunta - Pregunta para Colombia - Juego Genfy Pregunta'),
(145, '2025-09-17 14:52:27', 'actualizó una pregunta', 'el usuario Administrador, actualizó una pregunta - Pregunta de Colombia - Juego Genfy Pregunta - ID: 7'),
(146, '2025-09-17 14:52:50', 'creó un nuevo escenario', 'el usuario Administrador, creó un nuevo escenario - Escenario ID: 29'),
(147, '2025-09-17 14:53:06', 'creó un nuevo escenario', 'el usuario Administrador, creó un nuevo escenario - Escenario ID: 30'),
(148, '2025-09-17 14:53:38', 'creó un nuevo escenario', 'el usuario Administrador, creó un nuevo escenario - Escenario ID: 31'),
(149, '2025-09-17 15:11:54', 'eliminó un tema de ruleta', 'el usuario Administrador, eliminó un tema de ruleta - Tema eliminado: toxicologia - Juego Ruleta - ID: 17'),
(150, '2025-09-17 15:12:33', 'creó un nuevo escenario', 'el usuario Administrador, creó un nuevo escenario - Escenario ID: 32'),
(151, '2025-09-17 15:12:47', 'agregó un nuevo objeto', 'el usuario Administrador, agregó un nuevo objeto - Objeto agregado al escenario 32'),
(152, '2025-09-17 15:12:57', 'guardó colliders', 'el usuario Administrador, guardó colliders - Objeto ID: 17'),
(153, '2025-09-17 16:11:56', 'actualizó una pregunta de ruleta', 'el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de Colombia - Juego Ruleta - ID: 51'),
(154, '2025-09-17 16:12:27', 'actualizó una pregunta de ruleta', 'el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de Colombia - Juego Ruleta - ID: 50'),
(155, '2025-09-17 16:12:34', 'actualizó una pregunta de ruleta', 'el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de Colombia - Juego Ruleta - ID: 49'),
(156, '2025-09-17 16:12:39', 'actualizó una pregunta de ruleta', 'el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de Colombia - Juego Ruleta - ID: 48'),
(157, '2025-09-17 16:12:45', 'actualizó una pregunta de ruleta', 'el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de Colombia - Juego Ruleta - ID: 47'),
(158, '2025-09-17 16:12:53', 'actualizó una pregunta de ruleta', 'el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de Colombia - Juego Ruleta - ID: 34'),
(159, '2025-09-17 16:12:57', 'actualizó una pregunta de ruleta', 'el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de Colombia - Juego Ruleta - ID: 35'),
(160, '2025-09-17 16:13:02', 'actualizó una pregunta de ruleta', 'el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de Colombia - Juego Ruleta - ID: 36'),
(161, '2025-09-17 16:13:06', 'actualizó una pregunta de ruleta', 'el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de Colombia - Juego Ruleta - ID: 37'),
(162, '2025-09-17 16:13:10', 'actualizó una pregunta de ruleta', 'el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de Colombia - Juego Ruleta - ID: 38'),
(163, '2025-09-17 16:13:15', 'actualizó una pregunta de ruleta', 'el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de Colombia - Juego Ruleta - ID: 39'),
(164, '2025-09-17 16:13:19', 'actualizó una pregunta de ruleta', 'el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de Colombia - Juego Ruleta - ID: 40'),
(165, '2025-09-17 16:13:23', 'actualizó una pregunta de ruleta', 'el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de Colombia - Juego Ruleta - ID: 41'),
(166, '2025-09-17 16:13:27', 'actualizó una pregunta de ruleta', 'el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de Colombia - Juego Ruleta - ID: 42'),
(167, '2025-09-17 16:13:32', 'actualizó una pregunta de ruleta', 'el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de Colombia - Juego Ruleta - ID: 43'),
(168, '2025-09-17 16:13:36', 'actualizó una pregunta de ruleta', 'el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de Colombia - Juego Ruleta - ID: 44'),
(169, '2025-09-17 16:13:40', 'actualizó una pregunta de ruleta', 'el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de Colombia - Juego Ruleta - ID: 45'),
(170, '2025-09-17 16:13:44', 'actualizó una pregunta de ruleta', 'el usuario Administrador, actualizó una pregunta de ruleta - Pregunta de Colombia - Juego Ruleta - ID: 46'),
(171, '2025-09-17 16:33:04', 'actualizó una pregunta', 'el usuario Administrador, actualizó una pregunta - Pregunta de Colombia - Juego Genfy Pregunta - ID: 17'),
(172, '2025-09-17 16:33:07', 'actualizó una pregunta', 'el usuario Administrador, actualizó una pregunta - Pregunta de Colombia - Juego Genfy Pregunta - ID: 16'),
(173, '2025-09-17 16:33:10', 'actualizó una pregunta', 'el usuario Administrador, actualizó una pregunta - Pregunta de Colombia - Juego Genfy Pregunta - ID: 15'),
(174, '2025-09-17 16:33:14', 'actualizó una pregunta', 'el usuario Administrador, actualizó una pregunta - Pregunta de Colombia - Juego Genfy Pregunta - ID: 14'),
(175, '2025-09-17 16:33:19', 'actualizó una pregunta', 'el usuario Administrador, actualizó una pregunta - Pregunta de Colombia - Juego Genfy Pregunta - ID: 8'),
(176, '2025-09-17 16:33:22', 'actualizó una pregunta', 'el usuario Administrador, actualizó una pregunta - Pregunta de Colombia - Juego Genfy Pregunta - ID: 9'),
(177, '2025-09-17 16:33:25', 'actualizó una pregunta', 'el usuario Administrador, actualizó una pregunta - Pregunta de Colombia - Juego Genfy Pregunta - ID: 10'),
(178, '2025-09-17 16:33:29', 'actualizó una pregunta', 'el usuario Administrador, actualizó una pregunta - Pregunta de Colombia - Juego Genfy Pregunta - ID: 11'),
(179, '2025-09-17 16:33:32', 'actualizó una pregunta', 'el usuario Administrador, actualizó una pregunta - Pregunta de Colombia - Juego Genfy Pregunta - ID: 12'),
(180, '2025-09-17 16:33:35', 'actualizó una pregunta', 'el usuario Administrador, actualizó una pregunta - Pregunta de Colombia - Juego Genfy Pregunta - ID: 13');

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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `mision_genfy_sprites`
--

INSERT INTO `mision_genfy_sprites` (`id`, `tipo`, `imagen_url`, `enlace`) VALUES
(10, 'medicamento', '/img/imagen-1758127156266-866689693.png', NULL),
(11, 'bacteria', '/img/imagen-1758127169803-184546809.png', NULL);

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
(10, 2),
(11, 2);

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `mision_genfy_terapias`
--

INSERT INTO `mision_genfy_terapias` (`id`, `medicamento_id`, `bacteria_id`) VALUES
(2, 10, 11);

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
(2, 'Colombia', 1, 1, 1, 1),
(3, 'Peru', 1, 1, 1, 1),
(4, 'Ecuador', 1, 1, 1, 1);

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
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `ruleta_preguntas`
--

INSERT INTO `ruleta_preguntas` (`id`, `tema_id`, `pregunta`, `respuesta_correcta`, `respuesta_1`, `respuesta_2`, `respuesta_3`, `activa`) VALUES
(34, 18, '¿Quién fue el primer emperador romano?', 'Augusto', 'Julio César', 'Nerón', 'Calígula', 1),
(35, 18, '¿En qué año cayó el Muro de Berlín?', '1989', '1991', '1985', '1990', 1),
(36, 18, '¿Cuál fue la capital del Imperio Azteca?', 'Tenochtitlán', 'Tulum', 'Palenque', 'Chichén Itzá', 1),
(37, 19, '¿Cuál es el río más largo del mundo?', 'Amazonas', 'Nilo', 'Yangtsé', 'Misisipi', 1),
(38, 19, '¿Cuál es el desierto más grande del mundo?', 'Antártico', 'Sahara', 'Gobi', 'Kalahari', 1),
(39, 19, '¿Qué país es el más grande de Sudamérica?', 'Brasil', 'Argentina', 'Perú', 'Colombia', 1),
(40, 20, '¿Cuál es la fórmula química del agua?', 'H2O', 'CO2', 'O2', 'NaCl', 1),
(41, 20, '¿Qué planeta es conocido como el \"Planeta Rojo\"?', 'Marte', 'Júpiter', 'Venus', 'Saturno', 1),
(42, 20, '¿Qué ley de la física describe que un objeto en movimiento permanece en movimiento?', 'Primera Ley de Newton', 'Segunda Ley de Newton', 'Tercera Ley de Newton', 'Ley de la gravedad', 1),
(43, 21, '¿Quién pintó la Mona Lisa?', 'Leonardo da Vinci', 'Pablo Picasso', 'Vincent van Gogh', 'Miguel Ángel', 1),
(44, 21, '¿En qué ciudad se encuentra el museo del Louvre?', 'París', 'Roma', 'Londres', 'Madrid', 1),
(45, 21, '¿Cuál es el nombre de la famosa obra de teatro de William Shakespeare sobre un príncipe danés?', 'Hamlet', 'Romeo y Julieta', 'Macbeth', 'Otelo', 1),
(46, 22, '¿Cuántos jugadores hay en un equipo de fútbol?', '11', '9', '10', '12', 1),
(47, 22, '¿Dónde se inventó el baloncesto?', 'Estados Unidos', 'Canadá', 'Reino Unido', 'China', 1),
(48, 22, '¿Qué país ha ganado más Copas del Mundo de fútbol?', 'Brasil', 'Alemania', 'Italia', 'Argentina', 1),
(49, 23, '¿Quién es conocido como \"El Rey del Pop\"?', 'Michael Jackson', 'Elvis Presley', 'Madonna', 'Prince', 1),
(50, 23, '¿Cuál es el instrumento principal en un cuarteto de cuerdas?', 'Violín', 'Guitarra', 'Piano', 'Flauta', 1),
(51, 23, '¿De qué país es originario el género musical Reggae?', 'Jamaica', 'Cuba', 'Brasil', 'Colombia', 1);

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
(34, 2),
(35, 2),
(36, 2),
(37, 2),
(38, 2),
(39, 2),
(40, 2),
(41, 2),
(42, 2),
(43, 2),
(44, 2),
(45, 2),
(46, 2),
(47, 2),
(48, 2),
(49, 2),
(50, 2),
(51, 2);

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
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Volcado de datos para la tabla `ruleta_temas`
--

INSERT INTO `ruleta_temas` (`id`, `nombre`, `color`, `activo`) VALUES
(18, 'Historia', '#e74c3c', 1),
(19, 'Geografía', '#3498db', 1),
(20, 'Ciencia', '#2ecc71', 1),
(21, 'Arte y Cultura', '#f39c12', 1),
(22, 'Deportes', '#9b59b6', 1),
(23, 'Música', '#1abc9c', 1);

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
-- Filtros para la tabla `mision_genfy_terapias`
--
ALTER TABLE `mision_genfy_terapias`
  ADD CONSTRAINT `mision_genfy_terapias_ibfk_1` FOREIGN KEY (`medicamento_id`) REFERENCES `mision_genfy_sprites` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `mision_genfy_terapias_ibfk_2` FOREIGN KEY (`bacteria_id`) REFERENCES `mision_genfy_sprites` (`id`) ON DELETE CASCADE;

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
