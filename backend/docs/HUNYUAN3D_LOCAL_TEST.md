# Hunyuan3D Local Feasibility Test

## Result

Local Hunyuan3D shape generation works on this machine.

## Hardware

- GPU: NVIDIA GeForce RTX 3080 Laptop GPU
- VRAM: 16GB
- Driver CUDA reported by `nvidia-smi`: 13.0
- PyTorch CUDA runtime: 12.4
- PyTorch: 2.5.1+cu124
- Python test environment: `.venv-hunyuan`, Python 3.10.20

## Test Input

- Source image: `backend/data/1.PNG`
- Input image count: 1
- Mode: Hunyuan3D-2.1 shape generation only
- Texture generation: not tested

## Test Outputs

### Smoke Test

- Output: `backend/generated_models/hunyuan_shape_smoke.glb`
- Settings: 5 inference steps, octree resolution 128, 4000 chunks
- Generation time after model load: about 12.3 seconds
- Peak allocated VRAM: about 7.63GB
- File size: about 1.08MB
- Mesh stats: 31,357 vertices, 62,938 faces

### Stronger Shape Test

- Output: `backend/generated_models/hunyuan_shape_30step_256.glb`
- Settings: 30 inference steps, octree resolution 256, 8000 chunks
- Generation time after model load: about 67.9 seconds
- Peak allocated VRAM: about 7.63GB
- File size: about 5.79MB
- Mesh stats: 168,584 vertices, 337,352 faces

## Conclusion

The local RTX 3080 Laptop GPU is enough for Hunyuan3D-2.1 shape-only generation.

Recommended next step:

1. Review the generated GLB visually in the browser viewer or a 3D viewer.
2. Test 2 to 4 selected images if the workflow supports multi-view input.
3. Test texture generation separately; it may require more VRAM than shape generation.
