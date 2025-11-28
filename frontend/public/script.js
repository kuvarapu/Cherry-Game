// Cherry Game - Vanilla JavaScript Implementation
class CherryGame {
  constructor() {
    this.currentUser = null;
    this.gameState = null;
    this.currentPage = 'login';
    // Use environment variable or default to localhost
    this.apiBaseUrl = window.CHERRY_GAME_API_URL || 'http://localhost:4000/api';
    this.gamePollingInterval = null;
    
    this.init();
  }

  init() {
    this.createCherryRainAnimation();
    this.setupEventListeners();
    
    // Check for Google OAuth callback
    this.handleOAuthCallback();
    
    // Check Google OAuth availability
    this.checkGoogleOAuthStatus();
    
    this.showPage('login');
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('cherryGameUser');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        console.log('Loaded user from localStorage:', this.currentUser);
        
        // Verify the user object has required properties
        if (this.currentUser && this.currentUser.username && this.currentUser.token) {
          this.showPage('menu');
        } else {
          console.error('Invalid user object in localStorage:', this.currentUser);
          localStorage.removeItem('cherryGameUser');
          this.currentUser = null;
        }
      } catch (e) {
        console.error('Error parsing saved user:', e);
        localStorage.removeItem('cherryGameUser');
        this.currentUser = null;
      }
    }
  }

  async checkGoogleOAuthStatus() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/google`, {
        method: 'HEAD',
        redirect: 'manual'
      });
      
      if (response.status === 503) {
        // Disable Google Sign-In button
        const googleBtn = document.getElementById('googleSignInBtn');
        if (googleBtn) {
          googleBtn.disabled = true;
          googleBtn.style.opacity = '0.5';
          googleBtn.style.cursor = 'not-allowed';
          googleBtn.title = 'Google OAuth not configured. Use username/password login.';
        }
      }
    } catch (error) {
      // Silently fail - button will remain enabled
      console.log('Could not check Google OAuth status');
    }
  }

  handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const username = urlParams.get('username');
    const error = urlParams.get('error');

    if (error) {
      this.showMessage('Google authentication failed. Please try again.', 'error');
      // Clean up URL
      window.history.replaceState({}, document.title, '/');
      return;
    }

    if (token && username) {
      this.currentUser = { username, token };
      localStorage.setItem('cherryGameUser', JSON.stringify(this.currentUser));
      this.showMessage('Logged in successfully with Google!', 'success');
      setTimeout(() => this.showPage('menu'), 1000);
      
      // Clean up URL
      window.history.replaceState({}, document.title, '/');
    }
  }

  createCherryRainAnimation() {
    const cherryRain = document.querySelector('.cherry-rain');
    
    // Create multiple cherry elements for better effect
    for (let i = 0; i < 8; i++) {
      const cherry = document.createElement('div');
      cherry.className = 'cherry-drop';
      cherry.textContent = '🍒';
      cherry.style.cssText = `
        position: absolute;
        font-size: ${Math.random() * 10 + 15}px;
        left: ${Math.random() * 100}%;
        animation: cherryFall ${Math.random() * 4 + 6}s linear infinite;
        animation-delay: ${Math.random() * 5}s;
        opacity: ${Math.random() * 0.5 + 0.3};
      `;
      cherryRain.appendChild(cherry);
    }
  }

  setupEventListeners() {
    // Login/Register buttons
    this.addClickListener('loginBtn', () => this.handleLogin());
    this.addClickListener('registerBtn', () => this.handleRegister());
    this.addClickListener('googleSignInBtn', () => this.handleGoogleSignIn());

    // Page navigation buttons
    this.addClickListener('pvcBtn', () => this.startGame('single', 'pvcBtn'));
    this.addClickListener('pvpBtn', () => this.startGame('multi', 'pvpBtn'));
    this.addClickListener('viewProfileBtn', () => this.viewProfile());
    this.addClickListener('backToMenuBtn', () => this.showPage('menu'));
    this.addClickListener('logoutBtn', () => this.logout());
    this.addClickListener('rollDiceBtn', () => this.rollDice());
    this.addClickListener('playAgainBtn', () => this.startGame(
      this.gameState?.mode === 'pvp' ? 'multi' : 'single', 'playAgainBtn'));
    this.addClickListener('quitGameBtn', () => this.returnToMenu());

    // Add input focus effects
    this.setupInputEffects();
  }

  handleGoogleSignIn() {
    // Check if Google OAuth is available
    fetch(`${this.apiBaseUrl}/auth/google`, {
      method: 'GET',
      redirect: 'manual'
    })
    .then(response => {
      if (response.status === 503) {
        return response.json().then(data => {
          this.showMessage('Google Sign-In is not configured yet. Please use username/password login or contact admin.', 'error');
          console.error('Google OAuth not configured:', data);
        });
      }
      // If successful, redirect to Google OAuth
      window.location.href = `${this.apiBaseUrl}/auth/google`;
    })
    .catch(error => {
      console.error('Google Sign-In error:', error);
      this.showMessage('Unable to connect to authentication server', 'error');
    });
  }

  addClickListener(id, handler) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('click', handler);
    }
  }

  setupInputEffects() {
    const inputs = document.querySelectorAll('.input-group input');
    inputs.forEach(input => {
      input.addEventListener('focus', (e) => {
        const highlight = e.target.nextElementSibling;
        if (highlight && highlight.classList.contains('input-highlight')) {
          highlight.style.width = '100%';
        }
      });

      input.addEventListener('blur', (e) => {
        const highlight = e.target.nextElementSibling;
        if (highlight && highlight.classList.contains('input-highlight')) {
          highlight.style.width = '0';
        }
      });
    });
  }

  showPage(pageName) {
    // Clear all messages when switching pages
    this.clearMessage('message');
    this.clearMessage('menuMessage');
    this.clearMessage('gameMessage');
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });

    // Show target page
    const targetPage = document.getElementById(`${pageName}Page`);
    if (targetPage) {
      targetPage.classList.add('active');
      this.currentPage = pageName;
    }

    // Update welcome text if showing menu
    if (pageName === 'menu' && this.currentUser) {
      const welcomeText = document.getElementById('welcomeText');
      if (welcomeText) {
        // Display just the username part (before @ if it's an email)
        const displayName = this.currentUser.username.includes('@') 
          ? this.currentUser.username.split('@')[0] 
          : this.currentUser.username;
        welcomeText.textContent = `🍒 Welcome, ${displayName}! 🍒`;
      }
    }
  }

  toggleLoginRegister() {
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');
    
    if (loginSection.style.display !== 'none') {
      loginSection.style.display = 'none';
      registerSection.style.display = 'block';
    } else {
      loginSection.style.display = 'block';
      registerSection.style.display = 'none';
    }
  }

  async handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      this.showMessage('Please fill in all fields', 'error');
      return;
    }

    this.setLoading('loginBtn', true);

    try {
      const response = await fetch(`${this.apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        this.currentUser = { username, token: data.token };
        localStorage.setItem('cherryGameUser', JSON.stringify(this.currentUser));
        this.showMessage('Login successful!', 'success');
        setTimeout(() => this.showPage('menu'), 1000);
      } else {
        this.showMessage(data.message || 'Login failed', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showMessage('Network error. Please try again.', 'error');
    } finally {
      this.setLoading('loginBtn', false);
    }
  }

  async handleRegister() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
      this.showMessage('Please fill in all fields', 'error');
      return;
    }

    if (password.length < 6) {
      this.showMessage('Password must be at least 6 characters long', 'error');
      return;
    }

    this.setLoading('registerBtn', true);

    try {
      const response = await fetch(`${this.apiBaseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        this.showMessage('Registration successful! Please login.', 'success');
        setTimeout(() => {
          document.getElementById('username').value = '';
          document.getElementById('password').value = '';
        }, 1500);
      } else {
        this.showMessage(data.message || 'Registration failed', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      this.showMessage('Network error. Please try again.', 'error');
    } finally {
      this.setLoading('registerBtn', false);
    }
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('cherryGameUser');
    this.returnToMenu();
    this.showPage('login');
    
    // Reset input fields
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
  }

  returnToMenu() {
    if (this.gamePollingInterval) {
      clearInterval(this.gamePollingInterval);
      this.gamePollingInterval = null;
    }

    this.gameState = null;
    if (this.currentUser) {
      this.showPage('menu');
    }
    this.clearMessage('menuMessage');
    this.clearMessage('gameMessage');
    this.hideElement('winnerSection');
    this.hideElement('diceContainer');
    this.hideElement('moveDisplay');
  }

  async startGame(mode, triggerId) {
    if (!this.currentUser) {
      this.showMessage('Please login first', 'error');
      return;
    }

    this.clearMessage('menuMessage');

    if (this.gamePollingInterval) {
      clearInterval(this.gamePollingInterval);
      this.gamePollingInterval = null;
    }
    const loadingButtonId = triggerId || (mode === 'single' ? 'pvcBtn' : 'pvpBtn');
    this.setLoading(loadingButtonId, true);

    try {
      const response = await fetch(`${this.apiBaseUrl}/game/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.currentUser.token}`,
        },
        body: JSON.stringify({
          mode,
          username: this.currentUser.username,
        }),
      });

      const data = await response.json();

      if (response.ok && data.game) {
        this.gameState = { ...data.game };
        this.gameState.mode = data.game.mode || (mode === 'single' ? 'pvc' : 'pvp');
        this.gameState.id = data.game.id || data.game._id;

        this.showPage('game');
        this.hideElement('winnerSection');
        this.hideElement('diceContainer');
        this.hideElement('moveDisplay');
        this.showElement('rollDiceBtn');
        this.clearMessage('gameMessage');
        this.updateGameDisplay();
        
        if (this.gameState.mode === 'pvc') {
          this.startGamePolling();
        }
      } else {
        this.showMessage(data.message || data.error || 'Failed to start game', 'error', 'menuMessage');
      }
    } catch (error) {
      console.error('Start game error:', error);
      this.showMessage('Network error. Please try again.', 'error', 'menuMessage');
    } finally {
      this.setLoading(loadingButtonId, false);
    }
  }

  startGamePolling() {
    if (this.gamePollingInterval) {
      clearInterval(this.gamePollingInterval);
    }

    this.gamePollingInterval = setInterval(() => {
      if (this.gameState && !this.gameState.finished) {
        this.checkGameState();
      }
    }, 2000);
  }

  async checkGameState() {
    if (!this.gameState || !this.currentUser) return;

    try {
      const response = await fetch(`${this.apiBaseUrl}/game/${this.gameState.id}`, {
        headers: {
          'Authorization': `Bearer ${this.currentUser.token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        this.gameState = { ...this.gameState, ...data.game };
        this.updateGameDisplay();
      }
    } catch (error) {
      console.error('Check game state error:', error);
    }
  }

  async rollDice() {
    if (!this.gameState || !this.currentUser || this.gameState.finished) return;

    this.setLoading('rollDiceBtn', true);
    this.hideElement('diceContainer');

    try {
      const response = await fetch(`${this.apiBaseUrl}/${this.gameState.id}/move`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.currentUser.token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        this.gameState = { ...this.gameState, ...data.game };
        
        // Show dice animation
        setTimeout(() => {
          this.showElement('diceContainer');
          this.updateGameDisplay();
        }, 500);
        
      } else {
        this.showMessage(data.message || data.error || 'Move failed', 'error', 'gameMessage');
      }
    } catch (error) {
      console.error('Roll dice error:', error);
      this.showMessage('Network error. Please try again.', 'error', 'gameMessage');
    } finally {
      this.setLoading('rollDiceBtn', false);
    }
  }

  updateGameDisplay() {
    if (!this.gameState) return;

    const positions = this.gameState.positions || [];
    const playerOnePosition = positions[0] ?? 1;
    const playerTwoPosition = positions[1] ?? 1;
    const moveCount = this.gameState.moves?.length || 0;
    const isSinglePlayer = this.gameState.mode === 'pvc';
    const gameOver = Boolean(this.gameState.finished);
    // In single player: only player 1 (turn 0) can roll
    // In two player: both players can roll when it's their turn
    const isPlayerTurn = isSinglePlayer ? (this.gameState.turn === 0) : true;

    // Update player labels based on game mode
    if (isSinglePlayer) {
      this.updateElement('player1Label', 'You');
      this.updateElement('player2Label', 'Computer');
      this.updateElement('player2Icon', '🤖');
    } else {
      this.updateElement('player1Label', 'Player 1');
      this.updateElement('player2Label', 'Player 2');
      this.updateElement('player2Icon', '👥');
    }

    // Update scoreboard values
    this.updateElement('player1Pos', playerOnePosition);
    this.updateElement('player2Pos', playerTwoPosition);
    this.updateElement('moveCount', moveCount);

    // Highlight active player
    const player1Stat = document.getElementById('player1Stat');
    const player2Stat = document.getElementById('player2Stat');
    if (player1Stat && player2Stat) {
      if (this.gameState.turn === 0) {
        player1Stat.classList.add('active-player');
        player2Stat.classList.remove('active-player');
      } else {
        player1Stat.classList.remove('active-player');
        player2Stat.classList.add('active-player');
      }
    }

    // Update turn indicator with contextual text
    const activePlayerName = this.gameState.players?.[this.gameState.turn] ||
      (this.gameState.turn === 0 ? this.currentUser?.username || 'Player 1' : (isSinglePlayer ? 'Computer' : 'Player 2'));
    let turnMessage = 'Your turn! Roll the dice.';
    if (gameOver) {
      turnMessage = 'Game finished!';
    } else if (isSinglePlayer && this.gameState.turn === 1) {
      turnMessage = `${activePlayerName}'s turn...`;
    } else if (!isSinglePlayer) {
      const currentTurnName = this.gameState.turn === 0 ? 'Player 1' : 'Player 2';
      turnMessage = `${currentTurnName}'s turn! Roll the dice.`;
    }
    this.updateElement('turnIndicator', turnMessage);

    // Update dice display (prefer lastRoll, fall back to most recent move)
    const recentMove = this.gameState.lastMove || (this.gameState.moves?.length > 0
      ? this.gameState.moves[this.gameState.moves.length - 1]
      : null);
    const lastRoll = this.gameState.lastRoll || recentMove?.dice || recentMove?.roll;
    if (lastRoll) {
      this.updateElement('diceNumber', lastRoll);
      this.showElement('diceContainer');
    } else {
      this.hideElement('diceContainer');
    }

    // Update last move panel
    if (recentMove) {
      const playerLabel = typeof recentMove.player === 'string'
        ? recentMove.player
        : `Player ${recentMove.player}`;
      const fromPosition = recentMove.fromPosition ?? recentMove.from ?? '-';
      const toPosition = recentMove.toPosition ?? recentMove.to ?? '-';
      const rollValue = recentMove.dice ?? recentMove.roll ?? lastRoll ?? '?';
      let bonusText = '';
      if (recentMove.cherryBonus) {
        if (typeof recentMove.cherryBonus === 'number') {
          bonusText = ` and collected a cherry bonus of ${recentMove.cherryBonus}`;
        } else {
          bonusText = ' and collected a cherry bonus';
        }
      }

      this.updateElement('moveTitle', `${playerLabel} move`);
      this.updateElement('moveText', `Rolled ${rollValue}, moved from ${fromPosition} to ${toPosition}${bonusText}.`);
      this.showElement('moveDisplay');
    } else {
      this.hideElement('moveDisplay');
    }

    // Update board tiles
    this.updateBoard();

    if (gameOver) {
      this.handleGameOver();
      return;
    }

    this.hideElement('winnerSection');

    // Show/hide roll button based on game mode and turn
    if (isSinglePlayer) {
      // Single player: only show button when it's player 1's turn
      if (this.gameState.turn === 0) {
        this.showElement('rollDiceBtn');
      } else {
        this.hideElement('rollDiceBtn');
      }
    } else {
      // Two player: always show button (current player clicks it)
      this.showElement('rollDiceBtn');
    }
  }

  updateBoard() {
    const board = document.getElementById('gameBoard');
    if (!board) return;

    board.innerHTML = '';

    const boardState = Array.isArray(this.gameState.board) && this.gameState.board.length === 100
      ? this.gameState.board
      : this.buildBoardFromState();

    boardState.forEach((cell, index) => {
      const cellElement = document.createElement('div');
      cellElement.className = 'board-cell';
      cellElement.textContent = index + 1;

      if (cell === 'cherry') {
        cellElement.classList.add('cherry');
        cellElement.innerHTML = '<div class="cell-content">🍒</div>';
      } else if (cell === 1) {
        cellElement.classList.add('player1');
        cellElement.innerHTML = '<div class="cell-content"><div class="player-character p1">👤</div><div class="cell-number">' + (index + 1) + '</div></div>';
      } else if (cell === 2) {
        cellElement.classList.add('player2');
        const icon = this.gameState.mode === 'pvc' ? '🤖' : '👥';
        cellElement.innerHTML = '<div class="cell-content"><div class="player-character p2">' + icon + '</div><div class="cell-number">' + (index + 1) + '</div></div>';
      } else if (cell === 'both') {
        cellElement.classList.add('both-players');
        const icon2 = this.gameState.mode === 'pvc' ? '🤖' : '👥';
        cellElement.innerHTML = '<div class="cell-content"><div class="player-character p1">👤</div><div class="player-character p2">' + icon2 + '</div><div class="cell-number">' + (index + 1) + '</div></div>';
      }

      board.appendChild(cellElement);
    });
  }

  buildBoardFromState() {
    const fallbackBoard = new Array(100).fill(null);
    const cherrySpaces = [14, 29, 44, 59, 74, 89];
    cherrySpaces.forEach(pos => fallbackBoard[pos] = 'cherry');

    const positions = this.gameState?.positions || [];
    const pos1 = positions[0];
    const pos2 = positions[1];
    
    // Place Player 1
    if (pos1 && pos1 > 0 && pos1 <= 100) {
      fallbackBoard[pos1 - 1] = 1;
    }
    
    // Place Player 2 (handle both players on same cell)
    if (pos2 && pos2 > 0 && pos2 <= 100) {
      const idx = pos2 - 1;
      if (fallbackBoard[idx] === 1) {
        fallbackBoard[idx] = 'both';
      } else {
        fallbackBoard[idx] = 2;
      }
    }

    return fallbackBoard;
  }

  handleGameOver() {
    if (this.gamePollingInterval) {
      clearInterval(this.gamePollingInterval);
      this.gamePollingInterval = null;
    }

    this.hideElement('rollDiceBtn');
    this.hideElement('diceContainer');
    
    // Backend stores winner as player name, map to display text
    const winner = this.gameState.winner;
    let winnerText = '🎉 Game Over!';
    let result = 'quit';
    
    if (winner) {
      if (winner === this.currentUser?.username) {
        winnerText = '🎉 Congratulations! You won!';
        result = 'win';
      } else if (winner === 'Computer') {
        winnerText = '🤖 Computer wins! Better luck next time!';
        result = 'loss';
      } else {
        winnerText = `🥇 ${winner} wins the game!`;
        result = 'loss';
      }
    }
    
    this.updateElement('winnerText', winnerText);
    this.showElement('winnerSection');
    
    // Update user stats
    this.updateUserStats(result);
  }

  async updateUserStats(result) {
    if (!this.gameState || !this.currentUser) return;

    const positions = this.gameState.positions || [1, 1];
    const playerIndex = this.gameState.players.indexOf(this.currentUser.username);
    const finalPosition = positions[playerIndex] || 0;
    const moves = this.gameState.moves?.filter(m => 
      m.player === this.currentUser.username || m.player === 0 || m.player === 1
    ).length || 0;
    const cherries = this.gameState.moves?.filter(m => 
      (m.player === this.currentUser.username || m.player === 0 || m.player === 1) && m.cherryBonus
    ).length || 0;

    const opponent = this.gameState.mode === 'pvc' ? 'Computer' : 
      this.gameState.players.find(p => p !== this.currentUser.username) || 'Player 2';

    try {
      const response = await fetch(`${this.apiBaseUrl}/profile/update-stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.currentUser.token}`
        },
        body: JSON.stringify({
          gameId: this.gameState._id || this.gameState.id,
          mode: this.gameState.mode,
          result,
          finalPosition,
          moves,
          cherries,
          opponent
        })
      });

      if (!response.ok) {
        console.error('Failed to update stats:', await response.text());
      }
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }

  async viewProfile() {
    console.log('ViewProfile called, currentUser:', this.currentUser);
    
    if (!this.currentUser) {
      this.showMessage('Please login first', 'error', 'menuMessage');
      return;
    }

    if (!this.currentUser.token) {
      console.error('No token found in currentUser:', this.currentUser);
      this.showMessage('Session expired. Please login again.', 'error', 'menuMessage');
      this.logout();
      return;
    }

    try {
      console.log('Fetching profile with token:', this.currentUser.token.substring(0, 20) + '...');
      console.log('API URL:', `${this.apiBaseUrl}/profile`);
      
      const response = await fetch(`${this.apiBaseUrl}/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.currentUser.token}`,
          'Content-Type': 'application/json'
        },
        mode: 'cors'
      });

      console.log('Profile response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Profile error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const profile = await response.json();
      console.log('Profile loaded successfully:', profile);
      
      this.displayProfile(profile);
      this.showPage('profile');
    } catch (error) {
      console.error('Profile fetch error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // Check if it's a network error
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        this.showMessage('Cannot connect to server. Please check if backend is running on port 4000.', 'error', 'menuMessage');
      } else {
        this.showMessage('Failed to load profile: ' + error.message, 'error', 'menuMessage');
      }
    }
  }

  displayProfile(profile) {
    // Update username
    this.updateElement('profileUsername', profile.username);
    
    // Update member since
    const memberSince = new Date(profile.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    this.updateElement('memberSince', memberSince);

    // Update stats
    const stats = profile.stats || {};
    this.updateElement('totalGames', stats.totalGames || 0);
    this.updateElement('gamesWon', stats.gamesWon || 0);
    
    const winRate = stats.totalGames > 0 
      ? ((stats.gamesWon / stats.totalGames) * 100).toFixed(1)
      : 0;
    this.updateElement('winRate', `${winRate}%`);
    
    this.updateElement('bestPosition', stats.bestPosition || 0);
    this.updateElement('cherriesCollected', stats.cherriesCollected || 0);
    this.updateElement('totalMoves', stats.totalMoves || 0);

    // Update game history
    const historyList = document.getElementById('gameHistoryList');
    if (historyList) {
      if (!profile.gameHistory || profile.gameHistory.length === 0) {
        historyList.innerHTML = '<p class="no-history">No games played yet. Start playing to build your history!</p>';
      } else {
        historyList.innerHTML = profile.gameHistory.map(game => {
          const date = new Date(game.playedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          const resultEmoji = game.result === 'win' ? '🏆' : 
                             game.result === 'loss' ? '😔' : '🚪';
          const resultText = game.result === 'win' ? 'Victory' :
                            game.result === 'loss' ? 'Defeat' : 'Quit';
          const modeText = game.mode === 'pvc' ? '🤖 vs Computer' : '👥 Two Player';

          return `
            <div class="history-item ${game.result}">
              <div class="history-info">
                <div class="history-result ${game.result}">
                  ${resultEmoji} ${resultText}
                </div>
                <div class="history-details">
                  ${modeText} • ${date}<br>
                  vs ${game.opponent}
                </div>
              </div>
              <div class="history-stats">
                <div class="history-stat">
                  <span class="history-stat-value">${game.finalPosition}</span>
                  <span class="history-stat-label">Position</span>
                </div>
                <div class="history-stat">
                  <span class="history-stat-value">${game.moves}</span>
                  <span class="history-stat-label">Moves</span>
                </div>
                <div class="history-stat">
                  <span class="history-stat-value">${game.cherries || 0}</span>
                  <span class="history-stat-label">🍒</span>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }

  // Utility functions
  clearMessage(containerId = 'message') {
    const messageEl = document.getElementById(containerId);
    if (messageEl) {
      messageEl.textContent = '';
      messageEl.className = 'message';
    }
  }

  showMessage(message, type = 'info', containerId = 'message') {
    const messageEl = document.getElementById(containerId);
    if (messageEl) {
      messageEl.textContent = message;
      const messageType = type || 'info';
      messageEl.className = `message ${messageType} show`;
      
      setTimeout(() => {
        messageEl.classList.remove('show');
      }, 4000);
    }
  }

  setLoading(buttonId, loading) {
    const button = document.getElementById(buttonId);
    if (button) {
      if (loading) {
        button.classList.add('loading');
        button.disabled = true;
      } else {
        button.classList.remove('loading');
        button.disabled = false;
      }
    }
  }

  updateElement(id, content) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = content;
    }
  }

  showElement(id) {
    const element = document.getElementById(id);
    if (element) {
      element.classList.remove('hidden');
    }
  }

  hideElement(id) {
    const element = document.getElementById(id);
    if (element) {
      element.classList.add('hidden');
    }
  }
}

// Magic Button Enhancement
class MagicButtonEnhancer {
  static enhance() {
    const buttons = document.querySelectorAll('.magic-button');
    
    buttons.forEach(button => {
      // Add ripple effect
      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
          position: absolute;
          width: ${size}px;
          height: ${size}px;
          left: ${x}px;
          top: ${y}px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          transform: scale(0);
          animation: ripple 0.6s linear;
          pointer-events: none;
        `;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
          ripple.remove();
        }, 600);
      });

      // Enhanced hover animations for button effects
      button.addEventListener('mouseenter', function() {
        const effects = this.querySelector('.button-effects');
        if (effects) {
          const shapes = effects.querySelectorAll('div');
          shapes.forEach((shape, index) => {
            setTimeout(() => {
              shape.style.opacity = '1';
            }, index * 100);
          });
        }
      });

      button.addEventListener('mouseleave', function() {
        const effects = this.querySelector('.button-effects');
        if (effects) {
          const shapes = effects.querySelectorAll('div');
          shapes.forEach((shape) => {
            shape.style.opacity = '0';
          });
        }
      });
    });
  }
}

