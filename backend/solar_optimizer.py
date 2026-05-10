import os
import pvlib
import pandas as pd
import numpy as np
from shapely.geometry import box as shapely_box
from shapely import affinity
from shapely.ops import unary_union

CACHE_DIR = os.path.join(os.path.dirname(__file__), "data")
os.makedirs(CACHE_DIR, exist_ok=True)

def get_irradiance_data(lat, lon):
    """
    Tier 1: Fetch PVGIS TMY data and cache it locally.
    Tier 2: Fallback to Clear Sky Ineichen model if PVGIS fails.
    """
    cache_file = os.path.join(CACHE_DIR, f"tmy_{lat}_{lon}.csv")
    if os.path.exists(cache_file):
        df = pd.read_csv(cache_file, index_col=0, parse_dates=True)
        if df.index.tz is None:
            df.index = df.index.tz_localize('UTC')
        return df
    
    try:
        print(f"Fetching PVGIS data for {lat}, {lon}...")
        tmy, meta = pvlib.iotools.get_pvgis_tmy(lat, lon, map_variables=True)
        tmy.to_csv(cache_file)
        return tmy
    except Exception as e:
        print(f"Failed to fetch PVGIS data: {e}. Falling back to clear sky model.")
        loc = pvlib.location.Location(lat, lon, tz='Asia/Kuala_Lumpur')
        times = pd.date_range('2025-01-01', '2025-12-31 23:00', freq='1h', tz='Asia/Kuala_Lumpur')
        cs = loc.get_clearsky(times)
        return cs

def calculate_pr_details(tilt_deg):
    # Base losses
    inverter_loss = 0.014  # Sigen Hybrid Inverter (98.6% Max Efficiency)
    wiring_loss = 0.02
    mismatch_loss = 0.02
    
    # Malaysia Real-World Thermal Physics
    # Standard Test Condition (STC) is 25°C. 
    # Malaysia roof ambient hits 35°C, and cell temp easily reaches 50°C.
    # Trina Solar Vertex N Temp Coefficient of Pmax = -0.29% / °C
    cell_temp = 50.0
    stc_temp = 25.0
    temp_coef = 0.0029
    temp_loss = (cell_temp - stc_temp) * temp_coef  # 7.25% loss
    
    soiling = 0.02 + 0.03 * max(0, 1 - tilt_deg/10) # Less dust if steeper
    
    pr = 1 - soiling - temp_loss - mismatch_loss - wiring_loss - inverter_loss
    return {
        'total_pr': pr,
        'soiling_loss': soiling,
        'temp_loss': temp_loss
    }

def calculate_poa(lat, lon, tilt, azimuth=180):
    """Calculate Plane-of-Array irradiance using Perez transposition."""
    df = get_irradiance_data(lat, lon)
    times = df.index
    solpos = pvlib.solarposition.get_solarposition(times, lat, lon)
    
    # Ensure standard names
    dni = df['dni'] if 'dni' in df.columns else df['DNI']
    ghi = df['ghi'] if 'ghi' in df.columns else df['GHI']
    dhi = df['dhi'] if 'dhi' in df.columns else df['DHI']

    dni_extra = pvlib.irradiance.get_extra_radiation(times)

    poa = pvlib.irradiance.get_total_irradiance(
        surface_tilt=tilt,
        surface_azimuth=azimuth,
        solar_zenith=solpos['apparent_zenith'],
        solar_azimuth=solpos['azimuth'],
        dni=dni,
        ghi=ghi,
        dhi=dhi,
        dni_extra=dni_extra,
        model='perez'
    )
    
    poa_global = poa['poa_global']
    annual_kwh_m2 = poa_global.sum() / 1000
    
    # Group by month (1-12) to handle TMY data which may span multiple years
    monthly_kwh_m2 = poa_global.groupby(poa_global.index.month).sum() / 1000
    monthly_list = [float(monthly_kwh_m2.get(m, 0.0)) for m in range(1, 13)]
    
    return annual_kwh_m2, monthly_list

