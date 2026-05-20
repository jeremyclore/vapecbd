const products = [
  {id:1,name:"Манго",cbd:"0.5%",volume:"15 мл",price:1190,image:"01_mango_05.jpg",tag:"Tropical Gold"},
  {id:2,name:"Клубника",cbd:"0.5%",volume:"15 мл",price:1250,image:"02_strawberry_05.jpg",tag:"Berry Soft"},
  {id:3,name:"Киви",cbd:"0.5%",volume:"15 мл",price:1170,image:"03_kiwi_05.jpg",tag:"Fresh Green"},
  {id:4,name:"Яблоко",cbd:"0.5%",volume:"15 мл",price:1090,image:"04_apple_05.jpg",tag:"Clean Apple"},
  {id:5,name:"Черника",cbd:"0.5%",volume:"15 мл",price:1350,image:"05_blueberry_05.jpg",tag:"Blue Chill"},
  {id:6,name:"Арбуз",cbd:"0.5%",volume:"15 мл",price:1290,image:"06_watermelon_05.jpg",tag:"Juicy Red"},
  {id:7,name:"Манго",cbd:"1%",volume:"15 мл",price:1790,image:"07_mango_1.jpg",tag:"Tropical Strong"},
  {id:8,name:"Клубника",cbd:"1%",volume:"15 мл",price:1850,image:"08_strawberry_1.jpg",tag:"Berry Strong"},
  {id:9,name:"Киви",cbd:"1%",volume:"15 мл",price:1720,image:"09_kiwi_1.jpg",tag:"Green Strong"},
  {id:10,name:"Яблоко",cbd:"1%",volume:"15 мл",price:1650,image:"10_apple_1.jpg",tag:"Apple Strong"},
  {id:11,name:"Черника",cbd:"1%",volume:"15 мл",price:2150,image:"11_blueberry_1.jpg",tag:"Deep Blue"},
  {id:12,name:"Арбуз",cbd:"1%",volume:"15 мл",price:1950,image:"12_watermelon_1.jpg",tag:"Watermelon Strong"},
];

let cart = JSON.parse(localStorage.getItem("vapecbd_cart") || "[]");

function money(value){ return value.toLocaleString("ru-RU") + " ₽"; }

function acceptAge(){
  localStorage.setItem("vapecbd_age_ok", "1");
  document.getElementById("ageGate").classList.remove("show");
}

function checkAge(){
  if(localStorage.getItem("vapecbd_age_ok") !== "1"){
    document.getElementById("ageGate").classList.add("show");
  }
}

function renderProducts(){
  const root = document.getElementById("products");
  root.innerHTML = products.map(p => `
    <article class="product">
      <div class="product-img">
        <img src="img/${p.image}" alt="${p.name} CBD ${p.cbd}">
        <span class="pill">CBD ${p.cbd}</span>
      </div>
      <div class="product-body">
        <div class="product-tag">${p.tag}</div>
        <h3>${p.name}</h3>
        <div class="meta">
          <span>${p.volume}</span>
          <span>CBD ${p.cbd}</span>
        </div>
        <div class="price-row">
          <div class="price">${money(p.price)}</div>
          <button class="add" onclick="addToCart(${p.id})">+</button>
        </div>
      </div>
    </article>
  `).join("");
}

function saveCart(){
  localStorage.setItem("vapecbd_cart", JSON.stringify(cart));
  renderCart();
}

function openCart(){
  document.getElementById("cart").classList.add("open");
  renderCart();
}

function closeCart(){
  document.getElementById("cart").classList.remove("open");
}

function addToCart(id){
  const product = products.find(p => p.id === id);
  const item = cart.find(i => i.id === id);

  if(item) item.qty += 1;
  else cart.push({...product, qty:1});

  saveCart();
  openCart();
}

function changeQty(id, delta){
  const item = cart.find(i => i.id === id);
  if(!item) return;

  item.qty += delta;

  if(item.qty <= 0){
    cart = cart.filter(i => i.id !== id);
  }

  saveCart();
}

function renderCart(){
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartTotal").textContent = money(total);

  const box = document.getElementById("cartItems");

  if(!cart.length){
    box.innerHTML = "<p style='color:var(--muted)'>Корзина пустая. Добавьте товары из каталога.</p>";
    return;
  }

  box.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <strong>${item.name} · CBD ${item.cbd}</strong>
        <small>${item.volume} · ${money(item.price)} за шт.</small>
      </div>
      <div class="qty">
        <button type="button" onclick="changeQty(${item.id}, -1)">−</button>
        <span>${item.qty}</span>
        <button type="button" onclick="changeQty(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join("");
}

function buildOrderText(data){
  const total = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  const lines = cart.map(item => `• ${item.name} CBD ${item.cbd} — ${item.qty} шт × ${money(item.price)}`).join("%0A");

  return [
    "Новый заказ VapeCBD",
    "",
    `Имя: ${data.name}`,
    `Telegram: ${data.telegram}`,
    `Email: ${data.email || "-"}`,
    `Доставка: ${data.delivery}`,
    `Адрес: ${data.address}`,
    `Оплата: ${data.payment}`,
    "",
    "Товары:",
    lines.replaceAll("%0A", "\n"),
    "",
    `Итого: ${money(total)}`
  ].join("\n");
}

function submitOrder(event){
  event.preventDefault();

  const status = document.getElementById("status");

  if(!cart.length){
    status.textContent = "Корзина пустая.";
    return;
  }

  const data = {
    name: document.getElementById("name").value.trim(),
    telegram: document.getElementById("telegram").value.trim(),
    email: document.getElementById("email").value.trim(),
    delivery: document.getElementById("delivery").value,
    address: document.getElementById("address").value.trim(),
    payment: document.getElementById("payment").value
  };

  const orderText = buildOrderText(data);
  const subject = encodeURIComponent("Новый заказ VapeCBD");
  const body = encodeURIComponent(orderText);

  window.location.href = `mailto:mail@mail?subject=${subject}&body=${body}`;

  status.textContent = "Открылось письмо с заказом. Отправьте его для оформления.";
}

checkAge();
renderProducts();
renderCart();
