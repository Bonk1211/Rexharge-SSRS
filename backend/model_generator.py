from math import radians, tan
from pathlib import Path
from uuid import uuid4

import numpy as np
import trimesh

import solar_optimizer


def _box(name, extents, translation, color):
    mesh = trimesh.creation.box(extents=extents)
    mesh.name = name
    mesh.apply_translation(translation)
    mesh.visual.vertex_colors = np.tile(color, (len(mesh.vertices), 1))
    mesh.metadata["name"] = name
    return mesh


def _hip_roof(length, width, base_z, pitch_degrees, overhang, ridge_length_ratio):
    roof_length = length + overhang * 2
    roof_width = width + overhang * 2
    half_l = roof_length / 2
    half_w = roof_width / 2
    rise = tan(radians(pitch_degrees)) * half_w
    ridge_half_l = max(0.2, half_l * ridge_length_ratio)

    vertices = np.array(
        [
            [-half_l, -half_w, base_z],
            [half_l, -half_w, base_z],
            [half_l, half_w, base_z],
            [-half_l, half_w, base_z],
            [-ridge_half_l, 0, base_z + rise],
            [ridge_half_l, 0, base_z + rise],
        ],
        dtype=float,
    )
    faces = np.array(
        [
            [0, 1, 5],
            [0, 5, 4],
            [3, 4, 5],
            [3, 5, 2],
            [0, 4, 3],
            [1, 2, 5],
        ],
        dtype=int,
    )
    mesh = trimesh.Trimesh(vertices=vertices, faces=faces, process=False)
    mesh.name = "hip_roof"
    mesh.visual.vertex_colors = np.tile([58, 64, 72, 255], (len(mesh.vertices), 1))
    mesh.metadata["name"] = "hip_roof"
    return mesh, rise


def _panel_mesh(center, width, height, x_rotation=0, z_rotation=0, color=[26, 83, 180, 255]):
    panel = _box(
        "solar_panel",
        extents=[height, width, 0.04],
        translation=[0, 0, 0],
        color=color,
    )
    panel.apply_transform(trimesh.transformations.rotation_matrix(x_rotation, [1, 0, 0]))
    panel.apply_transform(trimesh.transformations.rotation_matrix(z_rotation, [0, 0, 1]))
    panel.apply_translation(center)
    return panel


def _add_shadow_meshes(meshes, shadow_zones, width, height, roof_pitch, overhang):
    if shadow_zones is None or shadow_zones.is_empty:
        return
        
    pitch_radians = radians(roof_pitch)
    half_w = width / 2 + overhang
    
    from shapely.geometry import Polygon, MultiPolygon
    polys = list(shadow_zones.geoms) if isinstance(shadow_zones, MultiPolygon) else [shadow_zones]
        
    for poly in polys:
        try:
            # Extrude the 2D polygon into a thin 3D mesh
            mesh = trimesh.creation.extrude_polygon(poly, height=0.01)
            
            # Map the Z coordinates to lay exactly on the hip roof slope
            for i, v in enumerate(mesh.vertices):
                x, y, z_extrude = v
                # Formula for hip roof Z based on Y distance from ridge
                z_roof = height + tan(pitch_radians) * (half_w - abs(y))
                # Hover slightly above the roof surface (0.05m)
                mesh.vertices[i][2] = z_roof + 0.05 + z_extrude
                
            # Color: Dark gray/black, semi-transparent to look like a shadow
            mesh.visual.vertex_colors = np.tile([20, 20, 25, 200], (len(mesh.vertices), 1))
            mesh.name = "shadow_mesh"
            meshes.append(mesh)
        except Exception as e:
            print(f"Shadow render error: {e}")

