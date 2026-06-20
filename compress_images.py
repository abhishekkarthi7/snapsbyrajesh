import os
import sys
import subprocess

# Ensure Pillow is installed for image processing
try:
    from PIL import Image
except ImportError:
    print("Installing Pillow library for image processing...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image

def clean_and_rename_file(file_path):
    directory, filename = os.path.split(file_path)
    lower_name = filename.lower()
    
    # Check for double extensions like 1.jpg.jpeg, cover.jpg.jpg, etc.
    new_filename = None
    if ".jpg.jpeg" in lower_name:
        new_filename = filename.replace(".jpg.jpeg", ".jpg").replace(".JPG.JPEG", ".jpg")
    elif ".jpg.jpg" in lower_name:
        new_filename = filename.replace(".jpg.jpg", ".jpg").replace(".JPG.JPG", ".jpg")
    elif ".jpeg.jpeg" in lower_name:
        new_filename = filename.replace(".jpeg.jpeg", ".jpg").replace(".JPEG.JPEG", ".jpg")
    elif lower_name.endswith('.jpeg') and not lower_name.endswith('.jpg'):
        name_part, _ = os.path.splitext(filename)
        new_filename = name_part + ".jpg"

    if new_filename:
        new_path = os.path.join(directory, new_filename)
        # Handle case where target file already exists
        if os.path.exists(new_path) and new_path != file_path:
            try:
                os.remove(new_path)
            except:
                pass
        try:
            os.rename(file_path, new_path)
            print(f"Renamed: {filename} -> {new_filename}")
            return new_path
        except Exception as e:
            print(f"Failed to rename {filename}: {e}")
            return file_path
            
    return file_path

def compress_image(file_path):
    try:
        # First rename the file if it has double extensions
        file_path = clean_and_rename_file(file_path)
        
        orig_size = os.path.getsize(file_path)
        if orig_size < 100 * 1024:
            # Skip if already small (under 100KB)
            return
            
        with Image.open(file_path) as img:
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                img = img.convert('RGB')
            
            # Max width or height set to 1920px for web display
            max_size = 1920
            width, height = img.size
            if width > max_size or height > max_size:
                if width > height:
                    new_width = max_size
                    new_height = int((max_size / width) * height)
                else:
                    new_height = max_size
                    new_width = int((max_size / height) * width)
                img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
                print(f"Resized {os.path.basename(file_path)} from {width}x{height} to {new_width}x{new_height}")
            
            img.save(file_path, 'JPEG', quality=82, optimize=True)
            
        new_size = os.path.getsize(file_path)
        orig_mb = orig_size / (1024 * 1024)
        new_mb = new_size / (1024 * 1024)
        print(f"Compressed {os.path.basename(file_path)}: {orig_mb:.2f} MB -> {new_mb:.2f} MB (Saved {((orig_size - new_size)/orig_size)*100:.1f}%)")
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

def main():
    # Target assets folder
    assets_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
    if not os.path.exists(assets_dir):
        print(f"Assets directory not found at {assets_dir}")
        return

    print("Scanning assets folder for images to rename and compress...")
    processed_count = 0
    for root, dirs, files in os.walk(assets_dir):
        for file in files:
            lower_file = file.lower()
            if lower_file.endswith(('.jpg', '.jpeg', '.jpg.jpeg', '.jpg.jpg', '.jpeg.jpeg')):
                file_path = os.path.join(root, file)
                compress_image(file_path)
                processed_count += 1
                
    if processed_count == 0:
        print("No images found to process.")
    else:
        print(f"Finished processing {processed_count} images!")

if __name__ == '__main__':
    main()
