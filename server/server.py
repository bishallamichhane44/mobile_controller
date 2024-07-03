import eventlet
import socketio
import pyautogui

pyautogui.PAUSE = 0

# Create a Socket.IO server
sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio)

# Dictionary to store connected clients and their button presses
connected_clients = {}

# Event handler for when a client connects to the server
@sio.event
def connect(sid, environ):
  print(f'Client connected: {sid}')
  connected_clients[sid] = {'w': False, 'a': False, 's': False, 'd': False,
                            'up': False, 'down': False, 'left': False, 'right': False,
                            'button1': False, 'button2': False}  # Add more buttons as needed

# Event handler for when a client disconnects from the server
@sio.event
def disconnect(sid):
  print(f'Client disconnected: {sid}')
  del connected_clients[sid]

# Event handler for gamepad button presses
@sio.event
def button_press(sid, data):
  button = data['button']
  state = data['state']  # True for press, False for release
  if sid in connected_clients:
    connected_clients[sid][button] = state

    # Handle button presses based on connected_clients dictionary
    if state:  # Only process on button press (state = True)
      if button == 'w':
        pyautogui.press('w')
      elif button == 'a':
        pyautogui.press('a')
      elif button == 's':
        pyautogui.press('s')
      elif button == 'd':
        pyautogui.press('d')
      # Add similar logic for other buttons, translating them to key presses
      # You can also handle directional buttons (up, down, left, right)
      # using pyautogui.press('<key>') or pyautogui.keyDown('<key>')/pyautogui.keyUp('<key>')

if __name__ == '__main__':
  # Start the server
  eventlet.wsgi.server(eventlet.listen(('', 3000)), app)



