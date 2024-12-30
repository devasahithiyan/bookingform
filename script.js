// script.js

document.getElementById('appointmentForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // Get elements
    const loadingSpinner = document.getElementById('loadingSpinner');
    const submitButton = document.getElementById('submitButton');

    // Collect form data
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const venue = document.getElementById('venue').value.trim();

    // Basic validation
    if (!fullName || !email || !phone || !date || !time || !venue) {
        alert('Please fill in all required fields.');
        return;
    }

    // Show loading spinner and disable submit button
    loadingSpinner.classList.remove('hidden');
    submitButton.disabled = true;
    submitButton.textContent = 'Booking...';

    // Prepare the template parameters for EmailJS
    const templateParams = {
        fullName: fullName,
        email: email,
        phone: phone,
        date: date,
        time: time,
        venue: venue,
        dressCode: 'Casual',
        cost: '500',
        additionalCharges: 'Selfie with Deva: ₹100 per selfie'
    };

    // Send the email using EmailJS
    /* 
       service_g0yk9ub  (Sample Service ID)
       template_9zoqn1l (Sample Template ID)
       Public Key: fkbyhw_wPngtt7iY3
       Private Key: BMx5daY2H0pvzjTzGZ6x6  <-- Not used on frontend
    */
    emailjs.send('service_g0yk9ub', 'template_9zoqn1l', templateParams, 'fkbyhw_wPngtt7iY3')
        .then(function(response) {
            console.log('Email SUCCESS!', response.status, response.text);
            // Hide loading spinner
            loadingSpinner.classList.add('hidden');
            // Enable submit button and reset text
            submitButton.disabled = false;
            submitButton.textContent = 'Book Appointment';
            // Construct the URL with query parameters
            const confirmationURL = `confirmation.html?fullName=${encodeURIComponent(fullName)}&email=${encodeURIComponent(email)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&venue=${encodeURIComponent(venue)}`;
            // Redirect to confirmation page with parameters
            window.location.href = confirmationURL;
        }, function(error) {
            console.log('Email FAILED...', error);
            // Hide loading spinner
            loadingSpinner.classList.add('hidden');
            // Enable submit button and reset text
            submitButton.disabled = false;
            submitButton.textContent = 'Book Appointment';
            // Alert the user about the failure
            alert('There was an error sending the confirmation email. Please try again.');
        });
});
