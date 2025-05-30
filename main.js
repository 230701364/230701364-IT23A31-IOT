const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

let win;
let serialPort;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    },
  });
  win.maximize();
  win.setMenuBarVisibility(false);
  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

ipcMain.on('start-serial', (event, portName) => {
  if (serialPort && serialPort.isOpen) {
    serialPort.removeAllListeners();
    serialPort.close(() => {
      console.log('Previous port closed');
      openSerial(portName, event);
    });
  } else {
    openSerial(portName, event);
  }
});

function openSerial(portName, event) {
  serialPort = new SerialPort({
    path: portName,
    baudRate: 9600,
  });

  const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

  serialPort.on('open', () => {
    console.log('Serial port opened:', portName);
  });

  parser.on('data', (line) => {
    event.sender.send('serial-data',line.trim());
  });  

  serialPort.on('error', (err) => {
    console.error('Serial port error:', err.message);
  });
}

ipcMain.handle('list-ports', async () => {
  const ports = await SerialPort.list();
  return ports.map(p => p.path);
});
