import { writeFile, mkdir } from 'node:fs/promises';

const BANXICO_TOKEN = process.env.BANXICO_TOKEN || '';
const INEGI_TOKEN = process.env.INEGI_TOKEN || '';

const SERIES = {
MX: {
unemployment: { source: 'FRED', id: 'LRHUTTTTMXM156S', label: 'Tasa de desempleo', unit: '%', sourceLabel: 'FRED (OCDE) - LRHUTTTTMXM156S' },
retail_trade_growth: { source: 'FRED', id: 'MEXPRMNTO01GPSAM', label: 'Crecimiento del comercio al menudeo', unit: '% var. mensual', sourceLabel: 'FRED (OCDE/INEGI) - MEXPRMNTO01GPSAM' },
consumer_confidence: { source: 'FRED', id: 'CSCICP03MXM665S', label: 'Confianza del consumidor', unit: 'indice OCDE', sourceLabel: 'FRED (OCDE) - CSCICP03MXM665S' },
cpi: { source: 'FRED', id: 'MEXCPIALLMINMEI', label: 'Inflacion al consumidor (CPI)', unit: 'indice', sourceLabel: 'FRED (OCDE/INEGI) - MEXCPIALLMINMEI' },
remittances: { source: 'BANXICO', id: 'SE27803', label: 'Remesas familiares totales', unit: 'millones de USD', sourceLabel: 'Banxico (SIE) - SE27803' },
informal_employment: { source: 'INEGI', id: '6200093709', label: 'Poblacion ocupada en el sector informal', unit: 'personas, 15 anos y mas', sourceLabel: 'INEGI (ENOE) - 6200093709' }
},
MX_SECTORS: {
grocery: { source: 'INEGI', id: '720066', label: 'Abarrotes y alimentos', unit: 'indice (2013=100)', sourceLabel: 'INEGI (EMEC) - 720066' },
self_service: { source: 'INEGI', id: '720069', label: 'Tiendas de autoservicio', unit: 'indice (2013=100)', sourceLabel: 'INEGI (EMEC) - 720069' },
department_stores: { source: 'INEGI', id: '720070', label: 'Tiendas departamentales', unit: 'indice (2013=100)', sourceLabel: 'INEGI (EMEC) - 720070' },
clothing: { source: 'INEGI', id: '720073', label: 'Ropa, bisuteria y accesorios', unit: 'indice (2013=100)', sourceLabel: 'INEGI (EMEC) - 720073' },
furniture: { source: 'INEGI', id: '720083', label: 'Muebles para el hogar', unit: 'indice (2013=100)', sourceLabel: 'INEGI (EMEC) - 720083' },
fuel: { source: 'INEGI', id: '720093', label: 'Combustibles, aceites y lubricantes', unit: 'indice (2013=100)', sourceLabel: 'INEGI (EMEC) - 720093' }
},
US: {
unemployment: { source: 'FRED', id: 'UNRATE', label: 'Tasa de desempleo', unit: '%', sourceLabel: 'FRED (BLS) - UNRATE' },
retail_sales_real: { source: 'FRED', id: 'RRSFS', label: 'Ventas al menudeo reales', unit: 'millones USD (2017=100)', sourceLabel: 'FRED (Census/BEA) - RRSFS' },
consumer_sentiment: { source: 'FRED', id: 'UMCSENT', label: 'Confianza del consumidor', unit: 'indice (1966=100)', sourceLabel: 'FRED (Univ. Michigan) - UMCSENT' },
cpi: { source: 'FRED', id: 'CPIAUCSL', label: 'Inflacion al consumidor (CPI)', unit: 'indice (1982-84=100)', sourceLabel: 'FRED (BLS) - CPIAUCSL' },
savings_rate: { source: 'FRED', id: 'PSAVERT', label: 'Tasa de ahorro personal', unit: '%', sourceLabel: 'FRED (BEA) - PSAVERT' },
debt_service_ratio: { source: 'FRED', id: 'TDSP', label: 'Servicio de deuda de los hogares', unit: '% del ingreso disponible', sourceLabel: 'FRED (Fed) - TDSP' },
credit_delinquency: { source: 'FRED', id: 'DRCCLACBS', label: 'Morosidad en tarjetas de credito', unit: '%', sourceLabel: 'FRED (Fed) - DRCCLACBS' },
business_applications: { source: 'FRED', id: 'BABATOTALSAUS', label: 'Nuevas solicitudes de negocio', unit: 'solicitudes', sourceLabel: 'FRED (Census/BFS) - BABATOTALSAUS' }
},
US_SECTORS: {
grocery: { source: 'FRED', id: 'MRTSSM4451USS', label: 'Supermercados y tiendas de abarrotes', unit: 'millones USD', sourceLabel: 'FRED (Census) - MRTSSM4451USS' },
restaurants: { source: 'FRED', id: 'MRTSSM722USS', label: 'Restaurantes y bares', unit: 'millones USD', sourceLabel: 'FRED (Census) - MRTSSM722USS' },
general_merchandise: { source: 'FRED', id: 'MRTSSM452USS', label: 'Tiendas departamentales', unit: 'millones USD', sourceLabel: 'FRED (Census) - MRTSSM452USS' },
ecommerce: { source: 'FRED', id: 'MRTSSM454USS', label: 'Comercio electronico (nonstore)', unit: 'millones USD', sourceLabel: 'FRED (Census) - MRTSSM454USS' },
clothing: { source: 'FRED', id: 'MRTSSM448USS', label: 'Tiendas de ropa', unit: 'millones USD', sourceLabel: 'FRED (Census) - MRTSSM448USS' },
ecommerce_share: { source: 'FRED', id: 'ECOMPCTSA', label: '% comercio electronico del total', unit: '% del total de ventas al menudeo', sourceLabel: 'FRED (Census) - ECOMPCTSA' }
},
EU: {
unemployment: { source: 'EUROSTAT', dataset: 'une_rt_m', params: { geo: 'EU27_2020', s_adj: 'SA', age: 'TOTAL', sex: 'T', unit: 'PC_ACT' }, label: 'Tasa de desempleo', unit: '%', sourceLabel: 'Eurostat - une_rt_m' },
retail_trade_change: { source: 'EUROSTAT', dataset: 'sts_trtu_m', params: { geo: 'EU27_2020', nace_r2: 'G47', indic_bt: 'VOL_SLS', s_adj: 'SCA', unit: 'PCH_PRE' }, label: 'Variacion mensual de ventas al menudeo', unit: '% var. mensual', sourceLabel: 'Eurostat - sts_trtu_m' },
consumer_confidence: { source: 'EUROSTAT', dataset: 'ei_bsco_m', params: { geo: 'EU27_2020', indic: 'BS-CSMCI', s_adj: 'SA' }, label: 'Confianza del consumidor', unit: 'balance (pp)', sourceLabel: 'Eurostat - ei_bsco_m (BS-CSMCI)' },
major_purchases_intent: { source: 'EUROSTAT', dataset: 'ei_bsco_m', params: { geo: 'EU27_2020', indic: 'BS-MP-NY', s_adj: 'SA' }, label: 'Intencion de grandes compras (12m)', unit: 'balance (pp)', sourceLabel: 'Eurostat - ei_bsco_m (BS-MP-NY)' },
savings_intent: { source: 'EUROSTAT', dataset: 'ei_bsco_m', params: { geo: 'EU27_2020', indic: 'BS-SV-NY', s_adj: 'SA' }, label: 'Intencion de ahorro (12m)', unit: 'balance (pp)', sourceLabel: 'Eurostat - ei_bsco_m (BS-SV-NY)' }
},
EU_SECTORS: {
food: { source: 'EUROSTAT', dataset: 'sts_trtu_m', params: { geo: 'EU27_2020', nace_r2: 'G4711', indic_bt: 'VOL_SLS', s_adj: 'SCA', unit: 'PCH_PRE' }, label: 'Alimentos, bebidas y tabaco', unit: '% var. mensual', sourceLabel: 'Eurostat - sts_trtu_m (G4711)' },
fuel: { source: 'EUROSTAT', dataset: 'sts_trtu_m', params: { geo: 'EU27_2020', nace_r2: 'G473', indic_bt: 'VOL_SLS', s_adj: 'SCA', unit: 'PCH_PRE' }, label: 'Combustible para automotores', unit: '% var. mensual', sourceLabel: 'Eurostat - sts_trtu_m (G473)' },
household_equipment: { source: 'EUROSTAT', dataset: 'sts_trtu_m', params: { geo: 'EU27_2020', nace_r2: 'G475', indic_bt: 'VOL_SLS', s_adj: 'SCA', unit: 'PCH_PRE' }, label: 'Equipo para el hogar', unit: '% var. mensual', sourceLabel: 'Eurostat - sts_trtu_m (G475)' },
ict: { source: 'EUROSTAT', dataset: 'sts_trtu_m', params: { geo: 'EU27_2020', nace_r2: 'G474', indic_bt: 'VOL_SLS', s_adj: 'SCA', unit: 'PCH_PRE' }, label: 'Equipo de informacion y comunicacion', unit: '% var. mensual', sourceLabel: 'Eurostat - sts_trtu_m (G474)' },
other_goods: { source: 'EUROSTAT', dataset: 'sts_trtu_m', params: { geo: 'EU27_2020', nace_r2: 'G477', indic_bt: 'VOL_SLS', s_adj: 'SCA', unit: 'PCH_PRE' }, label: 'Otros bienes (ropa, calzado, farmacia)', unit: '% var. mensual', sourceLabel: 'Eurostat - sts_trtu_m (G477)' },
culture_recreation: { source: 'EUROSTAT', dataset: 'sts_trtu_m', params: { geo: 'EU27_2020', nace_r2: 'G476', indic_bt: 'VOL_SLS', s_adj: 'SCA', unit: 'PCH_PRE' }, label: 'Bienes culturales y de recreacion', unit: '% var. mensual', sourceLabel: 'Eurostat - sts_trtu_m (G476)' }
}
};

