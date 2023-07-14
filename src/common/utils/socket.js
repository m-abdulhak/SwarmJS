/* eslint-disable no-console */
import io from 'socket.io-client';

const logLevels = {
  none: 0,
  error: 1,
  debug: 2,
  all: 3
};

// const pingIntervalDuration = 5000;

export default class Socket {
  constructor(url) {
    this.url = url;
    this.socket = io(url, { transports: ['websocket'] });
    this.logLevel = logLevels.all;

    // Add Event loggers for the socket.io connection events
    this.socket.on('connect', () => this.logEvent('Connected'));
    this.socket.on('disconnect', () => this.logEvent('Disconnected'));
    this.socket.on('error', (e) => this.logEvent('Error', e));
    this.socket.on('reconnect', () => this.logEvent('reconnect'));
    this.socket.on('reconnect_attempt', () => this.logEvent('reconnect_attempt'));
    this.socket.on('reconnecting', () => this.logEvent('reconnecting'));
    this.socket.on('reconnect_error', () => this.logEvent('reconnect_error'));
    this.socket.on('reconnect_failed', () => this.logEvent('reconnect_failed'));
    this.socket.on('connect_timeout', () => this.logEvent('connect_timeout'));
    this.socket.on('connect_error', () => this.logEvent('connect_error'));
    this.socket.on('connect_failed', () => this.logEvent('connect_failed'));
    this.socket.on('disconnecting', () => this.logEvent('disconnecting'));

    // add ping on interval
    // this.pingInterval = setInterval(() => {
    //   if (this.socket.connected) {
    //      this.ping();
    //   } else {
    //     console.log('socket is not connected, skipping ping');
    //   }
    // }, pingIntervalDuration);
  }

  logEvent(eventName, ...params) {
    // TODO: change logging behavior based on the logLevel
    if (this.logLevel > logLevels.none) {
      console.log(`Socket event (${this.url}): ${eventName}`);
      if (params.length > 0) {
        console.log(params);
      }
    }
  }

  connect() {
    this.socket.connect();
  }

  disconnect() {
    this.socket.disconnect();
  }

  on(eventName, callback) {
    this.socket.on(eventName, callback);
  }

  emit(eventName, data) {
    this.socket.emit(eventName, data);
  }

  ping() {
    const start = Date.now();

    this.socket.emit('ping', () => {
      const duration = Date.now() - start;
      console.log('Ping duration:', duration);
    });
  }
}
