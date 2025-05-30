const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('serialAPI', {
  startSerial: (port) => ipcRenderer.send('start-serial', port),
  onData: (callback) => ipcRenderer.on('serial-data', (_, data) => callback(data)),
  listPorts: () => ipcRenderer.invoke('list-ports')
});