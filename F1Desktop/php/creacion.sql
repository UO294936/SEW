CREATE DATABASE IF NOT EXISTS juego_f1 DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_general_ci;
USE juego_f1;

DROP TABLE IF EXISTS Resultados_Carreras;
DROP TABLE IF EXISTS Carreras;
DROP TABLE IF EXISTS Usuarios;
DROP TABLE IF EXISTS Pilotos;
DROP TABLE IF EXISTS Equipos;
DROP TABLE IF EXISTS Circuitos;

CREATE TABLE IF NOT EXISTS Usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL,
    puntuacion_total INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Pilotos (
    id_piloto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_piloto VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    nacionalidad VARCHAR(50),
    victorias INT DEFAULT 0,
    poles INT DEFAULT 0,
    vueltas_rapidas INT DEFAULT 0,
    campeonatos INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Equipos (
    id_equipo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_equipo VARCHAR(50) NOT NULL UNIQUE,
    pais_base VARCHAR(50),
    victorias INT DEFAULT 0,
    poles INT DEFAULT 0,
    campeonatos INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Circuitos (
    id_circuito INT AUTO_INCREMENT PRIMARY KEY,
    nombre_circuito VARCHAR(100) NOT NULL UNIQUE,
    pais_circuito VARCHAR(50),
    longitud_vuelta DECIMAL(6,3),
    numero_vueltas INT DEFAULT 0,
    carreras_realizadas INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS Carreras (
    id_carrera INT AUTO_INCREMENT PRIMARY KEY,
    nombre_gp VARCHAR(100) NOT NULL,
    fecha DATE NOT NULL,
    id_circuito INT NOT NULL,
    FOREIGN KEY (id_circuito) REFERENCES Circuitos(id_circuito)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS Resultados_Carreras (
    id_resultado INT AUTO_INCREMENT PRIMARY KEY,
    id_carrera INT NOT NULL,
    id_piloto INT NOT NULL,
    id_equipo INT NOT NULL,
    posicion INT NOT NULL,
    puntos INT NOT NULL,
    FOREIGN KEY (id_carrera) REFERENCES Carreras(id_carrera)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_piloto) REFERENCES Pilotos(id_piloto)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (id_equipo) REFERENCES Equipos(id_equipo)
        ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO Usuarios (nombre_usuario, puntuacion_total) VALUES
('pepe', 90),
('josemi', 60),
('chema', 100),
('mariano', 20),
('javier', 10);

INSERT INTO Pilotos (nombre_piloto, apellido, nacionalidad, victorias, poles, vueltas_rapidas, campeonatos) VALUES
('Lewis', 'Hamilton', 'Británico', 100, 101, 40, 7),
('Sebastian', 'Vettel', 'Alemán', 53, 57, 38, 4),
('Max', 'Verstappen', 'Holandés', 50, 32, 27, 2),
('Fernando', 'Alonso', 'Español', 32, 22, 25, 2),
('Kimi', 'Räikkönen', 'Finlandés', 21, 18, 16, 1);

INSERT INTO Equipos (nombre_equipo, pais_base, victorias, poles, campeonatos) VALUES
('Mercedes', 'Alemania', 8, 0, 8),
('Red Bull Racing', 'Austria', 5, 0, 5),
('Ferrari', 'Italia', 16, 0, 16),
('Alpine', 'Francia', 2, 0, 2),
('McLaren', 'Reino Unido', 8, 0, 8);

INSERT INTO Circuitos (nombre_circuito, pais_circuito, longitud_vuelta, numero_vueltas, carreras_realizadas) VALUES
('Circuito de Mónaco', 'Mónaco', 3.337, 78, 59),
('Circuito de Silverstone', 'Reino Unido', 5.891, 52, 77),
('Circuito de Spa-Francorchamps', 'Bélgica', 7.004, 44, 79),
('Circuito de Catalunya', 'España', 4.675, 66, 35),
('Circuito de Suzuka', 'Japón', 5.807, 53, 47);

INSERT INTO Carreras (nombre_gp, fecha, id_circuito) VALUES
('Gran Premio de Mónaco', '2023-05-28', 1),
('Gran Premio de Gran Bretaña', '2023-07-02', 2),
('Gran Premio de Bélgica', '2023-07-30', 3),
('Gran Premio de España', '2023-06-04', 4),
('Gran Premio de Japón', '2023-09-24', 5);

INSERT INTO Resultados_Carreras (id_carrera, id_piloto, id_equipo, posicion, puntos) VALUES
(1, 1, 1, 1, 25),
(1, 2, 2, 2, 18),
(1, 3, 3, 3, 15),
(1, 4, 4, 4, 12),
(1, 5, 5, 5, 10),
(2, 1, 1, 1, 25),
(2, 2, 2, 2, 18),
(2, 3, 3, 3, 15),
(2, 4, 4, 4, 12),
(2, 5, 5, 5, 10),
(3, 1, 1, 1, 25),
(3, 2, 2, 2, 18),
(3, 3, 3, 3, 15),
(3, 4, 4, 4, 12),
(3, 5, 5, 5, 10),
(4, 1, 1, 1, 25),
(4, 2, 2, 2, 18),
(4, 3, 3, 3, 15),
(4, 4, 4, 4, 12),
(4, 5, 5, 5, 10),
(5, 1, 1, 1, 25),
(5, 2, 2, 2, 18),
(5, 3, 3, 3, 15),
(5, 4, 4, 4, 12),
(5, 5, 5, 5, 10);
