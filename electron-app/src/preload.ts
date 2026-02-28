import * as discord from 'discord.js';
import * as electron from 'electron';
import * as fs from 'node:fs';

import config from '../config.json' with { type: 'json' };

const messagesSelector = 'div#messages';
const statusSymbol = '•';

const modes = config.config.modes;
const assets: { [key: string]: string[] } = {};

for (const mode of modes) {
  assets[mode] = fs.readdirSync(`./assets/${mode}`).map((file) => `./assets/${mode}/${file}`);
}

let client: discord.Client | undefined;

const getImages = (url: string): null | string[] => url.match(/https?:\/\/\S+\.(?:bmp|gif|jpeg|jpg|png)/gu);

const showStatusMessage = (message: string): void => {
  const messages = document.querySelector(messagesSelector);

  if (!messages) {
    return;
  }

  const element = document.createElement('p');
  element.classList.add('message', 'status');
  element.textContent = ` ${statusSymbol} ${message}`;

  messages.append(element);
};

const receiveMessage = (message: discord.Message): void => {
  const messages = document.querySelector(messagesSelector);

  if (!messages) {
    return;
  }

  const element = document.createElement('p');
  element.classList.add('message');

  const images = getImages(message.content);
  let string = message.content.trim();

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
};

const sendMessage = (text: string): void => {
  const message = text.trim();

  if (!client) {
    return;
  }

  for (const channel of config.config.channels) {
    const channelObj = client.channels.cache.get(channel);
    if (channelObj?.isTextBased()) {
      void (channelObj as discord.TextChannel).send(message);
    }
  }

  const messages = document.querySelector(messagesSelector);

  if (!messages) {
    return;
  }

  const element = document.createElement('p');
  element.classList.add('message');
  element.textContent = `[${new Date().toTimeString()
    .split(' ')[0]}] Me: ${message}`;

  messages.append(element);
  messages.scrollTop = messages.scrollHeight;
};

const hide = (): void => {
  electron.ipcRenderer.send('hide');
};

const createDiscordBot = (): void => {
  if (client) {
    void client.destroy();
  }

  client = new discord.Client({
    intents: [
      discord.GatewayIntentBits.GuildMessages,
      discord.GatewayIntentBits.Guilds,
      discord.GatewayIntentBits.MessageContent
    ]
  });

  client.on('messageCreate', (message: discord.Message) => {
    if (message.author.bot && !message.webhookId) {
      return;
    }

    if (!config.config.channels.includes(message.channel.id)) {
      return;
    }

    receiveMessage(message);
  });

  client.on('error', (error: Error) => {
    showStatusMessage(error.message);
  });

  client.on('warn', (message: string) => {
    showStatusMessage(message);
  });

  void client.login(config.config.token)
    .then(() => {
      showStatusMessage('Discord bot logged in.');

      // eslint-disable-next-line unicorn/no-useless-undefined
      return undefined;
    })
    .catch((error: unknown) => {
      showStatusMessage(`Discord login error: ${String(error)}`);
    });
};

electron.contextBridge.exposeInMainWorld('assets', assets);
electron.contextBridge.exposeInMainWorld('modes', { modes });
electron.contextBridge.exposeInMainWorld('messages', { sendMessage });
electron.contextBridge.exposeInMainWorld('discord', { createDiscordBot });
electron.contextBridge.exposeInMainWorld('config', { config });
electron.contextBridge.exposeInMainWorld('hide', { hide });

createDiscordBot();
