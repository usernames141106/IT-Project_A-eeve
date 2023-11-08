document.addEventListener("DOMContentLoaded", () => {
    const button1 = document.querySelector(".buttonForm1");
    const form1 = document.getElementById("form1");
    
    button1.addEventListener("mouseenter", () => {
        form1.classList.add("border-on-hover");
    });
    
    button1.addEventListener("mouseleave", () => {
        form1.classList.remove("border-on-hover");
    });
    
});