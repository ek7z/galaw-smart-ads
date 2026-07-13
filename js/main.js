let isInitialized = false;

function initializeApp() {
  if (isInitialized) return;
  isInitialized = true;

  // --- AOS Initialization ---
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
    });
  }

  // --- Sticky Header ---
  const header = document.getElementById('header');
  const scrollThreshold = 20;

  function toggleHeaderBackground() {
    if (window.scrollY > scrollThreshold) {
      header.classList.add('bg-bgDark/90', 'backdrop-blur-md', 'border-b', 'border-white/5', 'py-4');
      header.classList.remove('bg-transparent', 'py-6');
    } else {
      header.classList.remove('bg-bgDark/90', 'backdrop-blur-md', 'border-b', 'border-white/5', 'py-4');
      header.classList.add('bg-transparent', 'py-6');
    }
  }

  window.addEventListener('scroll', toggleHeaderBackground);
  toggleHeaderBackground(); // Run initially

  // --- Mobile Menu Toggle ---
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuLinks = mobileMenu?.querySelectorAll('a');
  const menuIconOpen = document.getElementById('menu-icon-open');
  const menuIconClose = document.getElementById('menu-icon-close');

  function toggleMobileMenu() {
    const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
    
    if (!isExpanded) {
      mobileMenu.classList.remove('hidden');
      // Simple fade/slide transition via Tailwind classes
      setTimeout(() => {
        mobileMenu.classList.remove('opacity-0', '-translate-y-4');
        mobileMenu.classList.add('opacity-100', 'translate-y-0');
      }, 10);
      menuIconOpen.classList.add('hidden');
      menuIconClose.classList.remove('hidden');
      document.body.classList.add('overflow-hidden'); // Lock scroll
    } else {
      mobileMenu.classList.add('opacity-0', '-translate-y-4');
      mobileMenu.classList.remove('opacity-100', 'translate-y-0');
      setTimeout(() => {
        mobileMenu.classList.add('hidden');
      }, 300);
      menuIconOpen.classList.remove('hidden');
      menuIconClose.classList.add('hidden');
      document.body.classList.remove('overflow-hidden'); // Unlock scroll
    }
  }

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    // Close menu when a link is clicked
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.classList.add('opacity-0', '-translate-y-4');
        mobileMenu.classList.remove('opacity-100', 'translate-y-0');
        setTimeout(() => {
          mobileMenu.classList.add('hidden');
        }, 300);
        menuIconOpen.classList.remove('hidden');
        menuIconClose.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
      });
    });
  }

  // --- Smooth Scroll & Input Auto-Focus ---
  const scrollLinks = document.querySelectorAll('a[href^="#"]');
  scrollLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        // Offset for sticky header
        const headerHeight = header.offsetHeight;
        const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - headerHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Focus form fields if navigating to booking
        if (targetId === '#booking-card' || targetId === '#hero') {
          const nameInput = document.getElementById('full-name');
          if (nameInput) {
            setTimeout(() => {
              nameInput.focus();
            }, 800); // Wait for scroll to complete
          }
        }
      }
    });
  });

  // --- Testimonial Slider ---
  const track = document.getElementById('testimonial-track');
  const slides = Array.from(document.querySelectorAll('.testimonial-slide'));
  const dotsContainer = document.getElementById('slider-dots');
  
  if (track && slides.length > 0 && dotsContainer) {
    let currentIndex = 0;
    let autoRotateInterval;
    const slideIntervalTime = 5000; // 5 seconds

    // Clear existing dots
    dotsContainer.innerHTML = '';

    // Create dots based on screen size (mobile: 3 slides, desktop: all 3 side-by-side so no sliding needed, or sliding if more than 3)
    // To make it simple and elegant, we support sliding on all viewports.
    // On desktop, we display 3 slides at once, so we slide offset by 33.333% if there are more than 3.
    // Since we have exactly 3 slides, on desktop they fit side-by-side. 
    // Thus:
    // - On Mobile: Dots represent 3 slides (indices 0, 1, 2). Slider slides 100% per step.
    // - On Desktop: Dots can represent highlighted items, or no sliding is needed since all 3 fit. Let's make it so on mobile it functions as a carousel, and on desktop they sit in a premium grid without sliding, and dots are hidden/hidden-on-desktop.
    
    // Let's create dots for the mobile slider
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `w-2.5 h-2.5 rounded-full transition-all duration-300 ${
        idx === 0 ? 'bg-brand w-6' : 'bg-zinc-700 hover:bg-zinc-500'
      }`;
      dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(idx);
        resetAutoRotate();
      });
      dotsContainer.appendChild(dot);
    });

    const dots = Array.from(dotsContainer.children);

    function updateSlider() {
      const isMobile = window.innerWidth < 768;
      
      if (isMobile) {
        // Slide 100% per slide
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update dots
        dots.forEach((dot, idx) => {
          if (idx === currentIndex) {
            dot.classList.add('bg-brand', 'w-6');
            dot.classList.remove('bg-zinc-700');
          } else {
            dot.classList.remove('bg-brand', 'w-6');
            dot.classList.add('bg-zinc-700');
          }
        });
      } else {
        // Desktop: show all side-by-side, no offset transform
        track.style.transform = 'none';
      }
    }

    function goToSlide(index) {
      currentIndex = index;
      if (currentIndex >= slides.length) currentIndex = 0;
      if (currentIndex < 0) currentIndex = slides.length - 1;
      updateSlider();
    }

    function startAutoRotate() {
      // Only auto rotate on mobile
      autoRotateInterval = setInterval(() => {
        if (window.innerWidth < 768) {
          goToSlide(currentIndex + 1);
        }
      }, slideIntervalTime);
    }

    function resetAutoRotate() {
      clearInterval(autoRotateInterval);
      startAutoRotate();
    }

    // Initialize
    startAutoRotate();
    window.addEventListener('resize', updateSlider);
    updateSlider();
  }

  // --- Lead Capture Form Handling & Validation ---
  const bookingForm = document.getElementById('booking-form');
  const formCard = document.getElementById('booking-card');

  if (bookingForm && formCard) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simple HTML5 validation fallback & custom styles
      const name = document.getElementById('full-name').value.trim();
      const businessName = document.getElementById('business-name').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const revenue = document.getElementById('revenue').value;
      const challenge = document.getElementById('challenge').value.trim();

      // Basic client-side checks
      if (!name || !businessName || !email || !phone || !revenue) {
        alert('Please fill out all required fields.');
        return;
      }

      // Show loader on the button
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        PROCESSING YOUR REQUEST...
      `;

      // Send the request to the SMTP backend 
      // PHP version is 'send_email.php' (by default, if hosted on the same PHP-capable server)
      // Node.js version would be 'http://localhost:3000/api/send-email'
      const BACKEND_URL = 'send_email.php'; 

      fetch(BACKEND_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          business: businessName,
          email: email,
          phone: phone,
          revenue: revenue,
          challenge: challenge
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.status === 'success') {
          // Success Animation: Replace form contents with confirmation card
          formCard.innerHTML = `
            <div class="text-center py-10 px-4 animate-scaleIn">
              <div class="inline-flex items-center justify-center w-20 h-20 bg-brand/10 text-brand rounded-full mb-6 border border-brand/20 shadow-[0_0_20px_rgba(255,90,31,0.2)]">
                <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              
              <h3 class="font-display font-bold text-2xl text-white mb-2">Strategy Call Booked!</h3>
              <p class="text-zinc-400 text-sm mb-6 max-w-sm mx-auto">
                Thank you, <span class="text-white font-semibold">${name}</span>. We have received your booking and challenge details for <span class="text-white font-semibold">${businessName}</span>.
              </p>
              
              <div class="bg-zinc-900/80 border border-zinc-800 rounded-lg p-4 mb-6 text-left text-sm max-w-xs mx-auto">
                <p class="text-zinc-500 mb-1">What's Next?</p>
                <p class="text-zinc-300 font-medium mb-3">✓ An ad specialist will call you at <span class="text-brand font-semibold">${phone}</span>.</p>
                <p class="text-zinc-300 font-medium">✓ A custom diagnostic report has been sent to <span class="text-zinc-200 underline">${email}</span>.</p>
              </div>

              <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" 
                 class="inline-flex items-center justify-center w-full px-6 py-3 bg-brand hover:bg-brand-dark text-white font-semibold rounded-lg shadow-lg shadow-brand/20 hover:shadow-brand/30 transition-all duration-300 text-sm">
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                SELECT CALENDAR SLOT (OPTIONAL)
              </a>
              
              <p class="text-zinc-500 text-xs mt-4">We sent a calendar invite to ${email}. Check your spam if not received.</p>
            </div>
          `;
        } else {
          alert('Error: ' + data.message);
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      })
      .catch(error => {
        console.error('Error sending email:', error);
        alert('There was a problem sending your request. Please check your network connection or try again later.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      });
    });
  }

  // --- Scroll Progress Bar ---
  window.addEventListener('scroll', () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (height > 0) {
      const scrolled = (winScroll / height) * 100;
      const progressEl = document.getElementById('scroll-progress');
      if (progressEl) {
        progressEl.style.width = scrolled + '%';
      }
    }
  });

  // --- Interactive Ambient Mouse Glow (SaaS Agency Signature) ---
  const glow = document.getElementById('mouse-glow');
  if (glow) {
    window.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      glow.style.opacity = '1';
    });
    document.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
    });
  }

  // --- Hero Headline Typewriter Effect ---
  const dynamicText = document.getElementById('dynamic-text');
  const words = ['More Customers', 'Qualified Leads', 'Booked Calls', 'More Profit'];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 100; // Speed of typing letters

  function typeEffect() {
    const currentWord = words[wordIndex];
    
    if (isDeleting) {
      // Backspace letter
      dynamicText.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 40; // Deletes faster than typing
    } else {
      // Type letter
      dynamicText.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 80; // Normal typing speed
    }

    // Determine state
    if (!isDeleting && charIndex === currentWord.length) {
      typingSpeed = 2200; // Pause showing complete word
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typingSpeed = 400; // Small delay before typing the next word
    }

    setTimeout(typeEffect, typingSpeed);
  }

  if (dynamicText) {
    typeEffect();
  }
}

// Run initialization when components or DOM are ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
document.addEventListener('components-ready', initializeApp);
