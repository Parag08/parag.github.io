document.addEventListener('DOMContentLoaded', () => {
    // 1. Custom Cursor Logic
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorBlob = document.querySelector('.cursor-blob');

    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;

        // Animate dot immediately
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        // Animate blob with slight delay for smooth trailing effect
        cursorBlob.animate({
            left: `${posX}px`,
            top: `${posY}px`
        }, { duration: 500, fill: "forwards" });
    });

    // Add hover effect to interactive elements
    const interactives = document.querySelectorAll('a, button, .timeline-content, .edu-card, .tag');

    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(2)';
            cursorDot.style.backgroundColor = 'transparent';
            cursorDot.style.border = '1px solid var(--accent-primary)';
        });

        el.addEventListener('mouseleave', () => {
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorDot.style.backgroundColor = 'var(--accent-primary)';
            cursorDot.style.border = 'none';
        });
    });

    // Mobile Menu Logic
    const menuToggle = document.querySelector('.menu-toggle');
    const menuClose = document.querySelector('.menu-close');
    const mobileMenu = document.querySelector('.mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

    function toggleMenu() {
        mobileMenu.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    if (menuToggle) menuToggle.addEventListener('click', toggleMenu);
    if (menuClose) menuClose.addEventListener('click', toggleMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // 3. Scroll Reveal Animation using IntersectionObserver
    const revealElements = document.querySelectorAll('.reveal');

    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealOnScroll.observe(el);
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Initialize 3D Background
    initThreeJS();
});

// --- 3D Background Setup ---
function initThreeJS() {
    const canvas = document.getElementById('hero-3d-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    
    // Canvas responds to full window viewport size
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    // Particle/Network setup
    const particleCount = 150;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    const range = 12; // Spread of particles
    for (let i = 0; i < particleCount * 3; i++) {
        // Random positions centering around 0
        positions[i] = (Math.random() - 0.5) * range;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Gold accent points 
    const pointMaterial = new THREE.PointsMaterial({
        color: 0xd4af37, // var(--accent-primary)
        size: 0.06,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const points = new THREE.Points(geometry, pointMaterial);
    scene.add(points);

    // Lines between close nodes (Neural Network / Blockchain feel)
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x38bdf8, // Slight blue/glass accent
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending
    });

    const lineGeometry = new THREE.BufferGeometry();
    const lineObj = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineObj);

    // Compute lines
    function updateLines() {
        const posAttributes = points.geometry.attributes.position.array;
        const linePositions = [];

        for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < particleCount; j++) {
                const dx = posAttributes[i * 3] - posAttributes[j * 3];
                const dy = posAttributes[i * 3 + 1] - posAttributes[j * 3 + 1];
                const dz = posAttributes[i * 3 + 2] - posAttributes[j * 3 + 2];
                const distSq = dx*dx + dy*dy + dz*dz;

                if (distSq < 5) { // If nodes are close enough, draw a line
                    linePositions.push(
                        posAttributes[i * 3], posAttributes[i * 3 + 1], posAttributes[i * 3 + 2],
                        posAttributes[j * 3], posAttributes[j * 3 + 1], posAttributes[j * 3 + 2]
                    );
                }
            }
        }
        lineObj.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    }
    updateLines();

    // Mouse interactivity
    let mouseX = 0;
    let mouseY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Handle Window Resize
    window.addEventListener('resize', () => {
        if (!canvas) return;
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Ensure strictly positive size
        if (width > 0 && height > 0) {
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height, false);
        }
    });

    // Initial resize trigger to fix aspect ratio on load
    setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 100);

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Slowly rotate particle system
        points.rotation.y = elapsedTime * 0.05;
        points.rotation.x = elapsedTime * 0.025;
        
        lineObj.rotation.y = elapsedTime * 0.05;
        lineObj.rotation.x = elapsedTime * 0.025;

        // Mouse Parallax effect
        const targetX = mouseX * 0.001;
        const targetY = mouseY * 0.001;
        
        scene.rotation.y += 0.05 * (targetX - scene.rotation.y);
        scene.rotation.x += 0.05 * (targetY - scene.rotation.x);

        renderer.render(scene, camera);
    }
    
    animate();
}

window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});
