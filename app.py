from flask import Flask, render_template, request, jsonify
from datetime import datetime

app = Flask(__name__, static_folder="img", static_url_path="/img")

ORDER_EMAIL = "mail@mail"

PRODUCTS = [
    {"id": 1, "name": "Манго", "cbd": "0.5%", "volume": "15 мл", "price": 1190, "image": "01_mango_05.jpg", "tag": "Tropical Gold"},
    {"id": 2, "name": "Клубника", "cbd": "0.5%", "volume": "15 мл", "price": 1250, "image": "02_strawberry_05.jpg", "tag": "Berry Soft"},
    {"id": 3, "name": "Киви", "cbd": "0.5%", "volume": "15 мл", "price": 1170, "image": "03_kiwi_05.jpg", "tag": "Fresh Green"},
    {"id": 4, "name": "Яблоко", "cbd": "0.5%", "volume": "15 мл", "price": 1090, "image": "04_apple_05.jpg", "tag": "Clean Apple"},
    {"id": 5, "name": "Черника", "cbd": "0.5%", "volume": "15 мл", "price": 1350, "image": "05_blueberry_05.jpg", "tag": "Blue Chill"},
    {"id": 6, "name": "Арбуз", "cbd": "0.5%", "volume": "15 мл", "price": 1290, "image": "06_watermelon_05.jpg", "tag": "Juicy Red"},
    {"id": 7, "name": "Манго", "cbd": "1%", "volume": "15 мл", "price": 1790, "image": "07_mango_1.jpg", "tag": "Tropical Strong"},
    {"id": 8, "name": "Клубника", "cbd": "1%", "volume": "15 мл", "price": 1850, "image": "08_strawberry_1.jpg", "tag": "Berry Strong"},
    {"id": 9, "name": "Киви", "cbd": "1%", "volume": "15 мл", "price": 1720, "image": "09_kiwi_1.jpg", "tag": "Green Strong"},
    {"id": 10, "name": "Яблоко", "cbd": "1%", "volume": "15 мл", "price": 1650, "image": "10_apple_1.jpg", "tag": "Apple Strong"},
    {"id": 11, "name": "Черника", "cbd": "1%", "volume": "15 мл", "price": 2150, "image": "11_blueberry_1.jpg", "tag": "Deep Blue"},
    {"id": 12, "name": "Арбуз", "cbd": "1%", "volume": "15 мл", "price": 1950, "image": "12_watermelon_1.jpg", "tag": "Watermelon Strong"},
]

@app.route("/")
def index():
    return render_template("index.html", products=PRODUCTS)

@app.route("/order", methods=["POST"])
def order():
    data = request.get_json(force=True)
    subject = f"Новый заказ VapeCBD — {datetime.now().strftime('%d.%m.%Y %H:%M')}"
    body = (
        "Новый заказ VapeCBD\n\n"
        f"Имя: {data.get('name', '')}\n"
        f"Telegram: {data.get('telegram', '')}\n"
        f"Email: {data.get('email', '')}\n"
        f"Доставка: {data.get('delivery', '')}\n"
        f"Адрес/комментарий: {data.get('address', '')}\n"
        f"Способ оплаты: {data.get('payment', '')}\n\n"
        "Товары:\n"
    )
    total = 0
    for item in data.get("items", []):
        qty = int(item.get("qty", 0))
        price = int(item.get("price", 0))
        total += qty * price
        body += f"- {item.get('name')} CBD {item.get('cbd')} — {qty} шт × {price} ₽\n"
    body += f"\nИтого: {total} ₽\n"
    body += f"\nПочта для заявок: {ORDER_EMAIL}\n"
    with open("orders.txt", "a", encoding="utf-8") as f:
        f.write("=" * 72 + "\n")
        f.write(subject + "\n")
        f.write(body + "\n")
    return jsonify({"ok": True, "message": "Заказ принят. Мы свяжемся с вами для подтверждения оплаты."})

@app.route("/privacy")
def privacy():
    return render_template("privacy.html")

@app.route("/terms")
def terms():
    return render_template("terms.html")

if __name__ == "__main__":
    app.run(debug=True)
