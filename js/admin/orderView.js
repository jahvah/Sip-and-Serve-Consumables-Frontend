let table;
let currentOrder = null;

/* =========================
INIT
========================= */
$(document).ready(function () {

    const savedMode = localStorage.getItem("orderViewMode") || "pagination";
    $("#viewMode").val(savedMode);

    loadOrders();
    loadCustomers();

    $("#viewMode").change(function () {
        localStorage.setItem("orderViewMode", $(this).val());
        loadOrders();
    });

    $("#openCreateModal").click(() => {
        clearCreateForm();
        $("#createModal").fadeIn();
    });

    $("#closeCreate").click(() => $("#createModal").fadeOut());

    $("#saveCreate").click(createOrder);
    $("#saveEdit").click(updateOrder);

    $("#addCreateLine").click(addCreateLine);
    $("#addEditLine").click(addEditLine);

    $(document).on("click", ".removeLine", function () {
        const row = $(this).closest(".orderline-row");
        if (row.parent().find(".orderline-row").length > 1) {
            row.remove();
        }
    });
});

/* =========================
CUSTOMERS
========================= */
function loadCustomers() {
    $.ajax({
        url: "http://localhost:3000/api/orders/customers/search?term=",
        method: "GET",
        success: function (res) {

            let options = `<option value="">Select customer</option>`;

            (res.customers || []).forEach(c => {
                options += `<option value="${c.customer_id}">${c.fname} ${c.lname}</option>`;
            });

            $("#createCustomer")
                .html(options)
                .select2({
                    dropdownParent: $("#createModal"),
                    width: "100%",
                    placeholder: "Search customer"
                });
        }
    });
}

/* =========================
ITEM SELECT (WITH STOCK FIX)
========================= */
function initItemSelect(element, selectedId = null) {

    $.ajax({
        url: "http://localhost:3000/api/orders/items/search?term=",
        method: "GET",
        success: function (res) {

            let options = `<option value="">Select item</option>`;

            (res.items || []).forEach(i => {
                const stockQty = i.stock?.quantity || 0;

                options += `
                    <option value="${i.item_id}" data-stock="${stockQty}">
                        ${i.item_name} (Stock: ${stockQty})
                    </option>`;
            });

            if (element.hasClass("select2-hidden-accessible")) {
                element.select2('destroy');
            }

            element.html(options);

            element.select2({
                dropdownParent: $(".modal:visible"),
                width: "100%",
                placeholder: "Search item"
            });

            if (selectedId) {
                element.val(selectedId).trigger("change");
            }
        }
    });
}

/* =========================
LOAD ORDERS
========================= */
function loadOrders() {

    $.ajax({
        url: "http://localhost:3000/api/orders",
        method: "GET",
        success: function (res) {

            const mode = $("#viewMode").val();

            if ($.fn.DataTable.isDataTable("#orderTable")) {
                $("#orderTable").DataTable().destroy();
                $("#orderTable tbody").empty();
            }

            table = $("#orderTable").DataTable({
                data: res.data || [],

                paging: mode === "pagination",
                scrollY: mode === "scroll" ? "500px" : false,
                scroller: mode === "scroll",
                scrollCollapse: true,

                columns: [
                    { data: "orderinfo_id" },

                    {
                        data: "customer",
                        render: c => c ? `${c.fname} ${c.lname}` : ""
                    },

                    { data: "date_placed" },
                    { data: "date_shipped" },
                    { data: "date_delivered" },
                    { data: "status" },

                    {
                        data: "orderlines",
                        render: lines => {
                            if (!lines) return "";
                            return lines.map(l =>
                                `${l.item?.item_name || "Item"} x ${l.quantity}`
                            ).join("<br>");
                        }
                    },

                    {
                        data: null,
                        render: data => {

                            if (data.status === "Delivered") {
                                return `<span style="color:green;font-weight:bold;">Delivered</span>`;
                            }

                            if (data.status === "Cancelled") {
                                return `<span style="color:red;font-weight:bold;">Cancelled</span>`;
                            }

                            const safe = encodeURIComponent(JSON.stringify(data));

                            return `
                                <button onclick="editOrder('${safe}')">Edit</button>
                                <button onclick="deleteOrder(${data.orderinfo_id})">Delete</button>
                            `;
                        }
                    }
                ]
            });
        }
    });
}

/* =========================
CREATE ORDER
========================= */
function createOrder() {

    const customerId = $("#createCustomer").val();
    const datePlaced = $("#createDatePlaced").val();
    const orderlines = collectCreateLines();

    if (!customerId) return alert("Select customer");
    if (!datePlaced) return alert("Select date placed");
    if (orderlines.length === 0) return alert("Add items");

    validateStockBeforeCreate(orderlines, function () {

        $.ajax({
            url: "http://localhost:3000/api/orders",
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                customer_id: customerId,
                date_placed: datePlaced,
                status: "Pending",
                orderlines
            }),

            success: function (res) {
                alert(res.message || "Created");
                $("#createModal").fadeOut();
                clearCreateForm();
                loadOrders();
            }
        });

    });
}

