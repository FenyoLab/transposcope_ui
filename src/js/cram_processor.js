/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }]*/

const _ = require("lodash");

// meStartCoord; meEndCoord

function buildRead (read) {
  let alignmentStart = read.alignmentStart;
  let readStart = read.alignmentStart;
  let alignmentEnd = readStart + read.lengthOnRef;
  let readEnd = alignmentEnd;
  let bases = read.getReadBases();
  if (read.readFeatures != undefined) {
    read.readFeatures.reverse().forEach(rf => {
      // process the "read features". this can be used similar to
      // CIGAR/MD strings in SAM. see CRAM specs for more details.
      if (rf.code === "S") {
        if (rf.pos === 1) {
          readStart -= rf.data.length;
          bases = bases.slice(rf.pos - 1 + rf.data.length);
        } else {
          readEnd += rf.data.length;
          bases = bases.slice(0, rf.pos - 1);
        }
        // } else if (rf.code === "X") {
        // These changes have already been made in getReadBases
        // console.log('X')
      } else if (rf.code === "D") {
        bases =
          bases.slice(0, rf.pos - 1) +
          "X".repeat(rf.data) +
          bases.slice(rf.pos - 1);

        //} else if (rf.code === "I") {
        //console.log("I");
        //} else if (rf.code === "i") {
        //console.log("i");
      } else {
        //TODO: Make sure that all flags are being processed
        // console.log("UNSEEN REFERENCE FLAG", rf)
      }
    });
  }
  return {
    aStart: alignmentStart,
    bases: bases,
    rStart: readStart,
    rEnd: readEnd
  };
}

function processReads (read1, read2) {
  let r1 = read1 == undefined ? undefined : buildRead(read1);
  let r2 = read2 == undefined ? undefined : buildRead(read2);
  return [r1, r2];
}

function classifyRead (read, meStartCoord, meEndCoord) {
  // TODO: Add unmapped condition
  if (read.rStart < meStartCoord && read.rEnd < meStartCoord) return "G5";
  else if (read.rStart > meEndCoord && read.rEnd > meEndCoord) return "G3";
  else if (meStartCoord < read.rStart && read.rEnd < meEndCoord) return "L";
  //else if (read.rStart <= meStartCoord && meEndCoord <= read.rEnd) return "JS";
  else if (read.rStart <= meStartCoord && read.rEnd >= meStartCoord) return "J5";
  else if (read.rStart <= meEndCoord && read.rEnd >= meEndCoord) return "J3";
  else return null;
}

const orientationMappings = {
  "unmapped|G5": ["unmapped", "gn"],
  "unmapped|J5": ["unmapped", "jn"],
  "unmapped|L": ["unmapped", "ln"],
  "unmapped|J3": ["unmapped", "jn"],
  "G5|G5": ["gg", "gg"],
  "G5|J5": ["gjG", "gjJ"],
  "G5|L": ["glG", "glL"],
  "G5|J3": ["g_jG", "g_jJ"],
  "G5|G3": ["g_g", "g_g"],
  "G5|unmapped": ["gn", "unmapped"],
  "J5|G5": ["gjJ", "gjG"],
  "J5|J5": ["jj", "jj"],
  "J5|L": ["jlJ", "jlL"],
  "J5|J3": ["j_j", "j_j"],
  "J5|G3": ["g_jJ", "g_jG"],
  "J5|unmapped": ["jn", "unmapped"],
  "L|G5": ["glL", "glG"],
  "L|J5": ["jlL", "jlJ"],
  "L|L": ["ll", "ll"],
  "L|J3": ["jlL", "jlJ"],
  "L|G3": ["glL", "glG"],
  "L|unmapped": ["ln", "unmapped"],
  "J3|G5": ["g_jJ", "g_jG"],
  "J3|J5": ["j_j", "j_j"],
  "J3|L": ["jlJ", "jlL"],
  "J3|J3": ["jj", "jj"],
  "J3|G3": ["gjJ", "gjG"],
  "J3|unmapped": ["jn", "unmapped"],
  "G3|G5": ["g_g", "g_g"],
  "G3|J5": ["g_jG", "g_jJ"],
  "G3|L": ["glG", "glL"],
  "G3|J3": ["gjG", "gjJ"],
  "G3|G3": ["gg", "gg"],
  "G3|unmapped": ["gn", "unmapped"]
};

function classifyResults (reads, meStartCoord, meEndCoord) {
  let r1Type = reads[0] ? classifyRead(reads[0], meStartCoord, meEndCoord) : "unmapped";
  let r2Type = reads[1] ? classifyRead(reads[1], meStartCoord, meEndCoord) : "unmapped";
  let type = orientationMappings[r1Type + "|" + r2Type] || [
    "unmapped",
    "unmapped"
  ];
  if (type === ["unmapped", "unmapped"]) console.log("double unmapped");

  return type;
}

