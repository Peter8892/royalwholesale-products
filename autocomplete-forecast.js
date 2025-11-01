// ✅ SKU suggestions filtered by product name (per-row datalist)
// Paste this as your autocomplete-forecast.js (replace old file)

let productsData = [];

// Load product JSON
fetch('https://raw.githubusercontent.com/Peter8892/royalwholesale-products/main/csvjson.json')
  .then(r => r.json())
  .then(data => {
    productsData = data || [];
    console.log(`✅ product JSON loaded: ${productsData.length} items`);
    initExistingRows(); // prepare existing rows
  })
  .catch(err => {
    console.error('❌ failed to load product JSON', err);
  });

// Utility: create a unique id
function uid(prefix = 'id') {
  return prefix + '-' + Math.random().toString(36).slice(2, 9);
}

// Ensure each forecast row has its own sku datalist and wiring
function prepareRow(rowEl) {
  if (!rowEl) return;

  // product name input in this row
  const productInput = rowEl.querySelector('input.product-name[name="product_name[]"]');
  const skuInput = rowEl.querySelector('input[name="sku[]"]');

  // if skuInput already has an attached datalist, reuse
  if (!skuInput) return;

  // create datalist if not present
  if (!skuInput.getAttribute('list')) {
    const dlId = uid('skuList');
    const dl = document.createElement('datalist');
    dl.id = dlId;
    // attach datalist to DOM (as sibling)
    skuInput.after(dl);
    skuInput.setAttribute('list', dlId);
  }

  // attach listeners
  // handle product input changes (typing/select)
  productInput.addEventListener('input', function () {
    handleProductChange(productInput, skuInput);
  });

  // also handle blur (some browsers select via blur)
  productInput.addEventListener('change', function () {
    handleProductChange(productInput, skuInput);
  });
}

// When product name changes in a row, populate that row's SKU datalist
function handleProductChange(productInput, skuInput) {
  const typed = (productInput.value || '').trim();
  const dlId = skuInput.getAttribute('list');
  if (!dlId) return;
  const dl = document.getElementById(dlId);
  if (!dl) return;

  // clear old options
  dl.innerHTML = '';

  if (typed.length === 0) {
    // nothing typed -> no suggestions
    return;
  }

  const typedLower = typed.toLowerCase();

  // first attempt exact match (case-insensitive)
  const exact = productsData.filter(p => (p.Title || '').trim().toLowerCase() === typedLower);
  if (exact.length > 0) {
    exact.forEach(p => {
      const opt = document.createElement('option');
      opt.value = (p["Variant SKU"] || '').replace(/^'/, '');
      dl.appendChild(opt);
    });
    return;
  }

  // otherwise fuzzy: include products where title includes typed substring
  const matches = productsData
    .filter(p => (p.Title || '').toLowerCase().includes(typedLower))
    .slice(0, 5); // max 5 suggestions

  matches.forEach(p => {
    const opt = document.createElement('option');
    opt.value = (p["Variant SKU"] || '').replace(/^'/, '');
    dl.appendChild(opt);
  });
}

// Prepare all existing rows on load
function initExistingRows() {
  const rows = document.querySelectorAll('.forecast-item');
  rows.forEach(row => prepareRow(row));
}

// Hook up cloning/add-row button so new rows get prepared
document.getElementById('addProduct')?.addEventListener('click', function () {
  // clone the first template item (your existing logic)
  const section = document.querySelector('.forecast-item');
  const clone = section.cloneNode(true);
  clone.querySelectorAll('input, textarea').forEach(el => el.value = '');
  document.getElementById('forecast-sections').appendChild(clone);

  // wait a tick for DOM to update, then prepare the new row
  setTimeout(() => {
    const all = document.querySelectorAll('.forecast-item');
    const newRow = all[all.length - 1];
    prepareRow(newRow);
  }, 50);
});

// Also defensive: if rows are added in some other way, observe
const container = document.getElementById('forecast-sections');
if (container) {
  const mo = new MutationObserver(muts => {
    muts.forEach(m => {
      m.addedNodes.forEach(node => {
        if (node.nodeType === 1 && node.classList.contains('forecast-item')) {
          prepareRow(node);
        }
      });
    });
  });
  mo.observe(container, { childList: true });
}
