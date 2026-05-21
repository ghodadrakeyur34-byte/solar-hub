// Custom Space Backdrop and Futuristic Interactions
document.addEventListener("DOMContentLoaded", () => {
    initSpaceCanvas();
    initScrollObserver();
    initTelemetryHUD();
    initInteractiveToggles();
});

// ==========================================
// 1. SPACE CANVAS BACKGROUND (Stars & Shooting Stars)
// ==========================================
function initSpaceCanvas() {
    const canvas = document.getElementById("space-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse coordinates for parallax stardust drift
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    window.addEventListener("mousemove", (e) => {
        targetMouseX = (e.clientX - width / 2) * 0.05;
        targetMouseY = (e.clientY - height / 2) * 0.05;
    });

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Particle Classes
    class Star {
        constructor() {
            this.reset();
            // Stagger initial position
            this.x = Math.random() * width;
            this.y = Math.random() * height;
        }

        reset() {
            this.x = Math.random() * width;
            this.y = 0;
            this.size = Math.random() * 1.5 + 0.5;
            this.speed = Math.random() * 0.2 + 0.05;
            this.alpha = Math.random() * 0.6 + 0.2;
            this.color = `rgba(255, 255, 255, ${this.alpha})`;
            this.depth = Math.random() * 0.8 + 0.2; // parallax factor
        }

        update() {
            this.y += this.speed;
            
            // Mouse parallax influence
            const driftX = mouseX * this.depth;
            const driftY = mouseY * this.depth;

            // Draw with parallax shifts
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x + driftX, this.y + driftY, this.size, 0, Math.PI * 2);
            ctx.fill();

            // Reset when leaving bottom
            if (this.y > height) {
                this.reset();
            }
        }
    }

    class ShootingStar {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * (height * 0.4);
            this.length = Math.random() * 80 + 40;
            this.speed = Math.random() * 10 + 6;
            this.angle = Math.PI / 4 + (Math.random() * 0.1 - 0.05); // Diagonal trajectory (~45 deg)
            this.dx = Math.cos(this.angle) * this.speed;
            this.dy = Math.sin(this.angle) * this.speed;
            this.opacity = 1;
            this.fadeOutSpeed = Math.random() * 0.015 + 0.008;
            
            // Color based on active CSS variable
            const style = getComputedStyle(document.documentElement);
            this.starColor = style.getPropertyValue('--accent-color').trim() || '#00f2fe';
        }

        update() {
            this.x += this.dx;
            this.y += this.dy;
            this.opacity -= this.fadeOutSpeed;

            if (this.opacity <= 0 || this.x > width || this.y > height) {
                this.reset();
            } else {
                ctx.save();
                ctx.strokeStyle = this.starColor;
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = this.opacity;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(this.x - this.dx * 3, this.y - this.dy * 3);
                ctx.stroke();
                ctx.restore();
            }
        }
    }

    // Instantiation
    const stars = [];
    for (let i = 0; i < 150; i++) {
        stars.push(new Star());
    }

    const shootingStars = [];
    for (let i = 0; i < 3; i++) {
        shootingStars.push(new ShootingStar());
    }

    // Main animation loop
    function animate() {
        ctx.fillStyle = "rgba(3, 4, 8, 0.25)"; // Trails for glowing space deepness
        ctx.fillRect(0, 0, width, height);

        // Smoothly interpolate mouse coordinates for fluid parallax
        mouseX += (targetMouseX - mouseX) * 0.08;
        mouseY += (targetMouseY - mouseY) * 0.08;

        // Render celestial dust
        stars.forEach((star) => star.update());

        // Render shooting stars
        shootingStars.forEach((star) => star.update());

        requestAnimationFrame(animate);
    }

    animate();
}

// ==========================================
// 2. SCROLL OBSERVER & DYNAMIC PALETTE
// ==========================================
function initScrollObserver() {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

    // Dynamic colors for each celestial body
    const planetColors = {
        cosmos: "#00f2fe",
        sun: "#ffd700",
        mercury: "#a9a9a9",
        venus: "#e3bb7b",
        earth: "#00f2fe",
        mars: "#ff4b4b",
        jupiter: "#ffaa44",
        saturn: "#f4d068",
        uranus: "#4df3ff",
        neptune: "#4d4dff"
    };

    const observerOptions = {
        root: null,
        rootMargin: "-20% 0px -40% 0px", // Trigger when the section occupies center viewport
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id;
                
                // Add in-view triggers for custom entry animations
                entry.target.classList.add("in-view");

                // Update navbar active link
                navLinks.forEach((link) => {
                    if (link.getAttribute("href") === `#${sectionId}`) {
                        link.classList.add("active");
                    } else {
                        link.classList.remove("active");
                    }
                });

                // Update root CSS Accent variables dynamically
                const accentColor = planetColors[sectionId] || "#00f2fe";
                document.documentElement.style.setProperty("--accent-color", accentColor);
                
                // Trigger counter animations inside in-view cards
                animateCounters(entry.target);
            } else {
                entry.target.classList.remove("in-view");
            }
        });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));

    // Logo Click scrolls to top
    const logo = document.querySelector(".logo");
    if (logo) {
        logo.addEventListener("click", () => {
            document.querySelector("#cosmos").scrollIntoView({ behavior: "smooth" });
        });
    }
}

