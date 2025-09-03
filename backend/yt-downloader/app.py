from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from controllers.getVideoInfo import get_video_info
from controllers.download_video import download_video
import os

app = Flask(__name__)
CORS(app)
@app.route('/download', methods=['POST'])
def download_route():
    """
    Route: /download
    Method: POST
    Description: Downloads a video/audio based on URL and format.
    Request JSON: { "url": "<video_url>", "format": "<format_id>", "is_video": true/false }
    Response: Streams the file back to the client.
    """
    data = request.json
    url = data.get("url")
    format_id = data.get("format")
    ext = data.get("ext")
    print(url,format_id,ext)
    if not url or not format_id:
        return {"error": "Missing 'url' or 'format'"}, 400

    return download_video(url, format_id,ext)

@app.route('/info', methods=['GET'])
def info_route():
    """
    Route: /info
    Method: GET
    Description: Fetches metadata of a video or playlist without downloading.
    Query Params: ?url=<video_url>
    Response: JSON metadata of the video or playlist.
    """
    url = request.args.get("url")
    if not url:
        return jsonify({"error": "Missing 'url'"}), 400

    try:
        info = get_video_info(url)
        return jsonify(info)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=7000, debug=True)
