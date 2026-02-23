function createLibrary() {
  const libraryList = document.getElementById("library-list");
  if (!libraryList) return;

  libraryList.innerHTML = "";

  MusicData.forEach((artist) => {
    let item = document.createElement("div");
    item.classList.add("library-item");

    let img = document.createElement("img");
    img.src = artist.coverImg;
    img.alt = artist.artist;

    let info = document.createElement("div");
    info.classList.add("library-item-info");

    let name = document.createElement("p");
    name.textContent = artist.artist;

    let type = document.createElement("p");
    type.textContent = "Artist";

    info.append(name, type);
    item.append(img, info);
    libraryList.appendChild(item);

    item.addEventListener("click", () => {
      const audio = document.getElementById("audio-player");
      let lastPlayed = JSON.parse(localStorage.getItem("lastPlayed"));
      let resumeIdx = 0;

      if (
        lastPlayed &&
        lastPlayed.artistId === artist.id &&
        lastPlayed.artistSongIdx !== undefined
      ) {
        resumeIdx = lastPlayed.artistSongIdx;
      }

      let songToPlay = artist.songs[resumeIdx];
      let songDetails = {
        id: songToPlay.id,
        title: songToPlay.title,
        artist: songToPlay.description,
        coverImg: songToPlay.coverImg,
        audioSrc: songToPlay.audioSrc,
        sectionIdx: 0,
        itemIdx: resumeIdx,
        artistId: artist.id,
        artistSongIdx: resumeIdx,
      };

      localStorage.setItem("lastPlayed", JSON.stringify(songDetails));
      localStorage.setItem("currentArtist", JSON.stringify(artist));
      localStorage.removeItem("currentAlbum");
      addToHistory(songDetails);
      trackLoad();

      audio.src = songDetails.audioSrc;
      audio.load();
      audio.play();
      updatePlayButton(true);
    });
  });
}

function addToHistory(songDetails) {
  let history = JSON.parse(localStorage.getItem("playHistory")) || [];

  history = history.filter((item) => item.id !== songDetails.id);

  history.unshift({
    id: songDetails.id,
    title: songDetails.title,
    artist: songDetails.artist,
    coverImg: songDetails.coverImg,
    audioSrc: songDetails.audioSrc,
    timestamp: Date.now(),
  });

  if (history.length === 0) {
  }

  if (history.length > 10) {
    history = history.slice(0, 10);
  }

  localStorage.setItem("playHistory", JSON.stringify(history));
  updateRecentlyPlayed();
}

function updateRecentlyPlayed() {
  let history = JSON.parse(localStorage.getItem("playHistory")) || [];
  let recentlyPlayedSection = document.getElementById("section-0");

  if (!recentlyPlayedSection) return;

  recentlyPlayedSection.style.display = history.length === 0 ? "none" : "";

  let container = recentlyPlayedSection.querySelector(".section-container");
  if (!container) return;

  container.innerHTML = "";

  history.forEach((item, idx) => {
    let sectionContent = document.createElement("div");
    sectionContent.classList.add("section-content");
    sectionContent.id = `section-0-item-${idx}`;

    let songImg = document.createElement("div");
    songImg.classList.add("song-img");

    let img = document.createElement("img");
    img.src = item.coverImg;
    img.alt = item.title;

    let playBtn = document.createElement("button");
    playBtn.classList.add("btn");

    let spanPlay = document.createElement("span");
    spanPlay.classList.add("material-symbols-outlined");
    spanPlay.textContent = "play_arrow";

    playBtn.appendChild(spanPlay);
    songImg.appendChild(playBtn);
    songImg.appendChild(img);

    let songInfo = document.createElement("div");
    songInfo.classList.add("song-info");

    let p = document.createElement("p");
    p.textContent = item.title;
    let p2 = document.createElement("p");
    p2.textContent = item.artist;

    songInfo.append(p, p2);
    sectionContent.append(songImg, songInfo);
    container.appendChild(sectionContent);
  });

  playOnCard();
}

