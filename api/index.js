export default async function handler(req, res) {
  // Povolíme prístup (CORS), ak by si to chcel niekedy volať z prehliadača
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const radarData = req.body;

    // Pridáme "pečať" pre vyučujúceho
    radarData.processed_by_vercel = true;
    radarData.cloud_provider = "Vercel Serverless";
    radarData.timestamp = new Date().toISOString();

    try {
      // Preposielame to na tvoj AWS
      const response = await fetch('http://13.60.201.216:5001/api/sweeps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(radarData)
      });

      if (response.ok) {
        res.status(201).json({ message: "Dáta úspešne prešli cez Vercel do AWS!" });
      } else {
        res.status(500).json({ error: "AWS server vrátil chybu." });
      }
    } catch (error) {
      res.status(500).json({ error: "Chyba komunikácie s AWS: " + error.message });
    }
  } else {
    // Ak to len otvoríš v prehliadači, aby si videl, že to žije
    res.status(200).json({ message: "Radar Proxy beží na Vercel Cloude! Pošli POST požiadavku." });
  }
}