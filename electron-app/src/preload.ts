import * as discord from 'discord.js';
import * as electron from 'electron';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { config } from './config.js';

const messagesSelector = 'div#messages';
const statusSymbol = '•';

const modes = config.modes;
const assets: Record<string, string[]> = {};

for (const mode of modes) {
  const dir = path.resolve(`../assets/${mode}`);
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- dir is derived from the trusted configured mode name under the fixed ../assets directory.
  assets[mode] = fs.readdirSync(dir).map((file) => `file://${path.join(dir, file).replaceAll('\\', '/')}`);
}

const state: { client: discord.Client | undefined } = {
  client: undefined
};

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

  element.textContent = `[${message.createdAt.toTimeString().split(' ', 1)[0]}] ${message.author.tag}: ${string}`;

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
  const { client } = state;

  if (!client) {
    return;
  }

  const message = text.trim();

  for (const channel of config.channels) {
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
  // eslint-disable-next-line unicorn/prefer-temporal -- Temporal is unavailable in this project's ES2021 lib target.
  element.textContent = `[${new Date().toTimeString()
    .split(' ', 1)[0]}] Me: ${message}`;

  messages.append(element);
  messages.scrollTop = messages.scrollHeight;
};

const hide = (): void => {
  electron.ipcRenderer.send('hide');
};

const createDiscordBot = async (): Promise<void> => {
  if (state.client) {
    void state.client.destroy();
  }

  const client = new discord.Client({
    intents: [
      discord.GatewayIntentBits.GuildMessages,
      discord.GatewayIntentBits.Guilds,
      discord.GatewayIntentBits.MessageContent
    ]
  });

  state.client = client;

  client.on('messageCreate', (message: discord.Message) => {
    if (message.author.bot && !message.webhookId) {
      return;
    }

    if (!config.channels.includes(message.channel.id)) {
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

  try {
    await client.login(config.token);
    showStatusMessage('Discord bot logged in.');
  } catch (error: unknown) {
    showStatusMessage(`Discord login error: ${String(error)}`);
  }
};

electron.contextBridge.exposeInMainWorld('assets', assets);
electron.contextBridge.exposeInMainWorld('modes', { modes });
electron.contextBridge.exposeInMainWorld('messages', { sendMessage });
electron.contextBridge.exposeInMainWorld('discord', { createDiscordBot });
electron.contextBridge.exposeInMainWorld('config', { config });
electron.contextBridge.exposeInMainWorld('hide', { hide });

// eslint-disable-next-line unicorn/prefer-top-level-await -- The preload must not block page load while the Discord bot connects in the background.
void createDiscordBot();
