"use strict";
class Viajes {
    constructor() {
        this.geolocation = navigator.geolocation;
        this.infoWindow = null;
        this.mapaGeoposicionado = null;
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
                console.log("El usuario no permite la petición de geolocalización");
                break;
            case error.POSITION_UNAVAILABLE:
                console.log("Información de geolocalización no disponible");
                break;
            case error.TIMEOUT:
                console.log("La petición de geolocalización ha caducado");
                break;
            case error.UNKNOWN_ERROR:
                console.log("Se ha producido un error desconocido");
                break;
        }
    }

    getLongitud() {
        return this.longitud;
    }

    getLatitud() {
        return this.latitud;
    }

    getAltitud() {
        return this.altitud;
    }

    verTodo(contenedor) {
        var datos = '<p>' + this.mensaje + '</p>';
        datos += '<p>Longitud: ' + this.longitud + ' grados</p>';
        datos += '<p>Latitud: ' + this.latitud + ' grados</p>';
        datos += '<p>Precisión de la longitud y latitud: ' + this.precision + ' metros</p>';
        datos += '<p>Altitud: ' + this.altitud + ' metros</p>';  // Fixed from altitude to altitud
        datos += '<p>Precisión de la altitud: ' + this.precisionAltitud + ' metros</p>';
        datos += '<p>Rumbo: ' + this.rumbo + ' grados</p>';
        datos += '<p>Velocidad: ' + this.velocidad + ' metros/segundo</p>';
        contenedor.innerHTML = datos;
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
        contenedor.innerHTML = "<img src='" + this.imagenMapa + "' alt='mapa estático google' />";
    }

    getMapaDinamicoGoogle(contenedor) {
        if (this.latitud === undefined || this.longitud === undefined) {
            console.error("Error: No se han obtenido las coordenadas para generar el mapa dinámico.");
            contenedor.innerHTML = "Error: No se puede cargar el mapa dinámico sin coordenadas.";
            return;
        }
    
        const centro = { lat: this.latitud, lng: this.longitud };
    
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
    

    handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
            'Error: Ha fallado la geolocalización.' :
            'Error: Su navegador no soporta geolocalización.');
        infoWindow.open(this.mapaGeoposicionado);
    }

    showMaps() {
        var staticCont = document.querySelector('section');
        var dynamicCont = document.querySelector('div');

        if (this.latitud === undefined || this.longitud === undefined) {
            staticCont.innerHTML = "Cargando mapa...";
            dynamicCont.innerHTML = "Cargando mapa...";

            if (this.geolocation) {
                this.geolocation.getCurrentPosition(
                    (position) => {
                        this.getPosicion(position);
                        this.getMapaEstaticoGoogle(staticCont);
                        this.getMapaDinamicoGoogle(dynamicCont);
                    },
                    (error) => {
                        this.verErrores(error);
                        staticCont.innerHTML = "Error al cargar el mapa";
                        dynamicCont.innerHTML = "Error al cargar el mapa";
                    }
                );
            }
        } else {
            // We already have the position
            this.getMapaEstaticoGoogle(staticCont);
            this.getMapaDinamicoGoogle(dynamicCont);
        }
    }


    configurarCarrousel(){
        const slides = document.querySelectorAll("img");

        // select next slide button
        const nextSlide = document.querySelector("button:nth-of-type(1)");

        // current slide counter
        let curSlide = 3;
        // maximum number of slides
        let maxSlide = slides.length - 1;

        // add event listener and navigation functionality
        nextSlide.addEventListener("click", function () {
        // check if current slide is the last and reset current slide
        if (curSlide === maxSlide) {
            curSlide = 0;
        } else {
            curSlide++;
        }

        //   move slide by -100%
        slides.forEach((slide, indx) => {
            var trans = 100 * (indx - curSlide);
            slide.style.transform = `translateX(${trans}%)`;
        });
        });

        // select next slide button
        const prevSlide = document.querySelector("button:nth-of-type(2)");

        // add event listener and navigation functionality
        prevSlide.addEventListener("click", function () {
        // check if current slide is the first and reset current slide to last
        if (curSlide === 0) {
            curSlide = maxSlide;
        } else {
            curSlide--;
        }

        //   move slide by 100%
        slides.forEach((slide, indx) => {
            var trans = 100 * (indx - curSlide);
            slide.style.transform = `translateX(${trans}%)`;
        });
        });
    }
}

var viajes = new Viajes();
viajes.showMaps();
viajes.configurarCarrousel();