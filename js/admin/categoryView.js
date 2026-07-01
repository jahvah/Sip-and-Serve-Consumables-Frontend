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
                    { data: "description" },

                    {
                        data: null,
                        render: function (data) {
                            return `
                                <button onclick="editCategory(${data.category_id}, '${encodeURIComponent(data.description)}')">Edit</button>
                                <button onclick="deleteCategory(${data.category_id})">Delete</button>
                            `;
                        }
                    }

                ]
            });
        }
    });
}

/* EDIT */
function editCategory(id, description) {

    $("#editId").val(id);
    $("#editDescription").val(decodeURIComponent(description));

    $("#editModal").show();
}

/* SAVE UPDATE */
$("#saveEdit").click(function () {

    $.ajax({
        url: "http://localhost:3000/api/category/update",
        method: "PUT",
        contentType: "application/json",
        data: JSON.stringify({
            category_id: $("#editId").val(),
            description: $("#editDescription").val()
        }),

        success: function () {
            alert("Updated!");
            $("#editModal").hide();
            loadCategories();
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

/* CLOSE MODAL */
function closeModal() {
    $("#editModal").hide();
}