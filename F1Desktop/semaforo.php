<?php

class Record {

    protected $server;
    protected $user;
    protected $pass;
    protected $dbname;
    
    protected $mysqli;

    protected $nombre = "";
    protected $apellido = "";
    protected $nivel = 0.0;
    protected $tiempo = 0.0;
    
    
    public function __construct(){
        $this->server = "localhost";
        $this->user = "DBUSER2024";
        $this->pass = "DBPSWD2024";
        $this->dbname = "records";
        
        // Conexión a la base de datos vía MySQLi
        try {
            $this->mysqli = new mysqli(
                $this->server,
                $this->user,
                $this->pass,
                $this->dbname
            );

            // Comprueba la conexión
            if ($this->mysqli->connect_errno) {
                throw new Exception("Conexión a la base de datos fallida: " . $this->mysqli->connect_error);
            }

            $this->mysqli->set_charset("utf8");
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }
    
    public function getNombre(){
        return $this->nombre;   
    }

   public function getApellido(){
        return $this->apellido;   
    }

    public function getNivel(){
        return $this->nivel;   
    }

   public function getTiempo(){
        return $this->tiempo;   
    }

        
    public function setNombre($nombreParam){
        $this->nombre = $nombreParam;   
    }

    public function setApellido($apellidoParam){
        $this->apellido = $apellidoParam;   
    }

    public function setNivel($nivelParam){
        $this->nivel = (float) $nivelParam;   
    }

    public function setTiempo($tiempoParam){
        $this->tiempo = (float) $tiempoParam;   
    }

    public function mandarFormulario(){
        $sql = "INSERT INTO registro (nombre, apellidos, nivel, tiempo) 
                VALUES (?, ?, ?, ?)";
        try {
            $stmt = $this->mysqli->prepare($sql);
            $stmt->bind_param("ssdd", 
                $this->nombre, 
                $this->apellido, 
                $this->nivel, 
                $this->tiempo
            );
            $stmt->execute();

            if ($stmt->error) {
                throw new Exception("Error guardando los datos: " . $stmt->error);
            }
            $stmt->close();
        } catch (Exception $e) {
            echo "<p>" . $e->getMessage() . "</p>";
        }
    }

    public function consultar10Mejores(){
        $sql = "SELECT DISTINCT nombre, apellidos, tiempo 
                FROM registro 
                WHERE nivel = ? 
                ORDER BY tiempo ASC 
                LIMIT 10";
        try {
            $stmt = $this->mysqli->prepare($sql);
            $stmt->bind_param("d", $this->nivel);
            $stmt->execute();
            
            $result = $stmt->get_result();
            $records = [];
            while ($row = $result->fetch_assoc()) {
                $records[] = $row;
            }
            
            $stmt->close();
            return $records;
        } catch (Exception $e) {
            echo "<p>Error consiguiendo el ranking: " . $e->getMessage() . "</p>";
            return [];
        }
    }

    public function generarTablaRanking(){
        $topRecords = $this->consultar10Mejores();

        $rankingTableHTML = "<h3>Top 10 Resultados para el nivel {$this->getNivel()}</h3>
        <table>
            <thead>
                <tr>
                    <th id='nombre' scope='col'>Nombre</th>
                    <th id='apellidos' scope='col'>Apellidos</th>
                    <th id='tiempo' scope='col'>Tiempo (segundos)</th>
                </tr>
            </thead>
            <tbody>";
    
        if (count($topRecords) > 0) {
            foreach ($topRecords as $record) {
                $rankingTableHTML .= "
                <tr>
                    <td headers='nombre'>" . htmlspecialchars($record['nombre']) . "</td>
                    <td headers='apellidos'>" . htmlspecialchars($record['apellidos']) . "</td>
                    <td headers='tiempo'>" . number_format($record['tiempo'], 3) . "</td>
                </tr>";
            }
        } else {
            $rankingTableHTML .= "
            <tr>
                <td headers='nombre' colspan='3'>No hay récords para este nivel.</td>
            </tr>";
        }
        
        $rankingTableHTML .= "
            </tbody>
        </table>";

        return $rankingTableHTML;
    }

    // Destructor para cerrar la conexión a la base de datos
    public function __destruct() {
        if ($this->mysqli) {
            $this->mysqli->close();
        }
    }
}
    
//Solo se ejecutará si se han enviado los datos desde el formulario al pulsar el boton Enviar
if ($_SERVER['REQUEST_METHOD'] === 'POST' && count($_POST)>0) 
    {   
        $miRecord = new Record();
        $miRecord->setNombre($_POST["nombre"]);
        $miRecord->setApellido($_POST["apellido"]);
        $miRecord->setNivel($_POST["nivel"]);
        $miRecord->setTiempo($_POST["tiempo"]);

        // Guarda la información en la base de datos
        $miRecord->mandarFormulario();

        // Consigue el ranking de los 10 mejores para el nivel actual y guarda la tabla
        $tablaRanking = $miRecord->generarTablaRanking();
    }

?>

<!DOCTYPE HTML>
    <html lang="es">
    <head>
        <!-- Datos que describen el documento -->
        <meta charset="UTF-8" />
        <title>Juego Semáforo</title>
        <meta name="author" content="Saúl Martín Fernández"/>
        <meta name="description" content="Juego de semáforo de la Fórmula 1"/>
        <meta name ="viewport" content ="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" type="text/css" href="estilo/estilo.css" />
        <link rel="stylesheet" type="text/css" href="estilo/layout.css" />
        <link rel="stylesheet" type="text/css" href="estilo/semaforo_grid.css" />
        <link rel="icon" href="multimedia/imagenes/favicon_f1Desktop.ico" type="image/x-icon"/>
        <script src="https://code.jquery.com/jquery-3.7.1.min.js" integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo=" crossorigin="anonymous"></script>
    </head>

    <body>
        <header>
            <h1><a href="index.html" title="F1 Desktop">F1 Desktop</a></h1>
        
            <!-- Datos con el contenido que aparece en el navegador -->
            <nav>
                <a href="index.html" title="Inicio">Inicio</a>
                <a href="piloto.html" title="Piloto">Piloto</a>
                <a href="noticias.html" title ="Noticias">Noticias</a>
                <a href="calendario.html" title="Calendario">Calendario</a>
                <a href="meteorologia.html" title="Meteorologia">Meteorologia</a>
                <a href="circuito.html" title="Circuito">Circuito</a>
                <a href="viajes.php" title="Viajes">Viajes</a>
                <a href="juegos.html" class="active" title="Juegos">Juegos</a>
            </nav>
        </header>

        <p>
            Estás en: 
            <a href="index.html" title="Inicio">Inicio</a> | <a href="juegos.html" title="Juegos">Juegos</a> | Semáforo
        </p>

        <aside>
            <nav>
                <a href="memoria.html" title="Memoria">Juego Memoria</a>
                <a href="semaforo.php" title="Semaforo">Juego Semáforo</a>
                <a href="api.html" title="Aplicación Web">Aplicación Web</a>
                <a href="php/dueloPreguntas.php" title="Aplicación Php">Aplicación Php</a>
            </nav>
        </aside>

        <main>
            <script src="js/semaforo.js"></script>
        </main>

        <?php 
            // Mostrar la tabla de ranking si existe
            if (isset($tablaRanking)) {
                echo "<article>";
                echo $tablaRanking;
                echo "</article>";
            }
        ?>

    </body>
</html>