let allItems = [];

$(document).ready(function () {

  // 1. FETCH PRODUCTS ON LOAD
  $.ajax({
    url: "http://localhost:3000/api/items",
    method: "GET",
    success: function (items) {

      allItems = items;
      renderProducts(items);
    },
    error: function (err) {
      console.log(err);
    }
  });

  // 2. RENDER PRODUCTS
  function renderProducts(items) {

    
    let html = "";

    items.forEach(item => {

      let image = "";

      if (item.images && item.images.length > 0) {
        image = item.images[0].image_path;
      } else {
        image = item.image;
      }

      html += `
        <div class="card">
          <img src="${image}" />

          <h3>${item.item_name}</h3>
          <p>${item.description.substring(0, 60)}...</p>
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

  // 3. VIEW IMAGES MODAL
  $(document).on("click", ".viewBtn", function () {

    let id = $(this).data("id");

    let item = allItems.find(i => i.item_id == id);

    if (!item) return;

    $("#modalTitle").text(item.item_name);

    let imgHtml = "";

    item.images.forEach(img => {
      imgHtml += `<img src="${img.image_path}" />`;
    });

    $("#modalImages").html(imgHtml);

    $("#productModal").fadeIn();
  });

  // 4. CLOSE MODAL
  $("#closeModal").click(function () {
    $("#productModal").fadeOut();
  });

  $(window).click(function (e) {
    if (e.target.id === "productModal") {
      $("#productModal").fadeOut();
    }
  });

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
            quantity: quantity
        }),
        
        success: function (res) {
        alert(res.message);
            },
        error: function (xhr) {
        alert(xhr.responseJSON.message);
}
    });

});

  // 6. LOGIN MODAL BUTTONS

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