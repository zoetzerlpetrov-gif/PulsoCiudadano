# PulsoCiudadano // MX &middot; US

Panel de indicadores publicos oficiales que reflejan el comportamiento economico de la poblacion (consumo, empleo, confianza del consumidor) en Mexico y Estados Unidos.

Sitio en vivo: https://zoetzerlpetrov-gif.github.io/PulsoCiudadano/

## Que mide y que NO mide

Este panel NO tiene acceso a datos en tiempo real sobre cierres de tiendas, inseguridad, cobro de piso o migracion de consumo hacia mercados informales, porque no existe ninguna fuente publica abierta que reporte eso de forma confiable y actualizada. En su lugar, usa INDICADORES MACRO OFICIALES como proxy razonable del comportamiento economico ciudadano:

- Tasa de desempleo (Mexico y EE.UU.)
- Crecimiento del comercio al menudeo / ventas al menudeo reales
- Confianza del consumidor
- Inflacion al consumidor (CPI), como referencia de contexto

Todos los datos provienen de FRED (Federal Reserve Bank of St. Louis), que a su vez agrega series oficiales de BLS, Census, Universidad de Michigan, OCDE e INEGI/Banxico. No se inventa ni se estima ningun dato: si una serie no tiene informacion reciente, el panel lo muestra con su fecha real (por ejemplo, algunas series de Mexico via OCDE se actualizan con meses de rezago).

## Arquitectura

- `index.html`: panel estatico (sin dependencias de backend), lee `data/snapshot.json` y `data/senales.json`.
- `scripts/update.mjs`: script Node que descarga las series desde FRED (CSV publico, sin necesidad de API key) y genera `data/snapshot.json`.
- `.github/workflows/update.yml`: workflow de GitHub Actions que ejecuta el script cada 6 horas (y tambien se puede ejecutar manualmente desde la pestana Actions) y commitea el resultado.
- `data/senales.json`: lista de "senales cualitativas" curadas MANUALMENTE (no hay scraping automatico de noticias). Formato de cada entrada:

```json
{
  "date": "2026-07-29",
  "country": "MX",
  "category": "Turismo",
  "title": "Descripcion breve y verificable del hecho",
  "source": "https://enlace-a-la-fuente-original"
}
```

Para agregar una senal, edita `data/senales.json` y agrega un objeto con ese formato al arreglo. Se recomienda usar solo fuentes verificables (noticias con enlace, reportes oficiales, etc.).

## Posibles mejoras futuras

- Agregar series directas de INEGI o Banxico (requieren un token gratuito que el usuario debe generar en su portal y guardar como "secret" del repositorio).
- Agregar datos de turismo (DataTur) y ocupacion hotelera.
- Agregar mas paises de la region.
