// @ts-nocheck

let currentImage = 0;
let currentMode = 0;
let currentTab = 0;
let lastOpacity = 1;
let showImages = true;

/**
 * Modes:
 * 0: Theory
 * 1: Practical
 *
 * Tabs:
 * 0 - Image Viewer
 * 1 - Chat
 */

// https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values

const moveLeftShortcuts = ['a', 'ArrowLeft'];
const moveRightShortcuts = ['d', 'ArrowRight'];
const increaseOpacityShortcuts = ['w', 'ArrowUp'];
const decreaseOpacityShortcuts = ['s', 'ArrowDown'];
const toggleVisibilityShortcuts = ['q', 'Escape'];
const switchTabShortcuts = ['m'];
const sendMessageShortcuts = ['Enter'];
const toggleImagesShortcuts = ['b'];

const opacityStep = 0.05;
const defaultMode = window.modes.modes[0];

window.addEventListener('DOMContentLoaded', () => {
  let assets = window.assets[defaultMode];

  const image = document.querySelector('img#image');
  const sliderInput = document.querySelector('input#slider');
  const pageInput = document.querySelector('input#page');
  const goButton = document.querySelector('button#go');
  const nextButton = document.querySelector('button#next');
  const previousButton = document.querySelector('button#prev');
  const modeButton = document.querySelector('button#mode');
  const currentModeSpan = document.querySelector('span#current-mode');
  const currentPageSpan = document.querySelector('span#current-page');
  const messageInput = document.querySelector('input#type-message');
  const sendButton = document.querySelector('button#send-message');
  const imageViewerTabButton = document.querySelector('button#image-viewer-button');
  const chatTabButton = document.querySelector('button#chat-button');
  const discordChannelSpan = document.querySelector('span#discord-channel');
  const toggleImagesButton = document.querySelector('button#toggle-images');

  const inputs = [pageInput, messageInput];

  image.src = assets[currentImage];

  currentModeSpan.textContent = defaultMode;
  currentPageSpan.textContent = currentImage + 1;
  discordChannelSpan.textContent = window.config.config.channel;

  // eslint-disable-next-line complexity
  document.addEventListener('keydown', (event) => {
    const eventNumber = Number.parseInt(event.key, 10);

    // Image Viewer tab

    if (moveLeftShortcuts.includes(event.key) && currentTab === 0) {
      moveLeft();
    }

    if (moveRightShortcuts.includes(event.key) && currentTab === 0) {
      moveRight();
    }

    if (!Number.isNaN(eventNumber) && document.activeElement !== pageInput && eventNumber > 0 && eventNumber <= assets.length && currentTab === 0) {
      moveTo(eventNumber);
    }

    // Chat tab

    if (sendMessageShortcuts.includes(event.key) && currentTab === 1) {
      sendChatMessage();
    }

    if (toggleImagesShortcuts.includes(event.key) && currentTab === 1) {
      toggleChatImageVisibility();
    }

    // All tabs

    if (increaseOpacityShortcuts.includes(event.key) && !inputs.includes(document.activeElement)) {
      changeOpacity(opacityStep);
    }

    if (decreaseOpacityShortcuts.includes(event.key) && !inputs.includes(document.activeElement)) {
      changeOpacity(-opacityStep);
    }

    if (toggleVisibilityShortcuts.includes(event.key) && !inputs.includes(document.activeElement)) {
      toggleVisibility();
    }

    if (switchTabShortcuts.includes(event.key) && !inputs.includes(document.activeElement)) {
      switchTab();
    }

    // After all shortcuts

    updateImage();
  });

  sliderInput.addEventListener('input', () => {
    setOpacity(Number.parseFloat(sliderInput.value) / 100);
  });

  goButton.addEventListener('click', () => {
    const value = pageInput.value;

    if (value === '') {
      return;
    }

    moveTo(value);
    updateImage();
  });

  nextButton.addEventListener('click', () => {
    moveRight();
    updateImage();
  });

  previousButton.addEventListener('click', () => {
    moveLeft();
    updateImage();
  });

  modeButton.addEventListener('click', () => {
    if (currentMode === 0) {
      currentMode = 1;
      assets = window.assets.practical;
    } else {
      currentMode = 0;
      assets = window.assets.theory;
    }

    currentImage = 0;
    updateImage();

    currentModeSpan.textContent = window.modes.modes[currentMode];
    currentPageSpan.textContent = 1;
  });

  imageViewerTabButton.addEventListener('click', setImageViewerTab);

  chatTabButton.addEventListener('click', setChatTab);

  sendButton.addEventListener('click', sendChatMessage);

  toggleImagesButton.addEventListener('click', toggleChatImageVisibility);

  // eslint-disable-next-line unicorn/consistent-function-scoping
  function moveLeft () {
    currentImage -= 1;

    if (currentImage < 0) {
      currentImage = 0;
    }

    currentPageSpan.textContent = currentImage + 1;
  }

  function moveRight () {
    currentImage += 1;

    if (currentImage > assets.length - 1) {
      currentImage = assets.length - 1;
    }

    currentPageSpan.textContent = currentImage + 1;
  }

  function moveTo (index) {
    if (index < 0 || index > assets.length - 1) {
      return;
    }

    currentImage = index - 1;
    currentPageSpan.textContent = currentImage + 1;
  }

  function updateImage () {
    if (image) {
      image.src = assets[currentImage];
    }
  }

  function changeOpacity (step) {
    let currentOpacity = Number.parseFloat(document.body.style.opacity);

    if (Number.isNaN(currentOpacity)) {
      currentOpacity = 1;
    }

    setOpacity(currentOpacity + step);
  }

  function setOpacity (value, update = true) {
    const opacity = Math.max(0, Math.min(1, value));

    if (update) {
      lastOpacity = opacity;
    }

    document.body.style.opacity = opacity;
    sliderInput.value = opacity * 100;

    currentPageSpan.textContent = currentImage + 1;
  }

  function toggleVisibility () {
    let currentOpacity = Number.parseFloat(document.body.style.opacity);

    if (Number.isNaN(currentOpacity)) {
      currentOpacity = 1;
    }

    if (currentOpacity === 0) {
      setOpacity(lastOpacity);
    } else {
      setOpacity(0, false);
    }
  }

  function sendChatMessage () {
    const message = messageInput.value;

    if (message === '') {
      return;
    }

    window.messages.sendMessage(message);

    messageInput.value = '';
  }

  function switchTab () {
    if (currentTab === 0) {
      setChatTab();
    } else {
      setImageViewerTab();
    }
  }

  function setChatTab () {
    currentTab = 1;
    document.querySelector('div#image-viewer').style.display = 'none';
    document.querySelector('div#chat').style.display = 'flex';
  }

  function setImageViewerTab () {
    currentTab = 0;
    document.querySelector('div#chat').style.display = 'none';
    document.querySelector('div#image-viewer').style.display = 'flex';
  }

  function toggleChatImageVisibility () {
    const root = document.querySelector(':root');

    if (showImages) {
      showImages = false;
      root.style.setProperty('--message-image-max-width', '10%');
    } else {
      showImages = true;
      root.style.setProperty('--message-image-max-width', '100%');
    }
  }
});
