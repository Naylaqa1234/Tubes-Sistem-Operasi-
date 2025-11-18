const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleBtn");
const carouselContainer = document.querySelector(".carousel-container");
const slides = document.querySelectorAll(".video-slide");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
let currentIndex = 0;

toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

/* --- TITLE REACT TO MOUSE MOVEMENT --- */
const title = document.querySelector(".title");
const subtitles = document.querySelectorAll(".subtitle");

document.addEventListener("mousemove", (e) => {
    const x = (window.innerWidth / 2 - e.clientX) / 50;
    const y = (window.innerHeight / 2 - e.clientY) / 50;

    // Gerakkan title
    title.style.transform = `translate(${x}px, ${y}px)`;

    // Gerakkan semua subtitle
    subtitles.forEach(sub => {
        sub.style.transform = `translate(${x}px, ${y}px)`;
    });
});



/* --- CREATE FLOATING BUBBLES --- */
for (let i = 0; i < 10; i++) {
    let bubble = document.createElement("div");
    bubble.classList.add("bubble");
    bubble.style.left = Math.random() * 100 + "vw";
    bubble.style.animationDuration = 8 + Math.random() * 10 + "s";
    bubble.style.opacity = 0.2 + Math.random() * 0.4;
    document.body.appendChild(bubble);
}

/* --- CREATE PARTICLES --- */
for (let i = 0; i < 25; i++) {
    let p = document.createElement("div");
    p.classList.add("particle");
    p.style.top = Math.random() * 100 + "vh";
    p.style.left = Math.random() * 100 + "vw";
    p.style.animationDelay = Math.random() * 3 + "s";
    document.body.appendChild(p);
}

/* --- FEATURE CARDS HOVER ENHANCEMENT --- */
const featureCards = document.querySelectorAll(".feature-card");

featureCards.forEach(card => {
    card.addEventListener("mouseenter", () => {
        card.style.transform = "translateY(-15px) scale(1.05)";
    });
    card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0) scale(1)";
    });
});

/* --- VIDEO CAROUSEL LOGIC --- */
function updateSlide() {
    
    // Geser container berdasarkan index
    carouselContainer.style.transform = `translateX(-${currentIndex * 33.333}%)`;
    
    // Update class active
    slides.forEach((slide, index) => {
        slide.classList.toggle("active", index === currentIndex);
    });
}

nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlide();
});

prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateSlide();
});

// Inisialisasi slide pertama
updateSlide();