const NEWS_QUERIES = [
{ key: 'mx_cierres', country: 'Mexico', query: '(cierre OR quiebra) (tienda OR negocio OR comercio) sourcecountry:MX', label: 'Menciones de cierre de negocios (MX)' },
{ key: 'us_closures', country: 'Estados Unidos', query: '"store closures" OR "retail closures" sourcecountry:US', label: 'Menciones de cierre de tiendas (US)' }
];

function sleep(ms){ return new Promise(function(resolve){ setTimeout(resolve, ms); }); }

function fetchWithTimeout(url, ms, headers){
const controller = new AbortController();
const timer = setTimeout(function(){ controller.abort(); }, ms);
return fetch(url, {
signal: controller.signal,
headers: Object.assign({
'User-Agent': 'Mozilla/5.0 (compatible; PulsoCiudadanoBot/1.0; +https://github.com/zoetzerlpetrov-gif/PulsoCiudadano)',
'Accept': '*/*'
}, headers || {})
}).finally(function(){ clearTimeout(timer); });
}

async function fetchFred(id){
const url = 'https://fred.stlouisfed.org/graph/fredgraph.csv?id=' + id;
const res = await fetchWithTimeout(url, 20000);
if(!res.ok) throw new Error('HTTP ' + res.status + ' para ' + id);
const text = await res.text();
const lines = text.trim().split(String.fromCharCode(10)).slice(1);
const points = lines.map(function(line){
const parts = line.split(',');
const value = parseFloat(parts[1]);
return { date: parts[0], value: Number.isFinite(value) ? value : null };
}).filter(function(p){ return p.value !== null; });
return points.slice(-36);
}

