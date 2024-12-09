<?php

class Record {

    protected $server;
    protected $user;
    protected $pass;
    protected $dbname;
    
    protected $pdo;

    protected $nombre = "";
    protected $apellido = "";
    protected $nivel = 0.0;
    protected $tiempo = 0.0;
    
    
    public function __construct(){
        $this->server = "localhost";
        $this->user = "DBUSER2024";
        $this->pass = "DBPSWD2024";
        $this->dbname = "records";
        
        // Conexión a la base de datos vía PDO
        try {
            $this->pdo = new PDO(
                "mysql:host={$this->server};dbname={$this->dbname};charset=utf8",
                $this->user,
                $this->pass,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
        } catch (PDOException $e) {
            die("Database connection failed: " . $e->getMessage());
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
                VALUES (:nombre, :apellido, :nivel, :tiempo)";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                ':nombre' => $this->nombre,
                ':apellido' => $this->apellido,
                ':nivel' => $this->nivel,
                ':tiempo' => $this->tiempo,
            ]);
        } catch (PDOException $e) {
            echo "<p>Error guardando los datos: " . $e->getMessage() . "</p>";
        }
    }

    public function consultar10Mejores(){
        $sql = "SELECT DISTINCT nombre, apellidos, tiempo 
                FROM registro 
                WHERE nivel = :nivel 
                ORDER BY tiempo ASC 
                LIMIT 10";
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':nivel' => $this->nivel]);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
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
                    <th>Posición</th>
                    <th>Nombre</th>
                    <th>Apellidos</th>
                    <th>Tiempo (segundos)</th>
                </tr>
            </thead>
            <tbody>";
    
        if (count($topRecords) > 0) {
            foreach ($topRecords as $index => $record) {
                $rankingTableHTML .= "
                <tr>
                    <td>" . ($index + 1) . "</td>
                    <td>" . htmlspecialchars($record['nombre']) . "</td>
                    <td>" . htmlspecialchars($record['apellidos']) . "</td>
                    <td>" . number_format($record['tiempo'], 3) . "</td>
                </tr>";
            }
        } else {
            $rankingTableHTML .= "
            <tr>
                <td colspan='4'>No hay récords para este nivel.</td>
            </tr>";
        }
        
        $rankingTableHTML .= "
            </tbody>
        </table>";

        return $rankingTableHTML;
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
                <a href="php/aplicacionPhp.php" title="Aplicación Php">Aplicación Php</a>
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