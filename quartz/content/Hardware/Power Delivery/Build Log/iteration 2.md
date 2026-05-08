# Power delivery - build log - It.2

## INA228 Power Monitoring Integration

This second iteration focuses on adding power monitoring using the INA228 sensor and completing the high-power circuitry with the USB SW3518 module and buck converter.

### Scope of This Iteration

- Add INA228 sensor to monitor voltage, current, and power consumption
- Integrate USB SW3518 module for USB Power Delivery input
- Install buck converter to step down 24V to 5V for ESP32
- Validate sensor readings against known values
- Display real-time power metrics on the screen

### Hardware Used

- **[[Hardware overview#INA228 – Power monitor|INA228 Current Sensor]]**
- **USB SW3518 Module** (for USB PD input - will be replaced with another module in future)
- **Buck Converter** (wired to provide 5V to ESP32 instead of USB input)
- **[[Hardware overview#Meanwell UHP-350-24 Power Supply]]**

### INA228 Wiring & Connection

The INA228 sensor was connected to the ESP32 via I2C for communication. The wiring was done on a breadboard for testing purposes.

#### I2C Connection Schematic

```text
                                           ┌─────────────────┐         
                                         ──┤                 ├──       
                                         ──┤                 ├──       
                                         ──┤                 ├──       
                                         ──┤                 ├──       
                                         ──┤                 ├──       
                                         ──┤                 ├──       
                                         ──┤                 ├──       
                                         ──┤                 ├──       
                                         ──┤     ESP-32      ├──       
                                         ──┤              g26├── ●────┐
                                         ──┤                 ├──      │
                                         ──┤   ┌─────────┐   ├──      │
                                         ──┤   │░░░░░░░░░│   ├──      │
                               ┌───────● ──┤g21│░░░░░░░░░│   ├──      │
┌────────────────┐             │         ──┤   │░░░░░░░░░│   ├──      │
│ ┌─────────┐ gnd├── ●─────┐   │         ──┤   │░░░░░░░░░│   ├──      │
│ │ INA228  │ scl├── ●───┐ │   │         ──┤   │░░░░░░░░░│   ├──      │
│ │         │ sda├── ●───┼─┼───┘         ──┤   └─────────┘   ├──      │
│ └─────────┘ vcc├── ●─┐ │ └───────────● ──┤gnd           3v3├── ●──┐ │
└────────────────┘     │ │                 └─────────────────┘      │ │
                       │ │                                          │ │
                       │ │                                          │ │
                       └─┼──────────────────────────────────────────┘ │
                         └────────────────────────────────────────────┘
```

#### Current & Voltage Measurement Wiring

The INA228 measures voltage across the shunt resistor in the high-current path. The V+ and V- pins connect directly to the power supply terminals.

```text
                                  ┌──────────────┐
                                  │┌────────────┐│
                                  ││            ││
                                  ││            ││
                                  ││            ││
                                  ││            ││
                                  ││            ││
                                  ││            ││
                                  ││            ││
                                  ││ UHP-350-24 ││
                                  ││            ││
                                  ││            ││
                                  ││            ││
                                  ││            ││
                                  ││            ││
                                  ││            ││
                                  ││            ││
                                  │└────────────┘│
                                  │              │
                                  │ v+        v- │
                                  └─┬──────────┬─┘
                                    │          │  
                                    ●          ●  
┌────────────────┐                  │          │  
│ ┌─────────┐  v-┼── ●──────────────┼──────────┤  
│ │ INA228  │  c-┼── ────────┐      │          │  
│ │         │  c+┼── ●─┬─────┼──────┘          │  
│ └─────────┘  v+┼── ●─┘     │                 │  
└────────────────┘           │                 │  
                             │                 │  
                             │                 │  
                             │                 │  
                             │                 │  
┌────────────────┐           │                 │  
│ ┌─────────┐  v-┼── ●───────┼─────────────────┘  
│ │ 24v --> │    │           │                    
│ │ USB PD  │    │           │                    
│ └─────────┘  v+┼── ●───────┘                    
└────────────────┘                                
```

### Shunt Resistor Configuration

- A **0.0002 ohm** shunt resistor is physically installed
- The ESPHome configuration uses **0.000236 ohm** to account for real-world tolerances
- This calibration provides more accurate current measurements

### INA228 Addressing

The INA228 uses the default I2C address **0x40**. When multiple INA228 sensors are added (one per node), the addresses will need to be adjusted using the A0 pin to avoid conflicts.

### ESPHome Configuration

The INA228 sensor was configured in ESPHome with the following settings:

```yaml
sensor:
  - platform: ina2xx_i2c
    model: INA228
    address: 0x40
    shunt_resistance: 0.000236 ohm
    max_current: 10.0A
    update_interval: 1s
    bus_voltage:
      name: "System Voltage"
      id: system_voltage
      filters:
        - calibrate_linear:
            - 0.0 -> 0.0
            - 23.72 -> 24.07
    current:
      name: "System Current"
      id: system_current
    power:
      name: "System Power"
      id: system_power
```

A linear calibration filter was added to the bus voltage reading to correct for small measurement errors. The values are now close enough to the actual measurements for practical use.

### Display Output

The display now shows real-time power metrics:

- **Volts: XX.XX V**
- **Amps:  XX.XX A**
- **Watts: XX.XX W**

This was configured in ESPHome with the following lambda function:

```yaml
lambda: |-
  it.fill(Color(0, 0, 0)); 
  it.print(120, 25, id(my_font), Color(0, 255, 0), TextAlign::TOP_CENTER, "POWER MONITOR TEST");
  it.printf(10, 80, id(my_font), Color(255, 255, 255), "Volts: %.2f V", id(system_voltage).state);
  it.printf(10, 130, id(my_font), Color(255, 255, 255), "Amps:  %.2f A", id(system_current).state);
  it.printf(10, 180, id(my_font), Color(255, 255, 255), "Watts: %.2f W", id(system_power).state);
```

The display updates every second with fresh measurements from the INA228 sensor.

### Validation Results

The INA228 sensor is correctly reading voltage, current, and power values. The display updates reliably with accurate enough measurements for monitoring purposes.
![[ESP32_INA228_breadboard.jpg]]


This iteration successfully integrates power monitoring into the system. The wiring is functional but messy
