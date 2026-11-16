let myTable;        
let maxLength = 0;  //per scala dei cerchi
let minTemp = 0;    //per scala del colore
let maxTemp = 0;
let coloreFreddo;
let coloreCaldo;    //colori del gradiente 

let continenti = ["Africa", "Asia", "Europe", "North America", "South America", "Oceania"]

let coloreSfondo = 30;
let coloreTesto = 230;
let coloreAsta = 170;

let idSopra = null; //id fiume con il mouse sopra 

async function setup() {
    createCanvas(windowWidth, 1550); //la finestra scorre 
    textFont("Helvetica Neue");

    coloreFreddo = color(60, 120, 220);
    coloreCaldo = color(230, 70, 40);

    //csv //"await" dice di aspettare he ci sia il file prima di andare avanti  
    myTable = await loadTable("assets/fiumi.csv", ",", "header");

    //controllo
    console.log(myTable.columns);
    console.log(myTable.getRowCount());

    //scorro le righe fino al valore max e min
    for (let i = 0; i < myTable.getRowCount(); i++) {
        let lunghezza = myTable.getNum(i, "length");
        let temp = myTable.getNum(i, "avg_temp");

        if (lunghezza > maxLength) maxLength = lunghezza;
        if (temp < minTemp) minTemp = temp;
        if (temp > maxTemp) maxTemp = temp;
    }

    console.log("lunghezza massima:", maxLength);
    console.log("temperatura min e max:", minTemp, maxTemp);
}

function draw() {
    background(coloreSfondo);
    idSopra = null;
    disegnaLegenda();
    let nomeSopra = "";
    let disegnati = 0;

    let cell = 80;
    let y = 330;

    for (let c = 0; c < continenti.length; c++) {
        //titolo continente con linea sotto
        noStroke();
        fill(coloreTesto);
        textSize(16);
        text(continenti[c], 40, y);
        stroke(70);
        line(40, y + 10, width - 40, y + 10);

        y = y + 55;        //scende sotto al titolo
        let x = 40 + cell / 2;  //ricomincia dal bordo sinistro 

        for (let i = 0; i < myTable.getRowCount(); i++) {

            //disegna solo se il fiume appartiene al continente di questo giro 
            if (myTable.getString(i, "continent") == continenti[c]) {
                disegnati = disegnati + 1;

                //se non c'è più spazio, va a capo prima di disegnare 
                if (x > width - 40 - cell / 2) {
                    x = 40 + cell / 2;
                    y = y + cell;
                }
                //raggio
                let r = map(myTable.getNum(i, "length"), 0, maxLength, 4, 30);

                //colore temp media 
                let t = map(myTable.getNum(i, "avg_temp"), minTemp, maxTemp, 0, 1);
                let colore = lerpColor(coloreFreddo, coloreCaldo, t);

                //lunghezza asta tributari //tetto max a 50, "true" blocca il valore 
                let asta = map(myTable.getNum(i, "tributaries"), 0, 50, 0, 15, true);

                let sopra = dist(mouseX, mouseY, x, y) < r;

                //asta
                strokeWeight(1);
                stroke(coloreAsta);
                line(x, y + r, x, y + r + asta);

                //se il mouse è sopra -> contorno bianco + testo
                if (sopra) {
                    stroke(255);
                    strokeWeight(2);
                    nomeSopra = myTable.getString(i, "name") + " - " + myTable.getNum(i, "length") + " km";
                    idSopra = myTable.getString(i, "id");
                } else {
                    noStroke()
                }

                //cerchio
                fill(colore);
                ellipse(x, y, r * 2);
                strokeWeight(1);

                //sposto x a destra per prossimo glifo 
                x = x + cell;
            }
        }
        y = y + 100; //spazio prima del prossimo continente
    } 
    if (frameCount == 1) console.log("glifi disegnati:", disegnati);

    if (nomeSopra != "") {
        textSize(12);
        let larghezza = textWidth(nomeSopra) + 16;
        fill(0, 220);
        stroke(120);
        rect(mouseX + 12, mouseY - 18, larghezza, 24, 4);
        noStroke();
        fill(coloreTesto);
        text(nomeSopra, mouseX + 20, mouseY - 2);
    }

    //manina qaundo si può cliccare 
    if (idSopra != null) {
        cursor(HAND)
    } else {
        cursor(ARROW)
    }
}

function mousePressed() {
    if (idSopra != null) {
        window.location.href = "detail.html?id=" + idSopra;
    }
}

//legenda 
function disegnaLegenda() {
    noStroke();
    fill(coloreTesto);

    //titolo + sottotitolo
    textSize(32);
    textStyle(BOLD);
    text("Fiumi del mondo", 40, 65);
    textStyle(NORMAL);
    fill(160);
    textSize(18);
    text("Ogni glifo rappresenta un fiume. Passa il mouse su un cerchio per leggerne il nome, clicca per il dettaglio.", 40, 105);

    //dimensione cerchio -> lunghezza fiume 
    fill(coloreTesto);
    textSize(12);
    text("Dimensione = lunghezza del fiume", 40, 160);
    fill(150);

    ellipse(60, 210, map(500, 0,maxLength, 4, 30) * 2);
    ellipse(120, 210, map(3000, 0, maxLength, 4, 30) * 2);
    ellipse(190, 210, map(6650, 0, maxLength, 4, 30) * 2);
    fill(coloreTesto);
    textSize(11);
    text("500 km", 42, 265);
    text("3000 km", 98, 265);
    text("6650 km", 168, 265);

    //colore -> temp media 
    textSize(12);
    text("Colore = temperatura media", 315, 160);

    for( let j = 0; j < 100; j++) {
        let t = map(j, 0, 100, 0, 1);
        fill(lerpColor(coloreFreddo, coloreCaldo, t));
        rect(315 + j, 205, 1, 15);
    }
    fill(coloreTesto);
    textSize(11);
    text(minTemp + " °C", 315, 265);
    text(maxTemp + " °C", 385, 265);

    //asta -> tributari 
    textSize(12);
    text("Asta verticale = numero dei tributari", 520, 160);
    fill(159);
    ellipse(540, 210, 16);
    ellipse(600, 210, 16);
    ellipse(660, 210, 16);
    stroke(coloreAsta);
    line(600, 215, 600, 215 + 7.5);
    line(660, 215, 660, 215 + 15);
    noStroke();
    fill(coloreTesto);
    textSize(11);
    text("0", 537, 265);
    text("25", 592, 265);
    text("50 o più", 640, 265);

    //posizione -> continente 
    textSize(12);
    text("Posizione = continente", 820, 160);
    textSize(11);
    text("I fiumi sono raggruppati sotto il nome del continente.", 820, 210);
}