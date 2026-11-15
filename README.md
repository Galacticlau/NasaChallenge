# NasaChallenge — Flame Atlas

Explorador de 24 investigaciones de combustión del repositorio NASA Physical Sciences Informatics (PSI). Permite agrupar investigaciones por similitud, encontrar estudios afines y comparar características experimentales.

## Ejecución

Abre el [sitio en GitHub Pages](https://galacticlau.github.io/NasaChallenge/). Para probar una copia local, ejecuta `python3 -m http.server 8000` desde la raíz y abre `http://localhost:8000`. La página carga los datos desde el mismo sitio.

## Datos y metodología

Las agrupaciones se basan en descripciones documentales disponibles y no sustituyen la comparación de ensayos originales; la similitud es una medida estimada de coincidencia entre etiquetas, no equivalencia física de experimentos.

## Documentación

- **[Cómo funciona Flame Atlas: clasificación, similitud y comparación](docs/como-funciona-clasificacion-comparacion.md)** — Guía paso a paso con índice de Jaccard, pesos, cálculo real entre PSI-159 y PSI-10, explicación del código y preguntas frecuentes.
- [Metodología y limitaciones](docs/metodologia.md) — Resumen técnico de los criterios y sus límites de interpretación.
- [Guion de presentación](docs/guion-presentacion.md) — Material para presentar y demostrar el proyecto.
- [Revisión de etiquetas y fichas ampliadas](data/evidencia.json) — Justificaciones y fuentes por estudio.
- [Datos de las 24 investigaciones](data/investigaciones.json) — Registros estructurados que utiliza el prototipo.

Proyecto educativo independiente, no oficial de NASA.
