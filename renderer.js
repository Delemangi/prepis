// @ts-nocheck

let currentImage = 0;
let currentMode = 0;
let currentTab = 0;
let showImages = false;

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
const switchTabShortcuts = ['m'];
const sendMessageShortcuts = ['Enter'];
const toggleImagesShortcuts = ['b'];

const opacityStep = 0.05;
const defaultMode = window.modes.modes[0];

window.addEventListener('DOMContentLoaded', () => {
  let assets = window.assets[defaultMode];

  const image = document.querySelector('img#image');

  const currentModeSpan = document.querySelector('span#current-mode');
  const currentPageSpan = document.querySelector('span#current-page');
  const currentImagesSpan = document.querySelector('span#current-images');

  const opacitySliderInput = document.querySelector('input#opacity-slider');
  const imageNumberInput = document.querySelector('input#image-number');
  const messageInput = document.querySelector('input#type-message');

  const nextImageButton = document.querySelector('button#next-image');
  const previousImageButton = document.querySelector('button#previous-image');
  const nextModeButton = document.querySelector('button#next-mode');
  const sendButton = document.querySelector('button#send-message');
  const imageViewerTabButton = document.querySelector('button#image-viewer-button');
  const chatTabButton = document.querySelector('button#chat-button');
  const toggleImagesButton = document.querySelector('button#toggle-images');
  const toggleVisibilityButton = document.querySelector('button#toggle-visibility');
  const firstImageButton = document.querySelector('button#first-image');

  const inputs = [imageNumberInput, messageInput];

  image.src = assets[currentImage];
  currentModeSpan.textContent = defaultMode;
  currentPageSpan.textContent = currentImage + 1;
  currentImagesSpan.textContent = 'Small';

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

    if (!Number.isNaN(eventNumber) && document.activeElement !== imageNumberInput && eventNumber > 0 && eventNumber <= assets.length && currentTab === 0) {
      moveTo(eventNumber);
    }

    // Chat tab

    if (sendMessageShortcuts.includes(event.key) && currentTab === 1) {
      sendChatMessage();
    }

    if (toggleImagesShortcuts.includes(event.key) && currentTab === 1 && document.activeElement !== messageInput) {
      toggleChatImageVisibility();
    }

    // All tabs

    if (increaseOpacityShortcuts.includes(event.key) && !inputs.includes(document.activeElement)) {
      changeOpacity(opacityStep);
    }

    if (decreaseOpacityShortcuts.includes(event.key) && !inputs.includes(document.activeElement)) {
      changeOpacity(-opacityStep);
    }

    if (switchTabShortcuts.includes(event.key) && !inputs.includes(document.activeElement)) {
      switchTab();
    }

    // After all shortcuts

    updateImage();
  });

  opacitySliderInput.addEventListener('input', () => {
    setOpacity(Number.parseFloat(opacitySliderInput.value) / 100);
  });

  imageNumberInput.addEventListener('input', () => {
    const value = imageNumberInput.value;

    if (value === '' || value === '0') {
      return;
    }

    moveTo(value);
    updateImage();
  });

  nextImageButton.addEventListener('click', () => {
    moveRight();
    updateImage();
  });

  previousImageButton.addEventListener('click', () => {
    moveLeft();
    updateImage();
  });

  nextModeButton.addEventListener('click', () => {
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

  firstImageButton.addEventListener('click', () => {
    moveTo(1);
    updateImage();
  });

  toggleVisibilityButton.addEventListener('click', () => {
    window.hide.hide();
  });

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

  function setOpacity (value) {
    const opacity = Math.max(0.05, Math.min(1, value));

    document.body.style.opacity = opacity;
    opacitySliderInput.value = opacity * 100;

    currentPageSpan.textContent = currentImage + 1;
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
    const messages = document.querySelector('div#messages');

    if (showImages) {
      showImages = false;
      root.style.setProperty('--message-image-max-width', '5%');
      currentImagesSpan.textContent = 'Small';
    } else {
      showImages = true;
      root.style.setProperty('--message-image-max-width', '100%');
      currentImagesSpan.textContent = 'Normal';
    }

    messages.scrollTop = messages.scrollHeight;
  }
});
