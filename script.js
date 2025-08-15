console.log("Welcome to Mini Spotify");

let songs;
let currentSong = new Audio();
let currentFolder;

function secondsToMinutesAndSeconds(millis) {
     const minutes = Math.floor(millis / 60);
     const seconds = Math.floor((millis % 60));
     return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

async function getSongs(folder) {
     currentFolder = folder
     let a = await fetch(`/${folder}/`);
     let response = await a.text();
     let div = document.createElement("div");
     div.innerHTML = response;
     let as = div.getElementsByTagName("a");

     // Adding all songs to songs array ->
     songs = [];
     for (let index = 0; index < as.length; index++) {
          const element = as[index];

          if (element.href.endsWith(".mp3")) {
               songs.push(element.href.split(`/${folder}/`)[1].replace(".mp3", ""));
          }
     }


     // Add all songs to playlist
     let songList = document.querySelector(".songList ul");

     songList.innerHTML = "";
     for (const song of songs) {
          let songInfo = song.replaceAll("%20", " ").replace(".mp3", "");
          songList.innerHTML = songList.innerHTML + `<li>
                                                            <img src="img/music.svg" class="invert" alt="">
                                                            <div class="songInfo">
                                                                 <div class="title">${songInfo}</div>
                                                                 
                                                            </div>
                                                            <div class="playNow">
                                                                 <span>Play Now</span>
                                                                 <img src="img/play.svg" class="invert" alt="">
                                                            </div>
                                                       </li>`
     }

     // Attack an event listener to each songs of type 'click'
     Array.from(document.querySelector('.songList').getElementsByTagName('li')).forEach(element => {
          element.addEventListener("click", () => {
               playMusic(element.querySelector(".songInfo").firstElementChild.innerHTML.trim());
          })
     });
}


let playMusic = (track, pause = false) => {
     currentSong.src = `/${currentFolder}/` + track + ".mp3";

     if (!pause) {
          currentSong.play();
          play.src = "/img/pause.svg";
     }

     document.querySelector(".songTitle marquee").innerHTML = decodeURI(track);

     currentSong.addEventListener("loadedmetadata", () => {

          document.querySelector(".songTime").innerHTML = `00:00 / ${secondsToMinutesAndSeconds(currentSong.duration)}`;
     })

}


async function displayAlbums() {
     let a = await fetch(`/Songs/`);
     let response = await a.text();
     let div = document.createElement("div");
     div.innerHTML = response;

     let anchors = [];
     let cardContainer = document.querySelector(".cardContainer");

     Array.from(div.querySelector("ul").getElementsByTagName("li")).forEach((e) => {
          let element = e.querySelector("a");
          if (element.getAttribute("href").includes("/Songs/")) {
               anchors.push(element)
          }
     })

     // Display Albums

     for (let index = 0; index < anchors.length; index++) {
          const e = anchors[index];

          let folderName = e.href.split("/Songs/")[1]
          let a = await fetch(`Songs/${folderName}/info.json `);
          let infoMessage = await a.json();

          cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folderName}" class="card">
                                                                      <img src="${`Songs/${folderName}/cover.jpg`}" alt="">
                                                                      <h2>${infoMessage.title}</h2>
                                                                      <p>${infoMessage.description}</p>
                                                                      <div class="play">
                                                                           <img src="img/play2.svg" alt="#Play">
                                                                      </div>
                                                                 </div>`
     }


     // Load the songs in Libraray of the albhum
     Array.from(document.getElementsByClassName("card")).forEach(e => {
          e.addEventListener("click", async function (item) {
               await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
               playMusic(songs[0]);
               document.getElementById("play").src = "/img/pause.svg";
               document.querySelector(".circle").style.left = 0;
               currentSong.addEventListener("loadeddata", () => {
                    document.querySelector(".songTime").innerHTML = `0:00 / ${secondsToMinutesAndSeconds(currentSong.duration)}`;
               })
          });
     });
}


function provideInput () {

     
}

async function main() {
     await getSongs('Songs/First_Album');

     // Assign first to current Song
     playMusic(songs[0], true);

     // Display all albhums on the Playlist container
     displayAlbums();

     // Adding event listener to play Button of type 'click'
     let play = document.getElementById("play");
     play.addEventListener("click", () => {

          if (currentSong.paused) {
               currentSong.play();
               play.src = "/img/pause.svg";
          }
          else {
               currentSong.pause();
               play.src = "/img/play.svg"
          }
     });

     // Add event listener to current song of type 'timeupdate'
     currentSong.addEventListener("timeupdate", () => {
          document.querySelector(".songTime").innerHTML = secondsToMinutesAndSeconds(currentSong.currentTime) + " / " + secondsToMinutesAndSeconds(currentSong.duration);

          document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
     });

     // Adding event listener to the SeekBar
     document.querySelector(".seekBar").addEventListener("click", (e) => {
          let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

          document.querySelector(".circle").style.left = percent + "%";
          currentSong.currentTime = ((currentSong.duration) * percent) / 100;
     });

     // Add a event listener for hamburger
     document.querySelector(".hamburger").addEventListener("click", () => {
          document.querySelector(".left").style.left = 0;
     })


     // Adding an event listener for Close icon
     document.querySelector(".close").addEventListener("click", () => {
          document.querySelector(".left").style.left = "-100%";
     })


     // Adding event listener for previous button
     document.querySelector("#previous").addEventListener("click", () => {
          let index = songs.indexOf(currentSong.src.replace(".mp3", "").split("/").slice(-1)[0]);

          if ((index - 1) >= 0) {
               playMusic(songs[index - 1])
          } else {
               playMusic(songs[songs.length - 1]);
          }
     })


     // Adding event listener for next button
     document.querySelector("#next").addEventListener("click", () => {

          let index = songs.indexOf(currentSong.src.replace(".mp3", "").split("/").slice(-1)[0]);

          if ((index + 1) < songs.length) {
               playMusic(songs[index + 1]);
          } else {
               playMusic(songs[0]);
          }
     })


     // Looping to next songs 
     currentSong.addEventListener("timeupdate", ()=> {
          if (currentSong.currentTime === currentSong.duration) {
               document.querySelector("#next").click();
          }
     })
     

     let volumeRange = document.querySelector("#volumeRange")
     volumeRange.value = "30";
     currentSong.volume = 0.3;
     let volume = 0;
     // Adding event listener for Volume Range
     volumeRange.addEventListener("input", () => {
          let volValue = volumeRange.value;

          currentSong.volume = volValue / 100;

          if (currentSong.volume == 0) {
               document.querySelector(".volumeIcon").src = "/img/volume_mute.svg"
          } else {
               document.querySelector(".volumeIcon").src = "/img/volume.svg"
          }
     })


     // Adding event listener for volume to change it to Mute vice versa
     document.querySelector(".volumeIcon").addEventListener("click", () => {
          const volumeSlider = document.getElementById("volumeRange")
          if (currentSong.volume !== 0) {
               volume = volumeSlider.value;
               volumeSlider.value = 0;
               currentSong.volume = 0;
               document.querySelector(".volumeIcon").src = "/img/volume_mute.svg";

          } else {
               volumeSlider.value = volume;
               currentSong.volume = volume / 100;
               document.querySelector(".volumeIcon").src = "/img/volume.svg";
          }
     });


     // Adding event listener to search to provide input
     document.querySelector(".search img").addEventListener("click", ()=> {
          let span = document.querySelector(".search span");
          let input = document.querySelector(".search input");

          if (span.style.display === "none") {
               span.style.display = "block";
               input.style.display = "none";
          } else {
               span.style.display = "none";
               input.style.display = "block";
          }
     })


     // Adding event listener for search input
     document.getElementById("searchInput").addEventListener("input", ()=> {
          let inputText = document.getElementById("searchInput").value.toLowerCase();

          let songList = Array.from(document.querySelector(".songList ul").getElementsByTagName("li"));

          songList.forEach((e) => {
               if (e.innerText.toLowerCase().includes(inputText)) {
                    e.style.display = "flex";
               } else {
                    e.style.display = "none";
               }
          })
     })

}

main()