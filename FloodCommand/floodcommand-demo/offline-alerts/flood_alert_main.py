import time
import sqlite3
import datetime
import logging
from config import LOG_FILE, DATABASE_FILE, REPEAT_ALERT_INTERVAL

logging.basicConfig(filename=LOG_FILE, level=logging.INFO, 
                    format='%(asctime)s - %(levelname)s - %(message)s')

class AlertState:
    def __init__(self):
        self.is_flooding = False
        self.repeat_count = 0
        self.last_alert_time = None
        self._init_db()
        
    def _init_db(self):
        conn = sqlite3.connect(DATABASE_FILE)
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS alerts (
            alert_id TEXT, sender TEXT, message TEXT, location TEXT, 
            timestamp TEXT, status TEXT)''')
        conn.commit()
        conn.close()

    def start_alert(self):
        self.is_flooding = True
        self.last_alert_time = datetime.datetime.now()
        logging.warning("FLOOD ALERT INITIATED")
        print("🚨 FLOOD ALERT TRIGGERED 🚨")
        
    def increment_repeat(self):
        self.repeat_count += 1
        self.last_alert_time = datetime.datetime.now()

    def log_alert(self, alert_id, sender, message, location):
        conn = sqlite3.connect(DATABASE_FILE)
        c = conn.cursor()
        c.execute("INSERT INTO alerts VALUES (?, ?, ?, ?, ?, ?)",
                  (alert_id, sender, message, location, 
                   datetime.datetime.now().isoformat(), "active"))
        conn.commit()
        conn.close()

if __name__ == "__main__":
    print("Core Alert Engine Ready. See offline_emergency_server.py to start.")
