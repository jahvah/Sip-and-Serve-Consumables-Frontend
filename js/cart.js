const API = "http://localhost:3000";

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

                    $("#checkoutBtn").hide();
                    return;
                }

                cart.forEach(c => {

                    let item = c.Item;

                    let price = Number(item.sell_price);
                    let qty = Number(c.quantity);

                    let subtotal = price * qty;

                    total += subtotal;

                    let image = item.image
                    ? `${API}/${item.image}`
                    : "/img/no-image.png";

                    html += `
                        <div class="cart-item" data-id="${item.item_id}">


                            <img src="${image}">



                            <div class="cart-info">


                                <h3>
                                    ${item.item_name}
                                </h3>



                                <p class="price">
                                    ₱${price}
                                </p>



                                <div class="quantity-control">


                                    <button class="minus">

                                        <i class="fa-solid fa-minus"></i>

                                    </button>



                                    <span class="qty">

                                        ${qty}

                                    </span>



                                    <button class="plus">

                                        <i class="fa-solid fa-plus"></i>

                                    </button>


                                </div>



                                <p>
                                    Subtotal:
                                    <strong>
                                        ₱${subtotal}
                                    </strong>
                                </p>



                                <button class="remove-btn remove">

                                    <i class="fa-solid fa-trash"></i>

                                    Remove

                                </button>



                            </div>


                        </div>
                    `;
                });

                $("#cartContainer").html(html);
                $("#checkoutBtn").show();
                $("#totalPrice").html("Total : ₱" + total);

                // ======================
                // CREATE CHECKOUT BUTTON (ONLY ONCE)
                // ======================
                if ($("#checkoutBtn").length === 0) {

                    $("#totalPrice").after(`
                        <div id="checkoutSection">

                            <button 
                                id="checkoutBtn"
                                class="btn btn-primary">

                                <i class="fa-solid fa-credit-card"></i>

                                Proceed to Checkout

                            </button>

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