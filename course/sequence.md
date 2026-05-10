# sequence.md — Граф последовательности чанков

Это не линейный список, а **граф связей** между чанками.
Каждый чанк имеет: пререквизиты, продолжение, смежные материалы.

Источник правды для названий, дат и связей — `course/[chunk-id]/meta.md`. Этот файл генерируется из `meta.md` и не должен правиться вручную для смены имён или дат.

---

## Граф (визуальное представление)

> Обновляется вручную после изменений. Скрипт пересплита эту секцию не пересоздаёт.

```
<автогенерация графа не реализована — обновить вручную>
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
leads_to: [s3-w1-lecture-a]
related: []
```

### s3-w1-lecture-a
```yaml
id: s3-w1-lecture-a
title: "Введение в Лабораторию: Структура Курса и Подходы"
date: 2026-05-05
type: lecture
prerequisites: [s3-intro]
leads_to: [s3-w1-lecture-b]
related: []
```

### s3-w1-lecture-b
```yaml
id: s3-w1-lecture-b
title: "Видение Степана: Почему AI-Native Организации и Обзор Курса"
date: 2026-05-05
type: lecture
prerequisites: [s3-w1-lecture-a]
leads_to: []
related: []
```

### s3-w1-lecture-c
```yaml
id: s3-w1-lecture-c
title: "Спикеры Лаборатории, Путь Обучения и Агент AI-Mindsight"
date: 2026-05-05
type: lecture
prerequisites: [s3-w1-lecture-b]
leads_to: []
related: []
```

### s3-w1-lecture-d
```yaml
id: s3-w1-lecture-d
title: "Психологические Ловушки Внедрения ИИ: Дофамин и Кортизол"
date: 2026-05-05
type: lecture
prerequisites: [s3-w1-lecture-c]
leads_to: []
related: []
```

### s3-w1-lecture-e
```yaml
id: s3-w1-lecture-e
title: "Экономика ИИ: Беспрецедентный Рост и Инвестиции"
date: 2026-05-05
type: lecture
prerequisites: [s3-w1-lecture-d]
leads_to: []
related: []
```

### s3-w1-lecture-f
```yaml
id: s3-w1-lecture-f
title: "ИИ-Трансформация Бизнеса: Примеры Компаний и Внутренние Кейсы"
date: 2026-05-05
type: lecture
prerequisites: [s3-w1-lecture-e]
leads_to: []
related: []
```

### s3-w1-lecture-g
```yaml
id: s3-w1-lecture-g
title: "Рыночные Сдвиги: Апокалипсис SaaS и Стратегические ИИ-Партнерства"
date: 2026-05-05
type: lecture
prerequisites: [s3-w1-lecture-f]
leads_to: []
related: []
```

### s3-w1-practical
```yaml
id: s3-w1-practical
title: "Практика: формализация задач и контекст-инжиниринг"
date: 2026-05-05
type: practical
prerequisites: [s3-w1-lecture-g]
leads_to: [s3-w1-workshop-setup]
related: [s3-w1-workshop-c]
```

### s3-w1-workshop-a
```yaml
id: s3-w1-workshop-a
title: "От индивидуальной AI-операционной системы к командной: Сбор контекста и формализация правил"
date: 2026-05-08
type: workshop
prerequisites: [s3-w1-lecture-g]
leads_to: []
related: []
```

### s3-w1-workshop-b
```yaml
id: s3-w1-workshop-b
title: "Развитие AI-нативных скиллов: Исследования, визуализация и создание продуктов"
date: 2026-05-08
type: workshop
prerequisites: [s3-w1-workshop-a]
leads_to: []
related: []
```

### s3-w1-workshop-c
```yaml
id: s3-w1-workshop-c
title: "Внедрение AI-нативных решений в команду: Адаптация, конфиденциальность и стратегические вызовы"
date: 2026-05-08
type: workshop
prerequisites: [s3-w1-workshop-b]
leads_to: []
related: []
```

### s3-w1-workshop-setup
```yaml
id: s3-w1-workshop-setup
title: "Воркшоп-лекция: контекст-инжиниринг — философская рамка и практика"
date: 2026-05-07
type: workshop
prerequisites: [s3-w1-workshop-c, s3-w1-practical]
leads_to: []
related: [s3-w1-lecture-g]
```

### s3-w2-lecture-a
```yaml
id: s3-w2-lecture-a
title: "AI-Native Пивот: От Стратегического Видения к Фундаменту 'Второго Мозга Компании'"
date: 2026-05-09
type: lecture
prerequisites: [s3-w1-workshop-setup]
leads_to: []
related: []
```

### s3-w2-lecture-b
```yaml
id: s3-w2-lecture-b
title: "Продвинутая AI-Интеграция: Агенты в Бизнес-Процессах и AI-Управление"
date: 2026-05-09
type: lecture
prerequisites: [s3-w2-lecture-a]
leads_to: []
related: []
```

---

## Возможные пути прохождения

> Обновляется вручную после изменений в графе.

---

## Как обновлять

Правила см. `docs/lecture-pipeline.md`. yaml-блоки выше регенерируются автоматически из `meta.md` при загрузке/пересплите. Связи (`leads_to`, `related`) задаются в `meta.md` каждого чанка.
