let currentUser = null;

$(document).ready(function () {

    loadProfile();

    $("#editBtn").click(openEditModal);
    $("#closeBtn").click(() => $("#editModal").hide());
    $("#saveBtn").click(updateProfile);

    $(".ghost-input").on("input", function () {

        const bg = $("#" + $(this).data("bg"));

        if ($(this).val().trim() === "") {
            bg.show();
        } else {
            bg.hide();
        }

    });

});


/* =========================
   LOAD PROFILE
========================= */
function loadProfile() {

    const user = JSON.parse(localStorage.getItem("user"));
    const user_id = user?.id;

    if (!user_id) {
        alert("No user logged in");
        return;
    }

    $.ajax({

        url: `http://localhost:3000/api/customer/profile?user_id=${user_id}`,
        method: "GET",

        success: function (res) {

            currentUser = res;

            $("#profilePic").attr(
                "src",
                "http://localhost:3000/" + res.profile_image
            );

            $("#email").text(res.email);
            $("#role").text(res.role);
            $("#status").text(res.status);

            $("#fullName").text(
                `${res.title ? res.title + " " : ""}${res.fname} ${res.lname}`
            );

            $("#displayAddress").text(res.addressline || "");
            $("#displayTown").text(res.town || "");
            $("#displayPhone").text(res.phone || "");

        },

        error: function () {

            alert("Failed to load profile.");

        }

    });

}


/* =========================
   OPEN EDIT MODAL
========================= */
function openEditModal() {

    if (!currentUser) return;

    // Current values
    $("#title").val(currentUser.title || "");

    // Clear file input
    $("#profileImage").val("");

    // Clear editable inputs
    $("#fname").val("");
    $("#lname").val("");
    $("#addressline").val("");
    $("#town").val("");
    $("#phone").val("");

    // Show current values behind inputs
    $("#bg-fname").text(currentUser.fname || "").show();
    $("#bg-lname").text(currentUser.lname || "").show();
    $("#bg-addressline").text(currentUser.addressline || "").show();
    $("#bg-town").text(currentUser.town || "").show();
    $("#bg-phone").text(currentUser.phone || "").show();

    $("#editModal").show();

}


/* =========================
   UPDATE PROFILE
========================= */
function updateProfile() {

    const formData = new FormData();

    formData.append("user_id", currentUser.id);
    formData.append("title", $("#title").val());
    formData.append("fname", $("#fname").val());
    formData.append("lname", $("#lname").val());
    formData.append("addressline", $("#addressline").val());
    formData.append("town", $("#town").val());
    formData.append("phone", $("#phone").val());

    const file = $("#profileImage")[0].files[0];

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

            $("#editModal").hide();

            loadProfile();

        },

        error: function (xhr) {

            alert(xhr.responseJSON?.message || "Update failed");

        }

    });

}