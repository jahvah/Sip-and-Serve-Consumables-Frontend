$(document).ready(function () {

    let user = localStorage.getItem("user");

    if (!user) {
        alert("Please login first");
        window.location.href = "/html/login.html";
        return;
    }

    let userData = JSON.parse(user);

    loadCart();

    // ======================
    // LOAD CART
    // ======================
    function loadCart() {

        $.ajax({
            url: `http://localhost:3000/api/cart/${userData.id}`,
            method: "GET",

            success: function (cart) {

                let html = "";
                let total = 0;

                if (!cart || cart.length === 0) {

                    $("#cartContainer").html("<h3>Your cart is empty.</h3>");
                    $("#totalPrice").html("Total : ₱0");

                    $("#checkoutSection").remove();
                    return;
                }

                cart.forEach(c => {

                    let item = c.Item;

                    let price = Number(item.sell_price);
                    let qty = Number(c.quantity);

                    let subtotal = price * qty;

                    total += subtotal;

                    let image = item.image;

                    html += `
                        <div class="cart-item" data-id="${item.item_id}">

                            <img src="${image}" width="100">

                            <div class="cart-details">

                                <h3>${item.item_name}</h3>

                                <p>₱${price}</p>

                                <button class="minus">-</button>

                                <span class="qty">${qty}</span>

                                <button class="plus">+</button>

                                <button class="remove">Remove</button>

                                <p>Subtotal : ₱${subtotal}</p>

                            </div>

                        </div>
                    `;
                });

                $("#cartContainer").html(html);
                $("#totalPrice").html("Total : ₱" + total);

                // ======================
                // CREATE CHECKOUT BUTTON (ONLY ONCE)
                // ======================
                if ($("#checkoutBtn").length === 0) {

                    $("#totalPrice").after(`
                        <div id="checkoutSection">
                            <br>
                            <button id="checkoutBtn">Checkout</button>
                        </div>
                    `);

                }
            }
        });
    }

    // ======================
    // PLUS
    // ======================
    $(document).on("click", ".plus", function () {

        let itemId = $(this).closest(".cart-item").data("id");

        updateCart(itemId, 1);

    });

    // ======================
    // MINUS
    // ======================
    $(document).on("click", ".minus", function () {

        let itemId = $(this).closest(".cart-item").data("id");

        updateCart(itemId, -1);

    });

    // ======================
    // REMOVE
    // ======================
    $(document).on("click", ".remove", function () {

        let itemId = $(this).closest(".cart-item").data("id");

        $.ajax({
            url: "http://localhost:3000/api/cart/remove",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                user_id: userData.id,
                item_id: itemId
            }),
            success: function () {
                loadCart();
            }
        });

    });

    // ======================
    // UPDATE CART
    // ======================
    function updateCart(itemId, change) {

        $.ajax({
            url: "http://localhost:3000/api/cart/update",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                user_id: userData.id,
                item_id: itemId,
                change: change
            }),
            success: function () {
                loadCart();
            }
        });

    }

    // ======================
    // CHECKOUT
    // ======================
    $(document).on("click", "#checkoutBtn", function () {

        $.ajax({
            url: "http://localhost:3000/api/checkout",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                user_id: userData.id
            }),
            success: function (res) {

                alert(res.message);

                loadCart(); // refresh after checkout

            },
            error: function (err) {
                console.log(err);
            }
        });

    });

});