const p5code =
    "var ghost, asterisk;\n" +
    "var size_w = 100; size_h = 100;\n" +
    "var loc_x = 100; loc_y = 100;\n" +
    "preload = function() {\n" +
    "  //ghost = loadAnimation('assets/ghost_standing0001.png', 'assets/ghost_standing0007.png');\n" +
    "  //asterisk = loadAnimation('assets/asterisk_circle0000.png', 'assets/asterisk_circle0002.png');\n" +
    "};\n" +
    "simpleTriangle = function(x,y,w,h){\n" +
    "    triangle(x,y, x+w/2, y-h, x+w, y);\n" +
    "};\n" +
    "gridLines = function(){\n" +
    "  fill(0,0,66);\n" +
    "  stroke(0,0,77);\n" +
    "  for (var i = 0; i < width; i += 50) {\n" +
    "    line(i, 0, i, height);\n" +
    "    text(i, i + 1, 10);\n" +
    "  }\n" +
    "  for (var i = 0; i < height; i += 50) {\n" +
    "    line(0, i, width, i);\n" +
    "    text(i, 0, i - 1);\n" +
    "  }\n" +
    "};\n" +
    "{0}\n" +
    "setup = function() {\n" +
    " colorMode(HSL, 360, 100, 100);" +
    " var myCanvas = createCanvas(480, 320);\n" +
    " myCanvas.parent('myContainer');\n" +
    " gridLines();\n" +
    "};\n" +
    "drawThings = function(){\n" +
    " {1}\n" +
    " {2}\n" +
    "};\n" +
    "draw = function() {\n" +
    " drawThings();\n" +
    " {3}\n" +
    "};";


let condOnProgress = false;
let variableNames = [];
let variableBlocks = [];
let functionBlocks = [];
let drawBlocks = [];
let loopBlocks = [];
let commands = [];
let condCodeType = 1;
let debug = false;
let ct = 3;
let fuse;
let inDrawLoop = false;

function initInterpreter() {
    const fuseOptions = {
        keys: ['title'],
        shouldSort: true,
        includeScore: true
    };
    fuse = new Fuse(codeList, fuseOptions);
}

function clearCode() {
    condOnProgress = false;
    variableNames = [];
    variableBlocks = [];
    functionBlocks = [];
    drawBlocks = [];
    loopBlocks = [];
    commands = [];
    condCodeType = 1;
    inDrawLoop = false;
}

function addCodeInput(codeInput, codeType) {
    let parsedText = parse(codeInput);
    ct = (typeof codeType !== 'undefined') ? codeType : parsedText[1];
    if (inDrawLoop) {
        loopBlocks.push(parsedText[0]);
    } else {
        if (ct === 1)
            variableBlocks.push(parsedText[0]);
        else if (ct === 2)
            functionBlocks.push(parsedText[0]);
        else if (ct === 3)
            drawBlocks.push(parsedText[0]);
    }

    if (debug) runP5Code();
}

function getListOfElementIDs() {
    var containerElements = document.getElementById("right-copy-1tomany").children;
    var containerElementIDs = [];
    for (var i = 0; i < containerElements.length; i++) {
        var inputTags = containerElements[i].getElementsByTagName("input");
        containerElementIDs.push(containerElements[i].getElementsByTagName("label")[0].textContent +
            ((inputTags !== undefined) ?
                (inputTags.length > 0 ? " # " + inputTags[0].value : "") +
                (inputTags.length > 1 ? " # " + inputTags[1].value : "") : ""));
    }
    return containerElementIDs;
}

function undo() {
    if (ct === 1)
        variableBlocks.pop();
    else if (ct === 2)
        functionBlocks.pop();
    else if (ct === 3)
        drawBlocks.pop();

    runP5Activity();
}

function parse(code_text) {
    let command = "";
    let params = [];
    if (code_text.indexOf("#") > 0) {
        let code_parts = code_text.split('#');
        command = code_parts[0];
        params = code_parts.slice(1);
    } else {
        command = code_text;
    }
    let result = fuse.search(command.toLowerCase().replace(/\s+/g, " ").trim());
    let resultCode = result[0].item.code;
    if (result[0].score > 0.35) { // 0 is complete match, 1 is complete mismatch
        return ["", undefined];
    }
    let codeType = condOnProgress ? condCodeType : result[0].item.code_type;
    if (result[0].item.input === "attr" || result[0].item.input === "shape" || result[0].item.input === "color") {
        if (result[0].item.no_in === 0) {
            resultCode = result[0].item.code;
        } else if (result[0].item.no_in === 1) {
            resultCode = resultCode.format(params[0]);
        } else if (result[0].item.no_in === 2) {
            resultCode = resultCode.format(params[0], params[1]);
        }
    } else if (result[0].item.input === "call") {
        resultCode = resultCode.format(params[0].trim().replace(/\s/g, '_'));
    } else if (result[0].item.input === "cond") {
        condOnProgress = true;
        condCodeType = result[0].item.code_type;
        if (result[0].item.no_in === 0) {
            resultCode = result[0].item.code;
        } else if (result[0].item.no_in === 1) {
            resultCode = resultCode.format(params[0].trim());
        }
    } else if (result[0].item.input === "end") {
        resultCode = result[0].item.code;
        condOnProgress = false;
    } else if (result[0].item.input === "loop") {
        inDrawLoop = !inDrawLoop;
    } else if (result[0].item.input === "variable") {
        if (variableNames.includes(params[0]) && result[0].item.code_type === 1) {
            resultCode = "";
        } else {
            resultCode = resultCode.format(params[0], params[1]);
            variableNames.push(params[0]);
        }
    }
    return [resultCode, codeType];
}


// For the activity

function runCommandArray() {
    drawBlocks = [];
    commands = getListOfElementIDs();
    for (var i = 0; i < commands.length; i++) {
        addCodeInput(commands[i]);
    }
    runP5Activity();
}


function runP5Activity() {
    if (!condOnProgress) {
        let code = p5code.format(functionBlocks.join(' '), variableBlocks.join(' '), drawBlocks.join(' '), loopBlocks.join());
        let s = new Function("p", code);
        if(debug === true) console.log(code);
        new p5(s);
    }
}