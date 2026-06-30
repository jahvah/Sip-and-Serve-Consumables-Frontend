$(document).ready(function () {

    let user = localStorage.getItem("user");

    if (!user) {

        $("#header").load("/html/includes/guestHeader.html");

        return;
    }

    let userData = JSON.parse(user);

    if (userData.role === "Admin") {

        $("#header").load("/html/includes/adminHeader.html", function () {

            $("#username").text(userData.name);

            $("#logoutBtn").click(function (e) {

                e.preventDefault();

                localStorage.removeItem("user");

                window.location.href = "/html/home.html";

            });

        });

    }

    else {

        $("#header").load("/html/includes/customerHeader.html", function () {

            $("#username").text(userData.name);

            // Initial load
            loadCartCount(userData.id);

            // Auto-update every 2 seconds
            setInterval(function () {

                loadCartCount(userData.id);

            }, 2000);

            $("#logoutBtn").click(function (e) {

                e.preventDefault();

                localStorage.removeItem("user");

                window.location.href = "/html/home.html";

            });

        });

    }

});

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