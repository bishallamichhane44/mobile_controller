import asyncio
import websockets
import json
import pyautogui

async def handle_client(websocket, path):
    try:
        async for message in websocket:
            data = json.loads(message)
            if data['type'] == 'mousemove':
                pyautogui.moveRel(data['x'], data['y'])
            elif data['type'] == 'click':
                if data['button'] == 'left':
                    pyautogui.click()
                elif data['button'] == 'right':
                    pyautogui.rightClick()
    except websockets.exceptions.ConnectionClosed:
        pass

async def main():
    server = await websockets.serve(handle_client, "0.0.0.0", 8765)
    print("WebSocket server started")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())

# To run the server:
# pip install websockets pyautogui
# python server.py