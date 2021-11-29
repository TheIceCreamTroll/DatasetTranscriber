# DatasetTranscriber

Made with Electron and Javascript. 

### Loading a folder

When you load a folder, Transcriber will look for, and try to import transcription.txt.
In order for transcriptions to be successful imported, they must follow the example shown below.
The name of the parent folder must be enclosed in two forward slashes, and the filename must be between the second forward slash and the delimiter.
Filenames with certain special characters (#,&) may not play, so stick with alphanumeric filenames.
By default, the delimiter is set to "|" but this can be changed in the delimiter text box.
Very large folders (more than 10k files) should be split up into multiple smaller folders, and combined on completion.

 Example: /foldername/filename.flac|Never going to...  

---
### Saving transcriptions

Transcriber will always save transcriptions as transcription.txt in the active folder.
By default, transcriptions are formatted for 15.ai.

### Building
Install [NodeJS](https://nodejs.org/en/download/), [Electron-Forge](https://github.com/electron-userland/electron-forge), and [Electron-Builder](https://www.npmjs.com/package/electron-builder). Then run the .sh script for your platform. Additional build options can be found at [electron.build](https://www.electron.build/).