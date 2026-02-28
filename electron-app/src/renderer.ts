/**
 * Tabs:
 * 0 - Image Viewer
 * 1 - Chat
 */

// https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values

import type { Config } from './json';

type WindowExtensions = {
  assets: { [key: string]: string[] };
  config: { config: Config };
  // eslint-disable-next-line @stylistic/type-annotation-spacing
  discord: { createDiscordBot: () => void };
  // eslint-disable-next-line @stylistic/type-annotation-spacing
  hide: { hide: () => void };
  // eslint-disable-next-line @stylistic/type-annotation-spacing
  messages: { sendMessage: (text: string) => void };
  modes: { modes: string[] };
};

const w = window as unknown as WindowExtensions;

const moveLeftShortcuts = new Set(['a', 'ArrowLeft']);
const moveRightShortcuts = new Set(['ArrowRight', 'd']);
const increaseOpacityShortcuts = new Set(['ArrowUp', 'w']);
const decreaseOpacityShortcuts = new Set(['ArrowDown', 's']);
const switchTabShortcuts = new Set(['m']);
const sendMessageShortcuts = new Set(['Enter']);
const toggleImagesShortcuts = new Set(['b']);

const opacityStep = 0.05;
const defaultMode = w.modes.modes[0];

let currentImage = 0;
let currentMode = 0;
let currentTab = 0;
let largeImages = false;

