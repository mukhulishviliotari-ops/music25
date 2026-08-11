// playlist.js — localStorage-backed likes and playlists
(function(){
  const LIKED_KEY = 'music_liked_v1';
  const PLAYLIST_KEY = 'music_playlists_v1';

  function genId(prefix){ return prefix + '_' + Date.now() + '_' + Math.floor(Math.random()*1000); }

  function loadLiked(){ try{ return JSON.parse(localStorage.getItem(LIKED_KEY) || '[]'); }catch(e){ return []; } }
  function saveLiked(arr){ localStorage.setItem(LIKED_KEY, JSON.stringify(arr)); }

  function loadPlaylists(){ try{ return JSON.parse(localStorage.getItem(PLAYLIST_KEY) || '[]'); }catch(e){ return []; } }
  function savePlaylists(arr){ localStorage.setItem(PLAYLIST_KEY, JSON.stringify(arr)); }

  function isCoverLiked(id){ return loadLiked().some(c=>c.id === id); }

  window.toggleLikeCover = function(cover){
    if(!cover || !cover.id) return;
    const liked = loadLiked();
    const idx = liked.findIndex(c=>c.id === cover.id);
    if(idx === -1){ liked.push(cover); saveLiked(liked); } else { liked.splice(idx,1); saveLiked(liked); }
  };

  window.getLikedCovers = function(){ return loadLiked(); };

  window.createPlaylist = function(name){ if(!name) return null; const pls = loadPlaylists(); const id = genId('pl'); pls.push({id,name,items:[]}); savePlaylists(pls); return id; };
  window.getPlaylists = function(){ return loadPlaylists(); };

  window.addCoverToPlaylist = function(playlistId, cover){ const pls = loadPlaylists(); const pl = pls.find(p=>p.id===playlistId); if(!pl) return false; if(!pl.items.some(i=>i.id===cover.id)) pl.items.push(cover); savePlaylists(pls); return true; };

  window.removeCoverFromPlaylist = function(playlistId, coverId){ const pls = loadPlaylists(); const pl = pls.find(p=>p.id===playlistId); if(!pl) return false; pl.items = pl.items.filter(i=>i.id !== coverId); savePlaylists(pls); return true; };

  window.deletePlaylist = function(playlistId){ let pls = loadPlaylists(); pls = pls.filter(p=>p.id !== playlistId); savePlaylists(pls); };

  // Small toast helper for nicer feedback
  window.showToast = function(message, duration = 2000){
    let container = document.getElementById('toast-container');
    if(!container){ container = document.createElement('div'); container.id = 'toast-container'; document.body.appendChild(container); }
    const t = document.createElement('div');
    t.className = 'toast'; t.textContent = message;
    container.appendChild(t);
    requestAnimationFrame(()=> t.classList.add('visible'));
    setTimeout(()=>{ t.classList.remove('visible'); setTimeout(()=> t.remove(), 300); }, duration);
  };

  // Attach handlers on index page for like checkboxes
  document.addEventListener('DOMContentLoaded', () => {
    const boxes = document.querySelectorAll('[data-name]');
    boxes.forEach(box => {
      const cb = box.querySelector('.like-checkbox');
      if(!cb) return;
      const id = box.dataset.id || box.dataset.name;
      cb.checked = isCoverLiked(id);
      cb.addEventListener('change', () => {
        const cover = {
          id: id,
          name: box.dataset.name,
          cover: box.dataset.cover || '',
          track: box.dataset.track || ''
        };
        toggleLikeCover(cover);
      });
    });
  });
})();
