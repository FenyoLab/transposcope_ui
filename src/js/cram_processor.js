const d3 = require("d3");
const _ = require("lodash");

// 1000; 3912

function buildRead(read) {
  let alignmentStart = read.alignmentStart;
  let readStart = read.alignmentStart;
  let alignmentEnd = readStart + read.lengthOnRef;
  let readEnd = alignmentEnd;
  let bases = read.getReadBases();
  if (read.readFeatures != undefined) {
    read.readFeatures.forEach(rf => {
      // process the "read features". this can be used similar to
      // CIGAR/MD strings in SAM. see CRAM specs for more details.
      if (rf.code === "S") {
        if (rf.pos === 1) {
          readStart -= rf.data.length;
        } else {
          readEnd += rf.data.length;
        }
      } else if (rf.code === "X") {
        // This is more for coloring differences
        //console.log(rf);
        //console.log(bases.charAt(rf.pos - 1));
      } else if (rf.code === "D") {
        //console.log("D");
      } else if (rf.code === "I") {
        //console.log("I");
      } else if (rf.code === "i") {
        //console.log("i");
      } else {
        console.log("UNSEEN REFERENCE FLAG", rf);
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

function processReads(read1, read2) {
  return [buildRead(read1), buildRead(read2)];
}

function classifyResults(results) {
  let type = undefined;
  if (results[1].rEnd < 1000) {
    type = 0;
  }
  if (results[0].rStart > 3912) {
    type = 1;
  }
  if (results[0].rEnd < 1000 && results[1].rStart > 3912) {
    type = 2;
  }
  if (
    results[0].rEnd < 1000 &&
    (results[1].rStart < 1000 && results[1].rEnd > 1000)
  ) {
    type = 3;
  }
  if (
    results[0].rEnd < 1000 &&
    (results[1].rStart > 1000 && results[1].rEnd < 3912)
  ) {
    type = 4;
  }
  return type;
}

export async function loadCramRecords(indexedFile, start, end) {
  if (indexedFile != null) {
    const records = await indexedFile.getRecordsForRange(0, start, end);
    //const records = await indexedFile.getRecordsForRange(0, 200, 300);
    // TODO: Update the size of the histogram to the region size with padding
    let histogram = _.map(Array(5000), (d, i) => {
      return {
        total: 0,
        key: i,
        classes: [
          { total: 0, name: "ggn" },
          { total: 0, name: "ggn" },
          { total: 0, name: "ngg" },
          { total: 0, name: "gjn" },
          { total: 0, name: "gln" }
        ]
      };
    });
    _.chain(records)
      .groupBy(record => record.readName)
      .forEach((reads, readName) => {
        if (reads.length == 2) {
          reads = reads.sort(r => r.alignmentStart);
          let results = processReads(reads[0], reads[1]);
          let orientation = classifyResults(results);
          results.forEach(result => {
            _.forEach(result.bases, (base, index) => {
              if (orientation !== undefined) {
                histogram[result.aStart + index].classes[
                  orientation
                ].total += 1;
              }
              histogram[result.aStart + index].total += 1;
            });
          });
        }
      })
      .value();
    return histogram;
  }
}

export async function processCram(indexedFile, start, end) {
  if (indexedFile != null) {
    const records = await indexedFile.getRecordsForRange(0, start, end);
    let data = _.map(records, record => {
      let result_string = "";
      let clipping_offset = 0;
      let bases = record.getReadBases();
      if (record.readFeatures != undefined) {
        record.readFeatures.reverse().forEach(rf => {
          // process the "read features". this can be used similar to
          // CIGAR/MD strings in SAM. see CRAM specs for more details.
          if (rf.code === "S") {
            if (rf.pos === 1) {
              clipping_offset = rf.data.length;
            }
            result_string =
              "<span style='color: red'>" +
              rf.data +
              "</span>" +
              bases.slice(rf.pos - 1 + rf.data.length) +
              result_string;
          } else if (rf.code === "X") {
            result_string =
              "<span style='color: orange;font-weight: bold'>" +
              rf.sub +
              "</span>" +
              bases.slice(rf.pos) +
              result_string;
          } else if (rf.code === "D") {
            result_string =
              "<span style='color: brown;font-weight: bold'>" +
              "X".repeat(rf.data) +
              "</span>" +
              bases.slice(rf.pos - 1) +
              result_string;
          } else if (rf.code === "I") {
            console.log(record, rf);
          } else if (rf.code === "i") {
            result_string =
              "<span style='color: purple;font-weight: bold'>" +
              rf.data +
              "</span>" +
              bases.slice(rf.pos) +
              result_string;
          } else {
            console.log("UNSEEN REFERENCE FLAG", rf);
          }
          bases = bases.slice(0, rf.pos - 1);
        });
      }
      if (
        record.readName === "SRR622457.1303818473" ||
        record.readName === "SRR622457.1303817919"
      ) {
        //console.log("mate", record.readName, record.isRead1(), record.mate);
        console.log(record);
        //console.log(
        //  record.readName,
        //  record.isSegmentUnmapped(),
        //  record.isMateUnmapped(),
        //  record.isPaired(),
        //  record.isFailedQc(),
        //  record.isDetached()
        //);
      }
      let padding = ".".repeat(record.alignmentStart - clipping_offset + 100);
      result_string = padding + bases + result_string;
      return result_string;
    });
    return data;
  }
}
