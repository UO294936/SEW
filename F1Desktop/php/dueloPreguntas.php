<?php

    class DueloF1 {

        protected $server;
        protected $user;
        protected $pass;
        protected $database;
        
        public $mysqli;
    
        protected $nombre = "";

        private $maxPreguntas = 10;
        public $tipoPreguntas = [
            'piloto_victorias' => 'Victorias de Pilotos',
            'piloto_poles' => 'Poles de Pilotos',
            'equipo_victorias' => 'Victorias de Equipos',
            'circuito_longitud' => 'Longitud de Circuitos',
            'carrera_ganador' => 'Ganador de Carreras',
            'carrera_posicion' => 'Posiciones de Carreras',
            'carrera_puntos' => 'Puntos Equipo en Carreras'
        ];
    
        // Estructura para almacenar el estado del juego
        public $estadoJuego;

        public $baseDeDatosCreada;

        public function __construct() {
            $this->server = "localhost";
            $this->user = "DBUSER2024";
            $this->pass = "DBPSWD2024";
            $this->database = "juego_f1";
            
            $this->mysqli = new mysqli($this->server, $this->user, $this->pass);
            if ($this->mysqli->connect_error) {
            die("Error al conectar con la base de datos: " . $this->mysqli->connect_error);
            }
            
            $this->baseDeDatosCreada = $_SESSION['baseDeDatosCreada'] ?? false;
            
            $this->estadoJuego = $_SESSION['estadoJuego'] ?? [
            'preguntas' => [],
            'preguntaActual' => 0,
            'puntuacion' => 0
            ];
        }

        public function crearBaseDeDatos(){
            try {
                // Leer el archivo SQL
                $contenidoSql = file_get_contents("creacion.sql");
                if ($contenidoSql === false) {
                    throw new Exception("No se pudo leer el archivo SQL.");
                }
            
                // Separar las sentencias SQL por punto y coma (;)
                $queries = array_filter(array_map('trim', explode(';', $contenidoSql)));
            
                // Ejecutar cada sentencia SQL
                foreach ($queries as $query) {
                    if (!empty($query)) {
                        if ($this->mysqli->query($query) === false) {
                            throw new Exception("Error al ejecutar la consulta: " . $this->mysqli->error);
                        }
                    }
                }
            
                $_SESSION['baseDeDatosCreada'] = true;     
        
            } catch (Exception $e) {
                die("Error: " . $e->getMessage());
                session_destroy(); 
            }
        }

        public function importarDesdeCSV($archivoCSV) {
            // Borrar todos los datos de todas las tablas
            $tablas = ["Resultados_Carreras", "Carreras", "Usuarios", "Pilotos", "Equipos", "Circuitos"];
            foreach ($tablas as $tabla) { // Sería más fácil utilizar TRUNCATE, pero da problemas con las foreign keys
                $sql = "DELETE FROM $tabla";
                if ($this->mysqli->query($sql) === false) {
                    throw new Exception("Error al ejecutar la consulta: " . $this->mysqli->error);
                }
        
                // Resetear el contador para la clave primaria
                $sqlResetAI = "ALTER TABLE $tabla AUTO_INCREMENT = 1";
                if ($this->mysqli->query($sqlResetAI) === false) {
                    throw new Exception("Error al ejecutar la consulta: " . $this->mysqli->error);
                }
            }
        
            try {
                $handle = fopen($archivoCSV, "r");
                if ($handle === false) {
                    throw new Exception("No se pudo abrir el archivo CSV.");
                }
        
                // Leer cada fila del archivo CSV
                while (($datos = fgetcsv($handle, 5000, ",")) !== false) {
                    if ($datos === null || empty($datos)) {
                        continue; // Si los datos son nulos o vacíos, saltar a la siguiente iteración
                    }
                    // El primer valor determina la tabla
                    $tabla = array_shift($datos);
                
        
                    switch ($tabla) {
                        case "Usuarios":
                            if (count($datos) !== 2) continue 2;
                            $sql = "INSERT IGNORE INTO Usuarios (nombre_usuario, puntuacion_total) VALUES (?, ?)";
                            $stmt = $this->mysqli->prepare($sql);
                            $stmt->bind_param('si', $datos[0], $datos[1]);
                            break;
                        case "Pilotos":
                            if (count($datos) !== 7) continue 2;
                            $sql = "INSERT IGNORE INTO Pilotos (nombre_piloto, apellido, nacionalidad, victorias, poles, vueltas_rapidas, campeonatos) VALUES (?, ?, ?, ?, ?, ?, ?)";
                            $stmt = $this->mysqli->prepare($sql);
                            $stmt->bind_param('sssiiii', $datos[0], $datos[1], $datos[2], $datos[3], $datos[4], $datos[5], $datos[6]);
                            break;
                        case "Equipos":
                            if (count($datos) !== 5) continue 2;
                            $sql = "INSERT IGNORE INTO Equipos (nombre_equipo, pais_base, victorias, poles, campeonatos) VALUES (?, ?, ?, ?, ?)";
                            $stmt = $this->mysqli->prepare($sql);
                            $stmt->bind_param('ssiii', $datos[0], $datos[1], $datos[2], $datos[3], $datos[4]);
                            break;
                        case "Circuitos":
                            if (count($datos) !== 5) continue 2;
                            $sql = "INSERT IGNORE INTO Circuitos (nombre_circuito, pais_circuito, longitud_vuelta, numero_vueltas, carreras_realizadas) VALUES (?, ?, ?, ?, ?)";
                            $stmt = $this->mysqli->prepare($sql);
                            $stmt->bind_param('ssiii', $datos[0], $datos[1], $datos[2], $datos[3], $datos[4]);
                            break;
                        case "Carreras":
                            if (count($datos) !== 3) continue 2;
                            $sql = "INSERT IGNORE INTO Carreras (nombre_gp, fecha, id_circuito) VALUES (?, ?, ?)";
                            $stmt = $this->mysqli->prepare($sql);
                            $stmt->bind_param('ssi', $datos[0], $datos[1], $datos[2]);
                            break;
                        case "Resultados_Carreras":
                            if (count($datos) !== 5) continue 2;
                            $sql = "INSERT IGNORE INTO Resultados_Carreras (id_carrera, id_piloto, id_equipo, posicion, puntos) VALUES (?, ?, ?, ?, ?)";
                            $stmt = $this->mysqli->prepare($sql);
                            $stmt->bind_param('iiiii', $datos[0], $datos[1], $datos[2], $datos[3], $datos[4]);
                            break;
                        default:
                            continue 2; // Si el nombre de la tabla no coincide, saltar esta fila
                    }
        
                    // Ejecutar la consulta
                    if (!$stmt->execute()) {
                        throw new Exception("Error al ejecutar la consulta: " . $stmt->error);
                    }
                }
        
                fclose($handle);
            } catch (Exception $e) {
                if (isset($handle) && $handle !== false) {
                    fclose($handle);
                }
                echo "Error durante la importación: " . $e->getMessage() . ". Recarga la página para volver a jugar.";
                session_destroy();
                die("Error al importar datos");
            }
        }

        public function getMaxPreguntas(){
            return $this->maxPreguntas;
        }

        public function cargarPreguntas() {
            if (empty($this->estadoJuego['preguntas'])) {
                $this->estadoJuego['preguntas'] = $this->generarPreguntaAleatoria();
                $_SESSION['estadoJuego'] = $this->estadoJuego; // Guardar en la sesión
            }
        }

        public function exportarACSV($archivoCSV) {
            try {
                $tablas = ["Usuarios", "Pilotos", "Equipos", "Circuitos", "Carreras", "Resultados_Carreras"];
                $handle = fopen($archivoCSV, "w");
                
                if ($handle === false) {
                    throw new Exception("No se pudo crear el archivo CSV.");
                }
        
                foreach ($tablas as $tabla) {
                    $sql = "SELECT * FROM " . $this->database . ".$tabla";
                    $stmt = $this->mysqli->query($sql);
            
                    if ($stmt === false) {
                    throw new Exception("Error al ejecutar la consulta: " . $this->mysqli->error);
                    }
            
                    while ($fila = $stmt->fetch_assoc()) {
                    $fila = array_merge([$tabla], $fila); // Agregar el nombre de la tabla como primer campo
                    fputcsv($handle, $fila);
                    }
                }
            
                fclose($handle);
                echo "Datos exportados correctamente al archivo CSV.";
                echo "Refresque la página para volver a jugar.";
                session_destroy();

            } catch (Exception $e) {
                session_destroy();
                die("Error al exportar datos: " . $e->getMessage());
            }
        }

        public function generarPreguntaAleatoria() {
            // Seleccionar un tipo de pregunta al azar
            $tipoPregunta = array_rand($this->tipoPreguntas);

            switch ($tipoPregunta) {
                case 'piloto_victorias':
                    return $this->generarPreguntaPilotoVictorias();
                case 'piloto_poles':
                    return $this->generarPreguntaPilotoPoles();
                case 'equipo_victorias':
                    return $this->generarPreguntaEquipoVictorias();
                case 'circuito_longitud':
                    return $this->generarPreguntaCircuitoLongitud();
                case 'carrera_ganador':
                    return $this->generarPreguntaPilotoGanadorCarrera();
                case 'carrera_posicion':
                    return $this->generarPreguntaPosicionPilotoCarrera();
                case 'carrera_puntos':
                    return $this->generarPreguntaPuntosEquipoCarrera();    
                default:
                    throw new Exception("Tipo de pregunta no válido");
            }
        }

        private function generarPreguntaPilotoVictorias($intentos = 0) {
            // Límite de intentos para evitar recursión infinita
            if ($intentos >= 5) {
                return null; // Si ya hemos intentado 5 veces sin éxito, retornamos null.
            }
        
            $sql = "SELECT id_piloto, nombre_piloto, apellido, victorias 
                    FROM Pilotos 
                    ORDER BY RAND() 
                    LIMIT 2";
            $stmt = $this->mysqli->query($sql);
        
            if ($stmt === false) {
                throw new Exception("Error al ejecutar la consulta: " . $this->mysqli->error);
            }
        
            $pilotos = $stmt->fetch_all(MYSQLI_ASSOC);
        
            if (count($pilotos) < 2) {
                throw new Exception("No hay suficientes pilotos para generar la pregunta");
            }
        
            $pregunta = "¿Cuál de estos pilotos tiene más victorias?";
            $piloto0 = $pilotos[0]['nombre_piloto'] . ' ' . $pilotos[0]['apellido'];
            $piloto1 = $pilotos[1]['nombre_piloto'] . ' ' . $pilotos[1]['apellido'];
            $opciones = [
                $piloto0,
                $piloto1
            ];
        
            // Determinar la respuesta correcta
            $victoriasPiloto0 = $pilotos[0]['victorias'];
            $victoriasPiloto1 = $pilotos[1]['victorias'];
        
            if ($victoriasPiloto0 === $victoriasPiloto1) {
                return $this->generarPreguntaPilotoVictorias($intentos + 1); // Vuelve a generar la pregunta si los pilotos tienen la misma cantidad de victorias
            }
        
            $respuestaCorrecta = $victoriasPiloto0 > $victoriasPiloto1 
                ? $piloto0
                : $piloto1;
        
            return [
                'tipo' => 'piloto_victorias',
                'pregunta' => $pregunta,
                'opciones' => $opciones,
                'respuesta_correcta' => $respuestaCorrecta,
                'datos' => [
                    $piloto0 => $victoriasPiloto0,
                    $piloto1 => $victoriasPiloto1
                ]
            ];
        }


        private function generarPreguntaPilotoPoles($intentos = 0) {
            // Límite de intentos para evitar recursión infinita
            if ($intentos >= 5) {
                return null; // Si ya hemos intentado 5 veces sin éxito, retornamos null.
            }
        
            $sql = "SELECT id_piloto, nombre_piloto, apellido, poles 
                    FROM Pilotos 
                    ORDER BY RAND() 
                    LIMIT 2";
            $stmt = $this->mysqli->query($sql);
        
            if ($stmt === false) {
                throw new Exception("Error al ejecutar la consulta: " . $this->mysqli->error);
            }
        
            $pilotos = $stmt->fetch_all(MYSQLI_ASSOC);
        
            if (count($pilotos) < 2) {
                throw new Exception("No hay suficientes pilotos para generar la pregunta");
            }
        
            $pregunta = "¿Cuál de estos pilotos tiene más poles?";
            $piloto0 = $pilotos[0]['nombre_piloto'] . ' ' . $pilotos[0]['apellido'];
            $piloto1 = $pilotos[1]['nombre_piloto'] . ' ' . $pilotos[1]['apellido'];            
            $opciones = [
                $piloto0,
                $piloto1
            ];
            
            // Determinar la respuesta correcta
            $polesPiloto0 = $pilotos[0]['poles'];
            $polesPiloto1 = $pilotos[1]['poles'];
        
            if ($polesPiloto0 === $polesPiloto1 && $intentos < 5) { // Si tienen las mismas poles, vuelve a llamar a la función por recursividad
                return $this->generarPreguntaPilotoPoles($intentos + 1); 
            }
        
            $respuestaCorrecta = $polesPiloto0 > $polesPiloto1 
                ? $piloto0
                : $piloto1;
        
            return [
                'tipo' => 'piloto_poles',
                'pregunta' => $pregunta,
                'opciones' => $opciones,
                'respuesta_correcta' => $respuestaCorrecta,
                'datos' => [
                    $piloto0 => $polesPiloto0,
                    $piloto1 => $polesPiloto1
                ]
            ];
        }



        private function generarPreguntaEquipoVictorias($intentos = 0) {
            // Límite de intentos para evitar recursión infinita
            if ($intentos >= 5) {
                return null; // Si ya hemos intentado 5 veces sin éxito, retornamos null.
            }
        
            $sql = "SELECT id_equipo, nombre_equipo, victorias 
                    FROM Equipos 
                    ORDER BY RAND() 
                    LIMIT 2";
            $stmt = $this->mysqli->query($sql);
        
            if ($stmt === false) {
                throw new Exception("Error al ejecutar la consulta: " . $this->mysqli->error);
            }
        
            $equipos = $stmt->fetch_all(MYSQLI_ASSOC);
        
            if (count($equipos) < 2) {
                throw new Exception("No hay suficientes equipos para generar la pregunta");
            }
        
            $pregunta = "¿Cuál de estos equipos tiene más victorias?";
        
            $equipo0 = $equipos[0]['nombre_equipo'];
            $equipo1 = $equipos[1]['nombre_equipo'];
            $opciones = [
                $equipo0,
                $equipo1
            ];
            
            // Determinar la respuesta correcta
            $victoriasEquipo0 = $equipos[0]['victorias'];
            $victoriasEquipo1 = $equipos[1]['victorias'];
            
            if ($victoriasEquipo0 === $victoriasEquipo1) {
                return $this->generarPreguntaEquipoVictorias($intentos + 1); // Vuelve a generar la pregunta si los equipos tienen la misma cantidad de victorias
            }
        
            $respuestaCorrecta = $victoriasEquipo0 > $victoriasEquipo1 
                ? $equipo0
                : $equipo1;
        
            return [
                'tipo' => 'equipo_victorias',
                'pregunta' => $pregunta,
                'opciones' => $opciones,
                'respuesta_correcta' => $respuestaCorrecta,
                'datos' => [
                    $equipo0 => $victoriasEquipo0,
                    $equipo1 => $victoriasEquipo1
                ]
            ];
        }


        private function generarPreguntaCircuitoLongitud($intentos = 0) {
            // Límite de intentos para evitar recursión infinita
            if ($intentos >= 5) {
                return null; // Si ya hemos intentado 5 veces sin éxito, retornamos null.
            }
        
            $sql = "SELECT id_circuito, nombre_circuito, longitud_vuelta 
                    FROM Circuitos 
                    ORDER BY RAND() 
                    LIMIT 2";
            $stmt = $this->mysqli->query($sql);
        
            if ($stmt === false) {
                throw new Exception("Error al ejecutar la consulta: " . $this->mysqli->error);
            }
        
            $circuitos = $stmt->fetch_all(MYSQLI_ASSOC);
        
            if (count($circuitos) < 2) {
                throw new Exception("No hay suficientes circuitos para generar la pregunta");
            }
        
            $circuito0 = $circuitos[0]['nombre_circuito'];
            $circuito1 = $circuitos[1]['nombre_circuito'];    
            $pregunta = "¿Cuál de estos circuitos tiene mayor longitud de vuelta?";
            $opciones = [
                $circuito0,
                $circuito1
            ];
            
            // Determinar la respuesta correcta
            $longitudCircuito0 = $circuitos[0]['longitud_vuelta'];
            $longitudCircuito1 = $circuitos[1]['longitud_vuelta'];
            
            if ($longitudCircuito0 === $longitudCircuito1) {
                return $this->generarPreguntaCircuitoLongitud($intentos + 1); // Vuelve a generar la pregunta si los circuitos tienen la misma longitud
            }
        
            $respuestaCorrecta = $longitudCircuito0 > $longitudCircuito1 
                ? $circuito0
                : $circuito1;
        
            return [
                'tipo' => 'circuito_longitud',
                'pregunta' => $pregunta,
                'opciones' => $opciones,
                'respuesta_correcta' => $respuestaCorrecta,
                'datos' => [
                    $circuito0 => $longitudCircuito0,
                    $circuito1 => $longitudCircuito1
                ]
            ];
        }

        private function generarPreguntaPilotoGanadorCarrera($intentos = 0) {
            // Límite de intentos para evitar recursión infinita
            if ($intentos >= 5) {
                return null; // Si ya hemos intentado 5 veces sin éxito, retornamos null.
            }
        
            // Seleccionar una carrera aleatoria
            $sql = "SELECT id_carrera, nombre_gp, fecha
                    FROM Carreras 
                    ORDER BY RAND() 
                    LIMIT 1";
            
            $stmt = $this->mysqli->query($sql);
            $carrera = $stmt->fetch_all(MYSQLI_ASSOC);
            
            if ($carrera) {
                $carrera = $carrera[0]; // Acceder al primer elemento del array
                $idCarrera = $carrera['id_carrera'];
                $nombreCarrera = $carrera['nombre_gp'];
                $temporadaCarrera = date('Y', strtotime($carrera['fecha']));
        
                // Obtener el piloto ganador de la carrera
                $sql2 = "SELECT rc.id_piloto, p.nombre_piloto, p.apellido 
                         FROM Resultados_Carreras rc 
                         INNER JOIN Pilotos p ON rc.id_piloto = p.id_piloto 
                         WHERE rc.id_carrera = ?
                         ORDER BY rc.posicion ASC 
                         LIMIT 1";
                
                $stmt2 = $this->mysqli->prepare($sql2);
                $stmt2->bind_param('i', $idCarrera);
                $stmt2->execute();
                $resultado = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);
                
                if ($resultado) {
                    $resultado = $resultado[0]; // Acceder al primer elemento del array
        
                    // Piloto ganador
                    $pilotoGanadorNombre = $resultado['nombre_piloto'] . " " . $resultado['apellido'];
        
                    // Obtener otro piloto aleatorio
                    $sql3 = "SELECT id_piloto, nombre_piloto, apellido 
                             FROM Pilotos 
                             ORDER BY RAND() 
                             LIMIT 1";
                    
                    $stmt3 = $this->mysqli->query($sql3);
                    $otroPiloto = $stmt3->fetch_all(MYSQLI_ASSOC);
                    $otroPiloto = $otroPiloto[0]; // Acceder al primer elemento del array
                    $otroPilotoNombre = $otroPiloto['nombre_piloto'] . " " . $otroPiloto['apellido'];
        
                    // Asegurarse de que los pilotos sean diferentes
                    if ($pilotoGanadorNombre === $otroPilotoNombre) {
                        return $this->generarPreguntaPilotoGanadorCarrera($intentos + 1); // Vuelve a generar la pregunta si los pilotos son la misma persona
                    }
        
                    // Generar la pregunta
                    return [
                        'tipo' => 'piloto_ganador',
                        'pregunta' => "¿Quién ganó el Gran Premio en esta carrera?: " . $nombreCarrera . " de la temporada " . $temporadaCarrera,
                        'opciones' => [$pilotoGanadorNombre, $otroPilotoNombre],
                        'respuesta_correcta' => $pilotoGanadorNombre,
                        'datos' => [
                            $pilotoGanadorNombre => "Ganador",
                            $otroPilotoNombre => "No ganó"
                        ]
                    ];
                }
            }
        
            return null;
        }

        private function generarPreguntaPosicionPilotoCarrera($intentos = 0) {
            // Límite de intentos para evitar recursión infinita
            if ($intentos >= 5) {
                return null; // Si ya hemos intentado 5 veces sin éxito, retornamos null.
            }
        
            // Seleccionar una carrera aleatoria
            $sql = "SELECT id_carrera, nombre_gp, fecha
                    FROM Carreras 
                    ORDER BY RAND() 
                    LIMIT 1";
            
            $stmt = $this->mysqli->query($sql);
            $carrera = $stmt->fetch_all(MYSQLI_ASSOC);
            
            if ($carrera) {
                $carrera = $carrera[0]; // Acceder al primer elemento del array
                $idCarrera = $carrera['id_carrera'];
                $nombreCarrera = $carrera['nombre_gp'];
                $temporadaCarrera = date('Y', strtotime($carrera['fecha']));
        
                // Obtener un piloto aleatorio y su posición
                $sql2 = "SELECT rc.id_piloto, p.nombre_piloto, p.apellido, rc.posicion 
                         FROM Resultados_Carreras rc
                         INNER JOIN Pilotos p ON rc.id_piloto = p.id_piloto 
                         WHERE rc.id_carrera = ?
                         ORDER BY RAND() 
                         LIMIT 1";
                
                $stmt2 = $this->mysqli->prepare($sql2);
                $stmt2->bind_param('i', $idCarrera);
                $stmt2->execute();
                $resultado = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);
                
                if ($resultado) {
                    $resultado = $resultado[0]; // Acceder al primer elemento del array
                    // Piloto aleatorio y su posición
                    $pilotoNombre = $resultado['nombre_piloto'] . " " . $resultado['apellido'];
                    $posicionPiloto = $resultado['posicion'];
        
                    // Obtener otro piloto aleatorio
                    $sql3 = "SELECT id_piloto, nombre_piloto, apellido 
                             FROM Pilotos 
                             ORDER BY RAND() 
                             LIMIT 1";
                    
                    $stmt3 = $this->mysqli->query($sql3);
                    $otroPiloto = $stmt3->fetch_all(MYSQLI_ASSOC);
                    $otroPiloto = $otroPiloto[0]; // Acceder al primer elemento del array
                    $otroPilotoNombre = $otroPiloto['nombre_piloto'] . " " . $otroPiloto['apellido'];
        
                    // Asegurarse de que los pilotos sean diferentes
                    if ($pilotoNombre === $otroPilotoNombre) {
                        return $this->generarPreguntaPosicionPilotoCarrera($intentos + 1); // Vuelve a generar la pregunta si los pilotos son la misma persona
                    }
        
                    // Generar opciones para la pregunta
                    if ($posicionPiloto != 1) { // Si no quedó primero
                        $opciones = [
                            (string)$posicionPiloto,
                            (string)($posicionPiloto - 1), // Una de las posiciones es la que tiene - 1
                        ];
                    } else {
                        $opciones = [
                            (string)$posicionPiloto,
                            (string)($posicionPiloto + 1)
                        ];
                    }
        
                    shuffle($opciones); // Mezclar las opciones
        
                    // Generar la pregunta
                    return [
                        'tipo' => 'posicion_piloto',
                        'pregunta' => "¿En qué posición terminó " . $pilotoNombre . " en esta carrera?: " . $nombreCarrera . " de la temporada " . $temporadaCarrera,
                        'opciones' => $opciones,
                        'respuesta_correcta' => (string)$posicionPiloto,
                        'datos' => [
                            $pilotoNombre => "terminó en esa posición",
                            "" => "no terminó en esa posición"
                        ]
                    ];
                }
            }
        
            return null;
        }

        private function generarPreguntaPuntosEquipoCarrera($intentos = 0) {
            // Límite de intentos para evitar recursión infinita
            if ($intentos >= 5) {
                return null; // Si ya hemos intentado 5 veces sin éxito, retornamos null.
            }
        
            // Seleccionar una carrera aleatoria
            $sql = "SELECT id_carrera, nombre_gp, fecha
                    FROM Carreras 
                    ORDER BY RAND() 
                    LIMIT 1";
            
            $stmt = $this->mysqli->query($sql);
            $carrera = $stmt->fetch_all(MYSQLI_ASSOC);
            
            if ($carrera) {
                $carrera = $carrera[0]; // Acceder al primer elemento del array
                $idCarrera = $carrera['id_carrera'];
                $nombreCarrera = $carrera['nombre_gp'];
                $temporadaCarrera = date('Y', strtotime($carrera['fecha']));
        
                // Obtener los equipos con los puntos obtenidos en la carrera
                $sql2 = "SELECT rc.id_equipo, e.nombre_equipo, SUM(rc.puntos) AS puntos_totales 
                         FROM Resultados_Carreras rc
                         INNER JOIN Equipos e ON rc.id_equipo = e.id_equipo
                         WHERE rc.id_carrera = ?
                         GROUP BY rc.id_equipo 
                         ORDER BY RAND() 
                         LIMIT 2";
                
                $stmt2 = $this->mysqli->prepare($sql2);
                $stmt2->bind_param('i', $idCarrera);
                $stmt2->execute();
                $resultadosEquipos = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);
                
                if (count($resultadosEquipos) < 2) {
                    return null; // No hay suficientes equipos con resultados
                }
        
                // Seleccionar dos equipos aleatorios con puntos diferentes
                $equipo0 = $resultadosEquipos[0];
                $equipo1 = $resultadosEquipos[1];
        
                // Asegurarse de que los puntos sean diferentes
                if ($equipo0['puntos_totales'] === $equipo1['puntos_totales']) {
                    return $this->generarPreguntaPuntosEquipoCarrera($intentos + 1); // Vuelve a generar la pregunta si los puntos son iguales
                }
        
                // Generar la pregunta
                return [
                    'tipo' => 'puntos_equipo',
                    'pregunta' => "¿Qué equipo obtuvo más puntos en esta carrera?: " . $nombreCarrera . " de la temporada " . $temporadaCarrera,
                    'opciones' => [
                        $equipo0['nombre_equipo'],
                        $equipo1['nombre_equipo']
                    ],
                    'respuesta_correcta' => $equipo0['puntos_totales'] > $equipo1['puntos_totales'] 
                        ? $equipo0['nombre_equipo'] 
                        : $equipo1['nombre_equipo'],
                    'datos' => [
                        $equipo0['nombre_equipo'] => $equipo0['puntos_totales'],
                        $equipo1['nombre_equipo'] => $equipo1['puntos_totales']
                    ]
                ];
            }
        
            return null;
        }
        
        
        public function iniciarJuego() {
            // Reiniciar estado del juego
            $this->estadoJuego = [
                'preguntas' => [],
                'puntuacion' => 0,
                'preguntaActual' => 0
            ];

            // Generar preguntas para todo el juego
            for ($i = 0; $i < $this->getMaxPreguntas(); $i++) {
                $this->estadoJuego['preguntas'][] = $this->generarPreguntaAleatoria();
            }

            return $this->estadoJuego;
        }
        
        public function guardarEstado() {
            // Guardar el estado del juego en la sesión
            $_SESSION['estadoJuego'] = $this->estadoJuego;
        }

        public function procesarRespuesta($respuestaUsuario) {
            if (!isset($this->estadoJuego['preguntas'][$this->estadoJuego['preguntaActual']])) {
                echo "Ha ocurrido un error inesperado, refresque la página por favor.";
                session_destroy();
                die("Error: pregunta no encontrada");
            }
            
            $preguntaActual = $this->estadoJuego['preguntas'][$this->estadoJuego['preguntaActual']];
            
            // Obtener el tipo de la pregunta
            $tipoPregunta = $preguntaActual['tipo'];
            
            // Obtener las opciones (los dos posibles candidatos)
            $opcion1 = $preguntaActual['opciones'][0];
            $opcion2 = $preguntaActual['opciones'][1];
            
            // Obtener la respuesta correcta
            $respuestaCorrecta = $preguntaActual['respuesta_correcta'];
            
            // Obtener los datos adicionales (por ejemplo, victorias de los pilotos)
            $datosOpcion1 = $preguntaActual['datos'][$opcion1] ?? null;
            $datosOpcion2 = $preguntaActual['datos'][$opcion2] ?? null;
            
            // Verificar si la respuesta del usuario es correcta
            $esCorrecta = $respuestaUsuario === $respuestaCorrecta;
        
            if ($esCorrecta) {
                $this->estadoJuego['puntuacion'] = $this->estadoJuego['puntuacion'] + 10;
            }
        
            // Incrementar la pregunta actual
            $this->estadoJuego['preguntaActual']++;
        
            // Guardar el estado actualizado en la sesión
            $_SESSION['estadoJuego'] = $this->estadoJuego;
        
            // Retornar la respuesta para mostrarla
            return [
                'esCorrecta' => $esCorrecta,
                'respuestaCorrecta' => $respuestaCorrecta,
                'puntuacion' => $this->estadoJuego['puntuacion'],
                'juegoTerminado' => $this->estadoJuego['preguntaActual'] >= $this->getMaxPreguntas(),
                'detalle' => [
                    'opcion1' => $opcion1,
                    'opcion2' => $opcion2,
                    'datosOpcion1' => $datosOpcion1,
                    'datosOpcion2' => $datosOpcion2
                ]
            ];
        }

        public function guardarPuntuacion($nombreUsuario) {
            $sql = "INSERT INTO " . $this->database . ".Usuarios (nombre_usuario, puntuacion_total) VALUES (?, ?)";
            $stmt = $this->mysqli->prepare($sql);
            $stmt->bind_param('si', $nombreUsuario, $this->estadoJuego['puntuacion']); // parámetros son string e integer
            return $stmt->execute();
        }
        
    }
