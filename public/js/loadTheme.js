function updateTheme() {
  const colorMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.querySelector("html").setAttribute("data-bs-theme", colorMode ? "dark" : "light");
  document.querySelector("html").classList.toggle("dark", colorMode);
}

updateTheme();

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);