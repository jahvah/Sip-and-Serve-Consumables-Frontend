let table;

$(document).ready(function () {

    loadUsers();

    function loadUsers() {

        $.ajax({
            url: "http://localhost:3000/api/users/all",
            method: "GET",
            success: function (res) {

                table = $('#usersTable').DataTable({
                    destroy: true,
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
                                    <button class="editBtn" onclick='editUser(${JSON.stringify(data)})'>Edit</button>
                                    <button class="deleteBtn" onclick='deleteUser(${data.id})'>Delete</button>
                                `;
                            }
                        }
                    ]
                });

            }
        });
    }

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
            success: function () {
                alert("Updated!");
                $("#editModal").hide();
                location.reload();
            }
        });

    });

});

function editUser(user) {
    $("#editId").val(user.id);
    $("#editRole").val(user.role);
    $("#editStatus").val(user.status);
    $("#editModal").show();
}

function closeModal() {
    $("#editModal").hide();
}

function deleteUser(id) {

    if (!confirm("Delete this user?")) return;

    $.ajax({
        url: "http://localhost:3000/api/users/delete/" + id,
        method: "DELETE",
        success: function () {
            alert("Deleted!");
            location.reload();
        }
    });

}