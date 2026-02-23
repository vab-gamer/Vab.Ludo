class VabLudo {

constructor() {

this.canvas = document.getElementById('board');
this.ctx = this.canvas.getContext('2d');

this.players = 4;
this.currentPlayer = 0;
this.diceValue = 0;
this.gameMode = 'human';

this.safePositions = [0, 8, 13, 21, 26, 34, 39, 47];

this.pathLength = 52;

this.tokens = [];
this.history = [];

this.initTokens();
this.initEvents();
this.updateUI();
this.drawBoard();
}

initTokens() {
this.tokens = [];
for (let p = 0; p < 4; p++) {
let playerTokens = [];
for (let t = 0; t < 4; t++) {
playerTokens.push({
pos: -1,
negativeCharges: 2,
eligible: false
});
}
this.tokens.push(playerTokens);
}
}

initEvents() {

document.getElementById('rollBtn').onclick = () => this.rollDice();
document.getElementById('negativeBtn').onclick = () => this.rollDice(true);
document.getElementById('resetBtn').onclick = () => this.reset();
document.getElementById('undoBtn').onclick = () => this.undo();
document.getElementById('newGameBtn').onclick = () => this.reset();

document.querySelectorAll('.mode-btn').forEach(btn => {
btn.onclick = (e) => {
document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
e.target.classList.add('active');
this.gameMode = e.target.dataset.mode;
this.reset();
};
});

this.canvas.onclick = () => this.autoMove();
}

rollDice(forceNegative = false) {

if (this.diceValue !== 0) return;

if (forceNegative) {
this.diceValue = -(Math.floor(Math.random() * 3) + 1);
} else {

let negativeAvailable = this.tokens[this.currentPlayer]
.some(t => t.pos > 0 && t.eligible && t.negativeCharges > 0);

if (negativeAvailable && Math.random() < 0.2) {
this.diceValue = -(Math.floor(Math.random() * 3) + 1);
} else {
this.diceValue = Math.floor(Math.random() * 6) + 1;
}
}

document.getElementById('dice').textContent =
this.diceValue > 0 ? this.diceValue : `-${Math.abs(this.diceValue)}`;

this.updateUI();
}

autoMove() {

if (this.diceValue === 0) return;

let playerTokens = this.tokens[this.currentPlayer];

for (let token of playerTokens) {

if (this.canMove(token)) {

this.saveState();
this.moveToken(token);
this.afterMove();
return;
}
}

this.diceValue = 0;
this.nextTurn();
}

canMove(token) {

if (token.pos === -1 && this.diceValue === 6) return true;

if (token.pos >= 0) {
let newPos = token.pos + this.diceValue;
if (newPos < 0) return false;
return true;
}

return false;
}

moveToken(token) {

if (token.pos === -1 && this.diceValue === 6) {
token.pos = this.currentPlayer * 13;
}
else {
token.pos += this.diceValue;
if (token.pos < 0) token.pos = 0;
if (token.pos >= this.pathLength) token.pos = this.pathLength;
}

if (token.pos > 0) token.eligible = true;

this.handleCapture(token);
}

handleCapture(movedToken) {

if (this.safePositions.includes(movedToken.pos)) return;

for (let p = 0; p < 4; p++) {

if (p === this.currentPlayer) continue;

for (let token of this.tokens[p]) {

if (token.pos === movedToken.pos) {
token.pos = -1;
token.eligible = false;
token.negativeCharges = 2;
}
}
}
}

afterMove() {

if (this.checkWin()) return;

if (this.diceValue !== 6) {
this.nextTurn();
}

this.diceValue = 0;
this.updateUI();

if (this.gameMode === 'bot' && this.currentPlayer !== 0) {
setTimeout(() => this.botMove(), 800);
}
}

botMove() {
this.rollDice();
setTimeout(() => this.autoMove(), 500);
}

nextTurn() {
this.currentPlayer = (this.currentPlayer + 1) % 4;
}

checkWin() {

let win = this.tokens[this.currentPlayer]
.every(t => t.pos >= this.pathLength);

if (win) {
document.getElementById('winText').textContent =
`Player ${this.currentPlayer + 1} Wins! 🎉`;
document.getElementById('winModal').style.display = 'flex';
return true;
}

return false;
}

saveState() {
this.history.push(JSON.stringify(this.tokens));
}

undo() {
if (this.history.length > 0) {
this.tokens = JSON.parse(this.history.pop());
this.updateUI();
}
}

reset() {
this.initTokens();
this.currentPlayer = 0;
this.diceValue = 0;
this.history = [];
document.getElementById('winModal').style.display = 'none';
this.updateUI();
}

updateUI() {

document.getElementById('turn').textContent =
`Player ${this.currentPlayer + 1}'s Turn`;

let info = '';
this.tokens[this.currentPlayer].forEach((t, i) => {
info += `Token ${i+1}: ${t.pos}<br>`;
});

document.getElementById('tokens-status').innerHTML = info;
}

drawBoard() {

this.ctx.fillStyle = "#FFF8DC";
this.ctx.fillRect(0,0,600,600);

this.ctx.strokeStyle = "#000";
this.ctx.lineWidth = 4;
this.ctx.strokeRect(50,50,500,500);

this.drawTokens();
requestAnimationFrame(() => this.drawBoard());
}

drawTokens() {

const colors = ["#FF4444","#4169E1","#32CD32","#FFD700"];

this.tokens.forEach((playerTokens,p) => {

playerTokens.forEach(token => {

let x,y;

if (token.pos === -1) {
x = 80 + p*120;
y = 80;
}
else {
x = 70 + (token.pos % 13)*35;
y = 200 + Math.floor(token.pos/13)*35;
}

this.ctx.fillStyle = colors[p];
this.ctx.beginPath();
this.ctx.arc(x,y,15,0,Math.PI*2);
this.ctx.fill();
this.ctx.stroke();
});
});
}
}

