
$(document).ready(function () {
    $("#authenticate-form").submit(function () {
        $.post($(this).attr("action"), $(this).serialize(), function (result) {
            //if (result.success == false) {
            //    alert(result.message);
            //}
            //else {
            //    alert(result.data.user.Username);
            //    alert(result.data.token);
            //}
            alert(JSON.stringify(result));
        }, "json");
        return false;
    });
});