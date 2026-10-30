# Slotly Bloom 3D Asset Generator

This offline tool generates the procedural `slotly_bloom.glb` asset and its corresponding PBR textures.

## Requirements
```bash
pip install -r tools/3d/requirements.txt
```

## Usage
To regenerate the GLB asset to an experimental directory without overwriting the production asset:
```bash
python tools/3d/generate_slotly_bloom.py --output-dir ./slotly_bloom_output
```

> **Note:** This generator is an offline generation utility and does not execute during browser runtime or Next.js builds. The production application directly loads `public/models/slotly_bloom.glb`.

