import os
import json
import shutil
import sys
import csv
import time
import stat

def remove_readonly(func, path, _):
    """Clear the readonly bit and reattempt the removal"""
    os.chmod(path, stat.S_IWRITE)
    func(path)

def create_lite_version(csv_file, original_dir, lite_dir, icon_source_dir):
    startTime = time.time()
    extra_files = []
    
    # Convert all paths to absolute paths
    original_dir = os.path.abspath(original_dir)
    lite_dir = os.path.abspath(lite_dir)
    icon_source_dir = os.path.abspath(icon_source_dir)
    
    # Get the base name of the SMPPLITE directory to exclude it
    script_dir = os.path.dirname(os.path.abspath(__file__))
    smpplite_dir_name = os.path.basename(script_dir)
    
    print(f"Original directory: {original_dir}")
    print(f"Lite directory: {lite_dir}")
    print(f"Icon source: {icon_source_dir}")
    print(f"Excluding directory: {smpplite_dir_name}")
    
    print("Reading exclude file...")
    with open(csv_file, 'r') as f:
        reader = csv.reader(f)
        for row in reader:
            extra_files.extend(row)
            
    print("Copying files from main to lite...")
    
    # Clear destination directory if it exists
    if os.path.exists(lite_dir):
        print(f"Cleaning existing lite directory: {lite_dir}")
        try:
            shutil.rmtree(lite_dir, onerror=remove_readonly)
        except Exception as e:
            print(f"Error removing directory: {e}")
            sys.exit(1)
    
    os.makedirs(lite_dir, exist_ok=True)
    
    # List of directories to exclude from copying
    exclude_dirs = [smpplite_dir_name, 'smpp-lite-build', '.git']
    
    # Improved file copying with exclusions
    for item in os.listdir(original_dir):
        # Skip excluded directories
        if item in exclude_dirs:
            print(f"Skipping {item}")
            continue
            
        src = os.path.join(original_dir, item)
        dst = os.path.join(lite_dir, item)
        
        try:
            if os.path.isdir(src):
                shutil.copytree(src, dst)
            else:
                shutil.copy2(src, dst)
            print(f"Copied: {item}")
        except Exception as e:
            print(f"Error copying {item}: {str(e)}")
            continue
    
    print("Removing non-lite files from lite directory...")
    for file in extra_files:
        file_path = os.path.join(lite_dir, file)
        if os.path.exists(file_path):
            try:
                if os.path.isdir(file_path):
                    shutil.rmtree(file_path, onerror=remove_readonly)
                else:
                    os.chmod(file_path, stat.S_IWRITE)
                    os.remove(file_path)
                print(f"Removed: {file}")
            except Exception as e:
                print(f"Error removing {file}: {str(e)}")
    
    print("Updating lite manifest...")
    manifest_path = os.path.join(lite_dir, 'manifest.json')
    try:
        with open(manifest_path, 'r', encoding='utf-8') as f:
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
        
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=4)
    except Exception as e:
        print(f"Error updating manifest: {str(e)}")

    print("Updating icons...")
    if os.path.exists(icon_source_dir):
        for icon_file in os.listdir(icon_source_dir):
            try:
                src_icon = os.path.join(icon_source_dir, icon_file)
                dst_icon = os.path.join(lite_dir, icon_file)
                shutil.copy2(src_icon, dst_icon)
                print(f"Copied icon: {icon_file}")
            except Exception as e:
                print(f"Error copying icon {icon_file}: {str(e)}")
    else:
        print(f"Icon source directory {icon_source_dir} does not exist. Skipping icon swap.")

    print(f"Lite version created in {lite_dir}, in: {round(time.time() - startTime)} seconds")

if __name__ == "__main__":
    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    csv_file = os.path.join(script_dir, "excluded-files.csv")
    original_dir = os.path.join(script_dir, "..")  # Parent directory of script location
    lite_dir = os.path.join(script_dir, "smpp-lite-build")
    icon_source_dir = os.path.join(script_dir, "liteicons")
    
    # Verify paths exist
    if not os.path.exists(original_dir):
        print(f"Error: Original directory not found at {original_dir}")
        sys.exit(1)
    
    if not os.path.exists(csv_file):
        print(f"Error: CSV file not found at {csv_file}")
        sys.exit(1)
    
    create_lite_version(csv_file, original_dir, lite_dir, icon_source_dir)