def _add_compass_and_sun(meshes, length, width):
    # 1. Compass Arrow pointing North (+Y)
    cyl = trimesh.creation.cylinder(radius=0.1, height=3.0)
    cyl.apply_transform(trimesh.transformations.rotation_matrix(radians(90), [1, 0, 0])) 
    cyl.visual.vertex_colors = np.tile([200, 200, 200, 255], (len(cyl.vertices), 1))
    
    cone = trimesh.creation.cone(radius=0.3, height=1.0)
    cone.apply_transform(trimesh.transformations.rotation_matrix(radians(-90), [1, 0, 0])) 
    cone.apply_translation([0, 1.5, 0])
    # Red tip for North
    cone.visual.vertex_colors = np.tile([220, 50, 50, 255], (len(cone.vertices), 1))
    
    arrow = trimesh.util.concatenate([cyl, cone])
    # Place compass on the ground to the left of the house
    arrow.apply_translation([-length/2 - 4, 0, 0.2])
    arrow.name = "compass"
    meshes.append(arrow)
    
    # 2. Sun Sphere in the South (-Y)
    sun = trimesh.creation.icosphere(radius=1.5)
    # Place sun high up in the South, shining towards North
    sun.apply_translation([0, -width/2 - 8, 12])
    sun.visual.vertex_colors = np.tile([255, 215, 0, 255], (len(sun.vertices), 1))
    sun.name = "sun"
    meshes.append(sun)

def _add_optimized_solar_panels(meshes, length, width, height, roof_pitch, overhang, best_config, shadow_zones=None):
    rows = best_config['rows']
    cols = best_config['cols']
    if rows == 0 or cols == 0:
        return

    pw = best_config['pw'] # length along Y slope
    ph = best_config['ph'] # length along X
    spacing_y = best_config['spacing_y']
    bracket_tilt = best_config['bracket_tilt']

    spacing_x = ph + 0.05
    
    roof_length = length + overhang * 2
    roof_width = width + overhang * 2
    half_w = roof_width / 2
    
    start_x = -((cols - 1) * spacing_x) / 2
    start_y = -half_w + (spacing_y / 2) + 0.2

    pitch_radians = radians(roof_pitch)
    normal_offset = 0.08
    
    half_l = roof_length / 2
    ridge_half_l = max(0.2, half_l * 0.56)

    made = 0
    # Place panels on both South (side = -1) and North (side = 1) slopes
    for side in [-1, 1]:
        start_x = -((cols - 1) * spacing_x) / 2
        # Start Y from the eaves
        start_y = side * (half_w - (spacing_y / 2) - 0.2)

        for row in range(rows):
            for col in range(cols):
                x = start_x + col * spacing_x
                # Y moves towards the ridge (0)
                y = start_y - side * row * spacing_y * np.cos(pitch_radians)
                
                # Keep away from ridge
                if abs(y) <= 0.2:
                    continue
                    
                # Keep within the trapezoid of the hip roof
                current_max_x = half_l - (half_l - ridge_half_l) * ((half_w - abs(y)) / half_w)
                if abs(x) + ph / 2 > current_max_x - 0.2:
                    continue
                    
                # COLLISION DETECTION: Physics-based shadow envelope
                # Uses pvlib winter solstice shadow projections from chimneys
                from shapely.geometry import box as shapely_box
                panel_box = shapely_box(x - ph/2, y - pw/2, x + ph/2, y + pw/2)
                if shadow_zones is not None and shadow_zones.intersects(panel_box):
                    continue
                    
                # Adjust Z so the tilted panel sits correctly on the roof
                z_adjust = (pw / 2) * np.sin(radians(bracket_tilt))
                z = height + tan(pitch_radians) * (half_w - abs(y)) + z_adjust
                
                center = [
                    x,
                    y - side * np.sin(pitch_radians) * normal_offset,
                    z + np.cos(pitch_radians) * normal_offset,
                ]
                
                # Rotate properly depending on the slope facing
                total_x_rotation = pitch_radians + radians(bracket_tilt)
                if side == 1:
                    total_x_rotation = -total_x_rotation
                    
                # Heatmap Colors based on Slope Yield
                if side == -1:
                    panel_color = [242, 190, 34, 255] # South (High Yield) = Warm Gold
                else:
                    panel_color = [34, 139, 242, 255] # North (Low Yield) = Cool Blue
                    
                meshes.append(_panel_mesh(center, pw, ph, x_rotation=total_x_rotation, color=panel_color))
                made += 1


