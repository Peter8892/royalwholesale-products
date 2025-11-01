// ✅ Autocomplete script for Royal Wholesale Forecast Form

let productData = [];

// 1️⃣ Load product names from your JSON file on GitHub
fetch('https://raw.githubusercontent.com/Peter8892/royalwholesale-products/main/csvjson.json')
  .then(res => res.json())
  .then(data => {
    productData = data;
    const datalist = document.getElementById('productList');
    if (!datalist) return;

    // Add each product title as an option
    data.forEach(item => {
      const option = document.createElement('option');
      option.value = item.Title;
      datalist.appendChild(option);
    });

    console.log(`✅ Loaded ${data.length} products for autocomplete`);
  })
  .catch(err => console.error('❌ Error loading product list:', err));

// 2️⃣ Listen for changes on product name input to filter SKUs
document.addEventListener('input', (event) => {
  if (!event.target.classList.contains('product-name')) return;

  const productName = event.target.value.trim();
  const skuList = document.getElementById('skuList');

  if (!skuList || !productData.length) return;

  // Clear existing SKU options
  skuList.innerHTML = '';

  // Find SKUs that match the product name exactly
  const matches = productData.filter(item => item.Title === productName);

  matches.forEach(item => {
    const option = document.createElement('option');
    option.value = item['Variant SKU']?.replace(/^'/, '') || '';
    skuList.appendChild(option);
  });

  if (matches.length > 0) {
    console.log(`✅ Found ${matches.length} SKU(s) for "${productName}"`);
  } else {
    console.warn(`⚠ No SKU found for "${productName}"`);
  }
});

// 3️⃣ Handle “Add Another Product” button
document.getElementById('addProduct').addEventListener('click', function () {
  const section = document.querySelector('.forecast-item');
  const clone = section.cloneNode(true);
  clone.querySelectorAll('input, textarea').forEach(el => el.value = '');
  document.getElementById('forecast-sections').appendChild(clone);
});

// 4️⃣ Handle form submission (unchanged)
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
