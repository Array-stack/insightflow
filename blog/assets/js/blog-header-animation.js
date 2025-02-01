class AINetworkVisualization {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.setup();
    }

    setup() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.createNodes();
        this.createConnections();
        this.animate();
    }

    createNodes() {
        const nodeCount = 40;
        const gridSize = Math.sqrt(nodeCount);
        
        for (let i = 0; i < nodeCount; i++) {
            const col = i % gridSize;
            const row = Math.floor(i / gridSize);
            
            this.nodes.push({
                x: (col + 1) * (this.canvas.width / (gridSize + 1)),
                y: (row + 1) * (this.canvas.height / (gridSize + 1)),
                radius: Math.random() * 3 + 2,
                pulsePhase: Math.random() * Math.PI * 2,
                color: this.generateNodeColor()
            });
        }
    }

    createConnections() {
        this.nodes.forEach((node, index) => {
            const nearNodes = this.nodes
                .filter((_, i) => i !== index)
                .sort((a, b) => 
                    Math.hypot(a.x - node.x, a.y - node.y) - 
                    Math.hypot(b.x - node.x, b.y - node.y)
                )
                .slice(0, 3);

            nearNodes.forEach(nearNode => {
                this.connections.push({
                    start: node,
                    end: nearNode,
                    opacity: 0.2,
                    width: Math.random() * 1.5 + 0.5
                });
            });
        });
    }

    generateNodeColor() {
        const colors = [
            'rgba(52, 152, 219, 0.7)',   // Blau
            'rgba(41, 128, 185, 0.7)',   // Dunkelblau
            'rgba(44, 62, 80, 0.6)'      // Graublau
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Verbindungen zeichnen
        this.connections.forEach(conn => {
            this.ctx.beginPath();
            this.ctx.moveTo(conn.start.x, conn.start.y);
            this.ctx.lineTo(conn.end.x, conn.end.y);
            
            // Elektrische Effekte
            const gradient = this.ctx.createLinearGradient(
                conn.start.x, conn.start.y, 
                conn.end.x, conn.end.y
            );
            gradient.addColorStop(0, `rgba(52, 152, 219, ${conn.opacity})`);
            gradient.addColorStop(1, `rgba(41, 128, 185, ${conn.opacity})`);
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = conn.width;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
        });

        // Knoten zeichnen mit Puls-Effekt
        this.nodes.forEach(node => {
            // Puls-Animation
            const pulseSize = Math.sin(node.pulsePhase + Date.now() * 0.002) * 2 + 3;
            
            // Haupt-Knoten
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = node.color;
            this.ctx.fill();

            // Puls-Overlay
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, pulseSize, 0, Math.PI * 2);
            this.ctx.fillStyle = `${node.color.replace('0.7)', '0.2)')}`;
            this.ctx.fill();
        });

        requestAnimationFrame(this.animate.bind(this));
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('blogHeaderCanvas');
    if (canvas) {
        function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        new AINetworkVisualization(canvas);
    }
});