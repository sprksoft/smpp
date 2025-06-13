import os
import json
import shutil
import sys
import csv
import stat


def should_skip(item, exclude_files, root=''):
    full_path = os.path.join(root, item) if root else item
    return full_path in exclude_files

def build_main(original_dir, build_dir, excluded_files_csv):
    original_dir = os.path.abspath(original_dir)
    build_dir = os.path.abspath(build_dir)

    print(f"Building main version from: {original_dir}")
    print(f"Output directory: {build_dir}")

    exclude_files = set()
    with open(excluded_files_csv, 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            exclude_files.update(row)

    if os.path.exists(build_dir):
        print("Cleaning existing build directory...")
        shutil.rmtree(build_dir)

    os.makedirs(build_dir, exist_ok=True)

    print("Copying files...")
    for root, dirs, files in os.walk(original_dir):
        rel_root = os.path.relpath(root, original_dir)
        if rel_root == '.':
            rel_root = ''

        dirs[:] = [d for d in dirs if not should_skip(d, exclude_files, rel_root)]

        dst_root = os.path.join(build_dir, rel_root)
        if not os.path.exists(dst_root):
            os.makedirs(dst_root)

        spaces = ""
        go_up = True
        for file in files:
            if go_up:
                spaces += " "
            else:
                spaces = spaces [0:len(spaces)-1]
            if len(spaces)>5:
                go_up = False
            elif len(spaces)<1:
                go_up = True
            if should_skip(file, exclude_files, rel_root):
                continue
            src_file = os.path.join(root, file)
            dst_file = os.path.join(dst_root, file)
            shutil.copy2(src_file, dst_file)
            print(f"{spaces}Copying {src_file}...")

    print(f"Main build complete: {build_dir}")

def build_lite(excluded_lite_files_csv, original_dir, lite_build_dir, icon_source_dir, excluded_files_csv):
    original_dir = os.path.abspath(original_dir)
    lite_build_dir = os.path.abspath(lite_build_dir)
    icon_source_dir = os.path.abspath(icon_source_dir)

    print(f"Building lite version from: {original_dir}")
    print(f"Output directory: {lite_build_dir}")
    print(f"Icon source: {icon_source_dir}")

    exclude_files = set()
    with open(excluded_files_csv, 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            exclude_files.update(row)

    lite_exclude_files = set()
    with open(excluded_lite_files_csv, 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            lite_exclude_files.update(row)

    exclude_files.update(lite_exclude_files)

    if os.path.exists(lite_build_dir):
        print("Cleaning existing lite directory...")
        shutil.rmtree(lite_build_dir)

    os.makedirs(lite_build_dir, exist_ok=True)

    print("Copying files...")
    for root, dirs, files in os.walk(original_dir):
        rel_root = os.path.relpath(root, original_dir)
        if rel_root == '.':
            rel_root = ''

        dirs[:] = [d for d in dirs if not should_skip(d, exclude_files, rel_root)]

        dst_root = os.path.join(lite_build_dir, rel_root)
        if not os.path.exists(dst_root):
            print(f"Making {dst_root}...")
            os.makedirs(dst_root)

        spaces = ""
        go_up = True
        for file in files:
            if go_up:
                spaces += " "
            else:
                spaces = spaces [0:len(spaces)-1]
            if len(spaces)>5:
                go_up = False
            elif len(spaces)<1:
                go_up = True
            if should_skip(file, exclude_files, rel_root):
                continue
            src_file = os.path.join(root, file)
            dst_file = os.path.join(dst_root, file)

            print(f"{spaces}Copying {src_file}...")
            shutil.copy2(src_file, dst_file)

    print("Updating manifest...")
    manifest_path = os.path.join(lite_build_dir, 'manifest.json')
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest = json.load(f)

        if 'content_scripts' in manifest:
            for content_script in manifest['content_scripts']:
                if 'js' in content_script:
                    content_script['js'] = [script for script in content_script['js'] if script not in lite_exclude_files]
                if 'css' in content_script:
                    content_script['css'] = [style for style in content_script['css'] if style not in lite_exclude_files]

        manifest['name'] = 'Smartschool++ Lite'
        manifest['description'] = 'A lite, school friendlier version of Smartschool++'
        manifest['lite_mode'] = True

        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=4)
    except Exception as e:
        print(f"Error updating manifest: {e}")
        
    print("Updating icons...")
    icons_dir = os.path.join(lite_build_dir, 'icons')
    os.makedirs(icons_dir, exist_ok=True)

    if os.path.exists(icon_source_dir):
        for icon_file in os.listdir(icon_source_dir):
            src_icon = os.path.join(icon_source_dir, icon_file)
            dst_icon = os.path.join(icons_dir, icon_file)
            shutil.copy2(src_icon, dst_icon)
    else:
        print(f"Warning: Icon directory not found at {icon_source_dir}")


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    original_dir = os.path.join(script_dir, "..")
    excluded_files_csv = os.path.join(script_dir, "excluded-files.csv")
    main_build_dir = os.path.join(script_dir, "smpp-build")
    excluded_lite_files_csv = os.path.join(script_dir, "excluded-from-lite.csv")
    lite_build_dir = os.path.join(script_dir, "smpp-lite-build")
    icon_source_dir = os.path.join(script_dir, "liteicons")

    if not os.path.exists(original_dir):
        print(f"Error: Source directory not found at {original_dir}")
        sys.exit(1)

    if not os.path.exists(excluded_lite_files_csv):
        print(f"Error: Exclusion file not found at {excluded_lite_files_csv}")
        sys.exit(1)

    build_main(original_dir, main_build_dir, excluded_files_csv)
    build_lite(excluded_lite_files_csv, original_dir, lite_build_dir, icon_source_dir, excluded_files_csv)
    print("\nBuild process completed successfully!")
