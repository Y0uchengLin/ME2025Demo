// === 產品資料（保留你的資料；會在渲染時自動規整 image_url 路徑） ===
const products = [
  {'name': 'T-Shirt',       'price': 25, 'gender': '男裝', 'category': '上衣',   'image_url': './static/img/T-Shirt.png'},
  {'name': 'Blouse',        'price': 30, 'gender': '女裝', 'category': '上衣',   'image_url': './static/img/Blouse.png'},
  {'name': 'Jeans',         'price': 50, 'gender': '通用', 'category': '褲/裙子', 'image_url': './static/img/Jeans.png'},
  {'name': 'Skirt',         'price': 40, 'gender': '女裝', 'category': '褲/裙子', 'image_url': './static/img/Skirt.png'},
  {'name': 'Sneakers',      'price': 60, 'gender': '通用', 'category': '鞋子',   'image_url': './static/img/Sneakers.png'},
  {'name': 'Leather Shoes', 'price': 80, 'gender': '男裝', 'category': '鞋子',   'image_url': './static/img/LeatherShoes.png'},
  {'name': 'Baseball Cap',  'price': 20, 'gender': '通用', 'category': '帽子',   'image_url': './static/img/BaseballCap.png'},
  {'name': 'Sun Hat',       'price': 25, 'gender': '女裝', 'category': '帽子',   'image_url': './static/img/SunHat.png'},
  {'name': 'Running Shoes', 'price': 85, 'gender': '通用', 'category': '鞋子',   'image_url': './static/img/RunningShoes.png'},
  {'name': 'Dress',         'price': 75, 'gender': '女裝', 'category': '上衣',   'image_url': './static/img/Dress.png'}
];

// === 登入/註冊表單事件 ===
document.addEventListener('DOMContentLoaded', () => {
    // 登入表單
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (!username || !password) {
                alert("請填寫帳號與密碼");
                return;
            }

            const response = await fetch('/page_login_', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();
            alert(result.message);

            if (result.status === 'success') {
                localStorage.setItem('username', username);
                window.location.href = '/index';
            }
        });
    }

    // 註冊表單
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('reg-username').value;
            const password = document.getElementById('reg-password').value;
            const email = document.getElementById('reg-email').value;

            if (!username || !password || !email) {
                alert("請填寫完整資料");
                return;
            }

            const response = await fetch('/page_register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, email })
            });

            const result = await response.json();
            alert(result.message);

            if (result.status === 'success') {
                window.location.href = '/page_login_';
            }
        });
    }
});


// === 顯示登入使用者與登出 ===
(function showUsername() {
  const userDiv = document.getElementById('user-display');
  if (!userDiv) return;

  const username = localStorage.getItem('username') || '未登入';
  userDiv.innerHTML = `👤 使用者：<strong>${username}</strong>`;

  const logoutLink = document.getElementById('logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('username');
      window.location.href = '/page_login_';
    });
  }
})();

// === 保證下單按鈕存在 ===
(function ensureOrderButton() {
  if (!document.getElementById('place-order')) {
    const wrap = document.createElement('div');
    wrap.className = 'footer-actions';
    wrap.style.position = 'fixed';
    wrap.style.left = '12px';
    wrap.style.bottom = '12px';
    wrap.style.background = '#fff';
    wrap.style.border = '1px solid #e5e7eb';
    wrap.style.borderRadius = '8px';
    wrap.style.padding = '10px 12px';
    wrap.style.boxShadow = '0 6px 18px rgba(0,0,0,.06)';
    wrap.style.zIndex = '20';

    const btn = document.createElement('button');
    btn.id = 'place-order';
    btn.textContent = '下單';
    btn.disabled = true;
    btn.style.background = '#2563eb';
    btn.style.color = '#fff';
    btn.style.border = 'none';
    btn.style.padding = '8px 14px';
    btn.style.borderRadius = '6px';
    btn.style.cursor = 'pointer';

    const span = document.createElement('span');
    span.id = 'cart-summary';
    span.style.marginLeft = '12px';
    span.style.color = '#475569';

    wrap.appendChild(btn);
    wrap.appendChild(span);
    document.body.appendChild(wrap);
  }
})();

// === row 狀態管理 ===
const rowState = new Map();

