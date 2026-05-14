class BaseSensor:
    def check(self):
        raise NotImplementedError

class ManualSensor(BaseSensor):
    def __init__(self, config):
        self.config = config
        
    def check(self):
        """Always return false for manual, it's triggered via API or Dashboard"""
        return False

class BluetoothSensor(BaseSensor):
    def __init__(self, config):
        self.config = config
        
    def check(self):
        """Simulate pinging a bluetooth water level sensor"""
        print("Checking local bluetooth sensors...")
        return False # Simulated

def get_sensor(sensor_type, config):
    if sensor_type == "manual":
        return ManualSensor(config)
    elif sensor_type == "bluetooth":
        return BluetoothSensor(config)
    else:
        return ManualSensor(config)
