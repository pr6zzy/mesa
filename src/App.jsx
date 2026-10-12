import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, Music, Sun, Moon, FolderPlus, Edit3, ArrowLeft, 
  Trash2, Image, Camera, Play, Pause, Plus, Share2, Search, 
  SkipBack, SkipForward, Volume2, VolumeX, X, Download, ExternalLink 
} from 'lucide-react';

export default function App() {
  const [folders, setFolders] = useState([]);
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('blood');
  
  // Modals & States
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [folderProducerInput, setFolderProducerInput] = useState('pr6zzy');
  const [folderCoverInput, setFolderCoverInput] = useState('');

  // Audio Player State
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const activeFolder = folders.find(f => f.id === activeFolderId);

  // Expanded Gothic Theme definitions
  const themes = {
    blood: {
      name: 'Blood Red',
      bg: 'bg-[#120202]',
      card: 'bg-[#1a0404] border-[#330808]',
      text: 'text-zinc-100',
      accent: 'text-red-500',
      primaryBtn: 'bg-red-700 hover:bg-red-600 text-white',
      border: 'border-red-900/40'
    },
    crimson: {
      name: 'Crimson Glow',
      bg: 'bg-[#1c0303]',
      card: 'bg-[#260505] border-[#4a0a0a]',
      text: 'text-red-100',
      accent: 'text-rose-500',
      primaryBtn: 'bg-rose-700 hover:bg-rose-600 text-white',
      border: 'border-rose-900/40'
    },
    obsidian: {
      name: 'Obsidian Black',
      bg: 'bg-[#09090b]',
      card: 'bg-[#18181b] border-[#27272a]',
      text: 'text-zinc-100',
      accent: 'text-zinc-400',
      primaryBtn: 'bg-zinc-800 hover:bg-zinc-700 text-white',
      border: 'border-zinc-800'
    },
    purple: {
      name: 'Midnight Purple',
      bg: 'bg-[#0b0312]',
      card: 'bg-[#150624] border-[#2d0c4a]',
      text: 'text-purple-100',
      accent: 'text-purple-400',
      primaryBtn: 'bg-purple-700 hover:bg-purple-600 text-white',
      border: 'border-purple-900/40'
    },
    pale: {
      name: 'Cemetery Pale',
      bg: 'bg-[#0a0c0e]',
      card: 'bg-[#13171d] border-[#222b36]',
      text: 'text-slate-100',
      accent: 'text-teal-400',
      primaryBtn: 'bg-slate-700 hover:bg-slate-600 text-white',
      border: 'border-slate-800'
    },
    gold: {
      name: 'Vampire Gold',
      bg: 'bg-[#121004]',
      card: 'bg-[#1f1b07] border-[#3b330a]',
      text: 'text-amber-100',
      accent: 'text-amber-400',
      primaryBtn: 'bg-amber-700 hover:bg-amber-600 text-white',
      border: 'border-amber-900/40'
    }
  };

  const theme = themes[currentTheme] || themes.blood;

  // Handle HTML5 audio playback whenever currentSong changes
  useEffect(() => {
    if (audioRef.current) {
      if (currentSong && currentSong.url) {
        audioRef.current.src = currentSong.url;
        if (isPlaying) {
          audioRef.current.play().catch(e => console.log("Playback error:", e));
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.log("Playback error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleOpenCreateModal = () => {
    setEditingFolderId(null);
    setFolderNameInput('');
    setFolderProducerInput('pr6zzy');
    setFolderCoverInput('');
    setIsFolderModalOpen(true);
  };

  const handleOpenEditModal = (folder, e) => {
    e.stopPropagation();
    setEditingFolderId(folder.id);
    setFolderNameInput(folder.name);
    setFolderProducerInput(folder.producer || 'pr6zzy');
    setFolderCoverInput(folder.coverUrl || '');
    setIsFolderModalOpen(true);
  };

  const handleSaveFolder = (e) => {
    e.preventDefault();
    if (!folderNameInput.trim()) return;

    if (editingFolderId) {
      setFolders(folders.map(f => f.id === editingFolderId ? {
        ...f,
        name: folderNameInput,
        producer: folderProducerInput,
        coverUrl: folderCoverInput
      } : f));
    } else {
      const newFolder = {
        id: 'folder-' + Date.now(),
        name: folderNameInput,
        producer: folderProducerInput || 'pr6zzy',
        coverUrl: folderCoverInput,
        songs: []
      };
      setFolders([...folders, newFolder]);
      setActiveFolderId(newFolder.id);
    }
    setIsFolderModalOpen(false);
  };

  const handleDeleteFolder = (folderId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this folder and all its audio tracks?')) {
      setFolders(folders.filter(f => f.id !== folderId));
      if (activeFolderId === folderId) setActiveFolderId(null);
    }
  };

  const handleAddSongToFolder = (folderId, file) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    const newSong = {
      id: 'song-' + Date.now(),
      title: file.name.replace(/\.[^/.]+$/, ""),
      duration: '3:00',
      url: objectUrl,
      fileName: file.name
    };
    setFolders(folders.map(f => f.id === folderId ? {
      ...f,
      songs: [...f.songs, newSong]
    } : f));

    // Auto-play the uploaded song
    setCurrentSong(newSong);
    setIsPlaying(true);
  };

  const handleExportProject = (folder) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(folder, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${folder.name.toLowerCase().replace(/\s+/g, '-')}-project.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans flex flex-col selection:bg-red-900 selection:text-white transition-colors duration-300`}>
      
      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef} 
        onEnded={() => setIsPlaying(false)}
      />

      {/* Top Header */}
      <header className={`border-b ${theme.border} px-6 py-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-40 bg-opacity-90 bg-black/40`}>
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveFolderId(null)}>
          <h1 className="text-3xl font-extrabold tracking-wider text-red-600 font-serif italic drop-shadow-[0_2px_10px_rgba(220,38,38,0.5)]">
            mesa
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Expanded Theme Selector */}
          <select 
            value={currentTheme} 
            onChange={(e) => setCurrentTheme(e.target.value)}
            className={`text-xs px-3 py-1.5 rounded-lg bg-black/80 border ${theme.border} outline-none cursor-pointer`}
          >
            {Object.entries(themes).map(([key, t]) => (
              <option key={key} value={key}>{t.name}</option>
            ))}
          </select>

          <button 
            onClick={handleOpenCreateModal}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm ${theme.primaryBtn} transition shadow-lg`}
          >
            <Plus className="w-4 h-4" /> New Folder
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 pb-32">
        {!activeFolderId ? (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Your Folders & Projects</h2>
                <p className="text-sm text-zinc-400">Select a folder to view songs or upload your audio tracks.</p>
              </div>
            </div>

            {folders.length === 0 ? (
              <div className={`text-center py-24 rounded-2xl border border-dashed ${theme.border} bg-black/20`}>
                <Folder className="w-16 h-16 mx-auto text-zinc-700 mb-4 opacity-60" />
                <p className="text-lg font-medium">No folders created yet</p>
                <p className="text-sm text-zinc-500 mb-6">Create your first folder to start organizing your beats and custom artwork.</p>
                <button 
                  onClick={handleOpenCreateModal}
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm ${theme.primaryBtn}`}
                >
                  Create First Folder
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {folders.map(folder => (
                  <div 
                    key={folder.id}
                    onClick={() => setActiveFolderId(folder.id)}
                    className={`group relative rounded-2xl overflow-hidden border ${theme.card} hover:border-red-600/60 transition-all duration-300 cursor-pointer shadow-xl flex flex-col`}
                  >
                    <div className="h-48 bg-zinc-900 relative overflow-hidden flex items-center justify-center">
                      {folder.coverUrl ? (
                        <img src={folder.coverUrl} alt={folder.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      ) : (
                        <Music className="w-12 h-12 text-zinc-700" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                      
                      {/* Action buttons on card hover */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button 
                          onClick={(e) => handleOpenEditModal(folder, e)}
                          className="p-2 rounded-lg bg-black/70 hover:bg-zinc-800 text-white transition"
                          title="Edit Folder"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteFolder(folder.id, e)}
                          className="p-2 rounded-lg bg-black/70 hover:bg-red-900 text-white transition"
                          title="Delete Folder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="absolute bottom-3 left-3 text-xs px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10">
                        {folder.songs.length} tracks
                      </span>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-lg truncate group-hover:text-red-500 transition">{folder.name}</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">Prod. {folder.producer}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Folder Detail View */
          <div>
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={() => setActiveFolderId(null)}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to all folders
              </button>

              <button 
                onClick={() => handleExportProject(activeFolder)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-black/40 hover:bg-black text-xs font-medium transition text-zinc-300"
              >
                <Download className="w-3.5 h-3.5" /> Export Project Data
              </button>
            </div>

            <div className={`rounded-3xl border ${theme.card} p-6 sm:p-8 mb-8 flex flex-col md:flex-row gap-8 items-center bg-black/40 backdrop-blur-xl`}>
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-white/10 shadow-2xl flex items-center justify-center">
                {activeFolder.coverUrl ? (
                  <img src={activeFolder.coverUrl} alt={activeFolder.name} className="w-full h-full object-cover" />
                ) : (
                  <Music className="w-16 h-16 text-zinc-700" />
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <span className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-2 inline-block">Project Folder</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold mb-2">{activeFolder.name}</h2>
                <p className="text-zinc-400 text-sm mb-6">Producer: <span className="text-white font-medium">{activeFolder.producer}</span></p>

                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <button 
                    onClick={(e) => handleOpenEditModal(activeFolder, e)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-medium transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Folder & Artwork
                  </button>
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium ${theme.primaryBtn} cursor-pointer transition shadow-lg`}>
                    <Plus className="w-3.5 h-3.5" /> Upload Audio Track (.mp3 / .wav)
                    <input 
                      type="file" 
                      accept="audio/*" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleAddSongToFolder(activeFolder.id, e.target.files[0]);
                          e.target.value = null; // reset input
                        }
                      }} 
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Tracklist */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight">Tracks ({activeFolder.songs.length})</h3>

              {activeFolder.songs.length === 0 ? (
                <div className={`p-12 text-center rounded-2xl border border-dashed ${theme.border} bg-black/20`}>
                  <p className="text-sm text-zinc-400 mb-4">No audio files uploaded in this folder yet.</p>
                  <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium ${theme.primaryBtn} cursor-pointer`}>
                    <Plus className="w-3.5 h-3.5" /> Upload First Track
                    <input 
                      type="file" 
                      accept="audio/*" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleAddSongToFolder(activeFolder.id, e.target.files[0]);
                          e.target.value = null;
                        }
                      }} 
                    />
                  </label>
                </div>
              ) : (
                <div className={`rounded-2xl border ${theme.card} overflow-hidden divide-y divide-white/5`}>
                  {activeFolder.songs.map((song, index) => {
                    const isCurrentPlaying = currentSong?.id === song.id && isPlaying;
                    return (
                      <div key={song.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition">
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-zinc-500 font-mono w-6 text-right">0{index + 1}</span>
                          <div>
                            <p className="font-semibold text-sm">{song.title}</p>
                            <p className="text-xs text-zinc-400">Prod. {activeFolder.producer}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => {
                              if (currentSong?.id === song.id) {
                                setIsPlaying(!isPlaying);
                              } else {
                                setCurrentSong(song);
                                setIsPlaying(true);
                              }
                            }}
                            className={`p-2.5 rounded-full ${isCurrentPlaying ? 'bg-zinc-200 text-black' : 'bg-red-700 hover:bg-red-600 text-white'} transition shadow-md`}
                          >
                            {isCurrentPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Folder Creation / Editing Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl border ${theme.card} p-6 sm:p-8 bg-zinc-950 shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{editingFolderId ? 'Edit Folder & Artwork' : 'Create New Folder'}</h3>
              <button onClick={() => setIsFolderModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFolder} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Folder / Project Name</label>
                <input 
                  type="text" 
                  value={folderNameInput}
                  onChange={(e) => setFolderNameInput(e.target.value)}
                  placeholder="e.g. unreleased beats"
                  required
                  className={`w-full px-4 py-3 rounded-xl bg-black border ${theme.border} focus:border-red-600 outline-none text-sm`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Producer Name</label>
                <input 
                  type="text" 
                  value={folderProducerInput}
                  onChange={(e) => setFolderProducerInput(e.target.value)}
                  placeholder="e.g. pr6zzy"
                  className={`w-full px-4 py-3 rounded-xl bg-black border ${theme.border} focus:border-red-600 outline-none text-sm`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Cover Photo Image URL</label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    value={folderCoverInput}
                    onChange={(e) => setFolderCoverInput(e.target.value)}
                    placeholder="https://image-link.com/photo.jpg"
                    className={`w-full px-4 py-3 rounded-xl bg-black border ${theme.border} focus:border-red-600 outline-none text-sm`}
                  />
                  <label className={`px-4 py-3 rounded-xl border ${theme.border} bg-zinc-900 hover:bg-zinc-800 cursor-pointer flex items-center justify-center text-xs font-medium transition`}>
                    <Camera className="w-4 h-4" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          const reader = new FileReader();
                          reader.onload = (uploadEvent) => setFolderCoverInput(uploadEvent.target.result);
                          reader.readAsDataURL(e.target.files[0]);
                        }
                      }} 
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl text-xs font-medium ${theme.primaryBtn} transition shadow-lg`}
                >
                  {editingFolderId ? 'Save Changes' : 'Create & Open Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Audio Player Bar */}
      {currentSong && (
        <div className={`fixed bottom-0 left-0 right-0 border-t ${theme.border} bg-zinc-950/95 backdrop-blur-xl px-6 py-4 z-50 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-zinc-900 overflow-hidden flex items-center justify-center border border-white/10">
              <Music className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="font-bold text-sm">{currentSong.title}</p>
              <p className="text-xs text-zinc-400">Now Playing from mesa</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 rounded-full bg-red-700 hover:bg-red-600 text-white transition shadow-lg"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button 
              onClick={() => {
                setCurrentSong(null);
                setIsPlaying(false);
              }}
              className="p-2 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
