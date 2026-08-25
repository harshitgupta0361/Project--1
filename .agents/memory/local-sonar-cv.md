---
name: Local sonar computer vision
description: The prototype uses server-side Sharp processing for uploaded sonar images while keeping inference explicitly non-ML.
---

The sonar prototype's trustworthy demo path is classical computer vision: decode the real upload, grayscale and normalize it, blur for noise reduction, threshold bright regions, and use connected components to produce measurable candidate boxes and evidence. It must be labelled as a Computer Vision Prototype rather than a trained model.

**Why:** A fixed loading animation and predetermined scores undermine the central hackathon demonstration, while a lightweight deterministic pipeline is feasible without model training or external services.

**How to apply:** Keep the analyzer behind a replaceable route/service boundary so a trained YOLO or U-Net implementation can later return the same processed-image and detection contract.