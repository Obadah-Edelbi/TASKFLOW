import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private socket!: WebSocket;
  private listeners: ((data: any) => void)[] = [];

  private isConnected = false;
  private lastNotification: any = null;

  constructor(private toastr: ToastrService) {}

  connect(userId: string) {
    if (this.isConnected) {
      console.log('⚠️ Already connected');
      return;
    }

    this.socket = new WebSocket(`ws://127.0.0.1:5000?userId=${userId}`);

    this.socket.onopen = () => {
      console.log('✅ WebSocket connected');
      this.isConnected = true;
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      console.log('📩 WS RECEIVED:', data);

      // 🔥 خزّن آخر إشعار
      this.lastNotification = data;

      // 🔥 broadcast لكل components
      this.listeners.forEach((cb) => cb(data));
    };

    this.socket.onclose = () => {
      console.log('❌ WebSocket disconnected');
      this.isConnected = false;
    };
  }

  onNotification(callback: (data: any) => void) {
    this.listeners.push(callback);

    // 🔥 إذا في إشعار سابق
    if (this.lastNotification) {
      callback(this.lastNotification);
    }
  }

  sendMessage(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(
        JSON.stringify({
          type: 'SEND_MESSAGE',
          ...data,
        }),
      );
    }
  }
}
