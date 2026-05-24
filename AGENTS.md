# Workflow

- Każdy etap implementacji robimy na feature branchu (`feature/etap-{number}`) odgałęzionym od `dev`
- Po zakończeniu etapu: commit + push na feature branch
- Tworzymy PR z feature branch do `dev`
- PR jest mergowany dopiero po zatwierdzeniu przez użytkownika
- Po mergu do `dev`, `main` jest aktualizowany z `dev` (merge lub PR)
- Nigdy nie pushujemy bezpośrednio do `dev` ani `main`
