---
name: openclaw-factory
description: >
  OpenClaw AI agent skill for complete factory automation control.
  Generates configurations, control logic, and HMI layouts for all industrial
  I/O types: digital, analog, serial/Modbus, motor/VFD, and miscellaneous devices.
  Outputs Structured Text (IEC 61131-3), Ladder Logic, Python control scripts,
  and HMI/SCADA screen definitions.
---

# OpenClaw Factory Automation Skill

## Purpose

This skill enables the OpenClaw AI agent to design, configure, and generate
control system artifacts for a complete factory. It covers the full spectrum of
industrial I/O and produces ready-to-deploy outputs across multiple formats.

---

## When to Use This Skill

Use this skill when the user asks to:

- Configure or control factory equipment (pumps, conveyors, valves, motors, sensors)
- Generate PLC-style control logic (Structured Text, Ladder Logic)
- Create Python-based control/monitoring scripts (for edge controllers, Raspberry Pi, etc.)
- Design HMI/SCADA screen layouts and alarm configurations
- Set up Modbus/serial communication with field devices
- Map I/O points for a factory or production line
- Build motor/VFD drive control sequences
- Create alarm and interlock logic
- Generate a complete factory control package from a process description

---

## Skill Workflow

```
1. GATHER   → Collect process description, equipment list, I/O requirements
2. MAP      → Create I/O map (tag names, addresses, signal types, ranges)
3. GENERATE → Produce control logic, scripts, HMI layouts, comm configs
4. VALIDATE → Cross-check I/O references, alarm setpoints, interlocks
5. PACKAGE  → Deliver organized output files to the user
```

---

## I/O Type Reference

### 1. Digital Inputs (DI)
| Parameter     | Details                                    |
|---------------|--------------------------------------------|
| Signal        | 24VDC, dry contact, sourcing/sinking       |
| Examples      | Proximity switches, limit switches, push buttons, safety gates |
| Tag convention| `DI_<Area>_<Device>_<Function>`            |
| Logic states  | `TRUE/FALSE`, `ON/OFF`, `OPEN/CLOSED`      |

### 2. Digital Outputs (DO)
| Parameter     | Details                                    |
|---------------|--------------------------------------------|
| Signal        | 24VDC relay, solid-state, sourcing         |
| Examples      | Solenoid valves, indicator lights, horns, contactors |
| Tag convention| `DO_<Area>_<Device>_<Function>`            |
| Safety        | Always define fail-safe state (energize-to-run vs de-energize-to-run) |

### 3. Analog Inputs (AI)
| Parameter     | Details                                    |
|---------------|--------------------------------------------|
| Signal types  | 4–20 mA, 0–10 V, 0–5 V, RTD, thermocouple |
| Examples      | Pressure transmitters, temperature sensors, level sensors, flow meters |
| Tag convention| `AI_<Area>_<Device>_<Measurement>`         |
| Scaling       | Always define `raw_min`, `raw_max`, `eng_min`, `eng_max`, `eng_unit` |
| Filtering     | Optional first-order filter time constant  |

### 4. Analog Outputs (AO)
| Parameter     | Details                                    |
|---------------|--------------------------------------------|
| Signal types  | 4–20 mA, 0–10 V                           |
| Examples      | Control valves, variable speed drives (non-bus), damper actuators |
| Tag convention| `AO_<Area>_<Device>_<Function>`            |
| Scaling       | Same as AI — always include engineering range and units |

### 5. Serial / Modbus Communication
| Parameter     | Details                                    |
|---------------|--------------------------------------------|
| Protocols     | Modbus RTU, Modbus TCP, RS-232, RS-485     |
| Examples      | Power meters, variable frequency drives, analyzers, barcode scanners |
| Tag convention| `MB_<Area>_<Device>_<Register>`            |
| Config        | Slave ID, baud rate, parity, register map (holding/input/coil/discrete) |
| Data types    | INT16, UINT16, INT32, FLOAT32 (with byte/word order) |

