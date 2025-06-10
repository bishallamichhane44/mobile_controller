import asyncio
import websockets
import json
import vgamepad as vg     
import pyautogui
import threading
import time
from typing import Set
from vibration_monitor import VibrationMonitor

latest_data = None
button_data = None
right_joystick_data = None
connected_clients: Set[websockets.WebSocketServerProtocol] = set()

gamepad = vg.VX360Gamepad()
pyautogui.FAILSAFE = False

# Enhanced vibration monitoring
vibration_monitor = VibrationMonitor()
last_vibration_state = {"left": 0, "right": 0}

async def send_vibration_to_clients(left_motor: float, right_motor: float):
    """Send vibration data to all connected clients"""
    if not connected_clients:
        return
        
    vibration_message = json.dumps({
        "type": "vibration",
        "left": left_motor,
        "right": right_motor
    })
    
    # Send to all connected clients
    disconnected_clients = set()
    for client in connected_clients.copy():
        try:
            await client.send(vibration_message)
            print(f"Sent vibration: L={left_motor:.2f}, R={right_motor:.2f}")
        except websockets.exceptions.ConnectionClosed:
            disconnected_clients.add(client)
        except Exception as e:
            print(f"Error sending vibration to client: {e}")
            disconnected_clients.add(client)
    
    # Remove disconnected clients
    connected_clients.difference_update(disconnected_clients)

async def monitor_vibration():
    """Enhanced vibration monitoring using VibrationMonitor class"""
    vibration_monitor.set_vibration_callback(send_vibration_to_clients)
    await vibration_monitor.start_monitoring()

async def handler(websocket, path):
    global latest_data, button_data, right_joystick_data
    connected_clients.add(websocket)
    print(f"Client connected: {websocket.remote_address}")
    
    try:
        async for message in websocket:
            message = json.loads(message)
            if message['type'] == "pressIn" or message['type'] == "pressOut":
                button_data = message
                
                # Mild vibration on button press only
                if message['type'] == "pressIn" and message['value'] in ['a', 'b', 'x', 'y']:
                    asyncio.create_task(simulate_button_vibration(message['value']))
                    
            elif message['type'] == "rightJoystick":
                right_joystick_data = message
            else:
                latest_data = message
                
    except websockets.exceptions.ConnectionClosed:
        print(f"Client disconnected: {websocket.remote_address}")
    except Exception as e:
        print(f"Unexpected error: {e}")
    finally:
        connected_clients.discard(websocket)
        print(f"Removed client: {websocket.remote_address}")

async def simulate_button_vibration(button):
    """Very mild vibration feedback for button presses"""
    if button in ['a', 'b', 'x', 'y']:
        # Very light vibration for button feedback
        await send_vibration_to_clients(0.1, 0.1)
        await asyncio.sleep(0.05)
        await send_vibration_to_clients(0.0, 0.0)

async def handle_latest_data():
    global latest_data, button_data
    while True:              
        if latest_data:
            data = latest_data            
            latest_data = None  
            print(data["value"])
            data_value = max(-0.98, min(0.98, ((float(data['value'])))))
            gamepad.left_joystick_float(x_value_float=data_value, y_value_float=0.0)
            gamepad.update()
          
        await asyncio.sleep(0.001)

