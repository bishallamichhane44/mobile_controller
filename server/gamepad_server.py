
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
                    print(f"{btn_value} => up--pressed")
                if btn_value == 'down':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_DOWN)
                    print(f"{btn_value} => down--pressed")
                if btn_value == 'left':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_LEFT)
                    print(f"{btn_value} => left--pressed")
                if btn_value == 'right':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_RIGHT)
                    print(f"{btn_value} => right--pressed")
                if btn_value == 'a':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_A)
                    print(f"{btn_value} => A--pressed")
                if btn_value == 'b':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_B)
                    print(f"{btn_value} => B--pressed")
                if btn_value == 'space':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_RIGHT_SHOULDER)
                    print(f"{btn_value} => R1--pressed")
                if btn_value == 'y':
                    gamepad.press_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_Y)
                    print(f"{btn_value} => Y--pressed")
            elif data['type'] == "pressOut":
                btn_value = data['value'] 
                if btn_value == 'up--released':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_UP)
                if btn_value == 'down--released':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_DOWN)
                if btn_value == 'left--released':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_LEFT)
                if btn_value == 'right--released':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_DPAD_RIGHT)
                if btn_value == 'a--released':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_A)
                if btn_value == 'b--released':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_B)
                if btn_value == 'space--released':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_RIGHT_SHOULDER)
                if btn_value == 'y--released':
                    gamepad.release_button(button=vg.XUSB_BUTTON.XUSB_GAMEPAD_Y)
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