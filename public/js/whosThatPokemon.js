document.addEventListener('DOMContentLoaded', function() {
    // Find the message elements
    const errorMessage = document.getElementById('ErrorWTP');
    const successMessage = document.getElementById('SuccessWTP');
    // Hide messages after 2 seconds
    setTimeout(function() {

      if (errorMessage) {
        errorMessage.classList.add('hidden');
      }
      if (successMessage) {
        successMessage.classList.add('hidden');
      }
    }, 2000);
  });

  document.addEventListener('DOMContentLoaded', function() {
    const form1 = document.getElementById('form1');

    form1.addEventListener('keypress', function(event) {
      if (event.which === 13) { // 13 is the key code for "Enter"
        event.preventDefault();
        event.target.closest('form').submit();
      }
    });
  });

  document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('form1');
    const dataList = document.getElementById('pokemonlist');

    // Store the original options
    const originalOptions = Array.from(dataList.options);

    // Add an input event listener to the search input
    searchInput.addEventListener('input', function() {
      const inputValue = searchInput.value.toLowerCase();

      // Clear existing options
      dataList.innerHTML = '';

      // Filter and add options based on the input value
      const filteredOptions = originalOptions.filter(option => option.value.toLowerCase().startsWith(inputValue));
      filteredOptions.forEach(option => dataList.appendChild(option));
    });
  });


