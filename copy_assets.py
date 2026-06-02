"""
SBR PHOTO - Offline Assets Copier & Downloader Utility
======================================================
This script copies cached high-fidelity images from the Gemini cache
and downloads premium cinematic stock videos to ./assets/ so the website 
can run completely offline with 0 delay and zero ISP blocks in India!

Usage:
1. Open terminal in the directory: cd "d:\\SBR PHOTO"
2. Run this script: python copy_assets.py
"""

import os
import shutil
import urllib.request
import urllib.error

# Cache source path
brain_dir = r"C:\Users\abhis\.gemini\antigravity-ide\brain\65caf9a3-2bd1-43d4-a91e-3255211c4875"
target_dir = r".\assets"

files_to_copy = [
    ("hero_bg_1780325952762.png", "hero_bg.png"),
    ("photographer_1780326005147.png", "photographer.png"),
    ("portrait_feat_1780326773193.png", "portrait_feat.png")
]

# Using custom offline assets (manually placed in the assets/ folder)
videos_to_download = [
    ("couple.mp4", ""),
    ("birthday.mp4", ""),
    ("drone.mp4", "")
]


def run_setup():
    os.makedirs(target_dir, exist_ok=True)
    print("==================================================")
    print("      SBR PHOTO - LOCAL ASSETS SETUP SYSTEM       ")
    print("==================================================")
    
    # 1. Copy cached images
    print("\n[1/2] Copying high-fidelity cached images...")
    images_copied = 0
    if not os.path.exists(brain_dir):
        print(f" -> Cache folder not found at: {brain_dir}")
        print("    (Images will successfully load from online CDN fallbacks in the browser)")
    else:
        for src_name, dest_name in files_to_copy:
            src_path = os.path.join(brain_dir, src_name)
            dest_path = os.path.join(target_dir, dest_name)
            
            if os.path.exists(src_path):
                try:
                    shutil.copy2(src_path, dest_path)
                    print(f" -> Copied successfully: {dest_name}")
                    images_copied += 1
                except Exception as e:
                    print(f" -> Error copying {dest_name}: {e}")
            else:
                print(f" -> Cached source file {src_name} not found.")

    # 2. Setup custom video placeholders
    print("\n[2/2] Setting up premium cinematic stock videos...")
    videos_downloaded = 0
    
    # Browser-like headers to bypass direct-linking blocks if needed
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        'Accept': '*/*'
    }
    
    for filename, url in videos_to_download:
        dest_path = os.path.join(target_dir, filename)
        
        # If the file already exists and is not 0 bytes, skip
        if os.path.exists(dest_path) and os.path.getsize(dest_path) > 100000:
            print(f" -> {filename} is ready in assets/ folder.")
            videos_downloaded += 1
            continue
            
        if not url:
            print(f" -> {filename} is a custom local asset. Please save your video as: {dest_path}")
            continue
            
        print(f" -> Downloading {filename}...")
        
        # Try Method 1: Clean stream without headers (Preferred by Google Cloud Storage)
        success = False
        try:
            with urllib.request.urlopen(url, timeout=30) as response, open(dest_path, 'wb') as out_file:
                shutil.copyfileobj(response, out_file)
            print(f"    - Downloaded successfully (direct stream): {filename}")
            videos_downloaded += 1
            success = True
        except Exception as e:
            # If forbidden or failed, try Method 2: Browser-handshake headers
            pass

        if not success:
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=30) as response, open(dest_path, 'wb') as out_file:
                    shutil.copyfileobj(response, out_file)
                print(f"    - Downloaded successfully (browser headers): {filename}")
                videos_downloaded += 1
                success = True
            except urllib.error.URLError as e:
                print(f"    - URL Error downloading {filename}: {e.reason}")
            except Exception as e:
                print(f"    - Error downloading {filename}: {e}")


    print("\n==================================================")
    print("                  SETUP COMPLETE                  ")
    print("==================================================")
    print(f" -> Images copied: {images_copied}/{len(files_to_copy)}")
    print(f" -> Videos downloaded: {videos_downloaded}/{len(videos_to_download)}")
    print("==================================================")

if __name__ == "__main__":
    run_setup()
