import argparse
import sys
import time
from pathlib import Path

import torch


def parse_args():
    parser = argparse.ArgumentParser(
        description="Run Hunyuan3D-2.1 shape generation and export a GLB."
    )
    parser.add_argument(
        "--repo",
        default="tools/Hunyuan3D-2.1",
        help="Path to the cloned Hunyuan3D-2.1 repository.",
    )
    parser.add_argument(
        "--image",
        default="data/1.PNG",
        help="Input image path.",
    )
    parser.add_argument(
        "--output",
        default="generated_models/hunyuan_shape_30step_256.glb",
        help="Output GLB/OBJ/PLY path.",
    )
    parser.add_argument(
        "--steps",
        type=int,
        default=30,
        help="Number of inference steps.",
    )
    parser.add_argument(
        "--octree-resolution",
        type=int,
        default=256,
        help="Mesh octree resolution.",
    )
    parser.add_argument(
        "--num-chunks",
        type=int,
        default=8000,
        help="Volume decoding chunk count.",
    )
    parser.add_argument(
        "--guidance-scale",
        type=float,
        default=5.0,
        help="Classifier-free guidance scale.",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    backend_root = Path(__file__).resolve().parents[1]
    repo = (backend_root / args.repo).resolve()
    image = (backend_root / args.image).resolve()
    output = (backend_root / args.output).resolve()

    if not repo.exists():
        raise FileNotFoundError(f"Hunyuan3D repo not found: {repo}")
    if not image.exists():
        raise FileNotFoundError(f"Input image not found: {image}")

    sys.path.insert(0, str(repo / "hy3dshape"))

    from hy3dshape.pipelines import Hunyuan3DDiTFlowMatchingPipeline

    print(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"GPU: {torch.cuda.get_device_name(0)}")
        print(
            "VRAM:",
            round(torch.cuda.get_device_properties(0).total_memory / 1024**3, 2),
            "GB",
        )

    start = time.time()
    pipeline = Hunyuan3DDiTFlowMatchingPipeline.from_pretrained(
        "tencent/Hunyuan3D-2.1"
    )
    print("Model load seconds:", round(time.time() - start, 1))

    if torch.cuda.is_available():
        torch.cuda.reset_peak_memory_stats()

    start = time.time()
    mesh = pipeline(
        image=str(image),
        num_inference_steps=args.steps,
        guidance_scale=args.guidance_scale,
        octree_resolution=args.octree_resolution,
        num_chunks=args.num_chunks,
        output_type="trimesh",
        enable_pbar=True,
    )[0]

    output.parent.mkdir(parents=True, exist_ok=True)
    mesh.export(output)

    print("Generation seconds:", round(time.time() - start, 1))
    if torch.cuda.is_available():
        print(
            "Peak allocated VRAM:",
            round(torch.cuda.max_memory_allocated() / 1024**3, 2),
            "GB",
        )
    print(f"Saved: {output}")
    print(f"File size: {round(output.stat().st_size / 1024 / 1024, 2)} MB")


if __name__ == "__main__":
    main()
