$("#registerBtn").click(function () {

    $.ajax({
        url: "http://localhost:3000/api/users/register",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            name: $("#name").val(),
            email: $("#email").val(),
            password: $("#password").val()
        }),

        success: function (res) {

            localStorage.setItem("userId", res.user_id);

            window.location.href = "completeInformation.html";
        },

        error: function (err) {
            alert(err.responseJSON?.message || "Error");
        }
    });

});