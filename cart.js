let cart = JSON.parse(localStorage.getItem('cart')) || [];

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const countSpan = document.getElementById('cart-count');
  if (countSpan) {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    countSpan.textContent = totalItems;

    // Trigger animation
    countSpan.classList.remove('cart-count-pop');
    void countSpan.offsetWidth; // Force reflow
    countSpan.classList.add('cart-count-pop');
  }
}

function addToCart(name, price, quantity = 1) {
  quantity = parseInt(quantity);
  if (isNaN(quantity) || quantity < 1) quantity = 1;

  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ name, price, quantity });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${quantity} × ${name} added to cart`);
  updateCartCount();
}


function renderCart() {
  const container = document.getElementById('cart-container');
  if (!container) return; // prevent error if this element doesn't exist

  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  let html = '<ul>';
  cart.forEach(item => {
    html += `<li>
      <strong>${item.name}</strong> - $${(item.price / 100).toFixed(2)} × ${item.quantity}
      <button onclick="removeFromCart('${item.name}')">Remove</button>
    </li>`;
  });
  html += '</ul>';

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  html += `<p><strong>Total: $${(total / 100).toFixed(2)}</strong></p>`;

  container.innerHTML = html;
}

function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

async function checkout() {
  const response = await fetch('https://elysianearthessence.netlify.app/.netlify/functions/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart })
  });

  const data = await response.json();
  if (data.url) {
    window.location.href = data.url;
  } else {
    alert('Checkout failed. Try again.');
  }
}

updateCartCount();
// Load the cart on page load (only if cart-container exists)
window.addEventListener('DOMContentLoaded', renderCart);