def generate_model(params, output_dir: Path):
    length = float(params["building_length"])
    width = float(params["building_width"])
    height = float(params["building_height"])
    roof_pitch = float(params["roof_pitch"])
    roof_overhang = float(params.get("roof_overhang", 0.45))
    ridge_length_ratio = float(params.get("ridge_length_ratio", 0.56))
    porch_length = float(params["porch_length"])
    porch_width = float(params["porch_width"])
    porch_offset = float(params.get("porch_offset", 0))
    panel_width = float(params["panel_width"])
    panel_height = float(params["panel_height"])
    panel_watt = float(params["panel_watt"])
    panel_bracket_tilt = float(params.get("panel_bracket_tilt", -1))

    best_config = solar_optimizer.optimize_layout(
        length, width, roof_pitch, roof_overhang, panel_width, panel_height, panel_watt, panel_bracket_tilt
    )
    meshes = [
        _box("house_body", [length, width, height], [0, 0, height / 2], [232, 225, 212, 255]),
    ]

    roof, _ = _hip_roof(length, width, height, roof_pitch, roof_overhang, ridge_length_ratio)
    meshes.append(roof)

    if porch_length > 0 and porch_width > 0:
        porch_w = min(width + 1.0, porch_width)
        porch_y = max(-(width - porch_w) / 2, min((width - porch_w) / 2, porch_offset))
        meshes.extend(
            [
                _box(
                    "front_porch_slab",
                    [porch_length, porch_w, 0.18],
                    [length / 2 + porch_length / 2, porch_y, 0.09],
                    [186, 190, 194, 255],
                ),
                _box(
                    "front_porch_roof",
                    [porch_length, porch_w, 0.16],
                    [length / 2 + porch_length / 2, porch_y, height * 0.68],
                    [120, 68, 45, 255],
                ),
            ]
        )

    vent_y = width * 0.18
    pitch_radians = radians(roof_pitch)
    roof_z_at_vent = height + tan(pitch_radians) * (width / 2 - abs(vent_y))
    
    for x in (-length * 0.22, length * 0.22):
        meshes.append(
            _box(
                "roof_vent",
                [0.45, 0.35, 0.55],
                [x, vent_y, roof_z_at_vent + 0.55 / 2],
                [78, 82, 88, 255],
            )
        )

    # Calculate physics-based shadow zones from chimneys
    shadow_zones = solar_optimizer.calculate_shadow_zones(length, width)
    
    # 1. Physically render the shadows on the roof so the user can SEE why panels are missing
    _add_shadow_meshes(meshes, shadow_zones, width, height, roof_pitch, roof_overhang)
    
    # 2. Add Compass Arrow (North) and Sun (South) for visual context
    _add_compass_and_sun(meshes, length, width)

    # 3. Place the panels (which will automatically dodge the shadows)
    _add_optimized_solar_panels(
        meshes,
        length,
        width,
        height,
        roof_pitch,
        roof_overhang,
        best_config,
        shadow_zones,
    )
    scene = trimesh.Scene(meshes)
    filename = f"generated_{uuid4().hex[:10]}.glb"
    output_path = output_dir / filename
    scene.export(output_path)

    stats = {
        "usable_roof_area": round(length * width * 0.5, 2),
        "panel_count": best_config['panel_count'],
        "bracket_tilt": best_config['bracket_tilt'],
        "estimated_kwp": round(best_config['system_kwp'], 2),
        "annual_yield_kwh": round(best_config['annual_yield'], 2),
        "savings_rm": round(best_config.get('savings_rm', best_config['annual_yield'] * 0.51), 2),
        "lifetime_savings_rm": round(best_config.get('lifetime_savings_rm', 0)),
        "inverter_model": best_config.get('inverter_model', "N/A"),
        "dc_ac_ratio": best_config.get('dc_ac_ratio', 0),
        "yield_south": best_config.get('yield_south', 0),
        "yield_north": best_config.get('yield_north', 0),
        "monthly_yields": [round(m, 2) for m in best_config['monthly_yields']],
        "performance_ratio": round(best_config['pr'], 3),
        "soiling_loss_pct": round(best_config['soiling_loss'] * 100, 1),
        "temp_loss_pct": round(best_config['temp_loss'] * 100, 1),
        "poa_irradiance": round(best_config['poa'], 2),
        "orientation": best_config['orientation'],
        "top_3": best_config.get('top_3', []),
    }
    return filename, stats
