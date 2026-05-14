import os
import subprocess
import time
import sys

def create_emergency_file(message):
    filename = f"EMERGENCY_ALERT_{int(time.time())}.txt"
    with open(filename, "w") as f:
        f.write("⚠️ URGENT EMERGENCY ALERT ⚠️\n")
        f.write("="*30 + "\n")
        f.write(message + "\n")
        f.write("="*30 + "\n")
        f.write("Please send help immediately.")
    return filename

def send_via_airdrop(filepath):
    """
    Triggers the macOS share sheet for AirDrop. 
    Fully automatic AirDrop requires private APIs, so this opens the UI.
    """
    abs_path = os.path.abspath(filepath)
    print(f"Preparing to AirDrop: {abs_path}")
    try:
        # Open sharing menu
        subprocess.run(['open', '-a', 'Preview', abs_path])
        print("File opened. Please click the Share button -> AirDrop to send to nearby devices.")
    except Exception as e:
        print(f"Error launching AirDrop: {e}")

if __name__ == "__main__":
    msg = sys.argv[1] if len(sys.argv) > 1 else "FLOOD DETECTED - EVACUATE NOW"
    file_path = create_emergency_file(msg)
    send_via_airdrop(file_path)
