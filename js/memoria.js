class Memoria {
    
    elements = {
        "RedBull1": {
            "element": "RedBull",
            "source": "multimedia/imagenes/RedBull_logo.svg"
        },
        "RedBull2": {
            "element": "RedBull",
            "source": "multimedia/imagenes/RedBull_logo.svg"
        },
        "McLaren1": {
            "element": "McLaren",
            "source": "multimedia/imagenes/McLaren_logo.svg"
        },
        "McLaren2": {
            "element": "McLaren",
            "source": "multimedia/imagenes/McLaren_logo.svg"
        },
        "Alpine1": {
            "element": "Alpine",
            "source": "multimedia/imagenes/Alpine_logo.svg"
        },
        "Alpine2": {
            "element": "Alpine",
            "source": "multimedia/imagenes/Alpine_logo.svg"
        },
        "AstonMartin1": {
            "element": "AstonMartin",
            "source": "multimedia/imagenes/AstonMartin_logo.svg"
        },
        "AstonMartin2": {
            "element": "AstonMartin",
            "source": "multimedia/imagenes/AstonMartin_logo.svg"
        },
        "Ferrari1": {
            "element": "Ferrari",
            "source": "multimedia/imagenes/Ferrari_logo.svg"
        },
        "Ferrari2": {
            "element": "Ferrari",
            "source": "multimedia/imagenes/Ferrari_logo.svg"
        },
        "Mercedes1": {
            "element": "Mercedes",
            "source": "multimedia/imagenes/Mercedes_logo.svg"
        },
        "Mercedes2": {
            "element": "Mercedes",
            "source": "multimedia/imagenes/Mercedes_logo.svg"
        }
    };

    constructor() {
        this.hasFlippedCard = false;
        this.lockBoard = false;
        this.firstCard = null;
        this.secondCard = null;

        this.shuffleElements();
        this.createElements();
        this.addEventListeners();
    }

    shuffleElements(){
        const elementsArray = Object.entries(this.elements);
        for (let i = elementsArray.length - 1; i > 0; i--) { 
            const j = Math.floor(Math.random() * (i + 1));
            [elementsArray[i], elementsArray[j]] = [elementsArray[j], elementsArray[i]];
        }
        this.elements = Object.fromEntries(elementsArray);
    }

    unflipCards(){
        this.lockBoard = true;
        setTimeout(() => {
            if (this.firstCard) this.firstCard.removeAttribute('data-state');
            if (this.secondCard) this.secondCard.removeAttribute('data-state');
            this.resetBoard();
          }, 1500);
    }

    resetBoard() {
        this.firstCard = null;
        this.secondCard = null;
        this.hasFlippedCard = false;
        this.lockBoard = false;
    }

    checkForMatch() {
        this.firstCard.dataset.element == this.secondCard.dataset.element ? this.disableCards() : this.unflipCards();
    }

    disableCards() {
        this.lockBoard = true;
        setTimeout(() => {
            this.firstCard.setAttribute('data-state', 'revealed');
            this.secondCard.setAttribute('data-state', 'revealed');
            this.resetBoard();
        }, 500);
    }


    createElements(){
        const container = document.querySelector('section');
        const elementsArray = Object.entries(this.elements);
        for(let i = 0; i < elementsArray.length; i++) {
            const key = elementsArray[i][0];
            const data = elementsArray[i][1];
            
            const article = document.createElement('article');
            article.setAttribute('data-element', data.element);
            article.setAttribute('data-state', null);
            
            const heading = document.createElement('h3');
            heading.textContent = "Tarjeta de memoria";
            article.appendChild(heading);
            
            const image = document.createElement('img');
            image.src = data.source;
            image.alt = data.element;
            article.appendChild(image);

            container.appendChild(article)
        }
    }

    addEventListeners(){
        const cards = document.querySelectorAll('article');
        cards.forEach(card => {
            card.addEventListener('click', (event) => {
                this.flipCard(event.currentTarget, this);
            });
        });
    }

    flipCard(card, game){    
        if (card.dataset.state == 'revealed' || game.lockBoard || game.firstCard == card ){
            return;
        }

        card.setAttribute('data-state', 'flip');

        if (!game.hasFlippedCard) {

            game.hasFlippedCard = true;
            game.firstCard = card;

        } else {

            game.secondCard = card;
            game.checkForMatch();
        }
    }
}

var memoria = new Memoria();
