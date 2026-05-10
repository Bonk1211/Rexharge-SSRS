import argparse
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
        default="data/1.PNG",
        help="Reference image path, relative to backend/.",
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
    return parser.parse_args()


def main():
    args = parse_args()
    backend_root = Path(__file__).resolve().parents[1]
    repo = (backend_root / args.repo).resolve()
    mesh = (backend_root / args.mesh).resolve()
    image = (backend_root / args.image).resolve()
    output = (backend_root / args.output).resolve()

    if not repo.exists():
        raise FileNotFoundError(f"Hunyuan3D repo not found: {repo}")
    if not mesh.exists():
        raise FileNotFoundError(f"Input mesh not found: {mesh}")
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

    start = time.time()
    pipeline = Hunyuan3DPaintPipeline(conf)
    print("Texture model load seconds:", round(time.time() - start, 1))

    output.parent.mkdir(parents=True, exist_ok=True)

    start = time.time()
    result = pipeline(
        mesh_path=str(mesh),
        image_path=str(image),
        output_mesh_path=str(output),
        use_remesh=not args.no_remesh,
        save_glb=False,
    )

    print("Texture generation seconds:", round(time.time() - start, 1))
    if torch.cuda.is_available():
        print(
            "Peak allocated VRAM:",
            round(torch.cuda.max_memory_allocated() / 1024**3, 2),
            "GB",
        )
    print(f"Saved OBJ: {Path(result).resolve()}")
    print(f"Expected material: {output.with_suffix('.mtl')}")
    print(f"Expected albedo texture: {output.with_suffix('.jpg')}")


if __name__ == "__main__":
    main()
