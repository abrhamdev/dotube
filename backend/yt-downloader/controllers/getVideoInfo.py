import yt_dlp
import os

def get_video_info(url: str):
    """
    Extract video metadata without downloading.

    Args:
        url (str): YouTube video or playlist URL.

    Returns:
        info (dict): Metadata about the video/playlist.
    """
    # Path to cookies.txt in the root directory
    cookies_file_path = os.path.join(os.getcwd(), "cookies.txt")
    ydl_opts = {
        'quiet': True,
    }
    if os.path.exists(cookies_file_path):
        ydl_opts['cookiefile'] = cookies_file_path

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
    return info
