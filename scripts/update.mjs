import { writeFile, mkdir } from 'node:fs/promises';

const SERIES = {
  MX: {
    unemployment: { id: 'LRHUTTTTMXM156S', label: 'Tasa de desempleo', unit: '%', source: 'FRED (OCDE) - LRHUTTTTMXM156S' },
    retail_trade_growth: { id: 'MEXPRMNTO01GPSAM', label: 'Crecimiento del comercio al menudeo', unit: '% var. mensual', source: 'FRED (OCDE/INEGI) - MEXPRMNTO01GPSAM' },
    consumer_confidence: { id: 'CSCICP03MXM665S', label: 'Confianza del consumidor', unit: 'indice OCDE', source: 'FRED (OCDE) - CSCICP03MXM665S' },
    cpi: { id: 'MEXCPIALLMINMEI', label: 'Inflacion al consumidor (CPI)', unit: 'indice', source: 'FRED (OCDE/INEGI) - MEXCPIALLMINMEI' }
  },
  US: {
    unemployment: { id: 'UNRATE', label: 'Tasa de desempleo', unit: '%', source: 'FRED (BLS) - UNRATE' },
    retail_sales_real: { id: 'RRSFS', label: 'Ventas al menudeo reales', unit: 'millones USD (2017=100)', source: 'FRED (Census/BEA) - RRSFS' },
    consumer_sentiment: { id: 'UMCSENT', label: 'Confianza del consumidor', unit: 'indice (1966=100)', source: 'FRED (Univ. Michigan) - UMCSENT' },
    cpi: { id: 'CPIAUCSL', label: 'Inflacion al consumidor (CPI)', unit: 'indice (1982-84=100)', source: 'FRED (BLS) - CPIAUCSL' }
  }
};

function fetchWithTimeout(url, ms){
  const controller = new AbortController();
  const timer = setTimeout(function(){ controller.abort(); }, ms);
  return fetch(url, {
    signal: controller.signal,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; PulsoCiudadanoBot/1.0; +https://github.com/zoetzerlpetrov-gif/PulsoCiudadano)',
      'Accept': 'text/csv,*/*'
    }
  }).finally(function(){ clearTimeout(timer); });
}

async function fetchSeries(id){
  const url = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=' + id;
  const res = await fetchWithTimeout(url, 20000);
  if(!res.ok) throw new Error('HTTP ' + res.status + ' para ' + id);
  const text = await res.text();
  const lines = text.trim().split(String.fromCharCode(10)).slice(1);
  const points = lines.map(function(line){
    const parts = line.split(',');
    const date = parts[0];
    const value = parseFloat(parts[1]);
    return { date: date, value: Number.isFinite(value) ? value : null };
  }).filter(function(p){ return p.value !== null; });
  return points.slice(-36);
}

async function main(){
  const out = { generated_at: new Date().toISOString(), series: {} };
  const countries = Object.keys(SERIES);
  for(const country of countries){
    out.series[country] = {};
    const indicators = SERIES[country];
    const keys = Object.keys(indicators);
    for(const key of keys){
      const meta = indicators[key];
      console.log('Obteniendo ' + country + '/' + key + ' (' + meta.id + ')...');
      try{
        const points = await fetchSeries(meta.id);
        console.log('  OK: ' + points.length + ' puntos, ultimo ' + (points[points.length-1] && points[points.length-1].date));
        out.series[country][key] = Object.assign({}, meta, { points: points });
      }catch(err){
        console.log('  ERROR: ' + String((err && err.message) || err));
        out.series[country][key] = Object.assign({}, meta, { points: [], error: String((err && err.message) || err) });
      }
    }
  }
  await mkdir('data', { recursive: true });
  await writeFile('data/snapshot.json', JSON.stringify(out, null, 2));
  console.log('data/snapshot.json actualizado correctamente');
}

main().catch(function(err){ console.error(err); process.exit(1); });