/* =========================
STOCK VALIDATION (FIXED)
========================= */
function validateStockBeforeCreate(orderlines, callback) {

    $.ajax({
        url: "http://localhost:3000/api/orders/items/search?term=",
        method: "GET",
        success: function (res) {

            const map = {};
            (res.items || []).forEach(i => {
                map[i.item_id] = i;
            });

            for (let line of orderlines) {

                const item = map[line.item_id];
                const stockQty = item?.stock?.quantity || 0;

                if (!item) return alert("Invalid item");

                if (line.quantity > stockQty) {
                    return alert(`Not enough stock for ${item.item_name}`);
                }
            }

            callback();
        }
    });
}

/* =========================
CREATE LINE
========================= */
function addCreateLine() {

    const row = $(`
        <div class="orderline-row">
            <select class="createItem"></select>
            <input type="number" class="createQuantity" placeholder="Qty">
            <button type="button" class="removeLine">Remove</button>
        </div>
    `);

    $("#createOrderLines").append(row);
    initItemSelect(row.find(".createItem"));
}

/* =========================
COLLECT CREATE
========================= */
function collectCreateLines() {

    const list = [];

    $("#createOrderLines .orderline-row").each(function () {

        const itemId = $(this).find(".createItem").val();
        const qty = $(this).find(".createQuantity").val();

        if (itemId) {
            list.push({
                item_id: Number(itemId),
                quantity: Number(qty || 1)
            });
        }
    });

    return list;
}

/* =========================
EDIT ORDER
========================= */
function editOrder(encoded) {

    currentOrder = JSON.parse(decodeURIComponent(encoded));

    $("#editOrderId").val(currentOrder.orderinfo_id);

    $("#editCustomerDisplay").val(
        currentOrder.customer ? `${currentOrder.customer.fname} ${currentOrder.customer.lname}` : ""
    );

    $("#editDatePlacedDisplay").val(currentOrder.date_placed);

    $("#editOrderLines").empty();

    currentOrder.orderlines.forEach(l =>
        addEditLine(l.item_id, l.quantity)
    );

    if (currentOrder.status === "Delivered") {
        $("#editDateShipped, #editDateDelivered, #editStatus, #addEditLine, #saveEdit")
            .prop("disabled", true);
    } else {
        $("#editDateShipped, #editDateDelivered, #editStatus, #addEditLine, #saveEdit")
            .prop("disabled", false);
    }

    $("#editModal").fadeIn();
}

/* =========================
EDIT LINE
========================= */
function addEditLine(itemId = "", qty = "") {

    const row = $(`
        <div class="orderline-row">
            <select class="editItem"></select>
            <input type="number" class="editQuantity" value="${qty}">
            <button type="button" class="removeLine">Remove</button>
        </div>
    `);

    $("#editOrderLines").append(row);
    initItemSelect(row.find(".editItem"), itemId);
}

/* =========================
COLLECT EDIT
========================= */
function collectEditLines() {

    const list = [];

    $("#editOrderLines .orderline-row").each(function () {

        const itemId = $(this).find(".editItem").val();
        const qty = $(this).find(".editQuantity").val();

        if (itemId) {
            list.push({
                item_id: Number(itemId),
                quantity: Number(qty || 1)
            });
        }
    });

    return list;
}

/* =========================
UPDATE ORDER
========================= */
function updateOrder() {

    const shippedDate = $("#editDateShipped").val();
    const today = new Date().toISOString().split("T")[0];

    if (shippedDate && shippedDate < today) {
        return alert("You cannot use past date");
    }

    const orderlines = collectEditLines();
    const newStatus = $("#editStatus").val();

    $.ajax({
        url: `http://localhost:3000/api/orders/${$("#editOrderId").val()}`,
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify({
            date_shipped: shippedDate,
            date_delivered: $("#editDateDelivered").val(),
            status: newStatus,
            orderlines
        }),

        success: function (res) {
            alert(res.message || "Updated");
            $("#editModal").fadeOut();
            loadOrders();
        }
    });
}

/* =========================
DELETE ORDER
========================= */
function deleteOrder(id) {

    if (!confirm("Delete order?")) return;

    $.ajax({
        url: `http://localhost:3000/api/orders/${id}`,
        method: "DELETE",
        success: loadOrders
    });
}

/* =========================
UTIL
========================= */
function clearCreateForm() {
    $("#createCustomer").val(null).trigger("change");
    $("#createDatePlaced").val("");
    $("#createOrderLines").html("");
}