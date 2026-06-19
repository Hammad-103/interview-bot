import '@testing-library/jest-dom'

// Canvas mock — jsdom mein canvas support nahi hai
HTMLCanvasElement.prototype.getContext = () => ({
  clearRect: () => {},
  save: () => {},
  restore: () => {},
  translate: () => {},
  rotate: () => {},
  fillRect: () => {},
  fillStyle: '',
})