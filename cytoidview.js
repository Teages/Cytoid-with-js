function cytoidView(svgID, chart_input, pageID, displayMode = "") {
    if (!chart_input.page_list[pageID]) return;
    let chart = JSON.parse(JSON.stringify(chart_input)) // Deep Copy

    const topRatio = 0.0966666
    const bottomRatio = 0.07
    let width = 800, height = 600
    let innerWidth = width * 0.82
    let innerHeight = height * (1 - width * (topRatio + bottomRatio) / height)
    let innerOffset = (width * (topRatio - (topRatio + bottomRatio) / 2.0))
    let noteSize = height * 0.1 * 1.2

    let noteScale = 1.0
    let noteRingColor = "#FFFFFF"
    let noteColor = [
        "#35A7FF", "#FF5964",
        "#39E59E", "#39E59E",
        "#35A7FF", "#FF5964",
        "#F2C85A", "#F2C85A",
        "#35A7FF", "#FF5964",
        "#39E59E", "#39E59E",
    ]
    /*  
        [
            click up, click down,
            drag 1, drag 2,
            hold 1, hold 2,
            long hold 1, long hold 2,
            flick 1, flick 2,
            c-drag 1, c-drag 2
        ]
    */

    function getScreenX(X) {
        return innerWidth * X + (width - innerWidth) / 2
    }

    function getScreenY(Y) {
        return innerHeight * Y + (height - innerHeight) / 2 + innerOffset;
    }

    function chartinit(_viewer) {
        let page = chart.page_list[pageID]
        document.getElementById(svgID).innerHTML = '';
        _viewer.rect(0, 0, width, height);
        _viewer.paper.line(0, getScreenY(0), width, getScreenY(0)).attr({
            stroke: "#fff",
            strokeDasharray: "10,20",
            strokeWidth: 4 - page.scan_line_direction
        });
        _viewer.paper.line(0, getScreenY(1), width, getScreenY(1)).attr({
            stroke: "#fff",
            strokeDasharray: "10,20",
            strokeWidth: 4 + page.scan_line_direction
        });
        let res = _viewer.rect(0, 0, width, height).attr({
            fill: "#00000000"
        })
        return res
    }

    function printNote(pageID, noteBox, ghost = false, opacity = 1) {
        // Calc all y
        for (let note_p in chart.note_list) {
            let note = chart.note_list[note_p]
            let page = chart.page_list[note.page_index]
            note.y = (note.tick - page.start_tick) / (page.end_tick - page.start_tick)
            if (page.scan_line_direction == 1) note.y = 1 - note.y
        }


        let page = chart.page_list[pageID]
        // Show Chains
        for (let note_p in chart.note_list) {
            let note = chart.note_list[note_p]
            let printed = []
            if ((note.page_index == pageID || (!ghost && displayMode != "pre" && note.next_id > note_p && chart.note_list[note.next_id].page_index == pageID)) &&
                [3, 4, 6, 7].indexOf(note.type) >= 0 && printed.indexOf(note_p) < 0) {

                let father_p = note_p, node_p = note.next_id
                while (node_p > father_p) {
                    let father = chart.note_list[father_p]
                    let node = chart.note_list[node_p]

                    if (displayMode == "pre" && (node.page_index > father.page_index + 1)) break;
                    noteBox.paper.line(getScreenX(father.x), getScreenY(father.y), getScreenX(node.x), getScreenY(node.y)).attr({
                        stroke: noteRingColor,
                        strokeDasharray: "4,3",
                        strokeWidth: noteScale * 8,
                        opacity: opacity
                    });
                    printed += father_p // Printed Chain
                    father_p = node_p
                    node_p = chart.note_list[father_p].next_id

                    if (chart.note_list[father_p].page_index != pageID) break;
                }
            }
        }

        // Show notes
        for (let note_p in chart.note_list) {
            let note = chart.note_list[chart.note_list.length - 1 - note_p]
            if (note.page_index == pageID) {
                switch (note.type) {
                    case 0:
                        noteBox.paper.circle(getScreenX(note.x), getScreenY(note.y), noteScale * noteSize * 0.8).attr({
                            fill: noteColor[0 + (page.scan_line_direction != 1)],
                            stroke: noteRingColor,
                            strokeWidth: noteScale * 8,
                            opacity: opacity
                        });
                        break;
                    case 1:
                        let l = (note.hold_tick / (page.end_tick - page.start_tick))
                        if (page.scan_line_direction == 1) l = - l;
                        noteBox.paper.line(getScreenX(note.x), getScreenY(note.y), getScreenX(note.x),
                            getScreenY(note.y + l)).attr({
                                stroke: noteRingColor,
                                strokeDasharray: "4,3",
                                strokeWidth: noteScale * 28,
                                opacity: opacity
                            });
                        noteBox.paper.circle(getScreenX(note.x), getScreenY(note.y), noteScale * noteSize * 0.8).attr({
                            fill: noteColor[4 + (page.scan_line_direction != 1)],
                            stroke: noteRingColor,
                            strokeWidth: noteScale * 8,
                            opacity: opacity
                        });
                        noteBox.paper.circle(getScreenX(note.x), getScreenY(note.y), noteScale * noteSize * 0.47).attr({
                            fill: "#00000000",
                            stroke: noteRingColor,
                            strokeWidth: noteScale * 4,
                            opacity: opacity
                        });
                        break;
                    case 2:
                        noteBox.paper.line(getScreenX(note.x), 0, getScreenX(note.x), height).attr({
                            stroke: noteRingColor,
                            strokeDasharray: "4,3",
                            strokeWidth: noteScale * 28,
                            opacity: opacity
                        });
                        noteBox.paper.circle(getScreenX(note.x), getScreenY(note.y), noteScale * noteSize * 0.8).attr({
                            fill: noteColor[6 + (page.scan_line_direction != 1)],
                            stroke: noteRingColor,
                            strokeWidth: noteScale * 8,
                            opacity: opacity
                        });
                        noteBox.paper.circle(getScreenX(note.x), getScreenY(note.y), noteScale * noteSize * 0.47).attr({
                            fill: "#00000000",
                            stroke: noteRingColor,
                            strokeWidth: noteScale * 4,
                            opacity: opacity
                        });
                        break;
                    case 3:
                        noteBox.paper.circle(getScreenX(note.x), getScreenY(note.y), noteScale * noteSize * 0.5).attr({
                            fill: noteRingColor,
                            opacity: opacity
                        });
                        noteBox.paper.circle(getScreenX(note.x), getScreenY(note.y), noteScale * noteSize * 0.3 * 0.7).attr({
                            fill: noteColor[2 + (page.scan_line_direction != 1)],
                            opacity: opacity
                        });
                        break;
                    case 4:
                        noteBox.paper.circle(getScreenX(note.x), getScreenY(note.y), noteScale * noteSize * 0.3 * 0.7).attr({
                            fill: noteColor[2 + (page.scan_line_direction != 1)],
                            opacity: opacity
                        });
                        break;
                    case 5:
                        let size = noteScale * noteSize * 0.9, x = getScreenX(note.x), y = getScreenY(note.y)
                        noteBox.paper.polyline([
                            x, y - size,
                            x + size, y,
                            x, y + size,
                            x - size, y,
                            x, y - size,
                            x + size, y
                        ]).attr({
                            fill: noteRingColor,
                            stroke: noteRingColor,
                            strokeLinejoin: "round",
                            strokeWidth: noteScale * 8,
                        })
                        noteBox.paper.polyline([
                            x, y - size * 0.8,
                            x + size * 0.8, y,
                            x, y + size * 0.8,
                            x - size * 0.8, y,
                            x, y - size * 0.8,
                            x + size * 0.8, y
                        ]).attr({
                            fill: noteColor[8 + (page.scan_line_direction != 1)],
                            stroke: noteColor[8 + (page.scan_line_direction != 1)],
                            strokeLinejoin: "round",
                            strokeWidth: noteScale * 8,
                        })
                        noteBox.paper.polyline([
                            x + size * 0.8, y + size * 0.6,
                            x + size * 1.4, y,
                            x + size * 0.8, y - size * 0.6
                        ]).attr({
                            fill: "#00000000",
                            stroke: noteRingColor,
                            strokeLinejoin: "round",
                            strokeWidth: noteScale * 5,
                        })
                        noteBox.paper.polyline([
                            x - size * 0.8, y + size * 0.6,
                            x - size * 1.4, y,
                            x - size * 0.8, y - size * 0.6
                        ]).attr({
                            fill: "#00000000",
                            stroke: noteRingColor,
                            strokeLinejoin: "round",
                            strokeWidth: noteScale * 5,
                        })
                        noteBox.paper.polyline([
                            x + size * 0.07, y - size * 0.35,
                            x + size * 0.07 + size * 0.35, y,
                            x + size * 0.07, y + size * 0.35,
                            x + size * 0.07, y - size * 0.35,
                            x + size * 0.07 + size * 0.35, y,
                        ]).attr({
                            fill: noteRingColor,
                            stroke: noteRingColor,
                            strokeLinejoin: "round",
                            strokeWidth: noteScale * 3,
                        })
                        noteBox.paper.polyline([
                            x - size * 0.07, y - size * 0.35,
                            x - size * 0.07 - size * 0.35, y,
                            x - size * 0.07, y + size * 0.35,
                            x - size * 0.07, y - size * 0.35,
                            x - size * 0.07 - size * 0.35, y,
                        ]).attr({
                            fill: noteRingColor,
                            stroke: noteRingColor,
                            strokeLinejoin: "round",
                            strokeWidth: noteScale * 3,
                        })
                        break;
                    case 6:
                        noteBox.paper.circle(getScreenX(note.x), getScreenY(note.y), noteScale * noteSize * 0.8).attr({
                            fill: noteColor[10 + (page.scan_line_direction != 1)],
                            stroke: noteRingColor,
                            strokeWidth: noteScale * 8,
                            opacity: opacity
                        });
                        break;
                    case 7:
                        noteBox.paper.circle(getScreenX(note.x), getScreenY(note.y), noteScale * noteSize * 0.3 * 0.7).attr({
                            fill: noteColor[10 + (page.scan_line_direction != 1)],
                            opacity: opacity
                        });
                        break;
                    default:
                        break;
                }
            } else if (((note.tick + note.hold_tick) > page.start_tick) && (note.tick <= page.start_tick) && note.type == 2) {
                if ((note.tick + note.hold_tick) > page.end_tick) {
                    noteBox.paper.line(getScreenX(note.x), 0, getScreenX(note.x), height).attr({
                        stroke: noteRingColor,
                        strokeDasharray: "4,3",
                        strokeWidth: noteScale * 28,
                        opacity: opacity
                    });
                } else {
                    noteBox.paper.line(getScreenX(note.x), 0, getScreenX(note.x),
                        getScreenY(((note.tick + note.hold_tick - page.start_tick) / (page.end_tick - page.start_tick)))).attr({
                            stroke: noteRingColor,
                            strokeDasharray: "4,3",
                            strokeWidth: noteScale * 28,
                            opacity: opacity
                        });
                }
            }
        }
    }

    let viewer = Snap('#' + svgID);
    viewer.attr({
        viewBox: "0 0 " + String(width) + " " + String(height)
    })
    let noteBox = chartinit(viewer)
    if (displayMode == "pre" || displayMode == "next") {
        if (displayMode == "pre" && pageID > 1) {
            printNote(pageID - 1, noteBox, true)
        } else if (displayMode == "next" && (chart.page_list.length - pageID) > 1) {
            printNote(pageID + 1, noteBox, true)
        }
    }
    viewer.paper.rect(0, 0, width, height).attr({
        fill: "#000000aa"
    })
    printNote(pageID, noteBox, false)
    // console.log(viewer.innerSVG());
    console.log(pageID)
    delete viewer;
    return;
}

function showAllPages(containerID, chart, displayMode, skipBefore = true, skipAfter = true) {

    function randomString(e) {
        e = e || 32;
        var t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz",
            a = t.length,
            n = "";
        for (i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a));
        return n
    }
    function newSVG() {
        const ns = 'http://www.w3.org/2000/svg';
        let el = document.createElementNS(ns, "svg");
        return el;
    }

    let start_page_p = 0
    let end_page_p = chart.page_list.length

    if (skipBefore || skipAfter) {
        let min = chart.note_list[0].page_index
        let max = chart.note_list[0].page_index 
        for(let note_p in chart.note_list) {
            if (chart.note_list[note_p].page_index < min) min = chart.note_list[note_p].page_index;
            if (chart.note_list[note_p].page_index > max) max = chart.note_list[note_p].page_index;
        }

        if (skipBefore) start_page_p = min;
        if (skipAfter) end_page_p = max+2;
    }

    for (let page_p = start_page_p; page_p < end_page_p; page_p++) {
        let page = document.getElementById(containerID).appendChild(newSVG());
        page.id = randomString(16)
        cytoidView(page.id, chart, page_p, displayMode)
        console.log(page_p)
        page.id = "page-" + String(page_p)
    }

}