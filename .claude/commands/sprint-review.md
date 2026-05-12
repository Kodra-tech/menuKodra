---
name: sprint-review
argument-hint: [número de sprint]
---

Genera el reporte del Sprint $ARGUMENTS:

1. Lee tasks/todo.md y cuenta items completados vs pendientes
2. Lee tasks/lessons.md para listar aprendizajes del sprint
3. Corre `npm run build` para verificar que el proyecto compila
4. Lista las features entregadas con una línea de descripción cada una
5. Lista los items que quedaron pendientes y por qué
6. Propón los 3 objetivos más importantes para el siguiente sprint
7. Escribe el reporte en tasks/sprint-$ARGUMENTS-review.md