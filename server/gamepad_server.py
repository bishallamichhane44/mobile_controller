
import asyncio
import websockets
import json
import vgamepad as vg

latest_data =None
button_data=None


gamepad = vg.VX360Gamepad()



async def handler(websocket, path):
    global latest_data, button_data
    print("connected: ", websocket)
    try:
        async for message in websocket:
            try:
                message = json.loads(message)
                if message['type'] == "pressIn" or message['type'] == "pressOut":
                    button_data = message
                elif message['type'] == "tilt":
                    latest_data = message
                else:
                    print(f"Unknown message type: {message.get('type', 'undefined')}")
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                continue
            except KeyError as e:
                print(f"Missing key in message: {e}")
                continue
            except Exception as e:
                print(f"Error processing message: {e}")
                continue
    except websockets.exceptions.ConnectionClosed:
        print("Client disconnected normally")
    except Exception as e:
        print(f"Handler error: {e}")
    finally:
        print("removed client: ", websocket)

async def handle_latest_data():
    global latest_data, button_data
    while True:              
        if latest_data:
            data = latest_data
            latest_data = None  
            
            try:
                # Validate the data structure
                if 'value' not in data:
                    print("Invalid tilt data: missing 'value' field")
                    continue
                    
                value = float(data['value'])
                print(f"Tilt value: {value}")

                data_value = -(value / 10)
                
                # Clamp the value to valid range [-1, 1]
                data_value = max(-1.0, min(1.0, data_value))
                
                gamepad.left_joystick_float(x_value_float=data_value, y_value_float=0.0)
                gamepad.update()
                
            except (ValueError, TypeError) as e:
                print(f"Error processing tilt data: {e}")
                continue
            except Exception as e:
                print(f"Unexpected error in handle_latest_data: {e}")
                continue
          
        await asyncio.sleep(0.001)

async def handle_button():
    global button_data
    while True:
        if button_data:
            data = button_data
            button_data = None
            
            try:
                if 'type' not in data or 'value' not in data:
                    print("Invalid button data: missing required fields")
                    continue
                    
                btn_type = data['type']
                btn_value = data['value']
                
                if btn_type == "pressIn": 
                    print(f"Button pressed: {btn_value}")
                    
                    button_map = {
                        'up': vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_UP,
                        'start': vg.XUSB_BUTTON.XUSB_GAMEPAD_START,
                        'back': vg.XUSB_BUTTON.XUSB_GAMEPAD_BACK,
                        'down': vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_DOWN,
                        'left': vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_LEFT,
                        'right': vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_RIGHT,
                        'a': vg.XUSB_BUTTON.XUSB_GAMEPAD_A,
                        'b': vg.XUSB_BUTTON.XUSB_GAMEPAD_B,
                        'r1': vg.XUSB_BUTTON.XUSB_GAMEPAD_RIGHT_SHOULDER,
                        'l1': vg.XUSB_BUTTON.XUSB_GAMEPAD_LEFT_SHOULDER,
                        'x': vg.XUSB_BUTTON.XUSB_GAMEPAD_X,
                        'y': vg.XUSB_BUTTON.XUSB_GAMEPAD_Y
                    }
                    
                    if btn_value in button_map:
                        gamepad.press_button(button=button_map[btn_value])
                        print(f"{btn_value} => pressed")
                    else:
                        print(f"Unknown button: {btn_value}")
                        
                elif btn_type == "pressOut":
                    print(f"Button released: {btn_value}")
                    
                    button_map = {
                        'up': vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_UP,
                        'start': vg.XUSB_BUTTON.XUSB_GAMEPAD_START,
                        'back': vg.XUSB_BUTTON.XUSB_GAMEPAD_BACK,
                        'down': vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_DOWN,
                        'left': vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_LEFT,
                        'right': vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_RIGHT,
                        'a': vg.XUSB_BUTTON.XUSB_GAMEPAD_A,
                        'b': vg.XUSB_BUTTON.XUSB_GAMEPAD_B,
                        'r1': vg.XUSB_BUTTON.XUSB_GAMEPAD_RIGHT_SHOULDER,
                        'l1': vg.XUSB_BUTTON.XUSB_GAMEPAD_LEFT_SHOULDER,
                        'x': vg.XUSB_BUTTON.XUSB_GAMEPAD_X,
                        'y': vg.XUSB_BUTTON.XUSB_GAMEPAD_Y
                    }
                    
                    if btn_value in button_map:
                        gamepad.release_button(button=button_map[btn_value])
                        print(f"{btn_value} => released")
                    else:
                        print(f"Unknown button: {btn_value}")
                
                gamepad.update()
                
            except Exception as e:
                print(f"Error processing button data: {e}")
                continue
                
        await asyncio.sleep(0.001)

async def main():
    try:
        start_server = await websockets.serve(
            handler, 
            "0.0.0.0", 
            8080,
            ping_interval=20,  # Send ping every 20 seconds
            ping_timeout=10,   # Wait 10 seconds for pong
            close_timeout=10   # Wait 10 seconds for close handshake
        )
        print("WebSocket server is running on ws://0.0.0.0:8080")
        await asyncio.gather(
            start_server.wait_closed(),
            handle_button(),
            handle_latest_data()
        )
    except Exception as e:
        print(f"Server error: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())