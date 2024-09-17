
import asyncio
import websockets
import json
import vgamepad as vg      

latest_data =None
button_data=None


gamepad = vg.VX360Gamepad()



async def handler(websocket, path):
    global latest_data,button_data
    print("connected: ", websocket)
    try:
        async for message in websocket:
            message = json.loads(message)
            if message['type'] == "pressIn" or message['type']=="pressOut":
                button_data=message
            else:
                latest_data = message
    finally:
        print("removed client: ", websocket)

async def handle_latest_data():
    global latest_data,button_data
    left_key=False
    right_key=False
    while True:              
        if latest_data:
            data = latest_data
            latest_data = None  
            print(data["value"])

            data_value = -((float(data['value'])))/10
            gamepad.left_joystick_float(x_value_float=data_value, y_value_float=0.0)
            gamepad.update()
          
        await asyncio.sleep(0.001)  

async def handle_button():
    global button_data
    while True:
        if button_data:
            data=button_data
            button_data=None
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
            elif data['type'] == "pressOut":
                btn_value = data['value'] 
                if btn_value == 'up--released':
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
            gamepad.update()
                
        await asyncio.sleep(0.001)

async def main():
    start_server = await websockets.serve(handler, "0.0.0.0", 8080)
    print("WebSocket server is running on ws://0.0.0.0:8080")
    await asyncio.gather(
        start_server.wait_closed(),
        handle_button(),
        handle_latest_data()
    )

if __name__ == "__main__":
    asyncio.run(main())