const API = "http://localhost:3000";

let user_id = null;
let customer_id = null;

let createRating = 0;
let editRating = 0;

$(document).ready(function () {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.id) {
        console.log("No user found in localStorage");
        return;
    }

    user_id = user.id;

    getCustomer();
    loadPending();
    loadReviews();
});

/* =========================
   GET CUSTOMER ID
========================= */
function getCustomer() {
    $.get(`${API}/api/reviews/customer?user_id=${user_id}`, function (res) {
        customer_id = res.customer_id;
    });
}

/* =========================
   STAR RATING (CREATE)
========================= */
$(document).on("click", "#starContainer .star", function () {
    createRating = $(this).data("value");

    $("#starContainer .star").removeClass("selected");
    $(this).prevAll().addBack().addClass("selected");
});

/* =========================
   STAR RATING (EDIT)
========================= */
$(document).on("click", "#e_starContainer .star", function () {
    editRating = $(this).data("value");

    $("#e_starContainer .star").removeClass("selected");
    $(this).prevAll().addBack().addClass("selected");
});

/* =========================
   LOAD PENDING
========================= */
function loadPending() {

    $.get(`${API}/api/reviews/pending?user_id=${user_id}`, function (res) {

        let html = "";

        (res.pending || []).forEach(p => {

            const img = p.image
                ? `${API}/${p.image}`   // FIXED PATH
                : '/img/no-image.png';

            html += `

                <div class="pending-card shadow-card">

                    <div class="pending-left">

                        <img

                            src="${img}"

                            class="pending-image">

                        <div>

                            <h4>

                                ${p.item_name}

                            </h4>

                            <p>

                                Quantity:
                                ${p.quantity}

                            </p>

                            <small>

                                Delivered

                                ${p.date_delivered || ""}

                            </small>

                        </div>

                    </div>

                    <button

                        class="btn btn-primary"

                        onclick="openCreate(${p.orderinfo_id},${p.item_id})">

                        <i class="fa-solid fa-pen"></i>

                        Write Review

                    </button>

                </div>

                `;
        });

        if(!html){

            html=`

            <div class="empty-state">

            <i class="fa-solid fa-circle-check"></i>

            <h3>

            You're all caught up!

            </h3>

            <p>

            No products are waiting for a review.

            </p>

            </div>

            `;

            }

            $("#pendingContainer").html(html);
        $("#pendingCount").text(res.pending.length);

    }).fail(err => console.log(err));
}

/* =========================
   LOAD REVIEWS
========================= */
function loadReviews() {

    $.get(`${API}/api/reviews/history?user_id=${user_id}`, function (res) {

        let html = "";

        (res.reviews || []).forEach(r => {

            let images = "";

            (r.review_images || []).forEach(img => {
                if (img?.image_path) {
                    images += `<img src="${API}/uploads/reviews/${img.image_path}" class="review-img">`;
                }
            });

            const itemImage =

                r.item?.image

                ?

                `${API}/${r.item.image}`

                :

                "/img/no-image.png";

                const stars =

                "★".repeat(r.rating || 0)

                +

                "☆".repeat(5-(r.rating||0));

            html += `

                <div class="review-top">

                <img

                src="${itemImage}"

                class="review-product-image">

                <div class="review-info">

                <h4>

                ${r.item?.item_name}

                </h4>

                <div class="rating">

                ${stars}

                </div>

                </div>

                </div>

                <p class="review-text">

                ${r.review_text || ""}

                </p>

                <div class="review-gallery">

                ${images}

                </div>

                <div class="review-actions">

                <button

                class="btn btn-outline-warning"

                onclick="openEditById(${r.review_id})">

                <i class="fa-solid fa-pen"></i>

                Edit

                </button>

                <button

                class="btn btn-outline-primary"

                onclick="openViewById(${r.review_id})">

                <i class="fa-solid fa-eye"></i>

                View

                </button>

                </div>

                </div>

                `;
        });

        if(!html){

            html=`

                <div class="empty-state">

                <div class="empty-icon">

                <i class="fa-regular fa-star"></i>

                </div>

                <h3>

                No Reviews Yet

                </h3>

                <p>

                Your submitted reviews will appear here once you've reviewed a purchased product.

                </p>

                </div>

                `;

            }

            $("#reviewContainer").html(html);
        $("#reviewCount").text(res.reviews.length);

    }).fail(err => console.log(err));
}