function createCards() {
  let mainRight = document.querySelector("main .right");

  CardData.map((card, idx) => {
    let section = document.createElement("div");
    section.classList.add("section");
    section.id = `section-${idx}`;

    let sectionTitle = document.createElement("h4");
    sectionTitle.classList.add("section-title");
    sectionTitle.textContent = card.title;

    let sectionContainer = document.createElement("div");
    sectionContainer.classList.add("section-container");

    card.items.map((item, itemIdx) => {
      let sectionContent = document.createElement("div");
      sectionContent.classList.add("section-content");
      sectionContent.id = `section-${idx}-item-${itemIdx}`;

      let songImg = document.createElement("div");
      songImg.classList.add("song-img");

      let img = document.createElement("img");
      img.src = item.coverImg;
      img.alt = item.title;

      let songInfo = document.createElement("div");
      songInfo.classList.add("song-info");

      let p = document.createElement("p");
      let p2 = document.createElement("p");

      if (card.isPlayable === true) {
        p.textContent = item.title;
        p2.textContent = item.artist;

        let playBtn = document.createElement("button");
        playBtn.classList.add("btn");

        let spanPlay = document.createElement("span");
        spanPlay.classList.add("material-symbols-outlined");
        spanPlay.textContent = "play_arrow";

        playBtn.appendChild(spanPlay);
        songImg.appendChild(playBtn);
      } else if (card.isPlayable === "album") {
        p.textContent = item.name;
        p2.textContent = item.artist;

        let playBtn = document.createElement("button");
        playBtn.classList.add("btn");

        let spanPlay = document.createElement("span");
        spanPlay.classList.add("material-symbols-outlined");
        spanPlay.textContent = "play_arrow";

        playBtn.appendChild(spanPlay);
        songImg.appendChild(playBtn);
      } else {
        img.style.borderRadius = "50%";

        MusicData.forEach((music) => {
          if (music.id === item.id) {
            p.textContent = music.artist;
            p2.textContent = "Artist";
          }
        });
      }

      sectionContent.append(songImg, songInfo);
      songImg.appendChild(img);
      songInfo.append(p, p2);
      sectionContainer.appendChild(sectionContent);
    });

    section.append(sectionTitle, sectionContainer);
    mainRight.appendChild(section);
  });
}

