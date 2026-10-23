"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (!user?.tenantId) return;

    // Connect to NestJS websocket server
    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
      query: { tenantId: user.tenantId },
    });

    socketInstance.on('connect', () => {
      console.log('Connected to real-time notifications');
    });

    // Listen for global events
    socketInstance.on('new_lead', (data) => {
      toast.success(`🎉 New Lead: ${data.name || 'Someone'} just enquired about ${data.destination || 'a trip'}!`);
    });

    socketInstance.on('new_payment', (data) => {
      toast.success(`💰 Payment Received: ₹${data.amount} for booking ${data.bookingNumber}`);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}
