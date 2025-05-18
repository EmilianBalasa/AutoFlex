 // Mobile Menu Toggle
 document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    const loginBtn = document.getElementById('loginBtn');
    
    // Asigură-te că elementele există
    if (mobileMenuBtn && navLinks) {
        console.log("Menu button found");
        
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("Menu button clicked");
            navLinks.classList.toggle('show');
            
            // În modul responsive, adaugă opțiunea de login în meniu
            if (window.innerWidth <= 992) {
                // const loginMenuItem = document.getElementById('loginMenuItem');
                
                if (navLinks.classList.contains('show')) {
                    if (!loginMenuItem) {
                        const li = document.createElement('li');
                        li.id = 'loginMenuItem';
                        li.innerHTML = `<a href="login.html" class="nav-link primary">Login / Sign Up</a>`;
                        navLinks.appendChild(li);
                    }
                } else {
                    if (loginMenuItem) {
                        loginMenuItem.remove();
                    }
                }
            }
        });
    } else {
        console.error("Mobile menu elements not found");
    }
    
    // Handle resize events
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            if (navLinks) navLinks.classList.remove('show');
            const loginMenuItem = document.getElementById('loginMenuItem');
            if (loginMenuItem) loginMenuItem.remove();
        }
    });
});

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
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };
    
    // Here you would typically send the data to your server
    // For demonstration, we'll just show an alert
    alert('Thank you for your message! We will get back to you soon.');
    
    // Reset form
    this.reset();
});

// Newsletter Form
document.querySelector('.newsletter-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('.newsletter-input').value;
    
    // Here you would typically send the email to your server
    // For demonstration, we'll just show an alert
    alert(`Thank you for subscribing with ${email}! You'll receive our next newsletter.`);
    
    // Reset form
    this.reset();
});

// Animation on scroll
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.animate');
    
    function checkView() {
        const windowHeight = window.innerHeight;
        const windowTopPosition = window.scrollY;
        const windowBottomPosition = windowTopPosition + windowHeight;
        
        animatedElements.forEach(function(element) {
            const elementHeight = element.offsetHeight;
            const elementTopPosition = element.offsetTop;
            const elementBottomPosition = elementTopPosition + elementHeight;
            
            // Check if element is in view
            if (elementBottomPosition >= windowTopPosition && elementTopPosition <= windowBottomPosition) {
                element.classList.add('visible');
            }
        });
    }
    
    // Check on load
    checkView();
    
    // Check on scroll
    window.addEventListener('scroll', checkView);
});