// --- SKU + Product autocomplete (linked) ---
let productsData = [];

fetch('https://raw.githubusercontent.com/Peter8892/royalwholesale-products/main/csvjson.json')
  .then(res => res.json())
  .then(data => {
    productsData = data || [];
    console.log("✅ Product data loaded:", productsData.length);
    initForecastForm();
  })
  .catch(err => console.error("❌ Error loading JSON:", err));

function initForecastForm() {
  setupAutocomplete(document.querySelector('.forecast-item'));

  document.getElementById('addProduct')?.addEventListener('click', () => {
    const section = document.querySelector('.forecast-item');
    const clone = section.cloneNode(true);
    clone.querySelectorAll('input, textarea').forEach(el => el.value = '');
    document.getElementById('forecast-sections').appendChild(clone);
    setupAutocomplete(clone);
  });
}

function setupAutocomplete(item) {
  const productInput = item.querySelector('.product-name');
  const skuInput = item.querySelector('input[name="sku[]"]');

  // Create dropdowns
  const productBox = createDropdown(productInput);
  const skuBox = createDropdown(skuInput);

  // PRODUCT AUTOCOMPLETE
  productInput.addEventListener('input', () => {
    const val = productInput.value.toLowerCase();
    productBox.innerHTML = '';
    if (!val) return (productBox.style.display = 'none');

    const matches = productsData
      .filter(p => p.Title.toLowerCase().includes(val))
      .slice(0, 10);

    matches.forEach(p => {
      const div = document.createElement('div');
      div.textContent = p.Title;
      div.className = 'autocomplete-item';
      div.onclick = () => {
        productInput.value = p.Title;
        productBox.style.display = 'none';
        // when user picks a product, populate SKUs
        populateSkuBox(p.Title, skuBox);
      };
      productBox.appendChild(div);
    });
    productBox.style.display = matches.length ? 'block' : 'none';
  });

  // SKU AUTOCOMPLETE
  skuInput.addEventListener('focus', () => {
    populateSkuBox(productInput.value, skuBox);
  });

  document.addEventListener('click', (e) => {
    if (!item.contains(e.target)) {
      productBox.style.display = 'none';
      skuBox.style.display = 'none';
    }
  });
}

function createDropdown(input) {
  const box = document.createElement('div');
  box.className = 'autocomplete-box';
  box.style.position = 'absolute';
  box.style.background = '#fff';
  box.style.border = '1px solid #ccc';
  box.style.borderRadius = '6px';
  box.style.boxShadow = '0 4px 10px rgba(0,0,0,0.1)';
  box.style.zIndex = '9999';
  box.style.width = input.offsetWidth + 'px';
  box.style.display = 'none';
  box.style.maxHeight = '200px';
  box.style.overflowY = 'auto';
  input.parentElement.style.position = 'relative';
  input.parentElement.appendChild(box);
  return box;
}

function populateSkuBox(productTitle, skuBox) {
  skuBox.innerHTML = '';
  const titleLower = productTitle.toLowerCase();
  const matches = productsData.filter(p => p.Title.toLowerCase() === titleLower);

  if (matches.length === 0) {
    skuBox.style.display = 'none';
    return;
  }

  matches.forEach(p => {
    const div = document.createElement('div');
    div.textContent = p["Variant SKU"].replace(/^'/, '');
    div.className = 'autocomplete-item';
    div.onclick = () => {
      const skuInput = skuBox.parentElement.querySelector('input[name="sku[]"]');
      skuInput.value = p["Variant SKU"].replace(/^'/, '');
      skuBox.style.display = 'none';
    };
    skuBox.appendChild(div);
  });

  skuBox.style.display = matches.length ? 'block' : 'none';
}
