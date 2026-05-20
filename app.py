import json
import os
import smtplib
from datetime import datetime
from email.message import EmailMessage
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify, redirect, render_template, request, url_for

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("FLASK_SECRET_KEY", "dev-secret")

ORDER_EMAIL_TO = os.getenv("ORDER_EMAIL_TO", "mail@mail")
ORDERS_DIR = Path(__file__).parent / "orders"
ORDERS_DIR.mkdir(exist_ok=True)

PRODUCTS = [
    {"id": 1, "name": "Манго", "strength": "0.5%", "volume": "15 мл", "price": 1190, "image": "01_mango_05.jpg"},
    {"id": 2, "name": "Клубника", "strength": "0.5%", "volume": "15 мл", "price": 1250, "image": "02_strawberry_05.jpg"},
    {"id": 3, "name": "Киви", "strength": "0.5%", "volume": "15 мл", "price": 1170, "image": "03_kiwi_05.jpg"},
    {"id": 4, "name": "Яблоко", "strength": "0.5%", "volume": "15 мл", "price": 1090, "image": "04_apple_05.jpg"},
    {"id": 5, "name": "Черника", "strength": "0.5%", "volume": "15 мл", "price": 1350, "image": "05_blueberry_05.jpg"},
    {"id": 6, "name": "Арбуз", "strength": "0.5%", "volume": "15 мл", "price": 1290, "image": "06_watermelon_05.jpg"},
    {"id": 7, "name": "Манго", "strength": "1%", "volume": "15 мл", "price": 1790, "image": "07_mango_1.jpg"},
    {"id": 8, "name": "Клубника", "strength": "1%", "volume": "15 мл", "price": 1850, "image": "08_strawberry_1.jpg"},
    {"id": 9, "name": "Киви", "strength": "1%", "volume": "15 мл", "price": 1720, "image": "09_kiwi_1.jpg"},
    {"id": 10, "name": "Яблоко", "strength": "1%", "volume": "15 мл", "price": 1650, "image": "10_apple_1.jpg"},
    {"id": 11, "name": "Черника", "strength": "1%", "volume": "15 мл", "price": 2150, "image": "11_blueberry_1.jpg"},
    {"id": 12, "name": "Арбуз", "strength": "1%", "volume": "15 мл", "price": 1950, "image": "12_watermelon_1.jpg"},
]

PAYMENT_METHODS = ["Карта", "QR", "Трансгран", "USDT"]
DELIVERY_METHODS = ["Почта России", "СДЭК", "Самовывоз"]


def money(value: int) -> str:
    return f"{value:,}".replace(",", " ") + " ₽"


@app.context_processor
def inject_globals():
    return {"money": money, "products": PRODUCTS}


@app.route("/")
def index():
    return render_template("index.html", products=PRODUCTS)


@app.route("/privacy")
def privacy():
    return render_template("privacy.html")


@app.route("/terms")
def terms():
    return render_template("terms.html")


@app.route("/api/products")
def api_products():
    return jsonify(PRODUCTS)


def build_order_email(order: dict) -> str:
    lines = [
        "Новый заказ VapeCBD",
        "",
        f"Дата: {order['created_at']}",
        f"Имя: {order['customer']['name']}",
        f"Telegram: {order['customer']['telegram']}",
        f"Email: {order['customer'].get('email') or '-'}",
        f"Доставка: {order['delivery']['method']}",
        f"Адрес/комментарий: {order['delivery']['address']}",
        f"Оплата: {order['payment_method']}",
        "",
        "Товары:",
    ]
    for item in order["items"]:
        lines.append(
            f"- {item['name']} CBD {item['strength']} {item['volume']} — "
            f"{item['quantity']} шт × {money(item['price'])} = {money(item['line_total'])}"
        )
    lines.extend(["", f"Итого: {money(order['total'])}"])
    return "\n".join(lines)


def save_order(order: dict) -> Path:
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    path = ORDERS_DIR / f"order_{stamp}.json"
    path.write_text(json.dumps(order, ensure_ascii=False, indent=2), encoding="utf-8")
    return path


def send_order_email(order: dict) -> bool:
    host = os.getenv("SMTP_HOST")
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASSWORD")
    port = int(os.getenv("SMTP_PORT", "587"))
    use_tls = os.getenv("SMTP_USE_TLS", "true").lower() == "true"

    if not host or not user or not password:
        return False

    msg = EmailMessage()
    msg["Subject"] = "Новый заказ VapeCBD"
    msg["From"] = user
    msg["To"] = ORDER_EMAIL_TO
    msg.set_content(build_order_email(order))

    with smtplib.SMTP(host, port, timeout=15) as smtp:
        if use_tls:
            smtp.starttls()
        smtp.login(user, password)
        smtp.send_message(msg)
    return True


@app.route("/checkout", methods=["POST"])
def checkout():
    data = request.get_json(silent=True) or {}
    cart_items = data.get("items", [])
    customer = data.get("customer", {})
    delivery = data.get("delivery", {})
    payment_method = data.get("payment_method", "")

    if not cart_items:
        return jsonify({"ok": False, "error": "Корзина пустая"}), 400

    if payment_method not in PAYMENT_METHODS:
        return jsonify({"ok": False, "error": "Выберите способ оплаты"}), 400

    if delivery.get("method") not in DELIVERY_METHODS:
        return jsonify({"ok": False, "error": "Выберите способ доставки"}), 400

    product_by_id = {p["id"]: p for p in PRODUCTS}
    order_items = []
    total = 0

    for raw_item in cart_items:
        product_id = int(raw_item.get("id", 0))
        quantity = max(1, int(raw_item.get("quantity", 1)))
        product = product_by_id.get(product_id)
        if not product:
            continue
        line_total = product["price"] * quantity
        total += line_total
        order_items.append({**product, "quantity": quantity, "line_total": line_total})

    if not order_items:
        return jsonify({"ok": False, "error": "Товары не найдены"}), 400

    order = {
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "customer": {
            "name": customer.get("name", "").strip(),
            "telegram": customer.get("telegram", "").strip(),
            "email": customer.get("email", "").strip(),
        },
        "delivery": {
            "method": delivery.get("method", ""),
            "address": delivery.get("address", "").strip(),
        },
        "payment_method": payment_method,
        "items": order_items,
        "total": total,
        "status": "payment_pending",
    }

    if not order["customer"]["name"] or not order["customer"]["telegram"] or not order["delivery"]["address"]:
        return jsonify({"ok": False, "error": "Заполните имя, Telegram и адрес"}), 400

    path = save_order(order)
    email_sent = False
    try:
        email_sent = send_order_email(order)
    except Exception as exc:
        app.logger.exception("Email sending failed: %s", exc)

    return jsonify({
        "ok": True,
        "order_id": path.stem,
        "email_sent": email_sent,
        "payment_url": url_for("payment", order_id=path.stem, _external=False),
    })


@app.route("/payment/<order_id>")
def payment(order_id):
    return render_template("payment.html", order_id=order_id)


if __name__ == "__main__":
    app.run(debug=True)
