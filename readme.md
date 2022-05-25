# Prepis

## Installing

1. `git clone git@github.com:Delemangi/prepis.git`
2. `cd prepis`
3. `npm install`

## Starting

1. `npm run start`

## Configuration

1. Create a `config.json` file in the project directory. It should have the following structure:

```json
{
    "token": "your_bot_token",
    "channel": "discord_channel_id",
    "modes": [
        "theory",
        "practical",
        "exercises",
        "etc"
    ]
}
```

2. Create an `assets` folder in the project directory, and create folders with any name for the image sets. Put all images in the corresponding folders. The folder names should be specified in the `modes` property in `config.json`.

## Converting color images to grayscale

1. Put all images in the `image-processor/input` folder
2. `python image_processor.py`
3. Retrieve all images from `image-processor/output`

This may take a while to complete.

## Shortcuts

* Move to left image: `a`, `left arrow`
* Move to right image: `d`, `right arrow`
* Increase opacity: `w`, `up arrow`
* Decrease opacity: `s`, `down arrow`
* Toggle visibility: `q`, `escape`
* Switch tabs: `m`
* Send message: `enter`
