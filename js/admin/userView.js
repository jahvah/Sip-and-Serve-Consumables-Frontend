let table;

$(document).ready(function () {

    const savedMode = localStorage.getItem("viewMode") || "pagination";

    $("#viewMode").val(savedMode);

    loadUsers();

    $("#viewMode").change(function () {

        localStorage.setItem("viewMode", $(this).val());

        loadUsers();

    });

});

function loadUsers() {

    $.ajax({
        url: "http://localhost:3000/api/users/all",
        method: "GET",

        success: function (res) {

            if ($.fn.DataTable.isDataTable("#usersTable")) {
                $("#usersTable").DataTable().destroy();
            }

            let mode = $("#viewMode").val() || "pagination";

            table = $("#usersTable").DataTable({

                destroy: true,

                data: res.users || [],

                paging: mode === "pagination",

                scrollY: mode === "scroll" ? "500px" : false,

                scrollCollapse: true,

                scroller: mode === "scroll",

                columns: [

                    { data: "id" },
                    { data: "email" },
                    { data: "role" },
                    { data: "status" },

                    {
                        data: "customer",
                        render: c => c?.fname || ""
                    },

                    {
                        data: "customer",
                        render: c => c?.lname || ""
                    },

                    {
                        data: "customer",
                        render: c => c?.phone || ""
                    },

                    {
                        data: "customer",
                        render: c => c?.addressline || ""
                    },

                    {
                        data: "customer",
                        render: c => c?.town || ""
                    },

                    {
                        data: "customer",
                        render: function (c) {

                            if (!c?.image_path) {
                                return "No Image";
                            }

                            return `
                                <img
                                    src="http://localhost:3000${c.image_path}"
                                    width="50"
                                    height="50"
                                    style="object-fit:cover;border-radius:50%;"
                                >
                            `;
                        }
                    },

                    {
                        data: null,
                        render: function (data) {

                            return `
                                <button onclick='editUser(${JSON.stringify(data)})'>
                                    Edit
                                </button>

                                <button onclick='deleteUser(${data.id})'>
                                    Delete
                                </button>
                            `;
                        }
                    }

                ]

            });

        }

    });

}


$("#saveCreate").click(function () {

        if (
        $("#createEmail").val().trim() === "" ||
        $("#createPassword").val().trim() === "" ||
        $("#createFname").val().trim() === "" ||
        $("#createLname").val().trim() === "" ||
        $("#createPhone").val().trim() === "" ||
        $("#createAddress").val().trim() === "" ||
        $("#createTown").val().trim() === ""
    ) {
        alert("All fields are required.");
        return;
    }

    

    
    let formData = new FormData();

    formData.append("email", $("#createEmail").val());
    formData.append("password", $("#createPassword").val());
    formData.append("role", $("#createRole").val());
    formData.append("status", $("#createStatus").val());

    formData.append("fname", $("#createFname").val());
    formData.append("lname", $("#createLname").val());
    formData.append("phone", $("#createPhone").val());
    formData.append("addressline", $("#createAddress").val());
    formData.append("town", $("#createTown").val());

    let file = $("#createImage")[0].files[0];

    if (file) {
        formData.append("image", file);
    }

    $.ajax({

        url: "http://localhost:3000/api/users/create",

        method: "POST",

        data: formData,

        processData: false,

        contentType: false,

        success: function () {

            alert("Customer created successfully.");

            $("#createModal").hide();

            $("#createEmail").val("");
            $("#createPassword").val("");
            $("#createFname").val("");
            $("#createLname").val("");
            $("#createPhone").val("");
            $("#createAddress").val("");
            $("#createTown").val("");
            $("#createImage").val("");
            $("#createRole").val("User");
            $("#createStatus").val("Active");

            loadUsers();

        },

        error: function (xhr) {

            alert(xhr.responseJSON.message);

        }

    });

});
/* EDIT */
function editUser(user) {

    $("#editId").val(user.id);

    $("#editEmail").val(user.email); // still value (readonly)

    // PUT EXISTING DATA INTO PLACEHOLDER (NOT VALUE)
    $("#editFname").val("");
    $("#editFname").attr("placeholder", user.customer?.fname || "");

    $("#editLname").val("");
    $("#editLname").attr("placeholder", user.customer?.lname || "");

    $("#editPhone").val("");
    $("#editPhone").attr("placeholder", user.customer?.phone || "");

    $("#editAddress").val("");
    $("#editAddress").attr("placeholder", user.customer?.addressline || "");

    $("#editTown").val("");
    $("#editTown").attr("placeholder", user.customer?.town || "");

    $("#editRole").val(user.role);
    $("#editStatus").val(user.status);

    window.originalRole = user.role;
    window.originalStatus = user.status;

    $("#editModal").show();
}

/* SAVE */

$("#saveEdit").click(function () {

    let file = $("#editImage")[0].files[0];

    const hasChanges =
        $("#editRole").val() !== window.originalRole ||
        $("#editStatus").val() !== window.originalStatus ||
        $("#editFname").val().trim() !== "" ||
        $("#editLname").val().trim() !== "" ||
        $("#editPhone").val().trim() !== "" ||
        $("#editAddress").val().trim() !== "" ||
        $("#editTown").val().trim() !== "" ||
        file;

    if (!hasChanges) {
        alert("No changes were made.");
        return;
    }

    let formData = new FormData();

    formData.append("user_id", $("#editId").val());
    formData.append("email", $("#editEmail").val());
    formData.append("role", $("#editRole").val());
    formData.append("status", $("#editStatus").val());

    if ($("#editFname").val().trim() !== "") {
        formData.append("fname", $("#editFname").val());
    }

    if ($("#editLname").val().trim() !== "") {
        formData.append("lname", $("#editLname").val());
    }

    if ($("#editPhone").val().trim() !== "") {
        formData.append("phone", $("#editPhone").val());
    }

    if ($("#editAddress").val().trim() !== "") {
        formData.append("addressline", $("#editAddress").val());
    }

    if ($("#editTown").val().trim() !== "") {
        formData.append("town", $("#editTown").val());
    }

    if (file) {
        formData.append("image", file);
    }

    $.ajax({
        url: "http://localhost:3000/api/users/update-full",
        method: "PUT",
        data: formData,
        processData: false,
        contentType: false,

        success: function () {
            alert("Updated successfully.");
            $("#editModal").hide();
            loadUsers();
        },

        error: function (xhr) {

            if (xhr.responseJSON && xhr.responseJSON.message) {
                alert(xhr.responseJSON.message);
            } else {
                alert("Update failed.");
            }

        }

    });

});

/* DELETE */
function deleteUser(id) {

    if (!confirm("Delete user?")) return;

    $.ajax({
        url: "http://localhost:3000/api/users/delete/" + id,
        method: "DELETE",
        success: function () {
            loadUsers();
        }
    });

}

$("#openCreateModal").click(function () {

    $("#createModal").show();

});

$("#closeCreate").click(function () {

    $("#createModal").hide();

});




function closeModal() {
    $("#editModal").hide();
}