import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: WebSocket;

  connect() {
    this.socket = new WebSocket('ws://localhost:5000');

    this.socket.onopen = () => {
      console.log('✅ Connected to WebSocket');
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📩 Message:', data);
    };

    this.socket.onclose = () => {
      console.log('❌ Disconnected');
    };
  }

  // 🔥 تسجيل المستخدم
  register(userId: string) {
    this.socket.send(
      JSON.stringify({
        type: 'REGISTER',
        userId,
      }),
    );
  }

  // 🔔 استقبال الإشعارات
  onNotification(callback: (data: any) => void) {
    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'NEW_COMMENT') {
        callback(data);
      }
    };
  }
}
