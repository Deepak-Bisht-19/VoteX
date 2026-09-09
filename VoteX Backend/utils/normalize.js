const normalizeText = (text) => {
    if (!text) return '';
    return text.toLowerCase().replace(/\s+/g, "").trim();
};

module.exports = { normalizeText };