async def handle_button():
    global button_data
    while True:
        if button_data:
            data = button_data
            button_data = None
            print(f"Button data received: {data}")
            
            if data['type'] == "pressIn": 
                print(data['value'])  
                btn_value = data['value'] 
                if btn_value == 'up':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_UP)
                    print(f"{btn_value} => up-pressed")
                elif btn_value == 'down':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_DOWN)
                    print(f"{btn_value} => down-pressed")
                elif btn_value == 'left':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_LEFT)
                    print(f"{btn_value} => left-pressed")
                elif btn_value == 'right':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_RIGHT)
                    print(f"{btn_value} => right-pressed")
                elif btn_value == 'a':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_A)
                    print(f"{btn_value} => A-pressed")
                elif btn_value == 'b':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_B)
                    print(f"{btn_value} => B-pressed")
                elif btn_value == 'space':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_RIGHT_SHOULDER)
                    print(f"{btn_value} => R1-pressed")
                elif btn_value == 'r1':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_RIGHT_SHOULDER)
                    print(f"{btn_value} => R1-pressed")
                elif btn_value == 'l1':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_LEFT_SHOULDER)
                    print(f"{btn_value} => L1-pressed")
                elif btn_value == 'x':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_X)
                    print(f"{btn_value} => X-pressed")
                elif btn_value == 'y':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_Y)
                    print(f"{btn_value} => Y-pressed")
                elif btn_value == 'back':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_BACK)
                    print(f"{btn_value} => Back-pressed")
                elif btn_value == 'start':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_START)
                    print(f"{btn_value} => Start-pressed")
            elif data['type'] == "pressOut":
                btn_value = data['value'] 
                if btn_value == 'up':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_UP)
                    print(f"{btn_value} => up-released")
                elif btn_value == 'down':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_DOWN)
                    print(f"{btn_value} => down-released")
                elif btn_value == 'left':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_LEFT)
                    print(f"{btn_value} => left-released")
                elif btn_value == 'right':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_RIGHT)
                    print(f"{btn_value} => right-released")
                elif btn_value == 'a':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_A)
                    print(f"{btn_value} => a-released")
                elif btn_value == 'b':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_B)
                    print(f"{btn_value} => b-released")
                elif btn_value == 'space':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_RIGHT_SHOULDER)
                    print(f"{btn_value} => R1-released")
                elif btn_value == 'r1':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_RIGHT_SHOULDER)
                    print(f"{btn_value} => R1-released")
                elif btn_value == 'l1':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_LEFT_SHOULDER)
                    print(f"{btn_value} => L1-released")
                elif btn_value == 'x':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_X)
                    print(f"{btn_value} => X-released")
                elif btn_value == 'y':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_Y)
                    print(f"{btn_value} => Y-released")
                elif btn_value == 'back':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_BACK)
                    print(f"{btn_value} => Back-released")
                elif btn_value == 'start':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_START)
                    print(f"{btn_value} => Start-released")
            gamepad.update()                
        await asyncio.sleep(0.001)

async def handle_right_joystick():
    global right_joystick_data
    while True:
        if right_joystick_data:
            data = right_joystick_data
            right_joystick_data = None
            
            # Clamp values to ensure they're within valid range
            x_value = max(-1.0, min(1.0, float(data['x'])))
            y_value = max(-1.0, min(1.0, float(data['y'])))
            
            print(f"RIGHT JOYSTICK: x={x_value:+.3f}, y={y_value:+.3f} | {'Moving' if (x_value != 0 or y_value != 0) else 'Center'}")
            
            gamepad.right_joystick_float(x_value_float=x_value, y_value_float=y_value)
            gamepad.update()
            
        await asyncio.sleep(0.001)

async def main():
    # Setup vibration monitoring
    print("Initializing haptic feedback system...")
    
    start_server = await websockets.serve(handler, "0.0.0.0", 8080)
    print("WebSocket server is running on ws://0.0.0.0:8080")
    print("Haptic feedback enabled - vibration signals will be sent to mobile clients")
    print("Available features:")
    print("  - Mild button press haptic feedback")
    print("  - Game vibration relay to mobile device")
    
    try:
        await asyncio.gather(
            start_server.wait_closed(),
            handle_button(),
            handle_latest_data(),
            handle_right_joystick(),
            monitor_vibration()
        )
    except KeyboardInterrupt:
        print("\nShutting down server...")
    finally:
        # Cleanup
        vibration_monitor.stop_monitoring()
        print("Vibration monitoring stopped")
        print("Server shutdown complete")

if __name__ == "__main__":
    asyncio.run(main())