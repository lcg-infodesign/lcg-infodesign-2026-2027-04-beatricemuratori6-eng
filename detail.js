let tabella;
let idScelto;

let coloreSfondo = 30;
let coloreTesto = 230;
let coloreAccento = "#66A9ED";
let coloreFreddo; 
let coloreCaldo;

//max e min di tutto il dataset per scale fisse 
let maxLength = 0;
let maxArea = 0;
let maxDischarge = 0;
let maxTributaries = 0;
let tMin = 0;      //colonna min_temp
let tMax = 0;      //colonna max_temp
let minAvg = 0;
let maxAvg = 0;    //min e max di avg_temp per il colore 

let sopraIndietro = false;

async function setup() {
    createCanvas(windowWidth, windowHeight);
    textFont("Helvetica Neue");

    coloreFreddo = color(60, 120, 220);
    coloreCaldo = color(230, 70, 40);

    //carica il csv
    tabella = await loadTable("assets/fiumi.csv", ",", "header");
    
    //legge il parametro dell'inidirizzo
    let parametri = getURLParams();
    idScelto= parametri.id;
    console.log("id scelto", idScelto);

    //scorre tutta la tabella per trovare max e min
    for (let i = 0; i < tabella.getRowCount(); i++) {
        if (tabella.getNum(i, "length") > maxLength) maxLength = tabella.getNum(i, "length");
        if (tabella.getNum(i, "area") > maxArea) maxArea = tabella.getNum(i, "area");
        if (tabella.getNum(i, "discharge") > maxDischarge) maxDischarge = tabella.getNum(i, "discharge");
        if (tabella.getNum(i, "tributaries") > maxTributaries) maxTributaries = tabella.getNum(i, "tributaries");
        if (tabella.getNum(i, "min_temp") < tMin) tMin = tabella.getNum(i, "min_temp");
        if (tabella.getNum(i, "max_temp") > tMax) tMax = tabella.getNum(i, "max_temp");
        if (tabella.getNum(i, "avg_temp") < minAvg) minAvg = tabella.getNum(i, "avg_temp");
        if (tabella.getNum(i, "avg_temp") > maxAvg) maxAvg = tabella.getNum(i, "avg_temp");
    }
    console.log(maxLength, maxArea, maxDischarge, maxTributaries, tMin, tMax, minAvg, maxAvg);
}

function draw() {
    background(coloreSfondo);
    noStroke();

    //cerca riga in cui id coincide con quello dell'indirizzo    
    let riga = tabella.findRow(idScelto, "id");

    if (riga) {
        //titolo + sottotitolo
        fill(coloreTesto);
        textStyle(BOLD);
        textSize(32);
        text(riga.getString("name"), 40, 105);
        textStyle(NORMAL);
        fill(coloreAccento);
        textSize(14);
        text(riga.getString("continent") + " - sfocia in " + riga.getString("outflow"), 40, 132);
        fill(170);
        textSize(13);
        text("Paesi attraversati: " + riga.getString("countries"), 40, 154, 700);

        //quattro barre 
        disegnaBarra("Lunghezza", riga.getNum("length"), maxLength, "km", 225, false);
        disegnaBarra("Bacino idrografico", riga.getNum("area"), maxArea, "km²", 300, true);
        disegnaBarra("Portata", riga.getNum("discharge"), maxDischarge, "m³/s", 375, true);
        disegnaBarra("Tributari", riga.getNum("tributaries"), maxTributaries, "", 450, true);

        //temperatura -> segmento dalla min alla max / pallino = media 
        let tmin = riga.getNum("min_temp");
        let tmax = riga.getNum("max_temp");
        let tavg = riga.getNum("avg_temp");
        let xMin = map(tmin, tMin, tMax, 40, 420);
        let xMax = map(tmax, tMin, tMax, 40, 420);
        let xAvg = map(tavg, tMin, tMax, 40, 420);
        let t = map(tavg, minAvg, maxAvg, 0, 1);

        fill(coloreTesto);
        textSize(12);
        text("Temperatura (minima / media / massima)", 40, 517);
        fill(60);
        rect(40, 525, 400, 12, 3);
        fill(lerpColor(coloreFreddo, coloreCaldo, t));
        rect(xMin, 525, max(xMax - xMin, 4), 12, 3);
        fill(255);
        ellipse(xAvg, 531, 8);
        fill(coloreTesto);
        text(tmin + " / " + tavg + " / " + tmax + " °C", 460, 536);

        //come leggere scheda 
        fill(32);
        stroke(65);
        strokeWeight(1);
        rect(40, 585, 560, 115, 6);

        noStroke();
        fill(coloreAccento);
        textStyle(BOLD);
        textSize(11);
        text("COME LEGGERE", 56, 608);

        fill(170);
        textStyle(NORMAL);
        textSize(12);
        text("Barra grigia = valore massimo del dataset, uguale per tutti i fiumi", 56, 628);
        text("Barra colorata = valore di questo fiume", 56, 646);
        text("Bacino, portata e tributari: scala a radice quadrata", 56, 664);
        text("Temperatura: dalla minima alla massima / pallino bianco = media", 56, 682);
    } else {
        //id sbagliato o mancante
        fill(coloreTesto);
        textSize(16);
        text("Fiume non trovato (id: " + idScelto + ")", 40, 80);
    }
    //bottone per tronare a pag overview 
    fill(38);
    stroke(coloreAccento);
    strokeWeight(1);
    rect(40, 14, 210, 24, 6);

    noStroke();
    fill(coloreAccento);
    textStyle(BOLD);
    textSize(12);
    textAlign(CENTER, CENTER);
    text("← Torna a tutti i fiumi", 40 + 97.5, 14 + 12);
    textAlign(LEFT, BASELINE);
    textStyle(NORMAL);

    sopraIndietro= mouseX > 40 && mouseX < 235 && mouseY > 24 && mouseY < 58;
    if (sopraIndietro) {
        cursor(HAND);
    } else {
        cursor(ARROW);
    }
}

function disegnaBarra(etichetta, valore, massimo, unita, y, usaRadice) {
    let larghezzaMax= 400;
    let pieno;

    if (usaRadice) {
    pieno = map(sqrt(valore), 0, sqrt(massimo), 0, larghezzaMax);
    } else {
    pieno = map(valore, 0, massimo, 0, larghezzaMax);
    }

    noStroke();
    fill(coloreTesto);
    textStyle(BOLD);
    textSize(13);
    text(etichetta, 40, y - 8);

    fill(140);
    textStyle(NORMAL);
    textSize(11);
    textAlign(RIGHT);
    text("max dataset: " + massimo.toLocaleString("it-IT"), 40 + larghezzaMax, y -8);
    textAlign(LEFT);

    fill(55);
    rect(40, y, larghezzaMax, 12, 3); //barra grigia -> scala massima 
    fill(coloreAccento);
    rect(40, y, pieno, 12, 3); //valore di questo fiume 

    fill(coloreTesto);
    textStyle(BOLD);
    textSize(14);
    text(valore.toLocaleString("it-IT") + " " + unita , 40 + larghezzaMax + 20, y + 11);
}

function mousePressed() {
    if (sopraIndietro) {
        window.location.href = "index.html";
    }
}