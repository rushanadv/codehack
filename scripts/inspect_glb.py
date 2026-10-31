import json
import struct
import trimesh

with open("public/models/bloom_ultra.glb", "rb") as f:
    magic, version, length = struct.unpack("<4sII", f.read(12))
    chunk_len, chunk_type = struct.unpack("<I4s", f.read(8))
    json_bytes = f.read(chunk_len)
    gltf = json.loads(json_bytes.decode("utf-8"))

print(f"Meshes count: {len(gltf.get('meshes', []))}")
print(f"Nodes count: {len(gltf.get('nodes', []))}")
print(f"Materials ({len(gltf.get('materials', []))}):")
for i, m in enumerate(gltf.get("materials", [])):
    name = m.get("name")
    print(f"  [{i}] {name}:")
    pbr = m.get("pbrMetallicRoughness", {})
    print(f"      baseColor: {pbr.get('baseColorFactor')}, metallic: {pbr.get('metallicFactor')}, roughness: {pbr.get('roughnessFactor')}")
    print(f"      emissive: {m.get('emissiveFactor')}")
    if "extensions" in m:
        for ext_name, ext_val in m["extensions"].items():
            print(f"        {ext_name}: {ext_val}")

print("Extensions used:", gltf.get("extensionsUsed", []))
print("Extensions required:", gltf.get("extensionsRequired", []))
print("Textures count:", len(gltf.get("textures", [])))
print("Images count:", len(gltf.get("images", [])))

scene = trimesh.load("public/models/bloom_ultra.glb")
print(f"Scene bounds: min={scene.bounds[0]}, max={scene.bounds[1]}")
print(f"Scene extents: {scene.extents}")
print(f"Scene centroid: {scene.centroid}")
