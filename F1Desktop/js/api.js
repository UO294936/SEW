class MiApi {
    constructor() {
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.colors = document.querySelectorAll('figure');
        this.car = { x: 0, y: 200, color: 'white' }; // Posición y color del coche
        this.raceStarted = false;

        this.setup();
    }

    setup() {
        this.setupDragAndDrop();
        this.setupTouchSupport();
        this.drawCar();
    }

    // --- DRAG AND DROP ---
    setupDragAndDrop() {
        this.colors.forEach(colorElement => {
            colorElement.setAttribute('draggable', 'true');

            colorElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('color', getComputedStyle(colorElement).backgroundColor);
            });
        });

        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necesario para permitir el drop
        });

        this.canvas.addEventListener('drop', (e) => {
            e.preventDefault();
            const color = e.dataTransfer.getData('color');
            if (color) {
                this.car.color = color;
                this.drawCar();
            }
        });
    }

    // --- SOPORTE TÁCTIL ---
    setupTouchSupport() {
        this.colors.forEach(colorElement => {
            colorElement.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                this.touchColor = getComputedStyle(colorElement).backgroundColor;
                this.touchStart = { x: touch.clientX, y: touch.clientY };
            });
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (!this.touchColor) return;

            const touch = e.touches[0];
            this.touchEnd = { x: touch.clientX, y: touch.clientY };

            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawCar();

            // Dibujar una representación del color mientras se arrastra
            this.ctx.fillStyle = this.touchColor;
            this.ctx.fillRect(this.touchEnd.x - 50, this.touchEnd.y - 50, 100, 30);
        });

        this.canvas.addEventListener('touchend', (e) => {
            if (!this.touchColor) return;

            const canvasRect = this.canvas.getBoundingClientRect();

            if (this.touchEnd.x >= canvasRect.left && this.touchEnd.x <= canvasRect.right &&
                this.touchEnd.y >= canvasRect.top && this.touchEnd.y <= canvasRect.bottom) {
                this.car.color = this.touchColor;
                this.drawCar();
            }

            this.touchColor = null;
        });
    }

    // --- DIBUJAR COCHE ---
    drawCar() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.car.color;
        this.ctx.fillRect(this.car.x, this.car.y, 100, 50);
    }
}

new MiApi();
