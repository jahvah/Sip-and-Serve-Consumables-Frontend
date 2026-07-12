$("#sendResetBtn").click(function(){

    $.ajax({

        url:"http://localhost:3000/api/users/forgot-password",

        method:"POST",

        contentType:"application/json",

        data:JSON.stringify({

            email:$("#email").val().trim()

        }),

        beforeSend:function(){

            $("#sendResetBtn")
                .prop("disabled",true);

        },

        success:function(res){

            $("#msg")
                .css("color","green")
                .text(res.message);

        },

        error:function(xhr){

            $("#msg")
                .css("color","red")
                .text(

                    xhr.responseJSON?.message ||

                    "Unable to send reset email."

                );

        },

        complete:function(){

            $("#sendResetBtn")
                .prop("disabled",false);

        }

    });

});