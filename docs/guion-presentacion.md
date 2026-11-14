# Guion para presentar Flame Atlas

**Duración recomendada:** 5 minutos de exposición + 2 minutos de demostración.  
**Materiales:** Presentacion_Flame_Atlas.pptx y flame_atlas_agrupaciones.html, abiertos por separado.  
**Versión:** 14 de noviembre de 2026.

## 1. Presentación inicial (diapositiva 1)

> ¿Qué ocurre cuando tenemos muchas investigaciones científicas, pero queremos descubrir cuáles se parecen y en qué se diferencian? Nuestro equipo desarrolló Flame Atlas, una herramienta para explorar y comparar información de investigaciones de combustión espacial del repositorio Physical Sciences Informatics, conocido como PSI, de la NASA. En esta primera versión trabajamos con 24 investigaciones.

## 2. Problema (diapositiva 2)

> Las fichas del repositorio contienen objetivos, descripciones de materiales, condiciones de prueba y tipos de mediciones, pero no siempre es sencillo relacionar información de diferentes estudios. Para encontrar investigaciones que compartan un combustible o una condición, habría que revisar muchas fichas. Además, es importante no confundir semejanza temática con igualdad de condiciones experimentales.

## 3. Cómo se construye la herramienta (diapositiva 3)

> Primero organizamos la información documental de Objectives y Approach en seis campos: objetivos, combustibles y geometrías, condiciones, factores modificados, aspectos comunes y sensores o mediciones. Después usamos etiquetas para identificar características compartidas. Finalmente, Flame Atlas presenta tres herramientas: agrupar, encontrar similares y comparar. Por ahora, los datos describen las investigaciones generales; no representan todas las observaciones de sus ensayos individuales.

## 4. Agrupar por similitud (diapositivas 4 y 5)

> La primera función permite elegir por qué criterio queremos formar grupos: modalidad experimental, tipo de combustible, condiciones mencionadas, mediciones, objetivos científicos, familia y plataforma. Por modalidad, nuestra base reúne 19 investigaciones experimentales, cuatro de simulación o reanálisis y una mixta. También podemos buscar palabras concretas y filtrar. Como una investigación puede abordar varios combustibles o mediciones, puede pertenecer a más de un grupo. Por ejemplo, 17 fichas mencionan microgravedad y 17 mencionan oxígeno, aunque eso no significa que sus ensayos hayan usado los mismos valores.

## 5. Buscar investigaciones similares (diapositivas 6 y 7)

> La segunda función permite elegir una investigación de referencia y obtener un ordenamiento de otras investigaciones según su afinidad documental. El índice considera modalidad, familia, materiales, condiciones, mediciones y objetivos. También compara términos presentes en sus descripciones. Es un cálculo basado en coincidencias ponderadas, no una probabilidad ni una medición científica. Como ejemplo, podemos partir de SAFFIRE-I y explorar SAFFIRE-II y III: pertenecen a una misma línea de estudio, pero no son idénticos.

## 6. Comparación directa (diapositiva 8)

> La tercera función permite elegir hasta tres investigaciones y verlas en columnas. Si tomamos SAFFIRE-I, SAFFIRE-II y SAFFIRE-III, encontramos diferencias: SAFFIRE-I reporta tejido SIBAL y una velocidad de aire de 20 centímetros por segundo; SAFFIRE-II considera varios materiales y velocidades de 20 o 30 centímetros por segundo según el caso; y SAFFIRE-III describe tejido SIBAL y 30 centímetros por segundo. Las tres fichas mencionan cámaras, termopares y radiómetros. Además, es posible exportar la tabla de comparación a CSV.

## 7. Validez y limitaciones (diapositiva 9)

> Somos conscientes de que una herramienta científica debe distinguir lo que se conoce de lo que todavía no está verificado. Nuestra primera extracción procede de las secciones generales Objectives y Approach. Por eso, que aparezca una variable como oxígeno no significa que conozcamos su valor en cada prueba. Tampoco podemos interpretar el porcentaje de afinidad como prueba de equivalencia experimental. Las fichas originales pueden consultarse desde la aplicación.

## 8. Cierre (diapositiva 10)

> Nuestro objetivo es que Flame Atlas no solo permita encontrar información, sino también formular nuevas preguntas: ¿qué estudios comparten métodos o mediciones?, ¿dónde hay diferencias interesantes?, ¿qué investigaciones convendría revisar juntas? La próxima etapa es integrar datos de ensayos, normalizar unidades y construir visualizaciones de resultados experimentales respaldados por fuentes. Muchas gracias.

---

## Demostración en vivo: recorrido exacto (2 minutos)

1. Abrir `flame_atlas_agrupaciones.html` en el navegador. No usar la URL original del sitio para esta demostración: la vista de agrupaciones se preparó como prototipo independiente.
2. Entrar en **Agrupar**. Mostrar el criterio **Modalidad**: 19 experimentales, 4 simulación/reanálisis, 1 mixta. Elegir después **Condiciones mencionadas** y buscar `oxígeno` para mostrar el filtrado.
3. Entrar en **Encontrar similares**. Seleccionar **PSI-98 / SAFFIRE-I** y mostrar cómo cambia la lista según la afinidad mínima. Leer las coincidencias que explican el resultado.
4. Volver a **Agrupar** y seleccionar **PSI-98**, **PSI-99** y **PSI-100** (o usar el buscador por código PSI); pulsar **Comparar investigaciones**.
5. Destacar tres diferencias visibles en la tabla: material, velocidad de aire y mediciones. Terminar mostrando **Exportar CSV**.

## Preguntas que podrían hacer

**¿La aplicación utiliza inteligencia artificial?**  
No para el índice actual. El porcentaje se calcula con reglas explícitas de coincidencia de etiquetas y vocabulario, usando pesos y normalización. Es un algoritmo descriptivo y explicable, no un modelo entrenado.

**¿Cómo se calcula el porcentaje?**  
Se calcula la coincidencia entre etiquetas con la razón intersección/unión, ponderando combustibles (26), condiciones (18), mediciones (17), modalidad (16), objetivos (16) y familia (7). El texto de objetivos agrega una comparación de palabras relevantes con peso 12. Se normaliza según las dimensiones disponibles y se redondea a porcentaje. Un 80 % significa un índice documental alto según estas reglas, no que el 80 % de los ensayos sean iguales.

**¿Qué diferencia hay con la búsqueda del repositorio NASA PSI?**  
Flame Atlas añade agrupaciones temáticas y una comparación explícita de atributos de distintas investigaciones para apoyar la exploración. No sustituye el repositorio ni contiene todos sus datos.

**¿Cuáles son las limitaciones?**  
Las etiquetas derivan de las descripciones generales de las fichas; todavía falta incorporar registros individuales de ensayos, valores verificados y detalles de medición. Hay información parcial. No se deben inferir condiciones ausentes.

**¿Qué sigue?**  
Normalizar terminología y unidades, incorporar registros de ensayos reales, construir visualizaciones válidas con datos medidos e integrar estas vistas al sitio principal.

**Fuente general:** NASA Physical Sciences Informatics: https://psi.nasa.gov/physci/repo/