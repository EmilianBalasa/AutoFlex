document.addEventListener('DOMContentLoaded', function() {
    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close other open FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current FAQ item
            item.classList.toggle('active');
        });
    });

    // Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.submit-btn');
            const messageDiv = document.getElementById('contactMessage');
            
            // Disable submit button during request
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            
            // Send to PHP mailer
            fetch('api/contact-mailer.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                messageDiv.style.display = 'block';
                messageDiv.className = 'contact-message ' + (data.success ? 'success' : 'error');
                messageDiv.textContent = data.message;
                
                if (data.success) {
                    this.reset();
                }
            })
            .catch(error => {
                messageDiv.style.display = 'block';
                messageDiv.className = 'contact-message error';
                messageDiv.textContent = 'An error occurred. Please try again later.';
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            });
        });
    }

    // Newsletter Form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('.newsletter-input').value;
            
            // Here you would typically send the email to your server
            // For demonstration, we'll just show an alert
            alert(`Thank you for subscribing with ${email}! You'll receive our next newsletter.`);
            
            // Reset form
            this.reset();
        });
    }
});
