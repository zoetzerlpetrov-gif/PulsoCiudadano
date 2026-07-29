# Pulso Ciudadano

Panel de indicadores del comportamiento economico ciudadano en Mexico, Estados Unidos y la Union Europea, basado en fuentes publicas oficiales.

## Que mide (y que NO mide)

Este panel busca ver el comportamiento economico de un pais desde el lado del ciudadano: consumo, empleo, confianza, ahorro, endeudamiento, remesas e informalidad laboral. **No mide directamente** cierres de comercios, inseguridad, cobro de piso o migracion de compradores de tiendas a mercados informales, porque no existe ninguna fuente publica abierta que reporte eso en tiempo real. En su lugar, usamos indicadores macro oficiales que funcionan como proxy razonable de esos fenomenos (por ejemplo, si el comercio al menudeo cae y el empleo informal sube, es consistente con un escenario de mayor precariedad economica).

La seccion "Senales de prensa (GDELT)" es un intento experimental de aproximarse a lo anterior usando volumen de cobertura noticiosa global (no scraping de sitios de noticias, sino la API publica del GDELT Project). Puede no devolver datos si el servicio limita las consultas; cuando eso pasa, el panel lo indica explicitamente en vez de mostrar datos falsos o inventados.

## Indicadores incluidos

### Mexico
- Tasa de desempleo (FRED/OCDE)
- Crecimiento del comercio al menudeo (FRED/OCDE-INEGI)
- Confianza del consumidor (FRED/OCDE) - nota: esta serie especifica se actualiza con rezago
- Inflacion al consumidor / CPI (FRED/OCDE-INEGI) - nota: rezago similar
- Remesas familiares totales (Banxico, SIE API) - mensual, fuente directa
- Poblacion ocupada en el sector informal (INEGI, ENOE) - trimestral, fuente directa

### Estados Unidos
- Tasa de desempleo (FRED/BLS)
- Ventas al menudeo reales (FRED/Census-BEA)
- Confianza del consumidor (FRED/Universidad de Michigan)
- Inflacion al consumidor / CPI (FRED/BLS)
- Tasa de ahorro personal (FRED/BEA)
- Servicio de deuda de los hogares (FRED/Reserva Federal)
- Morosidad en tarjetas de credito (FRED/Reserva Federal)
- Nuevas solicitudes de negocio (FRED/Census, Business Formation Statistics)

### Sectores de consumo (Estados Unidos)
Ventas al menudeo por giro comercial (FRED/Census): supermercados y abarrotes, restaurantes y bares, tiendas departamentales, comercio electronico (nonstore), tiendas de ropa, y % de comercio electronico sobre el total. Sirve para comparar visualmente contra los indicadores macro y detectar posibles correlaciones (por ejemplo, crecimiento de comercio electronico vs caida de tiendas departamentales).

### Union Europea (27 paises)
- Tasa de desempleo (Eurostat)
- Variacion mensual de ventas al menudeo (Eurostat)
- Confianza del consumidor (Eurostat, indicador BS-CSMCI)
- Intencion de grandes compras a 12 meses (Eurostat, BS-MP-NY)
- Intencion de ahorro a 12 meses (Eurostat, BS-SV-NY)

## Arquitectura

- `index.html`: front-end estatico (sin frameworks), lee `data/snapshot.json` y `data/senales.json`.
- `scripts/update.mjs`: script Node que obtiene todas las series (FRED, Eurostat, Banxico, INEGI) y las senales de GDELT, y escribe `data/snapshot.json`.
- `.github/workflows/update.yml`: ejecuta el script cada 6 horas via GitHub Actions y commitea el snapshot si cambio. Usa los secrets `BANXICO_TOKEN` e `INEGI_TOKEN` (tokens gratuitos que cada quien genera en su propia cuenta; ver abajo).
- `data/senales.json`: lista curada manualmente de senales cualitativas (no se genera automaticamente). Formato:

```json
[
  { "date": "2026-07-01", "country": "Mexico", "category": "Turismo", "title": "Texto de la senal", "source": "https://..." }
]
```

## Tokens gratuitos (Banxico e INEGI)

Ambos tramites los debe hacer cada usuario en su propia cuenta (no se pueden generar por terceros):

- **Banxico (SIE API):** entrar a `https://www.banxico.org.mx/SieAPIRest/service/v1/token`, resolver el captcha y el sitio entrega el token al instante. Sin registro de correo.
- **INEGI (Banco de Indicadores):** entrar a `https://www.inegi.org.mx/servicios/api_indicadores.html`, seguir el enlace de registro en la seccion del parametro "Token", indicar nombre y correo, y el token llega por correo.

Los tokens se guardan como GitHub Secrets del repositorio (`BANXICO_TOKEN`, `INEGI_TOKEN`), nunca en el codigo fuente.

## Posibles mejoras futuras

- Reemplazar las series de Mexico que llegan con rezago via FRED (confianza del consumidor, CPI) por sus equivalentes directos de INEGI/Banxico.
- Agregar datos de turismo (DataTur/Sectur) para Cancun, Tulum, Playa del Carmen y Sayulita si se encuentra una fuente publica con series de tiempo.
- Ampliar el panel a mas paises de la Union Europea de forma individual (hoy se muestra el agregado EU27).
- Mejorar la confiabilidad de la integracion con GDELT (limites de tasa) o sustituirla por otra fuente de monitoreo de noticias.
