import glob
import os
from pathlib import Path

import cv2
import numpy as np
import tqdm


def same_pixel_square(im, size):
    mask = np.full(im.shape, False, dtype=bool)
    for x in range(im.shape[0] - size):
        for y in range(im.shape[1] - size):
            if np.all(im[x:x + size, y:y + size] == im[x, y]):
                mask[x:x + size, y:y + size] = True
    return mask


INPUT_DIR = 'input'
OUTPUT_DIR = 'output'

input_dir = Path(INPUT_DIR)
output_dir = Path(OUTPUT_DIR)

output_dir.mkdir(parents=True, exist_ok=True)

image_paths = glob.glob(str(input_dir / '*.png'))

for image_path in tqdm.tqdm(image_paths):
    im_gray = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    mask = same_pixel_square(im_gray, 3)
    im_gray[mask & (im_gray > 100)] = 255
    im_out = cv2.cvtColor(im_gray, cv2.COLOR_GRAY2BGR)
    cv2.imwrite(str(output_dir / os.path.basename(image_path)), im_out)
