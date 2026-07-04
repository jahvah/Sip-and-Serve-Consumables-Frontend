$(document).ready(function () {

    $("#saveBtn").click(function (e) {

        e.preventDefault();

        let formData = new FormData();

        // USER ID (IMPORTANT)
        formData.append("user_id", localStorage.getItem("userId"));

        // TEXT FIELDS
        formData.append("title", $("#title").val());
        formData.append("fname", $("#fname").val());
        formData.append("lname", $("#lname").val());
        formData.append("addressline", $("#address").val());
        formData.append("town", $("#town").val());
        formData.append("phone", $("#phone").val());

        // IMAGE FILE
        let file = $("#profileImage")[0].files[0];

        if (file) {
            formData.append("profile_image", file);
        }

        $.ajax({

            url: "http://localhost:3000/api/customer/profile",
            method: "PUT",
            data: formData,
            processData: false,
            contentType: false,

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