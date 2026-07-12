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
        window.location.href = "/html/admin/adminDashboard.html";
    }
    else if (res.user.role === "User") {
        window.location.href = "../html/home.html";
    }
    else {
        $("#msg").css("color", "red");
        $("#msg").text("Unknown user role.");
    }
},

        error: function (err) {

            const response = err.responseJSON;

            $("#msg").css("color", "red");

            $("#msg").text(
                response?.message || "Login failed"
            );

            if (response?.verified === false) {

                $("#resendVerificationBtn").show();

            }
            else {

                $("#resendVerificationBtn").hide();

            }

        }

    });

});

$("#resendVerificationBtn").click(function(){

    $.ajax({

        url:
"http://localhost:3000/api/users/resend-verification",

        method:"POST",

        contentType:"application/json",

        data:JSON.stringify({

            email:$("#email").val()

        }),

        success:function(res){

            $("#msg")
                .css("color","green")
                .text(res.message);

        },

        error:function(err){

            $("#msg")
                .css("color","red")
                .text(

                    err.responseJSON?.message ||

                    "Unable to resend email."

                );

        }

    });

});