import argparse
import os
import sys
import time
from pathlib import Path

import torch


def parse_args():
    parser = argparse.ArgumentParser(
        description="Run Hunyuan3D-2.1 texture generation for an existing mesh."
    )
    parser.add_argument(
        "--repo",
        default="tools/Hunyuan3D-2.1",
        help="Path to the cloned Hunyuan3D-2.1 repository, relative to backend/.",
    )
    parser.add_argument(
        "--mesh",
        default="generated_models/hunyuan_shape_30step_256.glb",
        help="Input shape mesh path, relative to backend/.",
    )
    parser.add_argument(
        "--image",
        nargs="+",
        default=["data/1.PNG"],
        help="One or more reference image paths, relative to backend/.",
    )
    parser.add_argument(
        "--output",
        default="generated_models/hunyuan_textured_512.obj",
        help="Output OBJ path, relative to backend/.",
    )
    parser.add_argument(
        "--views",
        type=int,
        default=6,
        help="Maximum selected texture views.",
    )
    parser.add_argument(
        "--resolution",
        type=int,
        default=512,
        choices=(512, 768),
        help="Generated texture view resolution.",
    )
    parser.add_argument(
        "--no-remesh",
        action="store_true",
        help="Skip Hunyuan's remesh step before texture baking.",
    )
    parser.add_argument(
        "--no-glb",
        action="store_true",
        help="Skip exporting a textured GLB next to the OBJ output.",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    backend_root = Path(__file__).resolve().parents[1]
    repo = (backend_root / args.repo).resolve()
    mesh = (backend_root / args.mesh).resolve()
    images = [(backend_root / image).resolve() for image in args.image]
    output = (backend_root / args.output).resolve()
    repo_root = backend_root.parent

    os.environ.setdefault("HF_HOME", str(repo_root / ".hf-cache"))
    os.environ.setdefault("HF_HUB_CACHE", str(repo_root / ".hf-cache" / "hub"))
    os.environ.setdefault("HF_MODULES_CACHE", str(repo_root / ".hf-cache" / "modules"))
    os.environ.setdefault("HUNYUAN3D_PAINT_MODEL_DIR", str(backend_root / "paint_model_cache"))

    if not repo.exists():
        raise FileNotFoundError(f"Hunyuan3D repo not found: {repo}")
    if not mesh.exists():
        raise FileNotFoundError(f"Input mesh not found: {mesh}")
    for image in images:
        if not image.exists():
            raise FileNotFoundError(f"Reference image not found: {image}")

    sys.path.insert(0, str(repo / "hy3dpaint"))
    sys.path.insert(0, str(repo))

    try:
        from torchvision_fix import apply_fix

        apply_fix()
    except Exception as exc:
        print(f"Warning: torchvision compatibility fix failed: {exc}")

    from textureGenPipeline import Hunyuan3DPaintConfig, Hunyuan3DPaintPipeline

    print(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"GPU: {torch.cuda.get_device_name(0)}")
        print(
            "VRAM:",
            round(torch.cuda.get_device_properties(0).total_memory / 1024**3, 2),
            "GB",
        )
        torch.cuda.reset_peak_memory_stats()

    conf = Hunyuan3DPaintConfig(max_num_view=args.views, resolution=args.resolution)
    conf.realesrgan_ckpt_path = str(
        repo / "hy3dpaint" / "ckpt" / "RealESRGAN_x4plus.pth"
    )
    conf.multiview_cfg_path = str(repo / "hy3dpaint" / "cfgs" / "hunyuan-paint-pbr.yaml")
    conf.custom_pipeline = str(repo / "hy3dpaint" / "hunyuanpaintpbr")
    dino_snapshots = (
        Path.home()
        / ".cache"
        / "huggingface"
        / "hub"
        / "models--facebook--dinov2-giant"
        / "snapshots"
    )
    if dino_snapshots.exists():
        dino_snapshot = next(
            (
                path
                for path in sorted(dino_snapshots.iterdir(), reverse=True)
                if (path / "preprocessor_config.json").exists()
            ),
            None,
        )
        if dino_snapshot is not None:
            conf.dino_ckpt_path = str(dino_snapshot)

    start = time.time()
    pipeline = Hunyuan3DPaintPipeline(conf)
    print("Texture model load seconds:", round(time.time() - start, 1))

    output.parent.mkdir(parents=True, exist_ok=True)

    start = time.time()
    result = pipeline(
        mesh_path=str(mesh),
        image_path=[str(image) for image in images],
        output_mesh_path=str(output),
        use_remesh=not args.no_remesh,
        save_glb=not args.no_glb,
    )

    glb_output = output.with_suffix(".glb")
    if not args.no_glb and not glb_output.exists():
        import trimesh

        scene = trimesh.load(str(output), force="scene")
        scene.export(str(glb_output))

    print("Texture generation seconds:", round(time.time() - start, 1))
    if torch.cuda.is_available():
        print(
            "Peak allocated VRAM:",
            round(torch.cuda.max_memory_allocated() / 1024**3, 2),
            "GB",
    )
    print(f"Saved OBJ: {Path(result).resolve()}")
    if not args.no_glb:
        print(f"Saved GLB: {glb_output.resolve()}")
    print(f"Expected material: {output.with_suffix('.mtl')}")
    print(f"Expected albedo texture: {output.with_suffix('.jpg')}")


if __name__ == "__main__":
    main()
