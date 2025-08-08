# 🏗️ Архитектура улучшений UI

## 📋 Обзор

Данный документ описывает архитектурные решения для улучшения UI системы, основанные на принципах DRY и паттернах из статьи "Design Patterns for Building Reusable Svelte Components".

## 🎯 Цели архитектуры

1. **Компонентная композиция** - создание переиспользуемых компонентов
2. **Единообразие** - стандартизация UI паттернов
3. **Производительность** - оптимизация рендеринга
4. **Доступность** - поддержка a11y стандартов
5. **Типизация** - строгая типизация с TypeScript

## 🧩 Компонентная архитектура

### 1. Базовые компоненты

#### `DataPage.svelte`
Базовый контейнер для страниц с данными, реализующий паттерн **Component Composition**.

```svelte
<DataPage 
  title="Новости школы"
  {loading}
  {error}
  showSearch={true}
  showFilters={true}
  showViewToggle={true}
  showSort={true}
  {filters}
  {sortOptions}
>
  <svelte:fragment slot="actions">
    <!-- Кнопки действий -->
  </svelte:fragment>
  
  <svelte:fragment slot="default">
    <!-- Основной контент -->
  </svelte:fragment>
</DataPage>
```

**Особенности:**
- Слоты для композиции (`actions`, `default`)
- Встроенная поддержка поиска, фильтрации, сортировки
- Переключение видов отображения
- Обработка состояний загрузки и ошибок

#### `SearchFilter.svelte`
Компонент поиска и фильтрации с debounced поиском.

```svelte
<SearchFilter
  placeholder="Поиск..."
  {filters}
  bind:searchTerm
  bind:selectedFilters
  on:search={handleSearch}
  on:filter={handleFilter}
  on:clear={handleClear}
/>
```

**Особенности:**
- Debounced поиск (300ms)
- Поддержка множественных фильтров
- Счетчики элементов в фильтрах
- Очистка всех фильтров

#### `Calendar.svelte`
Календарный компонент с поддержкой событий.

```svelte
<Calendar 
  {events}
  view="month"
  bind:selectedDate
  on:dateSelect={handleDateSelect}
  on:eventClick={handleEventClick}
  on:viewChange={handleViewChange}
>
  <svelte:fragment slot="day" let:date>
    <!-- Кастомное отображение дня -->
  </svelte:fragment>
  
  <svelte:fragment slot="event" let:event>
    <!-- Кастомное отображение события -->
  </svelte:fragment>
</Calendar>
```

**Особенности:**
- Три режима отображения (месяц/неделя/день)
- Слоты для кастомизации
- Поддержка событий
- Навигация по месяцам

### 2. Утилиты

#### `filters.ts`
Утилиты для работы с данными:

```typescript
// Поиск по полям
searchItems<T>(items: T[], searchTerm: string, searchFields: (keyof T)[]): T[]

// Фильтрация
filterItems<T>(items: T[], selectedFilters: string[], filterField: keyof T): T[]

// Сортировка
sortItems<T>(items: T[], sortBy: string, sortOptions: SortOption[]): T[]

// Генерация фильтров
generateFilters<T>(items: T[], field: keyof T, labelField?: keyof T): Filter[]

// Пагинация
paginateItems<T>(items: T[], currentPage: number, itemsPerPage: number): PaginationResult
```

### 3. Типы

#### `ui.ts`
Типы для UI компонентов:

```typescript
interface Filter {
  label: string;
  value: string;
  count?: number;
}

interface CalendarEvent {
  id: string | number;
  title: string;
  date: Date;
  description?: string;
  type?: 'news' | 'schedule' | 'canteen' | 'honor-board';
  color?: string;
}

interface PageState {
  searchTerm: string;
  selectedFilters: string[];
  sortBy: string;
  view: 'grid' | 'list' | 'calendar';
  currentPage: number;
  itemsPerPage: number;
}
```

## 🔄 Паттерны реализации

### 1. Component Composition
Использование слотов для композиции компонентов:

