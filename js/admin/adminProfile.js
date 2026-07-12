const BASE_URL = "http://localhost:3000/";

let currentProfile = null;

$(document).ready(function () {

    loadProfile();

    $("#editBtn").click(openModal);

    $("#closeBtn").click(function () {

        $("#editModal").hide();

    });

    $("#saveBtn").click(updateProfile);


      $("#profileImage").change(function () {

      const file = this.files[0];

      if (!file) return;

      const reader = new FileReader();

      reader.onload = function (e) {

          $("#profilePic").attr(
              "src",
              e.target.result
          );

      };

      reader.readAsDataURL(file);

  });
});


/* =========================
LOAD PROFILE
========================= */

function loadProfile() {

    $.ajax({

        url: BASE_URL + "api/users/profile",

        method: "GET",

        headers: {

            Authorization:
                "Bearer " +
                localStorage.getItem("token")

        },

        success: function (user) {

            currentProfile = user;

            if(user.profile_image){

                $("#profilePic").attr(

                    "src",

                    BASE_URL + user.profile_image

                );

            }

            $("#email").text(user.email);

            $("#role").text(user.role);

            $("#status").text(user.status);

        },

        error:function(){

            alert("Unable to load profile.");

        }

    });

}


/* =========================
OPEN MODAL
========================= */

function openModal(){

    $("#emailInput").val(currentProfile.email);

    $("#password").val("");

    $("#confirmPassword").val("");

    $("#profileImage").val("");

    $("#previewImage").attr(
        "src",
        $("#profilePic").attr("src")
    );

    $("#editModal").show();

}


/* =========================
UPDATE PROFILE
========================= */

function updateProfile(){

    if(

        $("#password").val() !==
        $("#confirmPassword").val()

    ){

        alert("Passwords do not match.");

        return;

    }

    const formData = new FormData();

    formData.append(

        "email",

        $("#emailInput").val()

    );

    formData.append(

        "password",

        $("#password").val()

    );

    const file = $("#profileImage")[0].files[0];

    if(file){

        formData.append(

            "profile_image",

            file

        );

    }

    $.ajax({

        url:BASE_URL + "api/users/profile",

        method:"PUT",

        headers:{

            Authorization:
            "Bearer " +
            localStorage.getItem("token")

        },

        processData:false,

        contentType:false,

        data:formData,

        success: function (res) {

        alert(res.message);

        $("#editModal").hide();

        // Email was changed
        if (res.emailChanged) {

            localStorage.removeItem("token");

            localStorage.removeItem("user");

            alert(
                "A verification email has been sent to your new email address. Please verify it before logging in again."
            );

            window.location.href = "/html/login.html";

            return;

        }

        // Email did not change
        const user = JSON.parse(localStorage.getItem("user"));

        user.email = $("#emailInput").val().trim();

        localStorage.setItem(
            "user",
            JSON.stringify(user)
        );

        loadProfile();

    },

        error:function(xhr){

            alert(

                xhr.responseJSON?.message ||
                "Update failed."

            );

        }

    });

}