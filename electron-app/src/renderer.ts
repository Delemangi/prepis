/**
 * Tabs:
 * 0 - Image Viewer
 * 1 - Chat
 */

// https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values

import type { Config } from './config';

type DOMElements = {
  currentImagesSpan: HTMLSpanElement;
  currentModeSpan: HTMLSpanElement;
  currentPageSpan: HTMLSpanElement;
  image: HTMLImageElement;
  imageNumberInput: HTMLInputElement;
  messageTextarea: HTMLTextAreaElement;
  opacitySliderInput: HTMLInputElement;
};

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

let assets = w.assets[defaultMode];
let currentImage = 0;
let currentMode = 0;
let currentTab = 0;
let largeImages = false;

const updateImage = (elements: DOMElements): void => {
  elements.image.src = assets[currentImage];
  elements.currentPageSpan.textContent = String(currentImage + 1);
};

const updateMode = (elements: DOMElements): void => {
  assets = w.assets[w.modes.modes[currentMode]];
  elements.currentModeSpan.textContent = w.modes.modes[currentMode];
  updateImage(elements);
};

const moveImageLeft = (elements: DOMElements): void => {
  currentImage -= 1;

  if (currentImage < 0) {
    currentImage = 0;
  }

  updateImage(elements);
};

const moveImageRight = (elements: DOMElements): void => {
  currentImage += 1;

  if (currentImage > assets.length - 1) {
    currentImage = assets.length - 1;
  }

  updateImage(elements);
};

const moveImageTo = (index: number, elements: DOMElements): void => {
  if (index < 0 || index > assets.length - 1) {
    return;
  }

  currentImage = index - 1;

  updateImage(elements);
};

const setOpacity = (value: number, elements: DOMElements): void => {
  const opacity = Math.max(0.05, Math.min(1, value));

  document.body.style.opacity = String(opacity);
  elements.opacitySliderInput.value = String(opacity * 100);

  elements.currentPageSpan.textContent = String(currentImage + 1);
};

const changeOpacity = (step: number, elements: DOMElements): void => {
  let currentOpacity = Number.parseFloat(document.body.style.opacity);

  if (Number.isNaN(currentOpacity)) {
    currentOpacity = 1;
  }

  setOpacity(currentOpacity + step, elements);
};

const sendChatMessage = (event: Event, elements: DOMElements): void => {
  event.preventDefault();

  const message = elements.messageTextarea.value;
  elements.messageTextarea.value = '';

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

const toggleChatImageSize = (elements: DOMElements): void => {
  const root = document.querySelector<HTMLElement>(':root');
  const messages = document.querySelector<HTMLDivElement>('div#messages');

  if (!root || !messages) {
    return;
  }

  if (largeImages) {
    largeImages = false;
    root.style.setProperty('--message-image-max-width', '5%');
    elements.currentImagesSpan.textContent = 'Small';
  } else {
    largeImages = true;
    root.style.setProperty('--message-image-max-width', '100%');
    elements.currentImagesSpan.textContent = 'Normal';
  }

  messages.scrollTop = messages.scrollHeight;
};

const nextMode = (elements: DOMElements): void => {
  currentMode += 1;
  currentImage = 0;

  if (currentMode > w.modes.modes.length - 1) {
    currentMode = 0;
  }

  updateMode(elements);
};

const moveModeTo = (mode: number, elements: DOMElements): void => {
  if (mode < 0 || mode > w.modes.modes.length - 1) {
    return;
  }

  currentMode = mode;
  currentImage = 0;

  updateMode(elements);
};

const handleKeydown = (
  event: KeyboardEvent,
  elements: DOMElements,
  inputs: Set<HTMLInputElement | HTMLTextAreaElement>
): void => {
  const eventKey = Number.parseInt(event.key);

  // Image Viewer tab

  if (moveLeftShortcuts.has(event.key) && currentTab === 0) {
    moveImageLeft(elements);
  }

  if (moveRightShortcuts.has(event.key) && currentTab === 0) {
    moveImageRight(elements);
  }

  if (
    !Number.isNaN(eventKey) &&
    !event.ctrlKey &&
    document.activeElement !== elements.imageNumberInput &&
    currentTab === 0
  ) {
    moveImageTo(eventKey, elements);
  }

  if (
    !Number.isNaN(eventKey) &&
    event.ctrlKey &&
    document.activeElement !== elements.imageNumberInput &&
    currentTab === 0
  ) {
    moveModeTo(eventKey - 1, elements);
  }

  // Chat tab

  if (
    sendMessageShortcuts.has(event.key) &&
    currentTab === 1 &&
    !event.shiftKey
  ) {
    sendChatMessage(event, elements);
  }

  if (
    toggleImagesShortcuts.has(event.key) &&
    currentTab === 1 &&
    document.activeElement !== elements.messageTextarea
  ) {
    toggleChatImageSize(elements);
  }

  // All tabs

  if (
    increaseOpacityShortcuts.has(event.key) &&
    !inputs.has(document.activeElement as HTMLInputElement | HTMLTextAreaElement)
  ) {
    changeOpacity(opacityStep, elements);
  }

  if (
    decreaseOpacityShortcuts.has(event.key) &&
    !inputs.has(document.activeElement as HTMLInputElement | HTMLTextAreaElement)
  ) {
    changeOpacity(-opacityStep, elements);
  }

  if (
    switchTabShortcuts.has(event.key) &&
    !inputs.has(document.activeElement as HTMLInputElement | HTMLTextAreaElement)
  ) {
    switchTab();
  }
};

window.addEventListener('DOMContentLoaded', () => {
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

  const elements: DOMElements = {
    currentImagesSpan,
    currentModeSpan,
    currentPageSpan,
    image,
    imageNumberInput,
    messageTextarea,
    opacitySliderInput
  };

  const inputs = new Set([imageNumberInput, messageTextarea]);

  image.src = assets[currentImage];
  currentModeSpan.textContent = defaultMode;
  currentPageSpan.textContent = String(currentImage + 1);
  currentImagesSpan.textContent = 'Small';

  // Event listeners
  document.addEventListener('keydown', (event: KeyboardEvent) => {
    handleKeydown(
      event,
      elements,
      inputs
    );
  });

  nextImageButton.addEventListener('click', () => {
    moveImageRight(elements);
  });
  previousImageButton.addEventListener('click', () => {
    moveImageLeft(elements);
  });
  imageViewerTabButton.addEventListener('click', setImageViewerTab);
  chatTabButton.addEventListener('click', setChatTab);
  sendButton.addEventListener('click', (event) => {
    sendChatMessage(event, elements);
  });
  toggleImagesButton.addEventListener('click', () => {
    toggleChatImageSize(elements);
  });
  nextModeButton.addEventListener('click', () => {
    nextMode(elements);
  });

  firstImageButton.addEventListener('click', (): void => {
    moveImageTo(1, elements);
  });

  toggleVisibilityButton.addEventListener('click', (): void => {
    w.hide.hide();
  });

  opacitySliderInput.addEventListener('input', (): void => {
    setOpacity(Number.parseFloat(opacitySliderInput.value) / 100, elements);
  });

  imageNumberInput.addEventListener('input', (): void => {
    const value = imageNumberInput.value;

    if (value === '' || value === '0' || value === '-0') {
      return;
    }

    moveImageTo(Number.parseInt(value), elements);
  });
});
