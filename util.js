function computeDistance(l1, l2) {
    const distance = Math.sqrt(
        ((l1[0] - l2[0]) ** 2) +
        ((l1[1] - l2[1]) ** 2) +
        ((l1[2] - l2[2]) ** 2)
    );
    return distance;
}

function blendResults(term, color, {factor}) {
    return (term * (1 - factor)) + boost(term, color, {factor});
}

function boost(term, color, {factor}) {
    return ((term * factor) * (1-color / 100));
}

module.exports = {
    computeDistance,
    blendResults,
    boost
}