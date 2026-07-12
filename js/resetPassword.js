const params = new URLSearchParams(window.location.search);

const token = params.get("token");

$("#resetBtn").click(function(){

    const password = $("#password").val();

    const confirm = $("#confirmPassword").val();

    if(password !== confirm){

        $("#msg")
            .css("color","red")
            .text("Passwords do not match.");

        return;

    }

    $.ajax({

        url:
`http://localhost:3000/api/users/reset-password/${token}`,

        method:"POST",

        contentType:"application/json",

        data:JSON.stringify({

            password

        }),

        beforeSend:function(){

            $("#resetBtn")
                .prop("disabled",true);

        },

        success:function(res){

            $("#msg")
                .css("color","green")
                .text(res.message);

            setTimeout(function(){

                window.location.href=
                    "/html/login.html";

            },2000);

        },

        error:function(xhr){

            $("#msg")
                .css("color","red")
                .text(

                    xhr.responseJSON?.message ||

                    "Password reset failed."

                );

        },

        complete:function(){

            $("#resetBtn")
                .prop("disabled",false);

        }

    });

});