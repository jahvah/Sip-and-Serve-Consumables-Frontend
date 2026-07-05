let currentUser = null;
const BASE_URL = "http://localhost:3000";

$(document).ready(function () {

    currentUser = JSON.parse(localStorage.getItem("user"));

    if (!currentUser) {
        alert("Please login first.");
        window.location.href = "/html/login.html";
        return;
    }

    if (!localStorage.getItem("token")) {
        alert("Session expired. Please login again.");
        window.location.href = "/html/login.html";
        return;
    }

    loadOrders();

});

/* =====================================
   LOAD CUSTOMER ORDERS
===================================== */

function loadOrders() {

    $.ajax({

        url: BASE_URL + "/api/orders/customer/" + currentUser.id,
        method: "GET",

        headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
        },

        success: function (res) {

            const orders = res.orders || [];

            if (orders.length === 0) {

                $("#noOrders").show();
                $("#ordersContainer").html("");

                return;

            }

            $("#noOrders").hide();

            let html = "";

            orders.forEach(order => {

                let total = 0;

                let rows = "";

                (order.orderlines || []).forEach(line => {

                    const qty = Number(line.quantity || 0);
                    const price = Number(line.item?.sell_price || 0);

                    const subtotal = qty * price;

                    total += subtotal;

                    rows += `
                        <tr>
                            <td>${line.item?.item_name || ""}</td>
                            <td>${qty}</td>
                            <td>₱${price.toFixed(2)}</td>
                            <td>₱${subtotal.toFixed(2)}</td>
                        </tr>
                    `;

                });

                let cancelButton = "";

                if (order.status === "Pending") {

                    cancelButton = `
                        <button
                            class="cancelBtn"
                            data-id="${order.orderinfo_id}">
                            Cancel Order
                        </button>
                    `;

                }

                html += `

                    <div class="orderCard">

                        <div class="orderHeader">

                            <h3>
                                Order #${order.orderinfo_id}
                            </h3>

                            <span class="status ${order.status}">
                                ${order.status}
                            </span>

                        </div>

                        <div class="orderInfo">

                            <p>
                                <strong>Date Placed:</strong>
                                ${formatDate(order.date_placed)}
                            </p>

                            <p>
                                <strong>Date Shipped:</strong>
                                ${formatDate(order.date_shipped)}
                            </p>

                            <p>
                                <strong>Date Delivered:</strong>
                                ${formatDate(order.date_delivered)}
                            </p>

                            <table>

                                <thead>

                                    <tr>
                                        <th>Item</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th>Subtotal</th>
                                    </tr>

                                </thead>

                                <tbody>

                                    ${rows}

                                </tbody>

                            </table>

                            <div class="totalRow">

                                Grand Total :
                                ₱${total.toFixed(2)}

                            </div>

                            <div class="actionArea">

                                ${cancelButton}

                            </div>

                        </div>

                    </div>

                `;

            });

            $("#ordersContainer").html(html);

        },

        error: function (xhr) {

            console.log(xhr);

            if (xhr.status === 401) {
                alert("Unauthorized. Please login again.");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/html/login.html";
                return;
            }

            alert(xhr.responseJSON?.message || "Failed to load orders.");

        }

    });

}

/* =====================================
   CANCEL ORDER
===================================== */

$(document).on("click", ".cancelBtn", function () {

    const orderId = $(this).data("id");

    if (!confirm("Are you sure you want to cancel this order?")) {
        return;
    }

    $.ajax({

        url: BASE_URL +
            "/api/orders/customer/" +
            currentUser.id +
            "/cancel/" +
            orderId,

        method: "PUT",

        headers: {
            Authorization: "Bearer " + localStorage.getItem("token")
        },

        success: function (res) {

            alert(res.message);

            loadOrders();

        },

        error: function (xhr) {

            if (xhr.status === 401) {
                alert("Unauthorized. Please login again.");
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/html/login.html";
                return;
            }

            alert(xhr.responseJSON?.message || "Unable to cancel order.");

        }

    });

});

/* =====================================
   FORMAT DATE
===================================== */

function formatDate(date) {

    if (!date)
        return "-";

    const d = new Date(date);

    return d.toLocaleDateString();

}