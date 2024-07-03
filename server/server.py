import eventlet
import socketio
import pyautogui

pyautogui.PAUSE = 0

# Create a Socket.IO server
sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio)

# Dictionary to store connected clients and their tilt data
connected_clients = {}

# Event handler for when a client connects to the server
@sio.event
def connect(sid, environ):
    print(f'Client connected: {sid}')
    connected_clients[sid] = {'tilt_y': 0.0}  # Initialize tilt data for the client

# Event handler for when a client disconnects from the server
@sio.event
def disconnect(sid):
    print(f'Client disconnected: {sid}')
    if sid in connected_clients:
        del connected_clients[sid]

# Event handler for receiving tilt data
@sio.event
def tilt_data(sid, data):
    tilt_y = data.get('tilt_y', 0.0)
    connected_clients[sid]['tilt_y'] = tilt_y

    # Calculate steering based on tilt_y
    if tilt_y > 0.1:  # Adjust threshold as needed
        pyautogui.keyDown('right')
        pyautogui.keyUp('left')
        print(f"{tilt_y} => right")
    elif tilt_y < -0.1:  # Adjust threshold as needed
        pyautogui.keyDown('left')
        pyautogui.keyUp('right')
        print(f"{tilt_y} => left")
    else:
        pyautogui.keyUp('left')
        pyautogui.keyUp('right')
        print(f"{tilt_y} => idle")


@sio.event
def button_press(sid, data):
    button = data['button']
    state = data['state']  # True for press, False for release
    if sid in connected_clients:
        connected_clients[sid][button] = state
        # Handle button presses based on connected_clients dictionary
        if state:  # Button pressed
            if button == 'up':
                pyautogui.keyDown('up')
                print(f"{button} => up")
            elif button == 'down':
                pyautogui.keyDown('down')
                print(f"{button} => down")
          
        else:  # Button released
            if button == 'up':
                pyautogui.keyUp('up')
            elif button == 'down':
                pyautogui.keyUp('down')
if __name__ == '__main__':
    # Start the server
    eventlet.wsgi.server(eventlet.listen(('localhost', 3000)), app)  # Use localhost for local testing
