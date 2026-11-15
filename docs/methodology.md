# ZeroFlame Methodology

## Scope

The catalog covers 24 combustion studies in NASA Physical Sciences Informatics (PSI). Attributes summarize research records, primarily their *Objectives* and *Approach* sections. The catalog is organized by study. The SAFFIRE-I beta separately identifies published results, procedural settings, and supplied telemetry extracts.

## Exploring the catalog

- **Group** organizes records by study type, project family, fuel or material, conditions, measurements, objectives, and platform. A record can belong to multiple groups.
- **Find Similar Studies** ranks other records by documentary similarity to a reference study.
- **Compare** displays up to three studies side by side and exports the comparison and sources as CSV.
- **Application Areas**, **Library**, and **Glossary** provide access to fire-safety topics, the study records, and terms used in the catalog.

## Documentary similarity

The app compares sets of tags with the Jaccard index, `J(A,B) = |A ∩ B| / |A ∪ B|`.

| Dimension | Weight |
| --- | ---: |
| Study type | 0.16 |
| Project family | 0.07 |
| Fuel or material | 0.26 |
| Conditions | 0.18 |
| Measurements | 0.17 |
| Objectives | 0.16 |

Vocabulary overlap in the objectives contributes another weight of **0.12**. The app calculates vocabulary overlap from the original Spanish objective text so the English translations do not change scores. Each compared pair must share at least two comparable tag dimensions. Dimensions missing from either record are excluded from the denominator. The app shows the number of comparable dimensions and reports the available weighted overlap as a rounded percentage. The default mode uses explicit links. The exploratory option also includes inferred links.

The score describes similarities among tags and wording in the records. Using it to compare physical test conditions would require the individual test data.

## Data quality

- A quantity marked “not specified” or “not reported” may still have been measured.
- Two records may mention oxygen, pressure, or flow while using different values, units, or conditions.
- The study type distinguishes experimental measurements from simulations and reanalysis.
- Retain the units and traceable source for each numerical value.
- The similarity threshold is exploratory and has no validated scientific cutoff.

[NASA Physical Sciences Informatics combustion records](https://psi.nasa.gov/physci/repo/search?q=combustion&data_source=psi&data_type=investigation)

## Tag evidence

English study records are stored in `data/investigaciones.en.json`. The evidence record in `data/evidencia.en.json` identifies the study, field, evidence level, origin, source section, and reason for each supported tag. The original catalog records remain available in the repository.

| Level | Meaning |
| --- | --- |
| Explicit link | A study objective, method, result, or catalog field states a connection to the category. “Project catalog” identifies a link based on the available study summary. |
| Inferred link | A documented interpretation connects the source material to the category. |

Omit the tag when evidence is insufficient or ambiguous. Record supported links with `status: "explicito"` or `status: "inferido"`. To add evidence, locate the PSI ID and exact section, read the full context, and distinguish objectives, proposed conditions, procedural settings, observed data, and calculated outputs. Use `source: "psi"` for the PSI source record and `source: "base"` for the catalog. In a technical record, include units, data type, and a URL when citing a separate publication.

For example, SAFFIRE-I states fire growth and flammability as objectives. Its thermal and gas readings support an inferred link to detection. SAME-R explicitly studies smoke particles and relates them to detector response. The FLEX limiting oxygen index procedure describes how test pressures were selected.