/* =========================
   OPEN CREATE
========================= */
function openCreate(orderinfo_id, item_id) {

    $("#c_orderinfo_id").val(orderinfo_id);
    $("#c_item_id").val(item_id);

    $("#c_review_text").val("");
    $("#c_images").val("");

    createRating = 0;
    $("#starContainer .star").removeClass("selected");

    $("#createModal").modal("show");
}

/* =========================
   CREATE REVIEW
========================= */
$("#btnSaveReview").click(function () {

    const formData = new FormData();

    formData.append("customer_id", customer_id);
    formData.append("orderinfo_id", $("#c_orderinfo_id").val());
    formData.append("item_id", $("#c_item_id").val());
    formData.append("rating", createRating);
    formData.append("review_text", $("#c_review_text").val());

    const files = $("#c_images")[0].files;

    for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
    }

    $.ajax({
        url: `${API}/api/reviews`,
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function () {
            $("#createModal").modal("hide");
            loadPending();
            loadReviews();
        },
        error: function (err) {
            console.log(err.responseJSON || err);
        }
    });
});

/* =========================
   OPEN EDIT
========================= */
function openEditById(id) {

    $.get(`${API}/api/reviews/${id}`, function (res) {
        if (res.review) openEdit(res.review);
    });
}

function openEdit(r) {

    $("#e_review_id").val(r.review_id);
    $("#e_review_text").val(r.review_text);

    editRating = r.rating || 0;

    $("#e_starContainer .star").removeClass("selected");

    $("#e_starContainer .star").each(function () {
        if ($(this).data("value") <= editRating) {
            $(this).addClass("selected");
        }
    });

    let html = "";

    (r.review_images || []).forEach(img => {
        html += `
        <label>
            <input type="checkbox" class="delete-img" value="${img.reviewimg_id}">
            <img src="${API}/uploads/reviews/${img.image_path}" class="review-img">
        </label>`;
    });

    $("#e_existing_images").html(html);
    $("#editModal").modal("show");
}

/* =========================
   UPDATE REVIEW
========================= */
$("#btnUpdateReview").click(function () {

    const formData = new FormData();

    const review_id = $("#e_review_id").val();

    formData.append("rating", editRating);
    formData.append("review_text", $("#e_review_text").val());

    const files = $("#e_images")[0].files;

    for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
    }

    let deleteImgs = [];

    $(".delete-img:checked").each(function () {
        deleteImgs.push($(this).val());
    });

    formData.append("delete_images", JSON.stringify(deleteImgs));

    $.ajax({
        url: `${API}/api/reviews/${review_id}`,
        type: "PUT",
        data: formData,
        processData: false,
        contentType: false,
        success: function () {
            $("#editModal").modal("hide");
            loadReviews();
        },
        error: function (err) {
            console.log(err.responseJSON || err);
        }
    });
});

/* =========================
   VIEW REVIEW
========================= */
function openViewById(id) {

    $.get(`${API}/api/reviews/${id}`, function (res) {
        if (res.review) openView(res.review);
    });
}

function openView(r) {

    let images = "";

    (r.review_images || []).forEach(img => {
        images += `<img src="${API}/uploads/reviews/${img.image_path}" class="review-img">`;
    });

    $("#view_content").html(`

<div class="view-review">

<h3>

${r.item?.item_name}

</h3>

<div class="rating">

${"★".repeat(r.rating)}

${"☆".repeat(5-r.rating)}

</div>

<p>

${r.review_text}

</p>

<div class="review-gallery">

${images}

</div>

</div>

`);

    $("#viewModal").modal("show");
}