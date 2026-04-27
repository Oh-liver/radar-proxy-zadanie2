export default async function handler(req, res) {
  // Povolíme prístup (CORS), ak by sa to niekedy volalo z prehliadača
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Rýchla odpoveď pre preflight requesty (bezpečnostná kontrola prehliadačov)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Hlavná logika - keď ESP32 pošle dáta
  if (req.method === 'POST') {
    const radarData = req.body;

    // --- TOTO JE TEN NOVÝ RIADOK PRE DEBUGGovanie ---
    // Vypíše všetko, čo príde do záložky "Logs" na Vercele
    console.log("📡 Prijaté dáta z ESP32:", JSON.stringify(radarData, null, 2));

    // "Pečať" pre vyučujúceho (splnenie podmienky pre Multi-Cloud zadanie)
    radarData.processed_by_vercel = true;
    radarData.cloud_provider = "Vercel Serverless";
    radarData.vercel_timestamp = new Date().toISOString();

    try {
      // Preposielame to na tvoj hlavný AWS server
      const response = await fetch('http://13.60.201.216:5001/api/sweeps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(radarData)
      });

      if (response.ok) {
        // Ak tvoje AWS odpovie, že je všetko OK
        res.status(201).json({ message: "Dáta úspešne prešli cez Vercel do AWS!" });
      } else {
        // Ak tvoje AWS žije, ale odmietlo to (napr. zlý formát do databázy)
        console.error("❌ AWS vrátilo chybu pri ukladaní.");
        res.status(500).json({ error: "AWS server vrátil chybu." });
      }
    } catch (error) {
      // Ak je tvoje AWS úplne vypnuté (alebo spadol Docker)
      console.error("❌ Nepodarilo sa spojiť s AWS:", error.message);
      res.status(500).json({ error: "Chyba komunikácie s AWS: " + error.message });
    }
  } else {
    // Ak si tú adresu (s /api na konci) len otvoríš vo svojom prehliadači (čo je GET)
    res.status(200).json({ message: "Radar Proxy beží na Vercel Cloude! Čakám na POST dáta z ESP32." });
  }
}