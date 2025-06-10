# Enhanced vibration monitoring for Windows using xinput
import ctypes
from ctypes import wintypes, Structure, POINTER, byref
import asyncio
import time

# Windows API constants and structures for XInput
XINPUT_GAMEPAD_LEFT_MOTOR = 0
XINPUT_GAMEPAD_RIGHT_MOTOR = 1

class XINPUT_VIBRATION(Structure):
    _fields_ = [
        ("wLeftMotorSpeed", wintypes.WORD),
        ("wRightMotorSpeed", wintypes.WORD)
    ]

class VibrationMonitor:
    def __init__(self):
        self.xinput = None
        self.last_vibration = {"left": 0.0, "right": 0.0}
        self.vibration_callback = None
        self.monitoring = False
        
        # Try to load XInput library
        try:
            self.xinput = ctypes.windll.xinput1_4
        except:
            try:
                self.xinput = ctypes.windll.xinput1_3
            except:
                try:
                    self.xinput = ctypes.windll.xinput9_1_0
                except:
                    print("Warning: XInput library not found. Vibration monitoring disabled.")
                    self.xinput = None

    def set_vibration_callback(self, callback):
        """Set callback function to call when vibration changes"""
        self.vibration_callback = callback

    async def start_monitoring(self, gamepad_index=0):
        """Start monitoring vibration for specified gamepad"""
        if not self.xinput:
            print("XInput not available - using simulation mode")
            await self._simulation_mode()
            return
            
        self.monitoring = True
        print(f"Starting vibration monitoring for gamepad {gamepad_index}")
        
        while self.monitoring:
            try:
                # Get current vibration state (this is a simplified approach)
                # In reality, XInput doesn't directly expose current vibration state
                # We would need to hook into the game's XInput calls or use a different approach
                current_vibration = await self._get_vibration_state(gamepad_index)
                
                # Check if vibration changed
                if (current_vibration["left"] != self.last_vibration["left"] or 
                    current_vibration["right"] != self.last_vibration["right"]):
                    
                    if self.vibration_callback:
                        await self.vibration_callback(
                            current_vibration["left"], 
                            current_vibration["right"]
                        )
                    
                    self.last_vibration = current_vibration.copy()
                    
            except Exception as e:
                print(f"Error in vibration monitoring: {e}")
                
            await asyncio.sleep(0.01)  # 100Hz monitoring rate

    async def _get_vibration_state(self, gamepad_index):
        """
        Get current vibration state. This is a placeholder since XInput 
        doesn't directly expose vibration state reading.
        In a real implementation, you would need to:
        1. Hook into XInput DLL calls
        2. Use a different API that exposes vibration state
        3. Monitor DirectInput/Raw Input
        """
        # Placeholder - return no vibration
        return {"left": 0.0, "right": 0.0}

    async def _simulation_mode(self):
        """Simulation mode for testing when XInput is not available"""
        print("Running in vibration simulation mode")
        self.monitoring = True
        
        while self.monitoring:
            # Simulate periodic vibration for testing
            await asyncio.sleep(15)  # Every 15 seconds
            
            if self.vibration_callback:
                # Simulate a short vibration burst
                await self.vibration_callback(0.6, 0.4)
                await asyncio.sleep(0.3)
                await self.vibration_callback(0.0, 0.0)

    def stop_monitoring(self):
        """Stop vibration monitoring"""
        self.monitoring = False
        print("Vibration monitoring stopped")

    async def test_vibration_sequence(self):
        """Test different vibration patterns"""
        if not self.vibration_callback:
            return
            
        print("Testing vibration patterns...")
        
        # Light vibration
        await self.vibration_callback(0.3, 0.3)
        await asyncio.sleep(0.2)
        await self.vibration_callback(0.0, 0.0)
        await asyncio.sleep(0.5)
        
        # Medium vibration
        await self.vibration_callback(0.6, 0.6)
        await asyncio.sleep(0.3)
        await self.vibration_callback(0.0, 0.0)
        await asyncio.sleep(0.5)
        
        # Strong vibration
        await self.vibration_callback(1.0, 1.0)
        await asyncio.sleep(0.4)
        await self.vibration_callback(0.0, 0.0)
        await asyncio.sleep(0.5)
        
        # Alternating motors
        await self.vibration_callback(0.8, 0.0)
        await asyncio.sleep(0.2)
        await self.vibration_callback(0.0, 0.8)
        await asyncio.sleep(0.2)
        await self.vibration_callback(0.0, 0.0)

# Alternative approach using Win32 API to monitor system events
class Win32VibrationMonitor:
    def __init__(self):
        self.vibration_callback = None
        self.monitoring = False

    def set_vibration_callback(self, callback):
        self.vibration_callback = callback

    async def start_monitoring(self):
        """Monitor system for vibration events using Win32 API"""
        print("Starting Win32 vibration monitoring...")
        self.monitoring = True
        
        while self.monitoring:
            # This would need to be implemented using Win32 API
            # to hook into DirectInput or XInput calls
            # For now, we'll use simulation
            await asyncio.sleep(0.01)

    def stop_monitoring(self):
        self.monitoring = False
