/**
 * Tabs:
 * 0 - Image Viewer
 * 1 - Chat
 */

// https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values

import type { Config } from './config';

// eslint-disable-next-line @stylistic/type-annotation-spacing -- Function type aliases here conflict with @stylistic/arrow-spacing under the current imperium preset combination.
type DiscordBotCreator = () => void;

type DiscordBridge = {
  createDiscordBot: DiscordBotCreator;
};

type DOMElements = {
  currentImagesSpan: HTMLSpanElement;
  currentModeSpan: HTMLSpanElement;
  currentPageSpan: HTMLSpanElement;
  image: HTMLImageElement;
  imageNumberInput: HTMLInputElement;
  messageTextarea: HTMLTextAreaElement;
  opacitySliderInput: HTMLInputElement;
};

type HideBridge = {
  hide: HideHandler;
};

// eslint-disable-next-line @stylistic/type-annotation-spacing -- Function type aliases here conflict with @stylistic/arrow-spacing under the current imperium preset combination.
type HideHandler = () => void;

type MessagesBridge = {
  sendMessage: MessageSender;
};

// eslint-disable-next-line @stylistic/type-annotation-spacing -- Function type aliases here conflict with @stylistic/arrow-spacing under the current imperium preset combination.
type MessageSender = (text: string) => void;

type TrackedInput = HTMLInputElement | HTMLTextAreaElement;

type WindowExtensions = {
  assets: Record<string, string[]>;
  config: { config: Config };
  discord: DiscordBridge;
  hide: HideBridge;
  messages: MessagesBridge;
  modes: { modes: string[] };
};

const w = globalThis as unknown as WindowExtensions;
const whitespaceOnlyPattern = /^\s*$/u;

const moveLeftShortcuts = new Set(['a', 'ArrowLeft']);
const moveRightShortcuts = new Set(['ArrowRight', 'd']);
const increaseOpacityShortcuts = new Set(['ArrowUp', 'w']);
const decreaseOpacityShortcuts = new Set(['ArrowDown', 's']);
const switchTabShortcuts = new Set(['m']);
const sendMessageShortcuts = new Set(['Enter']);
const toggleImagesShortcuts = new Set(['b']);

const opacityStep = 0.05;
const defaultMode = w.modes.modes[0];

const state = {
  assets: w.assets[defaultMode],
  currentImage: 0,
  currentMode: 0,
  currentTab: 0,
  largeImages: false
};

const updateImage = (elements: DOMElements): void => {
  elements.image.src = state.assets[state.currentImage];
  elements.currentPageSpan.textContent = String(state.currentImage + 1);
};

const updateMode = (elements: DOMElements): void => {
  state.assets = w.assets[w.modes.modes[state.currentMode]];
  elements.currentModeSpan.textContent = w.modes.modes[state.currentMode];
  updateImage(elements);
};

const moveImageLeft = (elements: DOMElements): void => {
  state.currentImage -= 1;

  if (state.currentImage < 0) {
    state.currentImage = 0;
  }

  updateImage(elements);
};

const moveImageRight = (elements: DOMElements): void => {
  state.currentImage += 1;

  if (state.currentImage > state.assets.length - 1) {
    state.currentImage = state.assets.length - 1;
  }

  updateImage(elements);
};

const moveImageTo = (index: number, elements: DOMElements): void => {
  if (index < 0 || index > state.assets.length - 1) {
    return;
  }

  state.currentImage = index - 1;

  updateImage(elements);
};

const setOpacity = (value: number, elements: DOMElements): void => {
  const opacity = Math.max(0.05, Math.min(1, value));

  document.body.style.opacity = String(opacity);
  elements.opacitySliderInput.value = String(opacity * 100);

  elements.currentPageSpan.textContent = String(state.currentImage + 1);
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

  if (whitespaceOnlyPattern.test(message)) {
    return;
  }

  w.messages.sendMessage(message);
};

const setChatTab = (): void => {
  state.currentTab = 1;
  const imageViewer = document.querySelector<HTMLDivElement>('div#image-viewer');
  const chat = document.querySelector<HTMLDivElement>('div#chat');

  if (imageViewer && chat) {
    imageViewer.style.display = 'none';
    chat.style.display = 'flex';
  }
};

