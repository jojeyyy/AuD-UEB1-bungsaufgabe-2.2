# EOP-Counter 🧮
**Annahmen zur Aufwandsschätzung:**
- **Keine Kosten für triviale Operationen:** Arrayzugriffe (z. B. arr[i]), sowie break und return-Anweisungen sind zeitlich nicht dominant und werden mit 0 EOP gewertet. 
- **Caching:** Der Ausdruck n - 2 in der Schleifenbedingung wird gecacht und nur vor dem ersten Schleifendurchlauf ein einziges Mal als 1 arithmetische Operation berechnet.  
- **Inkrement:** Das Inkrement i += 2 wird analog zum Inkrement ++i aus der Vorlesung als einfache Zuweisung betrachtet und kostet 1 EOP. (Sollte Ihr Lehrstuhl hier strenger 1 Arith. + 1 Zuw. = 2 EOP verlangen, erhöhen sich die Kosten unten pro Schleifendurchlauf um 1 EOP).  
- **Operationen:** Wir unterscheiden zwischen Zuweisung, Vergleich und arithmetischer Operation, die jeweils 1 EOP kosten.

> 💡 **Hinweis:** Zum Ausführen einfach entpacken und die `index.html` öffnen.
