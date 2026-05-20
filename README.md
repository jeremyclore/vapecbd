# VapeCBD Website

Flask сайт-магазин с каталогом, корзиной, оформлением заказа, страницей оплаты и юридическими страницами.

## Структура картинок
Положите изображения товаров в `static/img/`:

- 01_mango_05.jpg
- 02_strawberry_05.jpg
- 03_kiwi_05.jpg
- 04_apple_05.jpg
- 05_blueberry_05.jpg
- 06_watermelon_05.jpg
- 07_mango_1.jpg
- 08_strawberry_1.jpg
- 09_kiwi_1.jpg
- 10_apple_1.jpg
- 11_blueberry_1.jpg
- 12_watermelon_1.jpg
- catalog.jpg

## Запуск локально
```bash
pip install -r requirements.txt
python app.py
```

## Email
Пока получатель заказов стоит `mail@mail`. Для реальной отправки заполните SMTP-переменные в `.env`.
Если SMTP не настроен, заказ сохранится в папку `orders/`.
