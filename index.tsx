import React, { useState, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Music, Play, Square, Trash2, Copy, Waves } from 'lucide-react';

const ChordProgressionBuilder = () => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  const [draggedChord, setDraggedChord] = useState(null);
  const shouldStopRef = useRef(false);
  
  const scales = {
    'Maggiore': [0, 2, 4, 5, 7, 9, 11],
    'Minore Naturale': [0, 2, 3, 5, 7, 8, 10],
    'Minore Armonica': [0, 2, 3, 5, 7, 8, 11],
    'Minore Melodica': [0, 2, 3, 5, 7, 9, 11],
    'Dorico': [0, 2, 3, 5, 7, 9, 10],
    'Frigio': [0, 1, 3, 5, 7, 8, 10],
    'Lidio': [0, 2, 4, 6, 7, 9, 11],
    'Misolidio': [0, 2, 4, 5, 7, 9, 10],
    'Locrio': [0, 1, 3, 5, 6, 8, 10]
  };

  const chordQualities = {
    'Maggiore': ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'],
    'Minore Naturale': ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'],
    'Minore Armonica': ['min', 'dim', 'aug', 'min', 'maj', 'maj', 'dim'],
    'Minore Melodica': ['min', 'min', 'aug', 'maj', 'maj', 'dim', 'dim'],
    'Dorico': ['min', 'min', 'maj', 'maj', 'min', 'dim', 'maj'],
    'Frigio': ['min', 'maj', 'maj', 'min', 'dim', 'maj', 'min'],
    'Lidio': ['maj', 'maj', 'min', 'dim', 'maj', 'min', 'min'],
    'Misolidio': ['maj', 'min', 'dim', 'maj', 'min', 'min', 'maj'],
    'Locrio': ['dim', 'maj', 'min', 'min', 'maj', 'maj', 'min']
  };

  const romanNumerals = {
    'Maggiore': ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'],
    'Minore Naturale': ['i', 'ii°', 'III', 'iv', 'v', 'VI', 'VII'],
    'Minore Armonica': ['i', 'ii°', 'III+', 'iv', 'V', 'VI', 'vii°'],
    'Minore Melodica': ['i', 'ii', 'III+', 'IV', 'V', 'vi°', 'vii°'],
    'Dorico': ['i', 'ii', 'III', 'IV', 'v', 'vi°', 'VII'],
    'Frigio': ['i', 'II', 'III', 'iv', 'v°', 'VI', 'vii'],
    'Lidio': ['I', 'II', 'iii', 'iv°', 'V', 'vi', 'vii'],
    'Misolidio': ['I', 'ii', 'iii°', 'IV', 'v', 'vi', 'VII'],
    'Locrio': ['i°', 'II', 'iii', 'iv', 'V', 'VI', 'vii']
  };

  const functions = {
    'Maggiore': ['Tonica', 'Sottodominante', 'Tonica', 'Sottodominante', 'Dominante', 'Tonica', 'Dominante'],
    'Minore Naturale': ['Tonica', 'Sottodominante', 'Tonica', 'Sottodominante', 'Dominante', 'Sottodominante', 'Sottodominante'],
    'Minore Armonica': ['Tonica', 'Sottodominante', 'Tonica', 'Sottodominante', 'Dominante', 'Sottodominante', 'Dominante'],
    'Minore Melodica': ['Tonica', 'Sottodominante', 'Tonica', 'Sottodominante', 'Dominante', 'Sottodominante', 'Dominante'],
    'Dorico': ['Tonica', 'Sottodominante', 'Modale', 'Sottodominante', 'Dominante', 'Modale', 'Modale'],
    'Frigio': ['Tonica', 'Modale', 'Modale', 'Sottodominante', 'Dominante', 'Modale', 'Sottodominante'],
    'Lidio': ['Tonica', 'Modale', 'Modale', 'Sottodominante', 'Dominante', 'Modale', 'Dominante'],
    'Misolidio': ['Tonica', 'Sottodominante', 'Modale', 'Sottodominante', 'Dominante', 'Modale', 'Modale'],
    'Locrio': ['Tonica', 'Modale', 'Modale', 'Sottodominante', 'Modale', 'Modale', 'Dominante']
  };

  const [rootNote, setRootNote] = useState('A');
  const [scaleType, setScaleType] = useState('Minore Armonica');
  const [progression, setProgression] = useState([]);
  const [numBars, setNumBars] = useState(4);
  const [timeSignature, setTimeSignature] = useState('4/4');
  const [bpm, setBpm] = useState(120);
  const [waveform, setWaveform] = useState<OscillatorType>('sine');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBar, setCurrentBar] = useState(-1);

  const harmonizedScale = useMemo(() => {
    const rootIndex = notes.indexOf(rootNote);
    const intervals = scales[scaleType];
    
    return intervals.map((interval, degree) => {
      const noteIndex = (rootIndex + interval) % 12;
      const noteName = notes[noteIndex];
      const quality = chordQualities[scaleType][degree];
      const roman = romanNumerals[scaleType][degree];
      const func = functions[scaleType][degree];
      
      let chordSymbol = noteName;
      if (quality === 'min') chordSymbol += 'm';
      else if (quality === 'dim') chordSymbol += 'dim';
      else if (quality === 'aug') chordSymbol += 'aug';
      
      // Calcola le note dell'accordo
      const third = quality === 'min' || quality === 'dim' ? 3 : 4;
      const fifth = quality === 'dim' ? 6 : quality === 'aug' ? 8 : 7;
      
      const chordNotes = [
        notes[noteIndex],
        notes[(noteIndex + third) % 12],
        notes[(noteIndex + fifth) % 12]
      ];
      
      return {
        degree: degree + 1,
        roman,
        chord: chordSymbol,
        quality,
        function: func,
        notes: chordNotes,
        root: noteName,
        rootIndex: noteIndex
      };
    });
  }, [rootNote, scaleType]);

  // Inizializza progression con array vuoto per ogni battuta
  const initializeProgression = (bars, beatsPerBar) => {
    const newProg = [];
    for (let i = 0; i < bars; i++) {
      const beats = [];
      for (let j = 0; j < beatsPerBar; j++) {
        beats.push(null);
      }
      newProg.push({ bar: i + 1, beats });
    }
    setProgression(newProg);
  };

  // Inizializza quando cambiano le battute o il tempo
  React.useEffect(() => {
    const beatsPerBar = parseInt(timeSignature.split('/')[0]);
    if (progression.length !== numBars || 
        (progression.length > 0 && progression[0].beats.length !== beatsPerBar)) {
      initializeProgression(numBars, beatsPerBar);
    }
  }, [numBars, timeSignature]);

  const setChordForBeat = (barIndex, beatIndex, chord) => {
    const newProgression = [...progression];
    newProgression[barIndex].beats[beatIndex] = chord;
    setProgression(newProgression);
  };

  const clearBeat = (barIndex, beatIndex) => {
    const newProgression = [...progression];
    newProgression[barIndex].beats[beatIndex] = null;
    setProgression(newProgression);
  };

  const clearBar = (barIndex) => {
    const newProgression = [...progression];
    const beatsPerBar = parseInt(timeSignature.split('/')[0]);
    newProgression[barIndex].beats = Array(beatsPerBar).fill(null);
    setProgression(newProgression);
  };

  const clearProgression = () => {
    const beatsPerBar = parseInt(timeSignature.split('/')[0]);
    initializeProgression(numBars, beatsPerBar);
  };

  const fillRandomProgression = () => {
    const beatsPerBar = parseInt(timeSignature.split('/')[0]);
    const newProgression = [];
    
    for (let i = 0; i < numBars; i++) {
      const beats = [];
      let j = 0;
      
      while (j < beatsPerBar) {
        // Seleziona un accordo casuale dalla scala armonizzata
        const randomChord = harmonizedScale[Math.floor(Math.random() * harmonizedScale.length)];
        
        // Determina una durata casuale (1-4 beat, ma non oltre la fine della battuta)
        const maxDuration = Math.min(4, beatsPerBar - j);
        const duration = Math.floor(Math.random() * maxDuration) + 1;
        
        // Riempie il primo beat con l'accordo
        beats.push(randomChord);
        
        // Riempie i beat successivi con null (l'accordo continua)
        for (let k = 1; k < duration; k++) {
          beats.push(null);
        }
        
        j += duration;
      }
      
      newProgression.push({ bar: i + 1, beats });
    }
    
    setProgression(newProgression);
  };

  // Gestione drag and drop
  const handleDragStart = (chord) => {
    setDraggedChord(chord);
  };

  const handleDragEnd = () => {
    setDraggedChord(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, barIndex, beatIndex) => {
    e.preventDefault();
    if (draggedChord) {
      setChordForBeat(barIndex, beatIndex, draggedChord);
      setDraggedChord(null);
    }
  };

  // Audio Context e sintesi
  const playChord = (chord, duration = 1000) => {
    if (!chord) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const noteFrequencies = {
      'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
      'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
      'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
    };

    const now = audioContext.currentTime;
    
    chord.notes.forEach((note, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = waveform;
      oscillator.frequency.setValueAtTime(noteFrequencies[note], now);
      
      // Envelope ADSR
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gainNode.gain.linearRampToValueAtTime(0.1, now + 0.1);
      gainNode.gain.setValueAtTime(0.1, now + duration / 1000 - 0.05);
      gainNode.gain.linearRampToValueAtTime(0, now + duration / 1000);
      
      oscillator.start(now);
      oscillator.stop(now + duration / 1000);
    });
  };

  const playArpeggio = (chord, noteDuration = 400) => {
    if (!chord) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const noteFrequencies = {
      'C': 261.63, 'C#': 277.18, 'D': 293.66, 'D#': 311.13,
      'E': 329.63, 'F': 349.23, 'F#': 369.99, 'G': 392.00,
      'G#': 415.30, 'A': 440.00, 'A#': 466.16, 'B': 493.88
    };

    const now = audioContext.currentTime;
    const delayBetweenNotes = noteDuration / 1000;
    
    chord.notes.forEach((note, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = waveform;
      oscillator.frequency.setValueAtTime(noteFrequencies[note], now + (index * delayBetweenNotes));
      
      // Envelope ADSR per ogni nota dell'arpeggio
      const startTime = now + (index * delayBetweenNotes);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05);
      gainNode.gain.setValueAtTime(0.15, startTime + noteDuration / 1000 - 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + noteDuration / 1000);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + noteDuration / 1000);
    });
  };

  const playProgression = async () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    shouldStopRef.current = false;
    const beatDuration = (60 / bpm) * 1000;

    for (let i = 0; i < progression.length; i++) {
      if (shouldStopRef.current) break;
      
      setCurrentBar(i);
      let j = 0;
      
      while (j < progression[i].beats.length) {
        if (shouldStopRef.current) break;
        
        const chord = progression[i].beats[j];
        
        if (chord) {
          // Conta quanti beat consecutivi sono vuoti dopo questo accordo
          let duration = 1;
          while (j + duration < progression[i].beats.length && 
                 progression[i].beats[j + duration] === null) {
            duration++;
          }
          
          // Suona l'accordo per tutta la sua durata
          playChord(chord, beatDuration * duration * 0.9);
          
          // Aspetta per tutti i beat che l'accordo occupa
          for (let k = 0; k < duration; k++) {
            await new Promise(resolve => setTimeout(resolve, beatDuration));
          }
          
          j += duration;
        } else {
          // Beat vuoto senza accordo precedente nella battuta
          await new Promise(resolve => setTimeout(resolve, beatDuration));
          j++;
        }
      }
    }
    
    setCurrentBar(-1);
    setIsPlaying(false);
  };

  const stopProgression = () => {
    shouldStopRef.current = true;
  };

  const copyProgression = () => {
    const text = progression
      .map((bar, i) => {
        const chords = bar.beats.map(b => b ? b.chord : '—').join(' ');
        return `Bar ${i + 1}: ${chords}`;
      })
      .join(' | ');
    navigator.clipboard.writeText(text);
  };

  const getFunctionColor = (func) => {
    switch(func) {
      case 'Tonica': return 'bg-green-100 text-green-800 border-green-300';
      case 'Sottodominante': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Dominante': return 'bg-red-100 text-red-800 border-red-300';
      case 'Modale': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Music className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold">Chord Progression Builder</h1>
          </div>
          <p className="text-gray-300">Crea progressioni di accordi</p>
        </div>

        {/* Selettori */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1 text-purple-300">Nota Base</label>
              <select 
                value={rootNote}
                onChange={(e) => setRootNote(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                {notes.map(note => (
                  <option key={note} value={note}>{note}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-purple-300">Scala</label>
              <select 
                value={scaleType}
                onChange={(e) => setScaleType(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                {Object.keys(scales).map(scale => (
                  <option key={scale} value={scale}>{scale}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-purple-300">Battute</label>
              <input
                type="number"
                min="1"
                max="16"
                value={numBars}
                onChange={(e) => setNumBars(parseInt(e.target.value) || 1)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-purple-300">Tempo</label>
              <select
                value={timeSignature}
                onChange={(e) => setTimeSignature(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="4/4">4/4</option>
                <option value="3/4">3/4</option>
                <option value="5/4">5/4</option>
                <option value="6/8">6/8</option>
                <option value="7/8">7/8</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-purple-300">BPM</label>
              <input
                type="number"
                min="40"
                max="240"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value) || 120)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs font-semibold mb-1 text-purple-300">Forma d'onda</label>
            <div className="flex gap-2">
              {[
                { value: 'sine' as OscillatorType, label: 'Sine (Dolce)', emoji: '〰️' },
                { value: 'square' as OscillatorType, label: 'Square (Duro)', emoji: '⬜' },
                { value: 'sawtooth' as OscillatorType, label: 'Sawtooth (Ricco)', emoji: '📐' },
                { value: 'triangle' as OscillatorType, label: 'Triangle (Bilanciato)', emoji: '🔺' }
              ].map(wave => (
                <button
                  key={wave.value}
                  onClick={() => setWaveform(wave.value)}
                  className={`flex-1 px-3 py-2 rounded text-xs font-semibold transition-all ${
                    waveform === wave.value
                      ? 'bg-purple-600 text-white border-2 border-purple-400'
                      : 'bg-gray-700 text-gray-300 border-2 border-gray-600 hover:border-purple-500'
                  }`}
                >
                  <div>{wave.emoji}</div>
                  <div className="mt-1">{wave.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scala Armonizzata */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-purple-300">Scala Armonizzata: {rootNote} {scaleType}</h2>
          <div className="flex flex-wrap gap-3">
            {harmonizedScale.map((chord, index) => (
              <div
                key={index}
                draggable
                onDragStart={() => handleDragStart(chord)}
                onDragEnd={handleDragEnd}
                className={`bg-gray-700 border-2 border-gray-600 rounded-lg p-4 w-44 cursor-grab active:cursor-grabbing hover:border-purple-500 transition-all duration-200 ${
                  draggedChord === chord ? 'opacity-50' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-2xl font-bold text-white">{chord.chord}</span>
                  <span className="text-sm font-mono text-gray-400">{chord.roman}</span>
                </div>
                <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 border ${getFunctionColor(chord.function)}`}>
                  {chord.function}
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  Note: {chord.notes.join(' - ')}
                </div>
                <div className="flex gap-1 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playChord(chord, 2000);
                    }}
                    className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white p-1.5 rounded transition-colors"
                    title="Suona accordo"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playArpeggio(chord, 400);
                    }}
                    className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded transition-colors"
                    title="Suona arpeggio"
                  >
                    <Waves className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progressione Creata */}
        <div className="bg-gray-800 rounded-lg p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-purple-300">La Tua Progressione</h2>
            <div className="flex gap-2">
              <button
                onClick={fillRandomProgression}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Music className="w-4 h-4" />
                Random
              </button>
              {progression.some(p => p.beats.some(b => b)) && (
                <>
                  <button
                    onClick={playProgression}
                    disabled={isPlaying}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isPlaying 
                        ? 'bg-gray-600 cursor-not-allowed' 
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    <Play className="w-4 h-4" />
                    {isPlaying ? 'Playing...' : 'Play'}
                  </button>
                  {isPlaying && (
                    <button
                      onClick={stopProgression}
                      className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg transition-colors"
                    >
                      <Square className="w-4 h-4" />
                      Stop
                    </button>
                  )}
                  <button
                    onClick={copyProgression}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Copia
                  </button>
                  <button
                    onClick={clearProgression}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Cancella
                  </button>
                </>
              )}
            </div>
          </div>
          
          {progression.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Imposta i parametri sopra per iniziare</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Griglia Battute */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progression.map((bar, barIndex) => (
                  <div 
                    key={barIndex} 
                    className={`bg-gray-700 rounded-lg p-4 border-2 transition-all ${
                      currentBar === barIndex 
                        ? 'border-green-500 bg-gray-600' 
                        : 'border-gray-600'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-sm font-semibold text-purple-300">
                        Battuta {bar.bar}
                      </div>
                      <button
                        onClick={() => clearBar(barIndex)}
                        className="bg-red-500 hover:bg-red-600 rounded p-1 transition-colors"
                        title="Cancella battuta"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {bar.beats.map((beat, beatIndex) => (
                        <div 
                          key={beatIndex}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, barIndex, beatIndex)}
                          className={`relative rounded p-2 min-h-[80px] flex flex-col items-center justify-center border-2 transition-all ${
                            draggedChord && !beat
                              ? 'border-purple-500 border-dashed bg-gray-700'
                              : beat
                              ? `${getFunctionColor(beat.function)} border-2`
                              : 'bg-gray-800 border-gray-600'
                          }`}
                        >
                          <div className="text-xs text-gray-500 mb-1">
                            {beatIndex + 1}
                          </div>
                          
                          {beat ? (
                            <>
                              <div className="text-lg font-bold mb-1">
                                {beat.chord}
                              </div>
                              <div className="text-xs opacity-70 mb-1">
                                {beat.roman}
                              </div>
                              <div className="text-[10px] font-semibold opacity-80">
                                {beat.function}
                              </div>
                              <button
                                onClick={() => clearBeat(barIndex, beatIndex)}
                                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 rounded-full p-0.5 transition-colors"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            </>
                          ) : (
                            <div className="text-gray-600 text-xs text-center">
                              {draggedChord ? '↓ Rilascia qui' : '—'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-purple-300">Notazione:</h3>
                <div className="bg-gray-900 rounded p-4 font-mono">
                  {progression.map((bar, i) => (
                    <div key={i} className="mb-2">
                      <span className="text-purple-400 mr-2">Bar {i + 1}:</span>
                      <span className="text-xl">
                        {bar.beats.map(b => b ? b.chord : '—').join(' ')}
                      </span>
                      <span className="text-sm text-gray-400 ml-3">
                        {bar.beats.map(b => b ? b.roman : '—').join(' ')}
                      </span>
                    </div>
                  ))}
                  <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-800">
                    {timeSignature} @ {bpm} BPM
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legenda */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4 text-sm">
          <h3 className="font-semibold mb-2 text-purple-300">Legenda Funzioni:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Tonica (stabilità)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Sottodominante (movimento)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Dominante (tensione)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span>Modale (colore)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mount the component
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ChordProgressionBuilder />
  </React.StrictMode>
);

export default ChordProgressionBuilder;