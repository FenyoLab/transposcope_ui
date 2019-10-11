/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }]*/

const _ = require("lodash");

// 1000; 3912

function buildRead(read) {
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
          bases = bases.slice(rf.pos - 1);
        }
      } else if (rf.code === "X") {
        // This is more for coloring differences
        //console.log(rf);
        //console.log(bases.charAt(rf.pos - 1));
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
        //console.log("UNSEEN REFERENCE FLAG", rf);
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
  let r1 = read1 == undefined ? undefined : buildRead(read1);
  let r2 = read2 == undefined ? undefined : buildRead(read2);
  return [r1, r2];
}

function classifyRead(read) {
  // TODO: Add unmapped condition
  if (read.rStart < 1000 && read.rEnd < 1000) return "G5";
  else if (read.rStart > 3912 && read.rEnd > 3912) return "G3";
  else if (1000 < read.rStart && read.rEnd < 3912) return "L";
  //else if (read.rStart <= 1000 && 3912 <= read.rEnd) return "JS";
  else if (read.rStart <= 1000 && read.rEnd >= 1000) return "J5";
  else if (read.rStart <= 3912 && read.rEnd >= 3912) return "J3";
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
  "J5|J3": ["j_j5", "j_j3"],
  "J5|G3": ["g_jJ", "g_jG"],
  "J5|unmapped": ["jn", "unmapped"],
  "L|G5": ["glL", "glG"],
  "L|J5": ["jlL", "jlJ"],
  "L|L": ["ll", "ll"],
  "L|J3": ["jlL", "jlJ"],
  "L|G3": ["glL", "glG"],
  "L|unmapped": ["ln", "unmapped"],
  "J3|G5": ["g_jJ", "g_jG"],
  "J3|J5": ["j_j3", "j_j5"],
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

function classifyResults(reads) {
  let r1Type = reads[0] ? classifyRead(reads[0]) : "unmapped";
  let r2Type = reads[1] ? classifyRead(reads[1]) : "unmapped";
  let type = orientationMappings[r1Type + "|" + r2Type] || [
    "unmapped",
    "unmapped"
  ];
  if (type === ["unmapped", "unmapped"]) console.log("double unmapped");

  //console.log(r1Type + "|" + r2Type, type);
  //if (r1Type == "G5" && r2Type == "G5") {
  //  type = ["gg", "gg"];
  //} else if (r1Type == "G3" && r2Type == "G3") {
  //  type = ["gg", "gg"];
  //} else if (r1Type == "G5" && r2Type == "G3") {
  //  type = ["g_g", "g_g"];
  //} else if (r1Type == "J5" && r2Type == "J5") {
  //  type = ["jj", "jj"];
  //} else if (r1Type == "J3" && r2Type == "J3") {
  //  type = ["jj", "jj"];
  //} else if (r1Type == "L" && r2Type == "L") {
  //  type = ["ll", "ll"];
  //} else if (r1Type == "G5" && r2Type == "L") {
  //  type = ["gl_g", "gl_l"];
  //} else if (r1Type == "L" && r2Type == "G3") {
  //  type = ["gl_l", "gl_g"];
  //} else if (r1Type == "G5" && r2Type == "J5") {
  //  type = ["gj_g", "gj_j"];
  //} else if (r1Type == "J3" && r2Type == "G3") {
  //  type = ["gj_j", "gj_g"];
  //} else if (r1Type == "G5" && r2Type == "J3") {
  //  type = ["g_j_g", "g_j_j"];
  //} else if (r1Type == "J5" && r2Type == "G3") {
  //  type = ["g_j_j", "g_j_g"];
  //} else if (r1Type == "G5" && r2Type == "JS") {
  //  type = ["g_j_g", "g_j_j"];
  //} else if (r1Type == "JS" && r2Type == "G3") {
  //  type = ["g_j_j", "g_j_g"];
  //} else if (r1Type == undefined && r2Type == "G5") {
  //  type = [undefined, "gn"];
  //} else if (r1Type == "G5" && r2Type == undefined) {
  //  type = ["gn", undefined];
  //} else if (r1Type == undefined && r2Type == "G3") {
  //  type = [undefined, "gn"];
  //} else if (r1Type == "G3" && r2Type == undefined) {
  //  type = ["gn", undefined];
  //} else if (r1Type == undefined && r2Type == "J5") {
  //  type = [undefined, "jn"];
  //} else if (r1Type == "J5" && r2Type == undefined) {
  //  type = ["jn", undefined];
  //} else if (r1Type == undefined && r2Type == "J3") {
  //  type = [undefined, "jn"];
  //} else if (r1Type == "J3" && r2Type == undefined) {
  //  type = ["jn", undefined];
  //} else if (r1Type == undefined && r2Type == "L") {
  //  type = [undefined, "ln"];
  //} else if (r1Type == "L" && r2Type == undefined) {
  //  type = ["ln", undefined];
  //} else {
  //  console.log(r1Type, r2Type);
  //}

  return type;
}

export async function loadCramRecords(indexedFile, start, end) {
  if (indexedFile != null) {
    const records = await indexedFile.getRecordsForRange(
      0,
      start - 200,
      end + 200
    );
    //const records = await indexedFile.getRecordsForRange(0, 200, 300);
    // TODO: Update the size of the histogram to the region size with padding
    console.log(start - end);
    let histogram = _.map(Array(500 + end - start), (d, i) => {
      return {
        total: 0,
        bpStat: { A: 0, C: 0, G: 0, T: 0, N: 0, X: 0 },
        key: i,
        classes: {
          gg: {
            total: 0,
            name: "gg"
          },
          jj: {
            total: 0,
            name: "jj"
          },
          ll: {
            total: 0,
            name: "ll"
          },
          gn: {
            total: 0,
            name: "gn"
          },
          jn: {
            total: 0,
            name: "jn"
          },
          ln: {
            total: 0,
            name: "ln"
          },
          g_g: {
            total: 0,
            name: "g_g"
          },
          g_jG: {
            total: 0,
            name: "g_jG"
          },
          g_jJ: {
            total: 0,
            name: "g_jJ"
          },
          gjG: {
            total: 0,
            name: "gjG"
          },
          gjJ: {
            total: 0,
            name: "gjJ"
          },
          glL: {
            total: 0,
            name: "glL"
          },
          glG: {
            total: 0,
            name: "glG"
          },
          jlJ: {
            total: 0,
            name: "jlJ"
          },
          jlL: {
            total: 0,
            name: "jlL"
          },
          j_j5: {
            total: 0,
            name: "j_j5"
          },
          j_j3: {
            total: 0,
            name: "j_j3"
          }
        }
      };
    });
    // FIXME: There are 10 reads missing from pos 114
    let count = 0;
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
        let orientations = classifyResults(results);
        let result = results[0];
        let orientation = orientations[0];
        if (result) {
          count += 1;
          _.forEach(result.bases, (base, index) => {
            if (orientation !== "unmapped") {
              if (base !== "X") {
                histogram[result.aStart + index].classes[
                  orientation
                ].total += 1;
              }

              histogram[result.aStart + index].bpStat[base] += 1;
              histogram[result.aStart + index].total += 1;
            }
          });
        }
        result = results[1];
        orientation = orientations[1];
        if (result) {
          count += 1;
          _.forEach(result.bases, (base, index) => {
            if (orientation !== "unmapped") {
              if (base !== "X") {
                histogram[result.aStart + index].classes[
                  orientation
                ].total += 1;
              }

              histogram[result.aStart + index].bpStat[base] += 1;
              histogram[result.aStart + index].total += 1;
            }
          });
        }
      })
      .value();
    console.log("num_records", records.length);
    console.log("processed_reads", count);
    console.log(histogram[114]);
    console.log(histogram[115]);
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
