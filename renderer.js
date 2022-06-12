// @ts-nocheck

/**
 *
 * Tabs:
 * 0 - Image Viewer
 * 1 - Chat
 *
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

let currentImage = 0;
let currentMode = 0;
let currentTab = 0;
let largeImages = false;

window.addEventListener('DOMContentLoaded', () => {
  // This has to be declared here because assets is a window global
  let assets = window.assets[defaultMode];

  const image = document.querySelector('img#image');

  const currentModeSpan = document.querySelector('span#current-mode');
  const currentPageSpan = document.querySelector('span#current-page');
  const currentImagesSpan = document.querySelector('span#current-images');

  const opacitySliderInput = document.querySelector('input#opacity-slider');
  const imageNumberInput = document.querySelector('input#image-number');
  const messageTextarea = document.querySelector('textarea#type-message');

  const nextImageButton = document.querySelector('button#next-image');
  const previousImageButton = document.querySelector('button#previous-image');
  const nextModeButton = document.querySelector('button#next-mode');
  const sendButton = document.querySelector('button#send-message');
  const imageViewerTabButton = document.querySelector('button#image-viewer-button');
  const chatTabButton = document.querySelector('button#chat-button');
  const toggleImagesButton = document.querySelector('button#toggle-images');
  const toggleVisibilityButton = document.querySelector('button#toggle-visibility');
  const firstImageButton = document.querySelector('button#first-image');

  const inputs = [imageNumberInput, messageTextarea];

  image.src = assets[currentImage];
  currentModeSpan.textContent = defaultMode;
  currentPageSpan.textContent = currentImage + 1;
  currentImagesSpan.textContent = 'Small';

  // eslint-disable-next-line complexity
  document.addEventListener('keydown', (event) => {
    const eventKey = Number.parseInt(event.key, 10);

    // Image Viewer tab

    if (moveLeftShortcuts.includes(event.key) && currentTab === 0) {
      moveImageLeft();
    }

    if (moveRightShortcuts.includes(event.key) && currentTab === 0) {
      moveImageRight();
    }

    if (!Number.isNaN(eventKey) && !event.ctrlKey && document.activeElement !== imageNumberInput && currentTab === 0) {
      moveImageTo(eventKey);
    }

    if (!Number.isNaN(eventKey) && event.ctrlKey && document.activeElement !== imageNumberInput && currentTab === 0) {
      moveModeTo(eventKey - 1);
    }

    // Chat tab

    if (sendMessageShortcuts.includes(event.key) && currentTab === 1 && !event.shiftKey) {
      sendChatMessage(event);
    }

    if (toggleImagesShortcuts.includes(event.key) && currentTab === 1 && document.activeElement !== messageTextarea) {
      toggleChatImageSize();
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
  });

  nextImageButton.addEventListener('click', moveImageRight);

  previousImageButton.addEventListener('click', moveImageLeft);

  imageViewerTabButton.addEventListener('click', setImageViewerTab);

  chatTabButton.addEventListener('click', setChatTab);

  sendButton.addEventListener('click', sendChatMessage);

  toggleImagesButton.addEventListener('click', toggleChatImageSize);

  nextModeButton.addEventListener('click', nextMode);

  firstImageButton.addEventListener('click', () => moveImageTo(1));

  toggleVisibilityButton.addEventListener('click', () => window.hide.hide());

  opacitySliderInput.addEventListener('input', () => setOpacity(Number.parseFloat(opacitySliderInput.value) / 100));

  imageNumberInput.addEventListener('input', () => {
    const value = imageNumberInput.value;

    if (value === '' || value === '0' || value === '-0') {
      return;
    }

    moveImageTo(value);
  });

  // eslint-disable-next-line unicorn/consistent-function-scoping
  function moveImageLeft () {
    currentImage -= 1;

    if (currentImage < 0) {
      currentImage = 0;
    }

    updateImage();
  }

  function moveImageRight () {
    currentImage += 1;

    if (currentImage > assets.length - 1) {
      currentImage = assets.length - 1;
    }

    updateImage();
  }

  function moveImageTo (index) {
    if (index < 0 || index > assets.length - 1) {
      return;
    }

    currentImage = index - 1;

    updateImage();
  }

  function updateImage () {
    image.src = assets[currentImage];
    currentPageSpan.textContent = currentImage + 1;
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

  function sendChatMessage (event) {
    event.preventDefault();

    const message = messageTextarea.value;
    messageTextarea.value = '';

    if (/^\s*$/u.test(message)) {
      return;
    }

    window.messages.sendMessage(message);
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

  function toggleChatImageSize () {
    const root = document.querySelector(':root');
    const messages = document.querySelector('div#messages');

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
  }

  function nextMode () {
    currentMode += 1;
    currentImage = 0;

    if (currentMode > window.modes.modes.length - 1) {
      currentMode = 0;
    }

    updateMode();
  }

  function moveModeTo (mode) {
    if (mode < 0 || mode > window.modes.modes.length - 1) {
      return;
    }

    currentMode = mode;
    currentImage = 0;

    updateMode();
  }

  function updateMode () {
    assets = window.assets[window.modes.modes[currentMode]];
    currentModeSpan.textContent = window.modes.modes[currentMode];
    updateImage();
  }
});