new VabLudo();        this.resetGame();
    }

    rollDice() {
        const dice = document.getElementById('dice');
        dice.classList.add('shake');
        
        setTimeout(() => {
            this.diceValue = this.gameMode === 'human' || this.selectedToken === null ? 
                Math.floor(Math.random() * 6) + 1 : this.rollNegativeForToken();
            
            dice.textContent = this.diceValue > 0 ? this.diceValue : `-${Math.abs(this.diceValue)}`;
            dice.classList.remove('shake');
            if (this.diceValue < 0) dice.classList.add('negative');
            else dice.classList.remove('negative');
            
            this.highlightValidMoves();
            this.updateDisplay();
        }, 500);
    }

    rollNegativeForToken() {
        const token = this.getCurrentPlayerTokens().find(t => t.pos >= 1 && t.isEligible && t.negativeCharges > 0);
        if (!token) return Math.floor(Math.random() * 6) + 1;
        
        const isNegative = Math.random() < 0.2;
        if (isNegative) {
            token.negativeCharges--;
            return -(Math.floor(Math.random() * 3) + 1);
        }
        return Math.floor(Math.random() * 3) + 1;
    }

    activateNegative() {
        const eligibleTokens = this.getCurrentPlayerTokens().filter(t => t.pos >= 1 && t.isEligible);
        if (eligibleTokens.length > 0) {
            document.getElementById('negativeBtn').style.display = 'none';
            this.rollDice(); // Auto-roll negative
        }
    }

    getCurrentPlayerTokens() {
        return this.tokens[this.currentPlayer];
    }

    handleClick(e) {
        if (this.selectedToken !== null) {
            this.moveSelectedToken();
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check yard clicks
        const tokenIndex = this.checkYardClick(x, y);
        if (tokenIndex !== -1 && this.canExitYard(tokenIndex)) {
            this.selectToken(tokenIndex);
        }
    }

    checkYardClick(x, y) {
        const yardSize = 40;
        const positions = [
            [[100,100], [160,100]], // Red yard
            [[500,100], [440,100]], // Blue yard  
            [[500,500], [440,500]], // Green yard
            [[100,500], [160,500]]  // Yellow yard
        ];
        
        for (let i = 0; i < 4; i++) {
            if (this.currentPlayer === i) {
                for (let j = 0; j < 2; j++) {
                    const [cx, cy] = positions[i][j];
                    if (Math.hypot(x - cx, y - cy) < yardSize) {
                        return j * 2; // Approximate token index
                    }
                }
            }
        }
        return -1;
    }

    canExitYard(tokenIndex) {
        return this.diceValue === 6 && this.getCurrentPlayerTokens()[tokenIndex].pos === -1;
    }

    selectToken(tokenIndex) {
        this.selectedToken = tokenIndex;
        this.highlightValidMoves();
    }

    moveSelectedToken() {
        const token = this.getCurrentPlayerTokens()[this.selectedToken];
        
        if (token.pos === -1 && this.diceValue === 6) {
            token.pos = 0;
        } else if (token.pos >= 0) {
            let newPos = token.pos + this.diceValue;
            if (newPos < 0) newPos = 0;
            
            // Check capture
            const occupant = this.getTokenAtPosition(newPos);
            if (occupant && occupant.player !== this.currentPlayer) {
                this.sendToYard(occupant);
                this.moveHistory.push(`Player ${this.currentPlayer + 1} captured Player ${occupant.player + 1}!`);
            }
            
            token.pos = newPos;
        }
        
        // Update negative eligibility
        if (token.pos >= 1 && !token.isEligible) {
            token.isEligible = true;
            token.negativeCharges = 2;
        }
        
        this.moveHistory.push(`Token moved to ${token.pos}`);
        this.selectedToken = null;
        this.nextTurn();
    }

    getTokenAtPosition(pos) {
        for (let player = 0; player < 4; player++) {
            for (let token of this.tokens[player]) {
                if (token.pos === pos) return token;
            }
        }
        return null;
    }

    sendToYard(token) {
        token.pos = -1;
        token.isEligible = false;
        token.negativeCharges = 0;
    }

    nextTurn() {
        this.currentPlayer = (this.currentPlayer + 1) % 4;
        document.getElementById('negativeBtn').style.display = 'none';
        this.updateDisplay();
        this.checkWin();
        
        if (this.gameMode === 'bot' && this.currentPlayer !== 0) {
            setTimeout(() => this.botMove(), 1000);
        }
    }

    botMove() {
        // Simple bot logic - implement based on difficulty
        this.rollDice();
    }

    highlightValidMoves() {
        // Canvas highlighting logic
    }

    checkWin() {
        const playerTokens = this.tokens[this.currentPlayer];
        if (playerTokens.every(token => token.pos >= 52)) {
            document.getElementById('winText').textContent = `Player ${this.currentPlayer + 1} Wins! 🎉`;
            document.getElementById('winModal').style.display = 'flex';
        }
    }

    updateDisplay() {
        document.getElementById('turn').textContent = `Player ${this.currentPlayer + 1}'s Turn`;
        
        let status = '';
        this.getCurrentPlayerTokens().forEach((token, i) => {
            status += `Token ${i + 1}: Pos ${token.pos} ${token.isEligible ? `[Neg: ${token.negativeCharges}]` : ''}<br>`;
        });
        document.getElementById('tokens-status').innerHTML = status;
        
        document.getElementById('move-history').textContent = 
            this.moveHistory.slice(-3).join(' | ');
        
        const eligible = this.getCurrentPlayerTokens().some(t => t.pos >= 1 && t.isEligible);
        if (eligible && this.diceValue === 0) {
            document.getElementById('negativeBtn').style.display = 'block';
        }
    }

    drawBoard() {
        // Simplified board drawing - full implementation would be more detailed
        this.ctx.fillStyle = '#FFF8DC';
        this.ctx.fillRect(0, 0, 600, 600);
        
        // Draw paths, home areas, yard circles, tokens
        // This would be 200+ lines of path drawing logic
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(50, 50, 500, 500);
        
        // Draw tokens
        this.drawTokens();
    }

    drawTokens() {
        const colors = ['#FF4444', '#4169E1', '#32CD32', '#FFD700'];
        const tokenSize = 25;
        
        this.tokens.forEach((playerTokens, player) => {
            playerTokens.forEach((token, index) => {
                let x, y;
                if (token.pos === -1) {
                    // Yard positions
                    const yardPos = [[80,80], [140,80], [80,140], [140,140]];
                    [x, y] = yardPos[index % 4];
                } else {
                    // Main path approximation
                    x = 50 + (token.pos % 15) * 30;
                    y = 50 + Math.floor(token.pos / 15) * 30;
                }
                
                this.ctx.fillStyle = colors[player];
                this.ctx.beginPath();
                this.ctx.arc(x, y, tokenSize, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 3;
                this.ctx.stroke();
            });
        });
    }

    resetGame() {
        this.tokens = [
            [{pos: -1, negativeCharges: 0, isEligible: false}, {pos: -1, negativeCharges: 0, isEligible: false}, {pos: -1, negativeCharges: 0, isEligible: false}, {pos: -1, negativeCharges: 0, isEligible: false}],
            [{pos: -1, negativeCharges: 0, isEligible: false}, {pos: -1, negativeCharges: 0, isEligible: false}, {pos: -1, negativeCharges: 0, isEligible: false}, {pos: -1, negativeCharges: 0, isEligible: false}],
            [{pos: -1, negativeCharges: 0, isEligible: false}, {pos: -1, negativeCharges: 0, isEligible: false}, {pos: -1, negativeCharges: 0, isEligible: false}, {pos: -1, negativeCharges: 0, isEligible: false}],
            [{pos: -1, negativeCharges: 0, isEligible: false}, {pos: -1, negativeCharges: 0, isEligible: false}, {pos: -1, negativeCharges: 0, isEligible: false}, {pos: -1, negativeCharges: 0, isEligible: false}]
        ];
        this.currentPlayer = 0;
        this.diceValue = 0;
        this.selectedToken = null;
        this.moveHistory = [];
        document.getElementById('winModal').style.display = 'none';
        this.updateDisplay();
        this.drawBoard();
    }

    undo() {
        if (this.moveHistory.length > 0) {
            this.moveHistory.pop();
            this.resetGame(); // Simplified undo
        }
    }
}

// Initialize game
const game = new VabLudo();

// Modal handling
document.getElementById('newGameBtn').onclick = () => game.resetGame();
document.getElementById('winModal').onclick = (e) => {
    if (e.target.id === 'winModal') game.resetGame();
};

// Auto-draw loop
function gameLoop() {
    game.drawBoard();
    requestAnimationFrame(gameLoop);
}
gameLoop();
