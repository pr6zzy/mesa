import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { 
  Folder, Music, Sun, Moon, FolderPlus, Edit3, ArrowLeft, 
  Trash2, Image, Camera, Play, Pause, Plus, Share2, Search, 
  SkipBack, SkipForward, Volume2, VolumeX, X, Download, Archive,
  Lock, Globe, User, LogIn, LogOut, Check, Shield
} from 'lucide-react';

export default function App() {
  // --- 1. LOCAL STORAGE PERSISTENCE ---
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('mesa_user_profile');
    return saved ? JSON.parse(saved) : {
      username: 'pr6zzy',
      displayName: 'pr6zzy',
      bio: 'Gothic beatmaker & sound designer.',
      avatarUrl: '',
      isLoggedIn: true
    };
  });

  const [folders, setFolders] = useState(() => {
    const saved = localStorage.getItem('mesa_folders');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('mesa_theme') || 'blood';
  });

  // Save to LocalStorage automatically whenever data changes
  useEffect(() => {
    localStorage.setItem('mesa_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('mesa_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('mesa_theme', currentTheme);
  }, [currentTheme]);

  // --- STATES & NAVIGATION ---
  const [activeFolderId, setActiveFolderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Folder Form
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [folderProducerInput, setFolderProducerInput] = useState('');
  const [folderCoverInput, setFolderCoverInput] = useState('');
  const [folderIsPublic, setFolderIsPublic] = useState(true);

  // Auth Form
  const [authUsernameInput, setAuthUsernameInput] = useState('');

  // Audio & Export State
  const [isZipping, setIsZipping] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const activeFolder = folders.find(f => f.id === activeFolderId);

  // --- THEMES ---
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

  // Audio Playback Handler
  useEffect(() => {
    if (audioRef.current) {
      if (currentSong && currentSong.url) {
        audioRef.current.src = currentSong.url;
        if (isPlaying) audioRef.current.play().catch(e => console.log(e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.play().catch(e => console.log(e));
      else audioRef.current.pause();
    }
  }, [isPlaying]);

  // --- ACTIONS ---
  const handleOpenCreateModal = () => {
    setEditingFolderId(null);
    setFolderNameInput('');
    setFolderProducerInput(userProfile.displayName || 'pr6zzy');
    setFolderCoverInput('');
    setFolderIsPublic(true);
    setIsFolderModalOpen(true);
  };

  const handleOpenEditModal = (folder, e) => {
    e.stopPropagation();
    setEditingFolderId(folder.id);
    setFolderNameInput(folder.name);
    setFolderProducerInput(folder.producer || userProfile.displayName);
    setFolderCoverInput(folder.coverUrl || '');
    setFolderIsPublic(folder.isPublic !== false);
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
        coverUrl: folderCoverInput,
        isPublic: folderIsPublic
      } : f));
    } else {
      const newFolder = {
        id: 'folder-' + Date.now(),
        name: folderNameInput,
        producer: folderProducerInput || userProfile.displayName,
        ownerHandle: userProfile.username.toLowerCase(),
        coverUrl: folderCoverInput,
        isPublic: folderIsPublic,
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
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const newSong = {
        id: 'song-' + Date.now(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        fileName: file.name,
        url: dataUrl
      };
      setFolders(prev => prev.map(f => f.id === folderId ? {
        ...f,
        songs: [...f.songs, newSong]
      } : f));

      setCurrentSong(newSong);
      setIsPlaying(true);
    };
    reader.readAsDataURL(file);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!authUsernameInput.trim()) return;
    setUserProfile({
      username: authUsernameInput.trim().toLowerCase(),
      displayName: authUsernameInput.trim(),
      bio: 'Mesa Producer',
      avatarUrl: '',
      isLoggedIn: true
    });
    setIsAuthModalOpen(false);
  };

  const handleExportSingleSong = (song) => {
    if (!song.url) return;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = song.url;
    downloadAnchor.download = song.fileName || `${song.title}.mp3`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportFolderZip = async (folder) => {
    if (!folder || folder.songs.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folderZip = zip.folder(folder.name);

      for (const song of folder.songs) {
        if (song.url) {
          const res = await fetch(song.url);
          const blob = await res.blob();
          folderZip.file(song.fileName || `${song.title}.mp3`, blob);
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(content);

      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = zipUrl;
      downloadAnchor.download = `${folder.name.toLowerCase().replace(/\s+/g, '-')}.zip`;
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(zipUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  const displayedFolders = folders.filter(f => {
    if (!userProfile.isLoggedIn) {
      return f.isPublic !== false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesSearch = f.name.toLowerCase().includes(q) || f.producer.toLowerCase().includes(q);
      return matchesSearch && (f.isPublic !== false || f.ownerHandle === userProfile.username);
    }
    return true;
  });

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans flex flex-col selection:bg-red-900 selection:text-white transition-colors duration-300`}>
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {/* HEADER */}
      <header className={`border-b ${theme.border} px-6 py-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md sticky top-0 z-40 bg-opacity-90 bg-black/40`}>
        <div className="flex items-center gap-6">
          <h1 
            onClick={() => { setActiveFolderId(null); setSearchQuery(''); }}
            className="text-3xl font-extrabold tracking-wider text-red-600 font-serif italic drop-shadow-[0_2px_10px_rgba(220,38,38,0.5)] cursor-pointer"
          >
            mesa
          </h1>

          {/* Search Bar */}
          <div className="relative hidden sm:flex items-center w-64">
            <Search className="w-4 h-4 absolute left-3 text-zinc-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search producers or folders..."
              className={`w-full pl-9 pr-3 py-1.5 rounded-full bg-black/60 border ${theme.border} text-xs outline-none focus:border-red-600 transition`}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select 
            value={currentTheme} 
            onChange={(e) => setCurrentTheme(e.target.value)}
            className={`text-xs px-3 py-1.5 rounded-lg bg-black/80 border ${theme.border} outline-none cursor-pointer`}
          >
            {Object.entries(themes).map(([key, t]) => (
              <option key={key} value={key}>{t.name}</option>
            ))}
          </select>

          {userProfile.isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button 
                onClick={handleOpenCreateModal}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg font-medium text-xs ${theme.primaryBtn} transition shadow-lg`}
              >
                <Plus className="w-3.5 h-3.5" /> New Folder
              </button>

              <button 
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-black/60 hover:bg-black text-xs font-medium transition"
              >
                <User className="w-3.5 h-3.5 text-red-500" />
                <span className="max-w-[80px] truncate">{userProfile.displayName}</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg font-medium text-xs ${theme.primaryBtn} transition shadow-lg`}
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
          )}
        </div>
      </header>

      {/* MAIN BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 pb-32">
        {!activeFolderId ? (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {searchQuery ? `Search Results for "${searchQuery}"` : 'Your Folders & Projects'}
                </h2>
                <p className="text-sm text-zinc-400">
                  {userProfile.isLoggedIn ? 'Manage your public and private beat folders.' : 'Sign in to save your custom folders.'}
                </p>
              </div>
            </div>

            {displayedFolders.length === 0 ? (
              <div className={`text-center py-24 rounded-2xl border border-dashed ${theme.border} bg-black/20`}>
                <Folder className="w-16 h-16 mx-auto text-zinc-700 mb-4 opacity-60" />
                <p className="text-lg font-medium">No folders found</p>
                <p className="text-sm text-zinc-500 mb-6">Create a folder to start organizing your tracks persistently.</p>
                {userProfile.isLoggedIn && (
                  <button onClick={handleOpenCreateModal} className={`px-5 py-2.5 rounded-xl font-medium text-sm ${theme.primaryBtn}`}>
                    Create Folder
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {displayedFolders.map(folder => (
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
                      
                      {/* Privacy Badge */}
                      <span className="absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 flex items-center gap-1">
                        {folder.isPublic !== false ? (
                          <><Globe className="w-3 h-3 text-emerald-400" /> Public</>
                        ) : (
                          <><Lock className="w-3 h-3 text-amber-400" /> Private</>
                        )}
                      </span>

                      {/* Actions */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={(e) => handleOpenEditModal(folder, e)} className="p-2 rounded-lg bg-black/70 hover:bg-zinc-800 text-white transition">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={(e) => handleDeleteFolder(folder.id, e)} className="p-2 rounded-lg bg-black/70 hover:bg-red-900 text-white transition">
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
          /* FOLDER DETAIL VIEW */
          <div>
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setActiveFolderId(null)} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition">
                <ArrowLeft className="w-4 h-4" /> Back to folders
              </button>

              <button 
                onClick={() => handleExportFolderZip(activeFolder)}
                disabled={isZipping || activeFolder.songs.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-black/60 hover:bg-black text-xs font-medium transition text-zinc-200 disabled:opacity-50"
              >
                <Archive className="w-4 h-4 text-red-500" /> 
                {isZipping ? 'Creating ZIP...' : 'Export Folder (.ZIP)'}
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
                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-red-500">Project Folder</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/60 border border-white/10 flex items-center gap-1">
                    {activeFolder.isPublic !== false ? <Globe className="w-3 h-3 text-emerald-400" /> : <Lock className="w-3 h-3 text-amber-400" />}
                    {activeFolder.isPublic !== false ? 'Public' : 'Private'}
                  </span>
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold mb-2">{activeFolder.name}</h2>
                <p className="text-zinc-400 text-sm mb-6">Producer: <span className="text-white font-medium">{activeFolder.producer}</span></p>

                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <button onClick={(e) => handleOpenEditModal(activeFolder, e)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-medium transition">
                    <Edit3 className="w-3.5 h-3.5" /> Edit Info
                  </button>
                  <label className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium ${theme.primaryBtn} cursor-pointer transition shadow-lg`}>
                    <Plus className="w-3.5 h-3.5" /> Upload Track (.mp3 / .wav)
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
              </div>
            </div>

            {/* TRACKLIST */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold tracking-tight">Tracks ({activeFolder.songs.length})</h3>

              {activeFolder.songs.length === 0 ? (
                <div className={`p-12 text-center rounded-2xl border border-dashed ${theme.border} bg-black/20`}>
                  <p className="text-sm text-zinc-400 mb-4">No audio files uploaded in this folder yet.</p>
                  <label className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium ${theme.primaryBtn} cursor-pointer`}>
                    <Plus className="w-3.5 h-3.5" /> Upload Track
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
                            <p className="text-xs text-zinc-400">{song.fileName || 'audio.mp3'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button onClick={() => handleExportSingleSong(song)} className="p-2.5 rounded-full border border-white/10 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition" title="Download Track">
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          <button 
                            onClick={() => {
                              if (currentSong?.id === song.id) setIsPlaying(!isPlaying);
                              else { setCurrentSong(song); setIsPlaying(true); }
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

      {/* CREATE / EDIT FOLDER MODAL */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-3xl border ${theme.card} p-6 sm:p-8 bg-zinc-950 shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{editingFolderId ? 'Edit Folder Settings' : 'Create New Folder'}</h3>
              <button onClick={() => setIsFolderModalOpen(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
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
                  className={`w-full px-4 py-3 rounded-xl bg-black border ${theme.border} outline-none text-sm`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Producer Name</label>
                <input 
                  type="text" 
                  value={folderProducerInput}
                  onChange={(e) => setFolderProducerInput(e.target.value)}
                  placeholder="e.g. pr6zzy"
                  className={`w-full px-4 py-3 rounded-xl bg-black border ${theme.border} outline-none text-sm`}
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
                    className={`w-full px-4 py-3 rounded-xl bg-black border ${theme.border} outline-none text-sm`}
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

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">Folder Privacy</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    onClick={() => setFolderIsPublic(true)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition ${folderIsPublic ? 'border-red-600 bg-red-950/30 text-white' : 'border-white/10 bg-black/40 text-zinc-400'}`}
                  >
                    <Globe className="w-4 h-4 text-emerald-400" /> Public
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setFolderIsPublic(false)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-medium transition ${!folderIsPublic ? 'border-red-600 bg-red-950/30 text-white' : 'border-white/10 bg-black/40 text-zinc-400'}`}
                  >
                    <Lock className="w-4 h-4 text-amber-400" /> Private
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsFolderModalOpen(false)} className="px-5 py-2.5 rounded-xl text-xs font-medium bg-zinc-900 text-zinc-300">Cancel</button>
                <button type="submit" className={`px-6 py-2.5 rounded-xl text-xs font-medium ${theme.primaryBtn}`}>Save Folder</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIGN IN MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl border ${theme.card} p-6 bg-zinc-950 shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2"><LogIn className="w-5 h-5 text-red-500" /> Sign In / Create Profile</h3>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Producer Handle / Username</label>
                <input 
                  type="text" 
                  value={authUsernameInput}
                  onChange={(e) => setAuthUsernameInput(e.target.value)}
                  placeholder="e.g. pr6zzy"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 outline-none text-sm"
                />
              </div>

              <button type="submit" className={`w-full py-3 rounded-xl text-xs font-bold ${theme.primaryBtn}`}>
                Sign In To Mesa
              </button>
            </form>
          </div>
        </div>
      )}

      {/* USER PROFILE MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl border ${theme.card} p-6 bg-zinc-950 shadow-2xl text-center`}>
            <div className="w-16 h-16 mx-auto rounded-full bg-zinc-900 border border-red-600/50 flex items-center justify-center mb-3 text-red-500 font-bold text-xl">
              {userProfile.displayName?.[0]?.toUpperCase() || 'P'}
            </div>
            <h3 className="text-xl font-bold">{userProfile.displayName}</h3>
            <p className="text-xs text-zinc-400 mb-4">@{userProfile.username}</p>

            <button 
              onClick={() => {
                setUserProfile({ ...userProfile, isLoggedIn: false });
                setIsProfileModalOpen(false);
              }}
              className="w-full py-2.5 rounded-xl border border-red-900/40 bg-red-950/20 text-red-400 hover:bg-red-900/30 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* FLOATING PLAYER */}
      {currentSong && (
        <div className={`fixed bottom-0 left-0 right-0 border-t ${theme.border} bg-zinc-950/95 backdrop-blur-xl px-6 py-4 z-50 flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-zinc-900 overflow-hidden flex items-center justify-center border border-white/10">
              <Music className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="font-bold text-sm">{currentSong.title}</p>
              <p className="text-xs text-zinc-400">Playing from mesa</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsPlaying(!isPlaying)} className="p-3 rounded-full bg-red-700 hover:bg-red-600 text-white shadow-lg">
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button onClick={() => { setCurrentSong(null); setIsPlaying(false); }} className="p-2 text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
