const ipc = require('electron').ipcRenderer;
const path = require('path');
const fs = require('fs');

const AudioExtensions = ['aac','alac','flac','m4a','m4b','mp3','mpc','ogg','oga','mogg','opus', 'wav','webm'];

var TranscriptionFileName = 'transcription.txt';
var directoryPath = "";

function readme() { 
    ipc.send('open-readme'); 
}

function updateDirectory() {
    ipc.send('open-folder-dialog');
    ipc.on('selected-folder', function (event, result) {
        directoryPath = String(result['filePaths']);
        if (! directoryPath == "") { loadFileList(directoryPath); }
        else { return; }
    })
}

function playAudio(btnId) {
    audiopath = (path.join(directoryPath,btnId));
    let audioclip = new Audio(audiopath);
    audioclip.play();
}

function loadFileList(directoryPath) {
    let fileExists = false;
    let table = document.getElementById("tbl");

    try { for (let i = 1; i < table.rows.length;) { table.deleteRow(i); } }
    catch {  /* ¯\_(ツ)_/¯ */ }
    
    if (directoryPath == "") { return; }

    try { var dict = loadfile();  fileExists = true; }
    catch (ENOENT) { /* ¯\_(ツ)_/¯ */ }
    
    let lineNumber = 1;
    fs.readdirSync(directoryPath).forEach(file => {
        var text = "";

        if (AudioExtensions.includes( file.split('.').pop()) ) {
            if (fileExists) {
                if (file in dict) { text = dict[file]; }
            }

            //Create table data elements
            const row = table.insertRow(1);
            const cellNumber = row.insertCell(0);
            const deleteButton = row.insertCell(1); 
            const cellFilename = row.insertCell(2);
            const cellText = row.insertCell(3);

            cellNumber.innerHTML = `<span class="line-number">${lineNumber}</span>`;
            deleteButton.innerHTML = `<button class="deleteButton" name="${file}" type="button" onclick="deleteRow(this.name);" tabindex="-1">delete</button>`;
            cellFilename.innerHTML = `<button class="playButton" value="button" type="button" onclick="playAudio(this.innerHTML)" tabindex="-1">${file}</button>`;
            cellText.innerHTML = `<input class="textBox" name="${file}" type="text" onkeyup="saveTranscriptionAsText();" value="${text}" />`;

            lineNumber++
        }
    });
}

function deleteRow(filename) {
    try {
        fs.unlinkSync(path.join(directoryPath, filename));
        loadFileList(directoryPath);
        saveTranscriptionAsText();

    } catch (error) {
        UpdateMessageBar(error);
    }
}

function saveTranscriptionAsText(showError=true) {
    if (directoryPath === "") {
        if (showError == false) {
            return;
        }
        
        UpdateMessageBar("Load a directory first");
        return;
    }

    const folderName = path.basename(directoryPath);
    const filename = document.getElementsByClassName("playButton");
    const rows = document.getElementsByClassName("textBox");
    const delim = document.getElementById("delim").value;

    const writer = fs.createWriteStream(path.join(directoryPath, TranscriptionFileName), {flags: 'w'});

    for (let i = 0; i < rows.length; i++) { writer.write("/" + folderName + "/" + filename[i].innerHTML + delim + rows[i].value+"\n"); }
}

function checkEmptyLines() {
    if (directoryPath === "") {
        UpdateMessageBar("Load a folder first");
        return;
    }
    
    const rows = document.getElementsByClassName("textBox");
    let emptyLines = [];

    for (let i = 0; i < rows.length; i++) {
        if (rows[i].value === "")
        {
            emptyLines.push(" "+(i+1));
        }
    }
        if (emptyLines.length !== 0) {
            UpdateMessageBar(("Empty lines: " + emptyLines))
        }
        else {
            UpdateMessageBar("No empty lines");
        }
}

function UpdateMessageBar(message) {
    document.getElementById("error-bar").innerHTML = message;
}

function loadfile() {
    let dict = {};
    const delim = document.getElementById("delim").value;
    const lines = (fs.readFileSync(path.join(directoryPath, TranscriptionFileName), 'utf-8', {flag: 'r'})).split('\n');

    lines.forEach(line => { 
        if (line.length > 0) {
            const filename = line.split('/').pop().split(delim)[0];
            const lineText = line.split(delim).pop();
            dict[filename] = lineText;
        }
    });
    return dict;
}

document.addEventListener('drop', (event) => {
    event.preventDefault();
    event.stopPropagation();
  
    if (event.dataTransfer.files.length > 1) {
        UpdateMessageBar("Load only one directory at a time.");
        return;
    }
    for (const f of event.dataTransfer.files) {
        if (fs.lstatSync(f.path).isDirectory()) { 
            directoryPath = f.path;
            loadFileList(f.path); 
        }
        else { UpdateMessageBar("Load a folder, not a file."); }
    }
});
  
document.addEventListener('dragover', (event) => {
    event.preventDefault();
    event.stopPropagation();
});

window.addEventListener("keydown", function (event) {
    if (event.key == "Control") { playAudio(document.activeElement.name); }
    if (event.key == "`") { deleteRow(document.activeElement.name); }
});
