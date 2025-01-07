// InsightFlow Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Remove loading state
    document.body.classList.add('loaded');
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').slice(1);
            if (!targetId) return; // Skip if href is just "#"
            
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Initialize AI Flow Animation
    initializeAIFlowVisual();
    
    // ROI Calculator
    window.calculateROI = function() {
        const currentHours = parseFloat(document.getElementById('currentHours').value) || 0;
        const hourlyRate = parseFloat(document.getElementById('hourlyRate').value) || 0;
        const teamSize = parseInt(document.getElementById('teamSize').value) || 1;

        // Validierung
        if (currentHours <= 0 || hourlyRate <= 0) {
            alert('Bitte geben Sie gültige Werte für Stunden und Stundensatz ein.');
            return;
        }

        // Berechne die Effizienzsteigerung basierend auf der Team-Größe
        const efficiencyRates = {
            1: 0.35, // 35% für kleine Teams (1-5)
            2: 0.40, // 40% für mittlere Teams (6-15)
            3: 0.45, // 45% für große Teams (16-50)
            4: 0.50  // 50% für Enterprise (50+)
        };

        const efficiencyGain = efficiencyRates[teamSize] || 0.35;

        // Berechne die Ergebnisse
        const timeSaved = Math.round(currentHours * efficiencyGain);
        const moneySaved = Math.round(timeSaved * hourlyRate * 12); // Jährliche Ersparnis
        const efficiency = Math.round(efficiencyGain * 100);

        // Animiere die Ergebnisse
        const roiResult = document.getElementById('roiResult');
        roiResult.classList.remove('d-none');
        
        // Funktion für animierte Zahlen
        function animateValue(element, start, end, duration) {
            const range = end - start;
            const increment = range / (duration / 16);
            let current = start;
            
            const timer = setInterval(() => {
                current += increment;
                if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                    clearInterval(timer);
                    current = end;
                }
                if (element.id === 'moneySaved') {
                    element.textContent = new Intl.NumberFormat('de-DE').format(Math.round(current));
                } else {
                    element.textContent = Math.round(current);
                }
            }, 16);
        }

        // Starte die Animationen
        animateValue(document.getElementById('timeSaved'), 0, timeSaved, 1000);
        animateValue(document.getElementById('moneySaved'), 0, moneySaved, 1500);
        animateValue(document.getElementById('efficiency'), 0, efficiency, 800);

        // Scroll zu den Ergebnissen auf mobilen Geräten
        if (window.innerWidth < 768) {
            roiResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    // Back to top button
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 100) {
                backToTop.classList.add('active');
            } else {
                backToTop.classList.remove('active');
            }
        });

        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Form Submission Handler
    const demoForm = document.querySelector('.demo-form');
    if (demoForm) {
        demoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Hier könnte der Code für die Demo-Anfrage-Verarbeitung sein
            alert('Vielen Dank für Ihre Anfrage! Wir werden uns in Kürze bei Ihnen melden.');
        });
    }
});

function initializeAIFlowVisual() {
    const canvas = document.querySelector('.ai-flow-visual canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = 0;
    let mouseY = 0;
    let isHovering = false;
    let zoomLevel = 1;
    let targetZoom = 1;
    
    // Netzwerk-Punkte erstellen
    const points = [];
    const numPoints = 50;
    
    for (let i = 0; i < numPoints; i++) {
        points.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5
        });
    }

    function updatePoints() {
        points.forEach(point => {
            point.x += point.speedX;
            point.y += point.speedY;

            // Bildschirmgrenzen prüfen
            if (point.x < 0 || point.x > canvas.width) point.speedX *= -1;
            if (point.y < 0 || point.y > canvas.height) point.speedY *= -1;
        });
    }

    function drawNetwork() {
        ctx.strokeStyle = 'rgba(74, 144, 226, 0.15)';
        ctx.lineWidth = 1;

        points.forEach((point, i) => {
            points.forEach((otherPoint, j) => {
                if (i === j) return;

                const dx = point.x - otherPoint.x;
                const dy = point.y - otherPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    const alpha = (100 - distance) / 100;
                    ctx.strokeStyle = `rgba(74, 144, 226, ${alpha * 0.2})`;
                    
                    ctx.beginPath();
                    ctx.moveTo(point.x, point.y);
                    ctx.lineTo(otherPoint.x, otherPoint.y);
                    ctx.stroke();
                }
            });
        });

        points.forEach(point => {
            ctx.fillStyle = 'rgba(74, 144, 226, 0.5)';
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function updateMousePosition(e) {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        isHovering = true;
        
        targetZoom = 1.5;
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Zoom-Animation
        zoomLevel += (targetZoom - zoomLevel) * 0.1;
        
        ctx.save();
        if (isHovering) {
            ctx.translate(mouseX, mouseY);
            ctx.scale(zoomLevel, zoomLevel);
            ctx.translate(-mouseX, -mouseY);
        }
        
        updatePoints();
        drawNetwork();
        
        ctx.restore();
        requestAnimationFrame(draw);
    }

    canvas.addEventListener('mousemove', updateMousePosition);
    canvas.addEventListener('mouseleave', () => {
        isHovering = false;
        targetZoom = 1;
    });

    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    draw();
}

function initializeCursor() {
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    cursor.style.display = 'none'; // Standardmäßig versteckt
    document.body.appendChild(cursor);

    const colors = [
        '#4A90E2', // Blau
        '#36D1DC', // Türkis
        '#9333EA', // Lila
        '#4F46E5', // Indigo
        '#EC4899'  // Pink
    ];

    function createParticle(x, y) {
        const particle = document.createElement('div');
        particle.classList.add('cursor-particle');
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        document.body.appendChild(particle);
        particle.style.animation = 'particleFade 0.8s forwards';
        
        setTimeout(() => {
            particle.remove();
        }, 800);
    }

    let lastX = 0;
    let lastY = 0;
    let isMoving = false;
    let moveTimeout;
    let isOverCanvas = false;

    function updateCursor(e) {
        const aiFlowVisual = document.querySelector('.ai-flow-visual');
        const rect = aiFlowVisual.getBoundingClientRect();
        
        // Prüfen, ob der Mauszeiger über dem Canvas ist
        isOverCanvas = (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
        );

        if (isOverCanvas) {
            cursor.style.display = 'block';
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            const currentX = e.clientX;
            const currentY = e.clientY;
            const distance = Math.hypot(currentX - lastX, currentY - lastY);
            
            if (distance > 5) {
                isMoving = true;
                clearTimeout(moveTimeout);
                
                if (Math.random() > 0.7) {
                    createParticle(currentX, currentY);
                }
                
                moveTimeout = setTimeout(() => {
                    isMoving = false;
                }, 100);
                
                lastX = currentX;
                lastY = currentY;
            }
        } else {
            cursor.style.display = 'none';
        }
    }

    // Event Listeners
    document.addEventListener('mousemove', updateCursor);
    document.addEventListener('mousedown', (e) => {
        if (isOverCanvas) {
            cursor.classList.add('active');
        }
    });
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('active');
    });
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    initializeCursor();
    initializeAIFlowVisual();
});
