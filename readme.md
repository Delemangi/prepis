# Prepis

This is a tool for cheating on exams that use a virtual camera. It hides a window behind the camera.

Supports image viewing and chatting through Discord.

It's meant for Windows, and it probably doesn't work (fully) on any other OS.

## Installing

1. `git clone git@github.com:Delemangi/prepis.git`
2. `cd prepis`
3. `npm install`

## Starting

1. `npm run start`

The terminal will remain on and frozen while running, so it's best to hide it on a different desktop (`Windows Key + Tab`).

## Configuration

1. Create a `config.json` file in the project directory. It should have the following structure:

    ```json
    {
        "token": "your_bot_token",
        "channels": [
            "discord_channel_id",
            "other_discord_channel_id"
        ],
        "modes": [
            "theory",
            "practical",
            "exercises"
        ],
        "x": 180,
        "y": 550,
        "width": 620,
        "height": 450
    }
    ```

    The `x` and `y` properties are the x and y offsets, respectively. The default values given here fit a one monitor 1080p setup.

2. Create an `assets` folder in the project directory, and create folders with any name for the image sets. Put all images in the corresponding folders. The folder names should be specified in the `modes` property in `config.json`.

3. For the PDF viewer, put a PDF file called `test.pdf` in the `assets` directory.

## Chat

The chat feature requires a Discord bot. Create one [here](https://discord.com/developers/applications) and put its token in the `token` property in `config.json`.

Invite the bot to a server and choose a text channel in which the bot listens for messages by coping its ID and adding it in the `channels` property in `config.json`.

## Converting color images to grayscale

1. Put all images in the `image-processor/input` folder
2. `python image_processor.py`
3. Retrieve all images from `image-processor/output`

This may take a while to complete depending on the amount of images. It's supposed to make them less visible against a light background.

## Window coordinates

Unfortunately there is no straightforward way to find the magic numbers, so you'll just have to try a few times until you're happy. The default configuration given above should be good for most cases.

## Shortcuts

* Move to left image: `a`, `left arrow`
* Move to right image: `d`, `right arrow`
* Increase opacity (main window only): `w`, `up arrow`
* Decrease opacity (main window only): `s`, `down arrow`
* Increase opacity (PDF window only): `alt + w`
* Decrease opacity (PDF window only): `alt + s`
* Toggle visibility (main window only): `escape`
* Toggle visibility (PDF window only): `shift + escape`
* Switch tabs: `m`
* Send message: `enter`
* Toggle chat image visibility: `b`

The shortcuts for toggling visiblity work even when the windows are not focused. All other shortcuts require focus.

When starting the app, by default the main window is revealed and the PDF window is hidden.