// Stats Counter Increment Effect
function animateCounters(section) {
    const counters = section.querySelectorAll(".stat-value[data-target]");
    counters.forEach((counter) => {
        if (counter.classList.contains("counted")) return;
        counter.classList.add("counted");

        const target = parseFloat(counter.getAttribute("data-target"));
        const suffix = counter.getAttribute("data-suffix") || "";
        const isDecimal = target % 1 !== 0;

        let start = 0;
        const duration = 1200; // ms
        const startTime = performance.now();

        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out quad
            const easeProgress = progress * (2 - progress);
            const currentVal = start + easeProgress * target;

            if (isDecimal) {
                counter.textContent = currentVal.toFixed(2) + suffix;
            } else {
                counter.textContent = Math.floor(currentVal).toLocaleString() + suffix;
            }

            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString() + suffix;
            }
        }
        requestAnimationFrame(updateCounter);
    });
}

// ==========================================
// 3. SCI-FI HUD TELEMETRY PANEL
// ==========================================
function initTelemetryHUD() {
    const velocityVal = document.getElementById("hud-velocity");
    const distanceVal = document.getElementById("hud-distance");
    const statusVal = document.getElementById("hud-status");

    let lastScrollY = window.scrollY;
    let lastTime = performance.now();
    let scrollSpeed = 0;

    window.addEventListener("scroll", () => {
        const currentScrollY = window.scrollY;
        const currentTime = performance.now();
        const diffY = Math.abs(currentScrollY - lastScrollY);
        const diffTime = currentTime - lastTime;

        if (diffTime > 0) {
            // Speed = distance / time
            scrollSpeed = (diffY / diffTime) * 15; // scalar metric
        }

        lastScrollY = currentScrollY;
        lastTime = currentTime;
        
        // Dynamic simulated Telemetry Calculations
        const velocityAU = (scrollSpeed * 0.05).toFixed(2);
        if (velocityVal) velocityVal.textContent = velocityAU > 0 ? `${velocityAU} AU/s` : "0.00 AU/s";

        // Distance proportional to current scroll height
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min(window.scrollY / totalHeight, 1);
        const virtualDistance = (progress * 30.06).toFixed(2); // Max Neptune distance (~30 AU)
        if (distanceVal) distanceVal.textContent = `${virtualDistance} AU`;

        // Interactive HUD system message
        if (statusVal) {
            if (velocityAU > 2) {
                statusVal.textContent = "WARP ACTIVE";
                statusVal.style.color = "var(--accent-color)";
            } else if (velocityAU > 0.1) {
                statusVal.textContent = "PROPULSION ENGAGED";
                statusVal.style.color = "#00f2fe";
            } else {
                statusVal.textContent = "STABLE ORBIT";
                statusVal.style.color = "#22c55e";
            }
        }
    });
}

// ==========================================
// 4. PLANET ROTATION & SPIN TOGGLE CONTROLS
// ==========================================
function initInteractiveToggles() {
    // Rotation toggles
    const orbitControls = document.querySelectorAll(".orbit-control-panel");
    
    orbitControls.forEach(panel => {
        const planetImg = panel.closest(".section-content").querySelector(".planet-image");
        const btnStop = panel.querySelector(".btn-stop");
        const btnNormal = panel.querySelector(".btn-normal");
        const btnFast = panel.querySelector(".btn-fast");

        if (!planetImg) return;

        btnStop.addEventListener("click", () => {
            planetImg.style.animationPlayState = "paused";
            setActiveButton(panel, btnStop);
        });

        btnNormal.addEventListener("click", () => {
            planetImg.style.animationPlayState = "running";
            planetImg.style.animationDuration = getBaseDuration(planetImg) + "s";
            setActiveButton(panel, btnNormal);
        });

        btnFast.addEventListener("click", () => {
            planetImg.style.animationPlayState = "running";
            planetImg.style.animationDuration = (getBaseDuration(planetImg) / 5) + "s";
            setActiveButton(panel, btnFast);
        });
    });

    function setActiveButton(panel, activeButton) {
        panel.querySelectorAll(".glass-pill-btn").forEach(btn => btn.classList.remove("active"));
        activeButton.classList.add("active");
    }

    function getBaseDuration(img) {
        const id = img.closest("section").id;
        const durations = {
            sun: 120,
            mercury: 40,
            venus: 80,
            earth: 50,
            mars: 52,
            jupiter: 25,
            saturn: 30,
            uranus: 45,
            neptune: 48
        };
        return durations[id] || 60;
    }
}
