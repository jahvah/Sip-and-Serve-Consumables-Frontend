let table;
let currentItem = null;

$(document).ready(function () {
    const savedMode = localStorage.getItem("itemViewMode") || "pagination";
    $("#viewMode").val(savedMode);

    loadItems();
    loadCategories();

    $("#viewMode").change(function () {
        localStorage.setItem("itemViewMode", $(this).val());
        loadItems();
    });

    $("#openCreateModal").click(function () {
        $("#createModal").fadeIn();
    });

    $("#closeCreate").click(function () {
        $("#createModal").fadeOut();
    });

    $("#saveCreate").click(function () {
        createItem();
    });

    $("#saveEdit").click(function () {
        updateItemInfo();
    });

    $("#btnUpdateMainImage").click(function () {
        updateMainImage();
    });

    $("#btnDeleteMainImage").click(function () {
        deleteMainImage();
    });

    $("#btnAddImages").click(function () {
        addGalleryImages();
    });
});

/* =========================
LOAD ITEMS
========================= */
function loadItems() {
    $.ajax({
        url: "http://localhost:3000/api/items/all",
        method: "GET",

        success: function (res) {
            let mode = $("#viewMode").val();

            if ($.fn.DataTable.isDataTable("#itemTable")) {
                $("#itemTable").DataTable().destroy();
                $("#itemTable tbody").empty();
            }

            table = $("#itemTable").DataTable({
                data: res.items || [],
                deferRender: true,

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
                        data: "stock",
                        render: function (stock) {
                            return stock ? stock.quantity : 0;
                        }
                    },

                    {
                        data: "category",
                        render: function (c) {
                            return c?.category || "";
                        }
                    },

                    {
                        data: "image",
                        render: function (img) {
                            if (!img) return "No Image";

                            return `
                                <img src="http://localhost:3000/${img}"
                                     width="50"
                                     height="50"
                                     style="object-fit:cover;border-radius:5px;">
                            `;
                        }
                    },

                    {
                        data: "images",
                        render: function (imgs) {
                            if (!imgs || imgs.length === 0) return "No Images";

                            return imgs.map(img => `
                                <img src="http://localhost:3000/${img.image_path}"
                                     width="40"
                                     height="40"
                                     style="object-fit:cover;border-radius:5px;margin-right:3px;">
                            `).join("");
                        }
                    },

                    {
                        data: null,
                        render: function (data) {
                            const safeData = encodeURIComponent(JSON.stringify(data));

                            return `
                                <button onclick="editItem('${safeData}')">Edit</button>
                                <button onclick="deleteItem(${data.item_id})">Delete</button>
                            `;
                        }
                    }
                ]
            });
        },

        error: function (xhr) {
            console.log(xhr.responseText);
            alert("Failed to load items");
        }
    });
}

/* =========================
LOAD CATEGORIES
========================= */
function loadCategories() {
    $.ajax({
        url: "http://localhost:3000/api/category/all",
        method: "GET",

        success: function (res) {
            let options = "";

            res.categories.forEach(c => {
                options += `<option value="${c.category_id}">${c.category}</option>`;
            });

$("#editCategory")
    .html(options)
    .select2({
        dropdownParent: $("#editModal"),
        width: "100%",
        placeholder: "Search category"
    });

$("#createCategory")
    .html(options)
    .select2({
        dropdownParent: $("#createModal"),
        width: "100%",
        placeholder: "Search category"
    });
    
        },

        error: function (xhr) {
            console.log(xhr.responseText);
            alert("Failed to load categories");
        }
    });
}

/* =========================
CREATE ITEM
========================= */
function createItem() {
    let formData = new FormData();

    formData.append("item_name", $("#createName").val().trim());
    formData.append("description", $("#createDescription").val().trim());
    formData.append("cost_price", $("#createCost").val());
    formData.append("sell_price", $("#createSell").val());
    formData.append("quantity", $("#createStock").val());
    formData.append("category_id", $("#createCategory").val());

    let mainImage = $("#createMainImage")[0].files[0];

    if (mainImage) {
        formData.append("mainImage", mainImage);
    }

    let images = $("#createImages")[0].files;

    for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i]);
    }

    $.ajax({
        url: "http://localhost:3000/api/items/create",
        method: "POST",
        data: formData,
        processData: false,
        contentType: false,

        success: function (res) {
            alert(res.message || "Item created");

            $("#createModal").fadeOut();
            clearCreateForm();
            loadItems();
        },

        error: function (xhr) {
            console.log(xhr.responseText);
            alert(xhr.responseJSON?.message || "Create failed");
        }
    });
}

function clearCreateForm() {
    $("#createName").val("");
    $("#createDescription").val("");
    $("#createCost").val("");
    $("#createSell").val("");
    $("#createMainImage").val("");
    $("#createImages").val("");
}

