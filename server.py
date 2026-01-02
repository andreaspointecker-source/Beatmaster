import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent
DATA_DIR = ROOT_DIR / "data"
DEFAULT_FILE = DATA_DIR / "default-songs.json"
ADDED_FILE = DATA_DIR / "added-songs.json"


class BeatMasterHandler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path == "/api/songs/update":
            self.handle_song_update()
            return
        if self.path == "/api/songs/add":
            self.handle_song_add()
            return

        self.send_error(404, "Not found")

    def do_GET(self):
        if self.path == "/api/songs/all":
            self.handle_song_list()
            return

        super().do_GET()

    def _read_json(self, path):
        if not path.exists():
            return []
        return json.loads(path.read_text(encoding="utf-8-sig"))

    def _write_json(self, path, data):
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")

    def handle_song_list(self):
        try:
            default_songs = self._read_json(DEFAULT_FILE)
            added_songs = self._read_json(ADDED_FILE)
        except Exception:
            self.send_error(500, "Failed to read songs")
            return

        combined = default_songs + added_songs
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(combined).encode("utf-8"))

    def handle_song_add(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length).decode("utf-8")
            payload = json.loads(body)
        except Exception:
            self.send_error(400, "Invalid JSON")
            return

        title = (payload.get("title") or "").strip()
        artist = (payload.get("artist") or "").strip()
        youtube_id = (payload.get("youtubeId") or "").strip()

        if not title or not artist or not youtube_id:
            self.send_error(400, "Missing fields")
            return

        try:
            added_songs = self._read_json(ADDED_FILE)
        except Exception:
            self.send_error(500, "Failed to read added songs")
            return

        added_songs.append(payload)

        try:
            self._write_json(ADDED_FILE, added_songs)
        except Exception:
            self.send_error(500, "Failed to write added songs")
            return

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"success": True}).encode("utf-8"))

    def handle_song_update(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            body = self.rfile.read(length).decode("utf-8")
            payload = json.loads(body)
        except Exception:
            self.send_error(400, "Invalid JSON")
            return

        original_title = (payload.get("originalTitle") or "").strip()
        original_artist = (payload.get("originalArtist") or "").strip()
        original_year = payload.get("originalYear")
        updates = payload.get("updates") or {}

        if not original_title or not original_artist:
            self.send_error(400, "Missing fields")
            return

        try:
            default_songs = self._read_json(DEFAULT_FILE)
            added_songs = self._read_json(ADDED_FILE)
        except Exception:
            self.send_error(500, "Failed to read songs")
            return

        def match_song(song):
            if (song.get("title") or "").strip() != original_title:
                return False
            if (song.get("artist") or "").strip() != original_artist:
                return False
            if original_year is not None and str(song.get("year")) != str(original_year):
                return False
            return True

        updated = False
        for collection, path in ((default_songs, DEFAULT_FILE), (added_songs, ADDED_FILE)):
            index = None
            for i, song in enumerate(collection):
                if match_song(song):
                    index = i
                    break
            if index is None:
                continue
            for key in [
                "title",
                "artist",
                "year",
                "genre",
                "album",
                "youtubeId",
                "startTime",
                "duration",
                "difficulty",
                "tags",
                "verified",
                "id",
            ]:
                if key in updates:
                    collection[index][key] = updates[key]
            try:
                self._write_json(path, collection)
            except Exception:
                self.send_error(500, "Failed to write songs")
                return
            updated = True
            break

        if not updated:
            self.send_error(404, "Song not found in songs files")
            return

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"success": True}).encode("utf-8"))


def main():
    server = ThreadingHTTPServer(("0.0.0.0", 8888), BeatMasterHandler)
    print("Server gestartet auf Port 8888")
    print("Oeffne im Browser: http://localhost:8888")
    server.serve_forever()


if __name__ == "__main__":
    main()
