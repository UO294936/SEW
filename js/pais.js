
class Pais {

    constructor(nombrePais, nombreCapital, poblacion){
        this.nombrePais = nombrePais;
        this.nombreCapital = nombreCapital;
        this.poblacion = poblacion;

        this.nombreCircuito = null;
        this.formaDeGobierno = null;
        this.coordenadasMeta = null;
        this.religion = null;

        this.apikey = "d31c8e00c10636c91a8b232782b3f686";
        this.tipo = "&mode=xml";
        this.unidades = "&units=metric";
        this.idioma = "&lang=es";
    }

    rellenarAtributos (nombreCircuito, formaDeGobierno, coordenadasMeta, religion){
        this.nombreCircuito = nombreCircuito;
        this.formaDeGobierno = formaDeGobierno;
        this.coordenadasMeta = coordenadasMeta;
        this.religion = religion;

        this.url = "https://api.openweathermap.org/data/2.5/forecast?lat="+this.coordenadasMeta[0]+"&lon="+this.coordenadasMeta[1]+this.tipo+this.unidades+this.idioma+"&APPID="+this.apikey;
    }

    obtenerNombrePais() {
        return "Nombre del país: "+ this.nombrePais;
    }

    obtenerNombreCapital() {
        return "Capital: " + this.nombreCapital;
    }

    obtenerPoblacion() {
        return "Población: "+ this.poblacion;
    }

    obtenerInformacionSecundaria() {
        return `<ul>
                    <li>Nombre del circuito: ${this.nombreCircuito}</li>
                    <li>Población: ${this.poblacion} habitantes</li>
                    <li>Forma de gobierno: ${this.formaDeGobierno}</li>
                    <li>Religión mayoritaria: ${this.religion}</li>
                </ul>`;
    }

    escribirCoordenadasMeta() {
        document.write(`Coordenadas de la meta del circuito: Latitud: ${this.coordenadasMeta[0]}, Longitud: ${this.coordenadasMeta[1]}, Altitud: ${this.coordenadasMeta[2]}<br>`);
    }

    cargarPrevisionMeteorologica() {
        $.ajax({
            dataType: "xml",
            url: this.url,
            method: 'GET',
            success: function(datos) {
                let previsionHtml = '';
               
                $(datos).find("time").each(function() {
                    var dateStr = $(this).attr("from");
                    var date = new Date(dateStr);
                    var hour = date.getHours();
                    
                    if (hour === 3) {                       
                        var fecha = date.toLocaleDateString('es-ES');
                        // Obtener los valores dentro del contexto actual del time
                        var temperaturaMin = $(this).find('temperature').attr("min");
                        var temperaturaMax = $(this).find('temperature').attr("max");
                        var humedad = $(this).find('humidity').attr("value");
                        var condition = $(this).find('symbol').attr("name");
                        var icono = $(this).find('symbol').attr("var");
                        var precipitacion = $(this).find('precipitation').attr("value") || '0';

                        previsionHtml += "<article>";
                        previsionHtml += "<h4>" + fecha + "</h4>";
                        previsionHtml += `<img src="https://openweathermap.org/img/wn/${icono}@2x.png" alt="${condition}">`;
                        previsionHtml += "<p>Temp. Max: " + temperaturaMax + "°C</p>";
                        previsionHtml +=  "<p>Temp. Min: " + temperaturaMin + "°C</p>";
                        previsionHtml += "<p>Humedad: " + humedad + "% | Lluvia: " + precipitacion + " mm</p>";
                        previsionHtml += "</article>";
                    }
                });
    
                $("section").html(previsionHtml);
            },
            error: function() {
                console.log("Error, no se han podido cargar los datos de previsión meteorológica.");
            }
        });
    }
}


var bahrein = new Pais( "Bahréin", "Manama", 1577059);
bahrein.rellenarAtributos("Circuito Internacional de Baréin", "Monarquía constitucional",[26.0327, 50.5104, 7.3154], "Islam");
document.write("<p>"+bahrein.obtenerNombrePais()+"</p>");
document.write("<p>"+bahrein.obtenerNombreCapital()+"</p>");
document.write(bahrein.obtenerInformacionSecundaria());
bahrein.escribirCoordenadasMeta();
bahrein.cargarPrevisionMeteorologica();