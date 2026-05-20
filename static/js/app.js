const products = window.PRODUCTS || [];
const cartKey = 'vapecbd_cart';
let cart = JSON.parse(localStorage.getItem(cartKey) || '{}');

const cartCount = document.getElementById('cartCount');
const cartDrawer = document.getElementById('cartDrawer');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const openCart = document.getElementById('openCart');
const closeCart = document.getElementById('closeCart');
const checkoutForm = document.getElementById('checkoutForm');
const formStatus = document.getElementById('formStatus');

function money(value){ return new Intl.NumberFormat('ru-RU').format(value) + ' ₽'; }
function save(){ localStorage.setItem(cartKey, JSON.stringify(cart)); renderCart(); }
function productById(id){ return products.find(p => Number(p.id) === Number(id)); }
function countCart(){ return Object.values(cart).reduce((a,b)=>a+Number(b),0); }
function totalCart(){ return Object.entries(cart).reduce((sum,[id,qty])=>{ const p=productById(id); return p ? sum + p.price*qty : sum; },0); }

function addToCart(id){ cart[id] = (cart[id] || 0) + 1; save(); cartDrawer.classList.add('open'); }
function changeQty(id, delta){ cart[id] = (cart[id] || 0) + delta; if(cart[id] <= 0) delete cart[id]; save(); }
function removeItem(id){ delete cart[id]; save(); }

function renderCart(){
  cartCount.textContent = countCart();
  cartTotal.textContent = money(totalCart());
  if(!cartItems) return;
  const entries = Object.entries(cart);
  if(!entries.length){ cartItems.innerHTML = '<p>Корзина пустая</p>'; return; }
  cartItems.innerHTML = entries.map(([id, qty]) => {
    const p = productById(id);
    if(!p) return '';
    return `<div class="cart-item">
      <div class="cart-item-top"><strong>${p.name} CBD ${p.strength}</strong><span>${money(p.price * qty)}</span></div>
      <small>${p.volume} · ${money(p.price)} за шт.</small>
      <div class="qty">
        <button onclick="changeQty(${id}, -1)">−</button>
        <button>${qty}</button>
        <button onclick="changeQty(${id}, 1)">+</button>
        <button onclick="removeItem(${id})">×</button>
      </div>
    </div>`;
  }).join('');
}

document.querySelectorAll('.add').forEach(btn => btn.addEventListener('click', () => addToCart(btn.dataset.id)));
openCart?.addEventListener('click', () => cartDrawer.classList.add('open'));
closeCart?.addEventListener('click', () => cartDrawer.classList.remove('open'));
document.getElementById('goCheckout')?.addEventListener('click', () => cartDrawer.classList.remove('open'));

checkoutForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if(!countCart()) { formStatus.textContent = 'Добавьте товары в корзину.'; return; }
  const fd = new FormData(checkoutForm);
  const items = Object.entries(cart).map(([id, quantity]) => ({id: Number(id), quantity: Number(quantity)}));
  const payload = {
    items,
    customer: { name: fd.get('name'), telegram: fd.get('telegram'), email: fd.get('email') },
    delivery: { method: fd.get('delivery_method'), address: fd.get('address') },
    payment_method: fd.get('payment_method')
  };
  formStatus.textContent = 'Создаём заказ...';
  try {
    const res = await fetch('/checkout', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    const data = await res.json();
    if(!data.ok) throw new Error(data.error || 'Ошибка оформления');
    localStorage.removeItem(cartKey); cart = {}; renderCart();
    window.location.href = data.payment_url;
  } catch(err){
    formStatus.textContent = err.message;
  }
});

renderCart();
