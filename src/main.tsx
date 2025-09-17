import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { setupDatabase } from './lib/database'

// Initialize database and render app
const initializeApp = async () => {
  // Setup database connection
  await setupDatabase();
  
  // Render the app
  createRoot(document.getElementById("root")!).render(<App />);
};

initializeApp();
