# 🍒 Cherry Game

A fun board game where players roll dice and move around a 100-space board with special cherry jumps every 15th space!

## 🚀 Features

- **User Authentication**: Register and login system
- **Two Game Modes**: 
  - **PvP**: Play against another player
  - **PvC**: Play against the computer
- **Cherry Jumps**: Every 15th space gives a +10 bonus!
- **Real-time Gameplay**: Roll dice and watch players move
- **Game History**: Track all moves and game progress
- **Responsive UI**: Beautiful, modern interface

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Quick Start
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cherry-game
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start the game**
   ```bash
   npm start
   ```

   This will start both backend (port 4000) and frontend (port 3000) automatically.

### Manual Start
If you prefer to start services manually:

1. **Start Backend**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend** (in a new terminal)
   ```bash
   cd frontend
   npm start
   ```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## 🎮 How to Play

1. **Register/Login**: Create an account or login
2. **Choose Mode**: Select PvP or PvC
3. **Roll Dice**: Click the dice button to move
4. **Cherry Jumps**: Land on spaces 15, 30, 45, 60, 75, 90 for +10 bonus!
5. **Win**: First player to reach exactly space 100 wins!

## 🔧 Technical Details

### Backend
- **Framework**: Express.js
- **Storage**: In-memory (no database required)
- **Authentication**: JWT tokens
- **API**: RESTful endpoints

### Frontend
- **Framework**: React.js
- **Styling**: Inline CSS with modern design
- **State Management**: React hooks
- **HTTP Client**: Axios

### API Endpoints
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/game` - Create new game
- `POST /api/game/:id/roll` - Roll dice and move
- `GET /api/game/:id` - Get game state
- `GET /api/game/:id/history` - Get game moves
- `POST /api/game/:id/reset` - Reset game
- `GET /api/games` - Get all games
- `GET /health` - Health check

## 🐛 Troubleshooting

### Common Issues
1. **Port already in use**: Kill existing processes or change ports
2. **Frontend not loading**: Check if backend is running on port 4000
3. **Login issues**: Ensure backend is running and accessible

### Reset Everything
```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Restart the game
npm start
```

## 🎯 Game Rules

- Players start at position 1
- Roll 1-6 dice each turn
- Move forward by dice value
- **Cherry Bonus**: Every 15th space (15, 30, 45, 60, 75, 90) gives +10 movement
- Must land exactly on space 100 to win
- If you overshoot 100, stay in current position

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- Error handling and logging

## 📱 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🚀 Future Enhancements

- Persistent storage with database
- Multiplayer over network
- Game statistics and leaderboards
- Custom board themes
- Sound effects and animations

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy playing Cherry Game! 🍒🎲**
