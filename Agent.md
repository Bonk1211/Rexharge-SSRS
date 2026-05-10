# AGENTS.md

## Project Goal

The immediate goal is to test whether the local PC has enough processing power to generate a 3D bungalow model using Hunyuan3D.

Do not start by building the full web app. First prove whether Hunyuan3D can run locally on the available hardware and produce at least one exported 3D model.

## Primary Question

Can the local RTX 3080 machine generate a usable 3D model from bungalow drone photos using Hunyuan3D?

Answer this with a practical local test, not assumptions.

## Target Hardware

Target machine:
- Local PC
- NVIDIA RTX 3080 GPU
- Assume around 10GB VRAM unless confirmed with `nvidia-smi`

Expected constraint:
- Hunyuan3D shape generation may fit in roughly 10GB VRAM.
- Full texture generation may require significantly more VRAM.
- On this machine, prioritize shape-only or low-VRAM generation first.

## Success Criteria For Hardware Test

The local Hunyuan3D test is successful when:

1. CUDA and PyTorch detect the RTX 3080.
2. Hunyuan3D runs locally without CUDA out-of-memory on a small test.
3. At least one bungalow mesh is generated.
4. The mesh is exported as GLB, OBJ, or PLY.
5. The run notes include:
   - GPU name
   - VRAM amount
   - input image count
   - Hunyuan3D mode used
   - whether texture generation was enabled
   - output format
   - approximate generation time
   - whether any out-of-memory error occurred

If shape generation works but texture generation fails, treat that as a partial success. The machine is enough for geometry testing but not enough for full high-quality textured output.

## Phase 1: Local Hunyuan3D Feasibility Test

This phase comes before frontend or backend work.

Recommended order:

1. Confirm GPU and CUDA state:
   - Run `nvidia-smi`.
   - Confirm GPU model and available VRAM.
   - Confirm CUDA-compatible PyTorch can see the GPU.

2. Install or use a local Hunyuan3D workflow:
   - Prefer the official Hunyuan3D repository or a known ComfyUI Hunyuan3D workflow.
   - Use low-VRAM options where available.
   - Avoid high-resolution or full texture settings for the first test.

3. Run the smallest useful test:
   - Start with one clean bungalow drone photo.
   - Generate shape/geometry only first.
   - Export GLB if possible.
   - If GLB is unavailable, export OBJ or PLY.

4. Increase complexity only after the first test passes:
   - Try 2 to 4 images if the selected workflow supports multi-view input.
   - Try 4 to 6 images only if VRAM remains stable.
   - Try texture generation only after shape generation succeeds.

5. Record the result:
   - Successful generation
   - Failed installation
   - CUDA not detected
   - Out-of-memory during shape generation
   - Out-of-memory during texture generation
   - Output file created but low quality

## Input Images

The user has around 13 drone rooftop photos of a bungalow.

For the first hardware test, do not use all 13 images. Start with one clean image.

If the one-image test works, select 2 to 6 useful images:
- front-left angle
- front-right angle
- back-left angle
- back-right angle
- top/roof view
- side view

Avoid:
- blurry images
- repeated same angle
- heavy tree obstruction
- cropped building
- strong shadows
- photos where the roof is unclear

## Hunyuan3D Workflow Rules

Do not integrate Hunyuan3D into the website first.

Do not spend time building automation before local generation is proven.

For the first test:
- Prefer shape-only generation.
- Prefer low-VRAM mode.
- Use fewer inference steps if needed.
- Use lower mesh or texture resolution if configurable.
- Avoid high-quality PBR texture generation until geometry works.

If a workflow outputs OBJ or PLY, converting to GLB is acceptable after generation.

## Phase 1 Definition Of Done

Phase 1 is complete when one of these outcomes is documented:

1. Full success:
   - Local Hunyuan3D generated a 3D model.
   - Output file exists.
   - No out-of-memory failure.

2. Partial success:
   - Shape generation works.
   - Texture generation fails or is skipped because of VRAM.

3. Failure:
   - CUDA/PyTorch cannot use the GPU.
   - Hunyuan3D cannot be installed locally.
   - Shape generation fails due to VRAM or another blocker.

The output of Phase 1 should be a clear recommendation:
- Continue locally on RTX 3080.
- Continue locally but use shape-only or low-quality settings.
- Use cloud GPU for full texture generation.
- Use a different workflow.

## Phase 2: Browser Viewer After Generation Works

Only after Phase 1 produces an exported model, build the local browser viewer.

Frontend goal:
- Create a React + Vite frontend that can display a generated GLB model.

Frontend stack:
- React
- Vite
- Tailwind CSS
- React Three Fiber
- Drei

Viewer requirements:
- Load a local GLB file.
- Use OrbitControls.
- Drag to rotate.
- Scroll to zoom.
- Pan around.
- Add basic lighting.
- Add a ground/grid helper if useful.
- Show selected uploaded photos as preview/reference if useful.

The frontend should support:
1. Loading a static local GLB from `backend/generated_models/`.
2. Later loading a GLB URL returned from a backend.

## Optional Backend

Backend is optional and should not be implemented before Phase 1 succeeds.

If implemented later, use FastAPI.

Possible backend responsibilities:
- Serve generated GLB files.
- Later trigger Hunyuan3D generation if automation is needed.
- For early demos, return an existing generated model URL.

Example future endpoint:

GET /models/{filename}
- Serve GLB files from `backend/generated_models/`.

Example mock endpoint:

POST /mock-generate
- Return an existing model URL:

```json
{
  "model_url": "http://localhost:8000/models/bungalow_output.glb",
  "status": "ready"
}
```

## Suggested Project Structure

Use this root structure:

```text
roofvision3d/
  AGENTS.md
  frontend/
    package.json
    src/
  backend/
    main.py
    requirements.txt
    data/
      1.PNG
    generated_models/
      bungalow_output.glb
    scripts/
      run_hunyuan_shape.py
    test-frontend/
      package.json
      src/
    tools/
      Hunyuan3D-2.1/
    docs/
      HUNYUAN3D_LOCAL_TEST.md
```

## Scope Rules

Do not overbuild.
Do not promise dimension accuracy.
Do not claim photogrammetry.
Do not claim engineering-grade reconstruction.
Do not build procedural reconstruction first.
Do not use Meshroom for the main workflow.
Do not rely on Blender manual cleanup for the first proof.

This project is for:
- visual 3D reconstruction demo
- browser-based 3D viewing
- solar planning concept demonstration

The output can be approximate.

## Known Limitations To Mention

- Hunyuan3D is generative, not measurement-accurate.
- Output may hallucinate building details.
- Multi-view results depend heavily on image quality.
- 13 images may not all be useful.
- RTX 3080 VRAM may limit quality settings.
- Full texture generation may require a higher-VRAM GPU.
- Manual pre-generation may be used for demo stability.

## Overall Build Priority

1. Prove Hunyuan3D can run locally.
2. Generate one shape-only model from one bungalow photo.
3. Export the model.
4. Test more images only if the first run succeeds.
5. Test texture generation only if VRAM allows.
6. Build a React GLB viewer only after a model exists.
7. Add upload previews and mock generate flow later.
8. Automate Hunyuan3D generation only after manual generation is reliable.