const setImageViewerTab = (): void => {
  state.currentTab = 0;
  const imageViewer = document.querySelector<HTMLDivElement>('div#image-viewer');
  const chat = document.querySelector<HTMLDivElement>('div#chat');

  if (imageViewer && chat) {
    chat.style.display = 'none';
    imageViewer.style.display = 'flex';
  }
};

const switchTab = (): void => {
  if (state.currentTab === 0) {
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

  if (state.largeImages) {
    state.largeImages = false;
    root.style.setProperty('--message-image-max-width', '5%');
    elements.currentImagesSpan.textContent = 'Small';
  } else {
    state.largeImages = true;
    root.style.setProperty('--message-image-max-width', '100%');
    elements.currentImagesSpan.textContent = 'Normal';
  }

  messages.scrollTop = messages.scrollHeight;
};

const nextMode = (elements: DOMElements): void => {
  state.currentMode += 1;
  state.currentImage = 0;

  if (state.currentMode > w.modes.modes.length - 1) {
    state.currentMode = 0;
  }

  updateMode(elements);
};

const moveModeTo = (mode: number, elements: DOMElements): void => {
  if (mode < 0 || mode > w.modes.modes.length - 1) {
    return;
  }

  state.currentMode = mode;
  state.currentImage = 0;

  updateMode(elements);
};

const isTrackedInput = (activeElement: Element | null, inputs: Set<TrackedInput>): boolean => {
  if (
    activeElement instanceof HTMLInputElement ||
    activeElement instanceof HTMLTextAreaElement
  ) {
    return inputs.has(activeElement);
  }

  return false;
};

const handleImageViewerKeydown = (
  event: KeyboardEvent,
  eventKey: number,
  elements: DOMElements
): void => {
  if (state.currentTab !== 0) {
    return;
  }

  if (moveLeftShortcuts.has(event.key)) {
    moveImageLeft(elements);
  }

  if (moveRightShortcuts.has(event.key)) {
    moveImageRight(elements);
  }

  if (
    !Number.isNaN(eventKey) &&
    document.activeElement !== elements.imageNumberInput
  ) {
    if (event.ctrlKey) {
      moveModeTo(eventKey - 1, elements);
    } else {
      moveImageTo(eventKey, elements);
    }
  }
};

const handleChatKeydown = (event: KeyboardEvent, elements: DOMElements): void => {
  if (state.currentTab !== 1) {
    return;
  }

  if (sendMessageShortcuts.has(event.key) && !event.shiftKey) {
    sendChatMessage(event, elements);
  }

  if (
    toggleImagesShortcuts.has(event.key) &&
    document.activeElement !== elements.messageTextarea
  ) {
    toggleChatImageSize(elements);
  }
};

const handleGlobalKeydown = (
  event: KeyboardEvent,
  elements: DOMElements,
  inputs: Set<HTMLInputElement | HTMLTextAreaElement>
): void => {
  if (isTrackedInput(document.activeElement, inputs)) {
    return;
  }

  if (increaseOpacityShortcuts.has(event.key)) {
    changeOpacity(opacityStep, elements);
  }

  if (decreaseOpacityShortcuts.has(event.key)) {
    changeOpacity(-opacityStep, elements);
  }

  if (switchTabShortcuts.has(event.key)) {
    switchTab();
  }
};

const handleKeydown = (
  event: KeyboardEvent,
  elements: DOMElements,
  inputs: Set<HTMLInputElement | HTMLTextAreaElement>
): void => {
  const eventKey = Number.parseInt(event.key, 10);

  handleImageViewerKeydown(
    event,
    eventKey,
    elements
  );
  handleChatKeydown(event, elements);
  handleGlobalKeydown(
    event,
    elements,
    inputs
  );
};

addEventListener('DOMContentLoaded', () => {
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

  image.src = state.assets[state.currentImage];
  currentModeSpan.textContent = defaultMode;
  currentPageSpan.textContent = String(state.currentImage + 1);
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

    if ([
      '',
      '0',
      '-0'
    ].includes(value)) {
      return;
    }

    moveImageTo(Number.parseInt(value, 10), elements);
  });
});
