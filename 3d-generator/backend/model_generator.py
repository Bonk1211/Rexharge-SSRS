from math import radians, tan
from pathlib import Path
from uuid import uuid4

import numpy as np
import trimesh


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


def _panel_mesh(center, width, height, x_rotation=0, z_rotation=0):
    panel = _box(
        "solar_panel",
        extents=[height, width, 0.04],
        translation=[0, 0, 0],
        color=[26, 83, 180, 255],
    )
    panel.apply_transform(trimesh.transformations.rotation_matrix(x_rotation, [1, 0, 0]))
    panel.apply_transform(trimesh.transformations.rotation_matrix(z_rotation, [0, 0, 1]))
    panel.apply_translation(center)
    return panel


def _estimate_panels(length, width, pitch_degrees, overhang, panel_width, panel_height):
    roof_length = length + overhang * 2
    roof_width = width + overhang * 2
    roof_slope_width = (roof_width / 2) / np.cos(radians(pitch_degrees))
    usable_roof_area = float(round(roof_length * roof_slope_width * 2 * 0.72, 2))
    panel_area = panel_width * panel_height
    panel_count = max(0, int(usable_roof_area // panel_area))
    return usable_roof_area, panel_count


def _add_solar_panels(meshes, length, width, height, roof_pitch, overhang, panel_width, panel_height, panel_count):
    if panel_count == 0:
        return

    roof_length = length + overhang * 2
    roof_width = width + overhang * 2
    half_w = roof_width / 2
    rows = max(1, min(5, int((roof_width / 2.4) // panel_width)))
    cols = max(1, min(10, int((roof_length - 2.0) // panel_height)))
    count = min(panel_count, rows * cols)

    spacing_x = panel_height + 0.18
    spacing_y = panel_width + 0.16
    start_x = -((cols - 1) * spacing_x) / 2
    start_y = -half_w + panel_width * 0.9
    pitch_radians = radians(roof_pitch)
    normal_offset = 0.08

    made = 0
    for row in range(rows):
        for col in range(cols):
            if made >= count:
                return
            x = start_x + col * spacing_x
            y = start_y + row * spacing_y
            if y >= -panel_width * 0.5:
                continue
            z = height + tan(pitch_radians) * (y + half_w)
            center = [
                x,
                y - np.sin(pitch_radians) * normal_offset,
                z + np.cos(pitch_radians) * normal_offset,
            ]
            meshes.append(_panel_mesh(center, panel_width, panel_height, x_rotation=pitch_radians))
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

    usable_roof_area, panel_count = _estimate_panels(
        length, width, roof_pitch, roof_overhang, panel_width, panel_height
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
    for x in (-length * 0.22, length * 0.22):
        meshes.append(
            _box(
                "roof_vent",
                [0.45, 0.35, 0.55],
                [x, vent_y, height + 0.55],
                [78, 82, 88, 255],
            )
        )

    _add_solar_panels(
        meshes,
        length,
        width,
        height,
        roof_pitch,
        roof_overhang,
        panel_width,
        panel_height,
        panel_count,
    )

    scene = trimesh.Scene(meshes)
    filename = f"generated_{uuid4().hex[:10]}.glb"
    output_path = output_dir / filename
    scene.export(output_path)

    stats = {
        "usable_roof_area": usable_roof_area,
        "panel_count": panel_count,
        "estimated_kwp": round(panel_count * panel_watt / 1000, 2),
    }
    return filename, stats