export async function loadCramRecords (indexedFile, start, end, meStartCoord, meEndCoord) {
  if (indexedFile != null) {
    const records = await indexedFile.getRecordsForRange(
      0,
      start - 200,
      end + 200
    );
    //const records = await indexedFile.getRecordsForRange(0, 200, 300);
    // TODO: Update the size of the histogram to the region size with padding
    let histogram = _.map(Array(10 + end - start), (d, i) => {
      return {
        total: 0,
        bpStat: { A: 0, C: 0, G: 0, T: 0, N: 0, X: 0 },
        key: i,
        classes: {
          gg: 0,
          jj: 0,
          ll: 0,
          gn: 0,
          jn: 0,
          ln: 0,
          g_g: 0,
          g_jG: 0,
          g_jJ: 0,
          gjG: 0,
          gjJ: 0,
          glL: 0,
          glG: 0,
          jlJ: 0,
          jlL: 0,
          j_j5: 0,
          j_j3: 0
        }
      };
    });
    _.chain(records)
      .groupBy(record => record.readName)
      .forEach((reads, _unusedReadName) => {
        if (reads.length == 1) {
          if (reads[0].flags & 0x40) reads = [reads[0], undefined];
          if (reads[0].flags & 0x80) reads = [undefined, reads[0]];
        } else {
          reads = reads.sort(r => r.alignmentStart);
        }
        let results = processReads(reads[0], reads[1]);
        let orientations = classifyResults(results, meStartCoord, meEndCoord);
        let result = results[0];
        let orientation = orientations[0];
        if (result) {
          // count += 1;
          _.forEach(result.bases, (base, index) => {
            if (orientation !== "unmapped") {
              if (base !== "X") {
                histogram[result.aStart + index].classes[orientation] += 1;
              }

              histogram[result.aStart + index].bpStat[base] += 1;
              histogram[result.aStart + index].total += 1;
            }
          });
        }
        result = results[1];
        orientation = orientations[1];
        if (result) {
          // count += 1;
          _.forEach(result.bases, (base, index) => {
            if (orientation !== "unmapped") {
              if (base !== "X") {
                histogram[result.aStart + index].classes[orientation] += 1;
              }

              histogram[result.aStart + index].bpStat[base] += 1;
              histogram[result.aStart + index].total += 1;
            }
          });
        }
      })
      .value();
    return histogram;
  }
}

export async function getReads (indexedFile, insertionSite, paddingWidth, referenceWidth) {
  let start = insertionSite - paddingWidth;
  let end = insertionSite + paddingWidth;
  if (indexedFile != null) {
    const records = await indexedFile.getRecordsForRange(0, start, end);
    let data = _.map(records, record => {
      let result_sequence = [];
      let insertions = [];
      let clipping_offset = 0;
      let bases = record.getReadBases();
      if (record.readFeatures != undefined) {
        _.sortBy(record.readFeatures, r => r.pos)
          .reverse()
          .forEach(rf => {
            if (rf.code === "S") {
              if (rf.pos === 1) {
                clipping_offset = rf.data.length;
              }
              if (bases.slice(rf.pos - 1 + rf.data.length)) {
                result_sequence.unshift(
                  ["<span>", bases.slice(rf.pos - 1 + rf.data.length), "</span>"]
                )
              }
              result_sequence.unshift(
                ["<span style='color: red'>",
                  rf.data,
                  "</span>"]);
            } else if (rf.code === "X") {
              if (bases.slice(rf.pos)) {
                result_sequence.unshift(
                  ["<span>", bases.slice(rf.pos), "</span>"]
                );
              }
              result_sequence.unshift(
                ["<span style='color: orange;font-weight: bold'>",
                  rf.sub,
                  "</span>"]);

            } else if (rf.code === "D") {
              if (bases.slice(rf.pos - 1)) {
                result_sequence.unshift(
                  ["<span>", bases.slice(rf.pos - 1), "</span>"]
                );
              }
              result_sequence.unshift([
                "<span style='color: brown;font-weight: bold'>",
                "X".repeat(rf.data),
                "</span>"
              ])
            } else if (rf.code === "I") {
              if (bases.slice(rf.pos)) {
                result_sequence.unshift(
                  ["<span>", bases.slice(rf.pos), "</span>"]
                );
              }
              insertions.push([result_sequence.length, rf.data]);
            } else if (rf.code === "i") {
              if (bases.slice(rf.pos)) {
                result_sequence.unshift(
                  ["<span>", bases.slice(rf.pos), "</span>"]
                );
              }
              insertions.push([result_sequence.length, rf.data]);
            } else {
              console.log("UNSEEN REFERENCE FLAG", rf);
            }
            bases = bases.slice(0, rf.pos - 1);
          });
      }
      result_sequence.unshift(["<span>", bases, "</span>"])
      let padding = " ".repeat(
        (referenceWidth - 1) - ((insertionSite) - (record.alignmentStart - clipping_offset))
      );
      let numSections = result_sequence.length;
      _.forEach(insertions, i => {
        let idx = numSections - i[0];
        result_sequence[idx][1] = "<abbr title='" + i[1] + "'>" + result_sequence[idx][1][0] + "</abbr>" + result_sequence[idx][1].slice(1);
        if (idx - 1 > 0) {
          result_sequence[idx - 1][1] = result_sequence[idx - 1][1].slice(0, result_sequence[idx - 1][1].length - 1) + "<abbr title='" + i[1] + "'>" + result_sequence[idx - 1][1][result_sequence[idx - 1][1].length - 1] + "</abbr>";
        }
      });
      return padding + _.join(_.map(result_sequence, d => _.join(d, "")), '');
    });
    return data;
  }
}
