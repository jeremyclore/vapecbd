# VapeCBD minimal site

Минимальная структура:

```text
app.py
requirements.txt
templates/
  index.html
  privacy.html
  terms.html
img/
  catalog.jpg
  01_mango_05.jpg
  ...
```

Локальный запуск:

```bash
pip install -r requirements.txt
python app.py
```

Заказы пока сохраняются в `orders.txt`. Почта-заглушка: `mail@mail`.
