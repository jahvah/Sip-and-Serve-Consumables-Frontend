$(document).ready(function () {

    let user = localStorage.getItem("user");

    if (!user) {

        $("#header").load("/html/includes/guestHeader.html");
        return;
    }

    let userData = JSON.parse(user);

    function loadCustomerName() {

        $.ajax({
            url: "http://localhost:3000/api/users/customer/" + userData.id,
            method: "GET",
            success: function (customer) {

                let fullName = (customer.fname || "") + " " + (customer.lname || "");

                $("#username").text(fullName.trim() || "User");
            },
            error: function () {
                $("#username").text("User");
            }
        });
    }

    if (userData.role === "Admin") {

        $("#header").load("/html/includes/adminHeader.html", function () {

            $("#logoutBtn").click(function (e) {

                e.preventDefault();
                localStorage.removeItem("user");
                window.location.href = "/html/home.html";
            });

        });

    } else {

        $("#header").load("/html/includes/customerHeader.html", function () {

            loadCustomerName();

            loadCartCount(userData.id);

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