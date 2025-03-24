import os
import json
import shutil
import sys
import csv
import time

def create_lite_version(csv_file, original_dir, lite_dir, icon_source_dir):
    startTime = time.time()
    extra_files = []
    
    print("Reading exclude file...")
    with open(csv_file, 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            extra_files.extend(row)
            
    print("Copying files from main to lite...")
    if not os.path.exists(lite_dir):
        os.makedirs(lite_dir)
        
    for item in os.listdir(original_dir):
        src = os.path.join(original_dir, item)
        dst = os.path.join(lite_dir, item)
        if os.path.isdir(src):
            shutil.copytree(src, dst)
        else:
            shutil.copy2(src, dst)
    
    print("Removing non-lite files from lite directory...")
    for file in extra_files:
        file_path = os.path.join(lite_dir, file)
        if os.path.exists(file_path):
            os.remove(file_path)
    
    print("Updating lite manifest...")
    manifest_path = os.path.join(lite_dir, 'manifest.json')
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)

    if 'content_scripts' in manifest:
        for content_script in manifest['content_scripts']:
            if 'js' in content_script:
                content_script['js'] = [script for script in content_script['js'] if script not in extra_files]
            if 'css' in content_script:
                content_script['css'] = [style for style in content_script['css'] if style not in extra_files]
                
    manifest['name'] = 'Smartschool++ Lite'
        
    manifest['description'] = 'A lite, school friendly version of Smartschool++'
    
    manifest['lite_mode'] = True
    
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=4)

    print("Updating icons...")
    
    if os.path.exists(icon_source_dir):
        for icon_file in os.listdir(icon_source_dir):
            src_icon = os.path.join(icon_source_dir, icon_file)
            dst_icon = os.path.join(lite_dir, icon_file)
            shutil.copy2(src_icon, dst_icon)
    else:
        print(f"Icon source directory {icon_source_dir} does not exist. Skipping icon swap.")

    print(f"Lite version created in {lite_dir}, in:", round(time.time() - startTime), "seconds")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python create_lite_version.py <csv_file> <original_dir> <lite_dir>")
        sys.exit(1)

    csv_file = sys.argv[1]
    original_dir = sys.argv[2]
    lite_dir = sys.argv[3]
    icon_source_dir = sys.argv[4]
    
    create_lite_version(csv_file, original_dir, lite_dir, icon_source_dir)