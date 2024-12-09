<?php
	class Carrusel {
		
		protected $nombreCapital;
		protected $nombrePais;
		protected $url;
		protected $numeroFotos;

		public function __construct($nomCapital, $nomPais){
			$this->nombreCapital = $nomCapital;
			$this->nombrePais = $nomPais;

			$this->setAttributes();
		}

		public function setAttributes(){
			$api_key = '69c886f00748231ed4499a2648e5411f';
			$tag = $this->nombrePais .",". $this->nombreCapital;
			$this->numeroFotos = 10;
			
			// Fotos públicas recientes
			$this->url = 'https://api.flickr.com/services/feeds/photos_public.gne?';
			$this->url.= '&api_key='.$api_key;
			$this->url.= '&tags='.$tag;
			$this->url.= '&per_page='.$this->numeroFotos;
			$this->url.= '&format=json';
			$this->url.= '&nojsoncallback=1';
		}

		public function crearCarrousel(){
			$respuesta = file_get_contents($this->url);
			$json = json_decode($respuesta);
			$carrouselHTML = "<article>";

			if($json==null) {
				error_log("Error al obtener los datos de la API");
				return "<p>No se pudieron cargar las imágenes.</p>";
			}

			$carrouselHTML .= "<h3>Carrusel de Imágenes</h3>";

			for($i=0;$i<$this->numeroFotos;$i++) {

				$titulo = $json->items[$i]->title;
				$URLfoto = $json->items[$i]->media->m;  

				$carrouselHTML .=  "<img alt='".$titulo."' src='".$URLfoto."' />";
			}

			$carrouselHTML .= "<button> &gt; </button>";
			$carrouselHTML .= "<button> &lt; </button>";
			$carrouselHTML .= "</article>";

			return $carrouselHTML;
		}
	}

?>

<?php

	class Moneda {
		protected $codigoOrigen;
		protected $codigoDestino;

		public function __construct($codigoOrigen, $codigoDestino){
			$this->codigoOrigen = $codigoOrigen;
			$this->codigoDestino = $codigoDestino;
		}

		public function obtenerCambio($cantidad){
	        $api_key = "b57313efeb37ede560ee24f6ceabdceb";
			$url = "http://api.exchangeratesapi.io/v1/latest";
			$url .= "?access_key={$api_key}";
			$url .= "&symbols={$this->codigoOrigen},{$this->codigoDestino}";

			$respuesta = file_get_contents($url);
			$json = json_decode($respuesta);

			if ($respuesta === false || $json === null || !isset($json->rates->{$this->codigoDestino})) {
				error_log("Error al obtener los datos de la API: " . $respuesta);
				return "<p>No se pudo cargar el cambio de moneda.</p>";
			}

			$tasa = $json->rates->{$this->codigoDestino};
			$cambio = $cantidad * $tasa;

			// Build output
			$cambioHTML = "<h3>Cambio de Moneda</h3>";
			$cambioHTML .= "<p>{$cantidad} {$this->codigoOrigen} equivale a " . number_format($cambio, 2) . " {$this->codigoDestino}</p>";
			return $cambioHTML;
    	}
	}
?>	

<!DOCTYPE HTML>
<html lang="es">

<head>
	<!-- Datos que describen el documento -->
	<meta charset="UTF-8" />
	<title>Viajes</title>
	<meta name="author" content="Saúl Martín Fernández" />
	<meta name="description" content="Sección de viajes" />
	<meta name="keywords" content="Fórmula 1, F1, viajes" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<link rel="stylesheet" type="text/css" href="estilo/estilo.css" />
	<link rel="stylesheet" type="text/css" href="estilo/layout.css" />
	<link rel="icon" href="multimedia/imagenes/favicon_f1Desktop.ico" type="image/x-icon" />
	<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyC6j4mF6blrc4kZ54S6vYZ2_FpMY9VzyRU"></script>
</head>

<body>
	<header>
		<h1><a href="index.html" title="F1 Desktop">F1 Desktop</a></h1>

		<!-- Datos con el contenido que aparece en el navegador -->
		<nav>
			<a href="index.html" title="Inicio">Inicio</a>
			<a href="piloto.html" title="Piloto">Piloto</a>
			<a href="noticias.html" title="Noticias">Noticias</a>
			<a href="calendario.html" title="Calendario">Calendario</a>
			<a href="meteorologia.html" title="Meteorologia">Meteorologia</a>
			<a href="circuito.html" title="Circuito">Circuito</a>
			<a href="viajes.php" class="active" title="Viajes">Viajes</a>
			<a href="juegos.html" title="Juegos">Juegos</a>
		</nav>
	</header>

	<p>
		Estás en:
		<a href="index.html" title="Inicio">Inicio</a> | Viajes
	</p>

	<main>
		<h2>Sección de viajes de la Fórmula 1</h2>

		<h3>Tu posición (mapa estático)</h3>
			<section></section>
		
		<h3>Tu posición (mapa dinámico)</h3>
			<div></div>
		
		<?php 
			$carrusel = new Carrusel("Manama", "Bahrain");
			echo $carrusel->crearCarrousel();

			$cambioMoneda = new Moneda("EUR", "BHD");
			echo $cambioMoneda->obtenerCambio(1.0);
		?>

	</main>
	<script src="js/viajes.js"></script>
</body>

</html>