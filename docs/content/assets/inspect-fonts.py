"""Optional evidence replay: uv run --no-project --with fonttools --with brotli python this-file."""
import hashlib
import json
from pathlib import Path
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[3]
evidence = []
for path in sorted((root / "docs/upstream/base-ui/docs/public/fonts").glob("*.woff2")):
    font = TTFont(path)
    names = sorted({(n.nameID, n.toUnicode()) for n in font["name"].names
                    if n.nameID in (0, 1, 8, 9, 11, 13, 14)})
    evidence.append({"capturedPath": str(path.relative_to(root)),
                     "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                     "names": [{"nameID": key, "text": text} for key, text in names],
                     "axes": [{"tag": axis.axisTag, "min": axis.minValue,
                               "default": axis.defaultValue, "max": axis.maxValue}
                              for axis in font["fvar"].axes] if "fvar" in font else []})
print(json.dumps(evidence, indent=2))
