document.addEventListener("DOMContentLoaded", function () {

  /* ============================================================
     1. ACCORDION LOGIC (Open/Close Categories)
  ============================================================ */
  const accordions = document.querySelectorAll(".accordion-header");

  accordions.forEach((header) => {
    header.addEventListener("click", () => {
      // Toggle the active class on the header
      header.classList.toggle("active");

      // Select the content body (next sibling)
      const body = header.nextElementSibling;

      // Toggle max-height for smooth slide animation
      if (header.classList.contains("active")) {
        // Set to scrollHeight to allow full expansion
        body.style.maxHeight = body.scrollHeight + "px";
      } else {
        body.style.maxHeight = "0px";
      }
    });
  });

  /* ============================================================
     2. ROW SELECTION & QUANTITY LOGIC
  ============================================================ */
  const itemRows = document.querySelectorAll(".item-row");

  itemRows.forEach((row) => {
    // Elements within the row
    const checkbox = row.querySelector(".real-checkbox");
    const qtyDisplay = row.querySelector(".qty-display");
    const minusBtn = row.querySelector(".minus");
    const plusBtn = row.querySelector(".plus");

    // A. ROW CLICK (Toggle Selection)
    row.addEventListener("click", (e) => {
      // Prevent toggling if user clicked the quantity buttons
      if (e.target.closest(".qty-control")) return;

      // Toggle visual state
      row.classList.toggle("selected");

      // Sync the hidden checkbox
      checkbox.checked = row.classList.contains("selected");

      // If deselected, reset quantity to 1 visually (optional, feels cleaner)
      if (!checkbox.checked) {
        qtyDisplay.innerText = "1";
      }

      // Recalculate Totals
      updateSummary();
    });

    // B. PLUS BUTTON
    plusBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Stop click from bubbling to row
      let currentQty = parseInt(qtyDisplay.innerText);
      currentQty++;
      qtyDisplay.innerText = currentQty;
      updateSummary();
    });

    // C. MINUS BUTTON
    minusBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Stop click from bubbling to row
      let currentQty = parseInt(qtyDisplay.innerText);
      
      if (currentQty > 1) {
        currentQty--;
        qtyDisplay.innerText = currentQty;
        updateSummary();
      } else {
        // Optional: If clicking minus at 1, do you want to deselect? 
        // Current logic: Stay at 1. Users can deselect by clicking the row.
      }
    });
  });

  /* ============================================================
     3. PRICE CALCULATION ENGINE
  ============================================================ */
  function updateSummary() {
    let minTotal = 0;
    let maxTotal = 0;
    let selectedItemsArray = [];

    // Loop through all rows to find selected ones
    const activeRows = document.querySelectorAll(".item-row.selected");

    activeRows.forEach((row) => {
      const checkbox = row.querySelector(".real-checkbox");
      const title = checkbox.dataset.title;
      const priceRaw = checkbox.dataset.price; // e.g., "249-449"
      const qty = parseInt(row.querySelector(".qty-display").innerText);

      // Parse Price String
      // Removes commas just in case (e.g. "1,200") and splits by "-"
      const [minStr, maxStr] = priceRaw.split("-");
      const minPrice = parseInt(minStr.replace(/,/g, "")) || 0;
      const maxPrice = parseInt(maxStr.replace(/,/g, "")) || 0;

      // Math
      minTotal += minPrice * qty;
      maxTotal += maxPrice * qty;

      // Add to Summary List
      selectedItemsArray.push(`${title} (x${qty})`);
    });

    // Update the Sticky Bar UI
    const summaryPriceEl = document.getElementById("summary-price");
    
    // Formatting currency to Indian Locale (₹ 1,200)
    const fmt = (num) => num.toLocaleString("en-IN");

    if (activeRows.length === 0) {
      summaryPriceEl.textContent = "₹0 – ₹0 /mo";
    } else {
      summaryPriceEl.textContent = `₹${fmt(minTotal)} – ₹${fmt(maxTotal)} /mo`;
    }

    // Update the Hidden Input Field for Form Submission
    const hiddenInput = document.getElementById("hidden-items");
    if (hiddenInput) {
      hiddenInput.value = selectedItemsArray.join(", ");
    }
  }

/* =========================================
   REAL NETLIFY FORM SUBMISSION
   ========================================= */
const form = document.querySelector("form"); // Auto-detects the form
const popup = document.getElementById("success-popup"); // Ensure ID matches your HTML

if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault(); // Stop page reload

    const btn = form.querySelector("button[type='submit']");
    const originalText = btn.innerText;

    // 1. Show Loading State
    btn.innerText = "Sending...";
    btn.style.opacity = "0.7";

    // 2. Collect Data
    const formData = new FormData(form);

    // 3. Send to Netlify via Fetch
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    })
      .then(() => {
        // SUCCESS: Show Popup
        if (popup) popup.classList.add("active");
        
        // Reset Button
        btn.innerText = originalText;
        btn.style.opacity = "1";
        
        // Reset Form
        form.reset();
      })
      .catch((error) => {
        // ERROR: Handle network errors
        console.error("Submission error:", error);
        btn.innerText = "Error! Try Again";
        setTimeout(() => {
          btn.innerText = originalText;
          btn.style.opacity = "1";
        }, 3000);
      });
  });
}


});
  /* ============================================================
     5. POPUP LOGIC (Add this to your existing script.js)
  ============================================================ */
  const popupOverlay = document.getElementById("success-popup");
  const closePopupBtn = document.getElementById("close-popup-btn");
  const enquiryForm = document.getElementById("enquiry-form");

  // Close Popup Event
  if (closePopupBtn) {
    closePopupBtn.addEventListener("click", function () {
      popupOverlay.classList.remove("active");
    });
  }

  // Close if clicking outside the card (on the blurred background)
  if (popupOverlay) {
    popupOverlay.addEventListener("click", function (e) {
      if (e.target === popupOverlay) {
        popupOverlay.classList.remove("active");
      }
    });
  }
