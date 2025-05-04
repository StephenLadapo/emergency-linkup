
export interface HistoryItem {
  id: number;
  type: string;
  timestamp: string;
  description: string;
  status?: string;
}

// Add events to user history
export const addToHistory = (type: string, description: string, status?: string): void => {
  try {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const historyItem = {
      id: Date.now(),
      type,
      timestamp: formattedDate,
      description,
      status
    };
    
    const userHistory = JSON.parse(localStorage.getItem('userHistory') || '[]');
    userHistory.unshift(historyItem);
    localStorage.setItem('userHistory', JSON.stringify(userHistory));
  } catch (error) {
    console.error('Error adding history item:', error);
  }
};
