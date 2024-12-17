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
        this.draggedColor = null;

        this.setup();
    }

    setup() {
        this.setupDragAndDrop();
        this.setupTouchEvents();

        this.startRaceButton.addEventListener('click', () => this.startRace());
        this.resetRaceButton.addEventListener('click', () => this.resetRace());

        this.drawCar(this.initialCarPosition);
    }

    setupDragAndDrop() {
        // Configurar drag and drop estándar
        this.colors.forEach(colorElement => {
            colorElement.setAttribute('draggable', 'true');

            colorElement.addEventListener('dragstart', (e) => this.onDragStart(e, colorElement));
            colorElement.addEventListener('dragend', (e) => this.onDragEnd(e));
        });

        this.canvas.addEventListener('dragover', (e) => this.onDragOver(e));
        this.canvas.addEventListener('drop', (e) => this.onDrop(e));
    }

    setupTouchEvents() {
        // Configurar emulación de drag and drop con touch
        this.colors.forEach(colorElement => {
            colorElement.addEventListener('touchstart', (e) => this.onTouchStart(e, colorElement));
        });

        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));
    }

    // --- DRAG AND DROP (Escritorio) ---
    onDragStart(event, colorElement) {
        this.draggedColor = getComputedStyle(colorElement).backgroundColor;
    }

    onDragOver(event) {
        event.preventDefault(); // Necesario para que funcione el drop
    }

    onDrop(event) {
        event.preventDefault();
        this.selectedColor = this.draggedColor;
        this.drawCar(this.carPosition);
        this.draggedColor = null;
    }

    onDragEnd(event) {
        this.draggedColor = null;
    }

    // --- EMULACIÓN TOUCH (Móviles) ---
    onTouchStart(event, colorElement) {
        event.preventDefault();
        this.draggedColor = getComputedStyle(colorElement).backgroundColor;

        const touch = event.touches[0];
        this.touchPosition = { x: touch.clientX, y: touch.clientY };
    }

    onTouchMove(event) {
        if (!this.draggedColor) return;

        const touch = event.touches[0];
        this.touchPosition = { x: touch.clientX, y: touch.clientY };

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        this.drawTrack();
        this.drawCar(this.carPosition);

        // Dibuja una representación del color arrastrado
        this.ctx.fillStyle = this.draggedColor;
        this.ctx.fillRect(this.touchPosition.x - 50, this.touchPosition.y - 50, 100, 30);
    }

    onTouchEnd(event) {
        const canvasRect = this.canvas.getBoundingClientRect();

        // Verificar si el toque terminó sobre el canvas
        if (
            this.touchPosition.x >= canvasRect.left &&
            this.touchPosition.x <= canvasRect.right &&
            this.touchPosition.y >= canvasRect.top &&
            this.touchPosition.y <= canvasRect.bottom
        ) {
            this.selectedColor = this.draggedColor;
            this.drawCar(this.carPosition);
        }

        this.draggedColor = null;
    }

    // --- DIBUJAR COCHE ---
    drawCar(position) {
        const { x, y } = position;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.drawTrack();

        // Cuerpo del coche
        this.ctx.fillStyle = this.selectedColor;
        this.ctx.fillRect(x, y, this.carWidth, 30);

        // Techo
        this.ctx.fillStyle = 'lightblue';
        this.ctx.fillRect(x + 20, y - 20, 60, 20);

        // Ruedas
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(x + 20, y + 35, 10, 0, Math.PI * 2);
        this.ctx.arc(x + 80, y + 35, 10, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#1e3c72');
        gradient.addColorStop(0.5, '#2a5298');
        gradient.addColorStop(1, '#b0c4de');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawTrack() {
        this.ctx.fillStyle = '#808080';
        this.ctx.fillRect(0, 150, this.canvas.width, 200);
    }

    startRace() {
        if (this.selectedColor === 'white') {
            alert("Por favor, seleccione un color para su coche.");
            return;
        }

        const moveCar = () => {
            if (this.carPosition.x + this.carWidth < this.canvas.width) {
                this.carPosition.x += 5;
                this.drawCar(this.carPosition);
                requestAnimationFrame(moveCar);
            } else {
                alert("¡Carrera finalizada!");
            }
        };

        moveCar();
    }

    resetRace() {
        this.selectedColor = 'white';
        this.carPosition = { ...this.initialCarPosition };
        this.drawCar(this.carPosition);
    }
}

new MiApi();
