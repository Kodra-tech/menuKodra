#!/bin/bash
# Bloquea commits si TypeScript o lint fallan
npx tsc --noEmit || exit 2
npx eslint . --ext .ts,.tsx --quiet || exit 2
echo "✅ Todo limpio"
exit 0