class Noticias {

    constructor() {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            this.APIFileSupported = true;
        }
        else {
            this.APIFileSupported = false;
            console.log("Este navegador NO soporta el API File. La aplicación no puede funcionar");
        }
    }

    readInputFile(files) {
        if (this.APIFileSupported) {
            var section = document.querySelector('section');

            var archivo = files[0];

            const tipoTexto = /text.*/;
            if (archivo.type.match(tipoTexto)) {
                var lector = new FileReader();

                lector.onload = evento => { // Uso de función flecha para poder llamar a this.crearNoticia()
                    var noticias = evento.target.result.split('\n');

                    for (var n = 0; n < noticias.length; n++) {
                        var partes = noticias[n].split('_');

                        var noticia = this.crearNoticia(partes[0], partes[1], partes[2]);

                        section.appendChild(noticia);
                    }
                }

                lector.readAsText(archivo);
            } else {
                console.log("Error: Archivo no válido. Seleccione un archivo de texto.");
            }
        }
    }

    crearNoticia(txtTitular, txtEntradilla, txtAutor) {
        var noticia = document.createElement('article');

        var titular = document.createElement('h3');
        var entradilla = document.createElement('p');
        var autor = document.createElement('p');

        titular.innerText = txtTitular;
        entradilla.innerText = txtEntradilla;
        autor.innerText = txtAutor;

        noticia.appendChild(titular);
        noticia.appendChild(entradilla);
        noticia.appendChild(autor);

        return noticia;
    }

    agregarNoticiaManualmente() {
        var titulo = document.querySelector("input[type='text']").value.trim();
        var entradilla = document.querySelector("textarea").value.trim();
        var autor = document.querySelectorAll("input[type='text']")[1].value.trim();

        if (!titulo || !entradilla || !autor) {
            alert("Por favor, complete todos los campos antes de agregar una noticia.");
            return;
        }
        
        var finalSection = document.querySelector("section");

        var noticia = this.crearNoticia(titulo, entradilla, autor);

        finalSection.appendChild(noticia);

        document.querySelector("input[type='text']").value = '';
        document.querySelectorAll("input[type='text']")[1].value = '';
        document.querySelector("textarea").value = '';
    }
}
const inputFile = document.querySelector("input[type='file']");
inputFile.setAttribute("onchange", "cargarFiles(this.files)");

var noticias = new Noticias();

function cargarFiles(files) {
    noticias.readInputFile(files);
}

function agregarNoticiaManualmente() {
    noticias.agregarNoticiaManualmente();
}