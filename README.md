Color Search Engine
===================

**Goal**

Take a purely text based search and blend it with some "dominant color" to boost the perceived relevancy of the result-set.

1. Perform a full text search based on the `term` matching against color name.
2. Get the first result and call it `dominant color` (how the color is chosen doesn't really matter)
3. Blend all search results with a `blend factor` (0.0-1.0) based on calculated distance ([deltaE](https://en.wikipedia.org/wiki/Color_difference)) to the `dominant color`.

### Implementation

Term based search is run through a very simple in-memory search engine, [Lunr](https://lunrjs.com/). The goal for the term search was just to get the job done, not to be sophisticated. A richer search engine would surely yield better results around edge cases, but the effect it would have on stated goal is assumed to be insignificant.

The color boosting algorithm is only applied if the dominant color exceeds a specific threashold (see implementation) and the boosting factor increases as the [dominant color term score](https://en.wikipedia.org/wiki/Okapi_BM25) diverges from the standard deviation. I have no idea what I'm saying, it's just my best attempt to explain what ended up working. MOVING ON.

### Problems with current implementation

- Results are heavily biased by the first returned search term.
- Does not allow for introducing new results. All the results are derived from the original term based result-set.
- There has been no attempt to diversify the index (synonyms, etc).
- This algorithm would likely only work well with homogeneous sets, where all documents are colors.