// === 圖片路徑規整 ===
function normalizeImg(url = '') {
  return url.replace(/\/{2,}/g, '/').replace('../static', './static');
}

// === 渲染產品表格 ===
function display_products(products_to_display) {
  const tbody = document.querySelector('#products table tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  for (let i = 0; i < products_to_display.length; i++) {
    const p = products_to_display[i];
    const key = `${p.name}-${i}`;
    if (!rowState.has(key)) rowState.set(key, { checked: false, qty: 0 });

    const state = rowState.get(key);
    const price = Number(p.price) || 0;
    const total = price * (state.qty || 0);
    const disableBtns = !state.checked;
    const qtyValue = state.checked ? state.qty : 0;

    const product_info = `
      <tr data-key="${key}">
        <td><input type="checkbox" class="row-check" ${state.checked ? 'checked' : ''}></td>
        <td><img src="${normalizeImg(p.image_url)}" alt="${p.name}" style="width:56px;height:56px;object-fit:cover;border:1px solid #e5e7eb;border-radius:6px;"></td>
        <td>${p.name}</td>
        <td data-price="${price}">${price.toLocaleString()}</td>
        <td>${p.gender}</td>
        <td>${p.category}</td>
        <td>
          <div class="qty" style="display:inline-flex;align-items:center;gap:6px;">
            <button type="button" class="btn-dec" ${disableBtns ? 'disabled' : ''}>-</button>
            <input type="number" class="qty-input" min="0" value="${qtyValue}" ${disableBtns ? 'disabled' : ''} style="width:64px;">
            <button type="button" class="btn-inc" ${disableBtns ? 'disabled' : ''}>+</button>
          </div>
        </td>
        <td class="row-total">${total.toLocaleString()}</td>
      </tr>
    `;
    tbody.insertAdjacentHTML('beforeend', product_info);
  }
  refreshSummary();
}

// === 篩選商品 ===
function apply_filter(products_to_filter) {
  const max_price = document.getElementById('max_price')?.value ?? '';
  const min_price = document.getElementById('min_price')?.value ?? '';
  const gender = document.getElementById('gender')?.value ?? 'All';

  const category_shirts = document.getElementById('shirts')?.checked ?? false;
  const category_pants  = document.getElementById('pants')?.checked ?? false;
  const category_shoes  = document.getElementById('shoes')?.checked ?? false;
  const category_cap    = document.getElementById('cap')?.checked ?? false;

  const result = [];
  for (let i = 0; i < products_to_filter.length; i++) {
    const price = Number(products_to_filter[i].price);
    let fit_price = true;
    if (min_price !== '') fit_price = price >= Number(min_price);
    if (fit_price && max_price !== '') fit_price = price <= Number(max_price);

    const g = products_to_filter[i].gender;
    let fit_gender = true;
    if (gender === 'Male') fit_gender = (g === '男裝' || g === '通用');
    else if (gender === 'Female') fit_gender = (g === '女裝' || g === '通用');

    const selectedCats = [];
    if (category_shirts) selectedCats.push('上衣');
    if (category_pants)  selectedCats.push('褲/裙子');
    if (category_shoes)  selectedCats.push('鞋子');
    if (category_cap)    selectedCats.push('帽子');

    const fit_category = (selectedCats.length === 0) || selectedCats.includes(products_to_filter[i].category);

    if (fit_price && fit_gender && fit_category) result.push(products_to_filter[i]);
  }
  display_products(result);
}

