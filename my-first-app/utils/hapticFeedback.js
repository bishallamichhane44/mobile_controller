import { Vibration, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

class HapticFeedback {
  constructor() {
    this.isEnabled = true;
    this.lastVibrationTime = 0;
    this.vibrationCooldown = 50; // Minimum time between vibrations in ms
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    console.log(`Haptic feedback ${enabled ? 'enabled' : 'disabled'}`);
  }

  // Check if enough time has passed since last vibration
  canVibrate() {
    const now = Date.now();
    if (now - this.lastVibrationTime < this.vibrationCooldown) {
      return false;
    }
    this.lastVibrationTime = now;
    return true;
  }

  // Handle vibration from server with intensity (0.0 to 1.0)
  async handleServerVibration(leftMotor, rightMotor) {
    if (!this.isEnabled || !this.canVibrate()) {
      return;
    }

    // Calculate combined intensity
    const intensity = Math.max(leftMotor, rightMotor);
    
    if (intensity <= 0) {
      // Stop vibration
      this.stopVibration();
      return;
    }

    try {
      if (Platform.OS === 'ios') {
        // iOS: Use Expo Haptics with different intensities
        if (intensity < 0.3) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (intensity < 0.7) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
      } else {
        // Android: Use pattern-based vibration
        const duration = Math.floor(intensity * 500); // 0-500ms based on intensity
        
        if (leftMotor !== rightMotor) {
          // Different motors - create a pattern
          const leftDuration = Math.floor(leftMotor * 200);
          const rightDuration = Math.floor(rightMotor * 200);
          Vibration.vibrate([0, leftDuration, 50, rightDuration]);
        } else {
          // Same intensity - simple vibration
          Vibration.vibrate(duration);
        }
      }
      
      console.log(`Haptic feedback: L=${leftMotor.toFixed(2)}, R=${rightMotor.toFixed(2)}, intensity=${intensity.toFixed(2)}`);
    } catch (error) {
      console.error('Error playing haptic feedback:', error);
    }
  }

  // Button press feedback
  async buttonPress(buttonType = 'default') {
    if (!this.isEnabled) return;

    try {
      if (Platform.OS === 'ios') {
        switch (buttonType) {
          case 'primary': // A, B buttons
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'secondary': // X, Y buttons  
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'dpad': // D-pad buttons
            await Haptics.selectionAsync();
            break;
          case 'shoulder': // L1, R1
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          default:
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } else {
        // Android vibration patterns
        switch (buttonType) {
          case 'primary':
            Vibration.vibrate(50);
            break;
          case 'secondary':
            Vibration.vibrate(30);
            break;
          case 'dpad':
            Vibration.vibrate(20);
            break;
          case 'shoulder':
            Vibration.vibrate([0, 40, 20, 40]);
            break;
          default:
            Vibration.vibrate(25);
        }
      }
    } catch (error) {
      console.error('Error in button haptic feedback:', error);
    }
  }

  // Joystick feedback for reaching edges
  async joystickEdge() {
    if (!this.isEnabled) return;

    try {
      if (Platform.OS === 'ios') {
        await Haptics.selectionAsync();
      } else {
        Vibration.vibrate(15);
      }
    } catch (error) {
      console.error('Error in joystick haptic feedback:', error);
    }
  }

  // Stop all vibrations
  stopVibration() {
    try {
      Vibration.cancel();
    } catch (error) {
      console.error('Error stopping vibration:', error);
    }
  }

  // Connection feedback
  async connectionFeedback(connected) {
    if (!this.isEnabled) return;

    try {
      if (Platform.OS === 'ios') {
        if (connected) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } else {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
      } else {
        if (connected) {
          Vibration.vibrate([0, 100, 50, 100]); // Success pattern
        } else {
          Vibration.vibrate([0, 200, 100, 200]); // Error pattern
        }
      }
    } catch (error) {
      console.error('Error in connection haptic feedback:', error);
    }
  }
}

// Create a singleton instance
const hapticFeedback = new HapticFeedback();

export default hapticFeedback;