def calculate_shadow_zones(length, width, lat=3.1390, lon=101.6869):
    """
    Calculate shadow envelope from roof obstacles (chimneys) using pvlib
    sun positions on winter solstice across 9AM-3PM.
    Returns a Shapely geometry of the combined shadow zone.
    """
    # Chimney positions and dimensions (matching model_generator.py)
    vent_y = width * 0.18
    chimney_height = 0.55  # meters above roof surface
    chimneys = [
        {'x': -length * 0.22, 'y': vent_y, 'w': 0.45, 'd': 0.35},
        {'x':  length * 0.22, 'y': vent_y, 'w': 0.45, 'd': 0.35},
    ]
    
    # Get sun positions for winter solstice, 9AM-3PM (worst-case shading day)
    times = pd.date_range('2025-12-21 09:00', '2025-12-21 15:00',
                          freq='1h', tz='Asia/Kuala_Lumpur')
    solpos = pvlib.solarposition.get_solarposition(times, lat, lon)
    
    all_shadows = []
    for chimney in chimneys:
        cx, cy = chimney['x'], chimney['y']
        cw, cd = chimney['w'], chimney['d']
        
        # Chimney footprint polygon
        footprint = shapely_box(cx - cw/2, cy - cd/2, cx + cw/2, cy + cd/2)
        shadows = [footprint]  # the chimney itself is always blocked
        
        for _, pos in solpos.iterrows():
            if pos['elevation'] <= 5:  # skip very low sun angles
                continue
            elev_rad = np.radians(pos['elevation'])
            azim_rad = np.radians(pos['azimuth'])
            
            shadow_len = chimney_height / np.tan(elev_rad)
            # Shadow falls OPPOSITE to sun direction
            dx = -shadow_len * np.sin(azim_rad)
            dy = -shadow_len * np.cos(azim_rad)
            
            shadow = affinity.translate(footprint, xoff=dx, yoff=dy)
            shadows.append(shadow)
        
        all_shadows.append(unary_union(shadows))
    
    return unary_union(all_shadows) if all_shadows else None