### 6. Motor / VFD Control
| Parameter     | Details                                    |
|---------------|--------------------------------------------|
| Control modes | Direct Online (DOL), Star-Delta, VFD speed control, Servo positioning |
| Feedback      | Running, fault, speed, current, torque     |
| Tag convention| `MTR_<Area>_<Device>` / `VFD_<Area>_<Device>` |
| Interlocks    | Pre-start conditions, run permissives, trip logic |
| Sequences     | Start delay, ramp-up/down, jog, reverse    |

### 7. Miscellaneous I/O
| Type              | Examples                                           |
|-------------------|----------------------------------------------------|
| Pulse/counter     | Flow totalizers, encoder pulses, production counts  |
| PWM outputs       | Heater control, LED dimming                        |
| High-speed inputs | Encoder feedback, vibration sensors                |
| Network I/O       | EtherNet/IP, PROFINET, EtherCAT remote I/O modules |
| Safety I/O        | E-stops, light curtains, safety relays             |

---

## Output Formats

### A. Structured Text (IEC 61131-3)

Generate `.st` files following IEC 61131-3 conventions:

```
(* Example: Pump control function block *)
FUNCTION_BLOCK FB_PumpControl
VAR_INPUT
    CMD_Start       : BOOL;     (* Operator start command *)
    CMD_Stop        : BOOL;     (* Operator stop command *)
    Interlock_OK    : BOOL;     (* All permissives satisfied *)
    Feedback_Running: BOOL;     (* Motor contactor feedback *)
END_VAR
VAR_OUTPUT
    DO_RunCommand   : BOOL;     (* Output to contactor *)
    Alarm_FailStart : BOOL;     (* Motor failed to start *)
    Status          : INT;      (* 0=Stopped, 1=Starting, 2=Running, 3=Fault *)
END_VAR
VAR
    StartTimer      : TON;      (* Start confirmation timer *)
    tmrStartDelay   : TIME := T#5s;
END_VAR

(* --- Control Logic --- *)
IF CMD_Stop OR NOT Interlock_OK THEN
    DO_RunCommand := FALSE;
    Status := 0;
ELSIF CMD_Start AND Interlock_OK THEN
    DO_RunCommand := TRUE;
END_IF;

(* Start confirmation *)
StartTimer(IN := DO_RunCommand AND NOT Feedback_Running, PT := tmrStartDelay);
Alarm_FailStart := StartTimer.Q;
IF Alarm_FailStart THEN
    DO_RunCommand := FALSE;
    Status := 3;
ELSIF Feedback_Running THEN
    Status := 2;
ELSIF DO_RunCommand THEN
    Status := 1;
END_IF;

END_FUNCTION_BLOCK
```

**Rules for Structured Text generation:**
- Use `FUNCTION_BLOCK` for reusable equipment control (pumps, valves, motors)
- Use `PROGRAM` for area-level or sequence control
- Always declare `VAR_INPUT`, `VAR_OUTPUT`, `VAR` sections
- Include descriptive comments for every variable
- Use `TON`, `TOF`, `CTU`, `R_TRIG`, `F_TRIG` standard function blocks
- Follow tag naming conventions from the I/O reference above
- Include alarm and fault handling logic
- Define `Status` output as INT with documented state values

### B. Ladder Logic (ASCII representation)

Generate `.ll` files with ASCII ladder notation for users who prefer visual relay logic:

```
(* Rung 1: Start/Stop Seal-In Circuit *)
|                                                           |
|  CMD_Start    Interlock_OK               DO_RunCommand    |
|----] [----------] [----------+----------( )---------------|
|                              |                            |
|  DO_RunCommand               |                            |
|----] [----------+------------+                            |
|                                                           |
|  CMD_Stop                                                 |
|----]/[-------------------------------------------(R)------|
|                            DO_RunCommand                  |

(* Rung 2: Fail-to-start alarm *)
|                                                           |
|  DO_RunCommand   Feedback_Running   StartTmr              |
|----] [--------------]/[-----------[TON 5s]----------------|
|                                                           |
|  StartTmr.Q                        Alarm_FailStart       |
|----] [----------------------------------------( )---------|
```

