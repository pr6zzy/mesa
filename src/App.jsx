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
  const [viewingPublicProfile, setViewingPublicProfile] = useState(null);

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

  // Auth / Profile Form
  const [authUsernameInput, setAuthUsernameInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [avatarInput, setAvatarInput] = useState('');

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
      avatarUrl: avatarInput,
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

  // Search results calculation
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
    <div className={`min-h-screen ${theme.bg}${theme.text} font-sans flex flex-col selection:bg-red-900 selection:text-white transition-colors duration-300`}>
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
          {/* Theme Selector */}
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
                <p className="text-sm text-zinc-500 mb-6">Create a folder to start organizing your tracks and artwork persistently.</p>
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
                  <label className={`flex items
