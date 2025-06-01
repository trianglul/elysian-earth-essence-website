let cart = JSON.parse(localStorage.getItem('cart')) || [];

function renderCart() {
  const container = document.getElementById('cart-container');
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

// Load the cart on page load
renderCart();
