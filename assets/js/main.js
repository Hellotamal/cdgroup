/* ==========================================================================
   CD GROUP - Minimalist Interactive JavaScript
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Division Filter Tabs
  const tabBtns = document.querySelectorAll('.east-tab');
  const productCards = document.querySelectorAll('.product-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      productCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  window.filterCategory = function(category) {
    const targetTab = document.querySelector(`.east-tab[data-filter="${category}"]`);
    if (targetTab) {
      targetTab.click();
    }
  };

  // Product Search Filter
  const productSearch = document.getElementById('productSearch');
  if (productSearch) {
    productSearch.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      productCards.forEach(card => {
        const title = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
        const desc = card.querySelector('.product-desc')?.textContent.toLowerCase() || '';
        const cat = card.getAttribute('data-category')?.toLowerCase() || '';

        if (title.includes(term) || desc.includes(term) || cat.includes(term)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  // RFQ Quote Cart / Inquiry Builder
  let rfqCart = [];
  const rfqCountBadges = document.querySelectorAll('.rfq-count');

  window.addToRFQ = function(productName, category, moq) {
    const existing = rfqCart.find(item => item.name === productName);
    if (existing) {
      existing.quantity += 1;
    } else {
      rfqCart.push({ name: productName, category, moq, quantity: 1 });
    }
    updateRFQCount();
    showToast(`Added "${productName}" to RFQ basket`);
  };

  function updateRFQCount() {
    rfqCountBadges.forEach(b => b.textContent = rfqCart.length);
  }

  // RFQ Modal Handlers
  const rfqModalOverlay = document.getElementById('rfqModalOverlay');
  const openRFQBtn = document.getElementById('openRFQBtn');
  const closeRFQBtn = document.getElementById('closeRFQBtn');
  const rfqItemsContainer = document.getElementById('rfqItemsContainer');

  if (openRFQBtn) {
    openRFQBtn.addEventListener('click', () => {
      renderRFQItems();
      rfqModalOverlay.classList.add('active');
    });
  }

  if (closeRFQBtn) {
    closeRFQBtn.addEventListener('click', () => {
      rfqModalOverlay.classList.remove('active');
    });
  }

  window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('active');
  };

  function renderRFQItems() {
    if (!rfqItemsContainer) return;
    if (rfqCart.length === 0) {
      rfqItemsContainer.innerHTML = `
        <div class="text-center py-6 text-gray-500">
          <i class="fa-solid fa-box-open text-4xl mb-3 text-gray-400"></i>
          <p class="font-medium">Your RFQ basket is empty.</p>
          <p class="text-xs text-gray-400 mt-1">Select products from the catalog to build your quotation inquiry.</p>
        </div>
      `;
      return;
    }

    let html = '<div class="space-y-3 mb-4">';
    rfqCart.forEach((item, index) => {
      html += `
        <div class="flex items-center justify-between p-3.5 bg-[#F4F5F0] rounded-xl border border-gray-200">
          <div>
            <h4 class="font-bold text-gray-900 text-sm">${item.name}</h4>
            <span class="text-xs text-gray-500">Division: ${item.category.toUpperCase()} | MOQ: ${item.moq}</span>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="changeQty(${index}, -1)" class="w-7 h-7 bg-white text-gray-800 rounded-lg hover:bg-gray-200 transition font-bold border border-gray-300">-</button>
            <span class="text-sm font-semibold">${item.quantity}</span>
            <button onclick="changeQty(${index}, 1)" class="w-7 h-7 bg-white text-gray-800 rounded-lg hover:bg-gray-200 transition font-bold border border-gray-300">+</button>
            <button onclick="removeItem(${index})" class="text-red-500 hover:text-red-700 ml-2 text-sm"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      `;
    });
    html += '</div>';
    rfqItemsContainer.innerHTML = html;
  }

  window.changeQty = function(index, delta) {
    if (rfqCart[index]) {
      rfqCart[index].quantity += delta;
      if (rfqCart[index].quantity <= 0) {
        rfqCart.splice(index, 1);
      }
      updateRFQCount();
      renderRFQItems();
    }
  };

  window.removeItem = function(index) {
    if (rfqCart[index]) {
      rfqCart.splice(index, 1);
      updateRFQCount();
      renderRFQItems();
    }
  };

  // RFQ Submission Form
  const rfqSubmitForm = document.getElementById('rfqSubmitForm');
  if (rfqSubmitForm) {
    rfqSubmitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(rfqSubmitForm);
      const name = formData.get('client_name');
      const company = formData.get('company_name');

      showToast(`Thank you ${name}! Your quotation request for ${company || 'your business'} has been received.`);
      rfqCart = [];
      updateRFQCount();
      if (rfqModalOverlay) rfqModalOverlay.classList.remove('active');
      rfqSubmitForm.reset();
    });
  }

  // Certificate Modal Preview
  window.openCertModal = function(certType) {
    const certModal = document.getElementById('certModal');
    const certTitle = document.getElementById('certTitle');
    const certContent = document.getElementById('certContent');

    if (!certModal) return;

    if (certType === 'gst') {
      certTitle.textContent = 'GST Registration Certificate';
      certContent.innerHTML = `
        <div class="space-y-4 text-left">
          <div class="p-4 bg-[#F4F5F0] rounded-xl border border-gray-200">
            <h4 class="text-gray-900 font-bold text-base mb-2">Government of India - Form GST REG-06</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
              <div><strong class="text-gray-900">Legal Name:</strong> CHANDRA DAS</div>
              <div><strong class="text-gray-900">Trade Name:</strong> C D GROUP</div>
              <div><strong class="text-gray-900">GSTIN:</strong> 18AULPD****A2Z8</div>
              <div><strong class="text-gray-900">Constitution:</strong> Proprietorship</div>
              <div><strong class="text-gray-900">State:</strong> Assam (781011)</div>
              <div><strong class="text-gray-900">Principal Place:</strong> Maligaon Gate No-3, Near HDFC Bank, Guwahati</div>
            </div>
          </div>
          <div class="text-center">
            <a href="assets/images/GST.pdf" target="_blank" class="btn-black text-xs"><i class="fa-solid fa-file-pdf mr-1"></i> View Official GST PDF Document</a>
          </div>
        </div>
      `;
    } else if (certType === 'trade') {
      certTitle.textContent = 'GMC Trade License';
      certContent.innerHTML = `
        <div class="space-y-4 text-left">
          <div class="p-4 bg-[#F4F5F0] rounded-xl border border-gray-200">
            <h4 class="text-gray-900 font-bold text-base mb-2">GMC License No: 17821062******61</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
              <div><strong class="text-gray-900">Firm Name:</strong> C D GROUP</div>
              <div><strong class="text-gray-900">Owner:</strong> Smt/Shri CHANDRA DAS</div>
              <div><strong class="text-gray-900">Valid Upto:</strong> 31 Mar 2027</div>
              <div><strong class="text-gray-900">Ward No:</strong> 4 (West Zone)</div>
              <div class="col-span-2"><strong class="text-gray-900">Categories:</strong> FMCG Distributors | Construction & Supply | Tea Packaging</div>
            </div>
          </div>
          <div class="text-center">
            <a href="assets/images/TL.pdf" target="_blank" class="btn-black text-xs"><i class="fa-solid fa-file-pdf mr-1"></i> View Official Trade License PDF</a>
          </div>
        </div>
      `;
    } else if (certType === 'udyam') {
      certTitle.textContent = 'MSME UDYAM Registration';
      certContent.innerHTML = `
        <div class="space-y-4 text-left">
          <div class="p-4 bg-[#F4F5F0] rounded-xl border border-gray-200">
            <h4 class="text-gray-900 font-bold text-base mb-2">UDYAM-AS-03-009****</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
              <div><strong class="text-gray-900">Enterprise Name:</strong> C D GROUP</div>
              <div><strong class="text-gray-900">Enterprise Type:</strong> Micro Enterprise</div>
              <div><strong class="text-gray-900">Major Activity:</strong> Trading & Manufacturing</div>
              <div><strong class="text-gray-900">Location:</strong> Kamrup Metro, Guwahati, Assam</div>
            </div>
          </div>
          <div class="text-center">
            <a href="assets/images/Udyam.pdf" target="_blank" class="btn-black text-xs"><i class="fa-solid fa-file-pdf mr-1"></i> View Official MSME Udyam PDF</a>
          </div>
        </div>
      `;
    }
    certModal.classList.add('active');
  };

  // Toast Function
  function showToast(message) {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.querySelector('.toast-msg').textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // Smooth Scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.add('hidden');
        }
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});
