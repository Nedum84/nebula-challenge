import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import websocketService from '../services/websocket.service';

const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'wss://gdjtdhxwkf.execute-api.eu-north-1.amazonaws.com/production/';

interface WebSocketContextType {}

const WebSocketContext = createContext<WebSocketContextType>({});

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      websocketService.connect(WEBSOCKET_URL);
    }

    return () => {
      websocketService.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <WebSocketContext.Provider value={{}}>
      {children}
    </WebSocketContext.Provider>
  );
};