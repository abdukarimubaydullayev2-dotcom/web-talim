Current frontend build: python authoring/build_frontend_resources.py
Install dependencies: python-docx and beautifulsoup4.
frontend-before-rebalance.json preserves the previous published learning resources.
rebalance_frontend.py combines HTML into eight lessons and adds six staged JavaScript practice lessons.
The uploaded original plan remains materials/m5-frontend-reja.docx; the revised allocation is materials/m5-frontend-yangilangan-reja.docx.
Historical scripts frontend_content.py, frontend_sequence.py, frontend_videos.py, and build_frontend_before_rebalance.py describe the earlier numbering; do not use them to overwrite the current revision.
frontend-video-selection.json stores curated video overrides in the current numbering and is applied by the canonical builder. select_frontend_videos.py updates only video metadata without rebuilding documents. Selection uses the authors' public titles/descriptions, not a full playback review; coverage notes distinguish supporting videos from complete topic coverage.