def optimize_layout(length, width, roof_pitch, overhang, panel_width, panel_height, panel_watt, force_bracket_tilt=-1, lat=3.1390, lon=101.6869):
    """
    The Brain: Sweeps through orientations to find the layout that maximizes Annual Yield.
    Currently assumes placement on the South-facing facet of the hip roof.
    """
    roof_length = length + overhang * 2
    roof_width = width + overhang * 2
    
    # South slope length along the roof pitch
    pitch_radians = np.radians(roof_pitch)
    slope_width = (roof_width / 2) / np.cos(pitch_radians)
    
    results = []
    
    if force_bracket_tilt != -1:
        tilts_to_test = [int(force_bracket_tilt)]
    else:
        # Gap 3 fix: 1-degree granularity (0° to 20°) = 21 × 2 = 42 simulations
        tilts_to_test = list(range(0, 21))

    # Test mounting brackets
    for bracket_tilt in tilts_to_test:
        total_tilt = roof_pitch + bracket_tilt
        
        # Calculate Irradiance (POA) separately for South (180°) and North (0°) slopes
        poa_annual_south, poa_monthly_south = calculate_poa(lat, lon, total_tilt, azimuth=180)
        poa_annual_north, poa_monthly_north = calculate_poa(lat, lon, total_tilt, azimuth=0)
        
        pr_details = calculate_pr_details(total_tilt)
        pr = pr_details['total_pr']
        
        for orient in ['Portrait', 'Landscape']:
            if orient == 'Portrait':
                pw, ph = panel_height, panel_width # 1.8m up the slope (Y), 1.1m across (X)
            else:
                pw, ph = panel_width, panel_height # 1.1m up the slope (Y), 1.8m across (X)
                
            # Inter-row shading gap calculation
            if bracket_tilt > 0:
                # gap = L * sin(tilt) / tan(40 deg min sun elevation)
                gap = (pw * np.sin(np.radians(bracket_tilt))) / np.tan(np.radians(40))
            else:
                gap = 0.05 # minimum clearance
                
            spacing_x = ph + 0.05
            # Y spacing must account for the panel's horizontal footprint + the shadow gap
            spacing_y = (pw * np.cos(np.radians(bracket_tilt))) + gap
            
            # Keep a 0.8m safety border
            max_cols = int((roof_length - 0.8) // spacing_x)
            max_rows = int((slope_width - 0.8) // spacing_y)
            
            if max_cols < 0: max_cols = 0
            if max_rows < 0: max_rows = 0
            
            count_per_slope = max_cols * max_rows
            
            # Estimate 2 panels lost per chimney on the North slope
            north_panels = max(0, count_per_slope - 4)
            south_panels = count_per_slope
            total_count = north_panels + south_panels
            
            system_kwp = (total_count * panel_watt) / 1000
            
            # Calculate yield uniquely for each side!
            yield_south = (south_panels * panel_watt / 1000) * poa_annual_south * pr
            yield_north = (north_panels * panel_watt / 1000) * poa_annual_north * pr
            annual_yield = yield_south + yield_north
            
            # Financials: Malaysia TNB Average Tariff (RM 0.51 / kWh)
            savings_rm = annual_yield * 0.51
            
            # Trina Vertex N 25-Year Degradation: 1% first year, 0.4% subsequent
            lifetime_yield = 0
            for year in range(1, 26):
                if year == 1:
                    deg_factor = 0.99
                else:
                    deg_factor = 0.99 - (year - 1) * 0.004
                lifetime_yield += annual_yield * deg_factor
            lifetime_savings_rm = lifetime_yield * 0.51
            
            # Sigen Hybrid Inverter Recommendation (Max 200% DC/AC ratio)
            # We target a healthy 130%-150% oversizing ratio
            sigen_models = [5, 6, 8, 10, 12, 16, 20, 24]
            recommended_inverter = 24
            for inv_kw in sigen_models:
                if system_kwp / inv_kw <= 1.5: # Fits within 150% DC/AC
                    recommended_inverter = inv_kw
                    break
            dc_ac_ratio = round((system_kwp / recommended_inverter) * 100) if system_kwp > 0 else 0
            inverter_model = f"Sigen {recommended_inverter}.0 TP2"
            
            # Average monthly yields
            monthly_yields = [
                ((south_panels * panel_watt / 1000) * ms * pr) + ((north_panels * panel_watt / 1000) * mn * pr)
                for ms, mn in zip(poa_monthly_south, poa_monthly_north)
            ]
            
            # Average POA for display
            avg_poa = (poa_annual_south * south_panels + poa_annual_north * north_panels) / total_count if total_count > 0 else 0
            
            results.append({
                'bracket_tilt': bracket_tilt,
                'total_tilt': total_tilt,
                'orientation': orient,
                'pw': pw,
                'ph': ph,
                'rows': max_rows,
                'cols': max_cols,
                'spacing_y': spacing_y,
                'panel_count': total_count,
                'system_kwp': system_kwp,
                'annual_yield': annual_yield,
                'savings_rm': savings_rm,
                'lifetime_savings_rm': lifetime_savings_rm,
                'inverter_model': inverter_model,
                'dc_ac_ratio': dc_ac_ratio,
                'yield_south': yield_south,
                'yield_north': yield_north,
                'monthly_yields': monthly_yields,
                'pr': pr,
                'soiling_loss': pr_details['soiling_loss'],
                'temp_loss': pr_details['temp_loss'],
                'poa': avg_poa,
            })
            
    # Sort all results by annual yield descending
    sorted_results = sorted(results, key=lambda x: x['annual_yield'], reverse=True)
    best_config = sorted_results[0]
    
    # Attach top-3 ranking for the judges
    best_config['top_3'] = [
        {
            'rank': i + 1,
            'bracket_tilt': r['bracket_tilt'],
            'orientation': r['orientation'],
            'panel_count': r['panel_count'],
            'annual_yield': round(r['annual_yield'], 1),
            'poa': round(r['poa'], 1),
        }
        for i, r in enumerate(sorted_results[:3])
    ]
    return best_config
