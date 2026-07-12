$("#registerBtn").click(function () {

    $.ajax({
        url: "http://localhost:3000/api/users/register",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({
            email: $("#email").val(),
            password: $("#password").val()
        }),

        success: function (res) {

            $("#msg")
                .css("color", "green")
                .text(res.message);

            $("#registerBtn").prop("disabled", true);

        },

        error: function (err) {
            alert(err.responseJSON?.message || "Error");
        }
    });

});