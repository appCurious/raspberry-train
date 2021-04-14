
const getSvgDocument = (selector) => {
  const elem = document.querySelector(selector);
  return elem.contentDocument;
};

export default getSvgDocument;
