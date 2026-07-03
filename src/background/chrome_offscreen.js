'use strict';

class AudioAmplifier {
  constructor() {
    /** @type {MediaElementAudioSourceNode[]} */
    this.sources = [];
    if ('AudioContext' in window) {
      this.audioCtx = new AudioContext();
      this.audioCtx.suspend();
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = 1;
      this.gainNode.connect(this.audioCtx.destination);
    }
  }

  async amplify(audio) {
    if (!this.audioCtx) { return; }
    const existingSource = this.sources.find((source) => source.mediaElement === audio);
    if (existingSource) {
      await this.audioCtx.resume();
      return;
    }

    const source = this.audioCtx.createMediaElementSource(audio);
    this.sources.push(source);
    source.connect(this.gainNode);
    await this.audioCtx.resume();
  }

  setVolume(volume) {
    if (!this.gainNode) { return; }
    this.gainNode.gain.value = volume > 1 ? volume : 1;
  }

  async suspend() {
    if (this.audioCtx) {
      await this.audioCtx.suspend();
    }
  }
}

const amplifier = new AudioAmplifier();
/** @type {HTMLAudioElement[]} */
let currentAudios = [];
/** @type {(() => void) | null} */
let resolveCurrentPlayback = null;

function finishPlayback() {
  resolveCurrentPlayback?.();
  resolveCurrentPlayback = null;
}

function stopPlayback() {
  currentAudios.forEach((audio) => {
    audio.pause();
    if (!isNaN(audio.duration) && isFinite(audio.duration)) {
      audio.currentTime = audio.duration;
    }
  });
  currentAudios = [];
  amplifier.suspend();
  finishPlayback();
}

async function playAudioSequence(audioSources, playbackRate, volume) {
  stopPlayback();

  return await new Promise((resolve) => {
    resolveCurrentPlayback = resolve;

    const audios = audioSources.map((source) => {
      const audio = new Audio(source);
      audio.preload = 'auto';
      audio.playbackRate = playbackRate;
      audio.volume = volume > 1 ? 1 : volume;
      return audio;
    });

    currentAudios = audios;
    amplifier.setVolume(volume);

    const playNext = async (index) => {
      if (index >= audios.length) {
        amplifier.suspend();
        currentAudios = [];
        finishPlayback();
        return;
      }

      const audio = audios[index];
      await amplifier.amplify(audio);
      audio.play();
      audio.addEventListener(
        'ended',
        () => {
          if (currentAudios === audios) {
            playNext(index + 1);
          }
        },
        { once: true },
      );
    };

    playNext(0).catch((error) => {
      console.error(error);
      currentAudios = [];
      finishPlayback();
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request?.target !== 'offscreen-audio') {
    return false;
  }

  if (request.action === 'playAudioSequence') {
    playAudioSequence(
      request.audioSources,
      request.playbackRate,
      request.volume,
    )
      .then(() => sendResponse())
      .catch((error) => {
        console.error(error);
        sendResponse();
      });
    return true;
  }

  if (request.action === 'stopAudioPlayback') {
    stopPlayback();
    sendResponse();
    return false;
  }
  return false;
});
