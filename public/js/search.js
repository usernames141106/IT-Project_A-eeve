document.addEventListener("DOMContentLoaded", () => {
    const button1 = document.querySelector(".buttonForm1");
    const form1 = document.getElementById("form1");
    const button2 = document.querySelector(".buttonForm2");
    const form2 = document.getElementById("form2");

    button1.addEventListener("mouseenter", () => {
        form1.classList.add("border-on-hover");
    });
    button2.addEventListener("mouseenter", () => {
        form2.classList.add("border-on-hover");
    });
    button1.addEventListener("mouseleave", () => {
        form1.classList.remove("border-on-hover");
    });
    button2.addEventListener("mouseleave", () => {
        form2.classList.remove("border-on-hover");
    });
});