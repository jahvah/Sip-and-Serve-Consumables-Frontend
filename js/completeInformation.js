$(document).ready(function () {

    $("#saveBtn").click(function (e) {

        e.preventDefault();

        $.ajax({
            url: "http://localhost:3000/api/customer/profile",
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify({
                user_id: localStorage.getItem("userId"),
                title: $("#title").val(),
                fname: $("#fname").val(),
                lname: $("#lname").val(),
                addressline: $("#address").val(),
                town: $("#town").val(),
                phone: $("#phone").val()
            }),

            success: function (res) {
                alert(res.message);
                window.location.href = "login.html";
            },

            error: function (err) {
                alert(err.responseJSON?.message || "Update failed");
            }
        });

    });

});