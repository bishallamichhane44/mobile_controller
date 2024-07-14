
import asyncio
import websockets
import json
import pyautogui      

latest_data =None
button_data=None


pyautogui.FAILSAFE=False

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

            data_value = (float(data['value']))
            if data_value > 1 and not(left_key):
                pyautogui.keyUp("right")
                pyautogui.keyDown("left")
                left_key=True
                right_key=False
            elif data_value < -1 and not(right_key):
                pyautogui.keyUp("left")
                pyautogui.keyDown("right")
                right_key=True
                left_key=False
            elif (data_value<2 and data_value>-2) and (left_key or right_key):
                pyautogui.keyUp("left")
                pyautogui.keyUp("right")
                left_key=False
                right_key=False
        await asyncio.sleep(0.001)  

async def handle_button():
    global button_data
    while True:
        if button_data:
            data=button_data
            button_data=None
            if data['type'] == "pressIn": 
                print(data['value'])    
                pyautogui.keyDown(data['value'])
            elif data['type'] == "pressOut":
                pyautogui.keyUp(data['value'])
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