function controlTrack() {
  let audio = document.getElementById("audio-player");
  let progress = document.querySelector("footer .bottom .progress");
  let progressBar = document.querySelector(
    "footer .bottom .progress .progress-bar",
  );
  let start = document.querySelector("footer .bottom .start");
  let end = document.querySelector("footer .bottom .end");

  let isDragging = false;

  audio.addEventListener("timeupdate", () => {
    if (!isDragging && audio.duration) {
      let percentage = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = `${percentage}%`;
      start.textContent = formatTime(audio.currentTime);
    }
  });

  audio.addEventListener("loadedmetadata", () => {
    end.textContent = formatTime(audio.duration);
  });

  progress.addEventListener("click", (e) => {
    if (audio.src) {
      let rect = progress.getBoundingClientRect();
      let clickX = e.clientX - rect.left;
      let percentage = clickX / rect.width;
      audio.currentTime = percentage * audio.duration;
    }
  });

  progress.addEventListener("mousedown", (e) => {
    if (audio.src) {
      isDragging = true;
      handleProgressUpdate(e);
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      handleProgressUpdate(e);
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  function handleProgressUpdate(e) {
    let rect = progress.getBoundingClientRect();
    let clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    let percentage = clickX / rect.width;
    audio.currentTime = percentage * audio.duration;
    progressBar.style.width = `${percentage * 100}%`;
    start.textContent = formatTime(audio.currentTime);
  }

  function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }
}

function controlVolume() {
  let volumeBar = document.querySelector(".volume-bar");
  let volumeLevel = document.querySelector(".volume-level");
  let volumeBtn = document.querySelector(".volume .btn");
  let volumeIcon = volumeBtn.querySelector("span");

  let currentVolume = localStorage.getItem("volume") || 50;
  let isDragging = false;

  setVolume(currentVolume);

  volumeBar.addEventListener("click", (e) => {
    let rect = volumeBar.getBoundingClientRect();
    let clickX = e.clientX - rect.left;
    let percentage = (clickX / rect.width) * 100;
    setVolume(percentage);
  });

  volumeBar.addEventListener("mousedown", (e) => {
    isDragging = true;
    updateVolume(e);
  });

  document.addEventListener("mousemove", (e) => {
    if (isDragging) {
      updateVolume(e);
    }
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  volumeBtn.addEventListener("click", () => {
    if (currentVolume > 0) {
      localStorage.setItem("previousVolume", currentVolume);
      setVolume(0);
    } else {
      let previousVolume = localStorage.getItem("previousVolume") || 50;
      setVolume(previousVolume);
    }
  });

  function updateVolume(e) {
    let rect = volumeBar.getBoundingClientRect();
    let clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    let percentage = (clickX / rect.width) * 100;
    setVolume(percentage);
  }

  function setVolume(volume) {
    currentVolume = Math.max(0, Math.min(100, volume));
    volumeLevel.style.width = `${currentVolume}%`;
    localStorage.setItem("volume", currentVolume);

    if (currentVolume === 0) {
      volumeIcon.textContent = "volume_mute";
    } else if (currentVolume < 33) {
      volumeIcon.textContent = "volume_down";
    } else {
      volumeIcon.textContent = "volume_up";
    }

    let audio = document.getElementById("audio-player");
    if (audio) {
      audio.volume = currentVolume / 100;
    }
  }
}

function trackLoad() {
  let lastPlayed = JSON.parse(localStorage.getItem("lastPlayed"));
  let playHistory = JSON.parse(localStorage.getItem("playHistory")) || [];

  if (!lastPlayed && playHistory.length > 0) {
    let firstHistoryItem = playHistory[0];

    let found = false;
    MusicData.forEach((artist) => {
      let song = artist.songs.find((s) => s.id === firstHistoryItem.id);
      if (song) {
        lastPlayed = {
          id: song.id,
          title: song.title,
          artist: song.description,
          coverImg: song.coverImg,
          audioSrc: song.audioSrc,
          sectionIdx: 0,
          itemIdx: 0,
        };
        localStorage.setItem("lastPlayed", JSON.stringify(lastPlayed));
        found = true;
      }
    });

    if (!found) {
      AlbumData.forEach((album) => {
        let song = album.songs.find((s) => s.id === firstHistoryItem.id);
        if (song) {
          lastPlayed = {
            id: song.id,
            title: song.title,
            artist: song.description,
            coverImg: song.coverImg,
            audioSrc: song.audioSrc,
            sectionIdx: 0,
            itemIdx: 0,
          };
          localStorage.setItem("lastPlayed", JSON.stringify(lastPlayed));
        }
      });
    }
  }

  let footerImg = document.querySelector("footer .left img");
  let footerTitle = document.querySelector("footer .left h6");
  let footerArtist = document.querySelector("footer .left p");
  let currentTime = document.querySelector("footer .bottom .start");
  let totalDuration = document.querySelector("footer .bottom .end");

  if (lastPlayed) {
    footerImg.src = lastPlayed.coverImg;
    footerImg.alt = lastPlayed.title;
    footerTitle.textContent = lastPlayed.title;
    footerArtist.textContent = lastPlayed.artist;
    currentTime.textContent = "0:00";
    totalDuration.textContent = "0:00";
  } else {
    footerImg.src = "";
    footerImg.alt = "";
    footerTitle.textContent = "";
    footerArtist.textContent = "";
    currentTime.textContent = "0:00";
    totalDuration.textContent = "0:00";
  }
}

function playOnCard() {
  let audio = document.getElementById("audio-player");
  let allCards = document.querySelectorAll(".section-content");

  allCards.forEach((card) => {
    card.addEventListener("click", function () {
      let cardId = this.id;
      let [, sectionIdx, , itemIdx] = cardId.split("-");

      if (parseInt(sectionIdx) === 0) {
        let playHistory = JSON.parse(localStorage.getItem("playHistory")) || [];
        let historyItem = playHistory[parseInt(itemIdx)];

        if (historyItem) {
          let songDetails = {
            id: historyItem.id,
            title: historyItem.title,
            artist: historyItem.artist,
            coverImg: historyItem.coverImg,
            audioSrc: historyItem.audioSrc,
            sectionIdx: parseInt(sectionIdx),
            itemIdx: parseInt(itemIdx),
          };

          localStorage.setItem("lastPlayed", JSON.stringify(songDetails));
          localStorage.removeItem("currentAlbum");
          localStorage.removeItem("currentArtist");
          addToHistory(songDetails);
          trackLoad();

          audio.src = songDetails.audioSrc;
          audio.load();
          audio.play();
          updatePlayButton(true);
        }
        return;
      }

      let section = CardData[parseInt(sectionIdx)];
      let item = section.items[parseInt(itemIdx)];

      if (section.isPlayable === "album") {
        let album = AlbumData.find((a) => a.id === item.id);

        if (album && album.songs.length > 0) {
          let lastPlayed = JSON.parse(localStorage.getItem("lastPlayed"));
          let resumeIdx = 0;

          if (
            lastPlayed &&
            lastPlayed.albumId === album.id &&
            lastPlayed.albumSongIdx !== undefined
          ) {
            resumeIdx = lastPlayed.albumSongIdx;
          }

          let songToPlay = album.songs[resumeIdx];
          let songDetails = {
            id: songToPlay.id,
            title: songToPlay.title,
            artist: songToPlay.description,
            coverImg: songToPlay.coverImg,
            audioSrc: songToPlay.audioSrc,
            sectionIdx: parseInt(sectionIdx),
            itemIdx: parseInt(itemIdx),
            albumId: album.id,
            albumSongIdx: resumeIdx,
          };

          localStorage.setItem("lastPlayed", JSON.stringify(songDetails));
          localStorage.setItem("currentAlbum", JSON.stringify(album));
          localStorage.removeItem("currentArtist");
          addToHistory(songDetails);
          trackLoad();

          audio.src = songDetails.audioSrc;
          audio.load();
          audio.play();
          updatePlayButton(true);
        }
      } else if (section.isPlayable === false) {
        let artist = MusicData.find((a) => a.id === item.id);

        if (artist && artist.songs.length > 0) {
          let lastPlayed = JSON.parse(localStorage.getItem("lastPlayed"));
          let resumeIdx = 0;

          if (
            lastPlayed &&
            lastPlayed.artistId === artist.id &&
            lastPlayed.artistSongIdx !== undefined
          ) {
            resumeIdx = lastPlayed.artistSongIdx;
          }

          let songToPlay = artist.songs[resumeIdx];
          let songDetails = {
            id: songToPlay.id,
            title: songToPlay.title,
            artist: songToPlay.description,
            coverImg: songToPlay.coverImg,
            audioSrc: songToPlay.audioSrc,
            sectionIdx: parseInt(sectionIdx),
            itemIdx: parseInt(itemIdx),
            artistId: artist.id,
            artistSongIdx: resumeIdx,
          };

          localStorage.setItem("lastPlayed", JSON.stringify(songDetails));
          localStorage.setItem("currentArtist", JSON.stringify(artist));
          localStorage.removeItem("currentAlbum");
          addToHistory(songDetails);
          trackLoad();

          audio.src = songDetails.audioSrc;
          audio.load();
          audio.play();
          updatePlayButton(true);
        }
      } else {
        let songDetails = null;

        if (item.audioSrc && item.title) {
          songDetails = {
            id: item.id,
            title: item.title,
            artist: item.artist || item.description,
            coverImg: item.coverImg,
            audioSrc: item.audioSrc,
            sectionIdx: parseInt(sectionIdx),
            itemIdx: parseInt(itemIdx),
          };
        } else {
          MusicData.forEach((artist) => {
            let song = artist.songs.find((s) => s.id === item.id);
            if (song) {
              songDetails = {
                id: song.id,
                title: song.title,
                artist: song.description,
                coverImg: song.coverImg,
                audioSrc: song.audioSrc,
                sectionIdx: parseInt(sectionIdx),
                itemIdx: parseInt(itemIdx),
              };
            }
          });
        }

        if (songDetails) {
          localStorage.setItem("lastPlayed", JSON.stringify(songDetails));
          localStorage.removeItem("currentAlbum");
          localStorage.removeItem("currentArtist");
          addToHistory(songDetails);
          trackLoad();

          audio.src = songDetails.audioSrc;
          audio.load();
          audio.play();
          updatePlayButton(true);
        }
      }
    });
  });
}

function controlPlayPause() {
  const audio = document.getElementById("audio-player");

  document.querySelectorAll(".btn-play").forEach((playBtn) => {
    playBtn.addEventListener("click", () => {
      if (audio.src) {
        if (audio.paused) {
          audio.play();
          updatePlayButton(true);
        } else {
          audio.pause();
          updatePlayButton(false);
        }
      }
    });
  });

  audio.addEventListener("ended", () => {
    updatePlayButton(false);

    const loopEnabled = localStorage.getItem("loopEnabled") === "true";
    if (loopEnabled) {
      audio.currentTime = 0;
      audio.play();
      updatePlayButton(true);
      return;
    }

    const shuffleEnabled = localStorage.getItem("shuffleEnabled") === "true";
    const lastPlayed = JSON.parse(localStorage.getItem("lastPlayed"));
    const currentAlbum = JSON.parse(localStorage.getItem("currentAlbum"));
    const currentArtist = JSON.parse(localStorage.getItem("currentArtist"));

    if (currentArtist && lastPlayed && lastPlayed.artistId) {
      let nextSongIdx = shuffleEnabled
        ? Math.floor(Math.random() * currentArtist.songs.length)
        : (lastPlayed.artistSongIdx + 1) % currentArtist.songs.length;
      let nextSong = currentArtist.songs[nextSongIdx];

      let songDetails = {
        id: nextSong.id,
        title: nextSong.title,
        artist: nextSong.description,
        coverImg: nextSong.coverImg,
        audioSrc: nextSong.audioSrc,
        sectionIdx: lastPlayed.sectionIdx,
        itemIdx: lastPlayed.itemIdx,
        artistId: currentArtist.id,
        artistSongIdx: nextSongIdx,
      };

      localStorage.setItem("lastPlayed", JSON.stringify(songDetails));
      addToHistory(songDetails);
      trackLoad();

      audio.src = songDetails.audioSrc;
      audio.load();
      audio.play();
      updatePlayButton(true);
    } else if (currentAlbum && lastPlayed && lastPlayed.albumId) {
      let nextSongIdx = shuffleEnabled
        ? Math.floor(Math.random() * currentAlbum.songs.length)
        : (lastPlayed.albumSongIdx + 1) % currentAlbum.songs.length;
      let nextSong = currentAlbum.songs[nextSongIdx];

      let songDetails = {
        id: nextSong.id,
        title: nextSong.title,
        artist: nextSong.description,
        coverImg: nextSong.coverImg,
        audioSrc: nextSong.audioSrc,
        sectionIdx: lastPlayed.sectionIdx,
        itemIdx: lastPlayed.itemIdx,
        albumId: currentAlbum.id,
        albumSongIdx: nextSongIdx,
      };

      localStorage.setItem("lastPlayed", JSON.stringify(songDetails));
      addToHistory(songDetails);
      trackLoad();

      audio.src = songDetails.audioSrc;
      audio.load();
      audio.play();
      updatePlayButton(true);
    } else if (lastPlayed && lastPlayed.sectionIdx !== undefined) {
      let currentSection = CardData[lastPlayed.sectionIdx];
      let nextItemIdx, nextSectionIdx;

      if (shuffleEnabled) {
        nextSectionIdx = lastPlayed.sectionIdx;
        nextItemIdx = Math.floor(Math.random() * currentSection.items.length);
      } else {
        nextItemIdx = lastPlayed.itemIdx + 1;
        nextSectionIdx = lastPlayed.sectionIdx;
        if (nextItemIdx >= currentSection.items.length) {
          nextItemIdx = 0;
          nextSectionIdx = (lastPlayed.sectionIdx + 1) % CardData.length;
        }
      }

      const nextSection = CardData[nextSectionIdx];
      const nextItem = nextSection.items[nextItemIdx];

      let songDetails = null;
      MusicData.forEach((artist) => {
        const song = artist.songs.find((s) => s.id === nextItem.id);
        if (song) {
          songDetails = {
            id: song.id,
            title: song.title,
            artist: song.description,
            coverImg: song.coverImg,
            audioSrc: song.audioSrc,
            sectionIdx: nextSectionIdx,
            itemIdx: nextItemIdx,
          };
        }
      });

      if (songDetails) {
        localStorage.setItem("lastPlayed", JSON.stringify(songDetails));
        addToHistory(songDetails);
        trackLoad();

        audio.src = songDetails.audioSrc;
        audio.load();
        audio.play();
        updatePlayButton(true);
      }
    }
  });
}

function updatePlayButton(isPlaying) {
  document.querySelectorAll(".btn-play span").forEach((icon) => {
    icon.textContent = isPlaying ? "pause" : "motion_play";
  });
}

function initAudio() {
  let audio = document.getElementById("audio-player");
  let lastPlayed = JSON.parse(localStorage.getItem("lastPlayed"));

  if (lastPlayed && lastPlayed.audioSrc) {
    audio.src = lastPlayed.audioSrc;
    audio.load();
  }

  let savedVolume = localStorage.getItem("volume") || 50;
  audio.volume = savedVolume / 100;
}

function nextTrack() {
  const audio = document.getElementById("audio-player");
  const nextBtn = document.querySelector(".next");

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      const shuffleEnabled = localStorage.getItem("shuffleEnabled") === "true";
      const lastPlayed = JSON.parse(localStorage.getItem("lastPlayed"));
      const currentAlbum = JSON.parse(localStorage.getItem("currentAlbum"));
      const currentArtist = JSON.parse(localStorage.getItem("currentArtist"));

      if (currentArtist && lastPlayed && lastPlayed.artistId) {
        let nextSongIdx = shuffleEnabled
          ? Math.floor(Math.random() * currentArtist.songs.length)
          : (lastPlayed.artistSongIdx + 1) % currentArtist.songs.length;
        let nextSong = currentArtist.songs[nextSongIdx];

        let songDetails = {
          id: nextSong.id,
          title: nextSong.title,
          artist: nextSong.description,
          coverImg: nextSong.coverImg,
          audioSrc: nextSong.audioSrc,
          sectionIdx: lastPlayed.sectionIdx,
          itemIdx: lastPlayed.itemIdx,
          artistId: currentArtist.id,
          artistSongIdx: nextSongIdx,
        };

        localStorage.setItem("lastPlayed", JSON.stringify(songDetails));
        addToHistory(songDetails);
        trackLoad();

        audio.src = songDetails.audioSrc;
        audio.load();
        audio.play();
        updatePlayButton(true);
      } else if (currentAlbum && lastPlayed && lastPlayed.albumId) {
        let nextSongIdx = shuffleEnabled
          ? Math.floor(Math.random() * currentAlbum.songs.length)
          : (lastPlayed.albumSongIdx + 1) % currentAlbum.songs.length;
        let nextSong = currentAlbum.songs[nextSongIdx];

        let songDetails = {
          id: nextSong.id,
          title: nextSong.title,
          artist: nextSong.description,
          coverImg: nextSong.coverImg,
          audioSrc: nextSong.audioSrc,
          sectionIdx: lastPlayed.sectionIdx,
          itemIdx: lastPlayed.itemIdx,
          albumId: currentAlbum.id,
          albumSongIdx: nextSongIdx,
        };

        localStorage.setItem("lastPlayed", JSON.stringify(songDetails));
        addToHistory(songDetails);
        trackLoad();

        audio.src = songDetails.audioSrc;
        audio.load();
        audio.play();
        updatePlayButton(true);
      } else if (lastPlayed && lastPlayed.sectionIdx !== undefined) {
        let currentSection = CardData[lastPlayed.sectionIdx];
        let nextItemIdx, nextSectionIdx;

        if (shuffleEnabled) {
          nextSectionIdx = lastPlayed.sectionIdx;
          nextItemIdx = Math.floor(Math.random() * currentSection.items.length);
        } else {
          nextItemIdx = lastPlayed.itemIdx + 1;
          nextSectionIdx = lastPlayed.sectionIdx;
          if (nextItemIdx >= currentSection.items.length) {
            nextItemIdx = 0;
            nextSectionIdx = (lastPlayed.sectionIdx + 1) % CardData.length;
          }
        }

        const nextSection = CardData[nextSectionIdx];
        const nextItem = nextSection.items[nextItemIdx];

        let songDetails = null;
        MusicData.forEach((artist) => {
          const song = artist.songs.find((s) => s.id === nextItem.id);
          if (song) {
            songDetails = {
              id: song.id,
              title: song.title,
              artist: song.description,
              coverImg: song.coverImg,
              audioSrc: song.audioSrc,
              sectionIdx: nextSectionIdx,
              itemIdx: nextItemIdx,
            };
          }
        });

        if (songDetails) {
          localStorage.setItem("lastPlayed", JSON.stringify(songDetails));
          addToHistory(songDetails);
          trackLoad();

          audio.src = songDetails.audioSrc;
          audio.load();
          audio.play();
          updatePlayButton(true);
        }
      }
    });
  }
}

function prevTrack() {
  const audio = document.getElementById("audio-player");
  const prevBtn = document.querySelector(".prev");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      const lastPlayed = JSON.parse(localStorage.getItem("lastPlayed"));
      const currentAlbum = JSON.parse(localStorage.getItem("currentAlbum"));
      const currentArtist = JSON.parse(localStorage.getItem("currentArtist"));

      if (currentArtist && lastPlayed && lastPlayed.artistId) {
        let prevSongIdx =
          (lastPlayed.artistSongIdx - 1 + currentArtist.songs.length) %
          currentArtist.songs.length;
        let prevSong = currentArtist.songs[prevSongIdx];

        let songDetails = {
          id: prevSong.id,
          title: prevSong.title,
          artist: prevSong.description,
          coverImg: prevSong.coverImg,
          audioSrc: prevSong.audioSrc,
          sectionIdx: lastPlayed.sectionIdx,
          itemIdx: lastPlayed.itemIdx,
          artistId: currentArtist.id,
          artistSongIdx: prevSongIdx,
        };

        localStorage.setItem("lastPlayed", JSON.stringify(songDetails));
        addToHistory(songDetails);
        trackLoad();

        audio.src = songDetails.audioSrc;
        audio.load();
        audio.play();
        updatePlayButton(true);
      } else if (currentAlbum && lastPlayed && lastPlayed.albumId) {
        let prevSongIdx =
          (lastPlayed.albumSongIdx - 1 + currentAlbum.songs.length) %
          currentAlbum.songs.length;
        let prevSong = currentAlbum.songs[prevSongIdx];

        let songDetails = {
          id: prevSong.id,
          title: prevSong.title,
          artist: prevSong.description,
          coverImg: prevSong.coverImg,
          audioSrc: prevSong.audioSrc,
          sectionIdx: lastPlayed.sectionIdx,
          itemIdx: lastPlayed.itemIdx,
          albumId: currentAlbum.id,
          albumSongIdx: prevSongIdx,
        };

        localStorage.setItem("lastPlayed", JSON.stringify(songDetails));
        addToHistory(songDetails);
        trackLoad();

        audio.src = songDetails.audioSrc;
        audio.load();
        audio.play();
        updatePlayButton(true);
      } else if (lastPlayed && lastPlayed.sectionIdx !== undefined) {
        let currentSection = CardData[lastPlayed.sectionIdx];
        let prevItemIdx = lastPlayed.itemIdx - 1;
        let prevSectionIdx = lastPlayed.sectionIdx;

        if (prevItemIdx < 0) {
          prevSectionIdx =
            (lastPlayed.sectionIdx - 1 + CardData.length) % CardData.length;
          const prevSection = CardData[prevSectionIdx];
          prevItemIdx = prevSection.items.length - 1;
        }

        const prevSection = CardData[prevSectionIdx];
        const prevItem = prevSection.items[prevItemIdx];

        let songDetails = null;
        MusicData.forEach((artist) => {
          const song = artist.songs.find((s) => s.id === prevItem.id);
          if (song) {
            songDetails = {
              id: song.id,
              title: song.title,
              artist: song.description,
              coverImg: song.coverImg,
              audioSrc: song.audioSrc,
              sectionIdx: prevSectionIdx,
              itemIdx: prevItemIdx,
            };
          }
        });

        if (songDetails) {
          localStorage.setItem("lastPlayed", JSON.stringify(songDetails));
          addToHistory(songDetails);
          trackLoad();

          audio.src = songDetails.audioSrc;
          audio.load();
          audio.play();
          updatePlayButton(true);
        }
      } else if (audio.src) {
        audio.currentTime = 0;
      }
    });
  }
}

