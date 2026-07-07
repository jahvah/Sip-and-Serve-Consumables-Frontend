let table;

let mode = "pagination";
let offset = 0;
let limit = 10;
let loading = false;
let hasMore = true;

$(document).ready(function () {

    mode = localStorage.getItem("reviewViewMode") || "pagination";
    $("#viewMode").val(mode);

    initTable();
    loadReviews(true);

    $("#viewMode").change(function () {

        mode = $(this).val();

        localStorage.setItem("reviewViewMode", mode);

        resetReviews();

    });

});


/* =========================
TABLE INIT
========================= */

function initTable() {

    if ($.fn.DataTable.isDataTable("#reviewTable")) {

        $("#reviewTable").DataTable().destroy();
        $("#reviewTable tbody").empty();

    }

    table = $("#reviewTable").DataTable({

        data: [],

        paging: mode === "pagination",
        pageLength: limit,

        searching: false,
        info: false,
        ordering: true,

        scrollY: mode === "scroll" ? "500px" : false,
        scrollCollapse: mode === "scroll",

        columns: [

            {
                data: "review_id"
            },

            {
                data: "customer_name"
            },

            {
                data: "item_name"
            },

            {
                data: "item_image",

                render: function (data) {

                    if (!data)
                        return "No Image";

                    return `
                        <img src="http://localhost:3000/${data}"
                        width="60"
                        height="60"
                        class="rounded">
                    `;

                }

            },

            {
                data: "rating",

                render: function (data) {

                    let stars = "";

                    for (let i = 1; i <= 5; i++) {

                        stars += i <= data
                            ? `<i class="fa-solid fa-star text-warning"></i>`
                            : `<i class="fa-regular fa-star text-warning"></i>`;

                    }

                    return stars;

                }

            },

            {
                data: "review_text",

                render: function (data) {

                    return data || "No review";

                }

            },

            {
                data: "review_images",

                render: function (images) {

                    if (!images || images.length === 0)
                        return "No Images";

                    let html = "";

                    images.forEach(img => {

                        html += `
                            <img src="http://localhost:3000/uploads/reviews/${img.image_path}"
                            width="50"
                            height="50"
                            class="rounded me-1">
                        `;

                    });

                    return html;

                }

            },

            {
                data: null,

                render: function (data) {

                    const date = data.created_at || data.createdAt;

                    return date
                        ? new Date(date).toLocaleDateString()
                        : "";

                }

            }

        ]

    });

    if (mode === "scroll") {

        $("#reviewTable_wrapper .dataTables_scrollBody")
            .off("scroll")
            .on("scroll", function () {

                if (loading || !hasMore)
                    return;

                const scrollTop = $(this).scrollTop();
                const scrollHeight = this.scrollHeight;
                const clientHeight = this.clientHeight;

                if (scrollTop + clientHeight >= scrollHeight - 50) {

                    loadReviews(false);

                }

            });

    }

}


/* =========================
LOAD REVIEWS
========================= */

function loadReviews(reset = false) {

    if (loading)
        return;

    loading = true;

    if (reset) {

        offset = 0;
        hasMore = true;

        table.clear().draw();

    }

    let url = "http://localhost:3000/api/reviews/admin";

    if (mode === "scroll") {

        url += `?limit=${limit}&offset=${offset}`;

    }

    $.ajax({

        url: url,
        method: "GET",

        success: function (res) {

            const data = res.reviews || res.data || [];

            if (!Array.isArray(data)) {

                console.log(res);
                loading = false;
                return;

            }

            if (mode === "scroll") {

                if (data.length < limit)
                    hasMore = false;

                offset += data.length;

                table.rows.add(data).draw(false);

            } else {

                table.clear();
                table.rows.add(data).draw();

            }

            loading = false;

        },

        error: function (xhr) {

            console.log(xhr.responseText);

            alert("Failed to load reviews");

            loading = false;

        }

    });

}


/* =========================
RESET
========================= */

function resetReviews() {

    offset = 0;
    hasMore = true;

    initTable();

    loadReviews(true);

}