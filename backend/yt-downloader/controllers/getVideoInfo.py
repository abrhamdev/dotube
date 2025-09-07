import yt_dlp

def get_video_info(url: str):
    """
    Extract video metadata without downloading.
    
    Args:
        url (str): YouTube video or playlist URL.
    
    Returns:
        info (dict): Metadata about the video/playlist.
    """
    with yt_dlp.YoutubeDL({'quiet': True}) as ydl:
        info = ydl.extract_info(url, download=False)
    return info