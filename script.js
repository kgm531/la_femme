function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

/* ====================== 🛒 إدارة السلة ====================== */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// ✅ تأكد أن الأسعار أرقام
cart = cart.map(item => ({
    ...item,
    price: parseFloat(item.price),
    quantity: parseInt(item.quantity) || 1
}));

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// 🎯 زر "إضافة إلى السلة" (داخل/خارج النافذة) - Event Delegation
document.body.addEventListener("click", function (e) {
    if (e.target.classList.contains("add-to-cart")) {
        const productCard = e.target.closest(".product-card") || e.target.closest(".modal-content");
        if (!productCard) return;

        const name = productCard.dataset.name;
        const price = parseFloat(productCard.dataset.price);
        const img = productCard.dataset.img;

        const existing = cart.find(item => item.name === name);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ name, price, quantity: 1, img });
        }

        saveCart();
        renderCart();
        updateCartCount();
        openCart();
    }
});

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;

    cartItems.innerHTML = '';

    cart.forEach((item, index) => {
        const li = document.createElement('li');
        li.classList.add('cart-item');

        li.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="item-details">
              <strong>${item.name}</strong> - ${item.price.toFixed(2)} EG
              <div class="quantity-control">
                <button class="decrease" data-index="${index}">-</button>
                <span>${item.quantity}</span>
                <button class="increase" data-index="${index}">+</button>
                <button class="remove" data-index="${index}">🗑️</button>
              </div>
            </div>
        `;

        cartItems.appendChild(li);
    });

    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = totalPrice * 0.10;
    const discountedPrice = totalPrice - discount;

    const totalPriceElement = document.getElementById('total-price');
    if (totalPriceElement) {
        totalPriceElement.textContent = `السعر الإجمالي بعد الخصم: ${discountedPrice.toFixed(2)} EG`;
    }

    // أزرار التحكم
    document.querySelectorAll('#cart-items button.decrease').forEach(btn => {
        btn.onclick = () => updateQuantity(+btn.dataset.index, -1);
    });
    document.querySelectorAll('#cart-items button.increase').forEach(btn => {
        btn.onclick = () => updateQuantity(+btn.dataset.index, 1);
    });
    document.querySelectorAll('#cart-items button.remove').forEach(btn => {
        btn.onclick = () => removeItem(+btn.dataset.index);
    });
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart();
    renderCart();
    updateCartCount();
}

function removeItem(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
    updateCartCount();
}

// ✅ checkout button
const checkoutBtn = document.getElementById('checkout');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('السلة فارغة!');
            return;
        }

        let message = '*🛒 طلب جديد من المتجر:*\n\n';
        const githubBaseUrl = 'https://raw.githubusercontent.com/kgm531/la_femme/refs/heads/main/';

        cart.forEach(item => {
            const fullImgUrl = githubBaseUrl + item.img;
            message += `🛍️ *${item.name}*\nالكمية: ${item.quantity}\nالسعر: ${item.price.toFixed(2)} EG\n🖼️ الصورة: ${fullImgUrl}\n\n`;
        });

        const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discount = totalPrice * 0.10;
        const discountedPrice = totalPrice - discount;
        message += `\n*💵 السعر الإجمالي قبل الخصم: ${totalPrice.toFixed(2)} EG*`;
        message += `\n*🔻 خصم 10%: ${discount.toFixed(2)} EG*`;
        message += `\n*💰 السعر بعد الخصم: ${discountedPrice.toFixed(2)} EG*`;

        const cartPopup = document.getElementById('cart-popup');
        if (cartPopup) cartPopup.classList.remove('open');

        openConfirmation(message);
    });
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = count;
        cartCount.style.display = count > 0 ? 'inline' : 'none';
    }
}

// ✅ cart popup toggle
const cartIcon = document.getElementById('cart-icon');
const cartPopup = document.getElementById('cart-popup');
if (cartIcon && cartPopup) {
    cartIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        cartPopup.classList.toggle('open');
    });

    document.addEventListener('click', () => {
        cartPopup.classList.remove('open');
    });

    cartPopup.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

function openCart() {
    if (cartPopup) cartPopup.classList.add('open');
}

/* ====================== 🖼️ نافذة المنتج ====================== */
document.addEventListener("DOMContentLoaded", function () {
    const modal = document.createElement("div");
    modal.className = "product-modal";
    modal.style.display = "none";
    document.body.appendChild(modal);

    renderCart();
    updateCartCount();

    function closeModal() {
        modal.style.display = "none";
        modal.innerHTML = "";
        document.body.classList.remove("no-scroll");
    }

    function openModal(productCard) {
        const name = productCard.dataset.name;
        const price = parseFloat(productCard.dataset.price);
        const img = productCard.dataset.img;
        const sectionId = productCard.dataset.section;

        const section = document.querySelector(`.products-container[data-section="${sectionId}"]`);
        const similarProducts = section ? Array.from(section.querySelectorAll(".product-card"))
            .filter(p => p !== productCard)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3) : [];

        modal.innerHTML = `
          <div class="modal-content" data-name="${name}" data-price="${price}" data-img="${img}">
            <span class="close-btn">&times;</span>
            <div class="modal-main-section">
              <div class="modal-image-container">
                <img src="${img}" alt="${name}" class="main-image" />
              </div>
              <div class="modal-details">
                <h2>${name}</h2>
                <p class="modal-price">السعر: EG ${price}</p>
                <button class="add-to-cart">إضافة إلى السلة</button>
                <h3>منتجات مشابهة</h3>
                <div class="similar-products">
                  ${similarProducts.map(sim => `
                    <div class="similar-item" 
                         data-name="${sim.dataset.name}" 
                         data-price="${sim.dataset.price}" 
                         data-img="${sim.dataset.img}" 
                         data-section="${sim.dataset.section}">
                      <img src="${sim.dataset.img}" alt="${sim.dataset.name}" />
                      <p>${sim.dataset.name}</p>
                      <span>EG ${sim.dataset.price}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        `;

        modal.style.display = "flex";
        document.body.classList.add("no-scroll");
    }

    // فتح نافذة المنتج عند الضغط
    document.body.addEventListener("click", function (e) {
        if (e.target.classList.contains("add-to-cart")) return;
        const productCard = e.target.closest(".product-card");
        if (productCard) openModal(productCard);
    });

    // منتجات مشابهة
    modal.addEventListener("click", function (e) {
        if (e.target.classList.contains("close-btn")) {
            closeModal();
        }
        const simItem = e.target.closest(".similar-item");
        if (simItem) {
            const fakeCard = document.createElement("div");
            fakeCard.className = "product-card";
            fakeCard.dataset.name = simItem.dataset.name;
            fakeCard.dataset.price = simItem.dataset.price;
            fakeCard.dataset.img = simItem.dataset.img;
            fakeCard.dataset.section = simItem.dataset.section;
            openModal(fakeCard);
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeModal();
    });
});

/* ====================== ✅ صفحة التأكيد ====================== */
let currentOrderMessage = '';

function openConfirmation(message) {
    currentOrderMessage = message;
    const confirmPage = document.getElementById('confirmationPage');
    if (confirmPage) confirmPage.style.display = 'flex';
}

function closeConfirmation() {
    const confirmPage = document.getElementById('confirmationPage');
    if (confirmPage) confirmPage.style.display = 'none';
}

function sendOrder() {
    const address = document.getElementById('userAddress')?.value.trim();
    const phone = document.getElementById('userPhone')?.value.trim();
    const notes = document.getElementById('userNotes')?.value.trim();

    if (!address || !phone) {
        alert("يرجى إدخال العنوان ورقم الموبايل.");
        return;
    }

    let finalMessage = `${currentOrderMessage}\n\n📍 العنوان: ${address}\n📞 رقم الهاتف: ${phone}`;
    if (notes) {
        finalMessage += `\n📝 ملاحظات: ${notes}`;
    }

    const whatsappUrl = `https://wa.me/201017102110?text=${encodeURIComponent(finalMessage)}`;
    window.open(whatsappUrl, '_blank');
    closeConfirmation();
}
