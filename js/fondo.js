
class Fondo {

    constructor(nombrePais, nombreCapital, nombreCircuito){
        this.nombrePais = nombrePais;
        this.nombreCapital = nombreCapital;
        this.nombreCircuito = nombreCircuito;
    }

    getImage(){
        var flickrAPI = "https://www.flickr.com/services/rest/?";

        $.getJSON(flickrAPI, 
            {
                method: "flickr.photos.search",
                api_key: "69c886f00748231ed4499a2648e5411f",
                text: "F1 Race",
                per_page: 15,
                page: 1,
                tags: this.nombrePais,
                format: "json",
                nojsoncallback: 1
            })
            .done(function(data) {
                const imgs = data.photos.photo;
                if (imgs.length > 0) {
                    const randomIndex = Math.floor(Math.random() * imgs.length);
                    const img = imgs[randomIndex];

                    // https://live.staticflickr.com/{server-id}/{id}_{secret}_{size-suffix}.jpg
                    const imgUrl = `https://live.staticflickr.com/${img.server}/${img.id}_${img.secret}_b.jpg`;
                    
                    $("main").css({
                        "background-image": `url(${imgUrl})`,
                        "background-size": "cover",
                        "background-position": "center",
                        "background-repeat": "no-repeat",
                        "min-height": "100vh",
                        "margin": 0,
                        "padding": 0
                    });
                }
            }
        );
    }
}

var f = new Fondo("Bahrein", "Manama", "Bahrein Circuit");
f.getImage();
