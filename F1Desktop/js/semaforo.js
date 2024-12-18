
class Semaforo{

    levels = [0.2, 0.5, 0.8];
    lights = 4;
    unload_moment = null;
    clic_moment = null;

    constructor(){
        this.difficulty = this.levels[Math.floor(Math.random() * this.levels.length)];
        this.resultMessage = document.createElement('p');
        this.createStructure();
    }

    createStructure(){
        const container = document.querySelector('main');
       
        const title = document.createElement('h2');
        title.textContent = "Juego Semáforo";
        container.appendChild(title);


        for ( let i = 0; i < this.lights; i++ ){
            const light = document.createElement('div');
            container.appendChild(light);
        }

        const botonArranque = document.createElement('button');
        botonArranque.textContent = "Arranque";
        botonArranque.onclick = () => this.initSequence();
        container.appendChild(botonArranque);

        const botonReaccion = document.createElement('button');
        botonReaccion.textContent = "Reacción";
        botonReaccion.onclick = () => this.stopReaction();
        botonReaccion.disabled = true;
        container.appendChild(botonReaccion);
        
        this.resultMessage.innerText = "";
        container.appendChild(this.resultMessage);
    }

    initSequence(){
        this.resultMessage.innerText = "";
        
        const container = document.querySelector('main');
        container.classList.add('load');
        
        const botonArranque = document.querySelector('button:first-of-type');
        botonArranque.disabled = true;

        setTimeout(() => {
            this.unload_moment = new Date();
            this.endSequence();
        }, 2000 + (this.difficulty * 100)); 
    }

    endSequence(){
        const container = document.querySelector('main');
        
        container.classList.add('unload'); 

        const botonReaccion = document.querySelector('button:last-of-type');
        botonReaccion.disabled = false;
    }

    stopReaction(){
        this.clic_moment = new Date();
     
        const tiempoReaccion = this.clic_moment - this.unload_moment;
        const tiempoEnSegundos = (tiempoReaccion / 1000).toFixed(3); 

        this.resultMessage.innerText = `Tu tiempo de reacción es: ${tiempoEnSegundos} segundos.`;
        
        const elementoMain = document.querySelector('main')

        elementoMain.classList.remove('load');
        elementoMain.classList.remove('unload');

        // Botón arranque
        document.querySelector('button:first-of-type').disabled = false;
        // Botón reacción
        document.querySelector('button:last-of-type').disabled = true;

        this.createRecordForm(tiempoEnSegundos);
    }

    createRecordForm(tiempoReaccion){
        const container = $("p").eq(1);

        const form = $("<form></form>").attr({
            action: '#',
            method: 'post',
            name: 'formulario'
        });

        const nameLabel = $("<label></label>").attr("for", "nombre").text("Nombre:");
        const inputName = $("<input>").attr({
            type: "text",
            name: "nombre",
            id: "nombre",
            value: ''
        });

        const surnameLabel = $("<label></label>").attr("for", "apellido").text("Apellidos:");
        const inputSurname = $("<input>").attr({
            type: "text",
            name: "apellido",
            id: "apellido",
            value: ''
        });

        const levelLabel = $("<label></label>").attr("for", "nivel").text("Nivel de dificultad:");
        const inputLevel = $("<input>").attr({
            type: "text",
            name: "nivel",
            id: "nivel",
            value: this.difficulty * 10,
            readonly: ""
        });

        const timeLabel = $("<label></label>").attr("for", "tiempo").text("Tiempo de Reacción:");
        const inputTime = $("<input>").attr({
            type: "text",
            name: "tiempo",
            id: "tiempo",
            value: tiempoReaccion + " segundos",
            readonly: ""
        });

        const inputSubmit = $("<input>").attr({
            type: "submit",
            value: "Enviar"
        });

        form.append(nameLabel, inputName, surnameLabel, inputSurname, levelLabel, inputLevel, timeLabel, inputTime, inputSubmit);

        container.after(form);
    }
}

var semaforo = new Semaforo();
