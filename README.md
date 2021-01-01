# app5

## Coole Dinge die man in unserem Code finden kann

### 1. Vuetify
Wir nutzen Vuetify als Component Frameworks, was uns 90% der Arbeit abnimmt.

### 4. Router
Unter Pages findet man unsere Route. Die Strucktur scheint dabei sehr komplex zu sein. Allerdings werden die Routes automatisch ausgelesen und in die Tree strucktur gebracht. s. `rollup-plugins/router`

### 6. Forms
Wir haben einen Formulargenerator geschrieben. Dieser ist im Ordner `src/forms` zu finden.

### 7. Anschrit
Wir haben ein eigenes Anschrits Formular geschrieben, das nach eingabe der PLZ nur noch die entsprechenden Orte zu lässt.

### 8. Report generator
Wir nutzen einen Report generator um Word Dokumente zu generieren.
## Sachen die man hier nicht findet

### 1. Code-Splitting

Man könnte via Code-Splitting einiges an Ladetzeit sparen / verteilen. Dies ist für unsere Zwecke aber nicht nötig. (auch wenn Rollup das sehr gut supported)