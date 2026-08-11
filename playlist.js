// playlist.js — localStorage-backed likes and playlists
(function(){
  const LIKED_KEY = 'music_liked_v1';
  const PLAYLIST_KEY = 'music_playlists_v1';

  window.activeSearch = window.activeSearch || '';

  function genId(prefix){
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  }

  function loadLiked(){
    try { return JSON.parse(localStorage.getItem(LIKED_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function saveLiked(arr){
    localStorage.setItem(LIKED_KEY, JSON.stringify(arr));
  }

  function loadPlaylists(){
    try { return JSON.parse(localStorage.getItem(PLAYLIST_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function savePlaylists(arr){
    localStorage.setItem(PLAYLIST_KEY, JSON.stringify(arr));
  }

  function isCoverLiked(id){
    return loadLiked().some(c => c.id === id);
  }

  window.toggleLikeCover = function(cover){
    if (!cover || !cover.id) return;
    const liked = loadLiked();
    const index = liked.findIndex(c => c.id === cover.id);
    if (index === -1) {
      liked.push(cover);
    } else {
      liked.splice(index, 1);
    }
    saveLiked(liked);
  };

  window.getLikedCovers = function(){
    return loadLiked();
  };

  window.createPlaylist = function(name){
    if (!name) return null;
    const playlists = loadPlaylists();
    const id = genId('pl');
    playlists.push({ id, name, items: [] });
    savePlaylists(playlists);
    return id;
  };

  window.getPlaylists = function(){
    return loadPlaylists();
  };

  window.addCoverToPlaylist = function(playlistId, cover){
    const playlists = loadPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return false;
    if (!playlist.items.some(i => i.id === cover.id)) {
      playlist.items.push(cover);
    }
    savePlaylists(playlists);
    return true;
  };

  window.removeCoverFromPlaylist = function(playlistId, coverId){
    const playlists = loadPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return false;
    playlist.items = playlist.items.filter(i => i.id !== coverId);
    savePlaylists(playlists);
    return true;
  };

  window.deletePlaylist = function(playlistId){
    const playlists = loadPlaylists().filter(p => p.id !== playlistId);
    savePlaylists(playlists);
  };

  function el(tag, props = {}, ...children) {
    const element = document.createElement(tag);
    Object.assign(element, props);
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child) {
        element.appendChild(child);
      }
    });
    return element;
  }

  function matchesSearch(text) {
    if (!window.activeSearch) return true;
    return text.toLowerCase().includes(window.activeSearch);
  }

  window.renderPlaylists = function(){
    const container = document.getElementById('playlists-container');
    const countBadge = document.getElementById('playlist-count');
    if (!container) return;

    const playlists = getPlaylists();
    const filtered = playlists.filter(pl => {
      if (!window.activeSearch) return true;
      const query = window.activeSearch;
      return pl.name.toLowerCase().includes(query) || pl.items.some(item => item.name.toLowerCase().includes(query));
    });

    container.innerHTML = '';
    if (countBadge) {
      countBadge.textContent = filtered.length === playlists.length ? `${playlists.length} saved` : `${filtered.length} filtered`;
    }

    if (playlists.length === 0) {
      container.appendChild(el('div', { className: 'card empty-state' }, 'No playlists yet. Create one to begin saving covers.'));
      return;
    }

    if (filtered.length === 0) {
      container.appendChild(el('div', { className: 'card empty-state' }, 'No playlists match your search.'));
      return;
    }

    filtered.forEach(playlist => {
      const card = el('div', { className: 'card playlist-card' });
      const header = el('div', { className: 'card-header' });
      header.appendChild(el('strong', {}, playlist.name));
      header.appendChild(el('span', { className: 'card-meta' }, `${playlist.items.length} cover${playlist.items.length === 1 ? '' : 's'}`));
      const deleteButton = el('button', { className: 'btn btn-danger' }, 'Delete');
      deleteButton.addEventListener('click', () => {
        if (!confirm('Delete playlist?')) return;
        deletePlaylist(playlist.id);
        showToast('Playlist deleted');
        renderPlaylists();
      });
      header.appendChild(deleteButton);
      card.appendChild(header);

      const list = el('div', { className: 'card-list' });
      if (playlist.items.length === 0) {
        list.appendChild(el('div', { className: 'empty-state' }, 'This playlist is empty yet. Add covers from the liked or recommendations section.'));
      } else {
        playlist.items.forEach(item => {
          const row = el('div', { className: 'card-item' });
          row.appendChild(el('img', { src: item.cover || '', alt: item.name }));
          const info = el('div', { className: 'item-content' });
          info.appendChild(el('span', {}, item.name));
          row.appendChild(info);
          const removeButton = el('button', { className: 'btn btn-danger' }, 'Remove');
          removeButton.addEventListener('click', () => {
            removeCoverFromPlaylist(playlist.id, item.id);
            showToast('Removed from playlist');
            renderPlaylists();
          });
          row.appendChild(removeButton);
          list.appendChild(row);
        });
      }

      card.appendChild(list);
      container.appendChild(card);
    });

    requestAnimationFrame(() => {
      Array.from(container.children).forEach((el, index) => setTimeout(() => el.classList.add('visible-on-load'), index * 70));
    });
  };

  window.renderLiked = function(){
    const container = document.getElementById('liked-container');
    if (!container) return;

    const liked = getLikedCovers();
    const filtered = liked.filter(item => matchesSearch(item.name));
    const playlists = getPlaylists();

    container.innerHTML = '';
    if (liked.length === 0) {
      container.appendChild(el('div', { className: 'card empty-state' }, 'No liked covers yet. Add favorites from the homepage to start building your collection.'));
      return;
    }

    if (filtered.length === 0) {
      container.appendChild(el('div', { className: 'card empty-state' }, 'No liked covers match your search.'));
      return;
    }

    filtered.forEach(item => {
      const card = el('div', { className: 'card cover-card' });
      card.appendChild(el('img', { src: item.cover || '', alt: item.name }));
      card.appendChild(el('p', { className: 'cover-title' }, item.name));

      const select = el('select');
      select.appendChild(el('option', { value: '' }, '-- add to playlist --'));
      playlists.forEach(pl => select.appendChild(el('option', { value: pl.id }, pl.name)));

      const button = el('button', { className: 'btn btn-primary' }, 'Add to playlist');
      button.addEventListener('click', () => {
        const playlistId = select.value;
        if (!playlistId) {
          showToast('Choose a playlist');
          return;
        }
        addCoverToPlaylist(playlistId, item);
        showToast('Added to playlist');
        renderPlaylists();
      });

      card.appendChild(select);
      card.appendChild(button);
      container.appendChild(card);
    });

    requestAnimationFrame(() => {
      Array.from(container.children).forEach((el, index) => setTimeout(() => el.classList.add('visible-on-load'), index * 70));
    });
  };

  window.renderRecommendations = function(){
    const container = document.getElementById('recommendations-container');
    if (!container) return;

    if (!window.ALL_COVERS || !Array.isArray(window.ALL_COVERS)) {
      container.innerHTML = '';
      container.appendChild(el('div', { className: 'card empty-state' }, 'No recommendations available.'));
      return;
    }

    const filtered = window.ALL_COVERS.filter(item => matchesSearch(item.name));
    const playlists = getPlaylists();

    container.innerHTML = '';
    if (filtered.length === 0) {
      container.appendChild(el('div', { className: 'card empty-state' }, 'No recommendations match your search.'));
      return;
    }

    filtered.forEach(item => {
      const card = el('div', { className: 'card cover-card' });
      card.appendChild(el('img', { src: item.cover || '', alt: item.name }));
      card.appendChild(el('p', { className: 'cover-title' }, item.name));

      const select = el('select');
      select.appendChild(el('option', { value: '' }, '-- add to playlist --'));
      playlists.forEach(pl => select.appendChild(el('option', { value: pl.id }, pl.name)));

      const button = el('button', { className: 'btn btn-primary' }, 'Add to playlist');
      button.addEventListener('click', () => {
        const playlistId = select.value;
        if (!playlistId) {
          showToast('Choose a playlist');
          return;
        }
        addCoverToPlaylist(playlistId, item);
        showToast('Added to playlist');
        renderPlaylists();
      });

      card.appendChild(select);
      card.appendChild(button);
      container.appendChild(card);
    });

    requestAnimationFrame(() => {
      Array.from(container.children).forEach((el, index) => setTimeout(() => el.classList.add('visible-on-load'), index * 70));
    });
  };

  window.showToast = function(message, duration = 2000){
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 250);
    }, duration);
  };

  document.addEventListener('DOMContentLoaded', () => {
    const boxes = document.querySelectorAll('[data-name]');
    boxes.forEach(box => {
      const checkbox = box.querySelector('.like-checkbox');
      if (!checkbox) return;
      const id = box.dataset.id || box.dataset.name;
      checkbox.checked = isCoverLiked(id);
      checkbox.addEventListener('change', () => {
        const cover = {
          id,
          name: box.dataset.name,
          cover: box.dataset.cover || '',
          track: box.dataset.track || ''
        };
        toggleLikeCover(cover);
      });
    });
  });
})();
