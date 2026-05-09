# sequence.md — Граф последовательности чанков

Это не линейный список, а **граф связей** между чанками.  
Каждый чанк имеет: пререквизиты, продолжение, смежные материалы.

---

## Граф (визуальное представление)

```
s3-intro
    └─leads_to──► s3-w1-lecture
                      ├─leads_to──► s3-w1-practical ──leads_to──► s3-w1-workshop-setup
                      └─leads_to──► s3-w1-workshop ───leads_to──► s3-w1-workshop-setup
```

---

## Узлы графа

### s3-intro
```yaml
id: s3-intro
title: "Вводная встреча: знакомство и рамка программы"
date: 2026-05-02
type: intro
prerequisites: []
leads_to: [s3-w1-lecture]
related: []
```

### s3-w1-lecture
```yaml
id: s3-w1-lecture
title: "AI-native организации: рамка, концепции, 5 уровней трансформации"
date: 2026-05-05
type: lecture
prerequisites: [s3-intro]
leads_to: [s3-w1-practical, s3-w1-workshop]
related: [s3-w1-workshop-setup]
```

### s3-w1-practical
```yaml
id: s3-w1-practical
title: "Практика: формализация задач и контекст-инжиниринг"
date: 2026-05-05
type: practical
prerequisites: [s3-w1-lecture]
leads_to: [s3-w1-workshop-setup]
related: [s3-w1-workshop]
```

### s3-w1-workshop
```yaml
id: s3-w1-workshop
title: "Воркшоп: вайб-кодинг и HTML-дашборды"
date: 2026-05-05
type: workshop
prerequisites: [s3-w1-lecture]
leads_to: [s3-w1-workshop-setup]
related: [s3-w1-practical]
```

### s3-w1-workshop-setup
```yaml
id: s3-w1-workshop-setup
title: "Воркшоп-лекция: контекст-инжиниринг — философская рамка и практика"
date: 2026-05-07
type: workshop
prerequisites: [s3-w1-workshop, s3-w1-practical]
leads_to: []
related: [s3-w1-lecture]
```

---

## Возможные пути прохождения

**Линейный (рекомендуемый):**
s3-intro → s3-w1-lecture → s3-w1-practical → s3-w1-workshop → s3-w1-workshop-setup

**Параллельный (для продвинутых):**
После s3-w1-lecture можно идти в s3-w1-practical и s3-w1-workshop параллельно, они не зависят друг от друга.

**Минимальный путь (только теория):**
s3-intro → s3-w1-lecture → s3-w1-workshop-setup

---

## Как обновлять

При добавлении нового чанка:
1. Добавить узел в этот файл
2. Обновить `leads_to` и `related` у смежных узлов
3. Обновить визуальный граф вверху
4. Обновить `index.md`

### s3-w2-lecture
```yaml
id: s3-w2-lecture
title: "Контекст-инжиниринг: Строим персональную AI-операционную систему"
date: 2026-05-07
type: lecture
prerequisites: [s3-w1-lecture]
leads_to: []
related: []
```
