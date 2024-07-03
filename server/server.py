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
        if state:  # Button pressed
            if button == 'w':
                pyautogui.keyDown('up')
            elif button == 'a':
                pyautogui.keyDown('left')
            elif button == 's':
                pyautogui.keyDown('down')
            elif button == 'd':
                pyautogui.keyDown('right')
          
        else:  # Button released
            if button == 'w':
                pyautogui.keyUp('up')
            elif button == 'a':
                pyautogui.keyUp('left')
            elif button == 's':
                pyautogui.keyUp('down')
            elif button == 'd':
                pyautogui.keyUp('right')
       

if __name__ == '__main__':
    # Start the server
    eventlet.wsgi.server(eventlet.listen(('', 3000)), app)