**Rules for Ladder Logic generation:**
- One rung per logical function
- Include rung comments describing purpose
- Use standard IEC symbols: `] [` (NO), `]/[` (NC), `( )` (coil), `(R)` (reset)
- Show timer/counter blocks inline: `[TON 5s]`, `[CTU 10]`
- Keep rungs readable — max 3-4 contacts in series before branching
- Cross-reference coils to their controlling rung

### C. Python Control Scripts

Generate `.py` files for edge controllers, Raspberry Pi, or PC-based systems:

```python
#!/usr/bin/env python3
"""
OpenClaw Factory Control - Area: Mixing
Auto-generated by OpenClaw AI Agent
"""

import time
import logging
from dataclasses import dataclass, field
from enum import IntEnum
from typing import Optional

# --- Configuration ---
class PumpStatus(IntEnum):
    STOPPED = 0
    STARTING = 1
    RUNNING = 2
    FAULT = 3

@dataclass
class PumpConfig:
    tag: str
    start_delay: float = 5.0          # seconds
    fail_start_timeout: float = 5.0   # seconds
    interlock_tags: list = field(default_factory=list)

@dataclass
class AnalogScaling:
    raw_min: float = 4.0    # mA
    raw_max: float = 20.0   # mA
    eng_min: float = 0.0
    eng_max: float = 100.0
    eng_unit: str = "%"
    deadband: float = 0.5

    def scale(self, raw: float) -> float:
        return self.eng_min + (raw - self.raw_min) / (self.raw_max - self.raw_min) * (self.eng_max - self.eng_min)

    def clamp(self, value: float) -> float:
        return max(self.eng_min, min(self.eng_max, value))


class PumpController:
    """Reusable pump control block with interlock and fail-start detection."""

    def __init__(self, config: PumpConfig, io_driver):
        self.config = config
        self.io = io_driver
        self.status = PumpStatus.STOPPED
        self._start_time: Optional[float] = None
        self.logger = logging.getLogger(config.tag)

    def execute(self, cmd_start: bool, cmd_stop: bool) -> None:
        interlocks_ok = all(
            self.io.read_digital(tag) for tag in self.config.interlock_tags
        )

        if cmd_stop or not interlocks_ok:
            self._stop()
            return

        if cmd_start and interlocks_ok and self.status == PumpStatus.STOPPED:
            self._start()

        if self.status == PumpStatus.STARTING:
            self._check_start_confirmation()

    def _start(self):
        self.io.write_digital(f"DO_{self.config.tag}_RUN", True)
        self._start_time = time.monotonic()
        self.status = PumpStatus.STARTING
        self.logger.info("Start command issued")

    def _stop(self):
        self.io.write_digital(f"DO_{self.config.tag}_RUN", False)
        self._start_time = None
        self.status = PumpStatus.STOPPED

    def _check_start_confirmation(self):
        if self.io.read_digital(f"DI_{self.config.tag}_RUNNING"):
            self.status = PumpStatus.RUNNING
            self.logger.info("Running confirmed")
        elif time.monotonic() - self._start_time > self.config.fail_start_timeout:
            self._stop()
            self.status = PumpStatus.FAULT
            self.logger.error("Fail to start - timeout")
```

**Rules for Python script generation:**
- Use dataclasses for configuration structures
- Use IntEnum for status/state values
- Include type hints throughout
- Provide an abstract `io_driver` interface (so scripts work with any hardware backend)
- Include logging, not print statements
- Use `time.monotonic()` for timing, never `time.time()`
- Generate a `requirements.txt` alongside
- Include docstrings for every class and public method
- Modbus helpers should use `pymodbus` library patterns
- All scripts must be importable as modules (guard with `if __name__ == "__main__":`)

### D. HMI / SCADA Screen Definitions

Generate `.hmi.json` files describing screen layouts, widgets, and alarm configurations:

