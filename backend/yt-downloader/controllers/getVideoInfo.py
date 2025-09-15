import yt_dlp
import os

def get_video_info(url: str):
    """
    Extract video metadata without downloading, using cookies if available.
    
    Args:
        url (str): YouTube video or playlist URL.
    
    Returns:
        info (dict): Metadata about the video/playlist.
    """
    # Path to cookie file
    cookie_file = os.path.join(os.getcwd(), "cookie.txt")
    print(cookie_file)
    # yt-dlp options with cookies
    ydl_opts = {
        'quiet': True,
        'cookiefile': cookie_file,  # Use cookies from cookie.txt
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
    return info
