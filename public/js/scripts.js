// Carousel Functionality
document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.carousel');
  
    carousels.forEach(carousel => {
      const slides = carousel.querySelectorAll('.carousel-slide');
      let currentIndex = 0;
  
      // Auto-slide every 3 seconds
      setInterval(() => {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
      }, 3000);
    });
  });
  
  // Form Validation
  document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');
  
    forms.forEach(form => {
      form.addEventListener('submit', event => {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
  
        inputs.forEach(input => {
          if (!input.value.trim()) {
            isValid = false;
            input.style.border = '1px solid red';
          } else {
            input.style.border = '1px solid #ddd';
          }
        });
  
        if (!isValid) {
          event.preventDefault();
          alert('Please fill in all required fields.');
        }
      });
    });
  });
  