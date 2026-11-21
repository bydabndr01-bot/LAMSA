/* =================================
LAMSA - MAIN JAVASCRIPT
================================= */

// مفتاح تخزين السلة
const CART_KEY = "lamsa_cart";

// =================================
// GET CART - جلب السلة
// =================================

function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem(CART_KEY));
        return Array.isArray(cart) ? cart : [];
    } catch (error) {
        return [];
    }
}

// =================================
// SAVE CART - حفظ السلة
// =================================

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// =================================
// TOAST NOTIFICATION
// =================================

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// =================================
// CART COUNT - عداد السلة
// =================================

function updateCartCount() {
    const cart = getCart();

    const totalQuantity = cart.reduce((total, product) => {
        return total + Number(product.quantity || 0);
    }, 0);

    const cartCount = document.getElementById("cart-count");

    if (cartCount) {
        cartCount.textContent = totalQuantity;
    }
}

// =================================
// ADD TO CART - إضافة منتج
// =================================

function addToCart(button) {
    const id = button.dataset.id;
    const name = button.dataset.name;
    const price = Number(button.dataset.price);
    const image = button.dataset.image || "";

    if (!id  || !name || !Number.isFinite(price) || price < 0) {
        showToast("تعذر إضافة المنتج، يرجى المحاولة مرة أخرى");
        return;
    }

    let cart = getCart();

    const existingProduct = cart.find(product => {
        return String(product.id) === String(id);
    });

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }

    saveCart(cart);
    updateCartCount();
    renderCart();

    showToast("تمت إضافة " + name + " إلى السلة ✓");
}

// =================================
// RENDER CART - عرض السلة
// =================================


