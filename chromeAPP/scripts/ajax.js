$(document).ready(function() {

    callMenu();

});
function callMenu() {
    $.ajax({
        type: "GET",
        url: "http://localhost:5000/chrome/get",
        success: function (data) {
            var list = document.getElementById("menu");
            var c = data;
            if(list){
                list.innerHTML = c;
            }

        },
        error: function (data) {
            console.log(data);
        }
    });
}
