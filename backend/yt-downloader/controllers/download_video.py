from flask import Response, jsonify
import yt_dlp
import requests
import os
import base64

def download_video(url: str, format_id: str, ext: str):
    try:
        # Decode YOUTUBE_COOKIE from .env safely in binary mode
        cookie_base64 = os.getenv("YOUTUBE_COOKIE")
        cookies_file_path = None

        if cookie_base64:
            # Decode base64 to bytes
            cookies_data = base64.b64decode(cookie_base64)
            # Write bytes directly to cookies.txt (preserves Netscape format)
            with open("cookies.txt", "wb") as f:
                f.write(cookies_data)
            cookies_file_path = "cookies.txt"

        # yt-dlp options
        ydl_opts = {
            'format': format_id,
            'quiet': True,
            'merge_output_format': ext,
        }
        if cookies_file_path:
            ydl_opts['cookiefile'] = cookies_file_path

        # Extract video info without downloading
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            stream_url = info.get("url")
            filesize = info.get("filesize") or info.get("filesize_approx")

        # Stream directly from YouTube to client
        def generate():
            with requests.get(stream_url, stream=True) as r:
                r.raise_for_status()
                for chunk in r.iter_content(chunk_size=1024 * 64):  # 64 KB chunks
                    if chunk:
                        yield chunk

        # Video/audio mimetype
        mimetype = f"video/{ext}" if ext in ["mp4", "webm"] else "audio/mpeg"

        return Response(
            generate(),
            mimetype=mimetype,
            headers={
                "Content-Disposition": f"attachment; filename=video.{ext}",
                "Content-Length": str(filesize) if filesize else None
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
