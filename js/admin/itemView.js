let table;

$(document).ready(function () {

    const savedMode = localStorage.getItem("itemViewMode") || "pagination";
    $("#viewMode").val(savedMode);

    loadItems();
    loadCategories();

    $("#viewMode").change(function () {
        localStorage.setItem("itemViewMode", $(this).val());
        loadItems();
    });

});


/* LOAD ITEMS */
function loadItems() {

    $.ajax({
        url: "http://localhost:3000/api/items/all",
        method: "GET",

        success: function (res) {

            if ($.fn.DataTable.isDataTable("#itemTable")) {
                $("#itemTable").DataTable().destroy();
                $("#itemTable tbody").empty();
            }

            let mode = $("#viewMode").val();

            table = $("#itemTable").DataTable({

                destroy: true,

                data: res.items || [],

                deferRender: true,   // 🔥 REQUIRED FOR SCROLLER

                paging: mode === "pagination",

                scrollY: mode === "scroll" ? "500px" : false,
                scroller: mode === "scroll",
                scrollCollapse: true,

                columns: [

                    { data: "item_id" },
                    { data: "item_name" },
                    { data: "description" },
                    { data: "cost_price" },
                    { data: "sell_price" },

                    {
                        data: "category",
                        render: c => c?.description || ""
                    },

                    {
                        data: "images",
                        render: function (imgs) {

                            if (!imgs || imgs.length === 0) return "No Image";

                            return `
                                <img src="http://localhost:3000/${imgs[0].image_path}"
                                width="50" height="50"
                                style="object-fit:cover;border-radius:5px;">
                            `;
                        }
                    },

                    {
                        data: null,
                        render: function (data) {

                            // safer JSON encoding
                            const safeData = encodeURIComponent(JSON.stringify(data));

                            return `
                                <button onclick="editItem('${safeData}')">Edit</button>
                                <button onclick="deleteItem(${data.item_id})">Delete</button>
                            `;
                        }
                    }

                ]

            });
        }
    });
}


/* LOAD CATEGORIES */
function loadCategories() {

    $.ajax({
        url: "http://localhost:3000/api/category/all",
        method: "GET",

        success: function (res) {

            let options = "";

            res.categories.forEach(c => {
                options += `<option value="${c.category_id}">${c.description}</option>`;
            });

            $("#editCategory").html(options);
        }
    });
}


/* EDIT */
function editItem(encodedData) {

    let item = JSON.parse(decodeURIComponent(encodedData));

    $("#editId").val(item.item_id);

    // show placeholders (keep old behavior)
    $("#editName").val("").attr("placeholder", item.item_name);
    $("#editDescription").val("").attr("placeholder", item.description);
    $("#editCost").val("").attr("placeholder", item.cost_price);
    $("#editSell").val("").attr("placeholder", item.sell_price);

    $("#editCategory").val(item.category_id);

    $("#editModal").fadeIn();
}

/* SAVE UPDATE */
$("#saveEdit").click(function () {

    $.ajax({

        url: "http://localhost:3000/api/items/update",

        method: "PUT",

        contentType: "application/json",

        data: JSON.stringify({

            item_id: $("#editId").val(),

            item_name: $("#editName").val(),

            description: $("#editDescription").val(),

            cost_price: $("#editCost").val(),

            sell_price: $("#editSell").val(),

            category_id: $("#editCategory").val()

        }),

        success: function (res) {

            alert(res.message);

            $("#editModal").fadeOut();

            loadItems();

        },

        error: function (xhr) {

            alert(xhr.responseJSON.message);

        }

    });

});

/* DELETE */
function deleteItem(id) {

    if (!confirm("Delete item?")) return;

    $.ajax({
        url: "http://localhost:3000/api/items/delete/" + id,
        method: "DELETE",

        success: function () {
            loadItems();
        }
    });
}


/* CLOSE MODAL */
function closeModal() {
    $("#editModal").fadeOut();
}