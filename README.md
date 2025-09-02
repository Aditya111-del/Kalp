# Kalp - AI Chat Frontend

## 🌟 Overview
Kalp is a modern, responsive AI chat application built with React. It provides a seamless chat interface with real-time communication, user authentication, and a beautiful UI inspired by popular AI chatbots.

## 🚀 Features

### 🎨 User Interface
- **Modern Chat Interface** - Clean, intuitive design with smooth animations
- **Real-time Messaging** - WebSocket-powered instant communication
- **Responsive Design** - Works perfectly on desktop and mobile devices
- **Dark Theme** - Eye-friendly dark mode with gradient accents
- **Animated Components** - Smooth transitions and loading indicators

### 🔐 Authentication System
- **Secure Login/Register** - JWT-based authentication
- **Protected Routes** - Route protection for authenticated users
- **User Sessions** - Persistent login sessions
- **Landing Page** - Beautiful welcome page with animations

### 💬 Chat Features
- **AI-Powered Responses** - Integration with advanced AI models
- **Context Awareness** - Maintains conversation context
- **Message History** - Persistent chat history per user
- **Typing Indicators** - Real-time typing status
- **Message Formatting** - Support for markdown, code blocks, and tables

### 🛠️ Technical Features
- **WebSocket Integration** - Real-time bidirectional communication
- **Error Handling** - Comprehensive error management
- **Loading States** - Smooth loading indicators
- **Code Syntax Highlighting** - Beautiful code block rendering
- **Table Support** - Enhanced table display for data

## 🏗️ Architecture

### Frontend Stack
- **React 18** - Modern React with hooks and functional components
- **Socket.IO Client** - Real-time WebSocket communication
- **React Router** - Client-side routing and navigation
- **Tailwind CSS** - Utility-first CSS framework
- **React Markdown** - Markdown rendering with syntax highlighting
- **Prism.js** - Code syntax highlighting

### Components Structure
```
src/
├── components/
│   ├── AnimatedKalpLogo.jsx    # Animated logo component
│   ├── CodeBlock.jsx           # Syntax-highlighted code blocks
│   ├── KimiChat.jsx            # Main chat interface
│   ├── LandingPage.jsx         # Welcome/landing page
│   ├── LoginPage.jsx           # User login form
│   ├── RegisterPage.jsx        # User registration form
│   ├── PromptBox.jsx           # Chat input component
│   ├── ProtectedRoute.jsx      # Route protection wrapper
│   └── Table.jsx               # Enhanced table component
├── contexts/
│   └── AuthContext.js          # Authentication context
└── App.jsx                     # Main application component
```

## 🔗 Related Repositories

### Backend Repository
The backend API and WebSocket server are maintained in a separate repository:
**🔗 [Kalp Backend](https://github.com/Aditya111-del/Kalp_backend)**

- Node.js/Express server
- MongoDB database
- JWT authentication
- WebSocket chat server
- AI API integration
- User management system

## 🚀 Quick Start

### Prerequisites
- Node.js 16 or higher
- npm or yarn package manager
- Backend server running (see [Kalp Backend](https://github.com/Aditya111-del/Kalp_backend))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Aditya111-del/Kalp.git
   cd Kalp/Kalp\ Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_WEBSOCKET_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables
```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WEBSOCKET_URL=http://localhost:5000

# Google OAuth (Optional)
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id

# Firebase Configuration (Optional)
REACT_APP_FIREBASE_API_KEY=your_firebase_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
```

### Available Scripts
- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

## 🎯 Usage

### Basic Chat Flow
1. **Register/Login** - Create account or sign in
2. **Start Chatting** - Type messages in the chat interface  
3. **AI Responses** - Get intelligent responses from AI
4. **View History** - Access previous conversations
5. **Context Awareness** - AI maintains conversation context

### Features in Action
- **Real-time Communication** - Messages appear instantly
- **Typing Indicators** - See when AI is generating response
- **Message Formatting** - Markdown, code blocks, tables supported
- **Responsive Design** - Works on all device sizes
- **Error Handling** - Graceful error messages and recovery

## 🛡️ Security Features
- **JWT Authentication** - Secure token-based auth
- **Protected Routes** - Authenticated access only
- **Input Validation** - Client-side input sanitization
- **CORS Configured** - Cross-origin request security
- **Environment Variables** - Sensitive data protection

## 🎨 Styling & Design
- **Tailwind CSS** - Utility-first styling approach
- **Dark Theme** - Modern dark mode interface
- **Gradient Accents** - Beautiful color transitions
- **Smooth Animations** - CSS transitions and transforms
- **Responsive Grid** - Mobile-first design approach

## 📱 Browser Support
- Chrome (recommended)
- Firefox
- Safari  
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links
- **Backend Repository**: [Kalp_backend](https://github.com/Aditya111-del/Kalp_backend)
- **Live Demo**: [Coming Soon]
- **Documentation**: [This README]

## 📞 Support
For support, email support@kalp.ai or join our Discord community.

---

**Built with ❤️ by the Kalp Team**
