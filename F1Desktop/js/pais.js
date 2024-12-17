
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
        document.write(`<p>Coordenadas de la meta del circuito: Latitud: ${this.coordenadasMeta[0]}, Longitud: ${this.coordenadasMeta[1]}, Altitud: ${this.coordenadasMeta[2]}</p>`);
    }
    cargarPrevisionMeteorologica() {
        $.ajax({
            dataType: "xml",
            url: this.url,
            method: 'GET',
            success: (datos) => {
                let previsionHtml = '<h3>Previsión meteorológica para los próximos 5 días</h3>';
                let previsionDiaria = {};
                let dias = 0;
                
                let iconoApi = null;
                let conditionApi = null;
                let hoy = new Date().toLocaleDateString('es-ES');

                // Recorre cada elemento "time" en los datos XML
                $(datos).find("time").each(function() {
                    if (dias >= 5) return false; // Previsión para 5 días

                    var dateStr = $(this).attr("from");
                    var date = new Date(dateStr);

                    // Ajusta a la zona horaria de Baréin (GMT+3)
                    var dateLocal = new Date(date.getTime() + (3 * 60 * 60 * 1000));

                    var dia = dateLocal.toLocaleDateString('es-ES');
                    var hora = dateLocal.getHours();
                    
                    if (dia === hoy) return true; // Salta la previsión para hoy

                    var temperatura = parseFloat($(this).find('temperature').attr("value"));
                    var humedad = $(this).find('humidity').attr("value");
                    var precipitacion = $(this).find('precipitation').attr("value") || '0';
                    
                    // Coge el icono de día
                    if (hora >= 6 && hora <= 14) {
                        iconoApi = $(this).find('symbol').attr("var");
                        conditionApi = $(this).find('symbol').attr("name");
                    }

                    // Si no hay datos para el día actual, inicializa un nuevo objeto
                    if (!previsionDiaria[dia]) {
                        previsionDiaria[dia] = {
                            minTemp: temperatura,
                            maxTemp: temperatura,
                            humedad: humedad,
                            icono: null,
                            condition: null,
                            precipitacion: parseFloat(precipitacion)
                        };
                        dias++;
                    } else {
                        // Actualiza los datos del día actual
                        previsionDiaria[dia].minTemp = Math.min(previsionDiaria[dia].minTemp, temperatura);
                        previsionDiaria[dia].maxTemp = Math.max(previsionDiaria[dia].maxTemp, temperatura);
                        previsionDiaria[dia].precipitacion += isNaN(parseFloat(precipitacion)) ? 0 : parseFloat(precipitacion);
                    }

                    // Actualiza el icono y la condición del día actual
                    if (iconoApi != null && conditionApi != null){
                        previsionDiaria[dia].icono = iconoApi;
                        previsionDiaria[dia].condition = conditionApi;
                    }
                });

                // Genera el HTML para cada día de previsión
                for (let dia in previsionDiaria) {
                    previsionHtml += "<article>";
                    previsionHtml += "<h4>" + dia + "</h4>";
                    if (previsionDiaria[dia].icono) {
                        previsionHtml += `<img src="https://openweathermap.org/img/wn/${previsionDiaria[dia].icono}@2x.png" alt="${previsionDiaria[dia].condition}">`;
                    }
                    previsionHtml += "<p>Temp. Max: " + previsionDiaria[dia].maxTemp + "°C</p>";
                    previsionHtml += "<p>Temp. Min: " + previsionDiaria[dia].minTemp + "°C</p>";
                    previsionHtml += "<p>Humedad: " + previsionDiaria[dia].humedad + "% | Lluvia: " + previsionDiaria[dia].precipitacion + " mm</p>";
                    previsionHtml += "</article>";
                }

                // Inserta el HTML generado en la section
                $("section").html(previsionHtml);
            },
            error: () => {
                // Muestra un mensaje de error si la solicitud falla
                $("section").html("<p>No se han podido cargar los datos de previsión meteorológica.</p>");
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