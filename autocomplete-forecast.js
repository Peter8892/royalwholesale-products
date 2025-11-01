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