```json
{
  "screen": {
    "id": "SCR_MIXING_01",
    "title": "Mixing Area Overview",
    "size": {"width": 1920, "height": 1080},
    "background": "#1a1a2e",
    "refresh_rate_ms": 500
  },
  "widgets": [
    {
      "type": "pump_symbol",
      "id": "WDG_PUMP_MIX01",
      "position": {"x": 200, "y": 300},
      "size": {"width": 80, "height": 80},
      "bindings": {
        "status": "MTR_MIX_PUMP01.Status",
        "command_start": "MTR_MIX_PUMP01.CMD_Start",
        "command_stop": "MTR_MIX_PUMP01.CMD_Stop"
      },
      "colors": {
        "stopped": "#808080",
        "running": "#00cc00",
        "fault": "#ff0000",
        "starting": "#ffcc00"
      }
    },
    {
      "type": "analog_bar",
      "id": "WDG_LEVEL_TK01",
      "position": {"x": 400, "y": 200},
      "size": {"width": 60, "height": 200},
      "bindings": {
        "value": "AI_MIX_TK01_LEVEL",
        "setpoint": "SP_MIX_TK01_LEVEL"
      },
      "range": {"min": 0, "max": 100},
      "unit": "%",
      "alarm_bands": {
        "HH": {"value": 95, "color": "#ff0000"},
        "H":  {"value": 85, "color": "#ffcc00"},
        "L":  {"value": 15, "color": "#ffcc00"},
        "LL": {"value": 5,  "color": "#ff0000"}
      }
    },
    {
      "type": "numeric_display",
      "id": "WDG_TEMP_MIX01",
      "position": {"x": 600, "y": 350},
      "bindings": {
        "value": "AI_MIX_TEMP01"
      },
      "format": "##0.0",
      "unit": "°C",
      "font_size": 18
    }
  ],
  "navigation": [
    {"label": "Overview", "target": "SCR_OVERVIEW"},
    {"label": "Alarms", "target": "SCR_ALARMS"},
    {"label": "Trends", "target": "SCR_TRENDS"}
  ]
}
```

**Rules for HMI generation:**
- Define every widget with `type`, `id`, `position`, `size`, `bindings`
- Bind to the same tag names used in the control logic
- Always include alarm bands for analog displays (HH, H, L, LL)
- Use a dark background theme by default (industrial standard)
- Include navigation links between screens
- Group widgets by physical process area
- Include trend screen definitions for key process variables

---

## I/O Map Format

When generating an I/O map, produce a `io_map.csv` with these columns:

```
Tag,Type,Signal,Address,Description,Range_Min,Range_Max,Eng_Unit,Fail_Safe,Modbus_Slave,Modbus_Register,Area,Equipment
DI_MIX_PUMP01_RUN,DI,24VDC,I:0/0,Pump 01 Running Feedback,,,,,,,Mixing,Pump-01
DO_MIX_PUMP01_CMD,DO,24VDC Relay,O:0/0,Pump 01 Run Command,,,,De-Energize,,,Mixing,Pump-01
AI_MIX_TK01_LEVEL,AI,4-20mA,AI:0,Tank 01 Level Transmitter,0,100,%,,,,Mixing,Tank-01
AO_MIX_CV01_POS,AO,4-20mA,AO:0,Control Valve 01 Position,0,100,%,,,,Mixing,CV-01
MB_PWR_MTR01_KW,MB,Modbus TCP,40001,Power Meter 01 - kW,0,500,kW,,1,40001,Power,Meter-01
VFD_MIX_AGT01_SPD,VFD,Modbus RTU,40101,Agitator 01 Speed Ref,0,60,Hz,,2,40101,Mixing,Agitator-01
```

---

## Alarm Configuration

Generate `alarms.json` defining all process alarms:

```json
{
  "alarms": [
    {
      "tag": "ALM_MIX_TK01_LEVEL_HH",
      "source": "AI_MIX_TK01_LEVEL",
      "type": "HIGH_HIGH",
      "setpoint": 95.0,
      "deadband": 2.0,
      "delay_sec": 3,
      "priority": 1,
      "message": "Tank 01 Level VERY HIGH",
      "action": "TRIP — Close inlet valve, stop feed pump",
      "area": "Mixing",
      "acknowledgeable": true,
      "auto_reset": false
    }
  ]
}
```