function controlFullscreen() {
  const overlay = document.getElementById("fullscreen-overlay");
  const openBtn = document.querySelector(".btn-fullscreen");
  const closeBtn = document.querySelector(".fullscreen-close");
  const footerImg = document.querySelector("footer .left img");
  const fsCover = document.getElementById("fs-cover");
  const fsBg = document.querySelector(".fullscreen-bg");
  const fsTitle = document.getElementById("fs-title");
  const fsArtist = document.getElementById("fs-artist");
  const fsStart = document.getElementById("fs-start");
  const fsEnd = document.getElementById("fs-end");
  const fsProgressWrap = document.getElementById("fs-progress");
  const fsProgressBar = document.getElementById("fs-progress-bar");
  const audio = document.getElementById("audio-player");

  function syncOverlay() {
    const lastPlayed = JSON.parse(localStorage.getItem("lastPlayed"));
    if (!lastPlayed) return;
    fsCover.src = lastPlayed.coverImg || "";
    fsBg.style.backgroundImage = `url(${lastPlayed.coverImg || ""})`;
    fsTitle.textContent = lastPlayed.title || "";
    fsArtist.textContent = lastPlayed.artist || "";
  }

  function open() {
    syncOverlay();
    overlay.classList.add("open");
  }

  function close() {
    overlay.classList.remove("open");
  }

  if (openBtn) openBtn.addEventListener("click", open);
  if (footerImg) footerImg.addEventListener("click", open);
  if (closeBtn) closeBtn.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  const observer = new MutationObserver(() => {
    if (overlay.classList.contains("open")) syncOverlay();
  });
  if (footerImg)
    observer.observe(footerImg, { attributes: true, attributeFilter: ["src"] });

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    fsProgressBar.style.width = `${pct}%`;
    const fmt = (s) => {
      if (!s || isNaN(s)) return "0:00";
      const m = Math.floor(s / 60),
        sec = Math.floor(s % 60);
      return `${m}:${sec < 10 ? "0" : ""}${sec}`;
    };
    fsStart.textContent = fmt(audio.currentTime);
  });

  audio.addEventListener("loadedmetadata", () => {
    const fmt = (s) => {
      if (!s || isNaN(s)) return "0:00";
      const m = Math.floor(s / 60),
        sec = Math.floor(s % 60);
      return `${m}:${sec < 10 ? "0" : ""}${sec}`;
    };
    fsEnd.textContent = fmt(audio.duration);
  });

  fsProgressWrap.addEventListener("click", (e) => {
    if (!audio.src) return;
    const rect = fsProgressWrap.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  });

  const fsShuffle = overlay.querySelector(".fs-shuffle");
  const fsLoop = overlay.querySelector(".fs-loop");
  const mainShuffle = document.querySelector("footer .btn-shuffle");
  const mainLoop = document.querySelector("footer .btn-loop");

  if (fsShuffle && mainShuffle) {
    if (mainShuffle.classList.contains("active"))
      fsShuffle.classList.add("active");
    fsShuffle.addEventListener("click", () => {
      mainShuffle.click();
      fsShuffle.classList.toggle(
        "active",
        mainShuffle.classList.contains("active"),
      );
    });
  }
  if (fsLoop && mainLoop) {
    if (mainLoop.classList.contains("active")) fsLoop.classList.add("active");
    fsLoop.addEventListener("click", () => {
      mainLoop.click();
      fsLoop.classList.toggle("active", mainLoop.classList.contains("active"));
    });
  }

  overlay
    .querySelector(".fs-prev")
    ?.addEventListener("click", () => document.querySelector(".prev")?.click());
  overlay
    .querySelector(".fs-next")
    ?.addEventListener("click", () => document.querySelector(".next")?.click());
}

function controlShuffle() {
  const shuffleBtn = document.querySelector(".btn-shuffle");
  if (!shuffleBtn) return;

  const isActive = localStorage.getItem("shuffleEnabled") === "true";
  if (isActive) shuffleBtn.classList.add("active");

  shuffleBtn.addEventListener("click", () => {
    const current = localStorage.getItem("shuffleEnabled") === "true";
    localStorage.setItem("shuffleEnabled", !current);
    shuffleBtn.classList.toggle("active", !current);
  });
}

function controlLoop() {
  const loopBtn = document.querySelector(".btn-loop");
  if (!loopBtn) return;

  const isActive = localStorage.getItem("loopEnabled") === "true";
  if (isActive) loopBtn.classList.add("active");

  loopBtn.addEventListener("click", () => {
    const current = localStorage.getItem("loopEnabled") === "true";
    localStorage.setItem("loopEnabled", !current);
    loopBtn.classList.toggle("active", !current);
  });
}

createCards();
createLibrary();
updateRecentlyPlayed();
playOnCard();
trackLoad();
initAudio();
controlTrack();
controlVolume();
controlPlayPause();
nextTrack();
prevTrack();
controlShuffle();
controlLoop();
controlFullscreen();
