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

                if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
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
        const circuito = xmlDoc.documentElement;
        
        const nombreCircuito = circuito.getElementsByTagName("nombre")[0].textContent;
        const longitud = circuito.getElementsByTagName("longitud_circuito")[0].textContent;
        const medidaLongitud = circuito.getElementsByTagName('longitud_circuito')[0].getAttribute('medida');
        const anchuraMed = circuito.getElementsByTagName("anchura")[0].textContent;
        const medidaAnchura = circuito.getElementsByTagName('anchura')[0].getAttribute('medida');

        const fechaCarrera = circuito.getElementsByTagName("fecha")[0].textContent;
        const horaCarreraEsp = circuito.getElementsByTagName("hora")[0].textContent;
        const numVueltas = circuito.getElementsByTagName("vueltas")[0].textContent;

        const localidad = circuito.getElementsByTagName("localidad")[0].textContent;
        const pais = circuito.getElementsByTagName("país")[0].textContent;

        const referencias =  circuito.getElementsByTagName("referencia");
        const ref1 = referencias[0].textContent;
        const ref2 = referencias[1].textContent;
        const ref3 = referencias[2].textContent;

        const fotografias = circuito.getElementsByTagName("fotografías")[0];
        const fotografia1 = "xml/"+fotografias.getElementsByTagName("fotografía")[0].textContent;
        const fotografia2 = "xml/"+fotografias.getElementsByTagName("fotografía")[1].textContent;
        const fotografia3 = "xml/"+fotografias.getElementsByTagName("fotografía")[2].textContent;
        const fotografia4 = "xml/"+fotografias.getElementsByTagName("fotografía")[3].textContent;
        
        const video = "xml/"+circuito.getElementsByTagName("vídeo")[0].textContent;

        const coordSalida = circuito.getElementsByTagName("salida")[0].getElementsByTagName("coordenada")[0];
        const longSalida = Number(coordSalida.getElementsByTagName("longitud")[0].textContent).toFixed(2);
        const latSalida = Number(coordSalida.getElementsByTagName("latitud")[0].textContent).toFixed(2);
        const altSalida = Number(coordSalida.getElementsByTagName("altitud")[0].textContent).toFixed(2);
        
        const tramos = circuito.getElementsByTagName("tramo");
        let sectorAnterior = 0;
        let numeroDeTramo = 0;
        let tramosHTML = "<ul>";
        for (const tramo of tramos) {
            const sector = tramo.getElementsByTagName("sector")[0].textContent;
            
            if ( sector != sectorAnterior ){
                if ( sectorAnterior != 0 ){
                    tramosHTML += "</ul>";
                }
                tramosHTML += `<li> Sector ${sector} <ul>`;
            }

            numeroDeTramo += 1;
            tramosHTML += `<li><dl><dt>Tramo: ${numeroDeTramo} </dt></li>`;
            
            const distancia = tramo.getElementsByTagName("distancia")[0];
            const medidaDistancia = distancia.getAttribute("medida");

            const longitud = Number(tramo.getElementsByTagName("longitud")[0].textContent).toFixed(2);
            const latitud = Number(tramo.getElementsByTagName("latitud")[0].textContent).toFixed(2);
            const altitud = Number(tramo.getElementsByTagName("altitud")[0].textContent).toFixed(2);

            tramosHTML += `<dd>Distancia: ${distancia.textContent} ${medidaDistancia}</dd>`;
            tramosHTML += `<dd>Longitud: ${longitud} </dd>`;
            tramosHTML += `<dd>Latitud: ${latitud} </dd>`;
            tramosHTML += `<dd>Altitud: ${altitud} </dd>`;

            tramosHTML += "</dl>"
            sectorAnterior = sector;
        }
        tramosHTML += "</ul>";

        const areaVisualizacion = document.querySelector('section:first-of-type');

        const contenidoHTML = `
            <article>
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
                </section>

            </article>
        `;
        
        areaVisualizacion.innerHTML = contenidoHTML;
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

                if (kmlDoc.getElementsByTagName("parsererror").length > 0) {
                    alert("Error: El archivo KML no es válido.");
                    return;
                }

                this.mostrarMapaKML(kmlDoc);
            };
            lector.readAsText(archivo);
        } else {
            console.log(archivo);
            alert("Error: Archivo no válido");
        }
    }

    mostrarMapaKML(kmlDoc){
        const circuito = kmlDoc.documentElement;

        const marcadores = circuito.getElementsByTagName("Placemark");

        const mapaExistente = document.querySelector('div');  
        if ( mapaExistente ){
            this.getMapaDinamicoGoogle(marcadores, mapaExistente);
            return;
        }

        const areaMapa = document.querySelector('p input[accept=".kml"]').closest('p');  

        const mapa = document.createElement('div');
        
        areaMapa.insertAdjacentElement('afterend', mapa);

        this.getMapaDinamicoGoogle(marcadores, mapa);
    }

    getMapaDinamicoGoogle(marcadores, contenedor) {
        const coordSalida = marcadores[0].getElementsByTagName("Point")[0].getElementsByTagName("coordinates")[0].textContent;
        const [longSalida, latSalida] = coordSalida.split(",").map(coord => parseFloat(coord));

        if (longSalida === undefined || latSalida === undefined) {
            console.error("Error: No se han obtenido las coordenadas para generar el mapa dinámico.");
            contenedor.innerHTML = "Error: No se puede cargar el mapa dinámico sin coordenadas.";
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

        for (const marcador of marcadores) {
            const coord = marcador.getElementsByTagName("Point")[0]?.getElementsByTagName("coordinates")[0]?.textContent;
            if (coord) {
                const [lng, lat] = coord.split(",").map(Number);
                
                trazadaCircuito.push({ lat, lng });

                new google.maps.Marker({
                    position: { lat, lng },
                    map: this.mapaCircuito,
                    title: marcador.getElementsByTagName("name")[0]?.textContent
                });
            }
        }
        
        new google.maps.Polyline({
            path: trazadaCircuito,
            map: this.mapaCircuito,
            geodesic: true,
            strokeColor: "#FF0000",
            strokeOpacity: 1.0,
            strokeWeight: 2,
          });
    }
/*
    leerArchivoSvg(files) {
        const archivo = files[0];
    
        const tipoXML = /svg.*/; /*
        if (archivo.type.match(tipoXML)) {
        const lector = new FileReader();
        lector.onload = (evento) => {
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(evento.target.result, "application/xml");
    
            if (svgDoc.querySelector("parsererror")) {
                alert("Error: El archivo SVG no es válido.");
                return;
            }
    
            this.mostrarContenidoSvg(svgDoc.documentElement);
        };
            lector.readAsText(archivo);
    } else {
            alert("Error: Archivo no válido");
        }
    }
    
    mostrarContenidoSvg(altimetria) {
        const svgExistente = document.querySelector("svg");
        if (svgExistente) svgExistente.remove();
    
        const areaSvg = document.querySelector('section:last-of-type');

        areaSvg.insertAdjacentElement("afterend", altimetria.cloneNode(true));
    }
*/

    leerArchivoSvg(files) {
        const archivo = files[0];

        const tipoXML = /svg.*/;
        if (archivo.type.match(tipoXML)) {
            const lector = new FileReader();

            lector.onload = function (event) {
                const parser = new DOMParser();
                const svgDoc = parser.parseFromString(event.target.result, "image/svg+xml");
                const svgElement = svgDoc.querySelector("svg");

                if (!svgElement) {
                    alert("Error: El archivo SVG no es válido.");
                    return;
                }

                const svgExistente = document.querySelector("section:last-of-type svg");
                if (svgExistente) svgExistente.remove();

                const areaSvg = document.querySelector("section:last-of-type");
                areaSvg.innerHTML = "";
                areaSvg.appendChild(svgElement);

                const width = svgElement.getAttribute("width");
                const height = svgElement.getAttribute("height");
                if (width && height) {
                    svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`);
                    svgElement.removeAttribute("width");
                    svgElement.removeAttribute("height");
                }

                svgElement.style.width = "70%";
                svgElement.style.height = "auto";
            };

            lector.readAsText(archivo);
        } else {
            alert("Error: Archivo no válido");
        }
    }

}

var circuito = new Circuito();