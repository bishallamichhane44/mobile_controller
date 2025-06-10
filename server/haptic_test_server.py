"""
Test script for haptic feedback system
Run this to test vibration patterns without connecting to a game
"""

import asyncio
import websockets
import json
import time

class HapticTestServer:
    def __init__(self):
        self.connected_clients = set()
        
    async def send_vibration_to_clients(self, left_motor: float, right_motor: float):
        """Send vibration data to all connected clients"""
        if not self.connected_clients:
            return
            
        vibration_message = json.dumps({
            "type": "vibration",
            "left": left_motor,
            "right": right_motor
        })
        
        # Send to all connected clients
        disconnected_clients = set()
        for client in self.connected_clients.copy():
            try:
                await client.send(vibration_message)
                print(f"Sent vibration: L={left_motor:.2f}, R={right_motor:.2f}")
            except websockets.exceptions.ConnectionClosed:
                disconnected_clients.add(client)
            except Exception as e:
                print(f"Error sending vibration to client: {e}")
                disconnected_clients.add(client)
        
        # Remove disconnected clients
        self.connected_clients.difference_update(disconnected_clients)

    async def handler(self, websocket, path):
        self.connected_clients.add(websocket)
        print(f"Client connected: {websocket.remote_address}")
        
        try:
            async for message in websocket:
                # Echo received messages for testing
                message_data = json.loads(message)
                print(f"Received: {message_data}")
                
        except websockets.exceptions.ConnectionClosed:
            print(f"Client disconnected: {websocket.remote_address}")
        except Exception as e:
            print(f"Unexpected error: {e}")
        finally:
            self.connected_clients.discard(websocket)
            print(f"Removed client: {websocket.remote_address}")

    async def test_vibration_patterns(self):
        """Test different vibration patterns"""
        print("Starting haptic feedback test patterns...")
        
        while True:
            if self.connected_clients:
                print("\n=== Testing Haptic Patterns ===")
                
                # Test 1: Light pulse
                print("1. Light pulse")
                await self.send_vibration_to_clients(0.3, 0.3)
                await asyncio.sleep(0.2)
                await self.send_vibration_to_clients(0.0, 0.0)
                await asyncio.sleep(1)
                
                # Test 2: Medium pulse
                print("2. Medium pulse")
                await self.send_vibration_to_clients(0.6, 0.6)
                await asyncio.sleep(0.3)
                await self.send_vibration_to_clients(0.0, 0.0)
                await asyncio.sleep(1)
                
                # Test 3: Strong pulse
                print("3. Strong pulse")
                await self.send_vibration_to_clients(1.0, 1.0)
                await asyncio.sleep(0.4)
                await self.send_vibration_to_clients(0.0, 0.0)
                await asyncio.sleep(1)
                
                # Test 4: Alternating motors
                print("4. Alternating motors")
                await self.send_vibration_to_clients(0.8, 0.0)
                await asyncio.sleep(0.3)
                await self.send_vibration_to_clients(0.0, 0.8)
                await asyncio.sleep(0.3)
                await self.send_vibration_to_clients(0.0, 0.0)
                await asyncio.sleep(1)
                
                # Test 5: Ramping up
                print("5. Ramping up intensity")
                for intensity in [0.2, 0.4, 0.6, 0.8, 1.0]:
                    await self.send_vibration_to_clients(intensity, intensity)
                    await asyncio.sleep(0.2)
                await self.send_vibration_to_clients(0.0, 0.0)
                await asyncio.sleep(1)
                
                # Test 6: Quick bursts (button simulation)
                print("6. Quick button press simulation")
                for _ in range(3):
                    await self.send_vibration_to_clients(0.4, 0.4)
                    await asyncio.sleep(0.1)
                    await self.send_vibration_to_clients(0.0, 0.0)
                    await asyncio.sleep(0.3)
                
                print("=== Test cycle complete ===\n")
                await asyncio.sleep(5)  # Wait 5 seconds before next cycle
            else:
                print("Waiting for mobile client to connect...")
                await asyncio.sleep(2)

    async def start_server(self):
        start_server = await websockets.serve(self.handler, "0.0.0.0", 8080)
        print("Haptic Feedback Test Server is running on ws://0.0.0.0:8080")
        print("Connect your mobile app to test haptic feedback patterns")
        print("Press Ctrl+C to stop")
        
        await asyncio.gather(
            start_server.wait_closed(),
            self.test_vibration_patterns()
        )

if __name__ == "__main__":
    test_server = HapticTestServer()
    try:
        asyncio.run(test_server.start_server())
    except KeyboardInterrupt:
        print("\nTest server stopped")
