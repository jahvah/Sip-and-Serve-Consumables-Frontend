let table;
let currentOrder = null;
let originalEditState = {};
let mode = localStorage.getItem("orderViewMode") || "pagination";
let offset = 0;
let limit = 10;
let loading = false;
let hasMore = true;

/* =========================
INIT
========================= */
$(document).ready(function () {

    mode = localStorage.getItem("orderViewMode") || "pagination";
    $("#viewMode").val(mode);

    initTable();

    if (mode === "pagination") {

        loadPagination();

    } else {
        
        loadInfinite(true);

    }

    loadCustomers();

    $("#viewMode").change(function () {
        mode = $(this).val();
        localStorage.setItem("orderViewMode", mode);
        initTable();

        if (mode === "pagination") {

            loadPagination();

        } else {

            loadInfinite(true);

        }
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
            updateGrandTotal();
        }
    });

    $(document).on("change", ".editItem", function () {

        updateEditRow($(this).closest(".orderline-row"));

    });

    $(document).on("input", ".editQuantity", function () {

        updateEditRow($(this).closest(".orderline-row"));

    });
});

/* =========================
TABLE INIT
========================= */
function initTable() {

    if ($.fn.DataTable.isDataTable("#orderTable")) {

        $("#orderTable").DataTable().destroy();

        $("#orderTable tbody").empty();

    }

    table = $("#orderTable").DataTable({

        paging: mode === "pagination",

        searching: true,

        ordering: true,

        info: true,

        lengthChange: false,

        pageLength: 10,

        deferRender: true,

        processing: true,

        scrollY: mode === "scroll" ? "500px" : false,

        scrollCollapse: true,

        data: [],

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

                    if (!Array.isArray(lines))
                        return "";

                    return lines.map(l =>
                        `${l.item?.item_name || ""} × ${l.quantity}`
                    ).join("<br>");

                }
            },

            {

                data: null,

                render: renderActions

            }

        ]

    });

    if (mode === "scroll") {

        attachInfiniteScroll();

    }

}