**Alarm priority levels:** 1 = Critical/Trip, 2 = High, 3 = Medium, 4 = Low/Advisory

---

## Generation Rules

1. **Tag consistency** — Every tag referenced in control logic, HMI, and alarms must exist in the I/O map. Cross-validate before delivering.
2. **Fail-safe defaults** — Every digital output must define a fail-safe state. Every analog output must define a fail-safe position.
3. **Interlock documentation** — Every motor/actuator must list its permissive conditions as comments in the control logic.
4. **Scaling always defined** — Never leave an analog signal without `raw_min/max` and `eng_min/max` scaling.
5. **Modbus register maps** — Always specify data type, byte order, and function code for Modbus devices.
6. **Area organization** — All outputs are organized by factory area (e.g., Mixing, Packaging, Utilities).
7. **Equipment naming** — Follow ISA-5.1 style instrument identification where practical.

---

## Step-by-Step Procedure

When the user describes their factory or process:

### Step 1: Parse the Process
- Identify all equipment (pumps, valves, tanks, conveyors, motors, sensors)
- Identify process areas and group equipment by area
- Identify material flows, sequences, and batch operations

### Step 2: Build the I/O Map
- Assign tag names following conventions above
- Determine signal type for each point
- Assign addresses (or leave as TBD for user to fill)
- Define scaling for all analog signals
- Define Modbus register maps for serial devices
- Output `io_map.csv`

### Step 3: Generate Control Logic
For each piece of equipment, generate the appropriate format(s):
- **Structured Text** (`.st`) — Function blocks for equipment, programs for sequences
- **Ladder Logic** (`.ll`) — ASCII ladder for relay-style logic
- **Python** (`.py`) — Classes and scripts for edge/PC control

Include:
- Start/stop logic with seal-in
- Interlock/permissive checks
- Alarm generation
- PID control where applicable (temperature, level, pressure loops)
- Sequence control for batch or multi-step operations

### Step 4: Generate HMI/SCADA Screens
- Overview screen for each area
- Faceplate popups for each major equipment
- Alarm summary screen
- Trend screen for key process variables
- Output `.hmi.json` files

### Step 5: Generate Alarm Configuration
- Create alarm entries for all analog signals (HH, H, L, LL as appropriate)
- Create alarms for equipment faults
- Assign priorities based on process impact
- Output `alarms.json`

### Step 6: Cross-Validate
- Every tag in control logic exists in io_map
- Every tag in HMI bindings exists in control logic or io_map
- Every alarm source tag exists in io_map
- Every motor has at least one interlock defined
- Every analog signal has scaling defined

### Step 7: Package and Deliver
Organize all outputs into a clean directory:
```
factory_output/
├── io_map.csv
├── alarms.json
├── control/
│   ├── structured_text/
│   │   ├── FB_PumpControl.st
│   │   ├── FB_ValveControl.st
│   │   ├── PRG_MixingSequence.st
│   │   └── ...
│   ├── ladder_logic/
│   │   ├── MIX_PumpControl.ll
│   │   └── ...
│   └── python/
│       ├── pump_controller.py
│       ├── modbus_client.py
│       ├── main_control.py
│       └── requirements.txt
├── hmi/
│   ├── SCR_OVERVIEW.hmi.json
│   ├── SCR_MIXING.hmi.json
│   ├── SCR_ALARMS.hmi.json
│   └── SCR_TRENDS.hmi.json
└── docs/
    └── io_crossref.md
```

Copy all outputs to `/mnt/user-data/outputs/` for delivery.

---

## Example Prompts

- "I have a mixing tank with an agitator, inlet valve, outlet pump, level sensor, and temperature probe. Generate the full control package."
- "Create Modbus communication config for 3 power meters and 2 VFDs on an RS-485 bus."
- "Generate HMI screens for a packaging line with 4 conveyors and 2 labelers."
- "Build PID temperature control for a heat exchanger in Structured Text."
- "Create the complete I/O map for a water treatment plant with 3 pumps, 2 chemical dosing systems, and pH/turbidity analyzers."
