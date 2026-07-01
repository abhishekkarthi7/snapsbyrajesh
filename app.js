/*
========================================================================
   SBR PHOTO - INTERACTIVE RUNTIME SYSTEM
========================================================================
*/

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. HEADER SCROLL & LINK HIGHLIGHTING ---
    const header = document.getElementById('main-header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');
    const progressBar = document.querySelector('.scroll-progress-bar');

    window.addEventListener('scroll', () => {
        // Update Scroll Progress Bar
        if (progressBar) {
            const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = windowHeight > 0 ? (window.scrollY / windowHeight) * 100 : 0;
            progressBar.style.width = `${scrollPercent}%`;
        }

        // Sticky Header class toggler
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active link highlighting on scroll
        let currentSectionId = 'home';
        sections.forEach(sec => {
            const secTop = sec.offsetTop - 120;
            const secHeight = sec.offsetHeight;
            if (window.scrollY >= secTop && window.scrollY < secTop + secHeight) {
                currentSectionId = sec.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    // --- 2. MOBILE HAMBURGER MENU DRAWER ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileToggle.classList.toggle('open');
            document.body.classList.toggle('mobile-menu-open');

            // Animated hamburger toggle lines
            const spans = mobileToggle.querySelectorAll('span');
            if (mobileToggle.classList.contains('open')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 6deg)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(5px, -6deg)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });

        // Close menu when a link is clicked
        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('open');
                document.body.classList.remove('mobile-menu-open');
                mobileToggle.querySelectorAll('span').forEach(s => s.style.transform = 'none');
                mobileToggle.querySelectorAll('span')[1].style.opacity = '1';
            });
        });

        // Close menu when clicking outside of it
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active')) {
                if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                    mobileToggle.classList.remove('open');
                    document.body.classList.remove('mobile-menu-open');
                    
                    const spans = mobileToggle.querySelectorAll('span');
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            }
        });
    }

    // --- 3. AUTO-ADVANCING & INTERACTIVE SHOWCASE CARD CROSSFADER & BG VIDEO SYNCHRONIZER ---
    const heroSlides = document.querySelectorAll('.hero-card-slide');
    const bgVideoSlides = document.querySelectorAll('.hero-bg-video-slide');
    const heroPrevBtn = document.getElementById('hero-prev-btn');
    const heroNextBtn = document.getElementById('hero-next-btn');
    let currentHeroSlide = 0;
    const slideInterval = 5000; // 5 seconds per scene
    let heroSlideTimer;

    function showHeroSlide(index) {
        if (heroSlides.length <= 1) return;

        // Fade out current front slide and background video slide
        heroSlides[currentHeroSlide].classList.remove('active');
        if (bgVideoSlides.length > currentHeroSlide) {
            bgVideoSlides[currentHeroSlide].classList.remove('active');
        }

        // Update index
        currentHeroSlide = (index + heroSlides.length) % heroSlides.length;

        // Fade in next front slide and background video slide
        heroSlides[currentHeroSlide].classList.add('active');
        if (bgVideoSlides.length > currentHeroSlide) {
            bgVideoSlides[currentHeroSlide].classList.add('active');

            // Play active background video
            const activeBgVideo = bgVideoSlides[currentHeroSlide].querySelector('.hero-bg-video');
            if (activeBgVideo) {
                try {
                    activeBgVideo.play();
                } catch (e) {
                    console.log("Background video play blocked/failed: ", e);
                }
            }
        }

        resetHeroSlideTimer();
    }

    function resetHeroSlideTimer() {
        clearInterval(heroSlideTimer);
        heroSlideTimer = setInterval(() => {
            showHeroSlide(currentHeroSlide + 1);
        }, slideInterval);
    }

    if (heroSlides.length > 1) {
        resetHeroSlideTimer();

        // Programmatically bypass browser cache for local video files to play newly uploaded videos instantly
        if (bgVideoSlides.length > 0) {
            bgVideoSlides.forEach(slide => {
                const video = slide.querySelector('.hero-bg-video');
                if (video) {
                    const firstSource = video.querySelector('source');
                    if (firstSource) {
                        const src = firstSource.getAttribute('src');
                        if (src && src.startsWith('assets/')) {
                            // Direct src assignment forces browser to reload the correct file
                            video.src = `${src}?v=${Date.now()}`;
                            video.load();
                        }
                    }
                }
            });
            
            // Explicitly play the first background video on page load
            const firstBgVideo = bgVideoSlides[0].querySelector('.hero-bg-video');
            if (firstBgVideo) {
                try {
                    firstBgVideo.play();
                } catch (e) {
                    console.log("First background video play exception: ", e);
                }
            }
        }

        // Play active background video on first user interaction in case of browser autoplay blocks
        const playVideoOnInteraction = () => {
            if (bgVideoSlides.length > currentHeroSlide) {
                const activeBgVideo = bgVideoSlides[currentHeroSlide].querySelector('.hero-bg-video');
                if (activeBgVideo && activeBgVideo.paused) {
                    activeBgVideo.play().then(() => {
                        document.removeEventListener('click', playVideoOnInteraction);
                        document.removeEventListener('keydown', playVideoOnInteraction);
                    }).catch(e => console.log("Interaction background video play blocked:", e));
                }
            }
        };
        document.addEventListener('click', playVideoOnInteraction);
        document.addEventListener('keydown', playVideoOnInteraction);

        if (heroPrevBtn) {
            heroPrevBtn.addEventListener('click', () => showHeroSlide(currentHeroSlide - 1));
        }
        if (heroNextBtn) {
            heroNextBtn.addEventListener('click', () => showHeroSlide(currentHeroSlide + 1));
        }
    }

    // --- 4. BIOGRAPHY IMAGE AUTO-CHANGER (SLIDESHOW) ---
    const bioImages = document.querySelectorAll('.bio-portrait-img');
    let currentBioImgIdx = 0;
    const bioImgInterval = 4000; // 4 seconds per photographer slide

    function cycleBioImages() {
        if (bioImages.length <= 1) return;

        // Fade out current image
        bioImages[currentBioImgIdx].classList.remove('active');

        // Increment index
        currentBioImgIdx = (currentBioImgIdx + 1) % bioImages.length;

        // Fade in next image
        bioImages[currentBioImgIdx].classList.add('active');
    }

    if (bioImages.length > 1) {
        setInterval(cycleBioImages, bioImgInterval);
    }

    // --- 4.5 GALLERY FILTERING SYSTEM ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (filterBtns.length > 0 && galleryItems.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                galleryItems.forEach(item => {
                    const itemCategory = item.getAttribute('data-category');
                    if (filterValue === 'all' || itemCategory === filterValue) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                });
            });
        });
    }

    // --- 5. PORTFOLIO "LEARN MORE" & DYNAMIC LIGHTBOX ---
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxClose = document.getElementById('lightbox-close-btn');
    const lightboxPrev = document.getElementById('lightbox-prev-btn');
    const lightboxNext = document.getElementById('lightbox-next-btn');
    const lightboxPreviewsGrid = document.getElementById('lightbox-previews-grid');

    let currentProjectImages = [];
    let currentImageIndex = 0;

    function openProjectLightbox(item) {
        const rawImages = item.getAttribute('data-images') || '';
        currentProjectImages = rawImages.split(',').map(img => img.trim()).filter(img => img.length > 0);
        
        if (currentProjectImages.length === 0) return;

        currentImageIndex = 0;
        const projectTitle = item.getAttribute('data-title') || 'SBR Collection';
        const projectDesc = item.getAttribute('data-desc') || '';

        lightboxTitle.textContent = projectTitle;
        lightboxDesc.textContent = projectDesc;
        
        updateLightboxImage();
        buildLightboxThumbnails();

        if (lightboxModal) {
            lightboxModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function updateLightboxImage() {
        if (!lightboxImg || currentProjectImages.length === 0) return;
        
        // Fade out transition effect
        lightboxImg.style.opacity = '0';
        
        setTimeout(() => {
            lightboxImg.src = currentProjectImages[currentImageIndex];
            lightboxImg.style.opacity = '1';
            
            // Highlight active thumbnail
            const thumbs = lightboxPreviewsGrid.querySelectorAll('.lightbox-thumb');
            thumbs.forEach((thumb, idx) => {
                if (idx === currentImageIndex) {
                    thumb.classList.add('active');
                } else {
                    thumb.classList.remove('active');
                }
            });
        }, 150);
    }

    function buildLightboxThumbnails() {
        if (!lightboxPreviewsGrid) return;
        lightboxPreviewsGrid.innerHTML = '';

        currentProjectImages.forEach((imgUrl, idx) => {
            const thumb = document.createElement('img');
            thumb.src = imgUrl;
            thumb.alt = `Preview ${idx + 1}`;
            thumb.classList.add('lightbox-thumb');
            if (idx === currentImageIndex) {
                thumb.classList.add('active');
            }

            thumb.addEventListener('click', () => {
                currentImageIndex = idx;
                updateLightboxImage();
            });

            lightboxPreviewsGrid.appendChild(thumb);
        });
    }

    function navigateLightbox(direction) {
        if (currentProjectImages.length === 0) return;
        currentImageIndex = (currentImageIndex + direction + currentProjectImages.length) % currentProjectImages.length;
        updateLightboxImage();
    }

    // Attach event listeners to gallery items for Learn More clicks
    galleryItems.forEach(item => {
        const learnMoreBtn = item.querySelector('.learn-more-action');
        if (learnMoreBtn) {
            learnMoreBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Avoid triggering parent click
                openProjectLightbox(item);
            });
        }
        // Fallback: clicking the item overlay opens as well
        const overlay = item.querySelector('.gallery-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                openProjectLightbox(item);
            });
        }
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            if (lightboxModal) {
                lightboxModal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    }
    if (lightboxNext) {
        lightboxNext.addEventListener('click', () => navigateLightbox(1));
    }

    if (lightboxModal) {
        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                if (lightboxModal) {
                    lightboxModal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        });
    }

    window.addEventListener('keydown', (e) => {
        if (!lightboxModal || !lightboxModal.classList.contains('active')) return;
        if (e.key === 'Escape') {
            lightboxModal.classList.remove('active');
            document.body.style.overflow = '';
        }
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });


    // --- 6. SLIDE-UP BOOKING WIZARD MODAL ---
    const bookingOverlay = document.getElementById('booking-modal-overlay');
    const bookingCloseBtn = document.getElementById('booking-close-btn');
    const bookingTriggers = document.querySelectorAll('.trigger-booking');

    function openBookingModal() {
        if (bookingOverlay) {
            bookingOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            currentWizardStep = 1;
            updateWizardUI();
        }
    }

    function closeBookingModal() {
        if (bookingOverlay) {
            bookingOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    bookingTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            openBookingModal();
        });
    });

    if (bookingCloseBtn) {
        bookingCloseBtn.addEventListener('click', closeBookingModal);
    }

    if (bookingOverlay) {
        bookingOverlay.addEventListener('click', (e) => {
            if (e.target === bookingOverlay) {
                closeBookingModal();
            }
        });
    }

    // --- 7. STEP-BY-STEP BOOKING WIZARD (Exactly 2 Steps) ---
    const wizardForm = document.getElementById('wizard-booking-form');
    const wizardPrevBtn = document.getElementById('w-prev-btn');
    const wizardNextBtn = document.getElementById('w-next-btn');

    let currentWizardStep = 1;

    function updateWizardUI() {
        for (let i = 1; i <= 2; i++) {
            const node = document.getElementById(`node-${i}`);
            const content = document.getElementById(`step-${i}-content`);

            if (content && node) {
                content.style.display = 'none';
                node.classList.remove('active', 'completed');

                if (i < currentWizardStep) {
                    node.classList.add('completed');
                } else if (i === currentWizardStep) {
                    node.classList.add('active');
                    content.style.display = 'block';
                }
            }
        }

        if (wizardPrevBtn && wizardNextBtn) {
            if (currentWizardStep === 1) {
                wizardPrevBtn.style.visibility = 'hidden';
                wizardNextBtn.innerHTML = 'Next Step <i class="fa-solid fa-arrow-right" style="margin-left: 6px;"></i>';
            } else {
                wizardPrevBtn.style.visibility = 'visible';

                if (currentWizardStep === 2) {
                    wizardNextBtn.innerHTML = 'Submit Booking <i class="fa-solid fa-check" style="margin-left: 6px;"></i>';
                } else {
                    wizardNextBtn.innerHTML = 'Next Step <i class="fa-solid fa-arrow-right" style="margin-left: 6px;"></i>';
                }
            }
        }
    }

    function validateStep(step) {
        if (step === 1) {
            const checkedServices = document.querySelectorAll('input[name="b-services"]:checked');
            if (checkedServices.length === 0) {
                showToast("Please select at least one photography/videography service to continue.", "fa-triangle-exclamation");
                return false;
            }

            const bDate = document.getElementById('b-date').value;
            if (!bDate) {
                showToast("Please pick a proposed event date to proceed.", "fa-calendar-days");
                return false;
            }

            const bLoc = document.getElementById('b-location').value.trim();
            if (!bLoc) {
                showToast("Please enter a proposed shoot location.", "fa-map-pin");
                return false;
            }
            return true;
        }

        if (step === 2) {
            const bName = document.getElementById('b-name').value.trim();
            if (!bName) {
                showToast("Please enter your full name.", "fa-user");
                return false;
            }

            const bPhone = document.getElementById('b-phone').value.trim();
            if (!bPhone || bPhone.length < 7) {
                showToast("Please provide a valid mobile number.", "fa-phone");
                return false;
            }

            const bEmail = document.getElementById('b-email').value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!bEmail || !emailRegex.test(bEmail)) {
                showToast("Please provide a valid email coordinates.", "fa-envelope");
                return false;
            }
            return true;
        }

        return true;
    }

    if (wizardNextBtn) {
        wizardNextBtn.addEventListener('click', () => {
            if (currentWizardStep < 2) {
                if (validateStep(currentWizardStep)) {
                    currentWizardStep++;
                    updateWizardUI();
                }
            } else {
                if (validateStep(currentWizardStep)) {
                    submitBookingForm();
                }
            }
        });
    }

    if (wizardPrevBtn) {
        wizardPrevBtn.addEventListener('click', () => {
            if (currentWizardStep > 1) {
                currentWizardStep--;
                updateWizardUI();
            }
        });
    }

    function submitBookingForm() {
        const name = document.getElementById('b-name').value.trim();
        const phone = document.getElementById('b-phone').value.trim();
        const email = document.getElementById('b-email').value.trim();
        const date = document.getElementById('b-date').value;
        const location = document.getElementById('b-location').value.trim();

        // Get selected services
        const selectedServices = [];
        document.querySelectorAll('input[name="b-services"]:checked').forEach(cb => {
            selectedServices.push(cb.value.toUpperCase());
        });

        const servicesStr = selectedServices.join(', ');

        showToast("PREPARING WHATSAPP BOOKING HANDSHAKE...", "fa-clock");

        // Format message for WhatsApp
        const message = `HELLO SBR PHOTO STUDIO,

I WOULD LIKE TO BOOK A BESPOKE SHOOT! HERE ARE MY BOOKING DETAILS:

- SERVICES INTERESTED: ${servicesStr}
- PROPOSED SHOOT DATE: ${date}
- PROPOSED LOCATION: ${location.toUpperCase()}

CLIENT INFORMATION:
- FULL NAME: ${name.toUpperCase()}
- MOBILE NUMBER: ${phone}
- EMAIL ADDRESS: ${email.toUpperCase()}

THANK YOU!`;

        // URL encode the message
        const encodedMessage = encodeURIComponent(message);
        
        // =========================================================================
        // USER CONFIGURATION: WHATSAPP PHONE NUMBER
        // =========================================================================
        // This is the phone number where WhatsApp booking requests are sent.
        // Format: [Country Code][Number] without spaces or '+' (e.g. 919347071994).
        // Change the number inside the quotes below to your exact WhatsApp number!
        const whatsappNumber = "919347071994"; 
        // ========================================================================= 

        setTimeout(() => {
            if (wizardForm) wizardForm.reset();
            currentWizardStep = 1;
            updateWizardUI();
            closeBookingModal();

            // Redirect to WhatsApp in a new tab
            const waUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${encodedMessage}`;
            window.open(waUrl, '_blank');

            showToast(`BOOKING DETAILS READY! REDIRECTED TO WHATSAPP.`, "fa-circle-check");
        }, 1500);
    }

    // --- 8. GENERAL CONTACT FORM SUBMISSION ---
    const contactForm = document.getElementById('general-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('c-name').value.trim();
            const email = document.getElementById('c-email').value.trim();
            const subject = document.getElementById('c-subject').value.trim();
            const message = document.getElementById('c-message').value.trim();

            showToast("Opening mail client...", "fa-paper-plane");

            setTimeout(() => {
                contactForm.reset();

                const recipient = "snapsbyrajesh@gmail.com";
                const mailtoSubject = encodeURIComponent(subject);
                const mailtoBody = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
                const mailtoUrl = `mailto:${recipient}?subject=${mailtoSubject}&body=${mailtoBody}`;

                // Redirect to system's mail client (e.g. Gmail/Outlook)
                window.location.href = mailtoUrl;

                showToast(`Redirected to mail client!`, "fa-circle-check");
            }, 1200);
        });
    }

    // --- 9. TOAST NOTIFICATION HANDLER ---
    const toastBox = document.getElementById('toast-box');
    const successToast = document.getElementById('success-toast');
    const toastMsg = document.getElementById('toast-msg');
    let toastTimeout;

    function showToast(message, iconName = "fa-circle-check") {
        if (!successToast || !toastMsg) return;
        clearTimeout(toastTimeout);

        const iconContainer = successToast.querySelector('.toast-icon');
        iconContainer.innerHTML = `<i class="fa-solid ${iconName}"></i>`;

        toastMsg.textContent = message;
        successToast.classList.add('show');

        toastTimeout = setTimeout(() => {
            successToast.classList.remove('show');
        }, 5000);
    }

    // --- 10. HERO BACKGROUND VIDEO PLAYBACK HANDLER ---
    const bgVideos = document.querySelectorAll('.hero-bg-video');
    bgVideos.forEach(video => {
        if (video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2) {
            video.classList.add('playing');
        }
        video.addEventListener('playing', () => {
            video.classList.add('playing');
        });
    });

    // --- 11. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER) ---
    const revealElements = document.querySelectorAll('.gallery-item, .stat-counter-box, .approach-item, .contact-card, .form-card, .bio-story-wrap, .bio-img-col, .social-journey-wrap, .section-header');
    
    revealElements.forEach(el => {
        el.classList.add('reveal-item');
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

});