/* =========================
EDIT ITEM OPEN
========================= */
function editItem(encodedData) {
    currentItem = JSON.parse(decodeURIComponent(encodedData));

    $("#editId").val(currentItem.item_id);

    $("#editName").val("").attr("placeholder", currentItem.item_name);
    $("#editDescription").val("").attr("placeholder", currentItem.description);
    $("#editCost").val("").attr("placeholder", currentItem.cost_price);
    $("#editSell").val("").attr("placeholder", currentItem.sell_price);
    $("#editStock").val("").attr("placeholder", currentItem.stock ? currentItem.stock.quantity : 0);
    $("#editCategory").val(currentItem.category_id);

    $("#previewMainImage").attr(
        "src",
        currentItem.image ? "http://localhost:3000/" + currentItem.image : ""
    );

    renderGallery(currentItem.images || []);

    $("#editModal").fadeIn();
}

/* =========================
UPDATE INFO ONLY
========================= */
function updateItemInfo() {
    $.ajax({
        url: "http://localhost:3000/api/items/update",
        method: "PUT",
        contentType: "application/json",

        data: JSON.stringify({
            item_id: $("#editId").val(),
            item_name: $("#editName").val().trim(),
            description: $("#editDescription").val().trim(),
            cost_price: $("#editCost").val(),
            sell_price: $("#editSell").val(),
            quantity: $("#editStock").val(),
            category_id: $("#editCategory").val()
        }),

        success: function (res) {
            alert(res.message);
            loadItems();
        },

        error: function (xhr) {
            console.log(xhr.responseText);
            alert(xhr.responseJSON?.message || "Update failed");
        }
    });
}

/* =========================
UPDATE MAIN IMAGE
========================= */
function updateMainImage() {
    let file = $("#editMainImage")[0].files[0];

    if (!file) return alert("Select image first");

    let formData = new FormData();
    formData.append("image", file);

    $.ajax({
        url: `http://localhost:3000/api/items/main-image/${$("#editId").val()}`,
        method: "PUT",
        data: formData,
        processData: false,
        contentType: false,

        success: function (res) {
            alert(res.message);

            $("#previewMainImage").attr(
                "src",
                "http://localhost:3000/" + res.image
            );

            $("#editMainImage").val("");
            loadItems();
        },

        error: function (xhr) {
            console.log(xhr.responseText);
            alert(xhr.responseJSON?.message || "Main image update failed");
        }
    });
}

/* =========================
DELETE MAIN IMAGE
========================= */
function deleteMainImage() {
    $.ajax({
        url: `http://localhost:3000/api/items/main-image/${$("#editId").val()}`,
        method: "DELETE",

        success: function (res) {
            alert(res.message);

            $("#previewMainImage").attr("src", "");
            loadItems();
        },

        error: function (xhr) {
            console.log(xhr.responseText);
            alert(xhr.responseJSON?.message || "Main image delete failed");
        }
    });
}

/* =========================
RENDER GALLERY
========================= */
function renderGallery(images) {
    let html = "";

    images.forEach(img => {
        html += `
            <div id="img-${img.itemimg_id}"
                 style="display:inline-block;position:relative;margin:5px;">

                <img src="http://localhost:3000/${img.image_path}"
                     width="70"
                     height="70"
                     style="object-fit:cover;border-radius:5px;">

                <button onclick="deleteImage(${img.itemimg_id}, ${img.item_id})"
                        style="position:absolute;top:0;right:0;
                               background:red;color:white;
                               border:none;border-radius:50%;
                               width:18px;height:18px;
                               font-size:10px;cursor:pointer;">
                    ×
                </button>

            </div>
        `;
    });

    $("#editGallery").html(html);
}

/* =========================
ADD GALLERY IMAGES
========================= */
function addGalleryImages() {
    let files = $("#editImages")[0].files;

    if (!files.length) return alert("Select images first");

    let formData = new FormData();

    for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
    }

    $.ajax({
        url: `http://localhost:3000/api/items/add-images/${currentItem.item_id}`,
        method: "POST",
        data: formData,
        processData: false,
        contentType: false,

        success: function () {
            alert("Images added");

            loadItems();

            $.get("http://localhost:3000/api/items/all", function (res) {
                currentItem = res.items.find(i => i.item_id === currentItem.item_id);
                renderGallery(currentItem.images || []);
            });

            $("#editImages").val("");
        },

        error: function (xhr) {
            console.log(xhr.responseText);
            alert(xhr.responseJSON?.message || "Add images failed");
        }
    });
}

/* =========================
DELETE GALLERY IMAGE
========================= */
function deleteImage(imageId, itemId) {
    if (!confirm("Delete this image?")) return;

    $.ajax({
        url: "http://localhost:3000/api/items/image/" + imageId,
        method: "DELETE",

        success: function () {
            $(`#img-${imageId}`).remove();
            loadItems();
        },

        error: function (xhr) {
            console.log(xhr.responseText);
            alert(xhr.responseJSON?.message || "Image delete failed");
        }
    });
}

/* =========================
DELETE ITEM
========================= */
function deleteItem(id) {
    if (!confirm("Delete item?")) return;

    $.ajax({
        url: `http://localhost:3000/api/items/delete/${id}`,
        method: "DELETE",

        success: function () {
            loadItems();
        },

        error: function (xhr) {
            console.log(xhr.responseText);
            alert(xhr.responseJSON?.message || "Delete failed");
        }
    });
}

/* =========================
CLOSE MODAL
========================= */
function closeModal() {
    $("#editModal").fadeOut();
}