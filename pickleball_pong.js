// Constants
const WIDTH = 800;
const HEIGHT = 600;
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 16;
const BALL_SPEED = 7;
const PADDLE_SPEED = 8;

// Pickleball Court Color Scheme
const BACKGROUND_COLOR = "#3773b3";       // Blue background color
const COURT_COLOR = "#008ddf";            // Blue court base
const LINE_COLOR = "#ffffff";             // White court lines
const KITCHEN_COLOR = "rgba(255, 255, 255, 0.15)"; // Non-volley zone (kitchen)
const NEON_BLUE = "rgb(0, 200, 255)";     // Player 1 color
const NEON_RED = "#f50538";   // Player 2 color
const NEON_PINK = "rgb(255, 0, 150)";     // Accent color
const NEON_GREEN = "#bde765";             // Ball color (pickleball yellow-green)
const TEXT_COLOR = "rgb(255, 255, 255)";  // White text

// Game variables
let canvas, ctx;
let paddle1, paddle2, ball;
let particles = [];
let keys = {};
let gameRunning = true;
let lastTime = 0;

// Initialize the game
window.onload = function() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    
    // Set up event listeners
    window.addEventListener("keydown", function(e) {
        keys[e.key] = true;
    });
    
    window.addEventListener("keyup", function(e) {
        keys[e.key] = false;
    });
    
    // Initialize game objects
    initGame();
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
};

// Initialize game objects
function initGame() {
    // Create paddles
    paddle1 = {
        x: 50,
        y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        color: NEON_RED,
        score: 0,
        speed: PADDLE_SPEED
    };
    
    paddle2 = {
        x: WIDTH - 50 - PADDLE_WIDTH,
        y: HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        color: NEON_PINK,
        score: 0,
        speed: PADDLE_SPEED
    };
    
    // Create ball
    resetBall();
}

// Reset ball to center
function resetBall(direction = null) {
    ball = {
        x: WIDTH / 2 - BALL_SIZE / 2,
        y: HEIGHT / 2 - BALL_SIZE / 2,
        width: BALL_SIZE,
        height: BALL_SIZE,
        color: NEON_GREEN,
        speedX: BALL_SPEED * (direction || (Math.random() > 0.5 ? 1 : -1)),
        speedY: BALL_SPEED * (Math.random() > 0.5 ? 0.7 : -0.7),
        active: false,
        trail: []
    };
}

