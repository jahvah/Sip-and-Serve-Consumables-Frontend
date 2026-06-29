let table;

$(document).ready(function () {
    loadUsers();

    // SAVE EDIT
    $("#saveEdit").click(function () {

        $.ajax({
            url: "http://localhost:3000/api/users/update",
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify({
                user_id: $("#editId").val(),
                role: $("#editRole").val(),
                status: $("#editStatus").val()
            }),
            success: function (res) {

                alert(res.message || "Updated!");

                $("#editModal").hide();

                // update table without reload
                loadUsers();
            },
            error: function (err) {
                alert(err.responseJSON?.message || "Update failed");
            }
        });
    });
});


/* =========================
   LOAD USERS (DATATABLE)
========================= */
function loadUsers() {

    $.ajax({
        url: "http://localhost:3000/api/users/all",
        method: "GET",
        success: function (res) {

            if (table) {
                table.destroy();
            }

            table = $('#usersTable').DataTable({
                data: res.users,
                columns: [
                    { data: "id" },
                    { data: "name" },
                    { data: "email" },
                    { data: "role" },
                    { data: "status" },
                    { data: "created_at" },
                    { data: "updated_at" },
                    {
                        data: null,
                        render: function (data) {
                            return `
                                <button onclick='openEdit(${JSON.stringify(data)})'>Edit</button>
                                <button onclick='deleteUser(${data.id})'>Delete</button>
                            `;
                        }
                    }
                ]
            });
        }
    });
}


/* =========================
   OPEN EDIT MODAL
========================= */
function openEdit(user) {

    $("#editId").val(user.id);
    $("#editRole").val(user.role);
    $("#editStatus").val(user.status);

    $("#editModal").show();
}


/* =========================
   CLOSE MODAL
========================= */
function closeModal() {
    $("#editModal").hide();
}


/* =========================
   DELETE USER
========================= */
function deleteUser(id) {

    if (!confirm("Are you sure you want to delete this user?")) return;

    $.ajax({
        url: "http://localhost:3000/api/users/delete/" + id,
        method: "DELETE",
        success: function (res) {
            alert(res.message || "Deleted!");
            loadUsers();
        },
        error: function (err) {
            alert(err.responseJSON?.message || "Delete failed");
        }
    });
}