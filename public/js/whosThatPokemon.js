document.addEventListener('DOMContentLoaded', function() {
    // Find the message elements
    const errorMessage = document.getElementById('ErrorWTP');
    const successMessage = document.getElementById('SuccessWTP');
    // Hide messages after 2 seconds
    setTimeout(function() {
    console.log('Hiding messages...');
      if (errorMessage) {
        errorMessage.classList.add('hidden');
      }
      if (successMessage) {
        successMessage.classList.add('hidden');
      }
    }, 1500);
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
