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

    window.addEventListener('scroll', () => {
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
                mobileToggle.querySelectorAll('span').forEach(s => s.style.transform = 'none');
                mobileToggle.querySelectorAll('span')[1].style.opacity = '1';
            });
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

    // --- 5. PORTFOLIO CATEGORY FILTERING ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');

                if (filterValue === 'all' || category === filterValue) {
                    item.classList.remove('hidden');
                    item.style.transform = 'scale(1)';
                    item.style.opacity = '1';
                } else {
                    item.classList.add('hidden');
                    item.style.transform = 'scale(0.8)';
                    item.style.opacity = '0';
                }
            });
        });
    });

    // Handle view-more link triggers in Featured Cards
    document.querySelectorAll('.view-more-link').forEach(link => {
        link.addEventListener('click', (e) => {
            const filterToApply = link.getAttribute('data-filter');
            const targetFilterBtn = document.querySelector(`.filter-btn[data-filter="${filterToApply}"]`);
            if (targetFilterBtn) {
                targetFilterBtn.click();
            }
        });
    });

    // --- 6. DETAILED GALLERIES LIGHTBOX MODAL ---
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCat = document.getElementById('lightbox-cat');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const lightboxClose = document.getElementById('lightbox-close-btn');
    const lightboxPrev = document.getElementById('lightbox-prev-btn');
    const lightboxNext = document.getElementById('lightbox-next-btn');

    let activeGalleryGroup = [];
    let currentLightboxIdx = 0;

    function updateActiveGalleryList() {
        activeGalleryGroup = Array.from(galleryItems).filter(item => !item.classList.contains('hidden'));
    }

    function openLightbox(index) {
        updateActiveGalleryList();
        currentLightboxIdx = index;

        const currentItem = activeGalleryGroup[currentLightboxIdx];
        if (!currentItem) return;

        const mediaSrc = currentItem.getAttribute('data-src');
        const mediaTitle = currentItem.getAttribute('data-title');
        const mediaDesc = currentItem.getAttribute('data-desc');
        const rawCategory = currentItem.getAttribute('data-category');

        let displayCategory = rawCategory.toUpperCase();
        if (rawCategory === 'baby-shoots') displayCategory = 'BABY SHOOTS';
        if (rawCategory === 'pre-weddings') displayCategory = 'PRE-WEDDINGS';

        lightboxImg.src = mediaSrc;
        lightboxCat.textContent = displayCategory;
        lightboxTitle.textContent = mediaTitle;
        lightboxDesc.textContent = mediaDesc;

        lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            updateActiveGalleryList();
            const clickedIdx = activeGalleryGroup.indexOf(item);
            if (clickedIdx !== -1) {
                openLightbox(clickedIdx);
            }
        });
    });

    function closeLightbox() {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = ''; 
        setTimeout(() => {
            lightboxImg.src = '';
        }, 300);
    }

    function rotateLightbox(dir) {
        updateActiveGalleryList();
        if (activeGalleryGroup.length === 0) return;
        currentLightboxIdx = (currentLightboxIdx + dir + activeGalleryGroup.length) % activeGalleryGroup.length;
        openLightbox(currentLightboxIdx);
    }

    if (lightboxModal && lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
        lightboxPrev.addEventListener('click', () => rotateLightbox(-1));
        lightboxNext.addEventListener('click', () => rotateLightbox(1));

        lightboxModal.addEventListener('click', (e) => {
            if (e.target === lightboxModal) {
                closeLightbox();
            }
        });

        window.addEventListener('keydown', (e) => {
            if (!lightboxModal.classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') rotateLightbox(-1);
            if (e.key === 'ArrowRight') rotateLightbox(1);
        });
    }

    // --- 7. FORM INQUIRY VS BOOKING TABS & PACKAGE PRE-SELECTION ---
    const formTabBtns = document.querySelectorAll('.form-tab-btn');
    const formPanes = document.querySelectorAll('.form-pane');

    function switchFormTab(paneId) {
        formTabBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-form') === paneId) {
                btn.classList.add('active');
            }
        });

        formPanes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.getAttribute('id') === paneId) {
                pane.classList.add('active');
            }
        });
    }

    formTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchFormTab(btn.getAttribute('data-form'));
        });
    });

    // --- 8. STEP-BY-STEP BOOKING WIZARD ---
    const wizardForm = document.getElementById('wizard-booking-form');
    const wizardPrevBtn = document.getElementById('w-prev-btn');
    const wizardNextBtn = document.getElementById('w-next-btn');
    const budgetSliderInput = document.getElementById('b-budget');
    const budgetValIndicator = document.getElementById('budget-value');

    let currentWizardStep = 1;

    if (budgetSliderInput && budgetValIndicator) {
        budgetSliderInput.addEventListener('input', (e) => {
            const formattedVal = Number(e.target.value).toLocaleString();
            budgetValIndicator.textContent = `$${formattedVal}`;
        });
    }

    function updateWizardUI() {
        for (let i = 1; i <= 3; i++) {
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

                if (currentWizardStep === 3) {
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
            if (currentWizardStep < 3) {
                if (validateStep(currentWizardStep)) {
                    currentWizardStep++;
                    updateWizardUI();
                }
            } else {
                submitBookingForm();
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

        showToast("Transmitting booking request secure handshake...", "fa-clock");

        setTimeout(() => {
            if (wizardForm) wizardForm.reset();
            currentWizardStep = 1;
            updateWizardUI();

            showToast(`Congratulations ${name}! Custom shoot query successfully logged.`, "fa-circle-check");
        }, 1500);
    }

    // --- 9. GENERAL CONTACT FORM SUBMISSION ---
    const contactForm = document.getElementById('general-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('c-name').value.trim();
            showToast("Transmitting inquiry message...", "fa-paper-plane");

            setTimeout(() => {
                contactForm.reset();
                showToast(`Thank you ${name}! Your inquiry has been received.`, "fa-circle-check");
            }, 1200);
        });
    }

    // --- 10. TOAST NOTIFICATION HANDLER ---
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

    // --- 11. HERO BACKGROUND VIDEO PLAYBACK HANDLER ---
    const bgVideos = document.querySelectorAll('.hero-bg-video');
    bgVideos.forEach(video => {
        if (video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2) {
            video.classList.add('playing');
        }
        video.addEventListener('playing', () => {
            video.classList.add('playing');
        });
    });

});