function toggleMenu() {
    const links = document.getElementById("navLinks");
    links.classList.toggle("active");
  }
  
  document.addEventListener("DOMContentLoaded", function () {
  
  if (window.lucide) lucide.createIcons();

  /* --- 3. SUMMARY & NETLIFY DATA CAPTURE --- */
  function updateSummary() {
    let minTotal = 0;
    let maxTotal = 0;
    let itemsList = []; // This stores the text for the form

    const activeRows = document.querySelectorAll(".item-row.selected");

    activeRows.forEach((row) => {
      const checkbox = row.querySelector(".real-checkbox");
      const title = checkbox.dataset.title || "Item"; // Fallback name
      
      // Parse Price "249-449" or just "249"
      const priceRaw = checkbox.dataset.price || "0"; 
      const [minStr, maxStr] = priceRaw.split("-");
      const minPrice = parseInt(minStr) || 0;
      const maxPrice = parseInt(maxStr) || minPrice;

      const qty = parseInt(row.querySelector(".qty-display").innerText);

      // Math
      minTotal += minPrice * qty;
      maxTotal += maxPrice * qty;

      // Create String: "Single Bed (x2) [₹249-449]"
      itemsList.push(`${title} (x${qty}) [₹${minPrice}-${maxPrice}]`);
    });

    // A. Update the Visual Sticky Bar (Bottom of screen)
    const summaryPriceEl = document.getElementById("summary-price");
    const fmt = (num) => num.toLocaleString("en-IN");
    
    if (activeRows.length === 0) {
      summaryPriceEl.textContent = "₹0 – ₹0 /mo";
    } else {
      summaryPriceEl.textContent = `₹${fmt(minTotal)} – ₹${fmt(maxTotal)} /mo`;
    }

    // B. UPDATE THE HIDDEN INPUTS (For Netlify)
    const hiddenItems = document.getElementById("hidden-items");
    const hiddenPrice = document.getElementById("hidden-price");

    if (hiddenItems) {
      hiddenItems.value = itemsList.length > 0 ? itemsList.join(",  ") : "No items selected";
    }
    if (hiddenPrice) {
      hiddenPrice.value = `₹${fmt(minTotal)} - ₹${fmt(maxTotal)}`;
    }
  }

  /* --- 4. FORM SUBMISSION --- */
  const form = document.getElementById("enquiry-form");
  const popup = document.getElementById("success-popup");
  const closeBtn = document.getElementById("close-popup-btn");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const btn = form.querySelector("button[type='submit']");
      const originalText = btn.innerHTML;
      btn.innerHTML = "Processing...";
      btn.style.opacity = "0.7";

      const formData = new FormData(form);

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      })
      .then(() => {
        // Success Logic
        if(popup) popup.classList.add("active");
        form.reset();
        btn.innerHTML = originalText;
        btn.style.opacity = "1";
        
        // Deselect items visually
        document.querySelectorAll('.item-row.selected').forEach(r => {
          r.classList.remove('selected');
          r.querySelector('.real-checkbox').checked = false;
        });
        updateSummary();
      })
      .catch((error) => {
        alert("Something went wrong. Please check your connection.");
        btn.innerHTML = originalText;
        btn.style.opacity = "1";
      });
    });
  }

  // Close Popup Event
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      popup.classList.remove("active");
    });
  }
});

/* ============================================================
   DATA CAPTURE: SENDS FULL CART DETAILS TO NETLIFY
   ============================================================ */
document.getElementById('enquiry-form').addEventListener('submit', function(e) {
  
  // 1. Initialize the List
  let orderDetails = "--- CUSTOM PLAN SELECTION ---\n";
  let hasItems = false;

  // 2. Find every checkbox the user actually ticked
  // Your HTML uses class="real-checkbox" for data storage
  const selectedBoxes = document.querySelectorAll('.real-checkbox:checked');
  
  if (selectedBoxes.length > 0) {
    selectedBoxes.forEach(box => {
      // Go up to the parent row to find the Quantity number
      const row = box.closest('.item-row');
      const qty = row.querySelector('.qty-display').innerText.trim();
      
      // Get Name and Price from the checkbox attributes
      const name = box.getAttribute('data-title');
      const priceRange = box.getAttribute('data-price');
      
      // Format: "• Queen Bed (Qty: 2) | Price: ₹599-999"
      orderDetails += `• ${name} (Qty: ${qty}) | Price: ₹${priceRange}\n`;
      hasItems = true;
    });
  } else {
    orderDetails += "No specific items selected (General Enquiry)";
  }

  // 3. Grab the Final Total Estimate text
  const finalTotal = document.getElementById('summary-price').innerText;

  // 4. Fill the Hidden Inputs (This is what Netlify reads)
  document.getElementById('hidden-items').value = orderDetails;
  document.getElementById('hidden-total').value = finalTotal;

  // The form now proceeds to submit with all data attached!
});
