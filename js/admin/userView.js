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

    $("#editModal").show();
}

/* SAVE */
$("#saveEdit").click(function () {

    
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

    // IMAGE FILE
    let file = $("#editImage")[0].files[0];
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
            alert("Updated!");
            $("#editModal").hide();
            loadUsers();
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

function closeModal() {
    $("#editModal").hide();
}