// Cherry Rain Enhancement
class CherryRainEnhancer {
  static addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes ripple {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(4); opacity: 0; }
      }
      
      .cherry-drop {
        transition: all 0.3s ease;
      }
      
      .cherry-drop:hover {
        transform: scale(1.5) !important;
        filter: drop-shadow(0 0 10px rgba(233, 30, 99, 0.8));
      }
    `;
    document.head.appendChild(style);
  }
}

// API Error Handler
class APIErrorHandler {
  static handle(error, userMessage = 'Something went wrong') {
    console.error('API Error:', error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Unable to connect to server. Please check your connection.';
    }
    
    if (error.status === 401) {
      return 'Session expired. Please login again.';
    }
    
    if (error.status === 500) {
      return 'Server error. Please try again later.';
    }
    
    return userMessage;
  }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add additional styles
  CherryRainEnhancer.addStyles();
  
  // Initialize the game
  window.cherryGame = new CherryGame();
  
  // Enhance magic buttons
  MagicButtonEnhancer.enhance();
  
  // Add some interactive effects
  document.addEventListener('click', (e) => {
    if (e.target.textContent === '🍒') {
      e.target.style.transform = 'scale(1.5) rotate(360deg)';
      setTimeout(() => {
        e.target.style.transform = '';
      }, 500);
    }
  });
  
  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
      const form = e.target.closest('form');
      if (form) {
        form.dispatchEvent(new Event('submit'));
      }
    }
    
    if (e.key === 'Escape') {
      const activeModals = document.querySelectorAll('.modal.active');
      activeModals.forEach(modal => modal.classList.remove('active'));
    }
  });
  
  console.log('🍒 Cherry Game loaded successfully!');
});