import eventlet
import socketio
import vgamepad as vg

# Create a Socket.IO server
sio = socketio.Server(cors_allowed_origins='*')
app = socketio.WSGIApp(sio)

# Dictionary to store connected clients and their tilt data
connected_clients = {}

# Initialize the gamepad
gamepad = vg.VX360Gamepad()

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

    # Map tilt data directly to left thumbstick X-axis position
    gamepad.left_joystick_float(x_value_float=tilt_y, y_value_float=0.0)
    gamepad.update()

    if tilt_y > 0.1:  # Adjust threshold as needed
        print(f"{tilt_y} => right")
    elif tilt_y < -0.1:  # Adjust threshold as needed
        print(f"{tilt_y} => left")
    else:
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
                gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_UP)
                print(f"{button} => up")
            elif button == 'down':
                gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_DOWN)
                print(f"{button} => down")
            elif button == 'left':
                gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_LEFT)
                print(f"{button} => left")
            elif button == 'right':
                gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_RIGHT)
                print(f"{button} => right")
            elif button == 'a':
                gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_A)
                print(f"{button} => A")
            elif button == 'b':
                gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_B)
                print(f"{button} => B")
            elif button == 'x':
                gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_RIGHT_SHOULDER)
                print(f"{button} => R1")
            elif button == 'y':
                gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_Y)
                print(f"{button} => Y")
        else:  # Button released
            if button == 'up':
                gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_UP)
            elif button == 'down':
                gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_DOWN)
            elif button == 'left':
                gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_LEFT)
            elif button == 'right':
                gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_RIGHT)
            elif button == 'a':
                gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_A)
            elif button == 'b':
                gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_B)
            elif button == 'x':
                gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_RIGHT_SHOULDER)
            elif button == 'y':
                gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_Y)
        gamepad.update()

if __name__ == '__main__':
    # Start the server
    eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 3000)), app)  # Use localhost for local testing