// === 綁定表格事件 ===
(function bindTableEvents() {
  const tbody = document.querySelector('#products table tbody');
  if (!tbody) return;

  tbody.addEventListener('click', (e) => {
    const tr = e.target.closest('tr');
    if (!tr) return;
    const key = tr.getAttribute('data-key');
    const st = rowState.get(key) || { checked: false, qty: 0 };

    const input = tr.querySelector('.qty-input');
    const btnDec = tr.querySelector('.btn-dec');
    const btnInc = tr.querySelector('.btn-inc');

    // checkbox
    if (e.target.classList.contains('row-check')) {
      st.checked = e.target.checked;
      if (st.checked) {
        if (st.qty === 0) st.qty = 1;
        input.value = st.qty;
        input.disabled = false;
        btnInc.disabled = false;
        btnDec.disabled = st.qty <= 1;
      } else {
        st.qty = 0;
        input.value = 0;
        input.disabled = true;
        btnInc.disabled = true;
        btnDec.disabled = true;
      }
      rowState.set(key, st);
      updateRowTotal(tr);
      refreshSummary();
      return;
    }

    // 減號
    if (e.target.classList.contains('btn-dec')) {
      let qty = Math.max(0, Number(input.value || 0) - 1);
      input.value = qty;
      st.qty = qty;
      btnDec.disabled = qty <= 1;
      btnInc.disabled = false;
      rowState.set(key, st);
      updateRowTotal(tr);
      refreshSummary();
      return;
    }

    // 加號
    if (e.target.classList.contains('btn-inc')) {
      let qty = Number(input.value || 0) + 1;
      input.value = qty;
      st.qty = qty;
      if (!st.checked) {
        st.checked = true;
        tr.querySelector('.row-check').checked = true;
        input.disabled = false;
      }
      btnDec.disabled = qty <= 1;
      btnInc.disabled = false;
      rowState.set(key, st);
      updateRowTotal(tr);
      refreshSummary();
      return;
    }
  });

  // 數量輸入
  tbody.addEventListener('input', (e) => {
    if (!e.target.classList.contains('qty-input')) return;
    const tr = e.target.closest('tr');
    const key = tr.getAttribute('data-key');
    const st = rowState.get(key) || { checked: false, qty: 0 };
    const v = Math.max(0, Number(e.target.value || 0));
    e.target.value = v;
    st.qty = v;
    const chk = tr.querySelector('.row-check');
    if (!chk.checked && v > 0) { chk.checked = true; st.checked = true; }
    rowState.set(key, st);
    updateRowTotal(tr);
    refreshSummary();
  });
})();

// === 更新小計 ===
function updateRowTotal(tr) {
  const price = Number(tr.querySelector('[data-price]')?.dataset?.price || 0);
  const qty = Number(tr.querySelector('.qty-input')?.value || 0);
  const totalCell = tr.querySelector('.row-total');
  if (totalCell) totalCell.textContent = (price * qty).toLocaleString();
}

// === 更新總計與下單按鈕 ===
function refreshSummary() {
  const tbody = document.querySelector('#products table tbody');
  if (!tbody) return;

  let selectedCount = 0, totalQty = 0, totalPrice = 0;

  tbody.querySelectorAll('tr').forEach(tr => {
    const chk = tr.querySelector('.row-check');
    const qty = Number(tr.querySelector('.qty-input')?.value || 0);
    const price = Number(tr.querySelector('[data-price]')?.dataset?.price || 0);
    if (chk?.checked && qty > 0) {
      selectedCount += 1;
      totalQty += qty;
      totalPrice += qty * price;
    }
  });

  const btnOrder = document.getElementById('place-order');
  if (btnOrder) btnOrder.disabled = !(selectedCount > 0 && totalQty > 0);

  const summaryEl = document.getElementById('cart-summary');
  if (summaryEl)
    summaryEl.textContent = `已選 ${selectedCount} 項、總數量 ${totalQty}、總金額 $${totalPrice.toLocaleString()}`;
}

// === 下單按鈕事件（送出後端或前端測試 alert） ===
(function bindOrderButton() {
  const btnOrder = document.getElementById('place-order');
  if (!btnOrder) return;

  btnOrder.addEventListener('click', async () => {
    const tbody = document.querySelector('#products table tbody');
    if (!tbody) return;

    const orderItems = [];
    tbody.querySelectorAll('tr').forEach(tr => {
      const chk = tr.querySelector('.row-check');
      if (!chk?.checked) return;

      const qty = Number(tr.querySelector('.qty-input')?.value || 0);
      if (qty <= 0) return;

      const name = tr.children[2]?.textContent?.trim() || '';
      const price = Number(tr.querySelector('[data-price]')?.dataset?.price || 0);

      orderItems.push({ name, price, qty });
    });

    if (!orderItems.length) return;

    // 送到後端
    const response = await fetch('/place_order', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({items: orderItems})
    });

    const result = await response.json();
    alert(result.message);
    display_products(products); // 下單後刷新
  });
})();

// === 首次渲染 ===
display_products(products);
