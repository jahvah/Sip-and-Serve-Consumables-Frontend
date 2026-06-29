$("#loginBtn").click(function () {

    $.ajax({

        url: "http://localhost:3000/api/users/login",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({

            email: $("#email").val(),
            password: $("#password").val()

        }),

        
        success: function (res) {

    $("#msg").css("color", "green");
    $("#msg").text(res.message);

    // Save token
    localStorage.setItem("token", res.token);

    // Save user
    localStorage.setItem("user", JSON.stringify(res.user));

    // Redirect based on role
    if (res.user.role === "Admin") {
        window.location.href = "../html/adminDashboard.html";
    }
    else if (res.user.role === "User") {
        window.location.href = "../html/customerDashboard.html";
    }
    else {
        $("#msg").css("color", "red");
        $("#msg").text("Unknown user role.");
    }
},

        error: function (err) {

            $("#msg").css("color", "red");

            $("#msg").text(
                err.responseJSON?.message || "Login failed"
            );
        }

    });

});