window.addEventListener('DOMContentLoaded', () => {
  // This has to be declared here because assets is a window global
  let assets = w.assets[defaultMode];

  const image = document.querySelector<HTMLImageElement>('img#image');
  const currentModeSpan = document.querySelector<HTMLSpanElement>('span#current-mode');
  const currentPageSpan = document.querySelector<HTMLSpanElement>('span#current-page');
  const currentImagesSpan = document.querySelector<HTMLSpanElement>('span#current-images');

  const opacitySliderInput = document.querySelector<HTMLInputElement>('input#opacity-slider');
  const imageNumberInput = document.querySelector<HTMLInputElement>('input#image-number');
  const messageTextarea = document.querySelector<HTMLTextAreaElement>('textarea#type-message');

  const nextImageButton = document.querySelector<HTMLButtonElement>('button#next-image');
  const previousImageButton = document.querySelector<HTMLButtonElement>('button#previous-image');
  const nextModeButton = document.querySelector<HTMLButtonElement>('button#next-mode');
  const sendButton = document.querySelector<HTMLButtonElement>('button#send-message');
  const imageViewerTabButton = document.querySelector<HTMLButtonElement>('button#image-viewer-button');
  const chatTabButton = document.querySelector<HTMLButtonElement>('button#chat-button');
  const toggleImagesButton = document.querySelector<HTMLButtonElement>('button#toggle-images');
  const toggleVisibilityButton = document.querySelector<HTMLButtonElement>('button#toggle-visibility');
  const firstImageButton = document.querySelector<HTMLButtonElement>('button#first-image');

  if (
    !image ||
    !currentModeSpan ||
    !currentPageSpan ||
    !currentImagesSpan ||
    !opacitySliderInput ||
    !imageNumberInput ||
    !messageTextarea ||
    !nextImageButton ||
    !previousImageButton ||
    !nextModeButton ||
    !sendButton ||
    !imageViewerTabButton ||
    !chatTabButton ||
    !toggleImagesButton ||
    !toggleVisibilityButton ||
    !firstImageButton
  ) {
    throw new Error('Failed to find required DOM elements');
  }

  const inputs = new Set([imageNumberInput, messageTextarea]);

  image.src = assets[currentImage];
  currentModeSpan.textContent = defaultMode;
  currentPageSpan.textContent = String(currentImage + 1);
  currentImagesSpan.textContent = 'Small';

  // Function declarations - must be before event listener setup
  const updateImage = (): void => {
    image.src = assets[currentImage];
    currentPageSpan.textContent = String(currentImage + 1);
  };

  const updateMode = (): void => {
    assets = w.assets[w.modes.modes[currentMode]];
    currentModeSpan.textContent = w.modes.modes[currentMode];
    updateImage();
  };

  const moveImageLeft = (): void => {
    currentImage -= 1;

    if (currentImage < 0) {
      currentImage = 0;
    }

    updateImage();
  };

  const moveImageRight = (): void => {
    currentImage += 1;

    if (currentImage > assets.length - 1) {
      currentImage = assets.length - 1;
    }

    updateImage();
  };

  const moveImageTo = (index: number): void => {
    if (index < 0 || index > assets.length - 1) {
      return;
    }

    currentImage = index - 1;

    updateImage();
  };

  const setOpacity = (value: number): void => {
    const opacity = Math.max(0.05, Math.min(1, value));

    document.body.style.opacity = String(opacity);
    opacitySliderInput.value = String(opacity * 100);

    currentPageSpan.textContent = String(currentImage + 1);
  };

  const changeOpacity = (step: number): void => {
    let currentOpacity = Number.parseFloat(document.body.style.opacity);

    if (Number.isNaN(currentOpacity)) {
      currentOpacity = 1;
    }

    setOpacity(currentOpacity + step);
  };

  const sendChatMessage = (event: Event): void => {
    event.preventDefault();

    const message = messageTextarea.value;
    messageTextarea.value = '';

    if ((/^\s*$/u).test(message)) {
      return;
    }

    w.messages.sendMessage(message);
  };

  const setChatTab = (): void => {
    currentTab = 1;
    const imageViewer = document.querySelector<HTMLDivElement>('div#image-viewer');
    const chat = document.querySelector<HTMLDivElement>('div#chat');

    if (imageViewer && chat) {
      imageViewer.style.display = 'none';
      chat.style.display = 'flex';
    }
  };

  const setImageViewerTab = (): void => {
    currentTab = 0;
    const imageViewer = document.querySelector<HTMLDivElement>('div#image-viewer');
    const chat = document.querySelector<HTMLDivElement>('div#chat');

    if (imageViewer && chat) {
      chat.style.display = 'none';
      imageViewer.style.display = 'flex';
    }
  };

  const switchTab = (): void => {
    if (currentTab === 0) {
      setChatTab();
    } else {
      setImageViewerTab();
    }
  };

  const toggleChatImageSize = (): void => {
    const root = document.querySelector<HTMLElement>(':root');
    const messages = document.querySelector<HTMLDivElement>('div#messages');

    if (!root || !messages) {
      return;
    }

    if (largeImages) {
      largeImages = false;
      root.style.setProperty('--message-image-max-width', '5%');
      currentImagesSpan.textContent = 'Small';
    } else {
      largeImages = true;
      root.style.setProperty('--message-image-max-width', '100%');
      currentImagesSpan.textContent = 'Normal';
    }

    messages.scrollTop = messages.scrollHeight;
  };

  const nextMode = (): void => {
    currentMode += 1;
    currentImage = 0;

    if (currentMode > w.modes.modes.length - 1) {
      currentMode = 0;
    }

    updateMode();
  };

  const moveModeTo = (mode: number): void => {
    if (mode < 0 || mode > w.modes.modes.length - 1) {
      return;
    }

    currentMode = mode;
    currentImage = 0;

    updateMode();
  };

  // Event listeners
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    const eventKey = Number.parseInt(event.key);

    // Image Viewer tab

    if (moveLeftShortcuts.has(event.key) && currentTab === 0) {
      moveImageLeft();
    }

    if (moveRightShortcuts.has(event.key) && currentTab === 0) {
      moveImageRight();
    }

    if (
      !Number.isNaN(eventKey) &&
      !event.ctrlKey &&
      document.activeElement !== imageNumberInput &&
      currentTab === 0
    ) {
      moveImageTo(eventKey);
    }

    if (
      !Number.isNaN(eventKey) &&
      event.ctrlKey &&
      document.activeElement !== imageNumberInput &&
      currentTab === 0
    ) {
      moveModeTo(eventKey - 1);
    }

    // Chat tab

    if (
      sendMessageShortcuts.has(event.key) &&
      currentTab === 1 &&
      !event.shiftKey
    ) {
      sendChatMessage(event);
    }

    if (
      toggleImagesShortcuts.has(event.key) &&
      currentTab === 1 &&
      document.activeElement !== messageTextarea
    ) {
      toggleChatImageSize();
    }

    // All tabs

    if (
      increaseOpacityShortcuts.has(event.key) &&
      !inputs.has(document.activeElement as HTMLInputElement | HTMLTextAreaElement)
    ) {
      changeOpacity(opacityStep);
    }

    if (
      decreaseOpacityShortcuts.has(event.key) &&
      !inputs.has(document.activeElement as HTMLInputElement | HTMLTextAreaElement)
    ) {
      changeOpacity(-opacityStep);
    }

    if (
      switchTabShortcuts.has(event.key) &&
      !inputs.has(document.activeElement as HTMLInputElement | HTMLTextAreaElement)
    ) {
      switchTab();
    }
  });

  nextImageButton.addEventListener('click', moveImageRight);
  previousImageButton.addEventListener('click', moveImageLeft);
  imageViewerTabButton.addEventListener('click', setImageViewerTab);
  chatTabButton.addEventListener('click', setChatTab);
  sendButton.addEventListener('click', sendChatMessage);
  toggleImagesButton.addEventListener('click', toggleChatImageSize);
  nextModeButton.addEventListener('click', nextMode);

  firstImageButton.addEventListener('click', (): void => {
    moveImageTo(1);
  });

  toggleVisibilityButton.addEventListener('click', (): void => {
    w.hide.hide();
  });

  opacitySliderInput.addEventListener('input', (): void => {
    setOpacity(Number.parseFloat(opacitySliderInput.value) / 100);
  });

  imageNumberInput.addEventListener('input', (): void => {
    const value = imageNumberInput.value;

    if (value === '' || value === '0' || value === '-0') {
      return;
    }

    moveImageTo(Number.parseInt(value));
  });
});
