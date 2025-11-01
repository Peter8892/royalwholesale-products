// ✅ Smart Autocomplete Script for Royal Wholesale Forecast Form

let productList = [];

// 1️⃣ Load all product titles from your GitHub JSON
fetch('https://raw.githubusercontent.com/Peter8892/royalwholesale-products/main/csvjson.json')
  .then(res => res.json())
  .then(data => {
    productList = data.map(item => item.Title);
    console.log(`✅ Loaded ${productList.length} products`);
  })
  .catch(err => console.error('❌ Error loading product list:', err));


// 2️⃣ Create a custom dropdown for live filtering
document.addEventListener('input', function (e) {
  if (!e.target.classList.contains('product-name')) return;

  const input = e.target;
  const val = input.value.toLowerCase();
  const parent = input.parentElement;

  // Remove any existing suggestion box
  parent.querySelectorAll('.autocomplete-box').forEach(box => box.remove());

  if (val.length < 2) return; // start suggesting after 2 characters

  const matches = productList
    .filter(name => name.toLowerCase().includes(val))
    .slice(0, 10);

  if (matches.length === 0) return;

  const box = document.createElement('div');
  box.className = 'autocomplete-box';
  box.style.position = 'absolute';
  box.style.background = '#fff';
  box.style.border = '1px solid #ccc';
  box.style.borderRadius = '6px';
  box.style.zIndex = '1000';
  box.style.width = input.offsetWidth + 'px';
  box.style.maxHeight = '200px';
  box.style.overflowY = 'auto';

  matches.forEach(match => {
    const item = document.createElement('div');
    item.textContent = match;
    item.style.padding = '6px 10px';
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      input.value = match;
      box.remove();
    });
    item.addEventListener('mouseover', () => {
      item.style.background = '#f0f0f0';
    });
    item.addEventListener('mouseout', () => {
      item.style.background = '#fff';
    });
    box.appendChild(item);
  });

  parent.style.position = 'relative';
  parent.appendChild(box);
});


// 3️⃣ Handle “Add Another Product” button
document.getElementById('addProduct').addEventListener('click', function () {
  const section = document.querySelector('.forecast-item');
  const clone = section.cloneNode(true);
  clone.querySelectorAll('input, textarea').forEach(el => el.value = '');
  document.getElementById('forecast-sections').appendChild(clone);
});


// 4️⃣ Handle form submission to webhook
document.getElementById('forecastForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const data = new FormData(form);

  const base = {
    full_name: data.get('full_name'),
    company_name: data.get('company_name'),
    email: data.get('email'),
    phone: data.get('phone'),
    program_name: data.get('program_name'),
    shopify_customer_id: data.get('shopify_customer_id') || null,
    created_at: new Date().toISOString(),
    products: []
  };

  const names = data.getAll('product_name[]');
  const skus = data.getAll('sku[]');
  const quantities = data.getAll('quantity[]');
  const dates = data.getAll('forecast_date[]');
  const notes = data.getAll('notes[]');

  for (let i = 0; i < names.length; i++) {
    base.products.push({
      product_name: names[i],
      sku: skus[i],
      quantity: parseInt(quantities[i]) || 0,
      forecast_date: dates[i],
      notes: notes[i] || ''
    });
  }

  document.getElementById('responseMsg').textContent = 'Submitting...';

  try {
    const res = await fetch('https://sbcaio.app.n8n.cloud/webhook/f0b4a47a-b6c5-491c-bec5-9379e4646604', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(base)
    });

    if (res.ok) {
      document.getElementById('responseMsg').textContent = '✅ Forecast submitted successfully!';
      form.reset();
    } else {
      document.getElementById('responseMsg').textContent = '⚠ Something went wrong. Please try again.';
    }
  } catch (error) {
    document.getElementById('responseMsg').textContent = '❌ Error submitting form.';
  }
});
