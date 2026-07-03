let table;
let currentOrder = null;

/* =========================
INIT
========================= */
$(document).ready(function () {
    const savedMode = localStorage.getItem("orderViewMode") || "pagination";
    $("#viewMode").val(savedMode);

    loadOrders();

    $("#viewMode").change(function () {
        localStorage.setItem("orderViewMode", $(this).val());
        loadOrders();
    });

    $("#openCreateModal").click(function () {
        clearCreateForm();
        $("#createModal").fadeIn();
        searchCustomers("");
        searchItems("");
    });

    $("#closeCreate").click(function () {
        $("#createModal").fadeOut();
    });

    $("#saveCreate").click(function () {
        createOrder();
    });

    $("#saveEdit").click(function () {
        updateOrder();
    });

    $("#addCreateLine").click(function () {
        addCreateLine();
    });

    $("#addEditLine").click(function () {
        addEditLine();
    });

    $(document).on("click", ".removeLine", function () {
        const row = $(this).closest(".orderline-row");
        const wrapper = row.parent();

        if (wrapper.find(".orderline-row").length > 1) {
            row.remove();
        }
    });

    $(document).on("input focus", "#createCustomerSearch", function () {
        searchCustomers($(this).val());
    });

    $(document).on("input focus", ".createItemSearch, .editItemSearch", function () {
        searchItems($(this).val());
    });
});

/* =========================
HELPERS
========================= */
function getIdFromValue(value) {
    if (!value) return "";

    const id = String(value).split(" - ")[0].trim();

    return /^\d+$/.test(id) ? id : "";
}

function cleanSearchTerm(value) {
    if (!value) return "";

    if (String(value).includes(" - ")) {
        return String(value).split(" - ").slice(1).join(" - ").trim();
    }

    return value;
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
                deferRender: true,

                paging: mode === "pagination",
                scrollY: mode === "scroll" ? "500px" : false,
                scroller: mode === "scroll",
                scrollCollapse: true,

                columns: [
                    { data: "orderinfo_id" },

                    {
                        data: "customer",
                        render: function (customer) {
                            if (!customer) return "";
                            return `${customer.fname || ""} ${customer.lname || ""}`.trim();
                        }
                    },

                    { data: "date_placed" },

                    {
                        data: "date_shipped",
                        render: function (date) {
                            return date || "";
                        }
                    },

                    {
                        data: "date_delivered",
                        render: function (date) {
                            return date || "";
                        }
                    },

                    { data: "status" },

                    {
                        data: "orderlines",
                        render: function (lines) {
                            if (!lines || lines.length === 0) return "";

                            return lines.map(line => {
                                const itemName = line.item
                                    ? line.item.item_name
                                    : `Item ID ${line.item_id}`;

                                return `${itemName} x ${line.quantity || 0}`;
                            }).join("<br>");
                        }
                    },

                    {
                        data: null,
                        render: function (data) {
                            if (data.status === "Cancelled") {
                                return "";
                            }

                            const safeData = encodeURIComponent(JSON.stringify(data));

                            return `
                                <button onclick="editOrder('${safeData}')">Edit</button>
                                <button onclick="deleteOrder(${data.orderinfo_id})">Delete</button>
                            `;
                        }
                    }
                ]
            });
        },

        error: function (xhr) {
            console.log(xhr.responseText);
            alert("Failed to load orders");
        }
    });
}

/* =========================
SEARCH CUSTOMERS
========================= */
function searchCustomers(term) {
    $.ajax({
        url: `http://localhost:3000/api/orders/customers/search?term=${encodeURIComponent(cleanSearchTerm(term))}`,
        method: "GET",

        success: function (res) {
            let options = "";

            (res.customers || []).forEach(c => {
                const fullName = `${c.fname || ""} ${c.lname || ""}`.trim();
                options += `<option value="${c.customer_id} - ${fullName}"></option>`;
            });

            $("#customerList").html(options);
        },

        error: function (xhr) {
            console.log(xhr.responseText);
        }
    });
}

/* =========================
SEARCH ITEMS
========================= */
function searchItems(term) {
    $.ajax({
        url: `http://localhost:3000/api/orders/items/search?term=${encodeURIComponent(cleanSearchTerm(term))}`,
        method: "GET",

        success: function (res) {
            let options = "";

            (res.items || []).forEach(item => {
                options += `<option value="${item.item_id} - ${item.item_name}"></option>`;
            });

            $("#itemList").html(options);
        },

        error: function (xhr) {
            console.log(xhr.responseText);
        }
    });
}

/* =========================
CREATE ORDER
========================= */
function createOrder() {
    const customerId = getIdFromValue($("#createCustomerSearch").val());
    const datePlaced = $("#createDatePlaced").val();
    const orderlines = collectCreateLines();

    $("#createCustomerId").val(customerId);

    if (!customerId) {
        return alert("Please select a customer from the search suggestions.");
    }

    if (!datePlaced) {
        return alert("Please select date placed.");
    }

    if (orderlines.length === 0) {
        return alert("Please select at least one item from the search suggestions.");
    }

    $.ajax({
        url: "http://localhost:3000/api/orders",
        method: "POST",
        contentType: "application/json",

        data: JSON.stringify({
            customer_id: customerId,
            date_placed: datePlaced,
            status: $("#createStatus").val(),
            orderlines: orderlines
        }),

        success: function (res) {
            alert(res.message || "Order created");

            $("#createModal").fadeOut();
            clearCreateForm();
            loadOrders();
        },

        error: function (xhr) {
            console.log(xhr.responseText);
            alert(xhr.responseJSON?.message || "Create failed");
        }
    });
}

