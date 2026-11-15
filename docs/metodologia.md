# Metodología de Flame Atlas

## Alcance

El prototipo reúne **24 investigaciones de combustión** del repositorio NASA Physical Sciences Informatics (PSI). Se extrajeron atributos documentales a nivel de investigación, principalmente de los apartados *Objectives* y *Approach*; no se dispone aquí de una matriz de ensayos individuales verificados.

## Vistas de exploración

1. **Agrupar**: clasifica registros mediante etiquetas de modalidad, familia, combustible/material, condiciones, mediciones, objetivos y plataforma. Los grupos no son mutuamente excluyentes.
2. **Encontrar similares**: usa una investigación como referencia y calcula un porcentaje de afinidad estimada para ordenar las demás.
3. **Comparar**: permite revisar hasta tres investigaciones lado a lado y exportar la tabla y sus fuentes a CSV.
4. **Ámbitos, Biblioteca y Glosario**: permiten explorar preguntas de seguridad, consultar las fichas y revisar los conceptos usados en el catálogo.

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

También se incorpora un solapamiento léxico entre los textos de objetivos, con peso **0,12**. Se excluyen algunas etiquetas genéricas de ausencia de información. Cuando una dimensión no cuenta con etiquetas comparables en ambas investigaciones, no participa en el denominador. El resultado es la media ponderada de las coincidencias disponibles, multiplicada por 100 y redondeada. Se requieren al menos dos dimensiones de etiquetas comparables. La vista muestra cuántas contribuyen al cálculo. El modo inicial usa etiquetas de respaldo directo. La opción exploratoria incorpora también los vínculos indirectos y las etiquetas por verificar.

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

## Revisión de etiquetas

El catálogo toma las fichas de `data/investigaciones.json` y añade la revisión editorial de `data/evidencia.json`. Cada etiqueta revisada identifica el estudio, el campo, el nivel, la procedencia, el apartado y la justificación. Un mismo estudio puede pertenecer a varios ámbitos.

| Nivel | Qué significa |
| --- | --- |
| Respaldo directo | Un objetivo, método, resultado o campo de catálogo respalda la asociación. Cuando la fuente dice «Base del proyecto», la evidencia es el resumen disponible. |
| Vínculo indirecto | El texto justifica una conexión temática o metodológica. El vínculo depende de una interpretación del alcance del estudio. |
| Por verificar | Hay una etiqueta heredada o una hipótesis temática cuyo respaldo está pendiente, ausente o es ambiguo en la documentación consultada. |

Para incorporar nueva evidencia, localiza el ID PSI y el apartado preciso, revisa el contexto completo, indica si el contenido es un objetivo, una condición propuesta, un parámetro de procedimiento, un valor observado o una salida calculada, y actualiza la entrada pertinente en `data/evidencia.json`. Usa `source: "psi"` para el apartado de la ficha original consultada y `source: "base"` para un campo del catálogo. En una ficha técnica, registra además unidades, tipo de dato y, para una publicación distinta de PSI, su URL. Abre la ficha en el sitio para comprobar el resultado en Agrupar, Biblioteca y Comparar. Una etiqueta nueva puede añadirse en la revisión sin modificar la base histórica.

Por ejemplo, SAFFIRE-I documenta crecimiento e inflamabilidad en *Objectives*. Sus lecturas térmicas y de gases en *Approach* motivan un vínculo indirecto con detección. SAME-R estudia explícitamente partículas de humo y relaciona esa evidencia con detectores. En FLEX, el intervalo de presión del procedimiento LOI describe cómo se eligieron condiciones y se conserva con ese alcance.