// Main game loop
function gameLoop(timestamp) {
    // Calculate delta time
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    // Clear the canvas
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Draw court
    drawGrid();
    
    // Update game state
    update(deltaTime / 16.67); // Normalize to ~60fps
    
    // Draw game objects
    draw();
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

// Update game state
function update(deltaTime) {
    // Handle input
    handleInput(deltaTime);
    
    // Move ball if active
    if (ball.active) {
        // Add current position to trail
        ball.trail.push({x: ball.x + BALL_SIZE/2, y: ball.y + BALL_SIZE/2});
        if (ball.trail.length > 8) {
            ball.trail.shift();
        }
        
        // Move ball
        ball.x += ball.speedX;
        ball.y += ball.speedY;
        
        // Bounce off top and bottom
        if (ball.y <= 0 || ball.y + BALL_SIZE >= HEIGHT) {
            ball.speedY *= -1;
            createBounceParticles();
        }
        
        // Check collisions with paddles
        checkCollisions();
        
        // Check scoring
        checkScore();
    }
    
    // Update particles
    updateParticles();
}

// Handle keyboard input
function handleInput(deltaTime) {
    // Player 1 controls (W/S keys)
    if (keys["w"] || keys["W"]) {
        paddle1.y -= paddle1.speed;
    }
    if (keys["s"] || keys["S"]) {
        paddle1.y += paddle1.speed;
    }
    
    // Player 2 controls (Arrow keys)
    if (keys["ArrowUp"]) {
        paddle2.y -= paddle2.speed;
    }
    if (keys["ArrowDown"]) {
        paddle2.y += paddle2.speed;
    }
    
    // Serve ball with spacebar
    if ((keys[" "] || keys["Spacebar"]) && !ball.active) {
        ball.active = true;
    }
    
    // Quit with Escape
    if (keys["Escape"]) {
        gameRunning = false;
    }
    
    // Keep paddles within bounds
    paddle1.y = Math.max(0, Math.min(HEIGHT - paddle1.height, paddle1.y));
    paddle2.y = Math.max(0, Math.min(HEIGHT - paddle2.height, paddle2.y));
}

// Check collisions between ball and paddles
function checkCollisions() {
    // Check collision with paddle1
    if (ball.x <= paddle1.x + paddle1.width &&
        ball.y + ball.height >= paddle1.y &&
        ball.y <= paddle1.y + paddle1.height &&
        ball.speedX < 0) {
        
        // Calculate bounce angle
        const relativeIntersectY = (paddle1.y + (paddle1.height / 2)) - (ball.y + (ball.height / 2));
        const normalizedIntersect = relativeIntersectY / (paddle1.height / 2);
        const bounceAngle = normalizedIntersect * (Math.PI / 4); // Max angle: 45 degrees
        
        ball.speedX = Math.abs(ball.speedX);
        ball.speedY = -BALL_SPEED * Math.sin(bounceAngle);
        
        // Create hit particles
        createHitParticles(ball.x, ball.y + ball.height/2, paddle1.color, -1);
    }
    
    // Check collision with paddle2
    if (ball.x + ball.width >= paddle2.x &&
        ball.y + ball.height >= paddle2.y &&
        ball.y <= paddle2.y + paddle2.height &&
        ball.speedX > 0) {
        
        // Calculate bounce angle
        const relativeIntersectY = (paddle2.y + (paddle2.height / 2)) - (ball.y + (ball.height / 2));
        const normalizedIntersect = relativeIntersectY / (paddle2.height / 2);
        const bounceAngle = normalizedIntersect * (Math.PI / 4); // Max angle: 45 degrees
        
        ball.speedX = -Math.abs(ball.speedX);
        ball.speedY = -BALL_SPEED * Math.sin(bounceAngle);
        
        // Create hit particles
        createHitParticles(ball.x + ball.width, ball.y + ball.height/2, paddle2.color, 1);
    }
}

// Check if a player scored
function checkScore() {
    // Ball goes off left side - Player 2 scores
    if (ball.x + ball.width < 0) {
        paddle2.score++;
        createScoreParticles(0, paddle2.color);
        resetBall(-1);
    }
    
    // Ball goes off right side - Player 1 scores
    if (ball.x > WIDTH) {
        paddle1.score++;
        createScoreParticles(WIDTH, paddle1.color);
        resetBall(1);
    }
}

// Create particles when ball hits a paddle
function createHitParticles(x, y, color, direction) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 4 + 2,
            speedX: Math.random() * 3 * direction,
            speedY: Math.random() * 6 - 3,
            color: color,
            life: Math.random() * 20 + 10
        });
    }
}

// Create particles when ball bounces off top/bottom
function createBounceParticles() {
    const y = (ball.speedY < 0) ? ball.y : ball.y + ball.height;
    
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: ball.x + ball.width/2,
            y: y,
            size: Math.random() * 3 + 2,
            speedX: Math.random() * 4 - 2,
            speedY: Math.random() * 2 * (ball.speedY < 0 ? 1 : -1),
            color: NEON_GREEN,
            life: Math.random() * 15 + 5
        });
    }
}

// Create particles when a player scores
function createScoreParticles(x, color) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: Math.random() * HEIGHT,
            size: Math.random() * 5 + 3,
            speedX: Math.random() * 5 * (x === 0 ? 1 : -1),
            speedY: Math.random() * 6 - 3,
            color: color,
            life: Math.random() * 30 + 20
        });
    }
}

// Update all particles
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Draw the pickleball court
function drawGrid() {
    // Fill the background with background color
    ctx.fillStyle = BACKGROUND_COLOR;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    
    // Draw the court with court color
    ctx.fillStyle = COURT_COLOR;
    ctx.fillRect(50, 50, WIDTH - 100, HEIGHT - 100);
    
    // Set line style
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 3;
    
    // Draw court outline
    ctx.strokeRect(50, 50, WIDTH - 100, HEIGHT - 100);
    
    // Draw center line (net)
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2, 50);
    ctx.lineTo(WIDTH / 2, HEIGHT - 50);
    ctx.stroke();
    
    // Draw kitchen lines (non-volley zone) - 7 feet from net on each side
    const kitchenWidth = 120; // Scaled for our court size
    
    // Left kitchen
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2 - kitchenWidth, 50);
    ctx.lineTo(WIDTH / 2 - kitchenWidth, HEIGHT - 50);
    ctx.stroke();
    
    // Right kitchen
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2 + kitchenWidth, 50);
    ctx.lineTo(WIDTH / 2 + kitchenWidth, HEIGHT - 50);
    ctx.stroke();
    
    // Fill kitchen areas with slightly different color
    ctx.fillStyle = KITCHEN_COLOR;
    ctx.fillRect(WIDTH / 2 - kitchenWidth, 50, kitchenWidth, HEIGHT - 100);
    ctx.fillRect(WIDTH / 2, 50, kitchenWidth, HEIGHT - 100);
    
    // Draw service lines
    const serviceLineY = HEIGHT / 2;
    
    // Left service line
    ctx.beginPath();
    ctx.moveTo(50, serviceLineY);
    ctx.lineTo(WIDTH / 2 - kitchenWidth, serviceLineY);
    ctx.stroke();
    
    // Right service line
    ctx.beginPath();
    ctx.moveTo(WIDTH / 2 + kitchenWidth, serviceLineY);
    ctx.lineTo(WIDTH - 50, serviceLineY);
    ctx.stroke();
    
    // Draw centerline for service boxes
    const leftCenterX = 50 + (WIDTH / 2 - kitchenWidth - 50) / 2;
    const rightCenterX = WIDTH / 2 + kitchenWidth + (WIDTH - 50 - (WIDTH / 2 + kitchenWidth)) / 2;
    
    
    // Draw net with segments
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    
    const segmentHeight = 15;
    const gapHeight = 8;
    
    for (let y = 55; y < HEIGHT - 55; y += segmentHeight + gapHeight) {
        ctx.beginPath();
        ctx.moveTo(WIDTH / 2, y);
        ctx.lineTo(WIDTH / 2, y + segmentHeight);
        ctx.stroke();
    }
}

