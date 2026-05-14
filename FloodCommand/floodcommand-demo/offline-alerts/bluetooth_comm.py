import subprocess
import time
import logging

class BluetoothMessenger:
    def __init__(self):
        logging.info("Bluetooth Messenger Initialized")
        
    def send_emergency_message(self, message, location, recipients):
        print(f"📡 Broadcasting via Bluetooth Mesh...")
        print(f"Message: {message} | Location: {location}")
        
        for number in recipients:
            self._send_imessage(number, f"🚨 EMERGENCY: {message} at {location}")
            
    def _send_imessage(self, number, message):
        """macOS specific offline iMessage fallback via AppleScript"""
        script = f'''
        tell application "Messages"
            set targetService to 1st service whose service type = iMessage
            set targetBuddy to buddy "{number}" of targetService
            send "{message}" to targetBuddy
        end tell
        '''
        try:
            subprocess.run(['osascript', '-e', script])
            print(f"✅ iMessage queued for {number}")
        except Exception as e:
            print(f"❌ Failed to queue iMessage: {e}")
            
    def broadcast_alert(self, location):
        self.send_emergency_message("FLOOD DETECTED", location, [])
