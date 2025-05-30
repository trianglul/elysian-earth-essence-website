// ✅ Initialize Supabase
const supabase = window.supabase.createClient(
  'https://pgbeepsskpqutibhszeg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnYmVlcHNza3BxdXRpYmhzemVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0Mjk0MDUsImV4cCI6MjA2NDAwNTQwNX0.iMXNDYe6zqvJ3e7f3SlSvS8VRm-vJuSson7CJz8GmKk',
  { auth: { persistSession: true } }
);

const reviewForm = document.getElementById('review-form');
let authMode = null;

// ✅ Unified Message Display
function showMessage(message, type = "error") {
  const msgBox = document.getElementById("auth-message");
  msgBox.textContent = message;
  msgBox.className = `auth-message ${type}`;
  msgBox.style.display = "block";
}

// ✅ Handle Auth Form Open
function toggleAuthForm(mode) {
  authMode = mode;

  const oldOverlay = document.querySelector('.auth-overlay');
  if (oldOverlay) oldOverlay.remove();

  const overlay = document.createElement('div');
  overlay.className = 'auth-overlay';

  const form = document.createElement('div');
  form.className = 'auth-form';

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.className = 'close-button';
  closeBtn.onclick = () => fadeOutAndRemove(overlay);
  form.appendChild(closeBtn);

  // ✅ Email input
  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.id = 'auth-email';
  emailInput.placeholder = 'Email';
  emailInput.autocomplete = 'email';
  form.appendChild(emailInput);

  // ✅ Password input
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.id = 'auth-password';
  passwordInput.placeholder = 'Password';
  passwordInput.autocomplete = 'current-password';
  form.appendChild(passwordInput);

  // ✅ Submit Button
  const submitBtn = document.createElement('button');
  submitBtn.textContent = 'Submit';
  submitBtn.onclick = submitAuth;
  form.appendChild(submitBtn);

  overlay.appendChild(form);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) fadeOutAndRemove(overlay);
  });

  document.body.appendChild(overlay);
}

function fadeOutAndRemove(element) {
  const form = element.querySelector('.auth-form');
  if (form) form.classList.add('fade-out');

  element.style.animation = 'fadeSlideOut 0.3s ease forwards';
  setTimeout(() => element.remove(), 300);
}

// ✅ Auth Logic (Signup/Login)
async function submitAuth() {
  const email = document.getElementById("auth-email").value.trim().toLowerCase();
  const password = document.getElementById("auth-password").value;

  if (!email || !password) {
    showMessage("Please enter email and password.");
    return;
  }

  let result;
  if (authMode === 'signup') {
    result = await supabase.auth.signUp({ email, password });
  } else {
    result = await supabase.auth.signInWithPassword({ email, password });
  }

  const { data, error } = result;
  
  if (error) {
    // Check for duplicate email signup error specifically
    if (authMode === 'signup' && error.message.toLowerCase().includes('already registered')) {
      showMessage('This email is already registered. Please log in instead.', 'error');
    } else {
      showMessage(error.message, 'error');
    }
    return;
  }

  handleAuthSuccess(data.user);
}


function handleAuthSuccess(user) {
  document.querySelector('.auth-overlay')?.remove();
  document.getElementById("user-panel").style.display = "flex";
  document.getElementById("welcome-msg").textContent = `Welcome ${user.email}!`;
  reviewForm.style.display = "block";
  document.getElementById("auth-bar").style.display = "none";
}

// ✅ Sign Out
async function signOut() {
  await supabase.auth.signOut();
  reviewForm.style.display = "none";
  document.getElementById("user-panel").style.display = "none";
  document.getElementById("auth-bar").style.display = "flex";
}

// ✅ Auto-login check
supabase.auth.getUser().then(({ data: { user } }) => {
  if (user) {
    handleAuthSuccess(user);
  }
});

// ✅ Submit Review
async function submitReview(event) {
  event.preventDefault();
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) {
    showMessage("You must be logged in to submit a review.");
    return;
  }

  const text = document.getElementById('review-text').value;
  const rating = parseInt(document.getElementById('rating').value);
  const file = document.getElementById('image').files[0];
  let imageUrl = null;

  if (file) {
    const { data, error: uploadError } = await supabase.storage
      .from('review-images')
      .upload(`${user.id}/${file.name}`, file);

    if (uploadError) {
      showMessage("Image upload failed.");
      return;
    }

    imageUrl = supabase.storage
      .from('review-images')
      .getPublicUrl(`${user.id}/${file.name}`).data.publicUrl;
  }

  const { error } = await supabase.from('reviews').insert([{
    user_id: user.id,
    text,
    rating,
    image_url: imageUrl
  }]);

  if (error) {
    showMessage("Failed to submit review.");
    return;
  }

  showMessage("Review submitted!", "success");
  loadReviews();
}

// ✅ Load Reviews
async function loadReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  const container = document.getElementById('reviews');
  container.innerHTML = '';

  if (error) {
    container.innerText = "Failed to load reviews.";
    return;
  }

  data.forEach(review => {
    const div = document.createElement('div');
    div.innerHTML = `
      <p>⭐ Rating: ${review.rating}</p>
      <p>${review.text}</p>
      ${review.image_url ? `<img src="${review.image_url}" width="200">` : ""}
      <hr/>
    `;
    container.appendChild(div);
  });
}

// ✅ Load reviews on page load
loadReviews();
