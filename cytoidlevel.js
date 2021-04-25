function checkRely() {
  try {
    var tmpZip = new JSZip();
  } catch (error) {
    console.error(error);
    console.error("Need to load zip.js: https://stuk.github.io/jszip/")
  }
}

function SingleLevel(type) {
  this.type = type;
  this.name = "";
  this.difficulty = 0;
  this.path = null;
  this.music_override = {
    "path": null
  };
  this.storyboard = {
    "path": null
  };
}

function LevelJson() {

}

function Cytoidlevel(file) {
  this.file = file;
}