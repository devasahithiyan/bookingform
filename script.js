document.addEventListener('DOMContentLoaded', () => {
    const appointmentForm = document.getElementById('appointmentForm');
    const loadingSpinner = document.getElementById('loadingSpinner');

    const confirmationModal = document.getElementById('confirmationModal');
    const closeModal = document.getElementById('closeModal');
    const closeButton = document.getElementById('closeButton');
    const confirmationDetails = document.getElementById('confirmationDetails');
    const qrCodeImage = document.getElementById('qrCode');

    const addOnsContainer = document.getElementById('addOnsContainer');
    const appointmentType = document.getElementById('appointmentType');
    const timeSelect = document.getElementById('time');
    const totalCostDiv = document.getElementById('totalCost');
    const couponInput = document.getElementById('coupon');
    const applyCouponButton = document.getElementById('applyCoupon');
    const couponMessage = document.getElementById('couponMessage');

    const couponModal = document.getElementById('couponModal');
    const closeCouponModal = document.getElementById('closeCouponModal');
    const copyCouponButton = document.getElementById('copyCoupon');

    // Define pricing
    const pricing = {
        'Meeting': 500,
        'Audio Call': 300,
        'Video Call': 400
    };

    // Define add-ons based on appointment type
    const addOnsOptions = {
        'Meeting': [
            { name: 'Handshake Hug', price: 50 },
            { name: 'Selfie', price: 100 }
        ],
        'Audio Call': [
            { name: 'Extended Duration', price: 100 },
            { name: 'Recording Session', price: 150 }
        ],
        'Video Call': [
            { name: 'Screen Sharing', price: 80 },
            { name: 'Virtual Background', price: 60 }
        ]
    };

    // Predefined time slots
    const timeSlots = [
        '09:00 AM - 10:00 AM',
        '10:30 AM - 11:30 AM',
        '12:00 PM - 01:00 PM',
        '01:30 PM - 02:30 PM',
        '03:00 PM - 04:00 PM',
        '04:30 PM - 05:30 PM'
    ];

    // Define fully booked dates in January (YYYY-MM-DD format)
    const fullyBookedDates = [
        '2025-01-05',
        '2025-01-12',
        '2025-01-18',
        '2025-01-22',
        '2025-01-28'
    ];

    // Define booked time slots for each available date
    const bookedSlots = {};

    // Function to generate a random time slot
    function getRandomTimeSlot() {
        const slots = [
            '09:00 AM - 10:00 AM',
            '10:30 AM - 11:30 AM',
            '12:00 PM - 01:00 PM',
            '01:30 PM - 02:30 PM',
            '03:00 PM - 04:00 PM',
            '04:30 PM - 05:30 PM'
        ];
        return slots[Math.floor(Math.random() * slots.length)];
    }

    // Populate bookedSlots with one random time slot per available date
    function initializeBookedSlots() {
        for (let day = 1; day <= 31; day++) {
            const formattedDay = day < 10 ? `0${day}` : `${day}`;
            const dateStr = `2025-01-${formattedDay}`;
            
            // Skip fully booked dates
            if (fullyBookedDates.includes(dateStr)) continue;
            
            // Assign a random time slot as booked
            bookedSlots[dateStr] = getRandomTimeSlot();
        }
    }

    initializeBookedSlots();

    // Initialize Flatpickr with disabled dates and custom styling
    flatpickr("#datePicker", {
        dateFormat: "Y-m-d",
        disable: fullyBookedDates,
        onDayCreate: function(dObj, dStr, fp, dayElem) {
            const dateStr = dayElem.dateObj.toISOString().split('T')[0];
            if (fullyBookedDates.includes(dateStr)) {
                // Style the disabled date
                dayElem.style.backgroundColor = '#ffcccc'; // Light red
                dayElem.style.color = '#ff0000'; // Red text
                dayElem.style.cursor = 'not-allowed'; // Change cursor

                // Add click event listener to show message
                dayElem.addEventListener('click', function() {
                    alert('Slots are booked for this day, please book another day.');
                });
            }
        },
        onChange: function(selectedDates, dateStr, instance) {
            handleDateSelection(dateStr);
        }
    });

    // Handle Date Selection and Disable Booked Time Slot
    function handleDateSelection(selectedDate) {
        const timeSelect = document.getElementById('time');
        if (fullyBookedDates.includes(selectedDate)) {
            // Disable all time slots
            Array.from(timeSelect.options).forEach(option => {
                option.disabled = true;
                option.style.backgroundColor = '#ffe6e6'; // Light red
                option.style.color = '#ff0000'; // Red text
            });
            // Display alert to the user
            alert('Slots are booked for this day, please book another day.');
            // Reset the date picker
            document.getElementById('datePicker')._flatpickr.clear();
        } else {
            // Enable all time slots
            Array.from(timeSelect.options).forEach(option => {
                option.disabled = false;
                option.style.backgroundColor = '';
                option.style.color = '';
                // Remove " (Booked)" text if present
                if (option.textContent.includes(' (Booked)')) {
                    option.textContent = option.textContent.replace(' (Booked)', '');
                }
            });

            // Disable the randomly booked time slot for the selected date
            const bookedSlot = bookedSlots[selectedDate];
            if (bookedSlot) {
                Array.from(timeSelect.options).forEach(option => {
                    if (option.value === bookedSlot) {
                        option.disabled = true;
                        option.style.backgroundColor = '#ffe6e6'; // Light red
                        option.style.color = '#ff0000'; // Red text
                        option.textContent += ' (Booked)';
                    }
                });
            }
        }
    }

    // Update Add-Ons based on appointment type
    appointmentType.addEventListener('change', () => {
        const selectedType = appointmentType.value;
        addOnsContainer.innerHTML = ''; // Clear existing add-ons
        updateTotalCost();

        if (addOnsOptions[selectedType]) {
            addOnsOptions[selectedType].forEach(addon => {
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.name = 'addons';
                checkbox.value = addon.name;
                checkbox.dataset.price = addon.price;
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(`${addon.name} (+₹${addon.price})`));
                addOnsContainer.appendChild(label);
            });
        }
    });

    // Calculate total cost
    appointmentForm.addEventListener('change', () => {
        updateTotalCost();
    });

    function updateTotalCost() {
        const selectedType = appointmentType.value;
        let total = 0;

        if (selectedType && pricing[selectedType]) {
            total += pricing[selectedType];
        }

        const selectedAddOns = Array.from(document.querySelectorAll('input[name="addons"]:checked'));
        selectedAddOns.forEach(addon => {
            total += parseInt(addon.dataset.price);
        });

        // Apply coupon if valid
        const couponCode = couponInput.value.trim();
        if (couponCode === 'Deva50') {
            total = Math.round(total / 2);
        }

        totalCostDiv.textContent = `₹${total}`;
    }

    // Handle Coupon Code
    applyCouponButton.addEventListener('click', () => {
        const couponCode = couponInput.value.trim();
        if (couponCode === 'Deva50') {
            couponMessage.textContent = 'Coupon applied! You get a 50% discount.';
            updateTotalCost();
            // Disable the coupon input and button after successful application
            couponInput.disabled = true;
            applyCouponButton.disabled = true;
        } else if (couponCode !== '') {
            couponMessage.textContent = 'Invalid coupon code.';
            updateTotalCost();
        } else {
            couponMessage.textContent = '';
            updateTotalCost();
        }
    });

    // Function to open the coupon modal
    function showCouponModal() {
        const couponModal = document.getElementById('couponModal');
        couponModal.style.display = 'block';
    }

    // Show the coupon modal after 2 seconds (2000 milliseconds)
    setTimeout(showCouponModal, 2000);

    // Handle closing the coupon modal when the close button is clicked
    closeCouponModal.addEventListener('click', () => {
        const couponModal = document.getElementById('couponModal');
        couponModal.style.display = 'none';
    });

    // Handle copying the coupon code to clipboard
    copyCouponButton.addEventListener('click', () => {
        const couponCode = 'Deva50';
        navigator.clipboard.writeText(couponCode).then(() => {
            alert('Coupon code copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy coupon code. Please try manually.');
        });
    });

    // Close the coupon modal when clicking outside of the modal content
    window.addEventListener('click', (event) => {
        if (event.target === confirmationModal) {
            confirmationModal.style.display = 'none';
        }
        if (event.target === couponModal) {
            couponModal.style.display = 'none';
        }
    });

    // Handle Form Submission via AJAX with Loading Spinner for 3 Seconds
    appointmentForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent default form submission

        // Show loading spinner
        loadingSpinner.style.display = 'flex';

        // Gather form data
        const formData = new FormData(appointmentForm);
        const data = {};
        formData.forEach((value, key) => {
            if (key === 'addons') {
                if (!data[key]) {
                    data[key] = [];
                }
                data[key].push(value);
            } else {
                data[key] = value;
            }
        });

        // Handle Venue: If empty, set default
        if (!data.venue || data.venue.trim() === '') {
            data.venue = 'To be decided by Deva';
        }

        // Calculate total cost
        let total = 0;
        const selectedType = data.appointmentType;
        if (pricing[selectedType]) {
            total += pricing[selectedType];
        }

        if (data.addons) {
            data.addons.forEach(addon => {
                const addonObj = addOnsOptions[selectedType].find(a => a.name === addon);
                if (addonObj) {
                    total += addonObj.price;
                }
            });
        }

        // Apply coupon if valid
        if (data.coupon === 'Deva50') {
            total = Math.round(total / 2);
        }

        // Prepare confirmation details
        const confirmationHTML = `
            <div class="confirmation-section">
                <h3>Appointment Details</h3>
                <ul>
                    <li><strong>Timing:</strong> ${data.time}</li>
                    <li><strong>Date:</strong> ${data.date}</li>
                    <li><strong>Venue:</strong> ${data.venue}</li>
                    <li><strong>Dress Code:</strong> Casual</li>
                    <li><strong>Cost:</strong> ₹${total}</li>
                </ul>
            </div>
            ${data.addons && data.addons.length > 0 ? `
                <div class="confirmation-section">
                    <h3>Additional Services</h3>
                    <ul>
                        ${data.addons.map(addon => {
                            const addonObj = addOnsOptions[selectedType].find(a => a.name === addon);
                            return `<li>${addon}: ₹${addonObj.price}</li>`;
                        }).join('')}
                    </ul>
                </div>` : ''
            }
            <div class="confirmation-section">
                <h3>Important Guidelines</h3>
                <ul>
                    <li>You are strictly not allowed to exceed the given timing under any circumstances. Please ensure that all activities are completed within the allocated time slot.</li>
                    <li>All details, including timing, venue, and charges, are subject to change. In case of unforeseen circumstances or if I am busy, I reserve the right to reschedule or cancel the appointment.</li>
                </ul>
            </div>
            <div class="confirmation-section">
                <p>We kindly request you to arrive at the venue 15 minutes prior to your appointment for the best experience.</p>
                <p>Looking forward to ensuring you have a wonderful time!</p>
                <p><strong>Note:</strong> Payment will be made after the appointment.</p>
            </div>
        `;
        confirmationDetails.innerHTML = confirmationHTML;

        // Generate a random QR code value
        const qrValue = generateRandomString(10);

        // Function to generate a random alphanumeric string
        function generateRandomString(length) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
        }

        // Function to generate QR code and display it
        function displayQRCode(value) {
            const qrCodeContainer = document.createElement('div');
            qrCodeContainer.style.display = 'none'; // Hide the temporary container

            const qrCode = new QRCode(qrCodeContainer, {
                text: value,
                width: 128,
                height: 128,
                correctLevel: QRCode.CorrectLevel.H
            });

            // Wait a short time for QR code to render
            setTimeout(() => {
                const qrCanvas = qrCodeContainer.querySelector('canvas');
                if (qrCanvas) {
                    const qrDataURL = qrCanvas.toDataURL('image/png');
                    qrCodeImage.src = qrDataURL;
                } else {
                    console.error('QR Code generation failed.');
                }
            }, 500);
        }

        // Display the QR code in the confirmation modal
        displayQRCode(qrValue);

        // Prepare data for FormSubmit
        const submitData = new URLSearchParams();
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                if (Array.isArray(data[key])) {
                    data[key].forEach(item => {
                        submitData.append(key, item);
                    });
                } else {
                    submitData.append(key, data[key]);
                }
            }
        }

        // Function to perform AJAX submission
        const submitForm = fetch('https://formsubmit.co/ajax/devasahithiyan@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: submitData.toString()
        })
        .then(response => response.json())
        .then(data => {
            return data.success;
        })
        .catch(error => {
            console.error('Error:', error);
            return false;
        });

        // Function to wait for 3 seconds
        const waitThreeSeconds = new Promise(resolve => setTimeout(resolve, 3000));

        // Wait for both AJAX submission and 3-second timer
        Promise.all([submitForm, waitThreeSeconds]).then(results => {
            const [isSuccess] = results;
            // Hide loading spinner
            loadingSpinner.style.display = 'none';

            if (isSuccess) {
                console.log('Form successfully submitted');
                // Show confirmation modal
                confirmationModal.style.display = 'block';
                // Reset the form
                appointmentForm.reset();
                // Reset total cost
                totalCostDiv.textContent = '₹0';
                // Reset coupon fields
                couponInput.disabled = false;
                applyCouponButton.disabled = false;
                couponMessage.textContent = '';
                // Clear add-ons
                addOnsContainer.innerHTML = '';
                // Reset bookedSlots for the booked date to prevent rebooking
                const bookedDate = data.date;
                const bookedTime = bookedSlots[bookedDate];
                if (bookedTime) {
                    bookedSlots[bookedDate] = null; // Clear the booked slot
                }
            } else {
                console.error('Form submission failed');
                alert('There was an error submitting the form. Please try again.');
            }
        });
    });

    // Function to generate PDF with confirmation details and QR code
    function generatePDF(data, total, qrValue, qrDataURL) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.text("Appointment Confirmation Receipt", 105, 20, null, null, 'center');

        // Appointment Details
        doc.setFontSize(12);
        let yOffset = 30;
        doc.text(`Name: ${data.name}`, 20, yOffset);
        yOffset += 10;
        doc.text(`Email: ${data.email}`, 20, yOffset);
        yOffset += 10;
        doc.text(`Appointment Type: ${data.appointmentType}`, 20, yOffset);
        yOffset += 10;
        doc.text(`Date: ${data.date}`, 20, yOffset);
        yOffset += 10;
        doc.text(`Time Slot: ${data.time}`, 20, yOffset);
        yOffset += 10;
        doc.text(`Venue: ${data.venue}`, 20, yOffset);
        yOffset += 10;
        if (data.addons && data.addons.length > 0) {
            doc.text(`Add-Ons: ${data.addons.join(', ')}`, 20, yOffset);
            yOffset += 10;
        }
        doc.text(`Total Cost: ₹${total}`, 20, yOffset);
        yOffset += 20;

        // QR Code
        if (qrDataURL) {
            doc.text("Show this QR code upon entry:", 20, yOffset);
            yOffset += 10;
            doc.addImage(qrDataURL, 'PNG', 20, yOffset, 50, 50);
            yOffset += 60;
        }

        // Additional Notes
        doc.text("Please present this ticket along with the QR code at the venue.", 20, yOffset);
        yOffset += 10;
        doc.text("Thank you for booking an appointment with Deva!", 20, yOffset);

        // Save the PDF
        doc.save(`Appointment_Confirmation_${data.name}.pdf`);
    }

    // Handle Download PDF Button
    const downloadPDFButton = document.getElementById('downloadPDF');
    downloadPDFButton.addEventListener('click', () => {
        const data = {};
        const confirmationList = confirmationDetails.querySelectorAll('ul li');
        confirmationList.forEach(item => {
            const [key, value] = item.textContent.split(': ');
            data[key.toLowerCase().replace(' ', '')] = value;
        });

        // Additional Services
        const additionalServicesHeader = confirmationDetails.querySelector('h3');
        if (additionalServicesHeader && additionalServicesHeader.textContent === 'Additional Services') {
            const servicesList = additionalServicesHeader.nextElementSibling.querySelectorAll('li');
            data['addons'] = [];
            servicesList.forEach(service => {
                const [name, price] = service.textContent.split(': ₹');
                data['addons'].push(name);
            });
        }

        // Total Cost
        data['cost'] = totalCostDiv.textContent.replace('₹', '');

        // QR Code
        const qrSrc = qrCodeImage.src;

        generatePDF(data, data['cost'], null, qrSrc);
    });
});
