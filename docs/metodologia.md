# Metodología de Flame Atlas

## Alcance

El prototipo reúne **24 investigaciones de combustión** del repositorio NASA Physical Sciences Informatics (PSI). Se extrajeron atributos documentales a nivel de investigación, principalmente de los apartados *Objectives* y *Approach*; no se dispone aquí de una matriz de ensayos individuales verificados.

## Tres vistas

1. **Agrupar**: clasifica registros mediante etiquetas de modalidad, familia, combustible/material, condiciones, mediciones, objetivos y plataforma. Los grupos no son mutuamente excluyentes.
2. **Encontrar similares**: usa una investigación como referencia y calcula un porcentaje de afinidad estimada para ordenar las demás.
3. **Comparar**: permite revisar hasta tres investigaciones lado a lado y exportar la tabla a CSV.

## Índice de afinidad

Para cada par de investigaciones se comparan conjuntos de etiquetas con el índice de Jaccard:

`J(A,B) = |A ∩ B| / |A ∪ B|`

Las dimensiones y pesos de la implementación actual son:

| Dimensión | Peso |
| --- | ---: |
| Modalidad | 0,16 |
| Familia | 0,07 |
| Combustible/material | 0,26 |
| Condiciones | 0,18 |
| Mediciones | 0,17 |
| Objetivos | 0,16 |

También se incorpora un solapamiento léxico entre los textos de objetivos, con peso **0,12**. Se excluyen algunas etiquetas genéricas de ausencia de información. Cuando una dimensión no cuenta con etiquetas comparables en ambas investigaciones, no participa en el denominador. El resultado es la media ponderada de las coincidencias disponibles, multiplicada por 100 y redondeada.

**Precaución:** el índice representa **similitud documental según etiquetas y vocabulario**, no porcentaje de pruebas iguales, equivalencia física, validación estadística ni resultado de un modelo predictivo entrenado.

## Advertencias de calidad de datos

- «No especificado» y «no informado» no significan necesariamente «no medido».
- La aparición de la palabra «oxígeno», «presión» o «flujo» en dos investigaciones no implica que compartan valores, unidades o condiciones.
- Las investigaciones numéricas, reanálisis y experimentos deben distinguirse; un resultado calculado no equivale a la lectura directa de un sensor.
- Los valores numéricos extraídos de los documentos originales deben mantener unidades y procedencia verificable.
- La selección del umbral de similitud es exploratoria; no representa un límite científico validado.

## Fuente

[NASA Physical Sciences Informatics — búsquedas de combustión](https://psi.nasa.gov/physci/repo/search?q=combustion&data_source=psi&data_type=investigation).

Última preparación inicial de la base: noviembre de 2026.
