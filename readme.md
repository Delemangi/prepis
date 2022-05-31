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

This may take a while to complete depending on the amount of images. It's supposed to make them less visible against a light background.

## Chat

The chat feature requires a Discord bot. Create one [here](https://discord.com/developers/applications) and put its token in the `token` property in `config.json`.

Invite the bot to a server and choose a text channel in which the bot listens for messages by coping its ID and putting it in the `channel` property in `config.json`.

## Shortcuts

* Move to left image: `a`, `left arrow`
* Move to right image: `d`, `right arrow`
* Increase opacity: `w`, `up arrow`
* Decrease opacity: `s`, `down arrow`
* Toggle visibility: `q`, `escape`
* Switch tabs: `m`
* Send message: `enter`
* Toggle chat image visibility: `b`
