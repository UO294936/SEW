class Agenda {

    constructor(){
        this.url = "https://ergast.com/api/f1/current.json";
    }

    cargarDatos(){
        $.ajax({
            dataType: "json",
            url: this.url,
            method: 'GET',
            success: function(datos){
                const carreras = datos.MRData.RaceTable.Races;
                var stringDatos = "<h3>Temporada: " + carreras[0].season + "</h3>";

                carreras.forEach(carrera => {
                    stringDatos += "<article>";
                    stringDatos += "<h4>"+carrera.round+ ". "+ carrera.raceName +"</h4>";

                    stringDatos += "<dl><dt>Circuito: " + carrera.Circuit.circuitName +"</dt>";
                    stringDatos += "<dd>Coordenadas</dd>";
                    stringDatos += "<ul>"
                    stringDatos += "<li>Latitud: " + carrera.Circuit.Location.lat + "</li>";
                    stringDatos += "<li>Longitud: " + carrera.Circuit.Location.long + "</li>";
                    stringDatos += "</ul>";
                    stringDatos += "</dl>";
                    
                    var fechaHora = carrera.date + 'T' + carrera.time;
                    var fecha = new Date(fechaHora);
                    var horaFormateada = fecha.toLocaleString("es-ES", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false
                    });

                    stringDatos += "<p>" + horaFormateada + "<p>";
                    stringDatos += "</article>";
                });

                $("section").html(stringDatos);
            },
            error: function(jqXHR, textStatus, errorThrown){
                console.error("Error loading race data:");
                console.error("Status:", textStatus);
                console.error("Error:", errorThrown);
            }
        });
    }
}

const boton = document.querySelector("button");
boton.setAttribute("onclick","mostrarDatos()"); 

function mostrarDatos() {
    var agenda = new Agenda();    
    agenda.cargarDatos();
}

