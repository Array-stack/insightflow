document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.querySelector('.ai-flow-visual canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;
    let mouseX = 0;
    let mouseY = 0;
    let isMouseOver = false;
    let time = 0;

    // Device Pixel Ratio für scharfe Darstellung
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Konfiguration
    const config = {
        nodes: {
            count: 25,
            size: 3,
            speed: 0.7,
            maxActiveNodes: 10
        },
        colors: {
            primary: '0, 74, 173', // Dunkelblau (#004AAD)
            secondary: '0, 168, 255', // Hellblau (#00A8FF)
            cursor: '0, 168, 255' // Hellblau für Mauskugel
        },
        mouse: {
            size: 30, // Größere Kugel
            opacity: 0.3, // Mehr Deckkraft
            glow: true,
            glowSize: 45, // Größerer Glow
            glowOpacity: 0.15 // Stärkerer Glow
        },
        lines: {
            maxLength: 150,
            minLength: 50,
            width: 0.5,
            curve: 0.3
        }
    };

    // Neuronale Netzwerk-Knoten
    class Node {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = config.nodes.size;
            this.speedX = (Math.random() - 0.5) * config.nodes.speed;
            this.speedY = (Math.random() - 0.5) * config.nodes.speed;
            this.connections = [];
            this.activated = false;
            this.activationTime = 0;
            this.originalX = this.x;
            this.originalY = this.y;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }

        update() {
            // Maus-Abstoßung
            if (isMouseOver) {
                const dx = this.x - mouseX / dpr;
                const dy = this.y - mouseY / dpr;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    this.x += dx * force * 0.1;
                    this.y += dy * force * 0.1;
                }
            }

            // Rückkehr zur ursprünglichen Position
            if (!isMouseOver) {
                this.x += (this.originalX - this.x) * 0.05;
                this.y += (this.originalY - this.y) * 0.05;
            }

            // Subtile kontinuierliche Bewegung
            this.x += Math.sin(time * 0.001 + this.pulsePhase) * 0.2;
            this.y += Math.cos(time * 0.001 + this.pulsePhase) * 0.2;

            // Aktivierungszustand aktualisieren
            if (this.activated) {
                this.activationTime += 0.03; // Langsamere Aktivierung
                if (this.activationTime >= 1) {
                    this.activated = false;
                    this.activationTime = 0;

                    // Nur aktivieren, wenn nicht zu viele Knoten aktiv sind
                    const activeNodes = nodes.filter(n => n.activated).length;
                    if (activeNodes < config.nodes.maxActiveNodes) {
                        const randomConnection = this.connections[Math.floor(Math.random() * this.connections.length)];
                        if (randomConnection && Math.random() > 0.7) {
                            randomConnection.activate();
                        }
                    }
                }
            }

            // Pulsphase aktualisieren
            this.pulsePhase += 0.02;
        }

        activate() {
            if (!this.activated) {
                this.activated = true;
                this.activationTime = 0;
            }
        }

        draw() {
            const size = this.size + Math.sin(this.pulsePhase) * 0.5;

            // Glow-Effekt
            if (this.activated) {
                const gradient = ctx.createRadialGradient(
                    this.x, this.y, size * 0.5,
                    this.x, this.y, size * 2
                );
                gradient.addColorStop(0, `rgba(${config.colors.secondary}, ${0.5 * (1 - this.activationTime)})`);
                gradient.addColorStop(1, `rgba(${config.colors.secondary}, 0)`);

                ctx.beginPath();
                ctx.arc(this.x, this.y, size * 2, 0, Math.PI * 2);
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            // Hauptknoten
            ctx.beginPath();
            ctx.arc(this.x, this.y, size, 0, Math.PI * 2);

            if (this.activated) {
                const alpha = 1 - this.activationTime;
                ctx.fillStyle = `rgba(${config.colors.secondary}, ${alpha})`;
            } else {
                ctx.fillStyle = `rgba(${config.colors.primary}, 0.5)`;
            }

            ctx.fill();
        }

        drawConnections() {
            this.connections.forEach(node => {
                const dx = node.x - this.x;
                const dy = node.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < config.lines.maxLength && distance > config.lines.minLength) {
                    // Kontrollpunkte für die Kurve
                    const midX = (this.x + node.x) / 2;
                    const midY = (this.y + node.y) / 2;
                    const offset = Math.sin(time * 0.001 + this.pulsePhase) * 20;

                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.quadraticCurveTo(
                        midX + dy * config.lines.curve,
                        midY - dx * config.lines.curve,
                        node.x, node.y
                    );

                    if (this.activated || node.activated) {
                        const alpha = Math.max(0.1, Math.min(1 - this.activationTime, 1 - node.activationTime));
                        ctx.strokeStyle = `rgba(${config.colors.secondary}, ${alpha * 0.3})`;
                    } else {
                        const alpha = Math.max(0.1, 0.3 - (distance - config.lines.minLength) / (config.lines.maxLength - config.lines.minLength));
                        ctx.strokeStyle = `rgba(${config.colors.primary}, ${alpha})`;
                    }

                    ctx.lineWidth = config.lines.width;
                    ctx.stroke();
                }
            });
        }
    }

    // Knoten erstellen und Verbindungen herstellen
    const nodes = Array.from({ length: config.nodes.count }, () => new Node());
    nodes.forEach(node => {
        nodes.forEach(otherNode => {
            if (node !== otherNode) {
                const dx = node.x - otherNode.x;
                const dy = node.y - otherNode.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < config.lines.maxLength && distance > config.lines.minLength) {
                    node.connections.push(otherNode);
                }
            }
        });
    });

    // Periodisch zufällige Knoten aktivieren
    setInterval(() => {
        const activeNodes = nodes.filter(n => n.activated).length;
        if (activeNodes < config.nodes.maxActiveNodes) {
            const inactiveNodes = nodes.filter(n => !n.activated);
            const randomNode = inactiveNodes[Math.floor(Math.random() * inactiveNodes.length)];
            if (randomNode) randomNode.activate();
        }
    }, 2000);

    // Animationsschleife
    function animate() {
        time = Date.now();
        ctx.clearRect(0, 0, width, height);

        // Verbindungen zeichnen
        nodes.forEach(node => {
            node.update();
            node.drawConnections();
        });

        // Knoten zeichnen
        nodes.forEach(node => node.draw());

        // Mauszeiger-Effekt
        if (isMouseOver) {
            // Äußerer Glow
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, config.mouse.glowSize, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(
                mouseX, mouseY, 0,
                mouseX, mouseY, config.mouse.glowSize
            );
            gradient.addColorStop(0, `rgba(${config.colors.cursor}, ${config.mouse.glowOpacity})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = gradient;
            ctx.fill();

            // Hauptkugel mit Gradient für 3D-Effekt
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, config.mouse.size, 0, Math.PI * 2);
            const sphereGradient = ctx.createRadialGradient(
                mouseX - config.mouse.size / 3, mouseY - config.mouse.size / 3, 0,
                mouseX, mouseY, config.mouse.size
            );
            sphereGradient.addColorStop(0, `rgba(${config.colors.cursor}, ${config.mouse.opacity + 0.2})`);
            sphereGradient.addColorStop(0.5, `rgba(${config.colors.cursor}, ${config.mouse.opacity})`);
            sphereGradient.addColorStop(1, `rgba(${config.colors.cursor}, ${config.mouse.opacity - 0.1})`);
            ctx.fillStyle = sphereGradient;
            ctx.fill();
        }

        requestAnimationFrame(animate);
    }

    // Event-Listener für Maus und Touch
    const updateMousePosition = (x, y) => {
        mouseX = x;
        mouseY = y;
    };

    const handleMouseEnter = () => {
        isMouseOver = true;
        canvas.style.cursor = 'none';
    };

    const handleMouseLeave = () => {
        isMouseOver = false;
        canvas.style.cursor = 'default';
    };

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        updateMousePosition(e.clientX - rect.left, e.clientY - rect.top);
    });

    canvas.addEventListener('mouseenter', handleMouseEnter);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    canvas.addEventListener('touchstart', (e) => {
        handleMouseEnter();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        updateMousePosition(touch.clientX - rect.left, touch.clientY - rect.top);
    });

    canvas.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        updateMousePosition(touch.clientX - rect.left, touch.clientY - rect.top);
    });

    canvas.addEventListener('touchend', handleMouseLeave);

    // Fenstergröße anpassen
    window.addEventListener('resize', () => {
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
    });

    // Animation starten
    animate();
});