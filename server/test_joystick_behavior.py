#!/usr/bin/env python3
"""
Enhanced test script for the right joystick feature
This script tests the proper joystick behavior where user holds center and drags
"""

import asyncio
import websockets
import json
import time
import math

async def test_joystick_behavior():
    """Test the joystick behavior with realistic movement patterns"""
    uri = "ws://localhost:8080"
    
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected to server!")
            print("Testing joystick-like behavior (hold center and drag)...")
            
            # Simulate different joystick movements
            test_scenarios = [
                {
                    "name": "Center Position (Initial touch)",
                    "movements": [{"x": 0, "y": 0}]
                },
                {
                    "name": "Gradual Right Movement",
                    "movements": [
                        {"x": 0, "y": 0},
                        {"x": 0.2, "y": 0},
                        {"x": 0.5, "y": 0},
                        {"x": 0.8, "y": 0},
                        {"x": 1.0, "y": 0},
                        {"x": 0, "y": 0}  # Return to center
                    ]
                },
                {
                    "name": "Circular Movement",
                    "movements": []
                },
                {
                    "name": "Diagonal Movements",
                    "movements": [
                        {"x": 0, "y": 0},
                        {"x": 0.707, "y": 0.707},  # Up-right
                        {"x": -0.707, "y": 0.707}, # Up-left
                        {"x": -0.707, "y": -0.707}, # Down-left
                        {"x": 0.707, "y": -0.707},  # Down-right
                        {"x": 0, "y": 0}  # Return to center
                    ]
                }
            ]
            
            # Generate circular movement
            for angle in range(0, 360, 30):
                rad = math.radians(angle)
                x = math.cos(rad) * 0.8
                y = math.sin(rad) * 0.8
                test_scenarios[2]["movements"].append({"x": round(x, 3), "y": round(y, 3)})
            test_scenarios[2]["movements"].append({"x": 0, "y": 0})  # Return to center
            
            for scenario in test_scenarios:
                print(f"\n--- {scenario['name']} ---")
                
                for i, movement in enumerate(scenario["movements"]):
                    message = {
                        "type": "rightJoystick",
                        "x": movement["x"],
                        "y": movement["y"]
                    }
                    
                    print(f"Step {i+1}: x={movement['x']:6.3f}, y={movement['y']:6.3f}")
                    await websocket.send(json.dumps(message))
                    await asyncio.sleep(0.3)  # 300ms between movements
                
                print("Scenario completed. Waiting 2 seconds...")
                await asyncio.sleep(2)
            
            print("\n--- Testing Release Behavior ---")
            # Test the release behavior (return to center)
            await websocket.send(json.dumps({"type": "rightJoystick", "x": 0.5, "y": 0.5}))
            print("Joystick moved to (0.5, 0.5)")
            await asyncio.sleep(1)
            
            await websocket.send(json.dumps({"type": "rightJoystick", "x": 0, "y": 0}))
            print("Joystick released - returned to center (0, 0)")
            
            print("\nAll tests completed successfully!")
            
    except ConnectionRefusedError:
        print("Could not connect to server. Make sure the server is running on localhost:8080")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("Enhanced Right Joystick Test Script")
    print("Testing joystick behavior: hold center and drag")
    print("Make sure the gamepad server is running before starting this test")
    print("Starting test in 3 seconds...")
    time.sleep(3)
    
    asyncio.run(test_joystick_behavior())