```svelte
<!-- Родительский компонент -->
<DataPage {title}>
  <svelte:fragment slot="actions">
    <button>Добавить</button>
  </svelte:fragment>
  
  <svelte:fragment slot="default">
    <DataGrid {items} />
  </svelte:fragment>
</DataPage>
```

### 2. Two-way Binding
Двусторонняя привязка данных:

```svelte
<SearchFilter 
  bind:searchTerm
  bind:selectedFilters
  on:search={handleSearch}
/>
```

### 3. Slot Overrides
Переопределение содержимого через слоты:

```svelte
<Calendar {events}>
  <svelte:fragment slot="event" let:event>
    <div class="custom-event">
      <strong>{event.title}</strong>
      <span>{event.description}</span>
    </div>
  </svelte:fragment>
</Calendar>
```

### 4. Event Communication
Коммуникация через события:

```typescript
const dispatch = createEventDispatcher<{
  search: string;
  filter: string[];
  sort: string;
  viewChange: 'grid' | 'list' | 'calendar';
  pageChange: number;
  clear: void;
}>();
```

## 📊 Реактивность

### Реактивные цепочки
```typescript
// Поиск
$: filteredItems = searchItems(items, searchTerm, searchFields);

// Фильтрация
$: filteredItems = filterItems(filteredItems, selectedFilters, filterField);

// Сортировка
$: filteredItems = sortItems(filteredItems, sortBy, sortOptions);

// Генерация событий для календаря
$: calendarEvents = filteredItems.map(item => ({
  id: item.id,
  title: item.title,
  date: new Date(item.date),
  type: 'news' as const
}));
```

## 🎨 Стилизация

### CSS-in-JS подход
- Использование CSS переменных для темизации
- Глобальные стили через `:global()`
- Адаптивный дизайн с медиа-запросами
- Анимации и переходы

### Пример стилизации:
```css
.list-item :global(.card) {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 1rem;
}

.list-item :global(.card-image) {
  width: 120px;
  height: 80px;
  flex-shrink: 0;
  margin-right: 1rem;
}
```

## 🔧 Использование

### Пример интеграции в страницу новостей:

```svelte
<script lang="ts">
  import DataPage from '$lib/components/DataPage.svelte';
  import { getNewsFilters, getNewsSortOptions } from '$lib/utils/filters';
  
  let currentView: 'grid' | 'list' | 'calendar' = 'grid';
  let searchTerm = '';
  let selectedFilters: string[] = [];
  let sortBy = '';
  
  // Реактивная фильтрация
  $: filteredNews = searchItems(news, searchTerm, ['titleRu', 'contentRu']);
</script>

<DataPage
  title="Новости школы"
  {loading}
  {error}
  filters={getNewsFilters(news)}
  sortOptions={getNewsSortOptions()}
  on:search={(event) => searchTerm = event.detail}
  on:filter={(event) => selectedFilters = event.detail}
  on:sort={(event) => sortBy = event.detail}
  on:viewChange={(event) => currentView = event.detail}
>
  <svelte:fragment slot="actions">
    <button on:click={openModal}>Добавить новость</button>
  </svelte:fragment>
  
  <svelte:fragment slot="default">
    {#if currentView === 'grid'}
      <div class="grid-container">
        {#each filteredNews as item}
          <DataCard {item} type="news" />
        {/each}
      </div>
    {:else if currentView === 'calendar'}
      <Calendar {events} />
    {/if}
  </svelte:fragment>
</DataPage>
```

## 🚀 Преимущества архитектуры

1. **Переиспользование** - компоненты можно использовать на разных страницах
2. **Консистентность** - единообразный UI/UX
3. **Производительность** - оптимизированные реактивные цепочки
4. **Типобезопасность** - строгая типизация TypeScript
5. **Доступность** - поддержка a11y стандартов
6. **Масштабируемость** - легко добавлять новые функции

## 📈 Планы развития

1. **Пагинация** - добавление компонента пагинации
2. **Экспорт данных** - компоненты для экспорта в CSV/PDF
3. **Drag & Drop** - поддержка перетаскивания элементов
4. **Виртуализация** - для больших списков данных
5. **Оффлайн поддержка** - кэширование и синхронизация
6. **Темы** - поддержка темной/светлой темы
