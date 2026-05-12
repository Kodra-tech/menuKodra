---
name: fix-bug
argument-hint: [descripción del bug o número de issue]
---

Corrige el bug: $ARGUMENTS

1. Reproduce el problema leyendo logs o el reporte
2. Localiza los archivos involucrados
3. Implementa el fix mínimo (no toques lo que no está roto)
4. Escribe un test de regresión que falle sin el fix
5. Verifica que `npm run build` y `npm test` pasen
6. Résumen en 3 líneas: qué fallaba, por qué, cómo se corrigió