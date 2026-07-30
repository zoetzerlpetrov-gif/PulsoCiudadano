# Pulso Ciudadano

Panel de indicadores del comportamiento economico ciudadano en Mexico, Estados Unidos y la Union Europea, basado en fuentes publicas oficiales.

## Que mide (y que NO mide)

Este panel busca ver el comportamiento economico de un pais desde el lado del ciudadano: consumo, empleo, confianza, ahorro, endeudamiento, remesas, informalidad laboral y ventas por sector/giro comercial. No mide directamente cierres de comercios, inseguridad, cobro de piso o migracion de compradores de tiendas a mercados informales, porque no existe ninguna fuente publica abierta que reporte eso en tiempo real. En su lugar, usamos indicadores macro oficiales que funcionan como proxy razonable de esos fenomenos (por ejemplo, si el comercio al menudeo cae y el empleo informal sube, es consistente con un escenario de mayor precariedad economica).

La seccion "Senales de prensa (GDELT)" es un intento experimental de aproximarse a lo anterior usando volumen de cobertura noticiosa global (no scraping de sitios de noticias, sino la API publica del GDELT Project). Puede no devolver datos si el servicio limita las consultas; cuando eso pasa, el panel lo indica explicitamente en vez de mostrar datos falsos o inventados.

## Periodicidad y graficos

Cada indicador tiene una periodicidad propia segun su fuente (mensual o trimestral; se indica explicitamente en cada tarjeta). Los porcentajes de variacion (por ejemplo, en los sectores de la Union Europea) comparan cada periodo contra el periodo inmediato anterior (mes vs. mes anterior), no son variaciones anuales.

Cada tarjeta muestra dos graficos de linea: uno con el historico disponible (hasta 10 anios, segun lo que publique la fuente) y otro con la ventana reciente (los ultimos puntos obtenidos). Ambos usan la misma escala de tiempo relativa a sus propios datos, no son comparables en pixeles entre indicadores.

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
- Servicio de deuda de los hogares (FRED/Reserva Federal) - trimestral
- Morosidad en tarjetas de credito (FRED/Reserva Federal) - trimestral
- Nuevas solicitudes de negocio (FRED/Census, Business Formation Statistics)

### Union Europea (27 paises)
- Tasa de desempleo (Eurostat)
- Variacion mensual de ventas al menudeo (Eurostat) - mes vs. mes anterior
- Confianza del consumidor (Eurostat, indicador BS-CSMCI)
- Intencion de grandes compras a 12 meses (Eurostat, BS-MP-NY)
- Intencion de ahorro a 12 meses (Eurostat, BS-SV-NY)

## Sectores de consumo (por region)

Ademas de los indicadores macro, el panel desglosa las ventas/ingresos por giro comercial en cada region, para comparar visualmente contra los indicadores generales y detectar posibles correlaciones (por ejemplo, si el comercio electronico crece mientras las tiendas departamentales caen, o si el gasto en combustible se contrae en las tres regiones al mismo tiempo).

**Mexico** (INEGI, Encuesta Mensual sobre Empresas Comerciales - EMEC, indice 2013=100, fuente directa): abarrotes y alimentos, tiendas de autoservicio, tiendas departamentales, ropa/bisuteria/accesorios, salud y farmacia, muebles para el hogar, combustibles/aceites/lubricantes.

**Estados Unidos** (FRED/Census, millones de USD, mensual salvo donde se indique): supermercados y tiendas de abarrotes, restaurantes y bares, tiendas departamentales, comercio electronico (nonstore), tiendas de ropa, salud y cuidado personal, y % de comercio electronico sobre el total (trimestral).

**Union Europea** (Eurostat, mismo dataset que ventas al menudeo pero desglosado por codigo NACE, % variacion mensual): alimentos/bebidas/tabaco, combustible para automotores, equipo para el hogar, equipo de informacion y comunicacion, otros bienes (ropa/calzado/farmacia), bienes culturales y de recreacion. Nota: Eurostat no publica un desglose separado de farmacia a nivel EU27 (codigo NACE 47.73 sin datos agregados); ese gasto queda incluido dentro de "otros bienes".

## Arquitectura

- `index.html`: front-end estatico (sin frameworks), lee `data/snapshot.json` y `data/senales.json`.
- `scripts/update.mjs`: script Node que obtiene todas las series (FRED, Eurostat, Banxico, INEGI) y las senales de GDELT, y escribe `data/snapshot.json`. Conserva hasta 10 anios de historico por indicador (limitado por lo que cada fuente realmente publique).
- `.github/workflows/update.yml`: ejecuta el script cada 6 horas via GitHub Actions y commitea el snapshot si cambio. Usa los secrets `BANXICO_TOKEN` e `INEGI_TOKEN` (tokens gratuitos que cada quien genera en su propia cuenta; ver abajo).
- `data/senales.json`: lista curada manualmente de senales cualitativas (no se genera automaticamente). Formato:

```
[
  { "date": "2026-07-01", "country": "Mexico", "category": "Turismo", "title": "Texto de la senal", "source": "https://..." }
]
```

## Tokens gratuitos (Banxico e INEGI)

Ambos tramites los debe hacer cada usuario en su propia cuenta (no se pueden generar por terceros):

- **Banxico (SIE API)**: entrar a https://www.banxico.org.mx/SieAPIRest/service/v1/token, resolver el captcha y el sitio entrega el token al instante. Sin registro de correo.
- **INEGI (Banco de Indicadores)**: entrar a https://www.inegi.org.mx/servicios/api_indicadores.html, seguir el enlace de registro en la seccion del parametro "Token", indicar nombre y correo, y el token llega por correo.

Los tokens se guardan como GitHub Secrets del repositorio (`BANXICO_TOKEN`, `INEGI_TOKEN`), nunca en el codigo fuente.

## Posibles mejoras futuras

- Reemplazar las series de Mexico que llegan con rezago via FRED (confianza del consumidor, CPI) por sus equivalentes directos de INEGI/Banxico.
- Agregar datos de turismo (DataTur/Sectur) para Cancun, Tulum, Playa del Carmen y Sayulita si se encuentra una fuente publica con series de tiempo.
- Ampliar el panel a mas paises de la Union Europea de forma individual (hoy se muestra el agregado EU27).
- Mejorar la confiabilidad de la integracion con GDELT (limites de tasa) o sustituirla por otra fuente de monitoreo de noticias.
- Agregar mas giros comerciales por region (ej. vehiculos, ya identificado en INEGI EMEC pero aun no incluido) para ampliar la comparacion sectorial.
