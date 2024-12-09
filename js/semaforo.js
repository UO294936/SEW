
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
        const section = document.createElement('section');
        
        const title = document.createElement('h2');
        title.textContent = "Juego Semáforo";
        section.appendChild(title);


        for ( let i = 0; i < this.lights; i++ ){
            const light = document.createElement('div');
            section.appendChild(light);
        }

        container.appendChild(section);

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

        console.log("stop");
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
        const container = document.querySelectorAll("p")[1];

        const form = document.createElement("form");
        form.setAttribute("action", '#');
        form.setAttribute("method", 'post');
        form.setAttribute("name", 'formulario');

        const nameLabel = document.createElement("label");
        nameLabel.setAttribute("for", "nombre");
        nameLabel.textContent = "Nombre:";

        const inputName = document.createElement("input");
        inputName.setAttribute("type", "text");
        inputName.setAttribute("name", "nombre");
        inputName.setAttribute("value", '');

        const surnameLabel = document.createElement("label");
        surnameLabel.setAttribute("for", "apellido");
        surnameLabel.textContent = "Apellidos:";

        const inputSurname = document.createElement("input");
        inputSurname.setAttribute("type", "text");
        inputSurname.setAttribute("name", "apellido");
        inputSurname.setAttribute("value", '');
 
        const levelLabel = document.createElement("label");
        levelLabel.setAttribute("for", "nivel");
        levelLabel.textContent = "Nivel de dificultad:";

        const inputLevel = document.createElement("input");
        inputLevel.setAttribute("type", "text");
        inputLevel.setAttribute("name", "nivel");
        inputLevel.setAttribute("value", this.difficulty*10);
        inputLevel.setAttribute("readonly", "true");

        const timeLabel = document.createElement("label");
        timeLabel.setAttribute("for", "tiempo");
        timeLabel.textContent = "Tiempo de Reacción:";

        const inputTime = document.createElement("input");
        inputTime.setAttribute("type", "text");
        inputTime.setAttribute("name", "tiempo");
        inputTime.setAttribute("value", tiempoReaccion + " segundos");
        inputTime.setAttribute("readonly", "true");

        const inputSubmit = document.createElement("input");
        inputSubmit.setAttribute("type", "submit");
        inputSubmit.setAttribute("value", "Enviar")

        form.appendChild(nameLabel);
        form.appendChild(inputName);

        form.appendChild(surnameLabel);
        form.appendChild(inputSurname);

        form.appendChild(levelLabel);
        form.appendChild(inputLevel);

        form.appendChild(timeLabel);
        form.appendChild(inputTime);

        form.appendChild(inputSubmit);

        container.after(form);
    }
}

var semaforo = new Semaforo();