// Draw all game elements
function draw() {
    // Draw paddles with glow effect
    drawPaddle(paddle1);
    drawPaddle(paddle2);
    
    // Draw particles
    drawParticles();
    
    // Draw ball and trail
    drawBall();
    
    // Draw UI elements
    drawScore();
    drawInstructions();
    drawControls();
    drawTitle();
}

// Draw a paddle with glow effect (pickleball paddle style)
function drawPaddle(paddle) {
    // Draw glow effect
    ctx.shadowBlur = 10;
    ctx.shadowColor = paddle.color;
    
    // Draw paddle base (rectangular shape)
    ctx.fillStyle = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    
    // Draw paddle grip pattern (pickleball paddle texture)
    const segmentHeight = paddle.height / 12;
    ctx.fillStyle = shadeColor(paddle.color, -30);
    
    // Draw grip pattern (honeycomb-like texture)
    for (let i = 0; i < 12; i += 2) {
        ctx.fillRect(
            paddle.x + 2,
            paddle.y + i * segmentHeight,
            paddle.width - 4,
            segmentHeight
        );
    }
    
    // Draw paddle handle
    const handleWidth = 20;
    const handleHeight = 30;
    const handleX = paddle.x === 50 ? paddle.x + paddle.width : paddle.x - handleWidth;
    const handleY = paddle.y + paddle.height / 2 - handleHeight / 2;
    
    // Handle base
    ctx.fillStyle = "rgb(139, 69, 19)";
    ctx.fillRect(handleX, handleY, handleWidth, handleHeight);
    
    // Handle grip
    ctx.fillStyle = "rgb(80, 40, 10)";
    const gripWidth = handleWidth - 6;
    const gripHeight = handleHeight - 10;
    const gripX = handleX + (handleWidth - gripWidth) / 2;
    const gripY = handleY + (handleHeight - gripHeight) / 2;
    ctx.fillRect(gripX, gripY, gripWidth, gripHeight);
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

// Draw ball with trail
function drawBall() {
    // Draw trail
    for (let i = 0; i < ball.trail.length; i++) {
        const size = BALL_SIZE * (i + 1) / ball.trail.length * 0.8;
        const alpha = (i + 1) / ball.trail.length;
        
        ctx.fillStyle = `rgba(0, 255, 100, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(ball.trail[i].x, ball.trail[i].y, size/2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw ball with glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = NEON_GREEN;
    ctx.fillStyle = NEON_GREEN;
    
    // Draw circular ball
    const centerX = ball.x + ball.width/2;
    const centerY = ball.y + ball.height/2;
    const radius = ball.width/2;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw ball details (inner circle)
    ctx.fillStyle = shadeColor(NEON_GREEN, -30);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

// Draw all particles
function drawParticles() {
    for (const p of particles) {
        const alpha = p.life / 30;
        ctx.fillStyle = colorWithAlpha(p.color, alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size/2, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Draw score
function drawScore() {
    // Draw score boxes
    const boxSize = 60;
    
    // Player 1 score box
    ctx.fillStyle = "rgba(0, 0, 60, 0.7)";
    ctx.fillRect(WIDTH / 4 - boxSize/2, 20, boxSize, boxSize);
    ctx.strokeStyle = NEON_RED;
    ctx.lineWidth = 3;
    ctx.strokeRect(WIDTH / 4 - boxSize/2, 20, boxSize, boxSize);
    
    // Player 2 score box
    ctx.fillStyle = "rgba(0, 0, 60, 0.7)";
    ctx.fillRect(3 * WIDTH / 4 - boxSize/2, 20, boxSize, boxSize);
    ctx.strokeStyle = NEON_PINK;
    ctx.lineWidth = 3;
    ctx.strokeRect(3 * WIDTH / 4 - boxSize/2, 20, boxSize, boxSize);
    
    // Draw scores
    ctx.font = "bold 36px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Player 1 score
    ctx.fillStyle = NEON_RED;
    ctx.fillText(paddle1.score.toString(), WIDTH / 4, 20 + boxSize/2);
    
    // Player 2 score
    ctx.fillStyle = NEON_PINK;
    ctx.fillText(paddle2.score.toString(), 3 * WIDTH / 4, 20 + boxSize/2);
}

// Draw instructions
function drawInstructions() {
    if (!ball.active) {
        // Draw instruction box
        const boxWidth = 300;
        const boxHeight = 40;
        const boxX = WIDTH / 2 - boxWidth / 2;
        const boxY = HEIGHT / 2 + 50;
        
        // Box background
        ctx.fillStyle = "rgba(0, 0, 60, 0.7)";
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        // Box border
        ctx.strokeStyle = LINE_COLOR;
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
        
        // Dashed line effect like pickleball court markings
        ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.rect(boxX + 4, boxY + 4, boxWidth - 8, boxHeight - 8);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Instruction text
        ctx.font = "20px 'Courier New', monospace";
        ctx.fillStyle = TEXT_COLOR;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("PRESS SPACE TO SERVE", WIDTH / 2, boxY + boxHeight/2);
    }
}

// Draw controls
function drawControls() {
    // Draw control box
    const boxHeight = 30;
    ctx.fillStyle = "rgba(0, 0, 60, 0.7)";
    ctx.fillRect(10, HEIGHT - boxHeight - 10, WIDTH - 20, boxHeight);
    
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 2;
    ctx.strokeRect(10, HEIGHT - boxHeight - 10, WIDTH - 20, boxHeight);
    
    // Draw control text
    ctx.font = "16px 'Courier New', monospace";
    ctx.fillStyle = TEXT_COLOR;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("PLAYER 1: W/S", 30, HEIGHT - boxHeight/2 - 10);
    
    ctx.textAlign = "center";
    ctx.fillText("PLAYER 2: UP/DOWN", WIDTH / 2, HEIGHT - boxHeight/2 - 10);
    
    ctx.textAlign = "right";
    ctx.fillText("QUIT: ESC", WIDTH - 30, HEIGHT - boxHeight/2 - 10);
}

// Draw title
function drawTitle() {
    const title = "PICKLEBALL PONG";
    ctx.font = "bold 36px 'Courier New', monospace";
    const titleWidth = ctx.measureText(title).width;
    
    // Draw title box
    const boxWidth = titleWidth + 40;
    const boxHeight = 60;
    const boxX = WIDTH / 2 - boxWidth / 2;
    const boxY = 10;
    
    // Box background
    ctx.fillStyle = "rgba(0, 0, 60, 0.7)";
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    
    // Box border
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 3;
    ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
    
    // Pickleball pattern in background
    ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
    ctx.lineWidth = 1;
    for (let y = boxY + 4; y < boxY + boxHeight - 4; y += 8) {
        ctx.beginPath();
        ctx.moveTo(boxX + 3, y);
        ctx.lineTo(boxX + boxWidth - 3, y);
        ctx.stroke();
    }
    
    // Title text with glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#ffffff";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(title, WIDTH / 2, boxY + boxHeight/2);
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

// Helper function to shade a color (positive amt = lighter, negative = darker)
function shadeColor(color, amt) {
    let col = color;
    
    // If color is a string, convert to rgb object
    if (typeof color === "string") {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            col = {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3])
            };
        }
    }
    
    // Apply shading
    const r = Math.max(0, Math.min(255, col.r + amt));
    const g = Math.max(0, Math.min(255, col.g + amt));
    const b = Math.max(0, Math.min(255, col.b + amt));
    
    return `rgb(${r}, ${g}, ${b})`;
}

// Helper function to add alpha to a color
function colorWithAlpha(color, alpha) {
    let col = color;
    
    // If color is a string, convert to rgb object
    if (typeof color === "string") {
        const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            col = {
                r: parseInt(match[1]),
                g: parseInt(match[2]),
                b: parseInt(match[3])
            };
        }
    }
    
    return `rgba(${col.r}, ${col.g}, ${col.b}, ${alpha})`;
}