function renderCart() {
    const cartItems = document.getElementById("cart-items");

    if (!cartItems) return;

    const cart = getCart();

    const cartItemsCount = document.getElementById("cart-items-count");
    const summaryQuantity = document.getElementById("summary-quantity");
    const subtotalElement = document.getElementById("cart-subtotal");
    const totalElement = document.getElementById("cart-total");
    const shippingElement = document.getElementById("shipping-cost");

    // حساب عدد المنتجات
    const totalQuantity = cart.reduce((total, product) => {
        return total + Number(product.quantity || 0);
    }, 0);

    // حساب المجموع
    const subtotal = cart.reduce((total, product) => {
        return total + Number(product.price) * Number(product.quantity);
    }, 0);

    const shipping = 0;
    const total = subtotal + shipping;

    // تحديث ملخص الطلب
    if (cartItemsCount) {
        cartItemsCount.textContent = totalQuantity + " منتجات";
    }

    if (summaryQuantity) {
        summaryQuantity.textContent = totalQuantity;
    }

    if (subtotalElement) {
        subtotalElement.textContent = subtotal.toFixed(2) + " ر.س";
    }

    if (shippingElement) {
        shippingElement.textContent = "مجاني";
    }

    if (totalElement) {
        totalElement.textContent = total.toFixed(2) + " ر.س";
    }

    // إذا كانت السلة فارغة
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛍️</div>
                <h2>سلتك فارغة حالياً</h2>
                <p>
                    لم تضيفي أي عطر إلى سلتك بعد.
                    اكتشفي مجموعتنا واختاري عطرك المفضل.
                </p>
                <a href="perfums.html" class="btn">
                    ابدئي التسوق
                </a>
            </div>
        `;
        return;
    }

    // عرض المنتجات الموجودة في السلة
    cartItems.innerHTML = cart.map(product => {
        return `
            <div class="cart-item">
                <img
                    src="${escapeHTML(product.image || "")}"
                    alt="${escapeHTML(product.name)}">

                <div class="cart-item-info">
                    <h3>${escapeHTML(product.name)}</h3>

                    <p>
                        ${Number(product.price).toFixed(2)} ر.س
                    </p>

                    <div class="quantity-controls">
                        <button
                            type="button"
                            data-action="increase"
                            data-id="${escapeHTML(product.id)}">
                            +
                        </button>

                        <span>${product.quantity}</span>

                        <button
                            type="button"
                            data-action="decrease"
                            data-id="${escapeHTML(product.id)}">
                            −
                        </button>
                    </div>

                    <button
                        type="button"
                        class="remove-item"
                        data-action="remove"
                        data-id="${escapeHTML(product.id)}">
                        حذف المنتج
                    </button>
                </div>
            </div>
        `;
    }).join("");
}


// =================================
// ESCAPE HTML - حماية النصوص
// =================================

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const characters = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return characters[character];
    });
}

// =================================
// CHANGE QUANTITY - تغيير الكمية
// =================================

function changeQuantity(id, action) {
    let cart = getCart();

    const product = cart.find(item => {
        return String(item.id) === String(id);
    });

    if (!product) return;

    if (action === "increase") {
        product.quantity++;
    }

    if (action === "decrease") {
        product.quantity--;

        if (product.quantity <= 0) {
            cart = cart.filter(item => {
                return String(item.id) !== String(id);
            });
        }
    }

    saveCart(cart);
    updateCartCount();
    renderCart();
}

// =================================
// REMOVE PRODUCT - حذف منتج
// =================================

function removeProduct(id) {
    let cart = getCart();

    cart = cart.filter(product => {
        return String(product.id) !== String(id);
    });

    saveCart(cart);
    updateCartCount();
    renderCart();

    showToast("تم حذف المنتج من السلة");
}

// =================================
// CLEAR CART - إفراغ السلة
// =================================

function clearCart() {
    const cart = getCart();

    if (cart.length === 0) {
        showToast("السلة فارغة بالفعل");
        return;
    }

    const confirmed = confirm("هل تريدين إفراغ سلة التسوق؟");

    if (!confirmed) return;

    saveCart([]);
    updateCartCount();
    renderCart();

    showToast("تم إفراغ السلة بنجاح");
}

// =================================
// PRODUCT FILTER - تصفية المنتجات
// =================================

function filterProducts(category) {
    const products = document.querySelectorAll(
        ".product-card[data-category], .product[data-category]"
    );

    products.forEach(product => {
        const productCategory = product.dataset.category;
if (
            category === "الكل" ||
            category === "all" ||
            productCategory === category
        ) {
            product.style.display = "";
        } else {
            product.style.display = "none";
        }
    });
}

// =================================
// CONTACT FORM - نموذج التواصل
// =================================

function setupContactForm() {
    const contactForm = document.getElementById("contact-form");

    if (!contactForm) return;

    contactForm.addEventListener("submit", function(event) {
        event.preventDefault();

        if (!contactForm.checkValidity()) {
            contactForm.reportValidity();
            return;
        }

        const successMessage = document.getElementById("contact-success");

        if (successMessage) {
            successMessage.style.display = "block";
        }

        contactForm.reset();
    });
}

// =================================
// CHECKOUT - إتمام الطلب
// =================================

function setupCheckout() {
    const checkoutButton = document.getElementById("checkout-btn");

    if (!checkoutButton) return;

    checkoutButton.addEventListener("click", function() {
        const cart = getCart();

        if (cart.length === 0) {
            showToast("سلة التسوق فارغة");
            return;
        }

        showToast("سيتم تفعيل إتمام الطلب بعد ربط نظام الدفع");
    });
}

// =================================
// EVENT LISTENERS - أزرار الموقع
// =================================

document.addEventListener("click", function(event) {

    // إضافة منتج إلى السلة
    const addButton = event.target.closest(".add-to-cart");

    if (addButton) {
        addToCart(addButton);
        return;
    }

    // أزرار التحكم بالسلة
    const cartButton = event.target.closest("[data-action]");

    if (cartButton) {
        const action = cartButton.dataset.action;
        const id = cartButton.dataset.id;

        if (action === "increase" || action === "decrease") {
            changeQuantity(id, action);
        } else if (action === "remove") {
            removeProduct(id);
        }

        return;
    }

    // أزرار تصفية المنتجات
    const filterButton = event.target.closest("[data-filter]");

    if (filterButton) {
        const category = filterButton.dataset.filter;

        filterProducts(category);

        document.querySelectorAll("[data-filter]").forEach(button => {
            button.classList.remove("active");
        });

        filterButton.classList.add("active");
    }
});

// =================================
// DOM CONTENT LOADED
// تشغيل الوظائف بعد تحميل الصفحة
// =================================

document.addEventListener("DOMContentLoaded", function() {

    updateCartCount();
    renderCart();
    setupContactForm();
    setupCheckout();

    // زر إفراغ السلة
    const clearButton = document.getElementById("clear-cart");

    if (clearButton) {
        clearButton.addEventListener("click", clearCart);
    }

});