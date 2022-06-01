// @ts-nocheck
const fs = require('fs');
const discord = require('discord.js');
const electron = require('electron');
const config = require('./config.json');

const messagesSelector = 'div#messages';
const statusSymbol = '•';

const modes = config.modes;
const assets = {};

for (const mode of modes) {
  assets[mode] = fs.readdirSync(`./assets/${mode}`).map((file) => `./assets/${mode}/${file}`);
}

let client;

function createDiscordBot () {
  if (client) {
    client.destroy();
  }

  client = new discord.Client({
    intents: [
      discord.Intents.FLAGS.GUILD_MESSAGES,
      discord.Intents.FLAGS.GUILDS
    ]
  });

  client.on('messageCreate', (message) => {
    if (message.author.bot) {
      return;
    }

    if (!config.channels.includes(message.channel.id)) {
      return;
    }

    receiveMessage(message);
  });

  client.on('error', (error) => {
    showStatusMessage(error.message);
  });

  client.on('warn', (message) => {
    showStatusMessage(message);
  });

  client.login(config.token).then(() => showStatusMessage('Discord bot logged in.'));
}

function showStatusMessage (message) {
  const messages = document.querySelector(messagesSelector);

  const element = document.createElement('p');
  element.classList.add('message', 'status');
  element.textContent = ` ${statusSymbol} ${message}`;

  messages.append(element);
}

function sendMessage (message) {
  for (const channel of config.channels) {
    client.channels.cache.get(channel).send(message);
  }

  const messages = document.querySelector(messagesSelector);

  const element = document.createElement('p');
  element.classList.add('message');
  element.textContent = `[${new Date().toTimeString().split(' ')[0]}] Me: ${message}`;

  messages.append(element);
  messages.scrollTop = messages.scrollHeight;
}

function receiveMessage (message) {
  const messages = document.querySelector(messagesSelector);
  const element = document.createElement('p');
  element.classList.add('message');

  const images = getImages(message.content);
  let string = message.content;

  element.textContent = `[${message.createdAt.toTimeString().split(' ')[0]}] ${message.author.tag}: ${string}`;

  if (images) {
    for (const image of images) {
      const img = document.createElement('img');
      img.classList.add('message-image');
      img.src = image;
      element.append(img);

      string = string.replaceAll(image, '');
    }
  }

  for (const attachment of message.attachments) {
    const img = document.createElement('img');
    img.classList.add('message-image');
    img.src = attachment[1].url;
    element.append(img);
  }

  messages.append(element);
  messages.scrollTop = messages.scrollHeight;
}

function getImages (url) {
  return url.match(/https?.+\.(png|jpg|jpeg|bmp|gif)/gu);
}

function hide () {
  electron.ipcRenderer.send('hide');
}

electron.contextBridge.exposeInMainWorld('assets', assets);
electron.contextBridge.exposeInMainWorld('modes', {modes});
electron.contextBridge.exposeInMainWorld('messages', {sendMessage});
electron.contextBridge.exposeInMainWorld('discord', {createDiscordBot});
electron.contextBridge.exposeInMainWorld('config', {config});
electron.contextBridge.exposeInMainWorld('hide', {hide});

createDiscordBot();
