window.onload = function () {
    let checkAll = document.getElementById("check_all");
    let checkItems = document.querySelectorAll(".check_item");

    checkAll.addEventListener("change", function () {
        checkItems.forEach(c => c.checked = checkAll.checked);
        calcTotal();
    });


    checkItems.forEach(c => {
        c.addEventListener("change", function () {
            let allChecked = Array.from(checkItems).every(c => c.checked);
            checkAll.checked = allChecked;
            calcTotal();
        });
    });

    let plusBtns = document.querySelectorAll(".plus");
    let minusBtns = document.querySelectorAll(".minus");

    plusBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            let row = this.closest("tr");
            let qtyInput = row.querySelector(".qty");
            let stock = parseInt(row.querySelector(".stock").textContent.replace(/[^0-9]/g, ''));
            let qty = parseInt(qtyInput.value);

            if (qty < stock) {
                qty++;
                qtyInput.value = qty;
                updateSubtotal(row);
                calcTotal();
            }
        });
    });

    minusBtns.forEach(btn => {
        btn.addEventListener("click", function () {
            let row = this.closest("tr");
            let qtyInput = row.querySelector(".qty");
            let qty = parseInt(qtyInput.value);

            if (qty > 1) {
                qty--;
                qtyInput.value = qty;
                updateSubtotal(row);
                calcTotal();
            }
        });
    });
    let qtyInputs = document.querySelectorAll(".qty");
    qtyInputs.forEach(input => {
        input.addEventListener("blur", function () {
            let row = this.closest("tr");
            let stock = parseInt(row.querySelector(".stock").textContent.replace(/[^0-9]/g, ''));
            let qty = parseInt(this.value);

            // 驗證數字
            if (isNaN(qty) || qty < 1) {
                qty = 1;
            } else if (qty > stock) {
                qty = stock;
            }

            this.value = qty;
            updateSubtotal(row);
            calcTotal();
        });
    });
};



function updateSubtotal(row) {
    let price = parseInt(row.querySelector(".price").textContent);
    let qty = parseInt(row.querySelector(".qty").value);
    row.querySelector(".subtotal").textContent = price * qty;
}

function calcTotal() {
    let rows = document.querySelectorAll("tbody tr");
    let total = 0;
    rows.forEach(row => {
        let checkbox = row.querySelector(".check_item");
        if (checkbox.checked) {
            let subtotal = parseInt(row.querySelector(".subtotal").textContent);
            total += subtotal;
        }
    });
    document.getElementById("total").textContent = total;
}
