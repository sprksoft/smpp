import os
import json
import shutil
import sys

# Files/folders to never include in any build
ALWAYS_EXCLUDE_DIRS = {
    '.git', '.github', 'node_modules', '__pycache__',
    'build', '.vscode', '.idea'
}

ALWAYS_EXCLUDE_FILES = {
    '.gitignore', '.gitattributes', '.DS_Store',
    'package-lock.json', 'yarn.lock'
}

# Only these extensions are allowed inside the media folder
IMAGE_EXTENSIONS = {
    '.png', '.jpg', '.jpeg', '.gif', '.webp',
    '.svg', '.ico', '.bmp', '.avif'
}


def is_image(filename):
    _, ext = os.path.splitext(filename)
    return ext.lower() in IMAGE_EXTENSIONS


def copy_extension(src_dir, dst_dir, is_lite, lite_icon_source_dir):
    src_dir = os.path.abspath(src_dir)
    dst_dir = os.path.abspath(dst_dir)

    build_type = "lite" if is_lite else "main"
    print(f"\nBuilding {build_type} version...")
    print(f"  Source : {src_dir}")
    print(f"  Output : {dst_dir}")

    if os.path.exists(dst_dir):
        print(f"  Cleaning existing output directory...")
        shutil.rmtree(dst_dir)
    os.makedirs(dst_dir)

    for root, dirs, files in os.walk(src_dir):
        rel_root = os.path.relpath(root, src_dir)
        if rel_root == '.':
            rel_root = ''

        # Filter out dirs we never want
        dirs[:] = [
            d for d in dirs
            if d not in ALWAYS_EXCLUDE_DIRS
        ]

        in_media = rel_root == 'media' or rel_root.startswith('media' + os.sep)

        dst_root = os.path.join(dst_dir, rel_root)
        os.makedirs(dst_root, exist_ok=True)

        for file in files:
            if file in ALWAYS_EXCLUDE_FILES:
                continue

            # In media folders, only copy image files
            if in_media and not is_image(file):
                print(f"  [skip]  {os.path.join(rel_root, file)}  (non-image in media)")
                continue

            src_file = os.path.join(root, file)
            dst_file = os.path.join(dst_root, file)
            shutil.copy2(src_file, dst_file)
            print(f"  [copy]  {os.path.join(rel_root, file)}")

    # Patch manifest for lite build
    manifest_path = os.path.join(dst_dir, 'manifest.json')
    if os.path.exists(manifest_path):
        patch_manifest(manifest_path, is_lite)

    # Replace icons for lite build
    if is_lite and lite_icon_source_dir and os.path.exists(lite_icon_source_dir):
        replace_lite_icons(dst_dir, lite_icon_source_dir)

    print(f"\n  {build_type.capitalize()} build complete: {dst_dir}")


def patch_manifest(manifest_path, is_lite):
    print(f"  Patching manifest...")
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)

        if is_lite:
            manifest['name'] = 'Smartschool++ Lite'
            manifest['description'] = 'A lite, school friendlier version of Smartschool++'

        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=4)
    except Exception as e:
        print(f"  Warning: Could not patch manifest: {e}")


def replace_lite_icons(dst_dir, lite_icon_source_dir):
    icons_dir = os.path.join(dst_dir, 'media', 'icons', 'smpp')
    os.makedirs(icons_dir, exist_ok=True)
    print(f"  Replacing lite icons from: {lite_icon_source_dir}")
    for icon_file in os.listdir(lite_icon_source_dir):
        if not is_image(icon_file):
            continue
        src = os.path.join(lite_icon_source_dir, icon_file)
        dst = os.path.join(icons_dir, icon_file)
        shutil.copy2(src, dst)
        print(f"  [icon]  {icon_file}")


if __name__ == "__main__":
    script_dir  = os.path.dirname(os.path.abspath(__file__))
    src_dir     = os.path.join(script_dir, '..', 'extension')
    main_out    = os.path.join(script_dir, 'smpp')
    lite_out    = os.path.join(script_dir, 'smpp-lite')
    lite_icons  = os.path.join(script_dir, 'liteicons')

    if not os.path.exists(src_dir):
        print(f"Error: extension folder not found at {os.path.abspath(src_dir)}")
        sys.exit(1)

    copy_extension(src_dir, main_out, is_lite=False, lite_icon_source_dir=None)
    copy_extension(src_dir, lite_out, is_lite=True,  lite_icon_source_dir=lite_icons)

    print("\nBuild process completed successfully!")