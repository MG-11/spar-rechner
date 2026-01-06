const form = document.getElementById("etfForm");
const ergebnis = document.getElementById("ergebnis");

const startkapitalInput = document.getElementById("startkapital");
const sparrateInput = document.getElementById("sparrate");
const laufzeitInput = document.getElementById("laufzeit");
const zinsInput = document.getElementById("zins");
const inflationInput = document.getElementById("inflation");

let chart = null;
let letzteBerechnung = null;

form.addEventListener("submit", function (e) {
  e.preventDefault();

  let start = Number(startkapitalInput.value);
  let sparrate = Number(sparrateInput.value);
  let jahre = Number(laufzeitInput.value);
  let zins = Number(zinsInput.value) / 100;
  let inflation = Number(inflationInput.value) / 100;

  let monatsZins = Math.pow(1 + zins, 1 / 12) - 1;
  let monatsInflation = inflation / 12;

  let kapital = start;
  let realKapital = start;
  let eingezahlt = start;

  let labels = [];
  let nominal = [];
  let real = [];

  for (let jahr = 1; jahr <= jahre; jahr++) {
    for (let monat = 1; monat <= 12; monat++) {
      kapital += sparrate;
      eingezahlt += sparrate;
      kapital *= (1 + monatsZins);

      realKapital += sparrate;
      realKapital *= (1 + monatsZins - monatsInflation);
    }

    let realwert = kapital / Math.pow(1 + inflation, jahr);

    labels.push("Jahr " + jahr);
    nominal.push(kapital.toFixed(2));
    real.push(realKapital.toFixed(2));
  }

  ergebnis.innerHTML =
    "<p>💰 Endkapital nominal: <strong>" + kapital.toFixed(2) + " €</strong></p>" +
    "<p>📉 Inflationsbereinigt: <strong>" + real[real.length - 1] + " €</strong></p>" +
    "<p>📥 Eingezahlt: " + eingezahlt.toFixed(2) + " €</p>";

  letzteBerechnung = {
    kapital: kapital,
    realwert: real[real.length - 1],
    eingezahlt: eingezahlt
  };

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        { label: "Nominal", data: nominal, borderWidth: 2 },
        { label: "Inflationsbereinigt", data: real, borderWidth: 2 }
      ]
    }
  });
});

/* Presets */
function preset(type) {
  if (type === "anfänger") {
    sparrateInput.value = 150;
    laufzeitInput.value = 15;
  }
  if (type === "durchschnitt") {
    sparrateInput.value = 300;
    laufzeitInput.value = 20;
  }
  if (type === "fire") {
    sparrateInput.value = 800;
    laufzeitInput.value = 20;
  }
}

/* PDF Export */
function exportPDF() {
  if (!letzteBerechnung) {
    alert("Bitte zuerst eine Berechnung durchführen.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  let y = 15;

  pdf.setFontSize(16);
  pdf.text("Tagesgeld-Sparplan – Ergebnisübersicht", 10, y);
  y += 10;

  pdf.setFontSize(11);
  pdf.text("Eingabedaten:", 10, y);
  y += 8;

  pdf.text(`Startkapital: ${startkapitalInput.value} €`, 10, y); y += 6;
  pdf.text(`Monatliche Sparrate: ${sparrateInput.value} €`, 10, y); y += 6;
  pdf.text(`Laufzeit: ${laufzeitInput.value} Jahre`, 10, y); y += 6;
  pdf.text(`Zins: ${zinsInput.value} % p.a.`, 10, y); y += 6;
  pdf.text(`Inflation: ${inflationInput.value} % p.a.`, 10, y); y += 10;

  pdf.text("Ergebnisse:", 10, y);
  y += 8;

  pdf.text(`Endkapital nominal: ${letzteBerechnung.kapital.toFixed(2)} €`, 10, y); y += 6;
  pdf.text(`Inflationsbereinigt: ${letzteBerechnung.realwert} €`, 10, y); y += 6;
  pdf.text(`Eingezahlt: ${letzteBerechnung.eingezahlt.toFixed(2)} €`, 10, y); y += 10;

  // 🔹 Chart als Bild
  const chartCanvas = document.getElementById("chart");
  const chartImage = chartCanvas.toDataURL("image/png", 1.0);

  pdf.addPage();
  pdf.setFontSize(14);
  pdf.text("Vermögensentwicklung", 10, 15);
  pdf.addImage(chartImage, "PNG", 10, 25, 190, 90);

  pdf.save("Tagesgeld-Sparrechner-Ergebnis.pdf");
}




