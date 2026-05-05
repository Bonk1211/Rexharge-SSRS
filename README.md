# Rexcharge 3D Solar Layout Optimization Engine

## System Overview

The Rexcharge MVP incorporates a physics-informed backend optimization engine designed to maximize the Annual Energy Yield (kWh) of rooftop solar PV installations. By integrating precise astronomical geometry with localized meteorological data, the system autonomously identifies the most efficient panel layout, tilt, and orientation for any given roof structure.

---

## Technical Methodology

### 1. Parametric Design Space Optimization
The system executes a combinatorial sweep to determine the optimal mounting configuration. For each roof simulation, it evaluates **42 distinct configurations**:
- **Bracket Tilt:** Ranging from 0° (flush mount) to 20° in 1-degree increments.
- **Orientation:** Portrait versus Landscape mounting.

The engine ranks these configurations by projected annual yield, presenting the top three results to facilitate comparative analysis of design trade-offs (e.g., spatial efficiency vs. irradiance gain).

### 2. Spatiotemporal Irradiance Modeling
To achieve high-fidelity yield predictions suitable for Malaysia's equatorial climate, the engine utilizes the `pvlib` physics library rather than static global averages.
- **Data Ingestion:** Retrieves hourly Typical Meteorological Year (TMY) data (GHI, DNI, DHI) via the PVGIS API.
- **Transposition:** Applies the Perez Transposition Model to compute precise Plane-of-Array (POA) irradiance for independent roof facets (e.g., Azimuth 180° for South, 0° for North).
- **Visualization:** Implements a localized 3D heatmap, distinguishing high-yield (South-facing) panels in gold from lower-yield (North-facing) panels in blue.

### 3. Dynamic Shading Analysis
To prevent string voltage degradation, the engine models dynamic obstacle shading rather than basic bounding-box exclusion.
- **Sun Path Trajectory:** Simulates solar positioning between 09:00 and 15:00 on the Winter Solstice (the critical worst-case shading scenario).
- **Shadow Projection:** Extrapolates physical shadow lengths using:
  `Shadow_Length = obstacle_height / tan(sun_elevation_angle)`
- **Spatial Exclusion:** Converts projected shadows into 2D multi-polygons via `Shapely`. The layout algorithm strictly prohibits panel placement within these calculated exclusion zones.

### 4. Dynamic Performance Ratio (PR)
The system eschews static efficiency multipliers in favor of a component-level Performance Ratio model:
`PR = (1 - L_temp) × (1 - L_soil) × (1 - L_mismatch) × (1 - L_wire) × (1 - L_inv)`

Key environmental adjustments and component specs include:
- **Temperature Derating (L_temp):** Based on the **Trina Solar Vertex N** (TSM-NEG19RC.20) temperature coefficient of `-0.29% / °C`. Assuming a conservative 50°C operating cell temperature in Malaysia, this calculates an exact `7.25%` thermal loss.
- **Inverter Efficiency (L_inv):** Calibrated to the **Sigen Hybrid Inverter**, applying a strict `1.4%` loss (based on its `98.6%` maximum efficiency rating).
- **Soiling Loss (L_soil):** A dynamic variable modeled as `2% + 3% * max(0, 1 - tilt/10)`. This accurately reflects the self-cleaning advantage of steeper tilts under equatorial rainfall.

### 5. Inter-Row Shading Mitigation
When generating elevated arrays (tilt > 0°), the engine automatically enforces safe row spacing to prevent mutual shading during peak generation hours:
`Row_Gap = (Panel_Length * sin(Bracket_Tilt)) / tan(40°)`
*(40° defines the minimum solar elevation angle required for unshaded operation in this latitudinal context).*

### 6. Energy Yield Computation
The final Annual Energy Yield is aggregated by computing the output of each independent roof plane separately, ensuring precise adherence to localized POA irradiance:
`E_annual = N_panels × P_kwp × POA_annual × PR`

- **E_annual:** Total Annual Energy Yield (kWh)
- **N_panels:** Total count of viable modules placed outside shading zones.
- **P_kwp:** Standard Test Condition (STC) capacity per module (e.g., 0.350 kWp).
- **POA_annual:** Facet-specific Plane-of-Array irradiance (kWh/m²/year).
- **PR:** The calculated dynamic Performance Ratio.