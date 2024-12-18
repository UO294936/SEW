class MiApi {
    constructor() {
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.colors = document.querySelectorAll('figure');
        this.startRaceButton = document.querySelectorAll('button')[0];
        this.resetRaceButton = document.querySelectorAll('button')[1];
        this.timerDisplay = document.querySelectorAll('p')[3];
        
        this.selectedColor = 'white';
        this.timeElapsed = 0;
        this.initialCarPosition = { x: 50, y: 200 };
        this.carPosition = { x: 50, y: 200 };
        this.carWidth = 100;
        this.raceStarted = false;
        this.raceEnded = false;
        
        this.encimaDelCanvas = false;
        this.soltadoDentro = false;
        this.activeEvent = ''; 

        this.animationFrame = null;

        this.setup();
    }

    setup() {
        // Configurar drag and drop
        this.setupDragAndDrop();

        this.startRaceButton.addEventListener('click', () => this.startRace());
        this.resetRaceButton.addEventListener('click', () => this.resetRace());

        // Dibujar el coche inicial
        this.drawCar(this.initialCarPosition);
    }

    setupDragAndDrop() {
        this.dragCounter = 0; // Contador para evitar falsos 'dragleave'
        
        // Canvas
        this.canvas.addEventListener('dragenter', (e) => {
            this.dragCounter++;
            this.onDragEnter(e);
        });
    
        this.canvas.addEventListener('dragleave', (e) => {
            this.dragCounter--;
            if (this.dragCounter === 0) {
                this.onDragLeave(e);
            }
        });
    
        this.canvas.addEventListener('dragover', (e) => {
            this.onDragOver(e);
        });
    
        this.canvas.addEventListener('drop', (e) => {
            this.onDrop(e);
        });
        
        // Cuadrados de colores
        this.colors.forEach(colorElement => {

            colorElement.addEventListener('dragstart', (e) => this.onDragStart(e, colorElement));
            colorElement.addEventListener('dragend', (e) => this.onDragEnd(e, colorElement));

            // Pantallas tácticles
            colorElement.addEventListener('touchstart', (e) => this.onTouchStart(e, colorElement));
            colorElement.addEventListener('touchmove', (e) => this.onTouchMove(e));
            colorElement.addEventListener('touchend', (e) => this.onTouchEnd(e));

        });

    }

    onDragOver(event) {
        event.preventDefault(); // Necesario para permitir soltar
        event.dataTransfer.dropEffect = "move"; // Cambia el cursor
        console.log("Arrastrando sobre el canvas");
    }

    onDragEnter(event){
        console.log("Entrando al canvas");
        this.encimaDelCanvas = true;
    }

    onDragLeave(){
        console.log("Saliendo del canvas");
        this.encimaDelCanvas = false;
    }

    onDrop(event) {
        event.preventDefault();

        if (this.raceStarted) return;

        if (this.encimaDelCanvas) {
            console.log("onDrop -> encimaDelCanvas:", this.encimaDelCanvas, ", soltadoDentro: true");
            this.soltadoDentro = true;

            const color = event.dataTransfer.getData('color');
            this.selectedColor = color;
            this.drawCar(this.carPosition);
        } else {
            console.log("onDrop -> encimaDelCanvas:", this.encimaDelCanvas, ", soltadoDentro: false");
            this.soltadoDentro = false;
        }
    }

    onDragStart(event, element) {
        event.dataTransfer.setData('color', getComputedStyle(element).backgroundColor);
        console.log("moviendo el elemento...");
    }

    onDragEnd(event, element) {
        // El evento de soltar el color se controla en onDrop
    }

    onTouchStart(event, element) {
        event.preventDefault();
        console.log("Touch Start");
    
        // Guardar el color del elemento seleccionado
        this.touching = true;
        this.selectedTouchColor = getComputedStyle(element).backgroundColor;
    
        // Guardar la posición inicial del toque
        const touch = event.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
    }
    
    onTouchMove(event) {
        if (!this.touching) return;
    
        const touch = event.touches[0];
        const x = touch.clientX;
        const y = touch.clientY;
    
        console.log(`Touch Move: x=${x}, y=${y}`);
    
        // Simular arrastrar el elemento
        this.currentTouchX = x;
        this.currentTouchY = y;
    
        // Comprobar si está dentro del canvas
        const canvasRect = this.canvas.getBoundingClientRect();
        this.encimaDelCanvas = (
            x >= canvasRect.left &&
            x <= canvasRect.right &&
            y >= canvasRect.top &&
            y <= canvasRect.bottom
        );
    
        if (this.encimaDelCanvas) {
            console.log("Arrastrando dentro del canvas");
        } else {
            console.log("Fuera del canvas");
        }
    }
    
    onTouchEnd(event) {
        if (!this.touching) return;
        console.log("Touch End");
    
        this.touching = false;
    
        // Verificar si se soltó dentro del canvas
        if (this.encimaDelCanvas) {
            console.log("Elemento soltado dentro del canvas");
            this.soltadoDentro = true;
    
            // Usar el color almacenado
            this.selectedColor = this.selectedTouchColor;
            this.drawCar(this.carPosition);
        } else {
            console.log("Elemento soltado fuera del canvas");
            this.soltadoDentro = false;
        }
    }

    drawCar(position) {
        const { x, y } = position;
    
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
        // Fondo
        this.drawBackground();
    
        // Carretera y línea de meta
        this.drawTrack();
    
        // Cuerpo del coche
        this.ctx.fillStyle = this.selectedColor;
        this.ctx.fillRect(x, y, this.carWidth, 30);
    
        // Techo
        this.ctx.fillStyle = 'lightblue';
        this.ctx.fillRect(x + 20, y - 20, 60, 20);
    
        // Luces
        this.ctx.fillStyle = 'yellow';
        this.ctx.fillRect(x + this.carWidth - 10, y + 5, 7, 10);
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(x, y + 5, 5, 10);
    
        // Ruedas
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(x + 20, y + 35, 10, 0, Math.PI * 2);
        this.ctx.arc(x + 80, y + 35, 10, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawBackground() {
        // Fondo degradado
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1e3c72');
        gradient.addColorStop(0.5, '#2a5298');
        gradient.addColorStop(1, '#b0c4de');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawTrack() {
        // Carretera gris
        this.ctx.fillStyle = '#808080';
        this.ctx.fillRect(0, 150, this.canvas.width, 200);
    
        // Marcas blancas en la carretera
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([15, 10]); // Dashed line
        this.ctx.beginPath();
        this.ctx.moveTo(0, 250);
        this.ctx.lineTo(this.canvas.width, 250);
        this.ctx.stroke();
    
        // Línea de meta negra
        this.ctx.setLineDash([]);
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(700, 150, 10, 200);
    
        // Patrón blanco en la línea de meta
        this.ctx.fillStyle = 'white';
        for (let i = 150; i < 350; i += 20) {
            this.ctx.fillRect(700, i, 10, 10);
        }
    }

    startRace() {
        if (this.raceStarted) return;

        this.raceStarted = true;
        this.raceEnded = false;
        this.timeElapsed = 0;
        this.carPosition.x = 50;
    
        this.timerInterval = setInterval(() => this.updateTimer(), 100);
    
        this.canvas.requestPointerLock();

        this.boundMoveCar = this.moveCar.bind(this);
        document.addEventListener('mousedown', this.boundMoveCar);
    }

    updateTimer() {
        if (!this.raceStarted) return;
    
        this.timeElapsed += 0.1;
        this.timerDisplay.textContent = `Tiempo: ${this.timeElapsed.toFixed(1)} segundos`;
    
        // Si el coche llega a la meta, detener el temporizador
        if (this.raceEnded) {
            clearInterval(this.timerInterval);
        }
    }

    moveCar() {
        if (!this.raceStarted) return;

        this.carPosition.x += 10;
        this.drawCar(this.carPosition);

        // Verificar si el coche ha llegado a la meta
        if (this.carPosition.x + this.carWidth >= 705) {
            this.raceEnded = true;
            this.endRace();
        }
    }

    endRace() {
        this.raceStarted = false;
        document.exitPointerLock();
        alert(`¡Has terminado la carrera en ${this.timeElapsed.toFixed(1)} segundos!`);
    }

    resetRace(){
        this.raceStarted = false;
        this.raceEnded = false;
        this.encimaDelCanvas = false;
        this.soltadoDentro = false;

        document.exitPointerLock();

        clearInterval(this.timerInterval);

        document.removeEventListener('mousedown', this.boundMoveCar);

        this.timeElapsed = 0;
        this.timerDisplay.textContent = `Tiempo: ${this.timeElapsed.toFixed(1)} segundos`;

        this.selectedColor = 'white';

        // Copia los contenidos de initialCarPosition sin hacer hacer asignaciones a referencias
        this.carPosition = { ...this.initialCarPosition };

        cancelAnimationFrame(this.animationFrame);

        this.drawCar(this.carPosition);
    }
}
new MiApi();



