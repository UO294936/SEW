class Circuito {

    constructor(){
        if (!(window.File && window.FileReader && window.FileList && window.Blob)) {
            alert("Este navegador NO soporta el API File y este programa puede no funcionar correctamente");
            return;
        }
        this.infoWindow = null;
        this.mapaCircuito = null;
    }

    leerArchivoXml(files) {
        const archivo = files[0];

        const tipoXML = /xml.*/;
        if (archivo.type.match(tipoXML)) {
            const lector = new FileReader();
            lector.onload = (evento) => {
                const contenido = lector.result;

                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(contenido, "application/xml");

                if ($(xmlDoc).find("parsererror").length > 0) {
                    alert("Error: El archivo XML no es válido.");
                    return;
                }

                this.mostrarContenidoXML(xmlDoc);
            };
            lector.readAsText(archivo);
        } else {
            alert("Error: Archivo no válido");
        }
    }

    mostrarContenidoXML(xmlDoc) {
        const circuito = $(xmlDoc).find("circuito");

        const nombreCircuito = circuito.find("nombre").text();
        const longitud = circuito.find("longitud_circuito").text();
        const medidaLongitud = circuito.find('longitud_circuito').attr('medida');
        const anchuraMed = circuito.find("anchura").text();
        const medidaAnchura = circuito.find('anchura').attr('medida');

        const fechaCarrera = circuito.find("fecha").text();
        const horaCarreraEsp = circuito.find("hora").text();
        const numVueltas = circuito.find("vueltas").text();

        const localidad = circuito.find("localidad").text();
        const pais = circuito.find("país").text();

        const referencias = circuito.find("referencia");
        const ref1 = referencias.eq(0).text();
        const ref2 = referencias.eq(1).text();
        const ref3 = referencias.eq(2).text();

        const fotografias = circuito.find("fotografías");
        const fotografia1 = "xml/" + fotografias.find("fotografía").eq(0).text();
        const fotografia2 = "xml/" + fotografias.find("fotografía").eq(1).text();
        const fotografia3 = "xml/" + fotografias.find("fotografía").eq(2).text();
        const fotografia4 = "xml/" + fotografias.find("fotografía").eq(3).text();

        const video = "xml/" + circuito.find("vídeo").text();

        const coordSalida = circuito.find("salida coordenada");
        const longSalida = Number(coordSalida.find("longitud").text()).toFixed(2);
        const latSalida = Number(coordSalida.find("latitud").text()).toFixed(2);
        const altSalida = Number(coordSalida.find("altitud").text()).toFixed(2);

        const tramos = circuito.find("tramo");
        let sectorAnterior = 0;
        let numeroDeTramo = 0;
        let tramosHTML = "<ul>";
        tramos.each((index, tramo) => {
            const sector = $(tramo).find("sector").text();

            if (sector != sectorAnterior) {
                if (sectorAnterior != 0) {
                    tramosHTML += "</ul>";
                }
                tramosHTML += `<li> Sector ${sector} <ul>`;
            }

            numeroDeTramo += 1;

            const distancia = $(tramo).find("distancia");
            const medidaDistancia = distancia.attr("medida");

            const longitud = Number($(tramo).find("longitud").text()).toFixed(2);
            const latitud = Number($(tramo).find("latitud").text()).toFixed(2);
            const altitud = Number($(tramo).find("altitud").text()).toFixed(2);

            tramosHTML += `<li><dl>`;
            tramosHTML += `<dt>Tramo: ${numeroDeTramo}</dt>`;
            tramosHTML += `<dd>Distancia: ${distancia.text()} ${medidaDistancia}</dd>`;
            tramosHTML += `<dd>Longitud: ${longitud}</dd>`;
            tramosHTML += `<dd>Latitud: ${latitud}</dd>`;
            tramosHTML += `<dd>Altitud: ${altitud}</dd>`;
            tramosHTML += `</dl></li>`;

            sectorAnterior = sector;
        });
        tramosHTML += "</ul>";

        const areaVisualizacion = $('section:first-of-type');

        const contenidoHTML = `
            <h3>${nombreCircuito}</h3>
            
            <section>
                <h4>Detalles</h4>
                <p>Longitud: ${longitud} ${medidaLongitud}</p>
                <p>Anchura media: ${anchuraMed} ${medidaAnchura}</p>
                <p>Lugar: ${localidad}, ${pais}</p>
            </section>

            <section>
                <h4>Información sobre la carrera</h4>
                <p>Fecha (España): ${fechaCarrera}</p>
                <p>Hora (España): ${horaCarreraEsp}</p>
                <p>Numero de vueltas: ${numVueltas}</p>
            </section>

            <section>
                <h4>Coordenadas de la Salida</h4>
                <p>Longitud: ${longSalida}</p>
                <p>Latitud: ${latSalida}</p>
                <p>Altitud: ${altSalida}</p>
            </section>

            <section>
                <h4>Fotografías del circuito</h4>
                <figure>
                    <img src="${fotografia1}" alt="Plano del circuito de Bahréin">
                </figure>
                <figure>
                    <img src="${fotografia2}" alt="Fotografía aérea del circuito de Bahréin de noche">
                </figure>
                <figure>
                    <img src="${fotografia3}" alt="Fotografía de un vehículo de Fórmula 1 al atardecer en el circuito de Bahréin">
                </figure>
                <figure>
                    <img src="${fotografia4}" alt="Fotografía de 3 vehículos de Fórmula 1 compitiendo en el circuito de Bahréin">
                </figure>
            </section>

            <section>
                <h4>Vídeo del circuito</h4>
                <video controls>
                    <source src="${video}" type="video/mp4">
                    El navegador no permite la reproducción del vídeo.
                </video>
            </section>

            <section>
                <h4>Tramos del Circuito</h4>
                ${tramosHTML}
            </section>

            <section>
                <h4>Referencias</h4>
                    <p><a href="${ref1}">${ref1}</a></p>
                    <p><a href="${ref2}">${ref2}</a></p>
                    <p><a href="${ref3}">${ref3}</a></p>
            </section>`;
        
        areaVisualizacion.html(contenidoHTML);
    }

    leerArchivoKml(files) {
        const archivo = files[0];

        const tipoKML = "application/vnd.google-earth.kml+xml";
        if (archivo.type.match(tipoKML)  || archivo.name.endsWith(".kml")) {
            const lector = new FileReader();
            lector.onload = (evento) => {
                const contenido = lector.result;

                const parser = new DOMParser();
                const kmlDoc = parser.parseFromString(contenido, "application/xml");

                if ($(kmlDoc).find("parsererror").length > 0) {
                    alert("Error: El archivo KML no es válido.");
                    return;
                }

                this.mostrarMapaKML(kmlDoc);
            };
            lector.readAsText(archivo);
        } else {
            alert("Error: Archivo no válido");
        }
    }

    mostrarMapaKML(kmlDoc){
        const circuito = $(kmlDoc).find("kml");

        const marcadores = circuito.find("Placemark");

        const mapaExistente = $('div');  
        if ( mapaExistente.length ){
            this.getMapaDinamicoGoogle(marcadores, mapaExistente[0]);
            return;
        }

        const areaMapa = $('p input[accept=".kml"]').closest('p');  

        const mapa = $('<div></div>');
        
        areaMapa.after(mapa);

        this.getMapaDinamicoGoogle(marcadores, mapa[0]);
    }

    getMapaDinamicoGoogle(marcadores, contenedor) {
        const coordSalida = marcadores.eq(0).find("Point coordinates").text();
        const [longSalida, latSalida] = coordSalida.split(",").map(coord => parseFloat(coord));

        if (longSalida === undefined || latSalida === undefined) {
            $(contenedor).html("Error: No se han obtenido las coordenadas para generar el mapa dinámico.");
            return;
        }
    
        const centro = { lat: latSalida, lng: longSalida };
    
        this.mapaCircuito = new google.maps.Map(contenedor, {
            zoom: 15,
            center: centro,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
    
        this.infoWindow = new google.maps.InfoWindow({
            position: centro,
            content: "Punto de salida"
        });
    
        this.infoWindow.open(this.mapaCircuito);

        this.colocarMarcadores(marcadores)
    }

    colocarMarcadores(marcadores){
        const trazadaCircuito = [];

        marcadores.each((index, marcador) => {
            const coord = $(marcador).find("Point coordinates").text();
            if (coord) {
                const [lng, lat] = coord.split(",").map(Number);
                
                trazadaCircuito.push({ lat, lng });

                new google.maps.Marker({
                    position: { lat, lng },
                    map: this.mapaCircuito,
                    title: $(marcador).find("name").text()
                });
            }
        });
        
        new google.maps.Polyline({
            path: trazadaCircuito,
            map: this.mapaCircuito,
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
          });
    }

    leerArchivoSvg(files) {
        const archivo = files[0];

        const tipoXML = /svg.*/;
        if (archivo.type.match(tipoXML)) {
            const lector = new FileReader();

            lector.onload = function (event) {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(event.target.result, "image/svg+xml");
                const svgElement = $(svgDoc).find("svg")[0];

                if (!svgElement) {
                    alert("Error: El archivo SVG no es válido.");
                    return;
                }

                const svgExistente = $("p + section:last-of-type svg");
                if (svgExistente.length) svgExistente.remove();

                const areaSvg = $("p + section:last-of-type");
                areaSvg.html("");
                
                const titleSvg = $("<h4></h4>").text("Altimetría:");
                areaSvg.append(titleSvg);

                areaSvg.append(svgElement);

                const width = svgElement.getAttribute("width");
                const height = svgElement.getAttribute("height");
                if (width && height) {
                    svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
                    svgElement.removeAttribute("width");
                    svgElement.removeAttribute("height");
                }
            };

            lector.readAsText(archivo);
        } else {
            alert("Error: Archivo no válido");
        }
    }

}

var circuito = new Circuito();
