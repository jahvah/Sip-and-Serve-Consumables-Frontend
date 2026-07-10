let table;

let mode = localStorage.getItem("categoryViewMode") || "pagination";

let offset = 0;
let limit = 10;

let loading = false;
let hasMore = true;


/* =========================
INIT
========================= */

$(document).ready(function () {


    $("#viewMode").val(mode);


    initTable();


    if (mode === "pagination") {

        loadPagination();

    } else {

        loadInfinite(true);

    }



    $("#viewMode").change(function () {


        mode = $(this).val();


        localStorage.setItem(
            "categoryViewMode",
            mode
        );


        initTable();



        if (mode === "pagination") {

            loadPagination();

        } else {

            loadInfinite(true);

        }


    });



});



/* =========================
TABLE INIT
========================= */

function initTable(){


    if ($.fn.DataTable.isDataTable("#categoryTable")) {

        $("#categoryTable")
            .DataTable()
            .destroy();


        $("#categoryTable tbody")
            .empty();

    }



    table = $("#categoryTable").DataTable({


        paging: mode === "pagination",


        searching:true,


        ordering:true,


        info:true,


        lengthChange:false,


        pageLength:10,


        deferRender:true,


        scrollY:
            mode === "scroll"
            ? "500px"
            : false,


        scrollCollapse:true,


        data:[],


        columns:[


            {
                data:"category_id"
            },


            {
                data:"category"
            },


            {

                data:null,

                render:function(data){

                    return `

                    <button onclick="editCategory(
                        ${data.category_id},
                        '${encodeURIComponent(data.category)}'
                    )">
                    Edit
                    </button>


                    <button onclick="deleteCategory(
                        ${data.category_id}
                    )">
                    Delete
                    </button>

                    `;

                }

            }


        ]


    });



    if(mode==="scroll"){

        attachInfiniteScroll();

    }


}



/* =========================
PAGINATION LOAD
========================= */

function loadPagination(){


    $.ajax({


        url:
        "http://localhost:3000/api/category/all",


        method:"GET",


        success:function(res){


            table.clear();


            table.rows.add(
                res.categories || []
            );


            table.draw();


        }


    });


}




/* =========================
INFINITE SCROLL LOAD
========================= */

function loadInfinite(reset=false){


    if(loading || !hasMore)
        return;



    loading=true;



    if(reset){


        offset=0;

        hasMore=true;


        table.clear()
            .draw();


    }




    $.ajax({


        url:
        `http://localhost:3000/api/category?start=${offset}&length=${limit}`,



        method:"GET",



        success:function(res){



            const rows =
                res.categories || [];



            if(rows.length < limit){

                hasMore=false;

            }



            offset += rows.length;



            table.rows
                .add(rows)
                .draw(false);



            loading=false;


        },


        error:function(){

            loading=false;

        }


    });



}





/* =========================
SCROLL DETECTOR
========================= */

function attachInfiniteScroll(){


    setTimeout(function(){


        $(".dataTables_scrollBody")

        .off("scroll")

        .on("scroll",function(){



            if(loading || !hasMore)
                return;




            if(
                this.scrollTop +
                this.clientHeight
                >=
                this.scrollHeight - 80
            ){


                loadInfinite();


            }



        });



    },200);



}





/* =========================
CREATE
========================= */


$("#saveCreate").click(function () {


    let category =
        $("#createCategory")
        .val()
        .trim();



    if(category===""){

        alert("Category is required.");

        return;

    }



    $.ajax({


        url:
        "http://localhost:3000/api/category/create",


        method:"POST",


        contentType:"application/json",


        data:JSON.stringify({

            category

        }),



        success:function(res){


            alert(res.message);


            $("#createModal").hide();


            reloadCategories();


        },


        error:function(xhr){

            alert(
                xhr.responseJSON.message
            );

        }



    });



});





/* =========================
EDIT
========================= */


let originalCategory="";



function editCategory(id,category){


    $("#editId").val(id);



    originalCategory =
        decodeURIComponent(category);



    $("#editCategory").val("");



    $("#editCategory")
        .attr(
            "placeholder",
            originalCategory
        );



    $("#editModal").show();


}





$("#saveEdit").click(function(){


    let newCategory =
        $("#editCategory")
        .val()
        .trim();



    if(newCategory===""
       ||
       newCategory===originalCategory){


        alert("No changes made.");

        $("#editModal").hide();

        return;

    }




    $.ajax({


        url:
        "http://localhost:3000/api/category/update",


        method:"PUT",


        contentType:"application/json",



        data:JSON.stringify({

            category_id:
            $("#editId").val(),


            category:
            newCategory

        }),



        success:function(res){


            alert(res.message);


            $("#editModal").hide();


            reloadCategories();


        }


    });



});





/* =========================
DELETE
========================= */

function deleteCategory(id){


    if(!confirm("Delete category?"))
        return;



    $.ajax({


        url:
        `http://localhost:3000/api/category/delete/${id}`,


        method:"DELETE",



        success:function(){


            alert("Deleted!");


            reloadCategories();


        }


    });


}





/* =========================
RELOAD
========================= */

function reloadCategories(){


    initTable();


    if(mode==="pagination"){

        loadPagination();

    }else{

        loadInfinite(true);

    }


}






$("#openCreateModal").click(function(){

    $("#createCategory").val("");

    $("#createModal").show();

});



$("#closeCreate").click(function(){

    $("#createModal").hide();

});



function closeModal(){

    $("#editModal").hide();

}