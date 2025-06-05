# Telegram frontend (Next.js + React)

This is the frontend for the messenger application, built on Next.js 15 and React 19.

## Main Features
- User authentication and session management
- Real-time chat (WebSocket, Laravel Reverb)
- Attachments upload support
- Modern React-based UI
- Automatic WebSocket event handling

## Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd frontend
   ```

2. **Create `.env` file in the project root (see provided example file):**

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Run the app in development mode:**
   ```bash
   npm run dev
   ```

- App will be available at: `http://localhost:3000`

## Notes

- By default, the frontend connects to backend API and WebSocket using the URLs provided in `.env`.
- For production, configure environment variables accordingly.

