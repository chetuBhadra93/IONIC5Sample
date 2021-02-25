import { Component, ViewChild } from '@angular/core';
declare var Tone: any;
declare var MediaRecorder: any;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  started: false;
  @ViewChild('audio') audio;

  constructor() {
    console.log('Tone', Tone);
  }

  startRecord() {
    const synth = new Tone.Synth();
    const actx = Tone.context;
    console.log('Synth', synth);
    console.log('actx', actx);

    const dest = actx.createMediaStreamDestination();
    const recorder = new MediaRecorder(dest.stream);

    synth.connect(dest);
    synth.toMaster();

    const chunks = [];

    const notes = 'CDEFGAB'.split('').map((n) => `${n}4`);
    let note = 0;
    Tone.Transport.scheduleRepeat((time) => {
      if (note === 0) recorder.start();
      if (note > notes.length) {
        synth.triggerRelease(time);
        recorder.stop();
        Tone.Transport.stop();
      } else synth.triggerAttack(notes[note], time);
      note++;
    }, '4n');

    recorder.ondataavailable = (evt) => chunks.push(evt.data);
    recorder.onstop = (evt) => {
      let blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
      this.audio.src = URL.createObjectURL(blob);
    };

    Tone.Transport.start();
  }
}
