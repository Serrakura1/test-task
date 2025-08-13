document.addEventListener("DOMContentLoaded", function () {
  const productVariants = JSON.parse(document.getElementById("productVariantsData").textContent);

  const selects = Array.from(document.querySelectorAll("#variantForm select"));
  const addBtn = document.querySelector('[name="add"]');
  const userInfoForm = document.getElementById("userInfoForm");
  const priceWrapper = document.querySelector("[data-price-wrapper]");
  const priceCurrent = priceWrapper.querySelector("[data-price]");
  const priceOld = priceWrapper.querySelector("[data-compare-at-price]");
  const errorMessage = priceWrapper.querySelector(".error-message");

  function getSelectedOptions() {
    return selects.map((s) => s.value);
  }

  function findMatchingVariant(selected) {
    return productVariants.find((variant) => variant.options.every((opt, i) => opt === selected[i]));
  }

  function updateUI() {
    const selected = getSelectedOptions();
    const variant = findMatchingVariant(selected);

    if (variant) {
      priceCurrent.textContent = variant.price;
      if (variant.compare_at_price) {
        priceOld.style.display = "";
        priceOld.textContent = variant.compare_at_price;
      } else {
        priceOld.style.display = "none";
      }
      addBtn.disabled = !variant.available;
      addBtn.dataset.variantId = variant.id;
      errorMessage.style.display = "none";
    } else {
      errorMessage.style.display = "block";
      priceCurrent.textContent = "";
      priceOld.style.display = "none";
      addBtn.disabled = true;
      addBtn.removeAttribute("data-variant-id");
    }
  }

  selects.forEach((select, i) => {
    select.addEventListener("change", () => {
      updateUI();
    });
  });

  addBtn.addEventListener("click", function (event) {
    event.preventDefault();

    if (userInfoForm) {
      if (!userInfoForm.checkValidity()) {
        userInfoForm.reportValidity();
        return;
      }
    }

    const selected = getSelectedOptions();
    const variant = findMatchingVariant(selected);

    if (!variant) {
      alert("No available variants. Choose another.");
      return;
    }

    const properties = {};
    if (userInfoForm) {
      const formData = new FormData(userInfoForm);
      for (const [key, value] of formData.entries()) {
        if (value.trim() !== "") {
          properties[key] = value;
        }
      }
    }

    fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: variant.id,
        quantity: 1,
        properties: properties,
      }),
    })
      .then((res) => res.json())
      .then(() => {
        console.log(`Added product with properties: ${JSON.stringify(properties)}`);
        alert(`Product ${variant.id} has been added to cart.`);
        window.location.href = "/cart";
      })
      .catch((err) => {
        console.error(err);
        alert("Error by adding product to cart.");
      });
  });

  updateUI();

  // schedule popup
  const schedulePopup = document.querySelector(".fixed-schedule-popup");

  if (schedulePopup) {
    const schedulePopupContent = document.querySelector(".fixed-schedule-popup__content");
    const schedulePopupTrigger = document.querySelector(".popup-current-schedule");
    const schedulePopupCloser = document.querySelector(".fixed-schedule-popup__closer");

    schedulePopupTrigger.addEventListener("click", () => {
      schedulePopup.classList.add("active");
    });

    document.addEventListener("click", (e) => {
      if ((!schedulePopupContent.contains(e.target) && !schedulePopupTrigger.contains(e.target)) || e.target === schedulePopupCloser) {
        schedulePopup.classList.remove("active");
      }
    });
  }
});
