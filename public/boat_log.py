import csv
import random
import time
from datetime import datetime

def simulate_electric_boat_forever(delay=1, filename="boat_log.csv"):
    """
    Simulates an electric boat’s motor and sensor data indefinitely.
    Writes the following metrics to a CSV file:
      - date: formatted as "DD Mon, YYYY"
      - time: formatted as "HH:MM AM/PM"
      - speedKPH: current speed in kilometers per hour
      - rpm: current motor RPM (proportional to speed)
      - batteryVoltage: voltage that drops gradually with battery percentage (330-340V)
      - batteryPercentage: current battery charge (100 down to 0)
      - windSpeed: current wind speed (with small random fluctuations)
      - temp: current temperature in Celsius
    """
    # Open the CSV file for writing.
    # The newline="" argument avoids extra blank lines on Windows.
    with open(filename, mode="w", newline="") as csvfile:
        fieldnames = [
            "date", "time", "speedKPH", "rpm",
            "batteryVoltage", "batteryPercentage", "windSpeed", "temp"
        ]
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        csvfile.flush()  # Flush header immediately

        # --- Simulation Parameters ---
        cruising_speed = 40.0       # KPH
        target_rpm = 3000           # Motor RPM at cruising speed

        # Voltage values for the motor operation (330-340V)
        base_voltage = 340.0        # Full battery voltage (nominal)
        min_voltage = 330.0         # Minimum voltage when nearly empty

        battery = 100.0             # Battery starts at 100%
        current_speed = 0.0         # Boat initially at rest
        current_rpm = 0.0

        # Temperature in Celsius.
        current_temp_c = 20.0
        target_temp_c = 30.0

        # Wind speed (units can be mph or KPH).
        current_wind_speed = 5.0

        while True:
            # 1. Update Speed and RPM
            if current_speed < cruising_speed and battery > 0:
                speed_inc = random.uniform(0.5, 2.0)
                current_speed = min(current_speed + speed_inc, cruising_speed)
            else:
                current_speed = cruising_speed

            current_rpm = (current_speed / cruising_speed) * target_rpm if battery > 0 else 0

            # 2. Update Temperature (Celsius)
            if current_temp_c < target_temp_c:
                current_temp_c += random.uniform(0.1, 0.5)
            else:
                current_temp_c += random.uniform(-0.2, 0.2)

            # 3. Update Wind Speed (with minor random fluctuations)
            current_wind_speed += random.uniform(-0.5, 0.5)
            current_wind_speed = max(0, current_wind_speed)

            # 4. Update Battery Voltage and Percentage
            voltage_range = base_voltage - min_voltage  # 10V difference.
            voltage_nominal = min_voltage + (battery / 100.0) * voltage_range
            current_voltage = voltage_nominal + random.uniform(-0.2, 0.2)

            # Adjust battery drain so that at full load the battery loses 0.1%
            # every 3 minutes. That is, at cruising speed, the drain is (0.1 / 180)
            # per second. If the boat is not at full speed, the drain is proportionally lower.
            base_drain_rate = 0.1 / 180  # Percentage drained per second at full load.
            battery_drain_factor = current_speed / cruising_speed if cruising_speed > 0 else 0.2
            battery = max(0, battery - base_drain_rate * battery_drain_factor)

            # 5. Temperature is logged in Celsius.
            logged_temp = round(current_temp_c, 1)

            # 6. Format Date and Time.
            now = datetime.now()
            date_str = now.strftime("%d %b, %Y")  # e.g., "05 Feb, 2025"
            time_str = now.strftime("%I:%M %p")    # e.g., "02:27 PM"

            # Prepare the dictionary with the sensor data.
            log_data = {
                "date": date_str,
                "time": time_str,
                "speedKPH": int(current_speed),
                "rpm": int(current_rpm),
                "batteryVoltage": round(current_voltage, 2),
                "batteryPercentage": int(battery),
                "windSpeed": int(current_wind_speed),
                "temp": logged_temp
            }

            # Write the record as a new row in the CSV file.
            writer.writerow(log_data)
            csvfile.flush()  # Force flush so data is written immediately

            # Optionally, print the log data to the console.
            print(log_data)

            # Delay before the next update.
            time.sleep(delay)

if __name__ == '__main__':
    simulate_electric_boat_forever(delay=1)