async function fetchEurostat(datasetId, params){
const qs = new URLSearchParams(Object.assign({ format: 'JSON', lang: 'en' }, params));
const url = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/' + datasetId + '?' + qs.toString();
const res = await fetchWithTimeout(url, 20000);
if(!res.ok) throw new Error('HTTP ' + res.status + ' para ' + datasetId);
const json = await res.json();
const timeCat = json.dimension.time.category.index;
const times = Object.keys(timeCat).sort(function(a,b){ return timeCat[a]-timeCat[b]; });
const values = json.value || {};
const entries = Object.keys(values).map(function(k){ return [Number(k), values[k]]; }).sort(function(a,b){ return a[0]-b[0]; });
const points = entries.map(function(e){
const idx = e[0];
const period = times[idx];
const date = /^\d{4}-\d{2}$/.test(period) ? period + '-01' : period;
return { date: date, value: e[1] };
}).filter(function(p){ return p.value !== null && p.value !== undefined; });
return points.slice(-36);
}

async function fetchBanxico(seriesId){
if(!BANXICO_TOKEN) throw new Error('Falta BANXICO_TOKEN');
const url = 'https://www.banxico.org.mx/SieAPIRest/service/v1/series/' + seriesId + '/datos';
const res = await fetchWithTimeout(url, 20000, { 'Bmx-Token': BANXICO_TOKEN, 'Accept': 'application/json' });
if(!res.ok) throw new Error('HTTP ' + res.status + ' para ' + seriesId);
const json = await res.json();
const datos = (json.bmx && json.bmx.series && json.bmx.series[0] && json.bmx.series[0].datos) || [];
const points = datos.map(function(d){
const parts = d.fecha.split('/');
const date = parts[2] + '-' + parts[1] + '-' + parts[0];
const value = parseFloat(String(d.dato).replace(/,/g, ''));
return { date: date, value: Number.isFinite(value) ? value : null };
}).filter(function(p){ return p.value !== null; });
return points.slice(-36);
}