function renderActions(data) {

    if (!data)
        return "";

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

function loadPagination() {

    $.ajax({

        url: "http://localhost:3000/api/orders?start=0&length=100000",

        success: function (res) {

            table.clear();

            table.rows.add(res.data || []);

            table.draw();

        },

        error: function () {

            Swal.fire(
                "Error",
                "Failed to load orders.",
                "error"
            );

        }

    });

}

function loadInfinite(reset = false) {

    if (loading || !hasMore)
        return;

    loading = true;

    if (reset) {

        offset = 0;

        hasMore = true;

        table.clear().draw();

    }

    $.ajax({

        url: `http://localhost:3000/api/orders?start=${offset}&length=${limit}`,

        success(res) {

            const rows = res.data || [];

            if (rows.length < limit) {

                hasMore = false;

            }

            offset += rows.length;

            table.rows.add(rows).draw(false);

            loading = false;

        },

        error() {

            loading = false;

        }

    });

}

function attachInfiniteScroll() {

    setTimeout(function () {

        $(".dataTables_scrollBody")

            .off("scroll")

            .on("scroll", function () {

                if (loading || !hasMore)
                    return;

                if (this.scrollTop + this.clientHeight >= this.scrollHeight - 80) {

                    loadInfinite();

                }

            });

    }, 200);

}

/* =========================
RESET
========================= */
function resetOrders() {
    offset = 0;
    hasMore = true;
    table.clear().draw();
    loadOrders(true);
}

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
                options += `<option value="${c.customer_id}">
                    ${c.fname} ${c.lname}
                </option>`;
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
ITEM SELECT
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
                <option 
                    value="${i.item_id}"
                    data-stock="${stockQty}"
                    data-price="${i.sell_price}">
                    ${i.item_name} (Stock: ${stockQty})
                </option>`;
            });

            if (element.hasClass("select2-hidden-accessible")) {
                element.select2("destroy");
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
CREATE ORDER
========================= */
function createOrder() {

    const customerId = $("#createCustomer").val();
    const datePlaced = $("#createDatePlaced").val();

    const orderlines = collectCreateLines();

    if (!customerId) return alert("Select customer");
    if (!datePlaced) return alert("Select date placed");
    if (orderlines === null) return;
    if (orderlines.length === 0) return alert("Please add at least one item.");

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
                resetOrders();
            }
        });

    });
}

/* =========================
STOCK VALIDATION
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

    let hasError = false;

    $("#createOrderLines .orderline-row").each(function () {

        const itemId = $(this).find(".createItem").val();

        const qty = $(this).find(".createQuantity").val().trim();

        if (!itemId) {
            return;
        }

        if (qty === "") {

            alert("Please set the quantity for every selected item.");

            hasError = true;

            return false;

        }

        if (Number(qty) <= 0) {

            alert("Quantity must be greater than zero.");

            hasError = true;

            return false;

        }

        list.push({

            item_id: Number(itemId),

            quantity: Number(qty)

        });

    });

    if (hasError) {

        return null;

    }

    return list;

}

/* =========================
EDIT ORDER
========================= */
function editOrder(encoded) {

    currentOrder = JSON.parse(decodeURIComponent(encoded));

    $("#editOrderId").val(currentOrder.orderinfo_id);

    $("#editCustomerDisplay").val(
        currentOrder.customer ?
        `${currentOrder.customer.fname} ${currentOrder.customer.lname}` : ""
    );

    $("#editDatePlacedDisplay").val(currentOrder.date_placed);

    $("#editOrderLines").empty();

    currentOrder.orderlines.forEach(l =>
        addEditLine(l.item_id, l.quantity)
    );

    setTimeout(function () {

        $("#editOrderLines .orderline-row").each(function () {

            updateEditRow($(this));

        });

    }, 300);

    if (
        currentOrder.status === "Delivered" ||
        currentOrder.status === "Shipped"
    ) {
        $("#editDateShipped, #editDateDelivered, #editStatus, #addEditLine, #saveEdit")
            .prop("disabled", true);
    } else {
        $("#editDateShipped, #editDateDelivered, #editStatus, #addEditLine, #saveEdit")
            .prop("disabled", false);
    }

    $("#editDateShipped").val(currentOrder.date_shipped || "");
    $("#editDateDelivered").val(currentOrder.date_delivered || "");
    $("#editStatus").val(currentOrder.status || "");

    $("#editModal").fadeIn();

    originalEditState = {
        date_shipped: currentOrder.date_shipped || "",
        date_delivered: currentOrder.date_delivered || "",
        status: currentOrder.status || "",
        orderlines: currentOrder.orderlines.map(l => ({
            item_id: l.item_id,
            quantity: l.quantity
        }))
    };
}

/* =========================
EDIT LINE
========================= */
function addEditLine(itemId = "", qty = "") {

    const row = $(`
        <div class="orderline-row">

            <select class="editItem"></select>

            <input
                type="number"
                class="editQuantity"
                min="1"
                value="${qty}"
            >

            <span class="stockLabel">
                Stock: --
            </span>

            <span class="lineTotal">
                ₱0.00
            </span>

            <button
                type="button"
                class="removeLine"
            >
                Remove
            </button>

        </div>
    `);

    $("#editOrderLines").append(row);

    initItemSelect(row.find(".editItem"), itemId);
}

function updateEditRow(row) {

    const selected = row.find(".editItem option:selected");

    const stock = Number(selected.data("stock")) || 0;
    const price = Number(selected.data("price")) || 0;
    let qty = Number(row.find(".editQuantity").val()) || 0;

    if (qty > stock) {
        qty = stock;
        row.find(".editQuantity").val(stock);
        alert("Quantity exceeds available stock.");
    }

    row.find(".stockLabel").text(`Stock: ${stock}`);

    row.find(".editQuantity").attr("max", stock);

    const lineTotal = qty * price;

    row.find(".lineTotal").text(
        "₱" + lineTotal.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    );

    updateGrandTotal();
}

function updateGrandTotal() {

    let total = 0;

    $("#editOrderLines .orderline-row").each(function () {

        const selected = $(this).find(".editItem option:selected");

        const price = Number(selected.data("price")) || 0;

        const qty = Number($(this).find(".editQuantity").val()) || 0;

        total += price * qty;

    });

    $("#orderGrandTotal").text(

        "₱" +

        total.toLocaleString(undefined, {

            minimumFractionDigits: 2,

            maximumFractionDigits: 2

        })

    );

}

/* =========================
COLLECT EDIT
========================= */
function collectEditLines() {

    const list = [];

    let hasError = false;

    $("#editOrderLines .orderline-row").each(function () {

        const itemId = $(this).find(".editItem").val();

        const qty = $(this).find(".editQuantity").val().trim();

        if (!itemId) {
            return;
        }

        if (qty === "") {

            alert("Please set the quantity for every selected item.");

            hasError = true;

            return false;

        }

        if (Number(qty) <= 0) {

            alert("Quantity must be greater than zero.");

            hasError = true;

            return false;

        }

        list.push({

            item_id: Number(itemId),

            quantity: Number(qty)

        });

    });

    if (hasError) {

        return null;

    }

    return list;

}

    function hasOrderChanged() {

        const currentLines = collectEditLines() || [];

        currentLines.sort((a, b) => a.item_id - b.item_id);

        const originalLines = [...originalEditState.orderlines];

        originalLines.sort((a, b) => a.item_id - b.item_id);

        return (
            ($("#editDateShipped").val() || "") !== originalEditState.date_shipped ||
            ($("#editDateDelivered").val() || "") !== originalEditState.date_delivered ||
            ($("#editStatus").val() || "") !== originalEditState.status ||
            JSON.stringify(currentLines) !== JSON.stringify(originalLines)
        );

    }

/* =========================
UPDATE ORDER
========================= */
function updateOrder() {

    // Check if anything was changed
    if (!hasOrderChanged()) {
        alert("No changes were made.");
        return;
    }

    const shippedDate = $("#editDateShipped").val();
    const today = new Date().toISOString().split("T")[0];

    if (shippedDate && shippedDate < today) {
        return alert("You cannot use past date");
    }

    const orderlines = collectEditLines(); 

    if (orderlines === null) return;

    // Prevent duplicate items
    const ids = orderlines.map(x => x.item_id);

    if (new Set(ids).size !== ids.length) {
        alert("Duplicate items are not allowed.");
        return;
    }

    Swal.fire({
        title: "Save changes?",
        text: "Do you want to update this order?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, save it",
        cancelButtonText: "Cancel",
        reverseButtons: true
    }).then((result) => {

        if (!result.isConfirmed) {
            return;
        }

        $.ajax({
            url: `http://localhost:3000/api/orders/${$("#editOrderId").val()}`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify({
                date_shipped: shippedDate,
                date_delivered: $("#editDateDelivered").val(),
                status: $("#editStatus").val(),
                orderlines
            }),

            success: function (res) {

                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: res.message || "Order updated successfully.",
                    timer: 1800,
                    showConfirmButton: false
                });

                $("#editModal").fadeOut();
                resetOrders();
            },

            error: function (xhr) {

                Swal.fire({
                    icon: "error",
                    title: "Update Failed",
                    text: xhr.responseJSON?.message || "Failed to update order."
                });

            }

        });

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
        success: resetOrders
    });
}

function closeEditModal() {
    $("#editModal").fadeOut();
}

/* =========================
UTIL
========================= */
function clearCreateForm() {
    $("#createCustomer").val(null).trigger("change");
    $("#createDatePlaced").val("");
    $("#createOrderLines").html("");
}