# Cómo funciona Flame Atlas: clasificación, similitud y comparación

> Esta guía conserva el ejemplo del prototipo inicial. La versión actual usa respaldo directo por defecto y muestra la cobertura de cada comparación. Consulta la [metodología vigente y el flujo de revisión](metodologia.md#revisión-de-etiquetas) para reproducir la versión publicada.

> **Guía para estudiantes, docentes, colaboradores y jurados.** Describe la versión actual de NasaChallenge tal como está implementada en [index.html](../index.html) y con las 24 investigaciones publicadas en [investigaciones.json](../data/investigaciones.json). Fecha de revisión: 14 de noviembre de 2026.

## 1. Idea central: tres operaciones diferentes

Flame Atlas no trata todas las investigaciones como si fueran iguales. Organiza la información **documental** de 24 investigaciones de combustión seleccionadas de [NASA Physical Sciences Informatics (PSI)](https://psi.nasa.gov/physci/repo/) y ofrece tres operaciones:

| Vista | Pregunta que responde | ¿Cómo funciona? |
| --- | --- | --- |
| **Agrupar** | «¿Qué investigaciones mencionan la misma característica?» | Reúne registros que comparten una etiqueta categórica. |
| **Encontrar similares** | «¿Cuáles se parecen más a esta investigación?» | Calcula un índice de similitud entre conjuntos de etiquetas y palabras de los objetivos, y ordena los resultados. |
| **Comparar** | «¿En qué se parecen y diferencian dos o tres investigaciones?» | Coloca sus descripciones y estados de los datos en columnas; permite descargar CSV. |

**Importante:** «Encontrar similares» produce un porcentaje de **afinidad documental estimada**, no un porcentaje de experimentos iguales ni una medición de equivalencia física.

## 2. ¿De dónde salen los datos?

La base se elaboró a partir de fichas de investigación de **NASA PSI**, principalmente las secciones originales **Objectives** (objetivos) y **Approach** (enfoque/metodología). Se extrajeron y resumieron en español elementos como:

- Objetivos científicos.
- Combustibles, muestras, materiales y quemadores.
- Condiciones de prueba descritas.
- Factores que se modifican en la investigación.
- Aspectos comunes del enfoque o montaje.
- Sensores, mediciones y salidas de cálculo.

Cada registro conserva el identificador PSI y un enlace a su ficha original. También se anota el **estado de cada descripción**, por ejemplo, si está parcialmente especificada.

**Alcance actual:** son **24 fichas de investigaciones** a nivel general, no una base completa de todos los ensayos individuales y sus resultados. Algunas descripciones no permiten identificar todos los instrumentos, tamaños, concentraciones o combinaciones de condiciones utilizadas.

## 3. Clasificación: de texto científico a etiquetas

Una descripción científica puede ser extensa y usar distintas expresiones para una misma idea. Para que el sistema pueda organizarla, se preparó una clasificación estructurada mediante **etiquetas normalizadas**.

### 3.1. Dimensiones disponibles

| Dimensión de agrupación | Ejemplos de etiquetas |
| --- | --- |
| **Modalidad** | Investigación experimental; Simulación / reanálisis; Experimentos y simulación. |
| **Familia** | ACME; SAFFIRE; Otras investigaciones. |
| **Combustibles y materiales** | Propano; Metano; Etileno; Gotas de combustible. |
| **Condiciones mencionadas** | Microgravedad; Presión; Oxígeno; Flujo o caudal. |
| **Mediciones o instrumentos mencionados** | Cámaras e imágenes; Temperatura; Radiación; Extinción. |
| **Objetivos científicos** | Llamas frías; Modelación; Hollín y radiación. |
| **Plataforma** | ISS; Trabajo en tierra / simulación. |

Estas son **etiquetas asociadas a las descripciones**, no necesariamente condiciones constantes ni propiedades verificadas de cada ensayo.

### 3.2. Ejemplo real: PSI-159

La investigación **PSI-159 (ACME CFI-G)** presenta en nuestra base estas etiquetas:

- **Modalidad:** Investigación experimental.
- **Familia:** ACME.
- **Combustibles:** Propano, n-butano, n-pentano.
- **Condiciones:** Microgravedad, Presión, Oxígeno, Flujo o caudal, Dilución y mezcla, Temperatura.
- **Mediciones:** Cámaras e imágenes, Temperatura, Radiación, Simulación y cálculos.
- **Objetivos:** Llamas frías, Modelación.
- **Plataforma:** ISS.

Al elegir **Agrupar por combustible**, PSI-159 aparece en varios grupos (Propano, n-butano y n-pentano). Al elegir **Agrupar por condiciones**, puede aparecer tanto en Microgravedad como en Presión, Oxígeno y otras categorías.

**Por eso los grupos no son excluyentes:** una misma investigación puede aparecer en varios grupos. El programa no hace un agrupamiento estadístico automático (clustering); agrupa registros por coincidencia exacta de etiquetas previamente asignadas.

### 3.3. ¿Qué ocurre al pulsar «Agrupar»?

En la aplicación, la función **renderGroups()** realiza estas operaciones:

1. Aplica, si corresponde, el filtro por modalidad y la búsqueda textual.
2. Recorre las investigaciones que cumplen los filtros.
3. Lee las etiquetas de la dimensión seleccionada.
4. Agrega cada investigación a **todos** los grupos de etiquetas que le correspondan.
5. Ordena los grupos por cantidad de investigaciones (de mayor a menor).
6. Muestra las investigaciones de cada grupo y permite seleccionarlas para la comparación.

**Ejemplo ilustrativo:** si un registro tiene las etiquetas **Microgravedad** y **Presión**, se mostrará en ambos grupos. No significa que estos dos factores se hayan mantenido iguales o hayan sido variados de la misma manera en todas las investigaciones del grupo.

En la base actual, la distribución por **modalidad asignada** es: **19 investigaciones experimentales**, **4 de simulación/reanálisis** y **1 que combina experimentos y simulación**. Son recuentos de etiquetas de nuestra base, no una clasificación oficial adicional de NASA.

## 4. Comparación matemática: índice de Jaccard

Para medir cuántas características comparten dos investigaciones usamos el **índice de Jaccard** entre conjuntos de etiquetas.

**Fórmula:**

`J(A,B) = |A ∩ B| / |A ∪ B|`

- **Intersección (A ∩ B):** etiquetas presentes en ambos conjuntos.
- **Unión (A ∪ B):** todas las etiquetas distintas que aparecen en uno u otro conjunto.
- **Resultado:** un número entre 0 y 1; 0 significa que no comparten ninguna etiqueta de esa dimensión y 1 significa que ambos conjuntos de etiquetas coinciden totalmente.

### Ejemplo didáctico

Investigación A: {Microgravedad, Presión, Oxígeno}.

Investigación B: {Microgravedad, Presión, Flujo}.

Comparten 2 etiquetas (Microgravedad y Presión) y la unión contiene 4 distintas.

`J = 2 / 4 = 0,50` → **50 % de coincidencia de etiquetas en esa dimensión**.

Eso **no** demuestra que las presiones, el oxígeno o los ensayos sean equivalentes: solo compara categorías registradas.

### Código utilizado para Jaccard

~~~javascript
function jacc(a, b) {
  if (!a.length || !b.length) return null;

  const sa = new Set(a);
  const sb = new Set(b);

  const comunes = [...sa].filter(t => sb.has(t));
  const union = new Set([...sa, ...sb]);

  return comunes.length / union.size;
}
~~~

**¿Qué hace cada componente?**

- **Set** crea un conjunto sin elementos repetidos.
- **[...sa]** convierte el conjunto en una lista que podemos recorrer.
- **filter()** conserva solo las etiquetas de A que también están en B.
- **has()** comprueba si una etiqueta pertenece al conjunto B.
- **union.size** cuenta cuántas etiquetas distintas aparecen entre A y B.
- Si alguno de los dos arreglos está vacío, la función devuelve **null**: esa dimensión puede omitirse del promedio ponderado.

## 5. Similitud global: combinación ponderada de dimensiones

La aplicación no calcula un único Jaccard para todas las etiquetas mezcladas. Calcula uno para cada dimensión y lo combina mediante una **media ponderada**.

### 5.1. Pesos que utiliza el código

| Dimensión | Peso |
| --- | ---: |
| Modalidad | 0,16 |
| Familia | 0,07 |
| Combustible/material | 0,26 |
| Condiciones | 0,18 |
| Mediciones | 0,17 |
| Objetivos científicos (etiquetas) | 0,16 |
| **Comparación de palabras del texto de objetivos (adicional)** | **0,12** |

Los primeros seis pesos suman **1,00**. El análisis adicional del texto suma **0,12**, de modo que, si las siete dimensiones son utilizables, el denominador es **1,12**.

**Estos pesos fueron elegidos para el prototipo.** No provienen de una validación científica de NASA; representan la importancia relativa que nuestra aplicación asigna a cada categoría. Compartir combustible tiene mayor peso que compartir familia, por ejemplo.

### 5.2. Fórmula del puntaje

`S = 100 × [Σ(wᵢ × Jᵢ) / Σwᵢ]`

El denominador suma **solo los pesos de las dimensiones comparables**. Si a alguna investigación le faltan etiquetas para una dimensión, esta se omite en vez de asignarle automáticamente un cero. Algunas etiquetas genéricas, como «No especificado», se filtran antes del cálculo.

Al final, el programa **redondea el resultado al entero más cercano**.

> **Advertencia:** omitir información faltante evita tratarla como diferencia confirmada, pero puede aumentar el porcentaje por haber menos dimensiones comparadas. Dos investigaciones con poca información no necesariamente son más similares.

### 5.3. Comparación adicional de palabras en objetivos

En el código, **terms()** procesa el resumen del objetivo de cada investigación:

1. Convierte el texto a minúsculas.
2. Quita marcas diacríticas, como las tildes.
3. Recupera palabras de al menos cuatro letras.
4. Excluye una lista de palabras frecuentes o poco discriminantes.
5. Convierte las restantes en un conjunto único.

Después aplica Jaccard a esos conjuntos de palabras y pondera su resultado con **0,12**.

Esto es una **comparación léxica sencilla**: no reconoce necesariamente que dos expresiones diferentes son sinónimas ni utiliza embeddings o un modelo entrenado de inteligencia artificial.

## 6. Ejemplo reproducible de dos investigaciones reales

Comparemos **PSI-159 (ACME CFI-G)** con **PSI-10 (ACME Flame Design)**, usando las etiquetas de nuestro archivo de datos.

### 6.1. Qué comparten y en qué difieren

| Dimensión | PSI-159 | PSI-10 | Coincidencias |
| --- | --- | --- | --- |
| Modalidad | Investigación experimental | Investigación experimental | 1 de 1 |
| Familia | ACME | ACME | 1 de 1 |
| Combustibles | Propano, n-butano, n-pentano | Metano, Etileno | 0 de 5 |
| Condiciones | Microgravedad, Presión, Oxígeno, Flujo o caudal, Dilución y mezcla, Temperatura | Microgravedad, Gravedad terrestre, Presión, Oxígeno, Flujo o caudal, Dilución y mezcla | 5 de 7 |
| Mediciones | Cámaras e imágenes, Temperatura, Radiación, Simulación y cálculos | Cámaras e imágenes, Temperatura, Radiación, Hollín, Extinción | 3 de 6 |
| Objetivos etiquetados | Llamas frías, Modelación | Extinción, Hollín y radiación, Temperatura / calor | 0 de 5 |

Por ejemplo, para **condiciones**, comparten estas **cinco etiquetas**:

**Microgravedad, Presión, Oxígeno, Flujo o caudal y Dilución y mezcla**.

La unión de condiciones contiene siete etiquetas distintas (las cinco comunes, más Temperatura y Gravedad terrestre).

Por tanto: `J_condiciones = 5 / 7 ≈ 0,714286`.

### 6.2. Cálculo completo realizado por el programa

| Dimensión | Jaccard | Peso | Producto |
| --- | ---: | ---: | ---: |
| Modalidad | 1,000000 | 0,16 | 0,160000 |
| Familia | 1,000000 | 0,07 | 0,070000 |
| Combustibles | 0,000000 | 0,26 | 0,000000 |
| Condiciones | 0,714286 | 0,18 | 0,128571 |
| Mediciones | 0,500000 | 0,17 | 0,085000 |
| Objetivos etiquetados | 0,000000 | 0,16 | 0,000000 |
| Palabras de objetivos | 0,000000 | 0,12 | 0,000000 |
| **Total** | | **1,12** | **0,443571** |

`S = 100 × (0,443571 / 1,12) ≈ 39,60 %`

El sistema lo redondea y muestra **40 % de afinidad documental estimada**.

**Interpretación correcta:** estas dos investigaciones comparten modalidad, familia y varias categorías de condiciones y mediciones, aunque no comparten las etiquetas de combustible de nuestra base. **No** significa que el 40 % de sus procedimientos, resultados o pruebas sean iguales.

## 7. ¿Qué hace la vista «Encontrar similares»?

Cuando se elige una investigación de referencia, **renderSimilars()**:

1. La busca por su identificador.
2. Compara esa investigación con las **otras 23**, una por una, usando **similarity()**.
3. Calcula para cada par el porcentaje y guarda las etiquetas comunes.
4. Aplica el **umbral mínimo** de afinidad que haya seleccionado la persona.
5. Ordena los resultados de mayor a menor porcentaje.
6. Muestra las coincidencias documentales y ofrece agregar estudios a la comparación.

El **umbral mínimo** es un filtro de resultados. No cambia las etiquetas ni recalcula los pesos.

Si el resultado marca **40 %**, significa que se obtuvo esa cifra con la fórmula y los datos actuales: no expresa la confianza estadística del cálculo.

## 8. ¿Qué hace la vista «Comparar»?

Esta vista funciona de manera distinta: **no calcula otro porcentaje**. Se seleccionan **dos o tres investigaciones** para mostrar lado a lado los siguientes campos:

- Identificador y modalidad.
- Plataforma declarada.
- Objetivos experimentales.
- Combustibles, muestras y quemadores.
- Condiciones de prueba.
- Factores modificados.
- Aspectos comunes.
- Sensores y mediciones.

También muestra el **estado del dato** y un enlace a la ficha original PSI. El botón de exportación descarga la misma matriz como archivo **CSV** (texto tabular separado por punto y coma, compatible con hojas de cálculo según configuración regional).

La comparación tabular permite interpretar diferencias con mayor contexto del que ofrece una sola puntuación.

## 9. Esquema resumido del funcionamiento

~~~text
Fichas de NASA PSI: Objectives + Approach
                  |
                  v
Extracción y resumen de atributos por investigación
                  |
                  v
Asignación y normalización de etiquetas
                  |
                  v
Base estructurada de 24 investigaciones
                  |
        +---------+----------+
        |         |          |
        v         v          v
     AGRUPAR   SIMILARES   COMPARAR
    Etiquetas    Jaccard   Columnas y
    comunes    ponderado   exportación
~~~

## 10. Limitaciones y decisiones metodológicas

1. **La clasificación actual es previa a la ejecución.** Las etiquetas se prepararon al construir la base; la web no lee ni clasifica automáticamente una nueva ficha NASA.
2. **Coincidencia de etiqueta ≠ igualdad de condición.** Compartir «Presión» no significa haber empleado la misma presión ni haberla manipulado de la misma manera.
3. **No se comparan todavía valores cuantitativos de ensayos individuales.** Concentaciones, velocidades, dimensiones, calibraciones, incertidumbres y respuestas medibles necesitan datos verificados, unidades y contexto.
4. **Los pesos son exploratorios.** Deben justificarse, someterse a pruebas de sensibilidad y eventualmente revisarse con criterios del problema científico.
5. **La falta de información no demuestra ausencia de medición.** Una ficha general puede omitir instrumentos o condiciones que sí aparecen en sus datos detallados.
6. **Las etiquetas pueden requerir revisión.** Su asignación depende de la interpretación del contenido y debe poder rastrearse hasta las fuentes originales.
7. **La semejanza del texto no equivale a semejanza conceptual completa.** La comparación léxica no comprende sinónimos ni fenómenos distintos expresados con palabras parecidas.
8. **No hay validación externa del índice.** No es una probabilidad, correlación de resultados, nivel de confianza ni recomendación científica de NASA.

### Mejoras recomendadas

- Añadir **trazabilidad por etiqueta** (fragmento original, fuente, fecha y validación).
- Separar **similitud temática**, **metodológica** y **cuantitativa** en lugar de usar únicamente un porcentaje combinado.
- Comparar condiciones físicas verificadas con **unidades y tolerancias explícitas**.
- Distinguir los ensayos realizados de simulaciones, planes experimentales y análisis de datos existentes.
- Incorporar pruebas automáticas del cálculo y evaluación de sensibilidad a los pesos.
- Explicar en la interfaz **por qué** dos investigaciones recibieron cierto porcentaje (aporte de cada dimensión).

## 11. Dónde está implementado el código

El prototipo ejecutable se encuentra en [index.html](../index.html). Estas son las funciones principales:

| Función | Responsabilidad |
| --- | --- |
| **renderGroups()** | Agrupar investigaciones según una etiqueta seleccionada. |
| **terms()** | Obtener palabras relevantes de los textos de objetivos. |
| **jacc()** | Calcular la proporción intersección/unión entre conjuntos. |
| **similarity()** | Combinar las similitudes parciales con pesos y calcular el porcentaje. |
| **renderSimilars()** | Comparar con la referencia, filtrar y ordenar resultados. |
| **compareMatrix()** | Preparar los campos de la tabla comparativa. |
| **renderCompare()** | Mostrar la comparación de dos o tres investigaciones. |

Los registros también están publicados en [data/investigaciones.json](../data/investigaciones.json). **Nota técnica de mantenimiento:** la versión actual de `index.html` incluye una copia de los 24 registros directamente en el código JavaScript; **no carga el JSON externo en tiempo de ejecución**. Si se actualizan los datos, hay que sincronizar ambas representaciones para evitar que la aplicación y el archivo JSON muestren versiones diferentes.

## 12. Preguntas frecuentes

**¿Flame Atlas utiliza inteligencia artificial para calcular la similitud?**  
No en esta versión: usa etiquetas previamente definidas, conjuntos, filtrado de palabras e índice de Jaccard con pesos. El resultado es determinista para los mismos datos y pesos.

**¿Un 80 % significa que los experimentos son casi iguales?**  
No. Significa que coinciden mucho según nuestras etiquetas y el método de ponderación; podría haber diferencias físicas esenciales.

**¿Por qué una investigación aparece en varios grupos?**  
Porque contiene varias etiquetas: agrupar por combustible o condición no constituye una partición única del conjunto.

**¿Qué diferencia existe entre clasificar y comparar?**  
Clasificar determina a qué grupos pertenece un registro. Comparar permite examinar dos o tres registros en paralelo. «Encontrar similares» calcula un ranking matemático intermedio.

**¿La NASA determinó los pesos y porcentajes?**  
No. Las fuentes de las investigaciones pertenecen a NASA PSI; la categorización, los pesos y el índice forman parte del diseño del prototipo Flame Atlas.

## 13. Referencias y documentación relacionada

- [NASA Physical Sciences Informatics](https://psi.nasa.gov/physci/repo/)
- [Investigaciones de combustión en PSI](https://psi.nasa.gov/physci/repo/search?q=combustion&data_source=psi&data_type=investigation)
- [Metodología resumida de Flame Atlas](metodologia.md)
- [Guion de presentación](guion-presentacion.md)
- [Base estructurada utilizada por la aplicación](../data/investigaciones.json)

---

**Mensaje clave para una presentación:** *Flame Atlas permite descubrir relaciones entre descripciones científicas de investigaciones de combustión. Sus coincidencias orientan la exploración, pero no sustituyen el análisis físico y experimental de los datos originales.*
