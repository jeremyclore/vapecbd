const PRODUCTS = [
  { id: 1, name: "Манго", cbd: "0.5%", volume: "15 мл", price: 1190, image: "01_mango_05.jpg" },
  { id: 2, name: "Клубника", cbd: "0.5%", volume: "15 мл", price: 1250, image: "02_strawberry_05.jpg" },
  { id: 3, name: "Киви", cbd: "0.5%", volume: "15 мл", price: 1170, image: "03_kiwi_05.jpg" },
  { id: 4, name: "Яблоко", cbd: "0.5%", volume: "15 мл", price: 1090, image: "04_apple_05.jpg" },
  { id: 5, name: "Черника", cbd: "0.5%", volume: "15 мл", price: 1350, image: "05_blueberry_05.jpg" },
  { id: 6, name: "Арбуз", cbd: "0.5%", volume: "15 мл", price: 1290, image: "06_watermelon_05.jpg" },
  { id: 7, name: "Манго Strong", cbd: "1%", volume: "15 мл", price: 1790, image: "07_mango_1.jpg" },
  { id: 8, name: "Клубника Strong", cbd: "1%", volume: "15 мл", price: 1850, image: "08_strawberry_1.jpg" },
  { id: 9, name: "Киви Strong", cbd: "1%", volume: "15 мл", price: 1720, image: "09_kiwi_1.jpg" },
  { id: 10, name: "Яблоко Strong", cbd: "1%", volume: "15 мл", price: 1650, image: "10_apple_1.jpg" },
  { id: 11, name: "Черника Strong", cbd: "1%", volume: "15 мл", price: 2150, image: "11_blueberry_1.jpg" },
  { id: 12, name: "Арбуз Strong", cbd: "1%", volume: "15 мл", price: 1950, image: "12_watermelon_1.jpg" },
];

function money(value) {
  return value.toLocaleString("ru-RU") + " ₽";
}

function getCart() {
  return JSON.parse(localStorage.getItem("vapecbd_cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("vapecbd_cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.qty, 0);
  const counter = document.getElementById("cartCount");

  if (counter) counter.textContent = count;
}

function showToast(text) {
  let toast = document.querySelector(".toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div class="toast-icon">✓</div>
    <div>
      <b>Добавлено в корзину</b>
      <span>${text}</span>
    </div>
  `;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function addToCart(productId) {
  const product = PRODUCTS.find(item => item.id === productId);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart(cart);
  showToast(`${product.name} · CBD ${product.cbd}`);
}

function changeQty(productId, delta) {
  let cart = getCart();
  const item = cart.find(product => product.id === productId);

  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    cart = cart.filter(product => product.id !== productId);
  }

  saveCart(cart);
  renderCart();
}

function removeFromCart(productId) {
  const cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  renderCart();
}

function clearCart() {
  localStorage.removeItem("vapecbd_cart");
  updateCartCount();
  renderCart();
}

function renderCatalog() {
  const root = document.getElementById("products");
  if (!root) return;

  root.innerHTML = PRODUCTS.map(product => `
    <article class="product">
      <img src="img/${product.image}" alt="${product.name}">
      <div>
        <b>${product.name}</b>
        <p>CBD ${product.cbd} · ${product.volume}</p>
        <strong>${money(product.price)}</strong>
        <button class="btn add-cart" onclick="addToCart(${product.id})">
          В корзину
        </button>
      </div>
    </article>
  `).join("");
}

function renderCart() {
  const root = document.getElementById("cartItems");
  const totalRoot = document.getElementById("cartTotal");

  if (!root || !totalRoot) return;

  const cart = getCart();

  if (!cart.length) {
    root.innerHTML = `
      <div class="cart-empty">
        Корзина пока пустая
      </div>
    `;
    totalRoot.textContent = "0 ₽";
    return;
  }

  let total = 0;

  root.innerHTML = cart.map(item => {
    const itemTotal = item.price * item.qty;
    total += itemTotal;

    return `
      <div class="cart-line cart-product">
        <div>
          <b>${item.name}</b>
          <p>CBD ${item.cbd} · ${item.volume}</p>
          <small>${item.qty} × ${money(item.price)}</small>
        </div>

        <div class="cart-actions">
          <button onclick="changeQty(${item.id}, -1)">−</button>
          <span>${item.qty}</span>
          <button onclick="changeQty(${item.id}, 1)">+</button>
          <button onclick="removeFromCart(${item.id})">×</button>
        </div>
      </div>
    `;
  }).join("");

  totalRoot.textContent = money(total);
}

function showThanks() {
  const thanks = document.getElementById("thanks");
  if (thanks) thanks.style.display = "block";
}

renderCatalog();
renderCart();
updateCartCount();
