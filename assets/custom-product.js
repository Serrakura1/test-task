document.addEventListener('DOMContentLoaded', function () {
  const selects = document.querySelectorAll('#variantForm select');
  const addBtn = document.querySelector('[name="add"]');
  const userInfoForm = document.getElementById('userInfoForm');
  const priceWrapper = document.querySelector('[data-price-wrapper]');
  const priceCurrent = priceWrapper.querySelector('[data-price]');
  const priceOld = priceWrapper.querySelector('[data-compare-at-price]');

  function getSelectedOptions() {
    return Array.from(selects).map((s) => s.value);
  }

  function findMatchingVariant() {
    const selectedOptions = getSelectedOptions();
    return window.productVariants.find((variant) =>
      variant.options.every((opt, index) => opt === selectedOptions[index])
    );
  }

  function updateUI() {
    const variant = findMatchingVariant();

    if (variant) {
      priceCurrent.textContent = variant.price;
      if (variant.compare_at_price) {
        priceOld.style.display = '';
        priceOld.textContent = variant.compare_at_price;
      } else {
        priceOld.style.display = 'none';
      }
      addBtn.disabled = !variant.available;
      addBtn.dataset.variantId = variant.id;
    } else {
      priceCurrent.textContent = '';
      priceOld.style.display = 'none';
      addBtn.disabled = true;
      addBtn.removeAttribute('data-variant-id');
    }
  }

  selects.forEach((select) => select.addEventListener('change', updateUI));

  addBtn.addEventListener('click', function (event) {
    event.preventDefault();

    if (!userInfoForm.checkValidity()) {
      userInfoForm.reportValidity();
      return;
    }

    const formData = new FormData(userInfoForm);
    const properties = {};
    for (const [key, value] of formData.entries()) {
      if (value.trim() !== '') {
        properties[key] = value;
      }
    }

    const variant = findMatchingVariant();

    fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: variant.id,
        quantity: 1,
        properties: properties,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(`Added product with properties: ${JSON.stringify(properties)}`);
        alert(`Product ${variant.id} has been added to cart.`);
        window.location.href = '/cart';
      })
      .catch((err) => {
        console.error(err);
        alert('Error by adding product to cart.');
      });
  });

  updateUI();
});
