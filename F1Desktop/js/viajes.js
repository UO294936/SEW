"use strict";
class Viajes {
    constructor() {
        this.geolocation = navigator.geolocation;
        this.infoWindow = null;
        this.mapaGeoposicionado = null;
        this.errorMessage = null;
    }

    getPosicion(posicion) {
        this.mensaje = "Se ha realizado correctamente la petición de geolocalización";
        this.longitud = posicion.coords.longitude;
        this.latitud = posicion.coords.latitude;
        this.precision = posicion.coords.accuracy;
        this.altitud = posicion.coords.altitude;
        this.precisionAltitud = posicion.coords.altitudeAccuracy;
        this.rumbo = posicion.coords.heading;
        this.velocidad = posicion.coords.speed;
    }

    verErrores(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                this.errorMessage = "El usuario no permite la petición de geolocalización";
                break;
            case error.POSITION_UNAVAILABLE:
                this.errorMessage = "Información de geolocalización no disponible";
                break;
            case error.TIMEOUT:
                this.errorMessage = "La petición de geolocalización ha caducado";
                break;
            case error.UNKNOWN_ERROR:
                this.errorMessage = "Se ha producido un error desconocido";
                break;
        }
    }

    getMapaEstaticoGoogle(contenedor) {
        var apiKey = "&key=AIzaSyC6j4mF6blrc4kZ54S6vYZ2_FpMY9VzyRU";
        var url = "https://maps.googleapis.com/maps/api/staticmap?";
        var centro = "center=" + this.latitud + "," + this.longitud;
        var zoom = "&zoom=15";
        var tamaño = "&size=800x600";
        var marcador = "&markers=color:red%7Clabel:S%7C" + this.latitud + "," + this.longitud;
        var sensor = "&sensor=false";

        this.imagenMapa = url + centro + zoom + tamaño + marcador + sensor + apiKey;
        $(contenedor).html("<h3>Tu posición (mapa estático)</h3>");
        $(contenedor).append("<button>Generar</button>");
        $(contenedor).append("<img src='" + this.imagenMapa + "' alt='mapa estático google' />");
    }

    getMapaDinamicoGoogle(contenedor) {
        if (this.latitud === undefined || this.longitud === undefined) {
            $(contenedor).html("Error: No se han podido obtener las coordenadas para generar el mapa dinámico.");
            return;
        }
    
        const centro = { lat: this.latitud, lng: this.longitud };
    
        $(contenedor).removeAttr("hidden");

        this.mapaGeoposicionado = new google.maps.Map(contenedor, {
            zoom: 15,
            center: centro,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
    
        this.infoWindow = new google.maps.InfoWindow({
            position: centro,
            content: "Localización encontrada"
        });
    
        this.infoWindow.open(this.mapaGeoposicionado);
    }
    
    iniciarMapas() {
        const botones = $("button");
        const contenedorEstatico = $("section")[0];
        const contenedorDinamico = $("div")[0];

        $(botones[0]).on("click", () => {
            if (this.geolocation) {
                this.geolocation.getCurrentPosition(
                    (posicion) => {
                        this.getPosicion(posicion);
                        this.getMapaEstaticoGoogle(contenedorEstatico);
                    },
                    (error) => this.verErrores(error)
                );
            }
        });

        $(botones[1]).on("click", () => {
            if (this.geolocation && (this.latitud === undefined || this.longitud === undefined)) {
                this.geolocation.getCurrentPosition(
                    (posicion) => {
                        this.getPosicion(posicion);
                        this.getMapaDinamicoGoogle(contenedorDinamico);
                        this.mostrarDiv(contenedorDinamico);
                    },
                    (error) => this.verErrores(error)
                );
            } else if (this.latitud !== undefined && this.longitud !== undefined) {
                this.getMapaDinamicoGoogle(contenedorDinamico);
            }
        });
    }

    configurarCarrousel(){
        const slides = $("img").toArray();
        const allButtons = $("button").toArray(); 

        // seleccionar botón de siguiente diapositiva
        const nextSlide = allButtons[2];

        // contador de diapositiva actual
        let curSlide = 3;
        // número máximo de diapositivas
        let maxSlide = slides.length - 1;

        // añadir evento y funcionalidad de navegación
        $(nextSlide).on("click", function () {
        // comprobar si la diapositiva actual es la última y reiniciar la diapositiva actual
        if (curSlide === maxSlide) {
            curSlide = 0;
        } else {
            curSlide++;
        }

        // mover diapositiva por -100%
        slides.forEach((slide, indx) => {
            var trans = 100 * (indx - curSlide);
            slide.style.transform = `translateX(${trans}%)`;
        });
        });

        // seleccionar botón de diapositiva anterior
        const prevSlide = allButtons[3];

        // añadir evento y funcionalidad de navegación
        prevSlide.addEventListener("click", function () {
        // comprobar si la diapositiva actual es la primera y reiniciar la diapositiva actual a la última
        if (curSlide === 0) {
            curSlide = maxSlide;
        } else {
            curSlide--;
        }

        // mover diapositiva por 100%
        slides.forEach((slide, indx) => {
            var trans = 100 * (indx - curSlide);
            slide.style.transform = `translateX(${trans}%)`;
        });
        });
    }
}

var viajes = new Viajes();
viajes.iniciarMapas();
viajes.configurarCarrousel();