async function fetchInegi(indicatorId){
if(!INEGI_TOKEN) throw new Error('Falta INEGI_TOKEN');
const url = 'https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/INDICATOR/' + indicatorId + '/es/0/false/BISE/2.0/' + INEGI_TOKEN + '?type=json';
const res = await fetchWithTimeout(url, 20000, { 'Accept': 'application/json' });
if(!res.ok) throw new Error('HTTP ' + res.status + ' para ' + indicatorId);
const json = await res.json();
const serie = json.Series && json.Series[0];
const obs = (serie && serie.OBSERVATIONS) || [];
const nacional = obs.filter(function(o){ return o.COBER_GEO === '0'; });
const points = nacional.map(function(o){
const period = o.TIME_PERIOD.replace('/', '-') + '-01';
const value = parseFloat(o.OBS_VALUE);
return { date: period, value: Number.isFinite(value) ? value : null };
}).filter(function(p){ return p.value !== null; }).sort(function(a,b){ return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
return points.slice(-36);
}

async function fetchOne(meta){
if(meta.source === 'FRED') return fetchFred(meta.id);
if(meta.source === 'EUROSTAT') return fetchEurostat(meta.dataset, meta.params);
if(meta.source === 'BANXICO') return fetchBanxico(meta.id);
if(meta.source === 'INEGI') return fetchInegi(meta.id);
throw new Error('Fuente desconocida: ' + meta.source);
}

async function fetchNewsSignals(){
const out = [];
for(const q of NEWS_QUERIES){
try{
const url = 'https://api.gdeltproject.org/api/v2/doc/doc?query=' + encodeURIComponent(q.query) + '&mode=timelinevol&format=json&timespan=3months';
const res = await fetchWithTimeout(url, 20000);
const text = await res.text();
let volume = null;
try{
const json = JSON.parse(text);
const series = json.timeline && json.timeline[0] && json.timeline[0].data;
if(series && series.length){
volume = series.slice(-12).map(function(d){ return { date: d.date, value: (d.value != null ? d.value : d.norm) }; });
}
}catch(parseErr){ /* respuesta no-JSON (aviso de limite u otro) */ }
out.push({ key: q.key, country: q.country, label: q.label, points: volume || [], available: !!volume });
console.log('GDELT ' + q.key + ': ' + (volume ? volume.length + ' puntos' : 'sin datos disponibles'));
}catch(err){
out.push({ key: q.key, country: q.country, label: q.label, points: [], available: false, error: String((err && err.message) || err) });
console.log('GDELT ' + q.key + ' ERROR: ' + String((err && err.message) || err));
}
await sleep(6000);
}
return out;
}

async function main(){
const out = { generated_at: new Date().toISOString(), series: {}, news_signals: [] };
const groups = Object.keys(SERIES);
for(const group of groups){
out.series[group] = {};
const indicators = SERIES[group];
const keys = Object.keys(indicators);
for(const key of keys){
const meta = indicators[key];
console.log('Obteniendo ' + group + '/' + key + ' (' + meta.source + ':' + (meta.id || meta.dataset) + ')...');
try{
const points = await fetchOne(meta);
console.log(' OK: ' + points.length + ' puntos, ultimo ' + (points[points.length-1] && points[points.length-1].date));
out.series[group][key] = { label: meta.label, unit: meta.unit, source: meta.sourceLabel, points: points };
}catch(err){
console.log(' ERROR: ' + String((err && err.message) || err));
out.series[group][key] = { label: meta.label, unit: meta.unit, source: meta.sourceLabel, points: [], error: String((err && err.message) || err) };
}
}
}
try{
out.news_signals = await fetchNewsSignals();
}catch(err){
console.log('Bloque de GDELT fallo por completo: ' + String((err && err.message) || err));
out.news_signals = [];
}
await mkdir('data', { recursive: true });
await writeFile('data/snapshot.json', JSON.stringify(out, null, 2));
console.log('data/snapshot.json actualizado correctamente');
}

main().catch(function(err){ console.error(err); process.exit(1); });
