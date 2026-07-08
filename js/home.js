let allItems = [];

const BASE_URL = "http://localhost:3000/";

let searchTimer;

$(document).ready(function () {

    // =========================
    // FETCH PRODUCTS ON LOAD
    // =========================
    $.ajax({
        url: "http://localhost:3000/api/items/all",
        method: "GET",
        success: function (res) {

            allItems = res.items || [];

            renderProducts(allItems);

        },
        error: function (err) {
            console.log(err);
        }
    });

    // =========================
    // SEARCH AUTOCOMPLETE
    // =========================
    $("#searchInput").on("keyup", function () {

        clearTimeout(searchTimer);

        const keyword = $(this).val().trim();

        if (keyword.length === 0) {

            $("#autocompleteList").hide();

            renderProducts(allItems);

            return;

        }

        // Live filter cards immediately
        const filtered = allItems.filter(item =>
            item.item_name.toLowerCase().includes(keyword.toLowerCase())
        );

        renderProducts(filtered);

        searchTimer = setTimeout(function () {

            $.ajax({

                url: "http://localhost:3000/api/items/search",

                method: "GET",

                data: {
                    keyword: keyword
                },

                success: function (res) {

                    let html = "";

                    res.items.forEach(item => {

                        html += `
                            <div class="autocomplete-item"
                                 data-id="${item.item_id}">
                                ${item.item_name}
                            </div>
                        `;

                    });

                    if (html === "") {

                        $("#autocompleteList").hide();

                    } else {

                        $("#autocompleteList")
                            .html(html)
                            .show();

                    }

                }

            });

        }, 300);

    });

    // =========================
    // ENTER KEY
    // =========================
    $("#searchInput").keypress(function (e) {

        if (e.which === 13) {

            e.preventDefault();

            $("#autocompleteList").hide();

        }

    });

    // =========================
    // CLICK AUTOCOMPLETE
    // =========================
    $(document).on("click", ".autocomplete-item", function () {

        const id = $(this).data("id");

        $("#searchInput").val($(this).text());

        $("#autocompleteList").hide();

        window.location.href =
            window.location.origin +
            "/html/product.html?id=" +
            id;

    });

    // =========================
    // HIDE AUTOCOMPLETE
    // =========================
    $(document).click(function (e) {

        if (!$(e.target).closest(".search-container").length) {

            $("#autocompleteList").hide();

        }

    });

    // =========================
    // PRODUCT CARD CLICK
    // =========================
    $(document).on("click", ".card", function (e) {

        if ($(e.target).closest("button, input, a").length) return;

        const itemId = $(this).data("id");

        window.location.href =
            window.location.origin +
            "/html/product.html?id=" +
            itemId;

    });

    // =========================
    // VIEW IMAGES
    // =========================
    $(document).on("click", ".viewBtn", function (e) {

        e.stopPropagation();

        const id = $(this).data("id");

        const item = allItems.find(i => i.item_id == id);

        if (!item) return;

        $("#modalTitle").text(item.item_name);

        let imgHtml = "";

        (item.images || []).forEach(img => {

            imgHtml += `
                <img src="${BASE_URL + img.image_path}">
            `;

        });

        $("#modalImages").html(imgHtml);

        $("#productModal").fadeIn();

    });

    // =========================
    // CLOSE PRODUCT MODAL
    // =========================
    $("#closeModal").click(function () {

        $("#productModal").fadeOut();

    });

    $(window).click(function (e) {

        if (e.target.id === "productModal") {

            $("#productModal").fadeOut();

        }

    });

    // =========================
    // ADD TO CART
    // =========================
    $(document).on("click", ".cartBtn", function () {

        const user = localStorage.getItem("user");

        if (!user) {

            $("#loginModal").fadeIn();

            return;

        }

        const userData = JSON.parse(user);

        const itemId = $(this).data("id");

        const card = $(this).closest(".card");

        let quantity = Number(card.find(".qtyInput").val());

        if (!quantity || quantity < 1) {

            quantity = 1;

        }

        $.ajax({

            url: "http://localhost:3000/api/cart/add",

            method: "POST",

            contentType: "application/json",

            data: JSON.stringify({

                user_id: userData.id,

                item_id: itemId,

                quantity: quantity

            }),

            success: function (res) {

                alert(res.message);

            },

            error: function (xhr) {

                alert(xhr.responseJSON?.message || "Error adding to cart");

            }

        });

    });

    // =========================
    // LOGIN MODAL
    // =========================
    $("#goLoginBtn").click(function () {

        window.location.href = "/html/login.html";

    });

    $("#closeLoginModal").click(function () {

        $("#loginModal").fadeOut();

    });

    $(window).click(function (e) {

        if (e.target.id === "loginModal") {

            $("#loginModal").fadeOut();

        }

    });

});

// =========================
// RENDER PRODUCTS
// =========================
function renderProducts(items) {

    let html = "";

    items.forEach(item => {

        let image = "https://via.placeholder.com/200";

        if (item.image) {

            image = BASE_URL + item.image;

        }

        else if (item.images?.length > 0) {

            image = BASE_URL + item.images[0].image_path;

        }

        html += `

        <div class="card" data-id="${item.item_id}">

            <img src="${image}">

            <h3>${item.item_name}</h3>

            <p>${(item.description || "").substring(0,60)}...</p>

            <p class="price">₱${item.sell_price}</p>

            <p class="stock">Stock: ${item.stock?.quantity ?? 0}</p>

            <p class="category">${item.category?.description ?? ""}</p>

            <input
                type="number"
                class="qtyInput"
                min="1"
                value="1">

            <button
                class="viewBtn"
                data-id="${item.item_id}">
                View Images
            </button>

            <button
                class="cartBtn"
                data-id="${item.item_id}">
                Add to Cart
            </button>

        </div>

        `;

    });

    $("#productGrid").html(html);

}