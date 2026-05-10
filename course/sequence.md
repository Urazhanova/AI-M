# sequence.md — Граф последовательности чанков

Это не линейный список, а **граф связей** между чанками.
Каждый чанк имеет: пререквизиты, продолжение, смежные материалы.

Источник правды для названий и дат — `course/[chunk-id]/meta.md`. Этот файл следует за `meta.md`, а не наоборот.

---

## Граф (визуальное представление)

```
s3-intro
    └─leads_to──► s3-w1-lecture
                      ├─leads_to──► s3-w1-practical ──leads_to──► s3-w1-workshop-setup
                      └─leads_to──► s3-w1-workshop ───leads_to──► s3-w1-workshop-setup
                                                                       │
                                                                       └─leads_to──► s3-w2-lecture
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
title: "Трансформация бизнеса в AI-native организацию: опыт Устинова"
date: 2026-05-09
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
title: "Контекст и инструменты для AI-native организаций"
date: 2026-05-08
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
leads_to: [s3-w2-lecture]
related: [s3-w1-lecture]
```

### s3-w2-lecture
```yaml
id: s3-w2-lecture
title: "Гостевая лекция: Трансформация в AI-native организацию"
date: 2026-05-09
type: lecture
prerequisites: [s3-w1-workshop-setup]
leads_to: []
related: [s3-w1-lecture]
```

---

## Возможные пути прохождения

**Линейный (рекомендуемый):**
s3-intro → s3-w1-lecture → s3-w1-practical → s3-w1-workshop → s3-w1-workshop-setup → s3-w2-lecture

**Параллельный (для продвинутых):**
После s3-w1-lecture можно идти в s3-w1-practical и s3-w1-workshop параллельно, они не зависят друг от друга.

**Минимальный путь (только теория):**
s3-intro → s3-w1-lecture → s3-w1-workshop-setup → s3-w2-lecture

---

## Как обновлять

Правила см. `docs/lecture-pipeline.md`.

При добавлении нового чанка через пайплайн (`/curator/upload`) узлы добавляются автоматически. Ручные правки только для:
1. Уточнения `leads_to` и `related` (пайплайн ставит пустые массивы)
2. Обновления визуального ASCII-графа в начале файла
3. Приведения yaml-блоков к актуальному `meta.md`, если возникло расхождение
