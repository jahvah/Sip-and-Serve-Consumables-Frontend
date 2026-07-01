let table;

$(document).ready(function () {

    const savedMode = localStorage.getItem("categoryViewMode") || "pagination";

    $("#viewMode").val(savedMode);

    loadCategories();

    $("#viewMode").change(function () {
        localStorage.setItem("categoryViewMode", $(this).val());
        loadCategories();
    });

});

/* LOAD */
function loadCategories() {

    $.ajax({
        url: "http://localhost:3000/api/category/all",
        method: "GET",

        success: function (res) {

            let categories = res.categories || [];

            if ($.fn.DataTable.isDataTable("#categoryTable")) {
                $("#categoryTable").DataTable().destroy();
            }

            $("#categoryTable tbody").empty();

            let mode = $("#viewMode").val() || "pagination";

            table = $("#categoryTable").DataTable({

                destroy: true,

                data: categories,

                paging: mode === "pagination",
                scrollY: mode === "scroll" ? "500px" : false,
                scrollCollapse: true,
                scroller: mode === "scroll",

                columns: [

                    { data: "category_id" },
                    { data: "category" },

                    {
                        data: null,
                        render: function (data) {
                            return `
                                <button onclick="editCategory(${data.category_id}, '${encodeURIComponent(data.category)}')">Edit</button>
                                <button onclick="deleteCategory(${data.category_id})">Delete</button>
                            `;
                        }
                    }

                ]
            });
        }
    });
}

$("#saveCreate").click(function () {

    let category = $("#createCategory").val().trim();

    // REQUIRED VALIDATION
    if (category === "") {
        alert("Category is required.");
        return;
    }

    $.ajax({

        url: "http://localhost:3000/api/category/create",
        method: "POST",
        contentType: "application/json",

        data: JSON.stringify({
            category: category
        }),

        success: function (res) {

            alert(res.message);

            $("#createModal").hide();
            loadCategories();

        },

        error: function (xhr) {
            alert(xhr.responseJSON.message);
        }

    });

});

/* EDIT */
let originalCategory = "";

function editCategory(id, category) {

    $("#editId").val(id);

    // store original value for comparison
    originalCategory = decodeURIComponent(category);

    // EMPTY input field
    $("#editCategory").val("");

    // SHOW existing data as placeholder
    $("#editCategory").attr("placeholder", originalCategory);

    $("#editModal").show();
}

/* SAVE UPDATE */
$("#saveEdit").click(function () {

    let newCategory = $("#editCategory").val().trim();

    // if user didn't type anything → no change
    if (newCategory === "") {
        alert("No changes made.");
        $("#editModal").hide();
        return;
    }

    // compare with original
    if (newCategory === originalCategory) {
        alert("No changes made.");
        $("#editModal").hide();
        return;
    }

    $.ajax({

        url: "http://localhost:3000/api/category/update",
        method: "PUT",
        contentType: "application/json",

        data: JSON.stringify({
            category_id: $("#editId").val(),
            category: newCategory
        }),

        success: function (res) {
            alert(res.message);
            $("#editModal").hide();
            loadCategories();
        },

        error: function (xhr) {
            alert(xhr.responseJSON.message);
        }

    });

});

/* DELETE */
function deleteCategory(id) {

    if (!confirm("Delete category?")) return;

    $.ajax({
        url: `http://localhost:3000/api/category/delete/${id}`,
        method: "DELETE",

        success: function () {
            alert("Deleted!");
            loadCategories();
        }
    });

}
$("#openCreateModal").click(function () {
    $("#createCategory").val("");
    $("#createModal").show();
});

$("#closeCreate").click(function () {
    $("#createModal").hide();
});

/* CLOSE MODAL */
function closeModal() {
    $("#editModal").hide();
}