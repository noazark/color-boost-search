const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const lunr = require('lunr');
const convert = require('color-convert');
const express = require('express');
const _ = require('lodash')
const util = require('./util')
const math = require('mathjs')

const colorDB = fs.readFileSync(__dirname + '/colornames.csv');
let colors = parse(colorDB, {
    columns: true,
    skip_empty_lines: true
});
colors = colors.map(({ name, hex }) => {
    return {
        name,
        hex,
        lab: convert.hex.lab(hex)
    }
});

const idx = lunr(function () {
    this.field('name');
    this.ref('id');

    colors.forEach(({ name }, id) => {
        this.add({ id, name })
    });
});

function algo0(term) {
    const meta = {};
    
    let results = idx.search(term);

    results.forEach((result) => {
        result.doc = colors[result.ref]
    });

    return {results, meta};
}

function algo1(term) {
    const meta = {};

    // #1
    let results = idx.search(term);

    results.forEach((result) => {
        result.doc = colors[result.ref];
    });

    if (results.length === 0) {
        return {
            results: results,
            meta
        }
    }

    const scores = _.map(results, 'score');
    meta.std = math.std(scores);
    meta.mean = math.mean(scores);

    meta.significance = (results[0].score - meta.mean) / meta.std;

    if (meta.significance >= 5) {
        meta.factor = .9;
    } else if (meta.significance >= 4) {
        meta.factor = .75;
    } else if (meta.significance >= 3) {
        meta.factor = .5;
    } else if (meta.significance >= 2) {
        meta.factor = .25;
    } else {
        meta.factor = 0;
    }

    if (meta.factor) {
        // #2
        const dominantColor = colors[results[0].ref];

        // #3
        results = results.map(({ ref, doc, score }, idx) => {
            const color = colors[ref];
            const deltaE = util.computeDistance(dominantColor.lab, color.lab);
            const blended = util.blendResults(score, deltaE, {factor: meta.factor});

            return {
                ref,
                doc,
                score: blended,
                originalIdx: idx,
                scores: {
                    term: score,
                    deltaE,
                    blended,
                    boost: util.boost(score, deltaE, {factor: meta.factor})
                }
            };
        });

        results = _.reverse(_.sortBy(results, 'score'));
    }

    return {
        results,
        meta
    };
}

const app = express();
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    const query = req.query.q || '';
    const colorBoostEnabled = req.query.boost === '1'
    const {results, meta} = colorBoostEnabled ? algo1(query) : algo0(query);

    res.render('search-results', {
        query,
        results,
        colorBoostEnabled,
        meta
    });
});

app.listen(process.env.PORT || 3000, () => {
    console.log('server started');
});