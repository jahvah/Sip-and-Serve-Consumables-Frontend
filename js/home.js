let allItems = [];

const BASE_URL = "http://localhost:3000/";

$(document).ready(function () {
  // FETCH PRODUCTS ON LOAD
  $.ajax({
    url: "http://localhost:3000/api/items/all",
    method: "GET",
    success: function (res) {
      allItems = res.items || [];
      renderProducts(allItems);
    },
    error: function (err) {
      console.log(err);
    },
  });

  // RENDER PRODUCTS
  function renderProducts(items) {
    let html = "";

    items.forEach((item) => {
      let image = "https://via.placeholder.com/200";

      if (item.image) {
        image = BASE_URL + item.image;
      } else if (item.images?.length > 0) {
        image = BASE_URL + item.images[0].image_path;
      }

      html += `
        <div class="card" data-id="${item.item_id}">
          <img src="${image}" />

          <h3>${item.item_name}</h3>
          <p>${(item.description || "").substring(0, 60)}...</p>
          <p class="price">₱${item.sell_price}</p>
          <p class="stock">Stock: ${item.stock?.quantity ?? 0}</p>
          <p class="category">${item.category?.description ?? ""}</p>

          <input
            type="number"
            class="qtyInput"
            min="1"
            value="1"
          />

          <button class="viewBtn" data-id="${item.item_id}">
            View Images
          </button>

          <button class="cartBtn" data-id="${item.item_id}">
            Add to Cart
          </button>
        </div>
      `;
    });

    $("#productGrid").html(html);
  }

  $(document).on("click", ".card", function (e) {
    if ($(e.target).closest("button, input, a").length) return;

    const itemId = $(this).data("id");
    window.location.href =
      window.location.origin + "/html/product.html?id=" + itemId;
  });

  // VIEW IMAGES MODAL
  $(document).on("click", ".viewBtn", function (e) {
    e.stopPropagation();

    let id = $(this).data("id");

    let item = allItems.find((i) => i.item_id == id);

    if (!item) return;

    $("#modalTitle").text(item.item_name);

    let imgHtml = "";

    (item.images || []).forEach((img) => {
      imgHtml += `<img src="${BASE_URL + img.image_path}" />`;
    });

    $("#modalImages").html(imgHtml);

    $("#productModal").fadeIn();
  });

  // CLOSE MODAL
  $("#closeModal").click(function () {
    $("#productModal").fadeOut();
  });

  $(window).click(function (e) {
    if (e.target.id === "productModal") {
      $("#productModal").fadeOut();
    }
  });

  // ADD TO CART
  $(document).on("click", ".cartBtn", function () {
    let user = localStorage.getItem("user");

    if (!user) {
      $("#loginModal").fadeIn();
      return;
    }

    let userData = JSON.parse(user);

    let itemId = $(this).data("id");

    let card = $(this).closest(".card");

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
        quantity: quantity,
      }),

      success: function (res) {
        alert(res.message);
      },

      error: function (xhr) {
        alert(xhr.responseJSON?.message || "Error adding to cart");
      },
    });
  });

  // LOGIN MODAL
  $(document).on("click", "#goLoginBtn", function () {
    window.location.href = "/html/login.html";
  });

  $(document).on("click", "#closeLoginModal", function () {
    $("#loginModal").fadeOut();
  });

  $(window).on("click", function (e) {
    if (e.target.id === "loginModal") {
      $("#loginModal").fadeOut();
    }
  });
});