function clearCreateForm() {
    $("#createCustomerSearch").val("");
    $("#createCustomerId").val("");
    $("#createDatePlaced").val("");
    $("#createStatus").val("Pending");

    $("#createOrderLines").html(`
        <div class="orderline-row">
            <input type="text" class="createItemSearch" list="itemList" placeholder="Search item name">
            <input type="hidden" class="createItemId">
            <input type="number" class="createQuantity" placeholder="Quantity">
            <button type="button" class="removeLine">Remove</button>
        </div>
    `);
}

function addCreateLine(itemId = "", itemName = "", quantity = "") {
    const value = itemId && itemName ? `${itemId} - ${itemName}` : itemName;

    $("#createOrderLines").append(`
        <div class="orderline-row">
            <input type="text" class="createItemSearch" list="itemList" value="${value}" placeholder="Search item name">
            <input type="hidden" class="createItemId" value="${itemId}">
            <input type="number" class="createQuantity" value="${quantity}" placeholder="Quantity">
            <button type="button" class="removeLine">Remove</button>
        </div>
    `);
}

function collectCreateLines() {
    const orderlines = [];

    $("#createOrderLines .orderline-row").each(function () {
        const itemValue = $(this).find(".createItemSearch").val();
        const itemId = getIdFromValue(itemValue);
        const qty = $(this).find(".createQuantity").val();

        $(this).find(".createItemId").val(itemId);

        if (itemId) {
            orderlines.push({
                item_id: Number(itemId),
                quantity: Number(qty || 1)
            });
        }
    });

    return orderlines;
}

/* =========================
EDIT ORDER
========================= */
function editOrder(encodedData) {
    currentOrder = JSON.parse(decodeURIComponent(encodedData));

    $("#editOrderId").val(currentOrder.orderinfo_id);

    const customerName = currentOrder.customer
        ? `${currentOrder.customer.fname || ""} ${currentOrder.customer.lname || ""}`.trim()
        : "";

    $("#editCustomerDisplay").val(customerName);
    $("#editDatePlacedDisplay").val(currentOrder.date_placed || "");

    $("#editDateShipped").val("");
    $("#editDateDelivered").val("");
    $("#editStatus").val("");

    $("#editOrderLines").html("");

    if (currentOrder.orderlines && currentOrder.orderlines.length > 0) {
        currentOrder.orderlines.forEach(line => {
            addEditLine(
                line.item_id,
                line.item ? line.item.item_name : "",
                line.quantity || ""
            );
        });
    } else {
        addEditLine();
    }

    $("#editModal").fadeIn();
    searchItems("");
}

/* =========================
UPDATE ORDER
========================= */
function updateOrder() {
    const orderlines = collectEditLines();

    $.ajax({
        url: `http://localhost:3000/api/orders/${$("#editOrderId").val()}`,
        method: "PUT",
        contentType: "application/json",

        data: JSON.stringify({
            date_shipped: $("#editDateShipped").val(),
            date_delivered: $("#editDateDelivered").val(),
            status: $("#editStatus").val(),
            orderlines: orderlines
        }),

        success: function (res) {
            alert(res.message || "Order updated");

            $("#editModal").fadeOut();
            loadOrders();
        },

        error: function (xhr) {
            console.log(xhr.responseText);
            alert(xhr.responseJSON?.message || "Update failed");
        }
    });
}

function addEditLine(itemId = "", itemName = "", quantity = "") {
    const value = itemId && itemName ? `${itemId} - ${itemName}` : itemName;

    $("#editOrderLines").append(`
        <div class="orderline-row">
            <input type="text" class="editItemSearch" list="itemList" value="${value}" placeholder="Search item name">
            <input type="hidden" class="editItemId" value="${itemId}">
            <input type="number" class="editQuantity" value="${quantity}" placeholder="Quantity">
            <button type="button" class="removeLine">Remove</button>
        </div>
    `);
}

function collectEditLines() {
    const orderlines = [];

    $("#editOrderLines .orderline-row").each(function () {
        const itemValue = $(this).find(".editItemSearch").val();
        const itemId = getIdFromValue(itemValue);
        const qty = $(this).find(".editQuantity").val();

        $(this).find(".editItemId").val(itemId);

        if (itemId) {
            orderlines.push({
                item_id: Number(itemId),
                quantity: Number(qty || 1)
            });
        }
    });

    return orderlines;
}

/* =========================
DELETE ORDER
========================= */
function deleteOrder(id) {
    if (!confirm("Delete order?")) return;

    $.ajax({
        url: `http://localhost:3000/api/orders/${id}`,
        method: "DELETE",

        success: function () {
            loadOrders();
        },

        error: function (xhr) {
            console.log(xhr.responseText);
            alert(xhr.responseJSON?.message || "Delete failed");
        }
    });
}

/* =========================
MODALS
========================= */
function closeEditModal() {
    $("#editModal").fadeOut();
}