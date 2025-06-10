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

  // Handle vibration from server (game events like crashes, hits, death)
  async handleServerVibration(leftMotor, rightMotor) {
    if (!this.isEnabled) {
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
        // iOS: Use appropriate haptic based on intensity
        if (intensity < 0.4) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (intensity < 0.7) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
      } else {
        // Android: Duration based on intensity
        const duration = Math.floor(intensity * 400); // 0-400ms based on intensity
        Vibration.vibrate(duration);
      }
      
      console.log(`Game vibration: intensity=${intensity.toFixed(2)}`);
    } catch (error) {
      console.error('Error playing game vibration:', error);
    }
  }

  // Mild button press feedback only
  async buttonPress() {
    if (!this.isEnabled || !this.canVibrate()) return;

    try {
      if (Platform.OS === 'ios') {
        // Very light haptic for all buttons
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        // Short, mild vibration for Android
        Vibration.vibrate(30);
      }
    } catch (error) {
      console.error('Error in button haptic feedback:', error);
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
}

// Create a singleton instance
const hapticFeedback = new HapticFeedback();

export default hapticFeedback;
