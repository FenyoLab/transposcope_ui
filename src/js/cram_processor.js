const _ = require("lodash");

export async function loadCramRecords(indexedFile, start, end) {
  if (indexedFile != null) {
    const records = await indexedFile.getRecordsForRange(0, start, end);
    // TODO: Update the size of the histogram to the region size with padding
    let histogram = _.fill(Array(5000), 0);
    _.chain(records)
      .groupBy(record => record.readName)
      .forEach((reads, readName) => {
        reads.forEach(read => {
          let alignmentStart = read.alignmentStart;
          let alignmnetEnd = read.lengthOnRef + read.alignmentStart;
          _.range(alignmentStart, alignmnetEnd).forEach(index => {
            histogram[index] += 1;
          });
        });
      })
      .value();
    return _.map(histogram, (d, i) => {
      return {
        x: i,
        y: d
      };
    });
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
