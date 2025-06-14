class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = 'pvp';
        this.aiDifficulty = 'easy'; 
        this.gameActive = true;
        this.scores = {
            X: 0,
            O: 0,
            draw: 0
        };
        
        this.winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8], 
            [0, 4, 8], [2, 4, 6] 
        ];
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.initializeElements();
        this.attachEventListeners();
        this.updateDisplay();
        this.loadScores();
    }
    
    initializeElements() {
        this.cells = document.querySelectorAll('.cell');
        this.currentPlayerText = document.getElementById('currentPlayerText');
        this.gameStatus = document.getElementById('statusMessage');
        this.pvpBtn = document.getElementById('pvpBtn');
        this.pvcBtn = document.getElementById('pvcBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.clearScoreBtn = document.getElementById('clearScoreBtn');
        this.difficultySelector = document.getElementById('difficultySelector');
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        this.playerOLabel = document.getElementById('playerOLabel');
        this.scoreX = document.getElementById('scoreX');
        this.scoreO = document.getElementById('scoreO');
        this.scoreDraw = document.getElementById('scoreDraw');
        this.modal = document.getElementById('gameModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.modalMessage = document.getElementById('modalMessage');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.closeModalBtn = document.getElementById('closeModalBtn');
    }
    
    attachEventListeners() {
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
        
    
        this.pvpBtn.addEventListener('click', () => this.setGameMode('pvp'));
        this.pvcBtn.addEventListener('click', () => this.setGameMode('pvc'));
        
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.clearScoreBtn.addEventListener('click', () => this.clearScores());
        
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.setDifficulty(e.target.dataset.difficulty));
        });
        
        
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        this.closeModalBtn.addEventListener('click', () => this.closeModal());
        
        
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });
    }
    
    handleCellClick(e) {
        const index = parseInt(e.target.dataset.index);
        
        if (!this.gameActive || this.board[index] !== '') {
            return;
        }
        
        this.makeMove(index, this.currentPlayer);
        
        if (this.gameActive && this.gameMode === 'pvc' && this.currentPlayer === 'O') {
            setTimeout(() => {
                this.makeAIMove();
            }, 500);
        }
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        this.cells[index].textContent = player;
        this.cells[index].classList.add(player.toLowerCase());
        
        if (this.checkWinner()) {
            this.endGame(`Player ${player} Wins!`);
            this.scores[player]++;
            this.highlightWinningCells();
        } else if (this.checkDraw()) {
            this.endGame("It's a Draw!");
            this.scores.draw++;
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateDisplay();
        }
        
        this.saveScores();
    }
    
    makeAIMove() {
        if (!this.gameActive) return;
        
        let move;
        switch (this.aiDifficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = this.getMediumMove();
                break;
            case 'hard':
                move = this.getBestMove();
                break;
        }
        
        if (move !== -1) {
            this.makeMove(move, 'O');
        }
    }
    
    getRandomMove() {
        const availableMoves = this.getAvailableMoves();
        return availableMoves.length > 0 ? 
            availableMoves[Math.floor(Math.random() * availableMoves.length)] : -1;
    }
    
    getMediumMove() {
        
        if (Math.random() < 0.7) {
            return this.getBestMove();
        } else {
            return this.getRandomMove();
        }
    }
    
    getBestMove() {

        for (let combo of this.winningCombinations) {
            let oCount = 0, emptyIndex = -1;
            for (let index of combo) {
                if (this.board[index] === 'O') oCount++;
                else if (this.board[index] === '') emptyIndex = index;
            }
            if (oCount === 2 && emptyIndex !== -1) {
                return emptyIndex;
            }
        }
        
    
        for (let combo of this.winningCombinations) {
            let xCount = 0, emptyIndex = -1;
            for (let index of combo) {
                if (this.board[index] === 'X') xCount++;
                else if (this.board[index] === '') emptyIndex = index;
            }
            if (xCount === 2 && emptyIndex !== -1) {
                return emptyIndex;
            }
        }
        

        if (this.board[4] === '') return 4;
        
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(index => this.board[index] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        return this.getRandomMove();
    }
    
    getAvailableMoves() {
        return this.board.map((cell, index) => cell === '' ? index : null)
                       .filter(val => val !== null);
    }
    
    checkWinner() {
        return this.winningCombinations.some(combination => {
            return combination.every(index => {
                return this.board[index] === this.currentPlayer;
            });
        });
    }
    
    checkDraw() {
        return this.board.every(cell => cell !== '');
    }
    
    highlightWinningCells() {
        for (let combination of this.winningCombinations) {
            if (combination.every(index => this.board[index] === this.currentPlayer)) {
                combination.forEach(index => {
                    this.cells[index].classList.add('winning');
                });
                break;
            }
        }
    }
    
    endGame(message) {
        this.gameActive = false;
        this.gameStatus.textContent = message;
        this.currentPlayerText.textContent = 'Game Over';
        
        
        this.cells.forEach(cell => cell.classList.add('disabled'));
        
    
        setTimeout(() => {
            this.showModal(message);
        }, 1000);
        
        this.updateScoreDisplay();
    }
    
    showModal(message) {
        this.modalTitle.textContent = 'Game Over!';
        this.modalMessage.textContent = message;
        this.modal.style.display = 'block';
    }
    
    closeModal() {
        this.modal.style.display = 'none';
    }
    
    playAgain() {
        this.closeModal();
        this.newGame();
    }
    
    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        this.updateDisplay();
        this.closeModal();
    }
    
    newGame() {
        this.resetGame();
    }
    
    clearScores() {
        this.scores = { X: 0, O: 0, draw: 0 };
        this.updateScoreDisplay();
        this.saveScores();
    }
    
    setGameMode(mode) {
        this.gameMode = mode;
        this.pvpBtn.classList.toggle('active', mode === 'pvp');
        this.pvcBtn.classList.toggle('active', mode === 'pvc');
        
        if (mode === 'pvc') {
            this.difficultySelector.style.display = 'block';
            this.playerOLabel.textContent = 'AI';
        } else {
            this.difficultySelector.style.display = 'none';
            this.playerOLabel.textContent = 'Player O';
        }
        
        this.resetGame();
    }
    
    setDifficulty(difficulty) {
        this.aiDifficulty = difficulty;
        this.difficultyBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.difficulty === difficulty);
        });
    }
    
    updateDisplay() {
        if (this.gameActive) {
            const playerName = this.gameMode === 'pvc' && this.currentPlayer === 'O' ? 'AI' : `Player ${this.currentPlayer}`;
            this.currentPlayerText.textContent = `${playerName}'s Turn`;
            this.currentPlayerText.className = `current-player player-${this.currentPlayer.toLowerCase()}`;
            this.gameStatus.textContent = 'Game in progress...';
        }
    }
    
    updateScoreDisplay() {
        this.scoreX.textContent = this.scores.X;
        this.scoreO.textContent = this.scores.O;
        this.scoreDraw.textContent = this.scores.draw;
    }
    
    saveScores() {
        localStorage.setItem('ticTacToeScores', JSON.stringify(this.scores));
    }
    
    loadScores() {
        const savedScores = localStorage.getItem('ticTacToeScores');
        if (savedScores) {
            this.scores = JSON.parse(savedScores);
            this.updateScoreDisplay();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});