?>

<!DOCTYPE HTML>
    <html lang="es">
    <head>
        <!-- Datos que describen el documento -->
        <meta charset="UTF-8" />
        <title>Duelo de Preguntas de la Fórmula 1</title>
        <meta name="author" content="Saúl Martín Fernández"/>
        <meta name="description" content="Aplicación Web de la Fórmula 1"/>
        <meta name ="viewport" content ="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" type="text/css" href="../estilo/estilo.css" />
        <link rel="stylesheet" type="text/css" href="../estilo/layout.css" />
        <link rel="stylesheet" type="text/css" href="../estilo/dueloF1.css" />
        <link rel="icon" href="../multimedia/imagenes/favicon_f1Desktop.ico" type="image/x-icon"/>
    </head>

    <body>
        <header>
            <h1><a href="../index.html" title="F1 Desktop">F1 Desktop</a></h1>
        
            <!-- Datos con el contenido que aparece en el navegador -->
            <nav>
                <a href="../index.html" title="Inicio">Inicio</a>
                <a href="../piloto.html" title="Piloto">Piloto</a>
                <a href="../noticias.html" title ="Noticias">Noticias</a>
                <a href="../calendario.html" title="Calendario">Calendario</a>
                <a href="../meteorologia.html" title="Meteorologia">Meteorologia</a>
                <a href="../circuito.html" title="Circuito">Circuito</a>
                <a href="../viajes.php" title="Viajes">Viajes</a>
                <a href="../juegos.html" class="active" title="Juegos">Juegos</a>
            </nav>
        </header>

        <p>
            Estás en: 
            <a href="../index.html" title="Inicio">Inicio</a> | <a href="../juegos.html" title="Juegos">Juegos</a> | Aplicación Php
        </p>

        <aside>
            <nav>
                <a href="../memoria.html" title="Memoria">Juego Memoria</a>
                <a href="../semaforo.php" title="Semaforo">Juego Semáforo</a>
                <a href="../api.html" title="Aplicación Web">Aplicación Web</a>
                <a href="dueloPreguntas.php" title="Aplicación Php">Aplicación Php</a>
            </nav>
        </aside>

        <main>  
            <h2>Duelo de Preguntas Fórmula 1</h2>
            <p>Aviso: El juego utiliza sesiones para procesar las preguntas y guardar su puntuación, si llega a algún estado inesperado, reinicie el navegador.</p>

            <?php
                session_start();
                $dueloF1 = new DueloF1();
        
                // Opciones iniciales para crear la base de datos
               if ( !$dueloF1->baseDeDatosCreada ) {
                    echo "<section>";
                    echo "<h2>Inicialización de Base de Datos</h2>";
                    echo "<p>Puede crear la base de datos (con las preguntas por defecto) o juegue con sus propias preguntas importándolas desde un archivo CSV.</p>";
                    
                    echo '<form method="POST">';
                    echo "<button type='submit' name='crear_base_datos'>Jugar con las Preguntas por Defecto</button>";
                    echo "</form>";

                    echo '<form method="POST" enctype="multipart/form-data">';
                    echo "<label>Importar datos desde CSV: <input type='file' name='archivo_csv' accept='.csv' required> </label>";
                    echo "<button type='submit' name='importar_csv'>Jugar con sus Preguntas</button>";
                    echo "</form>";
                    
                    echo "</section>";
                }

                // Crear base de datos por defecto y empezar el juego
                if ( !$dueloF1->baseDeDatosCreada && isset($_POST['crear_base_datos']) ){
                    try {
                        $dueloF1->crearBaseDeDatos();

                        $dueloF1->baseDeDatosCreada = true;
                        $_SESSION['baseDeDatosCreada'] = true;  // Guardar el estado en la sesión por si se recarga la página

                        // Una vez que tenemos los datos, cargamos las preguntas
                        $dueloF1->cargarPreguntas();

                        // Empezar el juego
                        $estadoJuego = $dueloF1->iniciarJuego();
                        $_SESSION['estadoJuego'] = $estadoJuego;

                    } catch (Exception $e){
                        echo "<section>";
                        echo "<h4>Error de Creación de la base de datos ".$e->getMessage() .". Recarga la página para volver a jugar. </h4>";
                        echo "</section>"; 
                        session_destroy();
                    }
                }

                // Importar CSV y empezar el juego
                if(!$dueloF1->baseDeDatosCreada && isset($_POST['importar_csv']) && isset($_FILES['archivo_csv']) && $_FILES['archivo_csv']['error'] == 0) {
                    try {
                        $archivo = $_FILES['archivo_csv']['tmp_name'];
                        
                        $dueloF1->crearBaseDeDatos();

                        // Soobrescribe los datos por defecto con los del csv
                        $dueloF1->importarDesdeCSV($archivo);      // (Esta función prepara las sentencias sql para evitar una inyección)

                        $dueloF1->baseDeDatosCreada = true;
                        $_SESSION['baseDeDatosCreada'] = true;  // Guardar el estado en la sesión por si se recarga la página

                        // Una vez que importamos los datos, cargamos las preguntas
                        $dueloF1->cargarPreguntas();

                        // Empezar el juego
                        $estadoJuego = $dueloF1->iniciarJuego();
                        $_SESSION['estadoJuego'] = $estadoJuego;

                    } catch (Exception $e) {
                        echo "<section>";
                        echo "<h4>Error de Importación</h4>";
                        echo "<p>Error al importar datos: " . htmlspecialchars($e->getMessage()) . ". Recarga la página para volver a jugar.</p>";
                        echo "</section>";
                        session_destroy();
                    }
                }
        
                // Lógica del juego
                if ($dueloF1->baseDeDatosCreada) {
                    
                    // Procesar la respuesta del usuario
                    if (isset($_POST['respuesta']) && isset($_SESSION['estadoJuego'])) {
                        
                        $resultado = $dueloF1->procesarRespuesta($_POST['respuesta']);
                        $_SESSION['estadoJuego']['puntuacion'] = $resultado['puntuacion'];
                        $_SESSION['estadoJuego']['preguntaActual'];

                        echo "<section>";
                        echo "<h3>Resultado de la Pregunta</h3>";
                        
                        if ($resultado['esCorrecta']) {
                            echo "<p>¡Respuesta correcta!</p>";
                        } else {
                            echo "<p>Respuesta incorrecta. La respuesta correcta era: " . 
                                htmlspecialchars($resultado['respuestaCorrecta']) . "</p>";
                        }

                        // Mostrar los detalles
                        echo "<p>(" . htmlspecialchars($resultado['detalle']['opcion1']) . ": " . 
                                htmlspecialchars($resultado['detalle']['datosOpcion1']) . " - " . 
                                htmlspecialchars($resultado['detalle']['datosOpcion2']) . ")</p>";

                        echo "</section>";
        
                        // Se acaba el juego -> Pregunta el nombre
                        if ($resultado['juegoTerminado']) {
                            echo "<section>";
                            echo "<h2>Juego Finalizado</h2>";
                            echo "<p>Tu puntuación final: " . $resultado['puntuacion'] . " / 100</p>";
                            
                            echo "<form method='POST'>";
                            echo "<h3>Guardar Puntuación</h3>";
                            echo "<label for='nombre_usuario'>Introduce tu nombre:</label>";
                            echo "<input type='text' id='nombre_usuario' name='nombre_usuario' placeholder='Nombre' required>";
                            echo "<button type='submit' name='guardar_puntuacion'>Guardar Puntuación</button>";
                            echo "</form>";
                            echo "</section>";
                        }
                    }
        
                    // Guarda la puntuación
                    if (isset($_POST['guardar_puntuacion']) && isset($_POST['nombre_usuario'])) {
                        try {
                            $nombreUsuario = $_POST['nombre_usuario'];
                            $dueloF1->guardarPuntuacion($nombreUsuario);
                            
                            echo "<section>";
                            echo "<h2>Puntuación Guardada</h2>";
                            echo "<form method='POST'>";
                            echo "<h3>Exportar Datos</h3>";
                            echo "<button type='submit' name='exportar_csv'>Exportar Datos a CSV</button>";
                            echo "</form>";
                            echo "</section>";
                        } catch (Exception $e) {
                            echo "<section>";
                            echo "<h2>Error al Guardar</h2>";
                            echo "<p>Error al guardar la puntuación: " . htmlspecialchars($e->getMessage()) . ". Recarga la página para volver a jugar.</p>";
                            echo "</section>";
                            session_destroy();
                        }
                    }
        
                    // Exportar datos a un csv
                    if (isset($_POST['exportar_csv'])) {
                        try {
                            $archivo = "exportacion_" . date('YmdHis') . ".csv";
                            $dueloF1->exportarACSV($archivo);
                            echo "<section>";
                            echo "<h2>Exportación Completada</h2>";
                            echo "<p>Archivo exportado: <a href='$archivo' download>$archivo</a></p>";
                            echo "</section>";
                        } catch (Exception $e) {
                            echo "<section>";
                            echo "<h2>Error de Exportación</h2>";
                            echo "<p>Error al exportar: " . htmlspecialchars($e->getMessage()) . ". Recarga la página para volver a jugar.</p>";
                            echo "</section>";
                            session_destroy();
                        }
                    }
        
                    // Muestra la pregunta actual
                    if (
                        isset($_SESSION['estadoJuego']) && 
                        isset($_SESSION['estadoJuego']['preguntaActual']) &&
                        isset($_SESSION['estadoJuego']['preguntas']) &&
                        is_array($_SESSION['estadoJuego']['preguntas']) &&
                        $_SESSION['estadoJuego']['preguntaActual'] < count($_SESSION['estadoJuego']['preguntas']) &&
                        $_SESSION['estadoJuego']['preguntaActual'] < $dueloF1->getMaxPreguntas()
                        ) {

                        $preguntaActual = $_SESSION['estadoJuego']['preguntas'][$_SESSION['estadoJuego']['preguntaActual']];

                        echo "<section>";
                        echo "<h2>Pregunta " . ($_SESSION['estadoJuego']['preguntaActual'] + 1) . " de 10</h2>";
                        
                        if ($preguntaActual !== null) {
                            echo "<p>" . htmlspecialchars($preguntaActual['pregunta']) . "</p>";
                        } else {
                            // Volver a intentar cargar la pregunta
                            $preguntaActual = $dueloF1->generarPreguntaAleatoria();
                            $_SESSION['estadoJuego']['preguntas'][$_SESSION['estadoJuego']['preguntaActual']] = $preguntaActual;
                            echo "<p>" . htmlspecialchars($preguntaActual['pregunta']) . "</p>";
                        }

                        echo "<form method='POST'>";
                        if (isset($preguntaActual['opciones']) && is_array($preguntaActual['opciones'])) {
                            foreach ($preguntaActual['opciones'] as $opcion) {
                                echo "<button type='submit' name='respuesta' value='" . 
                                    htmlspecialchars(strip_tags($opcion)) . "'>" . 
                                    htmlspecialchars($opcion) . "</button>";
                            }
                        }
                        echo "</form>";

                        echo "<p>Puntuación actual: " . $_SESSION['estadoJuego']['puntuacion'] . "</p>";
                        echo "</section>";
                    }
                }
            ?>
        </main>
    </body>
</html>