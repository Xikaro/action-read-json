# Action Read JSON

GitHub Action для чтения JSON-файлов и экспорта их значений как output-переменных шага.

## Возможности

- Чтение JSON-файлов и создание output для каждого ключа
- Поддержка вложенных объектов (через `prop_path` и автоматически)
- Поддержка массивов с различными форматами вывода
- Доступ к элементам массивов по индексу (`_0`, `_1`, ...)
- Быстрый доступ к первому элементу массива (`_first`)
- Гибкие форматы массивов: JSON, плоский, YAML

## Входные параметры

| Параметр | Обязательный | Описание | По умолчанию |
|----------|--------------|----------|--------------|
| `file_path` | ✅ | Путь к JSON-файлу | — |
| `prop_path` | ❌ | Путь к свойству (например, `key1.key2`) | — |
| `flat_arrays` | ❌ | Вывод массивов как `"a" "b" "c"` | `false` |
| `yaml_arrays` | ❌ | Вывод массивов как `"a", "b", "c"` | `false` |

## Примеры использования

### Чтение всех свойств JSON

```yaml
- name: Чтение package.json
  id: json_properties
  uses: Xikaro/action-read-json@v1.1.0
  with:
    file_path: "package.json"

- run: |
    echo "Название: ${{ steps.json_properties.outputs.name }}"
    echo "Версия: ${{ steps.json_properties.outputs.version }}"
```

### Чтение вложенного свойства

```yaml
- name: Чтение вложенного свойства
  id: repository_type
  uses: Xikaro/action-read-json@v1.1.0
  with:
    file_path: "package.json"
    prop_path: "repository.type"

- run: |
    echo "Тип репозитория: ${{ steps.repository_type.outputs.value }}"
```

### Работа с массивами

```yaml
- name: Чтение JSON с массивами
  id: pack_info
  uses: Xikaro/action-read-json@v1.1.0
  with:
    file_path: "pack.json"

# Доступ к массивам и их элементам:
# ${{ steps.pack_info.outputs.authors }}           — ["Xikaro","Xikaro2",...]
# ${{ steps.pack_info.outputs.authors_0 }}         — Xikaro
# ${{ steps.pack_info.outputs.authors_first }}     — Xikaro
# ${{ steps.pack_info.outputs.targets_game_versions_first }} — 1.20.1
```

### Плоский формат массивов (через пробел)

```yaml
- name: Чтение с flat_arrays
  id: pack_info
  uses: Xikaro/action-read-json@v1.1.0
  with:
    file_path: "pack.json"
    flat_arrays: true

# Вывод массивов:
# ${{ steps.pack_info.outputs.authors }}           — "Xikaro" "Xikaro2" ...
# ${{ steps.pack_info.outputs.targets_game_versions }} — "1.20.1" "1.12.2"
```

### YAML-формат массивов (через запятую)

```yaml
- name: Чтение с yaml_arrays
  id: pack_info
  uses: Xikaro/action-read-json@v1.1.0
  with:
    file_path: "pack.json"
    yaml_arrays: true

# Вывод массивов:
# ${{ steps.pack_info.outputs.authors }}           — "Xikaro", "Xikaro2", ...
# ${{ steps.pack_info.outputs.targets_game_versions }} — "1.20.1", "1.12.2"

# Удобно для передачи в другие action:
- uses: some/action
  with:
    game-versions: ${{ steps.pack_info.outputs.targets_game_versions }}
```

### Чтение вложенных объектов

Для JSON:
```json
{
  "targets": {
    "game_versions": ["1.20.1", "1.12.2"],
    "loaders": ["iris", "optifine"]
  }
}
```

Доступны следующие output-переменные:
```yaml
# ${{ steps.pack_info.outputs.targets }}                    — весь объект
# ${{ steps.pack_info.outputs.targets_game_versions }}      — ["1.20.1","1.12.2"]
# ${{ steps.pack_info.outputs.targets_game_versions_0 }}    — 1.20.1
# ${{ steps.pack_info.outputs.targets_game_versions_first }} — 1.20.1
# ${{ steps.pack_info.outputs.targets_loaders }}            — ["iris","optifine"]
# ${{ steps.pack_info.outputs.targets_loaders_first }}      — iris
```
