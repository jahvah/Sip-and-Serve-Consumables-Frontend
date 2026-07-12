$(document).ready(function () {

    let user = localStorage.getItem("user");

    // =========================
    // GUEST HEADER
    // =========================
    if (!user) {
        $("#header").load("/html/includes/guestHeader.html");
        return;
    }

    let userData = JSON.parse(user);

    // =========================
    // LOAD CUSTOMER NAME
    // =========================
    function loadCustomerName() {

        $.ajax({
            url: "http://localhost:3000/api/customer/profile?user_id=" + userData.id,
            method: "GET",

            success: function (res) {

                let fullName =
                    (res.title ? res.title + " " : "") +
                    (res.fname || "") + " " +
                    (res.lname || "");

                $("#username").text(fullName.trim() || "User");
            },

            error: function () {
                $("#username").text("User");
            }
        });
    }

    // =========================
    // LOAD ADMIN INFO
    // =========================
    function loadAdminInfo() {

        $("#username").text(userData.email);

    }

    // =========================
    // ADMIN HEADER
    // =========================
    if (userData.role === "Admin") {

        $("#header").load("/html/includes/adminHeader.html", function () {

            $("#username").text(userData.email);

            $("#logoutBtn").click(function (e) {
                e.preventDefault();

                localStorage.removeItem("user");
                localStorage.removeItem("token");

                window.location.href = "/html/home.html";
            });

        });

    } 
    // =========================
    // CUSTOMER HEADER
    // =========================
    else {

        $("#header").load("/html/includes/customerHeader.html", function () {

            loadCustomerName();

            loadCartCount(userData.id);

            setInterval(function () {
                loadCartCount(userData.id);
            }, 2000);

            $("#logoutBtn").click(function (e) {
                e.preventDefault();

                localStorage.removeItem("user");
                localStorage.removeItem("token");

                window.location.href = "/html/home.html";
            });

        });
    }

});


// =========================
// CART COUNT
// =========================
function loadCartCount(userId) {

    $.ajax({
        url: "http://localhost:3000/api/cart/" + userId,
        method: "GET",

        success: function (cart) {

            let total = 0;

            cart.forEach(function (c) {
                total += Number(c.quantity);
            });

            $("#cartCount").text(total);
        },

        error: function () {
            $("#cartCount").text("0");
        }
    });
}