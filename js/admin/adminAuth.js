let token = localStorage.getItem("token");
let user = null;

try {
    user = JSON.parse(localStorage.getItem("user"));
} catch (e) {
    user = null;
}

if (!token || !user) {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.replace("/html/login.html");
    throw new Error("Unauthorized");

}

if (user.role !== "Admin") {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    alert("Access denied.");

    window.location.replace("/html/home.html");
    throw new Error("Forbidden");

}

$.ajaxSetup({
    headers: {
        Authorization: "Bearer " + token
    }
});