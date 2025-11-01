// ✅ Royal Wholesale Forecast Form - Product Autocomplete + Auto-fill SKU

let productsData = [];

// 1️⃣ Load product names and SKUs from your JSON file
fetch('https://raw.githubusercontent.com/Peter8892/royalwholesale-products/main/csvjson.json')
  .then(res => res.json())
  .then(data => {
    productsData = data;
    const productList = document.getElementById('productList');
    if (!productList) return;

    // Populate product names for autocomplete
    const seen = new Set();
    data.forEach(item => {
      if (item.Title && !seen.has(item.Title)) {
        const opt = document.createElement('option');
        opt.value = item.Title;
        productList.appendChild(opt);
        seen.add(item.Title);
      }
    });

    console.log(`✅ Loaded ${data.length} products for autocomplete`);
  })
  .catch(err => console.error('❌ Error loading product list:', err));


// 2️⃣ When product name changes, auto-fill the matching SKU
document.addEventListener('input', function (e) {
  if (e.target.classList.contains('product-name')) {
    const productName = e.target.value.trim();
    const product = productsData.find(p => p.Title === productName);

    if (product) {
      // Find SKU input in the same forecast section
      const parentSection = e.target.closest('.forecast-item');
      const skuInput = parentSection.querySelector('input[name="sku[]"]');

      if (skuInput && product["Variant SKU"]) {
        skuInput.value = product["Variant SKU"].replace(/^'/, ''); // Remove leading apostrophe if any
      }
    }
  }
});


// 3️⃣ Handle “Add Another Product” button
document.getElementById('addProduct').addEventListener('click', function () {
  const section = document.querySelector('.forecast-item');
  const clone = section.cloneNode(true);

  // Clear all input values
  clone.querySelectorAll('input, textarea').forEach(el => el.value = '');
  document.getElementById('forecast-sections').appendChild(clone);
});


// 4️⃣ Handle form submission
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
