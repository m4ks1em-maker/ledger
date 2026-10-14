// Debug output is off unless you run `window.LEDGER_DEBUG = true` in the console.
const dbg = (...a) => { if (window.LEDGER_DEBUG) console.log(...a); };
const tr = (s) => (window.LedgerI18n ? window.LedgerI18n.t(s) : s);

const DOTA_HEROES = [
    { id: 'antimage', name: 'Anti-Mage', localized_name: 'Anti-Mage' },
    { id: 'axe', name: 'Axe', localized_name: 'Axe' },
    { id: 'bane', name: 'Bane', localized_name: 'Bane' },
    { id: 'bloodseeker', name: 'Bloodseeker', localized_name: 'Bloodseeker' },
    { id: 'crystal_maiden', name: 'Crystal Maiden', localized_name: 'Crystal Maiden' },
    { id: 'drow_ranger', name: 'Drow Ranger', localized_name: 'Drow Ranger' },
    { id: 'earthshaker', name: 'Earthshaker', localized_name: 'Earthshaker' },
    { id: 'juggernaut', name: 'Juggernaut', localized_name: 'Juggernaut' },
    { id: 'mirana', name: 'Mirana', localized_name: 'Mirana' },
    { id: 'morphling', name: 'Morphling', localized_name: 'Morphling' },
    { id: 'nevermore', name: 'Shadow Fiend', localized_name: 'Shadow Fiend' },
    { id: 'phantom_lancer', name: 'Phantom Lancer', localized_name: 'Phantom Lancer' },
    { id: 'puck', name: 'Puck', localized_name: 'Puck' },
    { id: 'pudge', name: 'Pudge', localized_name: 'Pudge' },
    { id: 'razor', name: 'Razor', localized_name: 'Razor' },
    { id: 'sand_king', name: 'Sand King', localized_name: 'Sand King' },
    { id: 'storm_spirit', name: 'Storm Spirit', localized_name: 'Storm Spirit' },
    { id: 'sven', name: 'Sven', localized_name: 'Sven' },
    { id: 'tiny', name: 'Tiny', localized_name: 'Tiny' },
    { id: 'vengefulspirit', name: 'Vengeful Spirit', localized_name: 'Vengeful Spirit' },
    { id: 'windrunner', name: 'Windrunner', localized_name: 'Windrunner' },
    { id: 'zeus', name: 'Zeus', localized_name: 'Zeus' },
    { id: 'kunkka', name: 'Kunkka', localized_name: 'Kunkka' },
    { id: 'kez', name: 'Kez', localized_name: 'Kez' },
    { id: 'lina', name: 'Lina', localized_name: 'Lina' },
    { id: 'lion', name: 'Lion', localized_name: 'Lion' },
    { id: 'shadow_shaman', name: 'Shadow Shaman', localized_name: 'Shadow Shaman' },
    { id: 'slardar', name: 'Slardar', localized_name: 'Slardar' },
    { id: 'tidehunter', name: 'Tidehunter', localized_name: 'Tidehunter' },
    { id: 'witch_doctor', name: 'Witch Doctor', localized_name: 'Witch Doctor' },
    { id: 'lich', name: 'Lich', localized_name: 'Lich' },
    { id: 'riki', name: 'Riki', localized_name: 'Riki' },
    { id: 'enigma', name: 'Enigma', localized_name: 'Enigma' },
    { id: 'tinker', name: 'Tinker', localized_name: 'Tinker' },
    { id: 'sniper', name: 'Sniper', localized_name: 'Sniper' },
    { id: 'necrolyte', name: 'Necrophos', localized_name: 'Necrophos' },
    { id: 'warlock', name: 'Warlock', localized_name: 'Warlock' },
    { id: 'beastmaster', name: 'Beastmaster', localized_name: 'Beastmaster' },
    { id: 'queenofpain', name: 'Queen of Pain', localized_name: 'Queen of Pain' },
    { id: 'venomancer', name: 'Venomancer', localized_name: 'Venomancer' },
    { id: 'faceless_void', name: 'Faceless Void', localized_name: 'Faceless Void' },
    { id: 'skeleton_king', name: 'Wraith King', localized_name: 'Wraith King' },
    { id: 'death_prophet', name: 'Death Prophet', localized_name: 'Death Prophet' },
    { id: 'phantom_assassin', name: 'Phantom Assassin', localized_name: 'Phantom Assassin' },
    { id: 'pugna', name: 'Pugna', localized_name: 'Pugna' },
    { id: 'templar_assassin', name: 'Templar Assassin', localized_name: 'Templar Assassin' },
    { id: 'viper', name: 'Viper', localized_name: 'Viper' },
    { id: 'luna', name: 'Luna', localized_name: 'Luna' },
    { id: 'dragon_knight', name: 'Dragon Knight', localized_name: 'Dragon Knight' },
    { id: 'dazzle', name: 'Dazzle', localized_name: 'Dazzle' },
    { id: 'rattletrap', name: 'Clockwerk', localized_name: 'Clockwerk' },
    { id: 'leshrac', name: 'Leshrac', localized_name: 'Leshrac' },
    { id: 'furion', name: 'Nature\'s Prophet', localized_name: 'Nature\'s Prophet' },
    { id: 'life_stealer', name: 'Lifestealer', localized_name: 'Lifestealer' },
    { id: 'dark_seer', name: 'Dark Seer', localized_name: 'Dark Seer' },
    { id: 'clinkz', name: 'Clinkz', localized_name: 'Clinkz' },
    { id: 'omniknight', name: 'Omniknight', localized_name: 'Omniknight' },
    { id: 'enchantress', name: 'Enchantress', localized_name: 'Enchantress' },
    { id: 'huskar', name: 'Huskar', localized_name: 'Huskar' },
    { id: 'night_stalker', name: 'Night Stalker', localized_name: 'Night Stalker' },
    { id: 'broodmother', name: 'Broodmother', localized_name: 'Broodmother' },
    { id: 'bounty_hunter', name: 'Bounty Hunter', localized_name: 'Bounty Hunter' },
    { id: 'weaver', name: 'Weaver', localized_name: 'Weaver' },
    { id: 'jakiro', name: 'Jakiro', localized_name: 'Jakiro' },
    { id: 'batrider', name: 'Batrider', localized_name: 'Batrider' },
    { id: 'chen', name: 'Chen', localized_name: 'Chen' },
    { id: 'spectre', name: 'Spectre', localized_name: 'Spectre' },
    { id: 'ancient_apparition', name: 'Ancient Apparition', localized_name: 'Ancient Apparition' },
    { id: 'doom_bringer', name: 'Doom', localized_name: 'Doom' },
    { id: 'ursa', name: 'Ursa', localized_name: 'Ursa' },
    { id: 'spirit_breaker', name: 'Spirit Breaker', localized_name: 'Spirit Breaker' },
    { id: 'gyrocopter', name: 'Gyrocopter', localized_name: 'Gyrocopter' },
    { id: 'alchemist', name: 'Alchemist', localized_name: 'Alchemist' },
    { id: 'invoker', name: 'Invoker', localized_name: 'Invoker' },
    { id: 'silencer', name: 'Silencer', localized_name: 'Silencer' },
    { id: 'obsidian_destroyer', name: 'Outworld Devourer', localized_name: 'Outworld Devourer' },
    { id: 'lycan', name: 'Lycan', localized_name: 'Lycan' },
    { id: 'brewmaster', name: 'Brewmaster', localized_name: 'Brewmaster' },
    { id: 'shadow_demon', name: 'Shadow Demon', localized_name: 'Shadow Demon' },
    { id: 'lone_druid', name: 'Lone Druid', localized_name: 'Lone Druid' },
    { id: 'chaos_knight', name: 'Chaos Knight', localized_name: 'Chaos Knight' },
    { id: 'meepo', name: 'Meepo', localized_name: 'Meepo' },
    { id: 'treant', name: 'Treant Protector', localized_name: 'Treant Protector' },
    { id: 'ogre_magi', name: 'Ogre Magi', localized_name: 'Ogre Magi' },
    { id: 'undying', name: 'Undying', localized_name: 'Undying' },
    { id: 'rubick', name: 'Rubick', localized_name: 'Rubick' },
    { id: 'disruptor', name: 'Disruptor', localized_name: 'Disruptor' },
    { id: 'nyx_assassin', name: 'Nyx Assassin', localized_name: 'Nyx Assassin' },
    { id: 'naga_siren', name: 'Naga Siren', localized_name: 'Naga Siren' },
    { id: 'keeper_of_the_light', name: 'Keeper of the Light', localized_name: 'Keeper of the Light' },
    { id: 'wisp', name: 'Io', localized_name: 'Io' },
    { id: 'visage', name: 'Visage', localized_name: 'Visage' },
    { id: 'slark', name: 'Slark', localized_name: 'Slark' },
    { id: 'medusa', name: 'Medusa', localized_name: 'Medusa' },
    { id: 'troll_warlord', name: 'Troll Warlord', localized_name: 'Troll Warlord' },
    { id: 'centaur', name: 'Centaur Warrunner', localized_name: 'Centaur Warrunner' },
    { id: 'magnataur', name: 'Magnus', localized_name: 'Magnus' },
    { id: 'shredder', name: 'Timbersaw', localized_name: 'Timbersaw' },
    { id: 'bristleback', name: 'Bristleback', localized_name: 'Bristleback' },
    { id: 'tusk', name: 'Tusk', localized_name: 'Tusk' },
    { id: 'skywrath_mage', name: 'Skywrath Mage', localized_name: 'Skywrath Mage' },
    { id: 'abaddon', name: 'Abaddon', localized_name: 'Abaddon' },
    { id: 'elder_titan', name: 'Elder Titan', localized_name: 'Elder Titan' },
    { id: 'legion_commander', name: 'Legion Commander', localized_name: 'Legion Commander' },
    { id: 'techies', name: 'Techies', localized_name: 'Techies' },
    { id: 'ember_spirit', name: 'Ember Spirit', localized_name: 'Ember Spirit' },
    { id: 'earth_spirit', name: 'Earth Spirit', localized_name: 'Earth Spirit' },
    { id: 'abyssal_underlord', name: 'Underlord', localized_name: 'Underlord' },
    { id: 'terrorblade', name: 'Terrorblade', localized_name: 'Terrorblade' },
    { id: 'phoenix', name: 'Phoenix', localized_name: 'Phoenix' },
    { id: 'oracle', name: 'Oracle', localized_name: 'Oracle' },
    { id: 'winter_wyvern', name: 'Winter Wyvern', localized_name: 'Winter Wyvern' },
    { id: 'arc_warden', name: 'Arc Warden', localized_name: 'Arc Warden' },
    { id: 'monkey_king', name: 'Monkey King', localized_name: 'Monkey King' },
    { id: 'dark_willow', name: 'Dark Willow', localized_name: 'Dark Willow' },
    { id: 'pangolier', name: 'Pangolier', localized_name: 'Pangolier' },
    { id: 'grimstroke', name: 'Grimstroke', localized_name: 'Grimstroke' },
    { id: 'hoodwink', name: 'Hoodwink', localized_name: 'Hoodwink' },
    { id: 'void_spirit', name: 'Void Spirit', localized_name: 'Void Spirit' },
    { id: 'snapfire', name: 'Snapfire', localized_name: 'Snapfire' },
    { id: 'mars', name: 'Mars', localized_name: 'Mars' },
    { id: 'dawnbreaker', name: 'Dawnbreaker', localized_name: 'Dawnbreaker' },
    { id: 'marci', name: 'Marci', localized_name: 'Marci' },
    { id: 'primal_beast', name: 'Primal Beast', localized_name: 'Primal Beast' },
    { id: 'muerta', name: 'Muerta', localized_name: 'Muerta' },
    { id: 'ringmaster', name: 'Ringmaster', localized_name: 'Ringmaster' }
];

    function convertSteamIDTo64(steamID) {
        if (!steamID) return null;
        const steamIDStr = String(steamID).trim();
        const STEAMID64_IDENTIFIER = BigInt('76561197960265728');
        
        if (steamIDStr.startsWith('[') && steamIDStr.endsWith(']')) {
            const match = steamIDStr.match(/\[U:1:(\d+)\]/);
            if (match) {
                const accountID = BigInt(match[1]);
                const steamID64 = accountID + STEAMID64_IDENTIFIER;
                return steamID64.toString();
            }
        } else if (steamIDStr.startsWith('U:1:')) {
            const accountID = BigInt(steamIDStr.substring(4));
            const steamID64 = accountID + STEAMID64_IDENTIFIER;
            return steamID64.toString();
        } else if (/^\d+$/.test(steamIDStr)) {
            const numID = BigInt(steamIDStr);
            if (numID < STEAMID64_IDENTIFIER) {
                const steamID64 = numID + STEAMID64_IDENTIFIER;
                return steamID64.toString();
            }
        }
        
        return steamIDStr;
    }

    // who a timeline icon stands for: name + SteamID64, used for the tooltip and the click-through
    function iconPlayer(report, cand) {
        const src = cand || report || {};
        const useTarget = !cand && report && (report.TargetHero || report.TargetSteamID != null);
        const name = String((useTarget ? src.TargetName : src.Name) || '').trim();
        const raw = String((useTarget ? src.TargetSteamID : src.SteamID) || '').trim();
        let id = '';
        try { if (/^\d+$/.test(raw) && raw !== '0') { let n = BigInt(raw); if (n < 76561197960265728n) n += 76561197960265728n; id = n.toString(); } } catch (_) {}
        return { name, id };
    }
    function playerLines(pl) {
        const out = [];
        if (pl.name) out.push(pl.name);
        if (pl.id) { out.push('Steam ID: ' + pl.id); out.push(tr('Click to open the Steam profile')); }
        return out.length ? '\n' + out.join('\n') : '';
    }
    function openSteamProfile(id) { if (id) window.open('https://steamcommunity.com/profiles/' + id, '_blank', 'noopener,noreferrer'); }

    function normalizeSteamIDForComparison(steamID) {
        if (!steamID) return null;
        return convertSteamIDTo64(steamID);
    }

    function steamIDsMatch(steamID1, steamID2) {
        if (!steamID1 || !steamID2) return false;
        const normalized1 = normalizeSteamIDForComparison(steamID1);
        const normalized2 = normalizeSteamIDForComparison(steamID2);
        return normalized1 && normalized2 && normalized1 === normalized2;
    }

    function getSlotColor(slot) {
        if (slot === null || slot === undefined || slot < 0 || slot >= 10) {
            return 'var(--text-primary)';
        }
        const slotColors = [
            '#3375FF', // Slot 0 - Blue
            '#66FFBF', // Slot 1 - Aquamarine
            '#BF00BF', // Slot 2 - Purple
            '#F3F00B', // Slot 3 - Yellow
            '#FF6B00', // Slot 4 - Orange
            '#FE86C2', // Slot 5 - Pink
            '#A1B447', // Slot 6 - Olive
            '#65D9F7', // Slot 7 - Sky Blue
            '#008321', // Slot 8 - Green
            '#A46900'  // Slot 9 - Brown
        ];
        return slotColors[slot];
    }

    function getHeroIconUrl(heroName) {
    if (!heroName) return null;
    
    const normalizeHeroName = (name) => {
        return name
            .replace(/([a-z])([A-Z])/g, '$1_$2')
            .toLowerCase()
            .replace(/\s+/g, '_');
    };
    
    const heroNameVariations = {
        'zuus': 'zeus',                 // the engine's internal name; the portrait is zeus.png
        'anti_mage': 'antimage',
        'vengeful_spirit': 'vengefulspirit',
        'queen_of_pain': 'queenofpain'
    };
    
    let heroNameNormalized = normalizeHeroName(heroName);
    if (heroNameVariations[heroNameNormalized]) {
        heroNameNormalized = heroNameVariations[heroNameNormalized];
    }
    
    const hero = DOTA_HEROES.find(h => 
        h.id === heroNameNormalized || 
        normalizeHeroName(h.name) === heroNameNormalized ||
        normalizeHeroName(h.localized_name) === heroNameNormalized
    );
    if (!hero) {
        console.warn(`Hero not found: ${heroName} (normalized: ${heroNameNormalized})`);
        return null;
    }
    const heroId = hero.id;
    return `/api/hero-icon/${heroId}`;
}

document.addEventListener('DOMContentLoaded', () => {
    let currentPath = '';
    let currentReplays = [];
    const playerInfoCache = new Map();
    const heroLookupCache = new Map();
    const playerSelectorCache = new Map();
    
    const replayDirInput = document.getElementById('replay-dir');
    const saveConfigBtn = document.getElementById('save-config');
    const replayList = document.getElementById('replay-list');
    const refreshReplaysBtn = document.getElementById('refresh-replays');
    const sortDateBtn = document.getElementById('sort-date');
    const selectAllBtn = document.getElementById('select-all');
    const deselectAllBtn = document.getElementById('deselect-all');
    const selectLastBtn = document.getElementById('select-last');
    const selectLastCountInput = document.getElementById('select-last-count');
    const deleteSelectedBtn = document.getElementById('delete-selected');
    const startParseBtn = document.getElementById('start-parse');
    const steamIdInput = document.getElementById('steam-id');
    const playerSelect = document.getElementById('player-select');
    const playerSelectSpinner = document.getElementById('player-select-spinner');
    const steamIdGroup = document.getElementById('steam-id-group');
    const playerSelectionGroup = document.getElementById('player-selection-group');
    const progressSection = document.getElementById('progress-section');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const resultsSection = document.getElementById('results-section');
    const graphsSection = document.getElementById('graphs-section');
    const matchSelectorContainer = document.getElementById('match-selector-container');
    const matchSelector = document.getElementById('match-selector');
    const playerSelectorContainer = document.getElementById('player-selector-container');
    const playerSelectorDisplay = document.getElementById('player-selector-display');
    const playerSelectorDropdown = document.getElementById('player-selector-dropdown');
    const playerSelectorLabel = playerSelectorContainer ? playerSelectorContainer.querySelector('label') : null;
    const timelineGraphContainer = document.getElementById('timeline-graph-container');
    const graphLoadingOverlay = document.getElementById('graph-loading-overlay');
    const graphViewTabs = document.querySelectorAll('.graph-view-tab');
    
    let currentGraphView = 'playerReports';
    
    function updateGraphViewTabs() {
        graphViewTabs.forEach(tab => {
            const view = tab.dataset.view;
            if (view === currentGraphView) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }
    
    function showGraphLoading() {
        dbg('[GRAPH DEBUG] showGraphLoading() called');
        let overlay = document.getElementById('graph-loading-overlay');
        if (!overlay) {
            dbg('[GRAPH DEBUG] Creating new overlay element');
            overlay = document.createElement('div');
            overlay.id = 'graph-loading-overlay';
            overlay.className = 'graph-loading-overlay';
            const spinner = document.createElement('div');
            spinner.className = 'graph-loading-spinner';
            const text = document.createElement('div');
            text.className = 'graph-loading-text';
            text.textContent = 'Loading graph...';
            overlay.appendChild(spinner);
            overlay.appendChild(text);
            timelineGraphContainer.appendChild(overlay);
        }
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
        overlay.style.opacity = '1';
        overlay.style.visibility = 'visible';
        overlay.style.pointerEvents = 'auto';
        dbg('[GRAPH DEBUG] Overlay shown, display:', overlay.style.display, 'opacity:', overlay.style.opacity);
    }
    
    function hideGraphLoading() {
        dbg('[GRAPH DEBUG] hideGraphLoading() called');
        const overlay = document.getElementById('graph-loading-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
            overlay.style.visibility = 'hidden';
            overlay.style.pointerEvents = 'none';
            dbg('[GRAPH DEBUG] Overlay hidden');
        } else {
            dbg('[GRAPH DEBUG] WARNING: Overlay not found when trying to hide');
        }
        if (graphLoadingOverlay) {
            graphLoadingOverlay.classList.add('hidden');
            graphLoadingOverlay.style.display = 'none';
            graphLoadingOverlay.style.visibility = 'hidden';
            graphLoadingOverlay.style.pointerEvents = 'none';
        }
    }
    
    function updatePlayerSelectorLabel() {
        if (!playerSelectorLabel) return;
        if (currentGraphView === 'reports') {
            playerSelectorLabel.textContent = 'Player who received reports';
        } else if (currentGraphView === 'playerReports') {
            playerSelectorLabel.textContent = 'Player who made reports';
        } else if (currentGraphView === 'scoreboard') {
            playerSelectorLabel.textContent = 'Player (scoreboard activity)';
        }
    }
    const timelineGraphCanvas = document.getElementById('timeline-graph');
    let playerSelectorOptions = [];
    const historySteamIdInput = document.getElementById('history-steam-id');
    const historyLimitInput = document.getElementById('history-limit');
    const fetchHistoryBtn = document.getElementById('fetch-history');
    const historyResults = document.getElementById('history-results');

    function updatePlayerSelection() {
        const selectedCheckboxes = document.querySelectorAll('.replay-item input[type="checkbox"]:checked');
        const selectedCount = selectedCheckboxes.length;
        
        if (selectedCount > 1) {
            steamIdGroup.classList.remove('hidden');
            playerSelectionGroup.classList.add('hidden');
            playerSelect.innerHTML = '<option value="-1">Select a player...</option>';
        } else {
            steamIdGroup.classList.add('hidden');
            playerSelectionGroup.classList.add('hidden');
        }
    }
    
    async function loadPlayerInfo(matchId) {
        playerSelect.innerHTML = '<option value="-1">Loading players...</option>';
        playerSelect.disabled = true;
        playerSelectSpinner.classList.remove('hidden');
        
        const clearLoading = () => {
            playerSelectSpinner.classList.add('hidden');
        };
        
        try {
            const res = await fetch('/api/player-info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matchId: matchId,
                    profileName: getSelectedProfileName()
                })
            });
            
            if (!res.ok) {
                throw new Error(await res.text());
            }
            
            const players = await res.json();
            playerSelect.innerHTML = '<option value="-1">Select a player...</option>';
            
            players.forEach(player => {
                const option = document.createElement('option');
                option.value = player.Slot;
                const teamName = player.Team === 2 ? 'Radiant' : player.Team === 3 ? 'Dire' : 'Unknown';
                const playerName = player.Name || '(Empty)';
                const heroName = player.Hero || '';
                let displayText = `Slot ${player.Slot} [${teamName}] - ${playerName}`;
                if (heroName) {
                    displayText += ` (${heroName})`;
                }
                option.textContent = displayText;
                option.className = player.Team === 2 ? 'radiant-option' : player.Team === 3 ? 'dire-option' : '';
                playerSelect.appendChild(option);
            });
            
            playerSelect.disabled = false;
            clearLoading();
        } catch (err) {
            playerSelect.innerHTML = '<option value="-1">Error loading players</option>';
            clearLoading();
            console.error('Error loading player info:', err);
        }
    }

    // Profile Elements
    const profileSelect = document.getElementById('profile-select');
    const newProfileName = document.getElementById('new-profile-name');
    const newProfileId = document.getElementById('new-profile-id');
    const addProfileBtn = document.getElementById('add-profile-btn');
    const deleteProfileBtn = document.getElementById('delete-profile-btn');

    let profiles = [];
    let isInitialLoad = true;

    function loadProfiles() {
        const savedProfiles = localStorage.getItem('steamProfiles');
        if (savedProfiles) {
            try {
                profiles = JSON.parse(savedProfiles);
            } catch (e) {
                console.error('Failed to parse profiles', e);
                profiles = [];
            }
        }
        renderProfileSelect(true);
        isInitialLoad = false;
    }

    function saveProfiles() {
        localStorage.setItem('steamProfiles', JSON.stringify(profiles));
        renderProfileSelect(false);
    }

    function renderProfileSelect(shouldLoadReplays) {
        const savedIndex = localStorage.getItem('selectedProfileIndex');
        const currentVal = savedIndex !== null && profiles[savedIndex] ? savedIndex : profileSelect.value;
        
        profileSelect.innerHTML = '<option value="">Select a profile...</option>';
        profiles.forEach((p, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `${p.name} (${p.id})`;
            profileSelect.appendChild(option);
        });

        if (currentVal && profiles[currentVal]) {
            profileSelect.value = currentVal;
            localStorage.setItem('selectedProfileIndex', currentVal);
            deleteProfileBtn.style.visibility = 'visible';
            if (shouldLoadReplays) {
                const profileName = profiles[currentVal].name;
                browseDirectory('', profileName);
            }
        } else {
            profileSelect.value = "";
            localStorage.removeItem('selectedProfileIndex');
            deleteProfileBtn.style.visibility = 'hidden';
        }
    }

    addProfileBtn.addEventListener('click', () => {
        const name = newProfileName.value.trim();
        const id = newProfileId.value.trim();

        if (!name || !id) {
            alert('Please enter both a name and a Steam ID');
            return;
        }

        profiles.push({ name, id });
        saveProfiles();
        
        // Clear inputs
        newProfileName.value = '';
        newProfileId.value = '';
        
        // Select the new profile automatically
        profileSelect.value = profiles.length - 1;
        profileSelect.dispatchEvent(new Event('change'));
    });

    deleteProfileBtn.addEventListener('click', async () => {
        const index = profileSelect.value;
        if (index === "" || !profiles[index]) return;

        const ok = await LedgerUI.confirm({ title: `Delete profile "${profiles[index].name}"?`, text: 'Replays on disk stay where they are.', ok: 'Delete profile' });
        if (!ok) return;
        profiles.splice(index, 1);
        // the saved index would now point at the next profile in the list
        localStorage.removeItem('selectedProfileIndex');
        profileSelect.value = "";
        saveProfiles();
        deleteProfileBtn.style.visibility = 'hidden';
        updatePathDisplay('', '');
        browseDirectory('', '');
    });

    profileSelect.addEventListener('change', () => {
        dbg('Profile select changed, value:', profileSelect.value);
        const index = profileSelect.value;
        let profileName = "";
        if (index !== "" && profiles[index]) {
            const p = profiles[index];
            profileName = p.name;
            localStorage.setItem('selectedProfileIndex', index);
            dbg('Selected profile:', profileName);
            if (historySteamIdInput) {
                historySteamIdInput.value = p.id;
                historySteamIdInput.dispatchEvent(new Event('input')); 
            }
            if (steamIdInput) {
                steamIdInput.value = p.id;
                steamIdInput.dispatchEvent(new Event('input'));
                if (typeof syncSteamIdSlotId === 'function') {
                    syncSteamIdSlotId();
                }
            }
            const fatalSteamIdInput = document.getElementById('fatal-steam-id');
            if (fatalSteamIdInput) {
                fatalSteamIdInput.value = p.id;
            }
            deleteProfileBtn.style.visibility = 'visible';
        } else {
            dbg('No profile selected');
            localStorage.removeItem('selectedProfileIndex');
            deleteProfileBtn.style.visibility = 'hidden';
            const fatalSteamIdInput = document.getElementById('fatal-steam-id');
            if (fatalSteamIdInput) {
                fatalSteamIdInput.value = '';
            }
        }
        dbg('Calling browseDirectory with profileName:', profileName);
        updatePathDisplay('', profileName);
        browseDirectory('', profileName);
    });
    
    let replayDirChangeTimeout;
    replayDirInput.addEventListener('input', () => {
        updatePathDisplay(currentPath, getSelectedProfileName());
    });
    
    replayDirInput.addEventListener('change', () => {
        clearTimeout(replayDirChangeTimeout);
        replayDirChangeTimeout = setTimeout(() => {
            saveToStorage();
            const newDir = replayDirInput.value.trim();
            if (newDir) {
                fetchWithRetry('/api/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ replayDir: newDir })
                }, 2, 1000)
                    .then(() => {
                        const profileName = getSelectedProfileName();
                        updatePathDisplay(currentPath, profileName);
                        browseDirectory(currentPath, profileName);
                    })
                    .catch(err => console.error('Error saving replay directory:', err));
            } else {
                const profileName = getSelectedProfileName();
                updatePathDisplay(currentPath, profileName);
                browseDirectory(currentPath, profileName);
            }
        }, 500);
    });
    
    replayDirInput.addEventListener('blur', () => {
        clearTimeout(replayDirChangeTimeout);
        saveToStorage();
        const newDir = replayDirInput.value.trim();
        if (newDir) {
            fetchWithRetry('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ replayDir: newDir })
            }, 2, 1000)
                .then(() => {
                    const profileName = getSelectedProfileName();
                    updatePathDisplay(currentPath, profileName);
                    browseDirectory(currentPath, profileName);
                })
                .catch(err => console.error('Error saving replay directory:', err));
        } else {
            const profileName = getSelectedProfileName();
            updatePathDisplay(currentPath, profileName);
            browseDirectory(currentPath, profileName);
        }
    });

    function getSelectedProfileName() {
        const index = profileSelect.value;
        if (index !== "" && profiles[index]) {
            return profiles[index].name;
        }
        return "";
    }

    function getSelectedProfile() {
        const index = profileSelect.value;
        if (index !== "" && profiles[index]) {
            return profiles[index];
        }
        return null;
    }

    // Initialize Profiles
    loadProfiles();
    
    // Steam Login Elements
    const steamUserInput = document.getElementById('steam-user');
    const steamPassInput = document.getElementById('steam-pass');
    const steamCodeInput = document.getElementById('steam-code');
    const steamGuardGroup = document.getElementById('steam-guard-group');
    const steamLoginBtn = document.getElementById('steam-login-btn');
    const steamDisconnectBtn = document.getElementById('steam-disconnect-btn');
    const steamStatusText = document.getElementById('steam-status');
    const steamStatusBadge = document.getElementById('steam-status-badge');
    const setupToggle = document.getElementById('setup-toggle');
    const setupPanel = document.getElementById('setup-panel');
    const workflowTabs = document.querySelectorAll('.workflow-tab');

    // Steam Logic
    let steamPollingInterval;
    let connectingTimeoutId = null;
    let submittingTimeoutId = null;

    let lastSteamStatus = null;
    let lastSteamStatusText = null;
    
    function updateSteamUI(status, text, errorMessage) {
        const statusText = `Status: ${text}`;
        if (steamStatusText) {
            if (steamStatusText.textContent !== statusText) {
                steamStatusText.textContent = statusText;
            }
        }
        
        if (steamStatusBadge) {
            const statusLabel = steamStatusBadge.querySelector('.status-text');
            if (statusLabel && statusLabel.textContent !== 'Steam') statusLabel.textContent = 'Steam';
            steamStatusBadge.title = `Steam: ${text}`;
            if (status === 3 || status === 4) {
                steamStatusBadge.classList.remove('disconnected');
                steamStatusBadge.classList.add('connected');
            } else {
                steamStatusBadge.classList.remove('connected');
                steamStatusBadge.classList.add('disconnected');
            }
        }
        
        // Display error message if present
        let errorDisplay = document.getElementById('steam-error-message');
        if (errorMessage && errorMessage.trim() !== '') {
            if (!errorDisplay) {
                errorDisplay = document.createElement('p');
                errorDisplay.id = 'steam-error-message';
                errorDisplay.className = 'inline-error';
                const anchor = steamStatusText || steamLoginBtn;
                if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(errorDisplay, anchor.nextSibling);
            }
            errorDisplay.textContent = errorMessage;
            errorDisplay.style.display = 'block';
        } else if (errorDisplay) {
            errorDisplay.style.display = 'none';
        }
        
        if (connectingTimeoutId) {
            clearTimeout(connectingTimeoutId);
            connectingTimeoutId = null;
        }
        if (submittingTimeoutId) {
            clearTimeout(submittingTimeoutId);
            submittingTimeoutId = null;
        }
        
        if (status === 1) {
            if (lastSteamStatus !== 1) {
                if (steamStatusText) steamStatusText.style.color = 'var(--aegis)';
                if (steamGuardGroup) steamGuardGroup.classList.add('hidden');
                steamLoginBtn.textContent = 'Connecting...';
                steamLoginBtn.disabled = true;
                steamDisconnectBtn.style.display = 'none';
                lastSteamStatus = 1;
            }
            if (steamPollingInterval) clearInterval(steamPollingInterval);
            steamPollingInterval = setInterval(pollSteamStatus, 2000);
            
            connectingTimeoutId = setTimeout(() => {
                if (steamLoginBtn.disabled && srcText(steamLoginBtn) === 'Connecting...') {
                    console.warn('Connection timeout - re-enabling button as fallback');
                    steamLoginBtn.disabled = false;
                    steamLoginBtn.textContent = 'Connect to Steam';
                    if (steamStatusText) {
                        steamStatusText.textContent = 'Status: Disconnected (timeout)';
                        steamStatusText.style.color = '';
                    }
                }
            }, 20000);
        } else if (status === 2) {
            if (lastSteamStatus !== 2) {
                if (steamStatusText) steamStatusText.style.color = 'var(--aegis)';
                if (setupPanel) {
                    setupPanel.classList.remove('hidden');
                }
                if (steamGuardGroup) {
                    steamGuardGroup.classList.remove('hidden');
                    dbg('Steam Guard field should now be visible');
                } else {
                    console.error('steamGuardGroup element not found!');
                }
                if (srcText(steamLoginBtn) === 'Submitting Code...') {
                    submittingTimeoutId = setTimeout(() => {
                        if (steamLoginBtn.disabled && srcText(steamLoginBtn) === 'Submitting Code...') {
                            console.warn('Submit code timeout - re-enabling button as fallback');
                            steamLoginBtn.disabled = false;
                            steamLoginBtn.textContent = 'Submit Code';
                        }
                    }, 15000);
                } else {
                    steamLoginBtn.textContent = 'Submit Code';
                    steamLoginBtn.disabled = false;
                }
                steamDisconnectBtn.style.display = 'none';
                lastSteamStatus = 2;
            }
            if (steamPollingInterval) clearInterval(steamPollingInterval);
            steamPollingInterval = setInterval(pollSteamStatus, 2000);
        } else if (status === 3 || status === 4) {
             if (lastSteamStatus !== status) {
                 if (steamStatusText) steamStatusText.style.color = 'var(--radiant)';
                 steamLoginBtn.textContent = status === 4 ? 'Connected' : 'Connecting...';
                 steamLoginBtn.disabled = true;
                 if (steamGuardGroup) steamGuardGroup.classList.add('hidden');
                 steamDisconnectBtn.style.display = 'inline-block';
                 lastSteamStatus = status;
                 if (status === 4) {
                     fetchConductScorecard();
                 }
             }
             if (steamPollingInterval) clearInterval(steamPollingInterval);
             steamPollingInterval = setInterval(pollSteamStatus, 10000);
        } else if (status === 5) { // Rate Limited
             if (lastSteamStatus !== 5) {
                 if (steamStatusText) {
                     steamStatusText.style.color = 'var(--dire)';
                     steamStatusText.textContent = 'Status: Rate Limited (Wait 24h)';
                 }
                 steamLoginBtn.textContent = 'Rate Limited';
                 steamLoginBtn.disabled = true;
                 if (steamGuardGroup) steamGuardGroup.classList.add('hidden');
                 steamDisconnectBtn.style.display = 'inline-block';
                 lastSteamStatus = 5;
             }
             if (steamPollingInterval) clearInterval(steamPollingInterval);
             steamPollingInterval = setInterval(pollSteamStatus, 60000);
        } else {
            if (lastSteamStatus !== status) {
                if (steamStatusText) steamStatusText.style.color = '';
                if (steamGuardGroup) steamGuardGroup.classList.add('hidden');
                if (steamCodeInput) steamCodeInput.value = '';
                steamLoginBtn.textContent = 'Connect to Steam';
                steamLoginBtn.disabled = false;
                steamDisconnectBtn.style.display = 'none';
                const conductSection = document.getElementById('conduct-scorecard-section');
                if (conductSection) conductSection.classList.add('hidden');
                lastSteamStatus = status;
            }
            if (steamPollingInterval) clearInterval(steamPollingInterval);
            steamPollingInterval = setInterval(pollSteamStatus, 2000);
        }
    }

    let lastConductScorecardData = null;
    let isFetchingConductScorecard = false;
    
    function fetchConductScorecard() {
        const scorecardSection = document.getElementById('conduct-scorecard-section');
        const scorecardContent = document.getElementById('conduct-scorecard-content');
        
        if (!scorecardSection || !scorecardContent) return;
        if (isFetchingConductScorecard) return;
        
        isFetchingConductScorecard = true;
        const wasHidden = scorecardSection.classList.contains('hidden');
        if (wasHidden) {
            scorecardSection.classList.remove('hidden');
        }
        if (!scorecardContent.querySelector('.conduct-scorecard-grid')) {
            scorecardContent.innerHTML = '<div class="loading">Loading conduct scorecard...</div>';
        }
        
        fetchWithRetry('/api/steam/conduct-scorecard', {}, 2, 500)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
                }
                return res.json();
            })
            .then(data => {
                const dataKey = JSON.stringify(data);
                if (dataKey !== lastConductScorecardData) {
                    displayConductScorecard(data);
                    lastConductScorecardData = dataKey;
                }
                isFetchingConductScorecard = false;
            })
            .catch(err => {
                console.error('Error fetching conduct scorecard:', err);
                if (!scorecardContent.querySelector('.conduct-scorecard-grid')) {
                    scorecardContent.innerHTML = `<div class="inline-error">Error loading conduct scorecard: ${esc(err.message)}</div>`;
                }
                isFetchingConductScorecard = false;
            });
    }

    function displayConductScorecard(data) {
        const scorecardContent = document.getElementById('conduct-scorecard-content');
        if (!scorecardContent) return;
        
        const formatDate = (timestamp) => {
            if (!timestamp || timestamp === 0) return 'N/A';
            const date = new Date(timestamp * 1000);
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };
        
        const rawBehaviorScore = data.raw_behavior_score || 0;
        const oldRawBehaviorScore = data.old_raw_behavior_score || 0;
        const behaviorScoreChange = rawBehaviorScore - oldRawBehaviorScore;
        const behaviorScoreChangeClass = behaviorScoreChange >= 0 ? 'positive' : 'negative';
        const behaviorScoreChangeSymbol = behaviorScoreChange >= 0 ? '↑' : '↓';
        
        let html = '<div class="conduct-scorecard-grid">';
        
        html += `
            <div class="conduct-stat-card">
                <div class="conduct-stat-label">Raw Behavior Score</div>
                <div class="conduct-stat-value">${esc(Number(rawBehaviorScore).toLocaleString())}</div>
                ${oldRawBehaviorScore > 0 ? `
                    <div class="conduct-stat-change ${behaviorScoreChangeClass}">
                        ${behaviorScoreChangeSymbol} ${Math.abs(behaviorScoreChange).toLocaleString()} 
                        (was ${oldRawBehaviorScore.toLocaleString()})
                    </div>
                ` : ''}
            </div>
        `;
        
        html += `
            <div class="conduct-stat-card">
                <div class="conduct-stat-label">Commend Count</div>
                <div class="conduct-stat-value">${esc(data.commend_count || 0)}</div>
            </div>
        `;
        
        html += `
            <div class="conduct-stat-card">
                <div class="conduct-stat-label">Matches in Report</div>
                <div class="conduct-stat-value">${esc(data.matches_in_report || 0)}</div>
                <div class="conduct-date-display">15-game period</div>
            </div>
        `;
        
        html += `
            <div class="conduct-stat-card">
                <div class="conduct-stat-label">Matches Clean</div>
                <div class="conduct-stat-value">${esc(data.matches_clean || 0)}</div>
            </div>
        `;
        
        html += `
            <div class="conduct-stat-card">
                <div class="conduct-stat-label">Matches Reported</div>
                <div class="conduct-stat-value" style="color: ${(data.matches_reported || 0) > 0 ? 'var(--warning-color)' : 'var(--text-primary)'}">${esc(data.matches_reported || 0)}</div>
            </div>
        `;
        
        html += `
            <div class="conduct-stat-card">
                <div class="conduct-stat-label">Matches Abandoned</div>
                <div class="conduct-stat-value" style="color: ${(data.matches_abandoned || 0) > 0 ? 'var(--danger-color)' : 'var(--text-primary)'}">${esc(data.matches_abandoned || 0)}</div>
            </div>
        `;
        
        html += `
            <div class="conduct-stat-card">
                <div class="conduct-stat-label">Match Date of Last Chunk</div>
                <div class="conduct-stat-value" style="font-size: 1rem;">${formatDate(data.date)}</div>
            </div>
        `;
        
        html += `
            <div class="conduct-stat-card">
                <div class="conduct-stat-label">Match ID</div>
                <div class="conduct-match-id">${esc(data.match_id || 'N/A')}</div>
            </div>
        `;
        
        html += '</div>';
        
        const reasons = data.reasons || 0;
        const reasonNames = [];
        if (reasons & 1) reasonNames.push('Cheating');
        if (reasons & 2) reasonNames.push('Feeding');
        if (reasons & 4) reasonNames.push('Griefing');
        if (reasons & 8) reasonNames.push('Suspicious');
        if (reasons & 16) reasonNames.push('AbilityAbuse');
        if (reasons === 0) reasonNames.push('Unknown');
        
        const reasonsText = reasonNames.length > 0 ? ` (${reasonNames.join(', ')})` : '';
        
        html += `
            <div class="conduct-reasons-card">
                <h3>Reasons</h3>
                <div class="conduct-reasons-value">${reasons}${reasonsText}</div>
                <div class="conduct-reasons-note">Report reasons from the conduct scorecard.</div>
            </div>
        `;
        
        if (data.match_id && data.account_id) {
            html += `
                <div style="margin-top: var(--spacing-md); display: flex; justify-content: center; gap: var(--spacing-md); flex-wrap: wrap;">
                    <button id="validate-report-card-btn" class="btn primary-btn" 
                            data-match-id="${esc(data.match_id)}" 
                            data-account-id="${esc(data.account_id)}">
                        Validate Report Card
                    </button>
                    <button id="validate-report-card-current-btn" class="btn secondary-btn" 
                            data-match-id="${esc(data.match_id)}" 
                            data-account-id="${esc(data.account_id)}">
                        Current
                    </button>
                </div>
                <div id="validate-report-card-status" style="margin-top: var(--spacing-sm); text-align: center; color: var(--text-secondary); font-size: 0.9rem;"></div>
            `;
        }
        
        html += `
            <div class="conduct-theories-card">
                <h3>Why counts might not match analysis:</h3>
                <ul class="conduct-theories-list">
                    <li>Most reports may be ignored if players abuse the reporting system</li>
                    <li>There may be a hidden limit to reports that we don't realize</li>
                    <li>Report counts may refresh on a certain day of the week</li>
                    <li>The overwatch report checkbox - when reporting someone, there's a checkbox if you have an 'overwatch report' available</li>
                </ul>
            </div>
        `;
        
        scorecardContent.innerHTML = html;
        
        const validateBtn = document.getElementById('validate-report-card-btn');
        if (validateBtn && !validateBtn.hasAttribute('data-listener-attached')) {
            validateBtn.setAttribute('data-listener-attached', 'true');
            validateBtn.addEventListener('click', () => {
                const matchId = validateBtn.getAttribute('data-match-id');
                const accountIdStr = validateBtn.getAttribute('data-account-id');
                const accountId = accountIdStr ? BigInt(accountIdStr) : null;
                validateReportCard(parseInt(matchId), accountId, false);
            });
        }
        
        const validateCurrentBtn = document.getElementById('validate-report-card-current-btn');
        if (validateCurrentBtn && !validateCurrentBtn.hasAttribute('data-listener-attached')) {
            validateCurrentBtn.setAttribute('data-listener-attached', 'true');
            validateCurrentBtn.addEventListener('click', () => {
                const matchId = validateCurrentBtn.getAttribute('data-match-id');
                const accountIdStr = validateCurrentBtn.getAttribute('data-account-id');
                const accountId = accountIdStr ? BigInt(accountIdStr) : null;
                validateReportCard(parseInt(matchId), accountId, true);
            });
        }
    }

    let validateReportCardInProgress = false;

    let validateReportCardEventSource = null;
    let validateReportCardAccountID = null;

    function validateReportCard(matchId, accountId, isCurrent) {
        validateReportCardAccountID = accountId ? (typeof accountId === 'bigint' ? accountId : BigInt(String(accountId))) : null;
        const statusDiv = document.getElementById('validate-report-card-status');
        const btn = isCurrent ? document.getElementById('validate-report-card-current-btn') : document.getElementById('validate-report-card-btn');
        const otherBtn = isCurrent ? document.getElementById('validate-report-card-btn') : document.getElementById('validate-report-card-current-btn');
        
        if (!statusDiv || !btn) return;
        
        if (validateReportCardInProgress) {
            statusDiv.textContent = 'Another validation is already in progress. Please wait...';
            statusDiv.style.color = 'var(--warning-color)';
            return;
        }
        
        if (validateReportCardEventSource) {
            validateReportCardEventSource.close();
            validateReportCardEventSource = null;
        }
        
        validateReportCardInProgress = true;
        btn.disabled = true;
        if (otherBtn) otherBtn.disabled = true;
        btn.textContent = isCurrent ? 'Fetching Current...' : 'Validating...';
        statusDiv.innerHTML = '<div>Initializing...</div>';
        statusDiv.style.color = 'var(--text-secondary)';
        
        const endpoint = isCurrent ? '/api/steam/validate-report-card-current' : '/api/steam/validate-report-card';
        const statusEndpoint = `/api/steam/validate-report-card-status?matchId=${matchId}`;
        
        validateReportCardEventSource = new EventSource(statusEndpoint);
        
        validateReportCardEventSource.onmessage = function(event) {
            try {
                const status = JSON.parse(event.data);
                
                if (status.phase === 'not_found') {
                    return;
                }
                
                let html = `<div><strong>${esc(status.message || 'Processing...')}</strong></div>`;
                
                if (status.phase === 'downloading') {
                    html += `<div style="margin-top: 8px; font-size: 0.9em;">`;
                    html += `Total: ${status.total || 0} | `;
                    html += `Downloaded: ${status.downloaded || 0} | `;
                    html += `Skipped: ${status.skipped || 0}`;
                    if (status.currentMatch) {
                        html += `<br>Current: ${esc(status.currentMatch)}`;
                    }
                    html += `</div>`;
                } else if (status.phase === 'parsing') {
                    html += `<div style="margin-top: 8px; font-size: 0.9em;">`;
                    html += `Parsed: ${status.parsed || 0} / ${status.total || 0} | `;
                    html += `Errors: ${status.parseErrors || 0}`;
                    if (status.currentMatch) {
                        html += `<br>Current: ${esc(status.currentMatch)}`;
                    }
                    html += `</div>`;
                } else if (status.phase === 'complete' && status.results) {
                    html += `<div style="margin-top: 12px; padding: 8px; background: var(--bg-secondary); border-radius: 4px;">`;
                    html += `<div><strong>Validation Results:</strong></div>`;
                    html += `<div style="margin-top: 8px;">`;
                    html += `Total Matches: ${status.results.totalMatches}<br>`;
                    html += `Total Reports: ${status.results.totalReports}<br>`;
                    html += `Team Reports: ${status.results.teamReports}<br>`;
                    html += `Enemy Reports: ${status.results.enemyReports}`;
                    html += `</div>`;
                    html += `</div>`;
                    statusDiv.style.color = 'var(--success-color)';
                    validateReportCardInProgress = false;
                    btn.disabled = false;
                    btn.textContent = isCurrent ? 'Current' : 'Validate Report Card';
                    if (otherBtn) otherBtn.disabled = false;
                    if (validateReportCardEventSource) {
                        validateReportCardEventSource.close();
                        validateReportCardEventSource = null;
                    }
                }
                
                if (status.errors && status.errors.length > 0) {
                    html += `<div style="margin-top: 8px; color: var(--warning-color); font-size: 0.85em;">`;
                    html += `Errors: ${esc(status.errors.join(', '))}`;
                    html += `</div>`;
                }
                
                statusDiv.innerHTML = html;
            } catch (e) {
                console.error('Error parsing status:', e);
            }
        };
        
        validateReportCardEventSource.onerror = function(event) {
            console.error('EventSource error:', event);
            if (validateReportCardEventSource) {
                validateReportCardEventSource.close();
                validateReportCardEventSource = null;
            }
        };
        
        const accountIDForRequest = accountId ? (typeof accountId === 'bigint' ? Number(accountId) : (typeof accountId === 'string' ? Number(accountId) : accountId)) : null;
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                matchId: matchId,
                accountId: accountIDForRequest
            })
        })
            .then(res => {
                if (!res.ok) {
                    return res.text().then(text => {
                        throw new Error(text || `HTTP ${res.status}`);
                    });
                }
                return res.json();
            })
            .then(data => {
                if (data.results && data.results.matchResults) {
                    let html = `<div><strong>${esc(data.results.totalReports)} total reports found</strong></div>`;
                    html += `<div style="margin-top: 8px; font-size: 0.9em;">`;
                    html += `Downloaded: ${data.downloaded?.length || 0} | `;
                    html += `Skipped: ${data.skipped?.length || 0} | `;
                    html += `Parsed: ${data.parsed || 0}`;
                    html += `</div>`;
                    if (data.directory) {
                        html += `<div style="margin-top: 4px; font-size: 0.85em; color: var(--text-secondary);">Saved to: ${esc(data.directory)}</div>`;
                    }
                    statusDiv.innerHTML = html;
                    statusDiv.style.color = 'var(--success-color)';
                    
                    setTimeout(() => {
                        processValidateReportCardResults(data.results, data.directory || '');
                    }, 500);
                }
            })
            .catch(err => {
                console.error('Error validating report card:', err);
                if (validateReportCardEventSource) {
                    validateReportCardEventSource.close();
                    validateReportCardEventSource = null;
                }
                if (err.name === 'AbortError' || err.message.includes('aborted')) {
                    statusDiv.textContent = 'Request was cancelled. The download may still be in progress on the server.';
                    statusDiv.style.color = 'var(--warning-color)';
                } else {
                    statusDiv.textContent = `Error: ${err.message}`;
                    statusDiv.style.color = 'var(--danger-color)';
                }
                validateReportCardInProgress = false;
                btn.disabled = false;
                btn.textContent = isCurrent ? 'Current' : 'Validate Report Card';
                if (otherBtn) otherBtn.disabled = false;
            });
    }

    function processValidateReportCardResults(results, directory) {
        if (!results || !results.matchResults) return;
        
        if (validateReportCardAccountID) {
            const accountIDStr = typeof validateReportCardAccountID === 'bigint' ? validateReportCardAccountID.toString() : String(validateReportCardAccountID);
            const accountIDNum = BigInt(accountIDStr);
            const STEAMID64_IDENTIFIER = BigInt('76561197960265728');
            const expectedSteamID64 = (accountIDNum + STEAMID64_IDENTIFIER).toString();
            const convertedSteamID = convertSteamIDTo64(accountIDStr);
            analysisSteamID = convertedSteamID;
            dbg('[ValidateReportCard] Set analysisSteamID to:', analysisSteamID, 'from accountID:', accountIDStr);
        }
        
        const matchData = [];
        const confirmedPlayerReportCounts = new Map();
        const unconfirmedPlayerReportCounts = new Map();
        const confirmedTimelineData = [];
        const unconfirmedTimelineData = [];
        let totalTeamReports = 0;
        let totalEnemyReports = 0;
        let totalConfirmedTeamReports = 0;
        let totalConfirmedEnemyReports = 0;
        
        results.matchResults.forEach(matchResult => {
            if (matchResult.error || !matchResult.fullResult) return;
            
            const result = matchResult.fullResult;
            const filePath = directory ? `${directory}/${matchResult.matchId}.dem` : `${matchResult.matchId}.dem`;
            
            const countedSlots = new Set();
            let uniqueTeamReports = 0;
            let uniqueEnemyReports = 0;
            
            if (result.Reports) {
                result.Reports.forEach(report => {
                    if (!countedSlots.has(report.Slot)) {
                        countedSlots.add(report.Slot);
                        if (report.Team === "FRIENDLY") {
                            uniqueTeamReports++;
                        } else {
                            uniqueEnemyReports++;
                        }
                    }
                });
            }
            
            totalTeamReports += uniqueTeamReports;
            totalEnemyReports += uniqueEnemyReports;
            totalConfirmedTeamReports += uniqueTeamReports;
            totalConfirmedEnemyReports += uniqueEnemyReports;
            
            matchData.push({
                matchID: result.MatchID,
                filePath: filePath,
                teamReports: uniqueTeamReports,
                enemyReports: uniqueEnemyReports,
                confirmedTeamReports: uniqueTeamReports,
                confirmedEnemyReports: uniqueEnemyReports,
                unconfirmedTeamReports: 0,
                unconfirmedEnemyReports: 0,
                reports: result.Reports || [],
                scoreboardActivities: result.scoreboardActivities || [],
                players: result.Players || [],
                events: result.Events || [],
                chat: result.Chat || []
            });
            
            if (result.Reports) {
                result.Reports.forEach(report => {
                    const playerKey = report.Name || `Slot ${report.Slot}`;
                    const timeParts = report.Time.split(':');
                    let totalMinutes = 0;
                    if (timeParts.length === 2) {
                        const minutes = parseInt(timeParts[0]) || 0;
                        const seconds = parseInt(timeParts[1]) || 0;
                        totalMinutes = minutes + seconds / 60;
                    }
                    
                    const timelinePoint = {
                        x: totalMinutes,
                        y: report.Team === 'FRIENDLY' ? 1 : 2,
                        matchID: result.MatchID
                    };
                    
                    if (report.Confirmed) {
                        confirmedPlayerReportCounts.set(playerKey, (confirmedPlayerReportCounts.get(playerKey) || 0) + 1);
                        confirmedTimelineData.push(timelinePoint);
                    } else {
                        unconfirmedPlayerReportCounts.set(playerKey, (unconfirmedPlayerReportCounts.get(playerKey) || 0) + 1);
                        unconfirmedTimelineData.push(timelinePoint);
                    }
                });
            }
        });
        
        if (matchData.length > 0) {
            allMatchDataOriginal = JSON.parse(JSON.stringify(matchData));
            allMatchData = matchData;
            populateMatchSelector(matchData);
            if (matchData.length > 1) {
                matchSelectorContainer.classList.remove('hidden');
            } else {
                matchSelectorContainer.classList.add('hidden');
            }
            
            populatePlayerSelector(matchData[0]).then(() => {
                if (analysisSteamID) {
                    const steamIDToMatch = String(analysisSteamID);
                    dbg('[ValidateReportCard] Looking for player with SteamID:', steamIDToMatch);
                    dbg('[ValidateReportCard] Available players:', playerSelectorOptions.map(opt => ({ 
                        key: opt.key, 
                        steamID: String(opt.steamID || 'null'), 
                        name: opt.name, 
                        slot: opt.slot 
                    })));
                    
                    const matchingPlayer = playerSelectorOptions.find(opt => {
                        if (!opt.steamID) return false;
                        const match = steamIDsMatch(opt.steamID, steamIDToMatch);
                        if (!match) {
                            dbg(`[ValidateReportCard] SteamID mismatch: opt.steamID="${opt.steamID}" !== target="${steamIDToMatch}" for ${opt.name}`);
                        }
                        return match;
                    });
                    
                    if (matchingPlayer) {
                        dbg('[ValidateReportCard] Found matching player, selecting:', matchingPlayer.key, matchingPlayer.name);
                        currentSelectedPlayer = matchingPlayer.key;
                        selectPlayerOption(matchingPlayer.key);
                    } else {
                        dbg('[ValidateReportCard] No matching player found for SteamID:', steamIDToMatch);
                        dbg('[ValidateReportCard] Player SteamIDs:', playerSelectorOptions.map(opt => ({ 
                            name: opt.name, 
                            steamID: String(opt.steamID || 'null'), 
                            slot: opt.slot 
                        })));
                        
                        const playerFromReports = playerSelectorOptions.find(opt => {
                            if (opt.slot == null) return false;
                            const match = matchData[0];
                            if (!match || !match.players) return false;
                            const player = match.players.find(p => p.Slot === opt.slot);
                            if (!player || !player.SteamID) return false;
                            return steamIDsMatch(player.SteamID, steamIDToMatch);
                        });
                        
                        if (playerFromReports) {
                            dbg('[ValidateReportCard] Found player from reports data, selecting:', playerFromReports.key, playerFromReports.name);
                            currentSelectedPlayer = playerFromReports.key;
                            selectPlayerOption(playerFromReports.key);
                        } else {
                            const targetSlotFromReports = matchData[0]?.players?.find(p => p.SteamID && steamIDsMatch(p.SteamID, steamIDToMatch))?.Slot;
                            if (targetSlotFromReports != null && targetSlotFromReports >= 0 && targetSlotFromReports < 10) {
                                const slotKey = `slot_${targetSlotFromReports}`;
                                const slotPlayer = playerSelectorOptions.find(opt => opt.key === slotKey);
                                if (slotPlayer) {
                                    dbg('[ValidateReportCard] Found player by slot from reports, selecting:', slotPlayer.key, slotPlayer.name);
                                    currentSelectedPlayer = slotPlayer.key;
                                    selectPlayerOption(slotPlayer.key);
                                } else {
                                    dbg('[ValidateReportCard] Could not find player, but will filter by SteamID in reports');
                                    currentSelectedPlayer = null;
                                }
                            } else {
                                dbg('[ValidateReportCard] Could not find player, but will filter by SteamID in reports');
                                currentSelectedPlayer = null;
                            }
                        }
                    }
                } else {
                    dbg('[ValidateReportCard] No analysisSteamID set, showing all players');
                    currentSelectedPlayer = null;
                }
                
                if (totalTeamReports + totalEnemyReports > 0) {
                    const totalUnconfirmedTeamReports = totalTeamReports - totalConfirmedTeamReports;
                    const totalUnconfirmedEnemyReports = totalEnemyReports - totalConfirmedEnemyReports;
                    
                    allConfirmedPlayerReportCounts = confirmedPlayerReportCounts;
                    allUnconfirmedPlayerReportCounts = unconfirmedPlayerReportCounts;
                    allConfirmedTimelineData = confirmedTimelineData;
                    allUnconfirmedTimelineData = unconfirmedTimelineData;
                    allTotalTeamReports = totalTeamReports;
                    allTotalEnemyReports = totalEnemyReports;
                    allTotalConfirmedTeamReports = totalConfirmedTeamReports;
                    allTotalConfirmedEnemyReports = totalConfirmedEnemyReports;
                    allTotalUnconfirmedTeamReports = totalUnconfirmedTeamReports;
                    allTotalUnconfirmedEnemyReports = totalUnconfirmedEnemyReports;
                    
                    resultsSection.classList.remove('hidden');
                    if (typeof switchToTab === 'function') {
                        switchToTab('results');
                    }
                    
                    if (!currentSelectedPlayer && analysisSteamID) {
                        const matchingPlayer = playerSelectorOptions.find(opt => opt.steamID && steamIDsMatch(opt.steamID, analysisSteamID));
                        if (matchingPlayer) {
                            dbg('[ValidateReportCard] Found matching player for analysisSteamID, selecting:', matchingPlayer.key);
                            currentSelectedPlayer = matchingPlayer.key;
                            selectPlayerOption(matchingPlayer.key);
                        } else {
                        const steamIDFilter = `steamid_${analysisSteamID}`;
                        dbg('[ValidateReportCard] No player selected but analysisSteamID exists, using SteamID filter:', steamIDFilter);
                        currentSelectedPlayer = steamIDFilter;
                            let matchingOption = playerSelectorOptions.find(opt => opt.key === steamIDFilter);
                        if (!matchingOption) {
                                let slotFromMatch = null;
                                if (matchData[0]?.players) {
                                    const expectedSteamIDNum = BigInt(analysisSteamID);
                                    let closestPlayer = null;
                                    let minDiff = BigInt(1000);
                                    matchData[0].players.forEach(p => {
                                        if (p.SteamID) {
                                            const playerSteamIDNum = BigInt(String(p.SteamID));
                                            const diff = expectedSteamIDNum > playerSteamIDNum ? expectedSteamIDNum - playerSteamIDNum : playerSteamIDNum - expectedSteamIDNum;
                                            if (diff < minDiff) {
                                                minDiff = diff;
                                                closestPlayer = p;
                                            }
                                        }
                                    });
                                    if (closestPlayer && closestPlayer.Slot != null && closestPlayer.Slot >= 0 && closestPlayer.Slot < 10 && minDiff <= BigInt(10)) {
                                        slotFromMatch = closestPlayer.Slot;
                                        const actualSteamID = String(closestPlayer.SteamID);
                                        if (actualSteamID !== analysisSteamID) {
                                            dbg('[ValidateReportCard] Correcting analysisSteamID from', analysisSteamID, 'to', actualSteamID, 'based on match.players (diff:', minDiff.toString(), ')');
                                            analysisSteamID = actualSteamID;
                                        }
                                        dbg('[ValidateReportCard] Found slot', slotFromMatch, 'for Your Account from match.players');
                                    }
                                }
                                if (slotFromMatch == null && matchData[0]?.reports) {
                                    const reportWithSlot = matchData[0].reports.find(r => r.TargetSteamID && steamIDsMatch(r.TargetSteamID, analysisSteamID) && r.TargetSlot != null && r.TargetSlot >= 0 && r.TargetSlot < 10);
                                    if (reportWithSlot) {
                                        slotFromMatch = reportWithSlot.TargetSlot;
                                        dbg('[ValidateReportCard] Found slot', slotFromMatch, 'for Your Account from reports');
                                    } else {
                                        const targetSteamIDNum = BigInt(analysisSteamID);
                                        const reportsWithSlots = matchData[0].reports
                                            .filter(r => r.TargetSteamID && r.TargetSlot != null && r.TargetSlot >= 0 && r.TargetSlot < 10)
                                            .map(r => ({
                                                report: r,
                                                targetSteamID: BigInt(String(r.TargetSteamID)),
                                                slot: r.TargetSlot,
                                                diff: targetSteamIDNum > BigInt(String(r.TargetSteamID)) 
                                                    ? targetSteamIDNum - BigInt(String(r.TargetSteamID))
                                                    : BigInt(String(r.TargetSteamID)) - targetSteamIDNum
                                            }))
                                            .sort((a, b) => {
                                                if (a.diff < b.diff) return -1;
                                                if (a.diff > b.diff) return 1;
                                                return 0;
                                            });
                                        if (reportsWithSlots.length > 0 && reportsWithSlots[0].diff <= BigInt(100)) {
                                            slotFromMatch = reportsWithSlots[0].slot;
                                            dbg('[ValidateReportCard] Found slot', slotFromMatch, 'for Your Account from closest matching report (diff:', reportsWithSlots[0].diff.toString(), ')');
                                        }
                                    }
                                }
                                matchingOption = {
                                key: steamIDFilter,
                                name: 'Your Account',
                                hero: '',
                                team: null,
                                reportCount: 0,
                                    slot: slotFromMatch,
                                steamID: String(analysisSteamID)
                                };
                                playerSelectorOptions.push(matchingOption);
                            } else if (matchingOption.slot == null && matchData[0]) {
                                let slotFromMatch = null;
                                if (matchData[0].players) {
                                    const expectedSteamIDNum = BigInt(analysisSteamID);
                                    let closestPlayer = null;
                                    let minDiff = BigInt(1000);
                                    matchData[0].players.forEach(p => {
                                        if (p.SteamID) {
                                            const playerSteamIDNum = BigInt(String(p.SteamID));
                                            const diff = expectedSteamIDNum > playerSteamIDNum ? expectedSteamIDNum - playerSteamIDNum : playerSteamIDNum - expectedSteamIDNum;
                                            if (diff < minDiff) {
                                                minDiff = diff;
                                                closestPlayer = p;
                                            }
                                        }
                                    });
                                    if (closestPlayer && closestPlayer.Slot != null && closestPlayer.Slot >= 0 && closestPlayer.Slot < 10 && minDiff <= BigInt(10)) {
                                        slotFromMatch = closestPlayer.Slot;
                                        const actualSteamID = String(closestPlayer.SteamID);
                                        if (actualSteamID !== analysisSteamID) {
                                            dbg('[ValidateReportCard] Correcting analysisSteamID from', analysisSteamID, 'to', actualSteamID, 'based on match.players (diff:', minDiff.toString(), ')');
                                            analysisSteamID = actualSteamID;
                                            matchingOption.steamID = actualSteamID;
                                            matchingOption.key = `steamid_${actualSteamID}`;
                                        }
                                        dbg('[ValidateReportCard] Updating Your Account with slot', slotFromMatch, 'from match.players');
                                    }
                                }
                                if (slotFromMatch == null && matchData[0].reports) {
                                    const reportWithSlot = matchData[0].reports.find(r => r.TargetSteamID && steamIDsMatch(r.TargetSteamID, analysisSteamID) && r.TargetSlot != null && r.TargetSlot >= 0 && r.TargetSlot < 10);
                                    if (reportWithSlot) {
                                        slotFromMatch = reportWithSlot.TargetSlot;
                                        dbg('[ValidateReportCard] Updating Your Account with slot', slotFromMatch, 'from reports');
                                    }
                                }
                                if (slotFromMatch != null) {
                                    matchingOption.slot = slotFromMatch;
                                    renderPlayerSelector();
                                }
                        }
                        selectPlayerOption(steamIDFilter);
                        }
                    }
                    
                    updateGraphsForPlayer(currentSelectedPlayer);
                    graphsSection.classList.remove('hidden');
                }
            });
        } else {
            if (totalTeamReports + totalEnemyReports > 0) {
                const totalUnconfirmedTeamReports = totalTeamReports - totalConfirmedTeamReports;
                const totalUnconfirmedEnemyReports = totalEnemyReports - totalConfirmedEnemyReports;
                
                allConfirmedPlayerReportCounts = confirmedPlayerReportCounts;
                allUnconfirmedPlayerReportCounts = unconfirmedPlayerReportCounts;
                allConfirmedTimelineData = confirmedTimelineData;
                allUnconfirmedTimelineData = unconfirmedTimelineData;
                allTotalTeamReports = totalTeamReports;
                allTotalEnemyReports = totalEnemyReports;
                allTotalConfirmedTeamReports = totalConfirmedTeamReports;
                allTotalConfirmedEnemyReports = totalConfirmedEnemyReports;
                allTotalUnconfirmedTeamReports = totalUnconfirmedTeamReports;
                allTotalUnconfirmedEnemyReports = totalUnconfirmedEnemyReports;
                
                resultsSection.classList.remove('hidden');
                if (typeof switchToTab === 'function') {
                    switchToTab('results');
                }
                updateGraphsForPlayer(currentSelectedPlayer);
                graphsSection.classList.remove('hidden');
            }
        }
    }

    function pollSteamStatus() {
        fetchWithRetry('/api/steam/status', {}, 2, 500)
            .then(res => res.json())
            .then(data => {
                updateSteamUI(data.status, data.statusText, data.errorMessage);
                if (window.updateDownloadMatchSteamHint) window.updateDownloadMatchSteamHint();
            })
            .catch(err => {
                console.error('Steam status poll failed:', err);
                // Don't show error for polling failures, just log
            });
    }

    // Start polling on load
    pollSteamStatus();
    steamPollingInterval = setInterval(pollSteamStatus, 2000);

    if (steamLoginBtn) {
        steamLoginBtn.addEventListener('click', () => {
        const username = steamUserInput.value.trim();
        const password = steamPassInput.value.trim();
        const isSubmittingCode = srcText(steamLoginBtn) === 'Submit Code';
        const code = isSubmittingCode ? steamCodeInput.value.trim() : '';

        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }

        if (isSubmittingCode && !code) {
            alert('Please enter your Steam Guard code');
            return;
        }

        const originalText = steamLoginBtn.textContent;
        steamLoginBtn.disabled = true;
        steamLoginBtn.textContent = code ? 'Submitting Code...' : 'Connecting...';

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 35000);
        
        fetchWithRetry('/api/steam/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, code }),
            signal: controller.signal
        }, 2, 2000)
        .then(async res => {
            clearTimeout(timeoutId);
            const contentType = res.headers.get('content-type');
            if (!res.ok) {
                let errorText = '';
                if (contentType && contentType.includes('application/json')) {
                    const data = await res.json();
                    errorText = data.error || data.message || `HTTP ${res.status}`;
                    // If we got status info, update UI
                    if (data.status !== undefined) {
                        pollSteamStatus();
                        if (data.status === 2) {
                            steamLoginBtn.disabled = false;
                            steamLoginBtn.textContent = 'Submit Code';
                        }
                    }
                } else {
                    errorText = await res.text();
                }
                throw new Error(errorText || `Server error (${res.status})`);
            }
            return res.json();
        })
        .then(data => {
             pollSteamStatus();
             setTimeout(() => {
                 if (srcText(steamLoginBtn).includes('Submitting') || srcText(steamLoginBtn).includes('Connecting')) {
                     if (data.status === 2) {
                         steamLoginBtn.disabled = false;
                         steamLoginBtn.textContent = 'Submit Code';
                     } else if (data.status !== 3 && data.status !== 4) {
                         steamLoginBtn.disabled = false;
                         steamLoginBtn.textContent = originalText;
                     }
                 }
             }, 2000);
        })
        .catch(err => {
            clearTimeout(timeoutId);
            console.error('Steam login error:', err);
            // Try to get current status to update UI
            pollSteamStatus();
            const errorMsg = err.name === 'AbortError' ? 'Request timed out. Please check your connection and try again.' : (err.message || 'Failed to send login request');
            if (err.name !== 'AbortError') {
                alert('Failed to send login request: ' + errorMsg);
            } else {
                // For timeout, just update UI without alert
                console.warn('Login request timed out');
            }
            steamLoginBtn.disabled = false;
            steamLoginBtn.textContent = originalText;
            // Clear error message display if present
            const errorDisplay = document.getElementById('steam-error-message');
            if (errorDisplay) {
                errorDisplay.style.display = 'none';
            }
        });
    });
    }

    // Disconnect button handler
    if (steamDisconnectBtn) {
        steamDisconnectBtn.addEventListener('click', async () => {
            if (!(await LedgerUI.confirm({ title: 'Disconnect from Steam?', text: 'Match history and fatal search need a Steam connection.', ok: 'Disconnect' }))) {
            return;
        }

        const originalText = steamDisconnectBtn.textContent;
        steamDisconnectBtn.disabled = true;
        steamDisconnectBtn.textContent = 'Disconnecting...';

        fetchWithRetry('/api/steam/disconnect', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, 2, 1000)
        .then(async res => {
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Server error (${res.status}): ${text}`);
            }
            return res.json();
        })
        .then(data => {
            dbg('Disconnect successful:', data);
            steamCodeInput.value = '';
            pollSteamStatus();
            steamDisconnectBtn.disabled = false;
            steamDisconnectBtn.textContent = originalText;
        })
        .catch(err => {
            console.error('Steam disconnect error:', err);
            alert('Failed to disconnect: ' + err.message);
            steamDisconnectBtn.disabled = false;
            steamDisconnectBtn.textContent = originalText;
        });
        });
    }
    
    // Load from localStorage
    function loadFromStorage() {
        const savedReplayDir = localStorage.getItem('replayDir');
        const savedSteamUser = localStorage.getItem('steamUser');
        const savedSteamId = localStorage.getItem('steamId');
        localStorage.removeItem('steamPass');   // never keep a Steam password in the browser
        
        if (savedReplayDir) replayDirInput.value = savedReplayDir;
        if (savedSteamUser) steamUserInput.value = savedSteamUser;
        if (savedSteamId) steamIdInput.value = savedSteamId;
    }

    // Save to localStorage
    function saveToStorage() {
        if (replayDirInput.value) localStorage.setItem('replayDir', replayDirInput.value);
        if (steamUserInput.value) localStorage.setItem('steamUser', steamUserInput.value);
        if (steamIdInput.value) localStorage.setItem('steamId', steamIdInput.value);
    }

    // Load from localStorage first (before server config)
    loadFromStorage();

    // Load Config from server (will override localStorage if present)
    fetchWithRetry('/api/config', {}, 2, 1000)
        .then(res => res.json())
        .then(config => {
            // the folder the engine really uses wins over whatever this browser remembered
            if (config.replayDir) {
                replayDirInput.value = config.replayDir;
                localStorage.setItem('replayDir', config.replayDir);
            }
            updatePathDisplay(currentPath, getSelectedProfileName());

            if (config.steamUser && config.steamUser.trim() !== '') {
                steamUserInput.value = config.steamUser;
                localStorage.setItem('steamUser', config.steamUser);
            }
            
            if (config.steamPass && config.steamPass.trim() !== '') {
                steamPassInput.value = config.steamPass;
            }
            browseDirectory(currentPath);
        })
        .catch(() => {
        });

    // Auto-save config fields when they change (with debounce)
    let saveTokenTimeout;
    const autoSave = () => {
        const replayDir = replayDirInput.value.trim();
        const steamUser = steamUserInput.value.trim();
        const steamPass = steamPassInput.value.trim();
        
        if (replayDir) localStorage.setItem('replayDir', replayDir);
        if (steamUser) localStorage.setItem('steamUser', steamUser);
        
        clearTimeout(saveTokenTimeout);
        saveTokenTimeout = setTimeout(() => {
            const payload = {};
            if (replayDir) payload.replayDir = replayDir;
            if (steamUser) payload.steamUser = steamUser;
            if (steamPass) payload.steamPass = steamPass;

            if (Object.keys(payload).length > 0) {
                fetchWithRetry('/api/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                }, 2, 1000).catch(err => console.error('Auto-save failed:', err));
            }
        }, 1000);
    };

    replayDirInput.addEventListener('input', autoSave);
    steamUserInput.addEventListener('input', autoSave);
    steamPassInput.addEventListener('input', autoSave);
    
    steamIdInput.addEventListener('input', () => {
        if (steamIdInput.value) localStorage.setItem('steamId', steamIdInput.value);
    });
    
    replayList.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox' && e.target.closest('.replay-item')) {
            updatePlayerSelection();
        }
    });

    // Save Config
    saveConfigBtn.addEventListener('click', () => {
        const newDir = replayDirInput.value.trim();
        const newSteamUser = steamUserInput.value.trim();
        const newSteamPass = steamPassInput.value.trim();

        saveToStorage();
        
        const payload = {};
        if (newDir) payload.replayDir = newDir;
        if (newSteamUser) payload.steamUser = newSteamUser;
        if (newSteamPass) payload.steamPass = newSteamPass;
        
        fetchWithRetry('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }, 2, 1000)
            .then(res => res.json())
            .then(config => {
                if (config.replayDir) {
                    localStorage.setItem('replayDir', config.replayDir);
                    replayDirInput.value = config.replayDir;
                }
                if (config.steamUser) {
                    localStorage.setItem('steamUser', config.steamUser);
                    steamUserInput.value = config.steamUser;
                }
                if (config.steamPass) {
                    steamPassInput.value = config.steamPass;
                }
                LedgerUI.toast('Settings saved', 'ok');
                browseDirectory(currentPath);
            })
            .catch(err => {
                console.error('Error saving config:', err);
                alert('Error saving config: ' + err);
            });
    });

    const browseBackBtn = document.getElementById('browse-back');
    const currentPathDisplay = document.getElementById('current-path');
    
    function updatePathDisplay(path, profileName) {
        if (!currentPathDisplay) return;
        
        const baseDir = replayDirInput.value.trim() || '(not set)';
        let fullPath = baseDir;
        
        if (profileName) {
            fullPath += '/' + profileName;
        }
        
        if (path) {
            fullPath += '/' + path;
        }
        
        currentPathDisplay.textContent = fullPath;
        currentPathDisplay.title = fullPath;
    }
    
    let browseSeq = 0;
    function browseDirectory(path = '', profileNameOverride, silent = false) {
        if (!replayList) return;
        if (!silent) {
            replayList.innerHTML = '<div class="skeleton-list"><i></i><i></i><i></i><i></i></div>';
        }
        const seq = ++browseSeq;
        const profileName = profileNameOverride !== undefined ? profileNameOverride : getSelectedProfileName();
        const url = '/api/browse?t=' + Date.now() + (profileName ? '&profile=' + encodeURIComponent(profileName) : '') + (path ? '&path=' + encodeURIComponent(path) : '');
        
        fetch(url)
            .then(res => {
                if (!res.ok) {
                    return res.text().then(t => { throw new Error(t || `HTTP ${res.status}`); });
                }
                return res.json();
            })
            .then(items => {
                if (seq !== browseSeq) return;          // a newer request already answered
                const pathChanged = currentPath !== path;
                currentPath = path;
                browseBackBtn.style.display = path ? 'inline-flex' : 'none';
                updatePathDisplay(path, profileName);
                renderBrowseList(items, silent && !pathChanged);
                if (window.updateHistoryStatus && !silent) {
                    window.updateHistoryStatus();
                }
            })
            .catch(err => {
                if (seq !== browseSeq) return;
                if (!silent) {
                    replayList.textContent = '';
                    const p = document.createElement('p');
                    p.className = 'list-empty bad';
                    p.textContent = 'Could not open the replay folder: ' + (err && err.message ? err.message : err);
                    replayList.appendChild(p);
                }
            });
    }

    setInterval(() => {
        if (document.visibilityState === 'visible') {
            browseDirectory(currentPath, undefined, true);
        }
    }, 120000);

    function fmtSize(bytes) {
        if (!bytes) return '';
        return bytes > 1048576 ? (bytes / 1048576).toFixed(0) + ' MB' : Math.max(1, Math.round(bytes / 1024)) + ' KB';
    }

    // Rebuilt every time in the server's order (folders first, newest replay first), so "Latest N"
    // always picks the newest ones. Ticks and scroll position survive a refresh.
    function renderBrowseList(items, preserveState = false) {
        const checked = new Set(Array.from(replayList.querySelectorAll('.replay-item input[type="checkbox"]:checked')).map(cb => cb.value));
        const scrollTop = replayList.scrollTop;
        const shown = (items || []).filter(item => item.isDir || (item.isFile && /\.dem$/i.test(item.name)));
        replayList.textContent = '';
        if (!shown.length) {
            const p = document.createElement('div');
            p.className = 'list-empty';
            p.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg><b>No replays here yet</b><span>Drop .dem files on the page or look a player up on the home tab.</span>';
            replayList.appendChild(p);
            return;
        }
        const frag = document.createDocumentFragment();
        shown.forEach((item, i) => {
            const div = document.createElement('div');
            div.className = 'replay-item' + (item.isDir ? ' is-dir' : '');
            if (!preserveState) div.style.setProperty('--i', String(Math.min(i, 14)));
            if (item.isDir) {
                const target = String(item.path || item.name).replace(/\\/g, '/');
                div.tabIndex = 0;
                div.setAttribute('role', 'button');
                div.innerHTML = '<svg class="dir-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';
                const name = document.createElement('span');
                name.className = 'replay-name';
                name.textContent = item.name;
                div.appendChild(name);
                const open = () => browseDirectory(target);
                div.addEventListener('click', open);
                div.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
            } else {
                const fullPath = currentPath ? `${currentPath}/${item.name}` : item.name;
                const matchId = item.name.replace(/\.dem$/i, '');
                const id = 'replay-' + (fullPath.replace(/[^A-Za-z0-9_-]/g, '_'));
                const box = document.createElement('input');
                box.type = 'checkbox';
                box.value = fullPath;
                box.id = id;
                box.dataset.matchId = matchId;
                box.checked = checked.has(fullPath);
                const label = document.createElement('label');
                label.htmlFor = id;
                const name = document.createElement('span');
                name.className = 'replay-name';
                name.textContent = matchId;
                label.appendChild(name);
                if (item.date) {
                    const d = new Date(item.date);
                    if (!isNaN(d.getTime()) && d.getFullYear() > 2000) {
                        const when = document.createElement('span');
                        when.className = 'date-display';
                        when.textContent = d.toLocaleString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
                        label.appendChild(when);
                    }
                }
                if (item.fileSize) {
                    const size = document.createElement('span');
                    size.className = 'size-display';
                    size.textContent = fmtSize(item.fileSize);
                    label.appendChild(size);
                }
                div.append(box, label);
            }
            frag.appendChild(div);
        });
        replayList.appendChild(frag);
        if (preserveState) replayList.scrollTop = scrollTop;
        updatePlayerSelection();
    }

    if (browseBackBtn) {
        browseBackBtn.addEventListener('click', () => {
            const parts = currentPath.split('/').filter(p => p);
            parts.pop();
            const newPath = parts.join('/');
            browseDirectory(newPath);
        });
    }
    
    window.browseDirectory = browseDirectory;
    window.loadReplays = () => browseDirectory('');

    async function deleteSelectedReplays() {
        const checkboxes = document.querySelectorAll('.replay-item input[type="checkbox"]:checked');
        const selectedPaths = Array.from(checkboxes).map(cb => cb.value);

        if (selectedPaths.length === 0) {
            LedgerUI.toast('Select at least one replay to delete.', 'info');
            return;
        }

        const fileNames = selectedPaths.map(path => path.split('/').pop());
        const shown = fileNames.slice(0, 6).join(', ') + (fileNames.length > 6 ? ` and ${fileNames.length - 6} more` : '');
        if (!(await LedgerUI.confirm({ title: `Delete ${selectedPaths.length} replay${selectedPaths.length > 1 ? 's' : ''}?`, text: shown + '. This cannot be undone.', ok: 'Delete' }))) {
            return;
        }
        
        const originalText = deleteSelectedBtn.textContent;
        deleteSelectedBtn.disabled = true;
        deleteSelectedBtn.textContent = 'Deleting...';
        
        const deletePromises = selectedPaths.map(filePath => {
            const matchId = filePath.split('/').pop().replace('.dem', '');
            return fetch('/api/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    matchId: matchId,
                    filePath: filePath,
                    profileName: getSelectedProfileName()
                })
            }).then(async res => {
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Failed to delete ${filePath}: ${errorText || res.statusText}`);
                }
                return res.json();
            });
        });
        
        Promise.allSettled(deletePromises)
            .then(results => {
                const successful = results.filter(r => r.status === 'fulfilled').length;
                const failed = results.filter(r => r.status === 'rejected').length;
                
                if (failed > 0) {
                    const errors = results
                        .filter(r => r.status === 'rejected')
                        .map(r => r.reason.message)
                        .join('\n');
                    alert(`Deleted ${successful} file(s), but ${failed} failed:\n\n${errors}`);
                } else {
                    dbg(`Successfully deleted ${successful} replay file(s)`);
                }
                
                deleteSelectedBtn.textContent = originalText;
                deleteSelectedBtn.disabled = false;
                browseDirectory(currentPath);
                // Update history status indicators if available
                if (window.updateHistoryStatus) {
                    window.updateHistoryStatus();
                }
            })
            .catch(err => {
                deleteSelectedBtn.textContent = originalText;
                deleteSelectedBtn.disabled = false;
                alert('Error deleting replays: ' + err.message);
            });
    }

    refreshReplaysBtn.addEventListener('click', () => browseDirectory(currentPath));

    if (setupToggle && setupPanel) {
        setupToggle.addEventListener('click', () => {
            setupPanel.classList.toggle('hidden');
        });
    }

    if (workflowTabs.length > 0) {
        workflowTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                workflowTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                const targetContent = document.getElementById(`${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }

    function switchToTab(tabName) {
        const tab = document.querySelector(`.workflow-tab[data-tab="${tabName}"]`);
        if (tab) {
            tab.click();
        }
    }

    selectAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.replay-item input[type="checkbox"]').forEach(cb => {
            if (cb.value.endsWith('.dem')) cb.checked = true;
        });
        updatePlayerSelection();
    });

    deselectAllBtn.addEventListener('click', () => {
        document.querySelectorAll('.replay-item input[type="checkbox"]').forEach(cb => cb.checked = false);
        updatePlayerSelection();
    });

    selectLastBtn.addEventListener('click', () => {
        const count = parseInt(selectLastCountInput.value) || 10;
        const checkboxes = Array.from(document.querySelectorAll('.replay-item input[type="checkbox"]')).filter(cb => cb.value.endsWith('.dem'));
        checkboxes.forEach(cb => cb.checked = false);
        const newestX = checkboxes.slice(0, count);
        newestX.forEach(cb => cb.checked = true);
        updatePlayerSelection();
    });

    deleteSelectedBtn.addEventListener('click', deleteSelectedReplays);

    // Parse Logic
    async function runAnalysisInner() {
        const selectedCheckboxes = document.querySelectorAll('.replay-item input[type="checkbox"]:checked');
        const selectedIds = (window.ledgerPathOverride && window.ledgerPathOverride.length) ? window.ledgerPathOverride.slice() : Array.from(selectedCheckboxes).map(cb => cb.value);

        if (selectedIds.length === 0) {
            LedgerUI.toast('Select at least one replay.', 'info');
            return;
        }

        const steamIdValue = steamIdInput.value.trim();
        const converted = steamIdValue ? convertSteamIDTo64(steamIdValue) : null;
        // anything that is not a number would crash the BigInt maths further down
        analysisSteamID = converted && /^\d{5,20}$/.test(String(converted)) ? String(converted) : null;
        
        saveToStorage();

        // Reset UI
        progressSection.classList.remove('hidden');
        resultsSection.classList.add('hidden');
        graphsSection.classList.add('hidden');
        matchSelectorContainer.classList.add('hidden');
        playerSelectorContainer.classList.add('hidden');
        playerSelectorDisplay.innerHTML = '<span class="select-placeholder">Select a player...</span><span class="select-chevron" aria-hidden="true"></span>';
        playerSelectorDropdown.classList.add('hidden');
        currentSelectedPlayer = null;
        playerSelectorOptions = [];
        progressBar.style.width = '0%';
        // a new run never shows numbers left over from the previous one
        allMatchData = [];
        allMatchDataOriginal = [];
        playerSelectorCache.clear();
        allConfirmedPlayerReportCounts = new Map();
        allUnconfirmedPlayerReportCounts = new Map();
        allConfirmedTimelineData = [];
        allUnconfirmedTimelineData = [];
        allTotalTeamReports = allTotalEnemyReports = allTotalConfirmedTeamReports = allTotalConfirmedEnemyReports = 0;
        allTotalUnconfirmedTeamReports = allTotalUnconfirmedEnemyReports = 0;
        const failures = [];

        let totalTeamReports = 0;
        let totalEnemyReports = 0;
        let totalConfirmedTeamReports = 0;
        let totalConfirmedEnemyReports = 0;
        let processedCount = 0;
        
        const matchData = [];
        const confirmedPlayerReportCounts = new Map();
        const unconfirmedPlayerReportCounts = new Map();
        const confirmedTimelineData = [];
        const unconfirmedTimelineData = [];

        for (const filePath of selectedIds) {
            // Extract match ID from file path for display (e.g., "fatal/2025-11-17/8561630135.dem" -> "8561630135")
            const matchId = filePath.split('/').pop().replace('.dem', '');
            progressText.textContent = `Processing ${processedCount + 1} / ${selectedIds.length}: ${matchId}`;

            try {
                const res = await fetch('/api/parse', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        matchId: matchId,
                        filePath: filePath,
                        reportedSlot: -1,
                        reportedSteamId: "0",
                        profileName: getSelectedProfileName()
                    })
                });

                if (!res.ok) throw new Error(await res.text());

                const resultText = await res.text();
                const resultTextFixed = resultText.replace(/"TargetSteamID":\s*(\d+)/g, '"TargetSteamID":"$1"')
                    .replace(/"SteamID":\s*(\d+)/g, '"SteamID":"$1"');
                const result = JSON.parse(resultTextFixed);

                const countedSlots = new Set();
                let uniqueTeamReports = 0;
                let uniqueEnemyReports = 0;
                
                if (result.Reports) {
                    result.Reports.forEach(report => {
                        if (!countedSlots.has(report.Slot)) {
                            countedSlots.add(report.Slot);
                            if (report.Team === "FRIENDLY") {
                                uniqueTeamReports++;
                            } else {
                                uniqueEnemyReports++;
                            }
                        }
                    });
                }

                totalTeamReports += uniqueTeamReports;
                totalEnemyReports += uniqueEnemyReports;
                totalConfirmedTeamReports += uniqueTeamReports;
                totalConfirmedEnemyReports += uniqueEnemyReports;

                const confirmedTeamReports = uniqueTeamReports;
                const confirmedEnemyReports = uniqueEnemyReports;
                const unconfirmedTeamReports = 0;
                const unconfirmedEnemyReports = 0;

                matchData.push({
                    matchID: result.MatchID,
                    filePath: filePath,
                    teamReports: uniqueTeamReports,
                    enemyReports: uniqueEnemyReports,
                    confirmedTeamReports: confirmedTeamReports,
                    confirmedEnemyReports: confirmedEnemyReports,
                    unconfirmedTeamReports: unconfirmedTeamReports,
                    unconfirmedEnemyReports: unconfirmedEnemyReports,
                    reports: result.Reports || [],
                    scoreboardActivities: result.scoreboardActivities || [],
                    players: result.Players || [],
                    events: result.Events || [],
                    chat: result.Chat || []
                });

                if (result.Reports) {
                    result.Reports.forEach(report => {
                        const playerKey = report.Name || `Slot ${report.Slot}`;
                        const timeParts = report.Time.split(':');
                        let totalMinutes = 0;
                        if (timeParts.length === 2) {
                            const minutes = parseInt(timeParts[0]) || 0;
                            const seconds = parseInt(timeParts[1]) || 0;
                            totalMinutes = minutes + seconds / 60;
                        }

                        const timelinePoint = {
                            x: totalMinutes,
                            y: report.Team === 'FRIENDLY' ? 1 : 2,
                            matchID: result.MatchID
                        };

                        if (report.Confirmed) {
                            confirmedPlayerReportCounts.set(playerKey, (confirmedPlayerReportCounts.get(playerKey) || 0) + 1);
                            confirmedTimelineData.push(timelinePoint);
                        } else {
                            unconfirmedPlayerReportCounts.set(playerKey, (unconfirmedPlayerReportCounts.get(playerKey) || 0) + 1);
                            unconfirmedTimelineData.push(timelinePoint);
                        }
                    });
                }

            } catch (err) {
                console.error(`Error processing ${matchId} (${filePath}):`, err);
                failures.push(matchId + ': ' + String((err && err.message) || err).replace(/\s+/g, ' ').slice(0, 140));
            }

            processedCount++;
            progressBar.style.width = `${(processedCount / selectedIds.length) * 100}%`;
        }

        if (failures.length) {
            LedgerUI.toast(failures.length === selectedIds.length
                ? 'Could not read the selected replay' + (failures.length > 1 ? 's' : '') + '. ' + failures[0]
                : `${failures.length} of ${selectedIds.length} replays could not be read. ${failures[0]}`, 'bad', 9000);
        }
        if (!matchData.length) {
            window.ledgerMatches = [];
            document.dispatchEvent(new CustomEvent('ledger:matches'));
            return;
        }

        resultsSection.classList.remove('hidden');
        if (typeof switchToTab === 'function' && !window.ledgerNoJump) {
            switchToTab('results');
        }
        
        allMatchDataOriginal = JSON.parse(JSON.stringify(matchData));
        // publish the data first: the stats tab must not depend on the charts drawing
        window.ledgerMatches = allMatchDataOriginal;
        document.dispatchEvent(new CustomEvent('ledger:matches'));
        try {
            populateMatchSelector(matchData);
        } catch (e) { console.error('match selector failed', e); }
        if (matchData.length > 1) {
            matchSelectorContainer.classList.remove('hidden');
        } else {
            matchSelectorContainer.classList.add('hidden');
        }

        if (totalTeamReports + totalEnemyReports > 0) {
            const totalUnconfirmedTeamReports = totalTeamReports - totalConfirmedTeamReports;
            const totalUnconfirmedEnemyReports = totalEnemyReports - totalConfirmedEnemyReports;
            
            allConfirmedPlayerReportCounts = confirmedPlayerReportCounts;
            allUnconfirmedPlayerReportCounts = unconfirmedPlayerReportCounts;
            allConfirmedTimelineData = confirmedTimelineData;
            allUnconfirmedTimelineData = unconfirmedTimelineData;
            allTotalTeamReports = totalTeamReports;
            allTotalEnemyReports = totalEnemyReports;
            allTotalConfirmedTeamReports = totalConfirmedTeamReports;
            allTotalConfirmedEnemyReports = totalConfirmedEnemyReports;
            allTotalUnconfirmedTeamReports = totalUnconfirmedTeamReports;
            allTotalUnconfirmedEnemyReports = totalUnconfirmedEnemyReports;
            
            try { updateGraphsForPlayer(currentSelectedPlayer); } catch (e) { console.error('graphs failed', e); }
            graphsSection.classList.remove('hidden');
        }
    }

    // Single-flight wrapper: a click during a run queues exactly one re-run afterwards.
    let analysisRunning = false, analysisQueued = false;
    startParseBtn.addEventListener('click', async () => {
        if (analysisRunning) { analysisQueued = true; return; }
        analysisRunning = true;
        try {
            do { analysisQueued = false; await runAnalysisInner(); } while (analysisQueued);
        } catch (e) { console.error('analysis failed', e); }
        finally { analysisRunning = false; document.dispatchEvent(new CustomEvent('ledger:analysis-done')); }
    });

    let timelineChartInstance = null;
    let allMatchData = [];
    let allMatchDataOriginal = [];
    let analysisSteamID = null;
    let playerReportsPerMatchChart = null;
    let currentSelectedPlayer = null;
    let allConfirmedPlayerReportCounts = new Map();
    let allUnconfirmedPlayerReportCounts = new Map();
    let allConfirmedTimelineData = [];
    let allUnconfirmedTimelineData = [];
    let allTotalTeamReports = 0;
    let allTotalEnemyReports = 0;
    let allTotalConfirmedTeamReports = 0;
    let allTotalConfirmedEnemyReports = 0;
    let allTotalUnconfirmedTeamReports = 0;
    let allTotalUnconfirmedEnemyReports = 0;

    function populateMatchSelector(matchData) {
        allMatchData = matchData;
        matchSelector.innerHTML = '<option value="">Select a match...</option>';
        matchData.forEach((match, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Match ${match.matchID} (${match.teamReports + match.enemyReports} reports)`;
            option.dataset.matchId = String(match.matchID || '');
            matchSelector.appendChild(option);
        });
        if (matchData.length > 0) {
            matchSelector.value = '0';
            populatePlayerSelector(matchData[0]).then(() => {
                let steamIDToMatch = null;
                
                if (analysisSteamID) {
                    steamIDToMatch = String(analysisSteamID);
                } else {
                    const selectedProfile = getSelectedProfile();
                    if (selectedProfile && selectedProfile.id) {
                        steamIDToMatch = convertSteamIDTo64(String(selectedProfile.id));
                    }
                }
                
                if (steamIDToMatch) {
                    dbg('Initial match - Looking for Steam ID:', steamIDToMatch);
                    dbg('Available players:', playerSelectorOptions.map(opt => ({ key: opt.key, steamID: String(opt.steamID), name: opt.name })));
                    const matchingPlayer = playerSelectorOptions.find(opt => 
                        opt.steamID && steamIDsMatch(opt.steamID, steamIDToMatch)
                    );
                    if (matchingPlayer) {
                        dbg('Found matching player, selecting:', matchingPlayer.key);
                        selectPlayerOption(matchingPlayer.key);
                    } else {
                        dbg('No matching player found for Steam ID:', steamIDToMatch);
                        renderCurrentGraph(matchData[0], null);
                    }
                } else {
                    renderTimelineGraph(matchData[0], null);
                }
            });
        }
    }

    async function getPlayerInfo(matchData) {
        const cacheKey = String(matchData.matchID);
        if (playerInfoCache.has(cacheKey)) {
            return playerInfoCache.get(cacheKey);
        }
        
        try {
            const res = await fetch('/api/player-info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matchId: String(matchData.matchID),
                    filePath: matchData.filePath || '',
                    profileName: getSelectedProfileName()
                })
            });
            
            if (res.ok) {
                const playersText = await res.text();
                const playersTextFixed = playersText.replace(/"SteamID":\s*(\d+)/g, '"SteamID":"$1"');
                const players = JSON.parse(playersTextFixed);
                const playerInfoMap = new Map();
                const heroLookupBySlot = new Map();
                const heroLookupBySteamID = new Map();
                
                players.forEach(p => {
                    const steamIDStr = p.SteamID ? String(p.SteamID) : null;
                    playerInfoMap.set(p.Slot, { name: p.Name, hero: p.Hero, team: p.Team, steamID: steamIDStr });
                    if (p.Slot >= 0 && p.Slot < 10 && p.Hero) {
                        heroLookupBySlot.set(p.Slot, p.Hero);
                    }
                    if (steamIDStr && steamIDStr !== '0') {
                        heroLookupBySteamID.set(steamIDStr, p.Hero);
                    }
                });
                
                const result = { playerInfoMap, heroLookupBySlot, heroLookupBySteamID, players };
                playerInfoCache.set(cacheKey, result);
                heroLookupCache.set(cacheKey, { heroLookupBySlot, heroLookupBySteamID });
                return result;
            }
        } catch (err) {
            console.error('Error loading player info:', err);
        }
        
        return { playerInfoMap: new Map(), heroLookupBySlot: new Map(), heroLookupBySteamID: new Map(), players: [] };
    }

    async function populatePlayerSelector(matchData) {
        if (!matchData || !matchData.reports || matchData.reports.length === 0) {
            playerSelectorContainer.classList.add('hidden');
            return;
        }

        const cacheKey = `${matchData.matchID}_${currentGraphView}`;
        if (playerSelectorCache.has(cacheKey)) {
            playerSelectorOptions = playerSelectorCache.get(cacheKey);
            renderPlayerSelector();
            playerSelectorContainer.classList.remove('hidden');
            return;
        }

        dbg('=== populatePlayerSelector DEBUG ===');
        dbg('Total reports:', matchData.reports.length);
        
        const uniqueTargetSlots = new Set();
        const uniqueTargetSteamIDs = new Set();
        const reportsByTargetSlot = new Map();
        const reportsByTargetSteamID = new Map();
        
        matchData.reports.forEach((r, idx) => {
            const targetSteamIDStr = r.TargetSteamID ? String(r.TargetSteamID) : null;
            if (r.TargetSlot != null) {
                uniqueTargetSlots.add(r.TargetSlot);
                if (!reportsByTargetSlot.has(r.TargetSlot)) {
                    reportsByTargetSlot.set(r.TargetSlot, []);
                }
                reportsByTargetSlot.get(r.TargetSlot).push({ idx, time: r.Time, targetSlot: r.TargetSlot, targetSteamID: targetSteamIDStr });
            }
            if (targetSteamIDStr) {
                uniqueTargetSteamIDs.add(targetSteamIDStr);
                if (!reportsByTargetSteamID.has(targetSteamIDStr)) {
                    reportsByTargetSteamID.set(targetSteamIDStr, []);
                }
                reportsByTargetSteamID.get(targetSteamIDStr).push({ idx, time: r.Time, targetSlot: r.TargetSlot, targetSteamID: targetSteamIDStr });
            }
        });
        dbg('Unique TargetSlots:', Array.from(uniqueTargetSlots).sort((a, b) => a - b));
        dbg('Unique TargetSteamIDs:', Array.from(uniqueTargetSteamIDs).sort((a, b) => a - b));
        
        const buildPlayersMap = (steamIDToSlotMap) => {
            const map = new Map();
            const skipped = [];
            const isPlayerReportsMode = currentGraphView === 'playerReports';
            
            matchData.reports.forEach((report, idx) => {
                let key;
                let finalSlot;
                let finalSteamID;
                
                if (isPlayerReportsMode) {
                    finalSlot = report.Slot;
                    finalSteamID = report.SteamID ? String(report.SteamID) : null;
                    
                    if (finalSlot != null && finalSlot !== undefined && Number.isInteger(finalSlot) && finalSlot >= 0 && finalSlot < 10) {
                        key = `slot_${finalSlot}`;
                        if (!finalSteamID && slotToSteamID.has(finalSlot)) {
                            finalSteamID = slotToSteamID.get(finalSlot);
                        }
                    } else if (finalSteamID && finalSteamID !== '0') {
                        if (steamIDToSlotMap && steamIDToSlotMap.has(finalSteamID)) {
                            finalSlot = steamIDToSlotMap.get(finalSteamID);
                            key = `slot_${finalSlot}`;
                        } else {
                            key = `steamid_${finalSteamID}`;
                        }
                    } else {
                        skipped.push({ idx, slot: finalSlot, steamID: finalSteamID, time: report.Time });
                        return;
                    }
                } else {
                    const targetSlot = report.TargetSlot;
                    const targetSteamID = report.TargetSteamID ? String(report.TargetSteamID) : null;
                    
                    finalSlot = targetSlot;
                    finalSteamID = targetSteamID;
                    
                    if (targetSlot != null && targetSlot !== undefined && Number.isInteger(targetSlot) && targetSlot >= 0 && targetSlot < 10) {
                        key = `slot_${targetSlot}`;
                        if (!finalSteamID && slotToSteamID.has(targetSlot)) {
                            finalSteamID = slotToSteamID.get(targetSlot);
                        }
                    } else if (targetSteamID && targetSteamID !== '0') {
                        if (steamIDToSlotMap && steamIDToSlotMap.has(targetSteamID)) {
                            finalSlot = steamIDToSlotMap.get(targetSteamID);
                            key = `slot_${finalSlot}`;
                        } else {
                            key = `steamid_${targetSteamID}`;
                        }
                    } else {
                        skipped.push({ idx, targetSlot, targetSteamID, time: report.Time });
                        return;
                    }
                }
                
                if (!map.has(key)) {
                    map.set(key, {
                        slot: finalSlot,
                        steamID: finalSteamID,
                        reportCount: 0
                    });
                }
                map.get(key).reportCount++;
            });
            
            return { map, skipped };
        };
        
        const slotToSteamID = new Map();
        let steamIDToSlot = new Map();
        const skippedReports = [];
        const isPlayerReportsMode = currentGraphView === 'playerReports';
        
        matchData.reports.forEach((report, idx) => {
            let slot, steamID;
            
            if (isPlayerReportsMode) {
                slot = report.Slot;
                steamID = report.SteamID ? String(report.SteamID) : null;
            } else {
                slot = report.TargetSlot;
                steamID = report.TargetSteamID ? String(report.TargetSteamID) : null;
            }
            
            if (slot != null && slot !== undefined && Number.isInteger(slot) && slot >= 0 && slot < 10) {
                if (steamID && steamID !== '0') {
                    slotToSteamID.set(slot, steamID);
                    steamIDToSlot.set(steamID, slot);
                }
            }
        });
        
        dbg('Initial slotToSteamID mapping:', Array.from(slotToSteamID.entries()));
        dbg('Initial steamIDToSlot mapping:', Array.from(steamIDToSlot.entries()).map(([id, slot]) => `${id}: slot_${slot}`));
        
        let { map: playersMap, skipped: initialSkipped } = buildPlayersMap(steamIDToSlot);
        skippedReports.push(...initialSkipped);
        
        if (skippedReports.length > 0) {
            console.warn('Initial skipped reports:', skippedReports);
        }
        dbg('Initial playersMap created with', playersMap.size, 'players:', Array.from(playersMap.entries()).map(([k, v]) => `${k}: slot=${v.slot}, steamID=${v.steamID}, reports=${v.reportCount}`));

        let players = [];
        const selectorCacheKey = `${matchData.matchID}_${currentGraphView}`;
        const playerInfoCacheKey = String(matchData.matchID);
        
        if (matchData.players && Array.isArray(matchData.players) && matchData.players.length > 0) {
            players = matchData.players;
            dbg('Using cached players from matchData, count:', players.length);
        } else if (playerInfoCache.has(playerInfoCacheKey)) {
            const cached = playerInfoCache.get(playerInfoCacheKey);
            players = cached.players || [];
            dbg('Using cached players from playerInfoCache, count:', players.length);
        } else {
            try {
                const res = await fetch('/api/player-info', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        matchId: String(matchData.matchID),
                        filePath: matchData.filePath || '',
                        profileName: getSelectedProfileName()
                    })
                });
                
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
                }
                
                const playersText = await res.text();
                const playersTextFixed = playersText.replace(/"SteamID":\s*(\d+)/g, '"SteamID":"$1"');
                players = JSON.parse(playersTextFixed);
                dbg('Loaded players from API, count:', players.length);
            } catch (err) {
                console.error('Error loading player info:', err);
                players = [];
            }
        }
        
        dbg('Total players loaded:', players.length, 'slots:', players.map(p => p.Slot));
        
        const playerInfoMap = new Map();
        players.forEach(p => {
            const steamIDStr = p.SteamID ? String(p.SteamID) : null;
            playerInfoMap.set(p.Slot, { name: p.Name, hero: p.Hero, team: p.Team, steamID: steamIDStr });
            if (steamIDStr && steamIDStr !== '0') {
                steamIDToSlot.set(steamIDStr, p.Slot);
                slotToSteamID.set(p.Slot, steamIDStr);
            }
        });
        
        const heroLookupBySlot = new Map();
        const heroLookupBySteamID = new Map();
        players.forEach(p => {
            if (p.Slot >= 0 && p.Slot < 10 && p.Hero) {
                heroLookupBySlot.set(p.Slot, p.Hero);
            }
            const steamIDStr = p.SteamID ? String(p.SteamID) : null;
            if (steamIDStr && steamIDStr !== '0' && p.Hero) {
                heroLookupBySteamID.set(steamIDStr, p.Hero);
            }
        });
        
        if (players.length > 0 && !playerInfoCache.has(playerInfoCacheKey)) {
            playerInfoCache.set(playerInfoCacheKey, { playerInfoMap, heroLookupBySlot, heroLookupBySteamID, players });
            heroLookupCache.set(playerInfoCacheKey, { heroLookupBySlot, heroLookupBySteamID });
        }
        
        try {
            dbg('Player info loaded:', Array.from(playerInfoMap.entries()).map(([slot, info]) => `slot_${slot}: ${info.name} (steamID: ${info.steamID}, hero: ${info.hero})`));
            dbg('Updated steamIDToSlot mapping:', Array.from(steamIDToSlot.entries()).map(([id, slot]) => `${id}: slot_${slot}`));
            dbg('playerInfoMap size:', playerInfoMap.size, 'entries:', Array.from(playerInfoMap.keys()));
            
            const { map: updatedPlayersMap, skipped: remainingSkipped } = buildPlayersMap(steamIDToSlot);
            playersMap = updatedPlayersMap;
            
            if (remainingSkipped.length > skippedReports.length) {
                const newlyMapped = remainingSkipped.length - skippedReports.length;
                dbg(`Rebuilt playersMap after player info. Previously skipped ${skippedReports.length}, now skipped ${remainingSkipped.length}`);
            }
            
            dbg('Final playersMap created with', playersMap.size, 'players:', Array.from(playersMap.entries()).map(([k, v]) => `${k}: slot=${v.slot}, steamID=${v.steamID}, reports=${v.reportCount}`));
            
            players.forEach(p => {
                if (p.Slot >= 0 && p.Slot < 10) {
                    const key = `slot_${p.Slot}`;
                    if (!playersMap.has(key)) {
                        dbg(`Adding missing slot ${p.Slot} (${p.Name}) with 0 reports`);
                        playersMap.set(key, {
                            slot: p.Slot,
                            steamID: p.SteamID,
                            reportCount: 0
                        });
                    }
                }
            });
            
            dbg('Final playersMap after adding missing slots:', playersMap.size, 'players:', Array.from(playersMap.entries()).map(([k, v]) => `${k}: slot=${v.slot}, steamID=${v.steamID}, reports=${v.reportCount}`));

            const targetPlayerMap = new Map();
            matchData.reports.forEach(report => {
                let key;
                let finalSlot;
                let name;
                let hero;
                
                if (isPlayerReportsMode) {
                    finalSlot = report.Slot;
                    const reporterSteamID = report.SteamID;
                    
                    if (finalSlot != null && finalSlot !== undefined && Number.isInteger(finalSlot) && finalSlot >= 0 && finalSlot < 10) {
                        key = `slot_${finalSlot}`;
                    } else if (reporterSteamID && reporterSteamID > 0) {
                        const reporterSteamIDStr = String(reporterSteamID);
                        if (steamIDToSlot.has(reporterSteamIDStr)) {
                            finalSlot = steamIDToSlot.get(reporterSteamIDStr);
                            key = `slot_${finalSlot}`;
                        } else {
                            key = `steamid_${reporterSteamIDStr}`;
                        }
                    } else {
                        return;
                    }
                    
                    name = report.Name || '';
                    hero = report.Hero || '';
                } else {
                    const targetSlot = report.TargetSlot;
                    const targetSteamID = report.TargetSteamID;
                    
                    finalSlot = targetSlot;
                    
                    if (targetSlot != null && targetSlot !== undefined && Number.isInteger(targetSlot) && targetSlot >= 0 && targetSlot < 10) {
                        key = `slot_${targetSlot}`;
                    } else if (targetSteamID && targetSteamID > 0) {
                        if (steamIDToSlot.has(String(targetSteamID))) {
                            finalSlot = steamIDToSlot.get(String(targetSteamID));
                            key = `slot_${finalSlot}`;
                        } else {
                            key = `steamid_${targetSteamID}`;
                        }
                    } else {
                        return;
                    }
                    
                    name = report.TargetName || '';
                    hero = report.TargetHero || '';
                }
                
                if (!targetPlayerMap.has(key)) {
                    targetPlayerMap.set(key, {
                        slot: finalSlot,
                        name: name,
                        hero: hero
                    });
                }
            });
            
            dbg('targetPlayerMap keys after update:', Array.from(targetPlayerMap.keys()));

            playerSelectorOptions = [];
            playerSelectorOptions.push({ key: '', name: 'All Players', hero: '', team: null, reportCount: 0, slot: null });
            
            for (let slot = 0; slot < 10; slot++) {
                const key = `slot_${slot}`;
                const apiInfo = playerInfoMap.get(slot);
                const playerData = playersMap.get(key);
                const targetInfo = targetPlayerMap.get(key);
                
                let playerName = (apiInfo && apiInfo.name) || (targetInfo && targetInfo.name) || `Slot ${slot}`;
                let heroName = (apiInfo && apiInfo.hero) || (targetInfo && targetInfo.hero) || '';
                
                if (!heroName) {
                    heroName = heroLookupBySlot.get(slot) || '';
                    if (!heroName && playerData && playerData.steamID) {
                        heroName = heroLookupBySteamID.get(String(playerData.steamID)) || '';
                    }
                    if (!heroName && apiInfo && apiInfo.steamID) {
                        heroName = heroLookupBySteamID.get(String(apiInfo.steamID)) || '';
                    }
                }
                
                const team = apiInfo && apiInfo.team ? (apiInfo.team === 2 ? 'radiant' : apiInfo.team === 3 ? 'dire' : null) : null;
                const reportCount = playerData ? (playerData.reportCount || 0) : 0;
                const steamID = playerData ? (playerData.steamID ? String(playerData.steamID) : null) : (apiInfo ? (apiInfo.steamID ? String(apiInfo.steamID) : null) : null);
                
                dbg(`[PLAYER SELECTOR] Slot ${slot}: name="${playerName}", hero="${heroName}", apiInfo=${!!apiInfo}, playerData=${!!playerData}, targetInfo=${!!targetInfo}`);
                
                playerSelectorOptions.push({
                    key: key,
                    name: playerName,
                    hero: heroName,
                    team: team,
                    reportCount: reportCount,
                    slot: slot,
                    steamID: steamID
                });
            }
            
            dbg('Final playerSelectorOptions count:', playerSelectorOptions.length);
            dbg('Player selector options:', playerSelectorOptions.map(opt => ({ key: opt.key, slot: opt.slot, name: opt.name, hero: opt.hero, reportCount: opt.reportCount })));
            dbg('=== END populatePlayerSelector DEBUG ===');

            playerSelectorCache.set(selectorCacheKey, playerSelectorOptions);
            renderPlayerSelector();
            playerSelectorContainer.classList.remove('hidden');
        } catch (err) {
            console.error('Error loading player info:', err);
            const targetPlayerMap = new Map();
            const isPlayerReportsMode = currentGraphView === 'playerReports';
            matchData.reports.forEach(report => {
                let key;
                let finalSlot;
                let name;
                let hero;
                
                if (isPlayerReportsMode) {
                    finalSlot = report.Slot;
                    const reporterSteamID = report.SteamID;
                    
                    if (finalSlot != null && finalSlot !== undefined && Number.isInteger(finalSlot) && finalSlot >= 0 && finalSlot < 10) {
                        key = `slot_${finalSlot}`;
                    } else if (reporterSteamID && reporterSteamID > 0) {
                        key = `steamid_${reporterSteamID}`;
                    } else {
                        return;
                    }
                    
                    name = report.Name || '';
                    hero = report.Hero || '';
                } else {
                    const targetSlot = report.TargetSlot;
                    const targetSteamID = report.TargetSteamID;
                    
                    finalSlot = targetSlot;
                    
                    if (targetSlot != null && targetSlot !== undefined && Number.isInteger(targetSlot) && targetSlot >= 0 && targetSlot < 10) {
                        key = `slot_${targetSlot}`;
                    } else if (targetSteamID && targetSteamID > 0) {
                        key = `steamid_${targetSteamID}`;
                    } else {
                        return;
                    }
                    
                    name = report.TargetName || '';
                    hero = report.TargetHero || '';
                }
                
                if (!targetPlayerMap.has(key)) {
                    targetPlayerMap.set(key, {
                        slot: finalSlot,
                        name: name,
                        hero: hero
                    });
                }
            });

            playerSelectorOptions = [];
            playerSelectorOptions.push({ key: '', name: 'All Players', hero: '', team: null, reportCount: 0, slot: null });
            
            for (let slot = 0; slot < 10; slot++) {
                const key = `slot_${slot}`;
                const playerData = playersMap.get(key);
                const targetInfo = targetPlayerMap.get(key);
                
                const playerName = (targetInfo && targetInfo.name) || `Slot ${slot}`;
                const heroName = (targetInfo && targetInfo.hero) || '';
                const reportCount = playerData ? (playerData.reportCount || 0) : 0;
                const steamID = playerData ? (playerData.steamID ? String(playerData.steamID) : null) : null;
                
                playerSelectorOptions.push({
                    key: key,
                    name: playerName,
                    hero: heroName,
                    team: null,
                    reportCount: reportCount,
                    slot: slot,
                    steamID: steamID
                });
            }

            renderPlayerSelector();
            playerSelectorContainer.classList.remove('hidden');
        }
    }

    function parseTimeToMinutes(timeStr) {
        const parts = timeStr.split(':');
        if (parts.length !== 2) return 0;
        const minutes = parseInt(parts[0]) || 0;
        const seconds = parseInt(parts[1]) || 0;
        return minutes + seconds / 60;
    }

    async function renderCurrentGraph(matchData, playerFilter = null) {
        const canvas = timelineGraphContainer.querySelector('canvas');
        const title = timelineGraphContainer.querySelector('.graph-title');
        if (canvas) canvas.style.opacity = '0';
        if (title) title.style.opacity = '0';
        showGraphLoading();
        try {
            updatePlayerSelectorLabel();
            if (currentGraphView === 'scoreboard') {
                renderScoreboardActivityGraph(matchData, playerFilter);
            } else if (currentGraphView === 'playerReports') {
                await renderPlayerReportsGraph(matchData, playerFilter);
            } else {
                renderTimelineGraph(matchData, playerFilter);
            }
            if (currentSelectedPlayer && playerSelectorOptions.length > 0) {
                const option = playerSelectorOptions.find(o => o.key === currentSelectedPlayer);
                if (option && playerSelectorDisplay) {
                    playerSelectorDisplay.innerHTML = playerOptionHtml(option, true);
                }
            }
        } finally {
            hideGraphLoading();
        }
    }

    function renderTimelineGraph(matchData, playerFilter = null) {
        if (!matchData || !matchData.reports || matchData.reports.length === 0) {
            const timelineOverlay = timelineGraphContainer.querySelector('#graph-loading-overlay');
            if (timelineOverlay) {
                timelineOverlay.remove();
            }
            timelineGraphContainer.innerHTML = '<p class="graph-empty">No reports found for this match.</p>';
            hideGraphLoading();
            return;
        }

        let reports = matchData.reports;
        let effectiveFilter = playerFilter;
        
        if (playerFilter && playerFilter.startsWith('steamid_') && matchData.players) {
            const targetSteamID = String(playerFilter.replace('steamid_', '')).trim();
            dbg(`[renderTimelineGraph] Attempting to find player by SteamID: "${targetSteamID}"`);
            dbg(`[renderTimelineGraph] Available players:`, matchData.players.map(p => ({
                Slot: p.Slot,
                SteamID: p.SteamID ? String(p.SteamID).trim() : null,
                Name: p.Name
            })));
            
            const targetPlayer = matchData.players.find(p => {
                if (!p.SteamID) return false;
                const playerSteamID = String(p.SteamID).trim();
                const match = playerSteamID === targetSteamID;
                if (!match) {
                    dbg(`[renderTimelineGraph] SteamID mismatch: player.SteamID="${playerSteamID}" !== target="${targetSteamID}" for ${p.Name}`);
                }
                return match;
            });
            
            if (targetPlayer && targetPlayer.Slot != null && targetPlayer.Slot >= 0 && targetPlayer.Slot < 10) {
                dbg(`[renderTimelineGraph] Found player by SteamID, converting to slot filter: slot_${targetPlayer.Slot}`);
                effectiveFilter = `slot_${targetPlayer.Slot}`;
            } else {
                dbg(`[renderTimelineGraph] Player not found by SteamID, will try TargetSteamID filtering`);
            }
        }
        
        if (effectiveFilter) {
            if (effectiveFilter.startsWith('slot_')) {
                const targetSlot = parseInt(effectiveFilter.replace('slot_', ''));
                dbg(`[renderTimelineGraph] Filtering reports for TargetSlot: ${targetSlot}`);
                const beforeCount = reports.length;
                reports = reports.filter(r => r.TargetSlot === targetSlot);
                dbg(`[renderTimelineGraph] Filtered from ${beforeCount} to ${reports.length} reports for TargetSlot: ${targetSlot}`);
            } else if (effectiveFilter.startsWith('steamid_')) {
                const targetSteamID = String(effectiveFilter.replace('steamid_', '')).trim();
                dbg(`[renderTimelineGraph] Filtering by TargetSteamID: "${targetSteamID}"`);
                const beforeCount = reports.length;
                const sampleReports = reports.slice(0, 5).map(r => ({
                    TargetSteamID: r.TargetSteamID,
                    TargetSteamIDType: typeof r.TargetSteamID,
                    TargetSteamIDString: r.TargetSteamID ? String(r.TargetSteamID).trim() : null,
                    TargetSlot: r.TargetSlot,
                    TargetName: r.TargetName
                }));
                dbg(`[renderTimelineGraph] Sample report TargetSteamIDs:`, sampleReports);
                reports = reports.filter(r => {
                    if (!r.TargetSteamID) return false;
                    const reportTargetSteamID = String(r.TargetSteamID).trim();
                    const matches = reportTargetSteamID === targetSteamID;
                    if (!matches && reportTargetSteamID && targetSteamID) {
                        dbg(`[renderTimelineGraph] Mismatch: report.TargetSteamID="${reportTargetSteamID}" (type: ${typeof r.TargetSteamID}) !== filter="${targetSteamID}"`);
                    }
                    return matches;
                });
                dbg(`[renderTimelineGraph] Filtered from ${beforeCount} to ${reports.length} reports for TargetSteamID: ${targetSteamID}`);
                
                if (reports.length === 0 && matchData.players) {
                    dbg(`[renderTimelineGraph] No reports found by TargetSteamID, trying fallback to slot-based filtering`);
                    const targetPlayer = matchData.players.find(p => p.SteamID && String(p.SteamID).trim() === targetSteamID);
                    if (targetPlayer && targetPlayer.Slot != null && targetPlayer.Slot >= 0 && targetPlayer.Slot < 10) {
                        dbg(`[renderTimelineGraph] Found player by SteamID for fallback, using slot ${targetPlayer.Slot}`);
                        reports = matchData.reports.filter(r => r.TargetSlot === targetPlayer.Slot);
                        dbg(`[renderTimelineGraph] Fallback slot filter found ${reports.length} reports`);
                    }
                }
            }
        }

        if (reports.length === 0) {
            timelineGraphContainer.innerHTML = '<p class="graph-empty">No reports found for the selected player.</p>';
            hideGraphLoading();
            return;
        }

        const title = document.createElement('h3');
        title.className = 'graph-title';
        title.textContent = 'Reports on the player, by minute';
        
        
        const canvas = document.createElement('canvas');
        canvas.id = 'timeline-graph';
        const tooltip = document.createElement('div');
        tooltip.id = 'timeline-tooltip';
        tooltip.className = 'timeline-tooltip hidden';
        
        timelineGraphContainer.innerHTML = '';
        showGraphLoading();
        timelineGraphContainer.appendChild(title);
        timelineGraphContainer.appendChild(canvas);
        timelineGraphContainer.appendChild(tooltip);
        
        canvas.style.opacity = '0';
        canvas.style.visibility = 'hidden';
        title.style.opacity = '0';
        title.style.visibility = 'hidden';

        const ctx = canvas.getContext('2d');
        const T = LedgerUI.canvasTheme();
        const padding = { top: 60, right: 40, bottom: 60, left: 80 };
        const iconSize = 40;
        const iconSpacing = 5;
        const teamRegionHeight = 120;
        const totalHeight = padding.top + teamRegionHeight * 2 + padding.bottom;
        
        const containerWidth = Math.max((timelineGraphContainer.clientWidth || 1200) - 2, 760);
        const devicePixelRatio = window.devicePixelRatio || 1;
        canvas.width = containerWidth * devicePixelRatio;
        canvas.height = totalHeight * devicePixelRatio;
        canvas.style.width = containerWidth + 'px';
        canvas.style.height = `${totalHeight}px`;
        ctx.scale(devicePixelRatio, devicePixelRatio);
        
        const graphWidth = containerWidth - padding.left - padding.right;
        const graphHeight = totalHeight - padding.top - padding.bottom;

        const maxTime = Math.max(...reports.map(r => parseTimeToMinutes(r.Time)), 60);
        const timeRange = Math.max(maxTime, 60);

        const friendlyReports = reports.filter(r => r.Team === 'FRIENDLY');
        const enemyReports = reports.filter(r => r.Team === 'ENEMY');

        function groupReportsByTime(reportList) {
            const grouped = new Map();
            reportList.forEach(report => {
                const time = parseTimeToMinutes(report.Time);
                const timeKey = Math.floor(time * 60);
                if (!grouped.has(timeKey)) {
                    grouped.set(timeKey, []);
                }
                grouped.get(timeKey).push({ ...report, time });
            });
            return grouped;
        }

        const friendlyGroups = groupReportsByTime(friendlyReports);
        const enemyGroups = groupReportsByTime(enemyReports);

        function getCircleCenter(pos) {
            return {
                x: pos.x,
                y: pos.y + iconSize / 2
            };
        }

        function getDistance(pos1, pos2) {
            const center1 = getCircleCenter(pos1);
            const center2 = getCircleCenter(pos2);
            const dx = center1.x - center2.x;
            const dy = center1.y - center2.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        function resolveOverlaps(positions, radius, minY, maxY) {
            const sorted = [...positions].sort((a, b) => {
                const xDiff = Math.abs(a.x - b.x);
                if (xDiff < 1) {
                    return a.y - b.y;
                }
                return a.x - b.x;
            });

            const xThreshold = radius * 1.5;
            const minSeparation = radius * 2 + iconSpacing;

            const groups = new Map();
            sorted.forEach((pos, idx) => {
                let foundGroup = false;
                for (const [groupX, group] of groups.entries()) {
                    if (Math.abs(pos.x - groupX) < xThreshold) {
                        group.push(idx);
                        foundGroup = true;
                        break;
                    }
                }
                if (!foundGroup) {
                    groups.set(pos.x, [idx]);
                }
            });

            groups.forEach((indices) => {
                indices.sort((a, b) => sorted[a].y - sorted[b].y);
                let currentY = minY + 10;
                indices.forEach(idx => {
                    sorted[idx].y = currentY;
                    const candidateCount = (sorted[idx].report.Candidates && sorted[idx].report.Candidates.length > 0) ? sorted[idx].report.Candidates.length : 1;
                    currentY += (iconSize + iconSpacing) * candidateCount;
                });
            });

            const maxIterations = 500;
            const damping = 0.9;
            const minForce = 0.1;

            for (let iter = 0; iter < maxIterations; iter++) {
                let totalMovement = 0;
                const forces = new Array(sorted.length).fill(0);

                for (let i = 0; i < sorted.length; i++) {
                    for (let j = i + 1; j < sorted.length; j++) {
                        const distance = getDistance(sorted[i], sorted[j]);
                        
                        if (distance < minSeparation) {
                            const center1 = getCircleCenter(sorted[i]);
                            const center2 = getCircleCenter(sorted[j]);
                            const dx = center1.x - center2.x;
                            const dy = center1.y - center2.y;
                            
                            if (distance > 0.001) {
                                const overlap = minSeparation - distance;
                                const force = (overlap / distance) * 1.5;
                                const forceY = (dy / distance) * force;
                                
                                forces[i] += forceY;
                                forces[j] -= forceY;
                            } else {
                                const pushY = (minSeparation / 2) + iconSpacing;
                                if (sorted[i].y < sorted[j].y) {
                                    forces[i] -= pushY;
                                    forces[j] += pushY;
                                } else {
                                    forces[i] += pushY;
                                    forces[j] -= pushY;
                                }
                            }
                        }
                    }
                }

                for (let i = 0; i < sorted.length; i++) {
                    if (Math.abs(forces[i]) > minForce) {
                        const newY = sorted[i].y + forces[i] * damping;
                        const clampedY = Math.max(minY, Math.min(maxY - iconSize, newY));
                        const movement = Math.abs(clampedY - sorted[i].y);
                        totalMovement += movement;
                        sorted[i].y = clampedY;
                    }
                }

                if (totalMovement < 0.01) break;
            }

            for (let i = 0; i < sorted.length; i++) {
                for (let j = i + 1; j < sorted.length; j++) {
                    const distance = getDistance(sorted[i], sorted[j]);
                    if (distance < minSeparation - 0.5) {
                        const center1 = getCircleCenter(sorted[i]);
                        const center2 = getCircleCenter(sorted[j]);
                        const dy = center1.y - center2.y;
                        const neededSeparation = minSeparation - distance;
                        
                        if (Math.abs(dy) < iconSize) {
                            if (sorted[i].y < sorted[j].y) {
                                sorted[i].y = Math.max(minY, sorted[i].y - neededSeparation / 2);
                                sorted[j].y = Math.min(maxY - iconSize, sorted[j].y + neededSeparation / 2);
                            } else {
                                sorted[j].y = Math.max(minY, sorted[j].y - neededSeparation / 2);
                                sorted[i].y = Math.min(maxY - iconSize, sorted[i].y + neededSeparation / 2);
                            }
                        }
                    }
                }
            }

            return sorted;
        }

        const iconPositions = [];
        const friendlyYByX = new Map();
        const enemyYByX = new Map();
        
        friendlyGroups.forEach((reportGroup) => {
            const reports = reportGroup.sort((a, b) => a.time - b.time);
            const time = reports[0].time;
            const x = padding.left + (time / timeRange) * graphWidth;
            
            let currentY = friendlyYByX.get(x) || padding.top + 10;
            
            reports.forEach((report) => {
                iconPositions.push({ report, x, y: currentY, team: 'FRIENDLY' });
                currentY += iconSize + iconSpacing;
            });
            
            friendlyYByX.set(x, currentY);
        });
        
        enemyGroups.forEach((reportGroup) => {
            const reports = reportGroup.sort((a, b) => a.time - b.time);
            const time = reports[0].time;
            const x = padding.left + (time / timeRange) * graphWidth;
            
            let currentY = enemyYByX.get(x) || padding.top + teamRegionHeight + 10;
            
            reports.forEach((report) => {
                iconPositions.push({ report, x, y: currentY, team: 'ENEMY' });
                currentY += iconSize + iconSpacing;
            });
            
            enemyYByX.set(x, currentY);
        });

        const friendlyPositions = iconPositions.filter(p => p.team === 'FRIENDLY');
        const enemyPositions = iconPositions.filter(p => p.team === 'ENEMY');
        
        const radius = iconSize / 2;
        const friendlyResolved = resolveOverlaps(friendlyPositions, radius, padding.top, padding.top + teamRegionHeight);
        const enemyResolved = resolveOverlaps(enemyPositions, radius, padding.top + teamRegionHeight, padding.top + teamRegionHeight * 2);
        
        iconPositions.length = 0;
        iconPositions.push(...friendlyResolved, ...enemyResolved);

        const imagesToLoad = new Set();
        iconPositions.forEach(pos => {
            const iconUrl = getHeroIconUrl(pos.report.TargetHero || pos.report.Hero);
            if (iconUrl) imagesToLoad.add(iconUrl);
        });

        const imageCache = new Map();
        let imagesLoaded = 0;
        const totalImages = imagesToLoad.size;

        function drawIcons() {
            ctx.clearRect(0, 0, containerWidth, totalHeight);
            ctx.fillStyle = T.bg;
            ctx.fillRect(0, 0, containerWidth, totalHeight);

            ctx.strokeStyle = T.line;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding.left, padding.top);
            ctx.lineTo(padding.left, totalHeight - padding.bottom);
            ctx.moveTo(padding.left, padding.top + teamRegionHeight);
            ctx.lineTo(containerWidth - padding.right, padding.top + teamRegionHeight);
            ctx.moveTo(padding.left, padding.top + teamRegionHeight * 2);
            ctx.lineTo(containerWidth - padding.right, padding.top + teamRegionHeight * 2);
            ctx.stroke();

            ctx.fillStyle = T.muted;
            ctx.font = '600 12px Manrope, system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillStyle = T.good;
            ctx.fillText(tr('Teammates'), padding.left + 8, padding.top - 20);
            ctx.fillStyle = T.bad;
            ctx.fillText(tr('Enemies'), padding.left + 8, padding.top + teamRegionHeight + 20);

            const numLabels = Math.min(20, Math.ceil(timeRange / 2));
            for (let i = 0; i <= numLabels; i++) {
                const time = (i * timeRange) / numLabels;
                const x = padding.left + (time / timeRange) * graphWidth;
                const minutes = Math.floor(time);
                const seconds = Math.floor((time - minutes) * 60);
                const timeLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                
                ctx.strokeStyle = T.grid;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(x, padding.top);
                ctx.lineTo(x, totalHeight - padding.bottom);
                ctx.stroke();
                
                ctx.fillStyle = T.muted;
                ctx.font = '11px Manrope, system-ui, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(timeLabel, x, totalHeight - padding.bottom + 18);
            }

            iconPositions.forEach(({ report, x, y, team }) => {
                const heroName = report.TargetHero || report.Hero;
                const iconUrl = getHeroIconUrl(heroName);
                const img = iconUrl ? imageCache.get(iconUrl) : null;
                
                if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(x, y + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
                    ctx.clip();
                    ctx.drawImage(img, x - iconSize / 2, y, iconSize, iconSize);
                    ctx.restore();
                } else {
                    ctx.fillStyle = T.grid;
                    ctx.beginPath();
                    ctx.arc(x, y + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = T.text;
                    ctx.font = '10px Manrope, system-ui, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(heroName ? heroName.substring(0, 3).toUpperCase() : '?', x, y + iconSize / 2 + 3);
                }
                
                ctx.strokeStyle = team === 'FRIENDLY' ? T.good : T.bad;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
                ctx.stroke();
            });
        }

        drawIcons();

        function showTimelineGraphWhenReady() {
            dbg('[GRAPH DEBUG] showTimelineGraphWhenReady() called');
            hideGraphLoading();
            requestAnimationFrame(() => {
                const canvas = timelineGraphContainer.querySelector('canvas');
                const title = timelineGraphContainer.querySelector('.graph-title');
                dbg('[GRAPH DEBUG] Canvas found:', !!canvas, 'Title found:', !!title);
                if (canvas) {
                    canvas.style.opacity = '1';
                    canvas.style.visibility = 'visible';
                    canvas.style.display = 'block';
                    dbg('[GRAPH DEBUG] Canvas shown, opacity:', canvas.style.opacity, 'visibility:', canvas.style.visibility);
                } else {
                    console.error('[GRAPH DEBUG] ERROR: Canvas not found!');
                }
                if (title) {
                    title.style.opacity = '1';
                    title.style.visibility = 'visible';
                    title.style.display = 'block';
                    dbg('[GRAPH DEBUG] Title shown');
                } else {
                    console.error('[GRAPH DEBUG] ERROR: Title not found!');
                }
            });
        }

        if (totalImages > 0) {
            imagesToLoad.forEach(iconUrl => {
                const img = new Image();
                img.onload = () => {
                    imageCache.set(iconUrl, img);
                    imagesLoaded++;
                    if (imagesLoaded === totalImages) {
                        drawIcons();
                        showTimelineGraphWhenReady();
                    } else if (imagesLoaded % 3 === 0) {
                        drawIcons();
                    }
                };
                img.onerror = (e) => {
                    console.warn(`Failed to load hero icon: ${iconUrl}`, e);
                    imagesLoaded++;
                    if (imagesLoaded === totalImages) {
                        drawIcons();
                        showTimelineGraphWhenReady();
                    }
                };
                img.src = iconUrl;
            });
        } else {
            showTimelineGraphWhenReady();
        }

        canvas.addEventListener('click', () => openSteamProfile(canvas.__steamId));
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = rect.width / containerWidth;
            const scaleY = rect.height / totalHeight;
            const x = (e.clientX - rect.left) / scaleX;
            const y = (e.clientY - rect.top) / scaleY;
            
            const iconRadius = iconSize / 2;
            let hoveredIcon = null;
            
            for (const pos of iconPositions) {
                const centerX = pos.x;
                const centerY = pos.y + iconSize / 2;
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= iconRadius) {
                    hoveredIcon = pos;
                    break;
                }
            }
            
            canvas.__steamId = hoveredIcon ? iconPlayer(hoveredIcon.report).id : '';
            canvas.style.cursor = canvas.__steamId ? 'pointer' : '';
            if (hoveredIcon) {
                const timestamp = hoveredIcon.report.Time;
                const heroName = hoveredIcon.report.TargetHero || hoveredIcon.report.Hero;
                tooltip.textContent = `${heroName || 'Unknown'}: ${timestamp}` + playerLines(iconPlayer(hoveredIcon.report));
                tooltip.style.visibility = 'hidden';
                tooltip.classList.remove('hidden');
                
                const tooltipRect = tooltip.getBoundingClientRect();
                let left = e.clientX + 15;
                let top = e.clientY - tooltipRect.height - 10;
                
                if (left + tooltipRect.width > window.innerWidth - 10) {
                    left = e.clientX - tooltipRect.width - 15;
                }
                if (top < 10) {
                    top = e.clientY + 15;
                }
                
                tooltip.style.left = `${left}px`;
                tooltip.style.top = `${top}px`;
                tooltip.style.visibility = 'visible';
            } else {
                tooltip.classList.add('hidden');
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
            tooltip.classList.add('hidden');
        });
    }

    async function renderPlayerReportsGraph(matchData, playerFilter = null) {
        dbg('[GRAPH DEBUG] renderPlayerReportsGraph() called');
        showGraphLoading();
        
        try {
            if (!matchData || !matchData.reports || matchData.reports.length === 0) {
                timelineGraphContainer.innerHTML = '<p class="graph-empty">No reports found for this match.</p>';
                hideGraphLoading();
                return;
            }

            let reports = matchData.reports;
        
        if (playerFilter) {
            if (playerFilter.startsWith('slot_')) {
                const reporterSlot = parseInt(playerFilter.replace('slot_', ''));
                reports = reports.filter(r => r.Slot === reporterSlot);
            } else if (playerFilter.startsWith('steamid_')) {
                const reporterSteamID = playerFilter.replace('steamid_', '');
                reports = reports.filter(r => String(r.SteamID) === reporterSteamID);
            }
        }

            if (reports.length === 0) {
                timelineGraphContainer.innerHTML = '<p class="graph-empty">No reports found for the selected player.</p>';
                hideGraphLoading();
                return;
            }

        const cacheKey = String(matchData.matchID);
        let heroLookupBySlot = new Map();
        let heroLookupBySteamID = new Map();
        
        if (heroLookupCache.has(cacheKey)) {
            const cached = heroLookupCache.get(cacheKey);
            heroLookupBySlot = cached.heroLookupBySlot;
            heroLookupBySteamID = cached.heroLookupBySteamID;
        } else if (matchData.players && Array.isArray(matchData.players) && matchData.players.length > 0) {
            matchData.players.forEach(p => {
                if (p.Slot >= 0 && p.Slot < 10 && p.Hero) {
                    heroLookupBySlot.set(p.Slot, p.Hero);
                }
                const steamIDStr = p.SteamID ? String(p.SteamID) : null;
                if (steamIDStr && steamIDStr !== '0') {
                    heroLookupBySteamID.set(steamIDStr, p.Hero);
                }
            });
            heroLookupCache.set(cacheKey, { heroLookupBySlot, heroLookupBySteamID });
        } else {
            const { heroLookupBySlot: slotLookup, heroLookupBySteamID: steamLookup } = await getPlayerInfo(matchData);
            heroLookupBySlot = slotLookup;
            heroLookupBySteamID = steamLookup;
        }

        reports = reports.map(report => {
            const updatedReport = { ...report };
            
            if (!report.TargetHero || !report.TargetHero.trim()) {
                let hero = null;
                if (report.TargetSlot != null && report.TargetSlot >= 0 && report.TargetSlot < 10) {
                    hero = heroLookupBySlot.get(report.TargetSlot);
                }
                if (!hero && report.TargetSteamID) {
                    hero = heroLookupBySteamID.get(String(report.TargetSteamID));
                }
                if (hero) {
                    updatedReport.TargetHero = hero;
                }
            }
            
            if (report.Candidates && report.Candidates.length > 0) {
                updatedReport.Candidates = report.Candidates.map(candidate => {
                    const heroName = candidate.Hero ? candidate.Hero.trim() : '';
                    const isUnknown = !heroName || heroName.toLowerCase() === 'unknown';
                    
                    if (isUnknown) {
                        let hero = null;
                        if (candidate.Slot != null && candidate.Slot >= 0 && candidate.Slot < 10) {
                            hero = heroLookupBySlot.get(candidate.Slot);
                        }
                        if (!hero && candidate.SteamID) {
                            hero = heroLookupBySteamID.get(String(candidate.SteamID));
                        }
                        if (hero) {
                            return { ...candidate, Hero: hero };
                        }
                    }
                    return candidate;
                });
            }
            
            return updatedReport;
        });

        const title = document.createElement('h3');
        title.className = 'graph-title';
        title.textContent = 'Reports the player made, by minute';
        
        
        const canvas = document.createElement('canvas');
        canvas.id = 'timeline-graph';
        const tooltip = document.createElement('div');
        tooltip.id = 'timeline-tooltip';
        tooltip.className = 'timeline-tooltip hidden';
        
        timelineGraphContainer.innerHTML = '';
        showGraphLoading();
        timelineGraphContainer.appendChild(title);
        timelineGraphContainer.appendChild(canvas);
        timelineGraphContainer.appendChild(tooltip);
        
        canvas.style.opacity = '0';
        canvas.style.visibility = 'hidden';
        title.style.opacity = '0';
        title.style.visibility = 'hidden';

        const ctx = canvas.getContext('2d');
        const T = LedgerUI.canvasTheme();
        const padding = { top: 60, right: 40, bottom: 60, left: 80 };
        const iconSize = 40;
        const iconSpacing = 5;
        
        const maxTime = Math.max(...reports.map(r => parseTimeToMinutes(r.Time)), 60);
        const timeRange = Math.max(maxTime, 60);

        const friendlyReports = reports.filter(r => r.Team === 'FRIENDLY');
        const enemyReports = reports.filter(r => r.Team === 'ENEMY');

        function groupReportsByTime(reportList) {
            const grouped = new Map();
            reportList.forEach(report => {
                const time = parseTimeToMinutes(report.Time);
                const timeKey = Math.floor(time * 60);
                if (!grouped.has(timeKey)) {
                    grouped.set(timeKey, []);
                }
                grouped.get(timeKey).push({ ...report, time });
            });
            return grouped;
        }

        const friendlyGroups = groupReportsByTime(friendlyReports);
        const enemyGroups = groupReportsByTime(enemyReports);
        
        const maxCandidatesPerReport = Math.max(...reports.map(r => (r.Candidates && r.Candidates.length > 0) ? r.Candidates.length : 1), 1);
        const maxReportsPerTimestamp = Math.max(
            ...Array.from(friendlyGroups.values()).map(g => g.length),
            ...Array.from(enemyGroups.values()).map(g => g.length),
            1
        );
        const maxStackHeight = maxReportsPerTimestamp * maxCandidatesPerReport * (iconSize + iconSpacing) + iconSpacing * 2;
        const teamRegionHeight = Math.max(120, maxStackHeight);
        const totalHeight = padding.top + teamRegionHeight * 2 + padding.bottom;
        
        const containerWidth = Math.max((timelineGraphContainer.clientWidth || 1200) - 2, 760);
        const devicePixelRatio = window.devicePixelRatio || 1;
        canvas.width = containerWidth * devicePixelRatio;
        canvas.height = totalHeight * devicePixelRatio;
        canvas.style.width = containerWidth + 'px';
        canvas.style.height = `${totalHeight}px`;
        ctx.scale(devicePixelRatio, devicePixelRatio);
        
        const graphWidth = containerWidth - padding.left - padding.right;
        const graphHeight = totalHeight - padding.top - padding.bottom;

        function getCircleCenter(pos) {
            return {
                x: pos.x,
                y: pos.y + iconSize / 2
            };
        }

        function getDistance(pos1, pos2) {
            const center1 = getCircleCenter(pos1);
            const center2 = getCircleCenter(pos2);
            const dx = center1.x - center2.x;
            const dy = center1.y - center2.y;
            return Math.sqrt(dx * dx + dy * dy);
        }

        function resolveOverlaps(positions, radius, minY, maxY) {
            const sorted = [...positions].sort((a, b) => {
                const xDiff = Math.abs(a.x - b.x);
                if (xDiff < 1) {
                    return a.y - b.y;
                }
                return a.x - b.x;
            });

            const xThreshold = radius * 1.5;
            const minSeparation = radius * 2 + iconSpacing;

            const groups = new Map();
            sorted.forEach((pos, idx) => {
                let foundGroup = false;
                for (const [groupX, group] of groups.entries()) {
                    if (Math.abs(pos.x - groupX) < xThreshold) {
                        group.push(idx);
                        foundGroup = true;
                        break;
                    }
                }
                if (!foundGroup) {
                    groups.set(pos.x, [idx]);
                }
            });

            groups.forEach((indices) => {
                indices.sort((a, b) => sorted[a].y - sorted[b].y);
                let currentY = minY + 10;
                indices.forEach(idx => {
                    sorted[idx].y = currentY;
                    const candidateCount = (sorted[idx].report.Candidates && sorted[idx].report.Candidates.length > 0) ? sorted[idx].report.Candidates.length : 1;
                    currentY += (iconSize + iconSpacing) * candidateCount;
                });
            });

            const maxIterations = 500;
            const damping = 0.9;
            const minForce = 0.1;

            for (let iter = 0; iter < maxIterations; iter++) {
                let totalMovement = 0;
                const forces = new Array(sorted.length).fill(0);

                for (let i = 0; i < sorted.length; i++) {
                    for (let j = i + 1; j < sorted.length; j++) {
                        const distance = getDistance(sorted[i], sorted[j]);
                        
                        if (distance < minSeparation) {
                            const center1 = getCircleCenter(sorted[i]);
                            const center2 = getCircleCenter(sorted[j]);
                            const dx = center1.x - center2.x;
                            const dy = center1.y - center2.y;
                            
                            if (distance > 0.001) {
                                const overlap = minSeparation - distance;
                                const force = (overlap / distance) * 1.5;
                                const forceY = (dy / distance) * force;
                                
                                forces[i] += forceY;
                                forces[j] -= forceY;
                            } else {
                                const pushY = (minSeparation / 2) + iconSpacing;
                                if (sorted[i].y < sorted[j].y) {
                                    forces[i] -= pushY;
                                    forces[j] += pushY;
                                } else {
                                    forces[i] += pushY;
                                    forces[j] -= pushY;
                                }
                            }
                        }
                    }
                }

                for (let i = 0; i < sorted.length; i++) {
                    if (Math.abs(forces[i]) > minForce) {
                        const newY = sorted[i].y + forces[i] * damping;
                        const clampedY = Math.max(minY, Math.min(maxY - iconSize, newY));
                        const movement = Math.abs(clampedY - sorted[i].y);
                        totalMovement += movement;
                        sorted[i].y = clampedY;
                    }
                }

                if (totalMovement < 0.01) break;
            }

            for (let i = 0; i < sorted.length; i++) {
                for (let j = i + 1; j < sorted.length; j++) {
                    const distance = getDistance(sorted[i], sorted[j]);
                    if (distance < minSeparation - 0.5) {
                        const center1 = getCircleCenter(sorted[i]);
                        const center2 = getCircleCenter(sorted[j]);
                        const dy = center1.y - center2.y;
                        const neededSeparation = minSeparation - distance;
                        
                        if (Math.abs(dy) < iconSize) {
                            if (sorted[i].y < sorted[j].y) {
                                sorted[i].y = Math.max(minY, sorted[i].y - neededSeparation / 2);
                                sorted[j].y = Math.min(maxY - iconSize, sorted[j].y + neededSeparation / 2);
                            } else {
                                sorted[j].y = Math.max(minY, sorted[j].y - neededSeparation / 2);
                                sorted[i].y = Math.min(maxY - iconSize, sorted[i].y + neededSeparation / 2);
                            }
                        }
                    }
                }
            }

            return sorted;
        }

        const prioritizedHues = [
            0,    // Red (primary)
            30,   // Orange (primary)
            60,   // Yellow (primary)
            120,  // Green (primary)
            180,  // Cyan (primary)
            240,  // Blue (primary)
            270,  // Violet (primary)
            300,  // Magenta (primary)
            15,   // Red-Orange (secondary)
            45,   // Orange-Yellow (secondary)
            90,   // Yellow-Green (secondary)
            150,  // Green-Cyan (secondary)
            210,  // Cyan-Blue (secondary)
            255,  // Blue-Violet (secondary)
            285,  // Violet-Magenta (secondary)
            315,  // Magenta-Red (secondary)
            7,    // Red-RedOrange (tertiary)
            22,   // RedOrange-Orange (tertiary)
            37,   // Orange-OrangeYellow (tertiary)
            52,   // OrangeYellow-Yellow (tertiary)
            75,   // Yellow-YellowGreen (tertiary)
            105,  // YellowGreen-Green (tertiary)
            135,  // Green-GreenCyan (tertiary)
            165,  // GreenCyan-Cyan (tertiary)
            195,  // Cyan-CyanBlue (tertiary)
            225,  // CyanBlue-Blue (tertiary)
            247,  // Blue-BlueViolet (tertiary)
            262,  // BlueViolet-Violet (tertiary)
            277,  // Violet-VioletMagenta (tertiary)
            292,  // VioletMagenta-Magenta (tertiary)
            307,  // Magenta-MagentaRed (tertiary)
            330,  // MagentaRed-Red (tertiary)
            345,  // Red-MagentaRed (tertiary)
            3,    // More fine shades
            11,
            18,
            26,
            33,
            41,
            48,
            56,
            67,
            82,
            97,
            112,
            127,
            142,
            157,
            172,
            187,
            202,
            217,
            232,
            243,
            250,
            258,
            265,
            272,
            279,
            286,
            293,
            310,
            320,
            335,
            350
        ];
        
        const usedHueIndices = new Set();
        const reportColors = new Map();
        
        function generateReportColor(report) {
            const seed = `${report.Time}_${report.Slot}_${report.SteamID}`;
            let hash = 0;
            for (let i = 0; i < seed.length; i++) {
                hash = ((hash << 5) - hash) + seed.charCodeAt(i);
                hash = hash & hash;
            }
            const preferredIndex = Math.abs(hash) % prioritizedHues.length;
            return preferredIndex;
        }
        
        reports.forEach(report => {
            const reportKey = `${report.Time}_${report.Slot}_${report.SteamID}`;
            if (!reportColors.has(reportKey)) {
                const preferredIndex = generateReportColor(report);
                let assignedIndex = preferredIndex;
                
                if (usedHueIndices.has(assignedIndex)) {
                    let foundUnused = false;
                    for (let i = 0; i < prioritizedHues.length; i++) {
                        const checkIndex = (assignedIndex + i) % prioritizedHues.length;
                        if (!usedHueIndices.has(checkIndex)) {
                            assignedIndex = checkIndex;
                            foundUnused = true;
                            break;
                        }
                    }
                    if (!foundUnused) {
                        usedHueIndices.clear();
                    }
                }
                
                usedHueIndices.add(assignedIndex);
                const hueValue = prioritizedHues[assignedIndex];
                const finalColor = `hsl(${hueValue}, 78%, 62%)`;
                reportColors.set(reportKey, finalColor);
            }
        });

        const iconPositions = [];
        const friendlyYByX = new Map();
        const enemyYByX = new Map();
        
        friendlyGroups.forEach((reportGroup) => {
            const reports = reportGroup.sort((a, b) => a.time - b.time);
            const time = reports[0].time;
            const x = padding.left + (time / timeRange) * graphWidth;
            
            let currentY = friendlyYByX.get(x) || padding.top + 10;
            
            reports.forEach((report) => {
                const candidateCount = (report.Candidates && report.Candidates.length > 0) ? report.Candidates.length : 1;
                iconPositions.push({ report, x, y: currentY, team: 'FRIENDLY' });
                currentY += (iconSize + iconSpacing) * candidateCount;
            });
            
            friendlyYByX.set(x, currentY);
        });
        
        enemyGroups.forEach((reportGroup) => {
            const reports = reportGroup.sort((a, b) => a.time - b.time);
            const time = reports[0].time;
            const x = padding.left + (time / timeRange) * graphWidth;
            
            let currentY = enemyYByX.get(x) || padding.top + teamRegionHeight + 10;
            
            reports.forEach((report) => {
                const candidateCount = (report.Candidates && report.Candidates.length > 0) ? report.Candidates.length : 1;
                iconPositions.push({ report, x, y: currentY, team: 'ENEMY' });
                currentY += (iconSize + iconSpacing) * candidateCount;
            });
            
            enemyYByX.set(x, currentY);
        });

        const friendlyPositions = iconPositions.filter(p => p.team === 'FRIENDLY');
        const enemyPositions = iconPositions.filter(p => p.team === 'ENEMY');
        
        const radius = iconSize / 2;
        const friendlyResolved = resolveOverlaps(friendlyPositions, radius, padding.top, padding.top + teamRegionHeight);
        const enemyResolved = resolveOverlaps(enemyPositions, radius, padding.top + teamRegionHeight, padding.top + teamRegionHeight * 2);
        
        iconPositions.length = 0;
        iconPositions.push(...friendlyResolved, ...enemyResolved);

        const imagesToLoad = new Set();
        iconPositions.forEach(pos => {
            if (pos.report.Candidates && pos.report.Candidates.length > 0) {
                pos.report.Candidates.forEach(candidate => {
                    const heroName = candidate.Hero ? candidate.Hero.trim() : '';
                    if (heroName && heroName.toLowerCase() !== 'unknown') {
                        const iconUrl = getHeroIconUrl(heroName);
                        if (iconUrl) imagesToLoad.add(iconUrl);
                    }
                });
            } else {
                const heroName = pos.report.TargetHero ? pos.report.TargetHero.trim() : '';
                if (heroName && heroName.toLowerCase() !== 'unknown') {
                    const iconUrl = getHeroIconUrl(heroName);
                    if (iconUrl) imagesToLoad.add(iconUrl);
                }
            }
        });

        const imageCache = new Map();
        let imagesLoaded = 0;
        const totalImages = imagesToLoad.size;

        function drawIcons() {
            ctx.clearRect(0, 0, containerWidth, totalHeight);
            ctx.fillStyle = T.bg;
            ctx.fillRect(0, 0, containerWidth, totalHeight);

            ctx.strokeStyle = T.line;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(padding.left, padding.top);
            ctx.lineTo(padding.left, totalHeight - padding.bottom);
            ctx.moveTo(padding.left, padding.top + teamRegionHeight);
            ctx.lineTo(containerWidth - padding.right, padding.top + teamRegionHeight);
            ctx.moveTo(padding.left, padding.top + teamRegionHeight * 2);
            ctx.lineTo(containerWidth - padding.right, padding.top + teamRegionHeight * 2);
            ctx.stroke();

            ctx.fillStyle = T.muted;
            ctx.font = '600 12px Manrope, system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillStyle = T.good;
            ctx.fillText(tr('Teammates'), padding.left + 8, padding.top - 20);
            ctx.fillStyle = T.bad;
            ctx.fillText(tr('Enemies'), padding.left + 8, padding.top + teamRegionHeight + 20);

            const numLabels = Math.min(20, Math.ceil(timeRange / 2));
            for (let i = 0; i <= numLabels; i++) {
                const time = (i * timeRange) / numLabels;
                const x = padding.left + (time / timeRange) * graphWidth;
                const minutes = Math.floor(time);
                const seconds = Math.floor((time - minutes) * 60);
                const timeLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                
                ctx.strokeStyle = T.grid;
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(x, padding.top);
                ctx.lineTo(x, totalHeight - padding.bottom);
                ctx.stroke();
                
                ctx.fillStyle = T.muted;
                ctx.font = '11px Manrope, system-ui, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(timeLabel, x, totalHeight - padding.bottom + 18);
            }

            iconPositions.forEach(({ report, x, y, team }) => {
                const candidates = report.Candidates && report.Candidates.length > 0 ? report.Candidates : null;
                const reportKey = `${report.Time}_${report.Slot}_${report.SteamID}`;
                const tintColor = reportColors.get(reportKey) || T.muted;
                
                if (candidates) {
                    const maxScore = Math.max(...candidates.map(c => c.Score));
                    const isCertain = candidates.length === 1;
                    
                    candidates.forEach((candidate, idx) => {
                        const heroNameRaw = candidate.Hero ? candidate.Hero.trim() : '';
                        const heroName = heroNameRaw && heroNameRaw.toLowerCase() !== 'unknown' ? heroNameRaw : null;
                        const iconUrl = heroName ? getHeroIconUrl(heroName) : null;
                        const img = iconUrl ? imageCache.get(iconUrl) : null;
                        
                        const positionBasedOpacity = [1.0, 0.5, 0.25];
                        const opacity = idx < positionBasedOpacity.length ? positionBasedOpacity[idx] : Math.max(0.2, 1.0 - (idx * 0.25));
                        const sizeScale = [1.0, 0.8, 0.6];
                        const scale = idx < sizeScale.length ? sizeScale[idx] : Math.max(0.4, 1.0 - (idx * 0.2));
                        const scaledIconSize = iconSize * scale;
                        const baseY = y + (idx * (iconSize + iconSpacing));
                        const borderY = baseY + iconSize / 2;
                        const iconCenterY = borderY;
                        const isSelected = idx === (report.SelectedCandidateIndex || 0) || isCertain;
                        
                        const borderRadius = scaledIconSize / 2;
                        const borderX = x;
                        
                        ctx.save();
                        ctx.globalAlpha = opacity;
                        
                        if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                            ctx.beginPath();
                            ctx.arc(borderX, iconCenterY, borderRadius, 0, Math.PI * 2);
                            ctx.clip();
                            ctx.drawImage(img, borderX - scaledIconSize / 2, iconCenterY - scaledIconSize / 2, scaledIconSize, scaledIconSize);
                        } else {
                            ctx.fillStyle = T.grid;
                            ctx.beginPath();
                            ctx.arc(borderX, iconCenterY, borderRadius, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.fillStyle = T.text;
                            ctx.font = `${10 * scale}px Manrope, system-ui, sans-serif`;
                            ctx.textAlign = 'center';
                            ctx.fillText(heroName ? heroName.substring(0, 3).toUpperCase() : '?', borderX, iconCenterY + 3 * scale);
                        }
                        
                        ctx.restore();
                        
                        ctx.save();
                        ctx.globalAlpha = 1.0;
                        ctx.globalCompositeOperation = 'source-over';
                        
                        if (isSelected) {
                            ctx.strokeStyle = T.bg;
                            ctx.lineWidth = 5;
                            ctx.lineCap = 'round';
                            ctx.lineJoin = 'round';
                            ctx.beginPath();
                            ctx.arc(borderX, iconCenterY, borderRadius, 0, Math.PI * 2);
                            ctx.stroke();
                            
                            ctx.strokeStyle = T.halo;
                            ctx.lineWidth = 3;
                            ctx.beginPath();
                            ctx.arc(borderX, iconCenterY, borderRadius, 0, Math.PI * 2);
                            ctx.stroke();
                            
                            ctx.strokeStyle = tintColor;
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.arc(borderX, iconCenterY, borderRadius, 0, Math.PI * 2);
                            ctx.stroke();
                        } else {
                            ctx.strokeStyle = T.bg;
                            ctx.lineWidth = 5;
                            ctx.lineCap = 'round';
                            ctx.lineJoin = 'round';
                            ctx.beginPath();
                            ctx.arc(borderX, iconCenterY, borderRadius, 0, Math.PI * 2);
                            ctx.stroke();
                            
                            ctx.strokeStyle = tintColor;
                            ctx.lineWidth = 3;
                            ctx.beginPath();
                            ctx.arc(borderX, iconCenterY, borderRadius, 0, Math.PI * 2);
                            ctx.stroke();
                        }
                        
                        ctx.restore();
                    });
                } else {
                    const heroName = (report.TargetHero && report.TargetHero.trim()) ? report.TargetHero : null;
                    const iconUrl = heroName ? getHeroIconUrl(heroName) : null;
                    const img = iconUrl ? imageCache.get(iconUrl) : null;
                    
                    if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(x, y + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
                        ctx.clip();
                        ctx.drawImage(img, x - iconSize / 2, y, iconSize, iconSize);
                        ctx.restore();
                    } else {
                        ctx.fillStyle = T.grid;
                        ctx.beginPath();
                        ctx.arc(x, y + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = T.text;
                        ctx.font = '10px Manrope, system-ui, sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText(heroName ? heroName.substring(0, 3).toUpperCase() : '?', x, y + iconSize / 2 + 3);
                    }
                    
                    ctx.strokeStyle = team === 'FRIENDLY' ? T.good : T.bad;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(x, y + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
                    ctx.stroke();
                }
            });
        }

        dbg('[GRAPH DEBUG] renderPlayerReportsGraph: Calling drawIcons()');
        drawIcons();

        function showGraph() {
            hideGraphLoading();
            requestAnimationFrame(() => {
                const canvas = timelineGraphContainer.querySelector('canvas');
                const title = timelineGraphContainer.querySelector('.graph-title');
                if (canvas) {
                    canvas.style.opacity = '1';
                    canvas.style.visibility = 'visible';
                    canvas.style.display = 'block';
                }
                if (title) {
                    title.style.opacity = '1';
                    title.style.visibility = 'visible';
                    title.style.display = 'block';
                }
            });
        }

        let pendingRedraw = false;
        function scheduleRedraw() {
            if (!pendingRedraw) {
                pendingRedraw = true;
                requestAnimationFrame(() => {
                    drawIcons();
                    pendingRedraw = false;
                });
            }
        }

        showGraph();

        dbg('[GRAPH DEBUG] Total images to load:', totalImages);
        if (totalImages > 0) {
            imagesToLoad.forEach(iconUrl => {
                const img = new Image();
                img.onload = () => {
                    imageCache.set(iconUrl, img);
                    imagesLoaded++;
                    scheduleRedraw();
                };
                img.onerror = () => {
                    imagesLoaded++;
                };
                img.src = iconUrl;
            });
        }

        canvas.addEventListener('click', () => openSteamProfile(canvas.__steamId));
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = rect.width / containerWidth;
            const scaleY = rect.height / totalHeight;
            const x = (e.clientX - rect.left) / scaleX;
            const y = (e.clientY - rect.top) / scaleY;
            
            const iconRadius = iconSize / 2;
            let hoveredIcon = null;
            let hoveredCandidateIndex = -1;
            
            for (const pos of iconPositions) {
                const candidates = pos.report.Candidates && pos.report.Candidates.length > 0 ? pos.report.Candidates : null;
                
                if (candidates) {
                    for (let idx = 0; idx < candidates.length; idx++) {
                        const candidateY = pos.y + (idx * (iconSize + iconSpacing));
                        const centerX = pos.x;
                        const centerY = candidateY + iconSize / 2;
                        const dx = x - centerX;
                        const dy = y - centerY;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance <= iconRadius) {
                            hoveredIcon = pos;
                            hoveredCandidateIndex = idx;
                            break;
                        }
                    }
                    if (hoveredIcon) break;
                } else {
                    const centerX = pos.x;
                    const centerY = pos.y + iconSize / 2;
                    const dx = x - centerX;
                    const dy = y - centerY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance <= iconRadius) {
                        hoveredIcon = pos;
                        break;
                    }
                }
            }
            
            {
                const cands = hoveredIcon && hoveredIcon.report.Candidates && hoveredIcon.report.Candidates.length ? hoveredIcon.report.Candidates : null;
                const pick = hoveredIcon ? (cands ? cands[Math.max(0, hoveredCandidateIndex)] : null) : null;
                canvas.__steamId = hoveredIcon ? iconPlayer(hoveredIcon.report, pick).id : '';
                canvas.__steamLines = hoveredIcon ? playerLines(iconPlayer(hoveredIcon.report, pick)) : '';
                canvas.style.cursor = canvas.__steamId ? 'pointer' : '';
            }
            if (hoveredIcon) {
                const timestamp = hoveredIcon.report.Time;
                const candidates = hoveredIcon.report.Candidates && hoveredIcon.report.Candidates.length > 0 ? hoveredIcon.report.Candidates : null;
                
                if (candidates) {
                    const maxScore = Math.max(...candidates.map(c => c.Score));
                    const candidateLines = candidates.map((cand, idx) => {
                        const heroNameRaw = cand.Hero ? cand.Hero.trim() : '';
                        const heroName = heroNameRaw && heroNameRaw.toLowerCase() !== 'unknown' ? heroNameRaw : 'Unknown Hero';
                        const isSelected = idx === (hoveredIcon.report.SelectedCandidateIndex || 0) || candidates.length === 1;
                        const scorePercent = maxScore > 0 ? ((cand.Score / maxScore) * 100).toFixed(1) : '0.0';
                        const marker = isSelected ? '★' : ' ';
                        return `${marker} ${heroName}: ${cand.Score.toFixed(2)} (${scorePercent}%)`;
                    }).join('\n');
                    tooltip.textContent = `${timestamp}\n${candidateLines}` + canvas.__steamLines;
                } else {
                    const heroNameRaw = hoveredIcon.report.TargetHero ? hoveredIcon.report.TargetHero.trim() : '';
                    const heroName = heroNameRaw && heroNameRaw.toLowerCase() !== 'unknown' ? heroNameRaw : 'Unknown Hero';
                    tooltip.textContent = `${heroName}: ${timestamp}` + canvas.__steamLines;
                }
                tooltip.style.visibility = 'hidden';
                tooltip.classList.remove('hidden');
                
                const tooltipRect = tooltip.getBoundingClientRect();
                let left = e.clientX + 15;
                let top = e.clientY - tooltipRect.height - 10;
                
                if (left + tooltipRect.width > window.innerWidth - 10) {
                    left = e.clientX - tooltipRect.width - 15;
                }
                if (top < 10) {
                    top = e.clientY + 15;
                }
                
                tooltip.style.left = `${left}px`;
                tooltip.style.top = `${top}px`;
                tooltip.style.visibility = 'visible';
            } else {
                tooltip.classList.add('hidden');
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
            tooltip.classList.add('hidden');
        });
        } catch (error) {
            console.error('Error rendering player reports graph:', error);
            timelineGraphContainer.innerHTML = '<p class="graph-empty bad">Error rendering graph. Please try again.</p>';
            hideGraphLoading();
        }
    }

    function renderScoreboardActivityGraph(matchData, playerFilter = null) {
        if (!matchData || !matchData.scoreboardActivities || matchData.scoreboardActivities.length === 0) {
            timelineGraphContainer.innerHTML = '<p class="graph-empty">No scoreboard activity found for this match.</p>';
            hideGraphLoading();
            return;
        }

        let activities = matchData.scoreboardActivities;
        if (playerFilter) {
            if (playerFilter.startsWith('slot_')) {
                const targetSlot = parseInt(playerFilter.replace('slot_', ''));
                activities = activities.filter(a => a.Slot === targetSlot);
            } else if (playerFilter.startsWith('steamid_')) {
                const targetSteamID = playerFilter.replace('steamid_', '');
                activities = activities.filter(a => String(a.SteamID) === targetSteamID);
            }
        }

        if (activities.length === 0) {
            timelineGraphContainer.innerHTML = '<p class="graph-empty">No scoreboard activity found for the selected player.</p>';
            hideGraphLoading();
            return;
        }

        const title = document.createElement('h3');
        title.className = 'graph-title';
        title.textContent = 'Scoreboard Activity';
        
        
        const canvas = document.createElement('canvas');
        canvas.id = 'timeline-graph';
        const tooltip = document.createElement('div');
        tooltip.id = 'timeline-tooltip';
        tooltip.className = 'timeline-tooltip hidden';
        
        timelineGraphContainer.innerHTML = '';
        showGraphLoading();
        timelineGraphContainer.appendChild(title);
        timelineGraphContainer.appendChild(canvas);
        timelineGraphContainer.appendChild(tooltip);
        
        canvas.style.opacity = '0';
        canvas.style.visibility = 'hidden';
        title.style.opacity = '0';
        title.style.visibility = 'hidden';

        const ctx = canvas.getContext('2d');
        const T = LedgerUI.canvasTheme();
        const padding = { top: 40, right: 40, bottom: 60, left: 200 };
        const rowHeight = 50;
        const rowSpacing = 10;
        const totalRows = activities.length;
        const totalHeight = padding.top + (rowHeight + rowSpacing) * totalRows + padding.bottom;

        const containerWidth = Math.max((timelineGraphContainer.clientWidth || 1200) - 2, 760);
        const devicePixelRatio = window.devicePixelRatio || 1;
        canvas.width = containerWidth * devicePixelRatio;
        canvas.height = totalHeight * devicePixelRatio;
        canvas.style.width = containerWidth + 'px';
        canvas.style.height = `${totalHeight}px`;
        ctx.scale(devicePixelRatio, devicePixelRatio);

        const graphWidth = containerWidth - padding.left - padding.right;
        const graphHeight = totalHeight - padding.top - padding.bottom;

        let maxTime = 60;
        activities.forEach(activity => {
            activity.TimeRanges.forEach(range => {
                const endTime = parseTimeToMinutes(range.End);
                if (endTime > maxTime) maxTime = endTime;
            });
        });
        const timeRange = Math.max(maxTime, 60);

        ctx.clearRect(0, 0, containerWidth, totalHeight);
        ctx.fillStyle = T.bg;
        ctx.fillRect(0, 0, containerWidth, totalHeight);

        ctx.strokeStyle = T.line;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(padding.left, totalHeight - padding.bottom);
        ctx.moveTo(padding.left, padding.top);
        ctx.lineTo(containerWidth - padding.right, padding.top);
        ctx.stroke();

        const numLabels = Math.min(10, Math.ceil(timeRange / 5));
        for (let i = 0; i <= numLabels; i++) {
            const time = (i * timeRange) / numLabels;
            const x = padding.left + (time / timeRange) * graphWidth;
            const minutes = Math.floor(time);
            const seconds = Math.floor((time - minutes) * 60);
            const timeLabel = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

            ctx.strokeStyle = T.grid;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, padding.top);
            ctx.lineTo(x, totalHeight - padding.bottom);
            ctx.stroke();

            ctx.fillStyle = T.muted;
            ctx.font = '9px Manrope, system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(timeLabel, x, totalHeight - padding.bottom + 16);
        }

        const imagesToLoad = new Set();
        activities.forEach(activity => {
            if (activity.Hero) {
                const iconUrl = getHeroIconUrl(activity.Hero);
                if (iconUrl) imagesToLoad.add(iconUrl);
            }
        });

        const imageCache = new Map();
        let imagesLoaded = 0;
        const totalImages = imagesToLoad.size;

        function drawBars() {
            activities.forEach((activity, index) => {
                const y = padding.top + index * (rowHeight + rowSpacing);
                const playerColor = getSlotColor(activity.Slot);
                const teamLabel = activity.Team === 2 ? 'Radiant' : 'Dire';

                ctx.fillStyle = T.row;
                ctx.fillRect(padding.left, y, graphWidth, rowHeight);

                ctx.strokeStyle = T.line;
                ctx.lineWidth = 1;
                ctx.strokeRect(padding.left, y, graphWidth, rowHeight);

                activity.TimeRanges.forEach(range => {
                    const startTime = parseTimeToMinutes(range.Start);
                    const endTime = parseTimeToMinutes(range.End);
                    const startX = padding.left + (startTime / timeRange) * graphWidth;
                    const endX = padding.left + (endTime / timeRange) * graphWidth;
                    const barWidth = endX - startX;

                    ctx.fillStyle = playerColor;
                    ctx.globalAlpha = 0.6;
                    ctx.fillRect(startX, y + 5, barWidth, rowHeight - 10);
                    ctx.globalAlpha = 1.0;

                    ctx.strokeStyle = playerColor;
                    ctx.lineWidth = 2;
                    ctx.strokeRect(startX, y + 5, barWidth, rowHeight - 10);
                });

                ctx.fillStyle = T.text;
                ctx.font = '12px Manrope, system-ui, sans-serif';
                ctx.textAlign = 'left';
                const playerName = activity.Name || `Slot ${activity.Slot}`;
                ctx.fillText(playerName, 10, y + rowHeight / 2 + 4);

                ctx.fillStyle = T.faint;
                ctx.font = '10px Manrope, system-ui, sans-serif';
                ctx.fillText(teamLabel, 10, y + rowHeight - 5);

                if (activity.Hero) {
                    const iconUrl = getHeroIconUrl(activity.Hero);
                    const img = iconUrl ? imageCache.get(iconUrl) : null;
                    const iconSize = 32;
                    const iconX = padding.left - iconSize - 10;
                    const iconY = y + (rowHeight - iconSize) / 2;

                    if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
                        ctx.clip();
                        ctx.drawImage(img, iconX, iconY, iconSize, iconSize);
                        ctx.restore();
                    } else {
                        ctx.fillStyle = T.grid;
                        ctx.beginPath();
                        ctx.arc(iconX + iconSize / 2, iconY + iconSize / 2, iconSize / 2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.fillStyle = T.text;
                        ctx.font = '9px Manrope, system-ui, sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText(activity.Hero ? activity.Hero.substring(0, 3).toUpperCase() : '?', iconX + iconSize / 2, iconY + iconSize / 2 + 3);
                    }
                }
            });
        }

        drawBars();

        function showScoreboardGraphWhenReady() {
            hideGraphLoading();
            requestAnimationFrame(() => {
                const canvas = timelineGraphContainer.querySelector('canvas');
                const title = timelineGraphContainer.querySelector('.graph-title');
                if (canvas) {
                    canvas.style.opacity = '1';
                    canvas.style.visibility = 'visible';
                    canvas.style.display = 'block';
                }
                if (title) {
                    title.style.opacity = '1';
                    title.style.visibility = 'visible';
                    title.style.display = 'block';
                }
            });
        }

        if (totalImages > 0) {
            imagesToLoad.forEach(iconUrl => {
                const img = new Image();
                img.onload = () => {
                    imageCache.set(iconUrl, img);
                    imagesLoaded++;
                    if (imagesLoaded === totalImages) {
                        drawBars();
                        showScoreboardGraphWhenReady();
                    } else if (imagesLoaded % 3 === 0) {
                        drawBars();
                    }
                };
                img.onerror = () => {
                    imagesLoaded++;
                    if (imagesLoaded === totalImages) {
                        drawBars();
                        showScoreboardGraphWhenReady();
                    }
                };
                img.src = iconUrl;
            });
        } else {
            showScoreboardGraphWhenReady();
        }

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = rect.width / containerWidth;
            const scaleY = rect.height / totalHeight;
            const x = (e.clientX - rect.left) / scaleX;
            const y = (e.clientY - rect.top) / scaleY;

            let hoveredActivity = null;
            let hoveredRange = null;
            let closestDistance = Infinity;

            activities.forEach((activity, index) => {
                const rowY = padding.top + index * (rowHeight + rowSpacing);
                const rowBottom = rowY + rowHeight;
                const verticalTolerance = rowHeight * 0.5;
                
                if (y >= rowY - verticalTolerance && y <= rowBottom + verticalTolerance && x >= padding.left && x <= padding.left + graphWidth) {
                    activity.TimeRanges.forEach(range => {
                        const startTime = parseTimeToMinutes(range.Start);
                        const endTime = parseTimeToMinutes(range.End);
                        const startX = padding.left + (startTime / timeRange) * graphWidth;
                        const endX = padding.left + (endTime / timeRange) * graphWidth;
                        const barWidth = endX - startX;
                        
                        const horizontalTolerance = Math.max(10, barWidth * 0.3);
                        const expandedStartX = startX - horizontalTolerance;
                        const expandedEndX = endX + horizontalTolerance;
                        
                        if (x >= expandedStartX && x <= expandedEndX) {
                            const centerX = (startX + endX) / 2;
                            const distance = Math.abs(x - centerX);
                            
                            if (distance < closestDistance) {
                                closestDistance = distance;
                                hoveredActivity = activity;
                                hoveredRange = range;
                            }
                        }
                    });
                }
            });

            if (hoveredActivity && hoveredRange) {
                const playerName = hoveredActivity.Name || `Slot ${hoveredActivity.Slot}`;
                tooltip.textContent = `${playerName}: ${hoveredRange.Start} - ${hoveredRange.End}`;
                tooltip.style.visibility = 'hidden';
                tooltip.classList.remove('hidden');

                const tooltipRect = tooltip.getBoundingClientRect();
                let left = e.clientX + 15;
                let top = e.clientY - tooltipRect.height - 10;

                if (left + tooltipRect.width > window.innerWidth - 10) {
                    left = e.clientX - tooltipRect.width - 15;
                }
                if (top < 10) {
                    top = e.clientY + 15;
                }

                tooltip.style.left = `${left}px`;
                tooltip.style.top = `${top}px`;
                tooltip.style.visibility = 'visible';
            } else {
                tooltip.classList.add('hidden');
            }
        });

        canvas.addEventListener('mouseleave', () => {
            tooltip.classList.add('hidden');
        });
    }

    // Player names come straight from the replay, so everything here is escaped.
    function playerOptionHtml(option, withChevron) {
        const iconUrl = option.hero ? getHeroIconUrl(option.hero) : null;
        const color = getSlotColor(option.slot);
        let html = '';
        if (iconUrl) html += `<img src="${esc(iconUrl)}" alt="" class="player-selector-icon" loading="lazy">`;
        else if (option.key) html += `<span class="player-selector-icon blank" style="--slot:${esc(color)}"></span>`;
        html += `<span class="player-selector-name" style="color: ${esc(color)}">${esc(option.name)}</span>`;
        if (option.hero) html += `<span class="player-selector-hero">${esc(option.hero)}</span>`;
        if (option.reportCount > 0) html += `<span class="player-selector-count">${esc(option.reportCount)} report${option.reportCount !== 1 ? 's' : ''}</span>`;
        if (withChevron) html += '<span class="select-chevron" aria-hidden="true"></span>';
        return html;
    }

    function renderPlayerSelector() {
        playerSelectorDropdown.innerHTML = '';
        
        playerSelectorOptions.forEach(option => {
            const optionEl = document.createElement('div');
            optionEl.className = 'custom-select-option';
            optionEl.dataset.key = option.key;
            
            if (option.key === currentSelectedPlayer || (!option.key && !currentSelectedPlayer)) optionEl.classList.add('selected');
            optionEl.innerHTML = playerOptionHtml(option, false);
            optionEl.addEventListener('click', () => {
                selectPlayerOption(option.key);
                playerSelectorDropdown.classList.add('hidden');
            });
            playerSelectorDropdown.appendChild(optionEl);
        });
    }

    function selectPlayerOption(key) {
        dbg(`[FRONTEND] selectPlayerOption called with key: "${key}"`);
        currentSelectedPlayer = key || null;
        const option = playerSelectorOptions.find(o => o.key === key);
        
        if (option && analysisSteamID) {
            const optionSteamID = option.steamID ? String(option.steamID) : null;
            if (optionSteamID && steamIDsMatch(optionSteamID, analysisSteamID)) {
                const steamIDFilter = `steamid_${analysisSteamID}`;
                const yourAccountOption = playerSelectorOptions.find(opt => opt.key === steamIDFilter);
                if (yourAccountOption && yourAccountOption.name !== option.name) {
                    yourAccountOption.name = option.name;
                    yourAccountOption.hero = option.hero;
                    yourAccountOption.slot = option.slot;
                    yourAccountOption.team = option.team;
                    renderPlayerSelector();
                }
            }
        }
        
        if (option) {
            dbg(`[FRONTEND] Found option for key "${key}":`, { slot: option.slot, name: option.name, reportCount: option.reportCount });
            playerSelectorDisplay.innerHTML = playerOptionHtml(option, true);
            playerSelectorDropdown.querySelectorAll('.custom-select-option').forEach(el => el.classList.toggle('selected', el.dataset.key === (option.key || '')));
        } else {
            playerSelectorDisplay.innerHTML = '<span class="select-placeholder">Select a player...</span><span class="select-chevron" aria-hidden="true"></span>';
        }
        
        const matchIndex = parseInt(matchSelector.value);
        dbg(`[FRONTEND] Rendering graph with matchIndex: ${matchIndex}, playerFilter: "${currentSelectedPlayer}", currentGraphView: "${currentGraphView}"`);
        if (matchIndex >= 0 && matchIndex < allMatchData.length) {
            renderCurrentGraph(allMatchData[matchIndex], currentSelectedPlayer);
            updateGraphsForPlayer(currentSelectedPlayer);
        }
    }

    playerSelectorDisplay.addEventListener('click', (e) => {
        e.stopPropagation();
        playerSelectorDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!playerSelectorContainer.contains(e.target)) {
            playerSelectorDropdown.classList.add('hidden');
        }
    });

    graphViewTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const newView = tab.dataset.view;
            if (newView === currentGraphView) return;
            
            const canvas = timelineGraphContainer.querySelector('canvas');
            const title = timelineGraphContainer.querySelector('.graph-title');
            if (canvas) canvas.style.opacity = '0';
            if (title) title.style.opacity = '0';
            showGraphLoading();
            
            currentGraphView = newView;
            updateGraphViewTabs();
            
            const matchIndex = parseInt(matchSelector.value);
            if (matchIndex >= 0 && matchIndex < allMatchData.length) {
                populatePlayerSelector(allMatchData[matchIndex]).then(() => {
                    if (currentSelectedPlayer) {
                        selectPlayerOption(currentSelectedPlayer);
                    } else if (analysisSteamID) {
                        const steamIDFilter = `steamid_${analysisSteamID}`;
                        const matchingOption = playerSelectorOptions.find(opt => opt.key === steamIDFilter);
                        if (!matchingOption) {
                            playerSelectorOptions.push({
                                key: steamIDFilter,
                                name: 'Your Account',
                                hero: '',
                                team: null,
                                reportCount: 0,
                                slot: null,
                                steamID: String(analysisSteamID)
                            });
                        }
                        currentSelectedPlayer = steamIDFilter;
                        selectPlayerOption(steamIDFilter);
                    } else {
                        renderCurrentGraph(allMatchData[matchIndex], currentSelectedPlayer);
                    }
                });
            }
        });
    });
    
    updateGraphViewTabs();

    // Canvases are drawn at a fixed pixel size: redraw when the space or the theme changes.
    let lastGraphWidth = 0, resizeTimer = null;
    function redrawGraph(force) {
        const tab = document.getElementById('results-tab');
        const i = parseInt(matchSelector.value);
        if (!tab || !tab.classList.contains('active') || !(i >= 0 && i < allMatchData.length)) return;
        const w = timelineGraphContainer.clientWidth;
        if (!force && Math.abs(w - lastGraphWidth) < 24) return;
        lastGraphWidth = w;
        renderCurrentGraph(allMatchData[i], currentSelectedPlayer);
    }
    window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => redrawGraph(false), 220); });
    document.addEventListener('ledger:theme', () => {
        redrawGraph(true);
        if (allMatchData.length) { try { updateGraphsForPlayer(currentSelectedPlayer); } catch (_) {} }
    });
    const resultsTabBtn = document.querySelector('.workflow-tab[data-tab="results"]');
    if (resultsTabBtn) resultsTabBtn.addEventListener('click', () => requestAnimationFrame(() => redrawGraph(false)));

    matchSelector.addEventListener('change', (e) => {
        const index = parseInt(e.target.value);
        if (index >= 0 && index < allMatchData.length) {
            populatePlayerSelector(allMatchData[index]).then(() => {
                let steamIDToMatch = null;
                let playerToSelect = null;
                
                if (analysisSteamID) {
                    steamIDToMatch = String(analysisSteamID);
                    dbg('[MatchSelector] Using analysisSteamID:', steamIDToMatch);
                } else {
                    const selectedProfile = getSelectedProfile();
                    if (selectedProfile && selectedProfile.id) {
                        steamIDToMatch = convertSteamIDTo64(String(selectedProfile.id));
                        dbg('[MatchSelector] Using profile SteamID (converted):', steamIDToMatch);
                    }
                }
                
                if (steamIDToMatch) {
                    dbg('[MatchSelector] Looking for Steam ID:', steamIDToMatch);
                    dbg('[MatchSelector] Available players:', playerSelectorOptions.map(opt => ({ key: opt.key, steamID: String(opt.steamID), name: opt.name, slot: opt.slot })));
                    
                    const matchingPlayer = playerSelectorOptions.find(opt => {
                        if (!opt.steamID) return false;
                        return steamIDsMatch(opt.steamID, steamIDToMatch);
                    });
                    
                    if (matchingPlayer) {
                        dbg('[MatchSelector] Found matching player, selecting:', matchingPlayer.key, matchingPlayer.name);
                        playerToSelect = matchingPlayer.key;
                    } else {
                        dbg('[MatchSelector] No matching player found for Steam ID:', steamIDToMatch);
                        dbg('[MatchSelector] Player SteamIDs:', playerSelectorOptions.map(opt => ({ name: opt.name, steamID: String(opt.steamID || 'null'), slot: opt.slot })));
                    }
                }
                
                if (playerToSelect) {
                    currentSelectedPlayer = playerToSelect;
                    selectPlayerOption(playerToSelect);
                    
                    if (analysisSteamID) {
                        const selectedOption = playerSelectorOptions.find(opt => opt.key === playerToSelect);
                        if (selectedOption && selectedOption.steamID && steamIDsMatch(selectedOption.steamID, analysisSteamID)) {
                            const steamIDFilter = `steamid_${analysisSteamID}`;
                            let yourAccountOption = playerSelectorOptions.find(opt => opt.key === steamIDFilter);
                            if (!yourAccountOption) {
                                yourAccountOption = {
                                    key: steamIDFilter,
                                    name: selectedOption.name,
                                    hero: selectedOption.hero,
                                    team: selectedOption.team,
                                    reportCount: selectedOption.reportCount,
                                    slot: selectedOption.slot,
                                    steamID: String(analysisSteamID)
                                };
                                playerSelectorOptions.push(yourAccountOption);
                                renderPlayerSelector();
                            } else if (yourAccountOption.name !== selectedOption.name) {
                                yourAccountOption.name = selectedOption.name;
                                yourAccountOption.hero = selectedOption.hero;
                                yourAccountOption.slot = selectedOption.slot;
                                yourAccountOption.team = selectedOption.team;
                                renderPlayerSelector();
                            }
                        }
                    }
                } else if (currentSelectedPlayer) {
                    const stillExists = playerSelectorOptions.find(opt => opt.key === currentSelectedPlayer);
                    if (stillExists) {
                        dbg('[MatchSelector] Keeping current selection:', currentSelectedPlayer);
                        selectPlayerOption(currentSelectedPlayer);
                    } else {
                        if (analysisSteamID) {
                            const steamIDFilter = `steamid_${analysisSteamID}`;
                            const matchingPlayer = playerSelectorOptions.find(opt => opt.steamID && steamIDsMatch(opt.steamID, analysisSteamID));
                            if (matchingPlayer) {
                                dbg('[MatchSelector] Found matching player for analysisSteamID, selecting:', matchingPlayer.key);
                                currentSelectedPlayer = matchingPlayer.key;
                                selectPlayerOption(matchingPlayer.key);
                            } else {
                            dbg('[MatchSelector] Current selection not found, using SteamID filter:', steamIDFilter);
                            currentSelectedPlayer = steamIDFilter;
                            const matchingOption = playerSelectorOptions.find(opt => opt.key === steamIDFilter);
                            if (!matchingOption) {
                                playerSelectorOptions.push({
                                    key: steamIDFilter,
                                    name: 'Your Account',
                                    hero: '',
                                    team: null,
                                    reportCount: 0,
                                    slot: null,
                                    steamID: String(analysisSteamID)
                                });
                                    renderPlayerSelector();
                            }
                            selectPlayerOption(steamIDFilter);
                            }
                        } else {
                            dbg('[MatchSelector] Current selection not found in new match, showing all players');
                            currentSelectedPlayer = null;
                            renderCurrentGraph(allMatchData[index], null);
                            updateGraphsForPlayer(null);
                        }
                    }
                } else {
                    if (analysisSteamID) {
                        const matchingPlayer = playerSelectorOptions.find(opt => opt.steamID && steamIDsMatch(opt.steamID, analysisSteamID));
                        if (matchingPlayer) {
                            dbg('[MatchSelector] Found matching player for analysisSteamID, selecting:', matchingPlayer.key);
                            currentSelectedPlayer = matchingPlayer.key;
                            selectPlayerOption(matchingPlayer.key);
                        } else {
                        const steamIDFilter = `steamid_${analysisSteamID}`;
                        dbg('[MatchSelector] No player to select but analysisSteamID exists, using SteamID filter:', steamIDFilter);
                        currentSelectedPlayer = steamIDFilter;
                        const matchingOption = playerSelectorOptions.find(opt => opt.key === steamIDFilter);
                        if (!matchingOption) {
                            playerSelectorOptions.push({
                                key: steamIDFilter,
                                name: 'Your Account',
                                hero: '',
                                team: null,
                                reportCount: 0,
                                slot: null,
                                steamID: String(analysisSteamID)
                            });
                                renderPlayerSelector();
                        }
                        selectPlayerOption(steamIDFilter);
                        }
                    } else {
                        dbg('[MatchSelector] No player to select, showing all players');
                        currentSelectedPlayer = null;
                        renderCurrentGraph(allMatchData[index], null);
                        updateGraphsForPlayer(null);
                    }
                }
            });
        }
    });


    let chartInstances = [];

    function filterDataByPlayer(matchData, playerFilter) {
        if (!playerFilter) return matchData;
        
        const filteredMatchData = matchData.map(match => {
            let filteredReports = match.reports || [];
            let effectiveFilter = playerFilter;
            
            if (playerFilter.startsWith('steamid_') && match.players) {
                const targetSteamID = String(playerFilter.replace('steamid_', '')).trim();
                const targetSteamIDNum = BigInt(targetSteamID);
                const STEAMID64_IDENTIFIER = BigInt('76561197960265728');
                const targetAccountID = targetSteamIDNum - STEAMID64_IDENTIFIER;
                const targetPlayer = match.players.find(p => p.SteamID && String(p.SteamID).trim() === targetSteamID);
                let foundPlayer = targetPlayer;
                if (!foundPlayer) {
                    const normalizedTarget = normalizeSteamIDForComparison(targetSteamID);
                    foundPlayer = match.players.find(p => p.SteamID && steamIDsMatch(p.SteamID, targetSteamID));
                    if (!foundPlayer) {
                        const targetNum = BigInt(targetSteamID);
                        let closestPlayer = null;
                        let minDiff = BigInt(1000);
                        match.players.forEach(p => {
                            if (p.SteamID) {
                                const playerNum = BigInt(String(p.SteamID));
                                const diff = targetNum > playerNum ? targetNum - playerNum : playerNum - targetNum;
                                if (diff < minDiff) {
                                    minDiff = diff;
                                    closestPlayer = p;
                                }
                            }
                        });
                        if (closestPlayer && minDiff <= BigInt(10)) {
                            foundPlayer = closestPlayer;
                            const actualSteamID = String(closestPlayer.SteamID);
                            if (actualSteamID !== targetSteamID) {
                                dbg('[filterDataByPlayer] Correcting SteamID from', targetSteamID, 'to', actualSteamID, 'based on match.players (diff:', minDiff.toString(), ')');
                                if (analysisSteamID === targetSteamID) {
                                    analysisSteamID = actualSteamID;
                                }
                                const playerOption = playerSelectorOptions.find(opt => opt.key === playerFilter);
                                if (playerOption) {
                                    playerOption.steamID = actualSteamID;
                                    const newKey = `steamid_${actualSteamID}`;
                                    if (playerOption.key !== newKey) {
                                        playerOption.key = newKey;
                                        if (currentSelectedPlayer === playerFilter) {
                                            currentSelectedPlayer = newKey;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                if (foundPlayer && foundPlayer.Slot != null && foundPlayer.Slot >= 0 && foundPlayer.Slot < 10) {
                    dbg(`[filterDataByPlayer] Found player by SteamID ${targetSteamID}, using slot ${foundPlayer.Slot} for filtering`);
                    const playerOption = playerSelectorOptions.find(opt => opt.key === playerFilter);
                    if (playerOption && (!playerOption.slot || playerOption.slot !== foundPlayer.Slot)) {
                        playerOption.slot = foundPlayer.Slot;
                        renderPlayerSelector();
                    }
                    effectiveFilter = `slot_${foundPlayer.Slot}`;
                } else {
                    const playerOption = playerSelectorOptions.find(opt => opt.key === playerFilter);
                    if (playerOption && playerOption.slot != null && playerOption.slot >= 0 && playerOption.slot < 10) {
                        dbg(`[filterDataByPlayer] Using slot ${playerOption.slot} from playerSelectorOptions for filter ${playerFilter}`);
                        effectiveFilter = `slot_${playerOption.slot}`;
                    } else {
                        let reportWithSlot = filteredReports.find(r => r.TargetSteamID && steamIDsMatch(r.TargetSteamID, targetSteamID) && r.TargetSlot != null && r.TargetSlot >= 0 && r.TargetSlot < 10);
                        if (!reportWithSlot && match.players) {
                            const normalizedTarget = normalizeSteamIDForComparison(targetSteamID);
                            for (const player of match.players) {
                                if (player.SteamID && player.Slot != null && player.Slot >= 0 && player.Slot < 10) {
                                    const playerSteamID = normalizeSteamIDForComparison(String(player.SteamID));
                                    if (playerSteamID && normalizedTarget && playerSteamID === normalizedTarget) {
                                        if (playerOption) {
                                            playerOption.slot = player.Slot;
                                            renderPlayerSelector();
                                        }
                                        effectiveFilter = `slot_${player.Slot}`;
                                        break;
                                    }
                                }
                            }
                        }
                        if (!effectiveFilter.startsWith('slot_')) {
                            if (reportWithSlot) {
                                dbg(`[filterDataByPlayer] Found slot ${reportWithSlot.TargetSlot} from reports for SteamID ${targetSteamID}`);
                                if (playerOption) {
                                    playerOption.slot = reportWithSlot.TargetSlot;
                                    renderPlayerSelector();
                                }
                                effectiveFilter = `slot_${reportWithSlot.TargetSlot}`;
                            }
                        }
                    }
                }
            }
            
            if (effectiveFilter.startsWith('steamid_') && !effectiveFilter.startsWith('slot_')) {
                const targetSteamID = String(effectiveFilter.replace('steamid_', '')).trim();
                const normalizedTarget = normalizeSteamIDForComparison(targetSteamID);
                const slotCounts = new Map();
                let checkedReports = 0;
                let matchedReports = 0;
                const targetNum = BigInt(targetSteamID);
                filteredReports.forEach(r => {
                    if (r.TargetSteamID && r.TargetSlot != null && r.TargetSlot >= 0 && r.TargetSlot < 10) {
                        checkedReports++;
                        const reportSteamID = normalizeSteamIDForComparison(String(r.TargetSteamID));
                        let matches = false;
                        if (reportSteamID && normalizedTarget && reportSteamID === normalizedTarget) {
                            matches = true;
                        } else {
                            try {
                                const reportNum = BigInt(String(r.TargetSteamID));
                                const diff = targetNum > reportNum ? targetNum - reportNum : reportNum - targetNum;
                                if (diff <= BigInt(10)) {
                                    matches = true;
                                }
                            } catch (e) {
                            }
                        }
                        if (matches) {
                            matchedReports++;
                            slotCounts.set(r.TargetSlot, (slotCounts.get(r.TargetSlot) || 0) + 1);
                        }
                    }
                });
                if (slotCounts.size > 0) {
                    let maxCount = 0;
                    let targetSlot = null;
                    slotCounts.forEach((count, slot) => {
                        if (count > maxCount) {
                            maxCount = count;
                            targetSlot = slot;
                        }
                    });
                    if (targetSlot != null) {
                        const playerOption = playerSelectorOptions.find(opt => opt.key === playerFilter);
                        if (playerOption && (!playerOption.slot || playerOption.slot !== targetSlot)) {
                            playerOption.slot = targetSlot;
                            renderPlayerSelector();
                        }
                        effectiveFilter = `slot_${targetSlot}`;
                        dbg(`[filterDataByPlayer] Found slot ${targetSlot} from reports with matching normalized SteamID, switching to slot filter`);
                    }
                }
            }
            if (effectiveFilter.startsWith('slot_')) {
                const targetSlot = parseInt(effectiveFilter.replace('slot_', ''));
                filteredReports = filteredReports.filter(r => r.TargetSlot === targetSlot);
            } else if (effectiveFilter.startsWith('steamid_')) {
                const targetSteamID = String(effectiveFilter.replace('steamid_', '')).trim();
                dbg(`[filterDataByPlayer] Filtering by TargetSteamID: "${targetSteamID}"`);
                filteredReports = filteredReports.filter(r => {
                    if (!r.TargetSteamID) return false;
                    const reportTargetSteamID = String(r.TargetSteamID).trim();
                    return steamIDsMatch(reportTargetSteamID, targetSteamID);
                });
                dbg(`[filterDataByPlayer] Filtered to ${filteredReports.length} reports for TargetSteamID: ${targetSteamID}`);
            }
            
            const countedSlots = new Set();
            let teamReports = 0;
            let enemyReports = 0;
            filteredReports.forEach(report => {
                if (!countedSlots.has(report.Slot)) {
                    countedSlots.add(report.Slot);
                    if (report.Team === "FRIENDLY") {
                        teamReports++;
                    } else {
                        enemyReports++;
                    }
                }
            });
            
            return {
                ...match,
                reports: filteredReports,
                teamReports: teamReports,
                enemyReports: enemyReports,
                confirmedTeamReports: teamReports,
                confirmedEnemyReports: enemyReports,
                unconfirmedTeamReports: 0,
                unconfirmedEnemyReports: 0
            };
        });
        
        return filteredMatchData;
    }

    function filterReportCountsByPlayer(reportCounts, matchData, playerFilter) {
        if (!playerFilter) return reportCounts;
        
        const filtered = new Map();
        const filteredMatchData = filterDataByPlayer(matchData, playerFilter);
        
        filteredMatchData.forEach(match => {
            (match.reports || []).forEach(report => {
                const playerKey = report.Name || `Slot ${report.Slot}`;
                filtered.set(playerKey, (filtered.get(playerKey) || 0) + 1);
            });
        });
        
        return filtered;
    }

    function filterTimelineDataByPlayer(timelineData, matchData, playerFilter) {
        if (!playerFilter) return timelineData;
        
        const filteredMatchData = filterDataByPlayer(matchData, playerFilter);
        const filtered = [];
        
        filteredMatchData.forEach(match => {
            (match.reports || []).forEach(report => {
                const timeParts = report.Time.split(':');
                let totalMinutes = 0;
                if (timeParts.length === 2) {
                    const minutes = parseInt(timeParts[0]) || 0;
                    const seconds = parseInt(timeParts[1]) || 0;
                    totalMinutes = minutes + seconds / 60;
                }
                filtered.push({
                    x: totalMinutes,
                    y: report.Team === 'FRIENDLY' ? 1 : 2,
                    matchID: match.matchID
                });
            });
        });
        
        return filtered;
    }

    function calculateTotalsForPlayer(matchData, playerFilter) {
        if (!playerFilter) {
            return {
                totalTeamReports: allTotalTeamReports,
                totalEnemyReports: allTotalEnemyReports,
                totalConfirmedTeamReports: allTotalConfirmedTeamReports,
                totalConfirmedEnemyReports: allTotalConfirmedEnemyReports,
                totalUnconfirmedTeamReports: allTotalUnconfirmedTeamReports,
                totalUnconfirmedEnemyReports: allTotalUnconfirmedEnemyReports
            };
        }
        
        const filteredMatchData = filterDataByPlayer(matchData, playerFilter);
        let totalTeamReports = 0;
        let totalEnemyReports = 0;
        
        filteredMatchData.forEach(match => {
            totalTeamReports += match.teamReports || 0;
            totalEnemyReports += match.enemyReports || 0;
        });
        
        return {
            totalTeamReports: totalTeamReports,
            totalEnemyReports: totalEnemyReports,
            totalConfirmedTeamReports: totalTeamReports,
            totalConfirmedEnemyReports: totalEnemyReports,
            totalUnconfirmedTeamReports: 0,
            totalUnconfirmedEnemyReports: 0
        };
    }

    function updateGraphsForPlayer(playerFilter) {
        const matchIndex = parseInt(matchSelector.value);
        if (matchIndex >= 0 && matchIndex < allMatchData.length) {
            const selectedMatch = allMatchData[matchIndex];
            const filteredMatchData = filterDataByPlayer([selectedMatch], playerFilter);
            const filteredConfirmedCounts = filterReportCountsByPlayer(allConfirmedPlayerReportCounts, [selectedMatch], playerFilter);
            const filteredUnconfirmedCounts = filterReportCountsByPlayer(allUnconfirmedPlayerReportCounts, [selectedMatch], playerFilter);
            const filteredConfirmedTimeline = filterTimelineDataByPlayer(allConfirmedTimelineData, [selectedMatch], playerFilter);
            const filteredUnconfirmedTimeline = filterTimelineDataByPlayer(allUnconfirmedTimelineData, [selectedMatch], playerFilter);
            const totals = calculateTotalsForPlayer([selectedMatch], playerFilter);
            
            generateGraphs(filteredMatchData, filteredConfirmedCounts, filteredUnconfirmedCounts,
                filteredConfirmedTimeline, filteredUnconfirmedTimeline,
                totals.totalTeamReports, totals.totalEnemyReports,
                totals.totalConfirmedTeamReports, totals.totalConfirmedEnemyReports,
                totals.totalUnconfirmedTeamReports, totals.totalUnconfirmedEnemyReports, playerFilter);
        } else {
            const filteredMatchData = filterDataByPlayer(allMatchData, playerFilter);
            const filteredConfirmedCounts = filterReportCountsByPlayer(allConfirmedPlayerReportCounts, allMatchData, playerFilter);
            const filteredUnconfirmedCounts = filterReportCountsByPlayer(allUnconfirmedPlayerReportCounts, allMatchData, playerFilter);
            const filteredConfirmedTimeline = filterTimelineDataByPlayer(allConfirmedTimelineData, allMatchData, playerFilter);
            const filteredUnconfirmedTimeline = filterTimelineDataByPlayer(allUnconfirmedTimelineData, allMatchData, playerFilter);
            const totals = calculateTotalsForPlayer(allMatchData, playerFilter);
            
            generateGraphs(filteredMatchData, filteredConfirmedCounts, filteredUnconfirmedCounts,
                filteredConfirmedTimeline, filteredUnconfirmedTimeline,
                totals.totalTeamReports, totals.totalEnemyReports,
                totals.totalConfirmedTeamReports, totals.totalConfirmedEnemyReports,
                totals.totalUnconfirmedTeamReports, totals.totalUnconfirmedEnemyReports, playerFilter);
        }
        
        if (allMatchDataOriginal.length > 1 && (currentSelectedPlayer || analysisSteamID)) {
            updatePlayerReportsPerMatchGraph(currentSelectedPlayer);
        } else {
            const playerReportsSection = document.getElementById('playerReportsPerMatchSection');
            if (playerReportsSection) {
                playerReportsSection.style.display = 'none';
            }
        }
    }
    
    function updatePlayerReportsPerMatchGraph(playerFilter) {
        const playerReportsSection = document.getElementById('playerReportsPerMatchSection');
        if (!playerReportsSection) return;
        
        let targetSteamID = null;
        let steamIDFilter = null;
        
        if (playerFilter && playerFilter.startsWith('steamid_')) {
            targetSteamID = String(playerFilter.replace('steamid_', '')).trim();
            steamIDFilter = playerFilter;
        } else if (playerFilter && playerFilter.startsWith('slot_')) {
            const playerOption = playerSelectorOptions.find(opt => opt.key === playerFilter);
            if (playerOption && playerOption.steamID) {
                targetSteamID = String(playerOption.steamID);
                steamIDFilter = `steamid_${targetSteamID}`;
            }
        }
        
        if (!targetSteamID && analysisSteamID) {
            targetSteamID = String(analysisSteamID);
            steamIDFilter = `steamid_${targetSteamID}`;
        }
        
        if (!targetSteamID) {
            const selectedProfile = getSelectedProfile();
            if (selectedProfile && selectedProfile.id) {
                targetSteamID = convertSteamIDTo64(String(selectedProfile.id));
                steamIDFilter = `steamid_${targetSteamID}`;
            }
        }
        
        if (!targetSteamID || !steamIDFilter || targetSteamID === '0' || targetSteamID === 'null' || targetSteamID === 'undefined') {
            playerReportsSection.style.display = 'none';
            return;
        }
        
        dbg('Player Reports Per Match - Using Steam ID:', targetSteamID, 'Filter:', steamIDFilter);
        
        const filteredMatchData = filterDataByPlayer(allMatchDataOriginal, steamIDFilter);
        
        if (filteredMatchData.length === 0) {
            playerReportsSection.style.display = 'none';
            return;
        }
        
        playerReportsSection.style.display = 'block';
        
        const reportsPerMatch = filteredMatchData.map(match => {
            const uniqueReporters = new Set();
            (match.reports || []).forEach(report => {
                if (report.Slot != null) {
                    uniqueReporters.add(report.Slot);
                }
            });
            return uniqueReporters.size;
        });
        
        const matchLabels = filteredMatchData.map(m => `Match ${m.matchID}`);
        
        matchLabels.reverse();
        reportsPerMatch.reverse();
        
        if (playerReportsPerMatchChart) {
            playerReportsPerMatchChart.destroy();
        }
        
        if (typeof Chart === 'undefined') return;
        const T = LedgerUI.canvasTheme();
        const ctx = document.getElementById('playerReportsPerMatchChart').getContext('2d');
        playerReportsPerMatchChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: matchLabels,
                datasets: [{
                    label: 'Unique Reporters',
                    data: reportsPerMatch,
                    backgroundColor: T.accent,
                    borderColor: T.accent,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: T.text
                        }
                    },
                    title: {
                        display: true,
                        text: `Unique Reporters Per Match (Steam ID: ${targetSteamID})`,
                        color: T.text,
                        font: { size: 14, weight: 'bold' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: T.muted },
                        grid: { color: T.line }
                    },
                    y: {
                        ticks: { 
                            color: T.muted,
                            stepSize: 1,
                            precision: 0
                        },
                        grid: { color: T.line },
                        beginAtZero: true
                    }
                }
            }
        });
    }

    function generateGraphs(matchData, confirmedPlayerReportCounts, unconfirmedPlayerReportCounts, 
        confirmedTimelineData, unconfirmedTimelineData,
        totalTeamReports, totalEnemyReports, 
        totalConfirmedTeamReports, totalConfirmedEnemyReports,
        totalUnconfirmedTeamReports, totalUnconfirmedEnemyReports, playerFilter) {
        chartInstances.forEach(chart => chart.destroy());
        chartInstances = [];
        const T = LedgerUI.canvasTheme();
        const chartsReady = typeof Chart !== 'undefined';

        // Calculate and display total unique report counts for current match/selection
        const totalFriendly = totalTeamReports;
        const totalEnemy = totalEnemyReports;
        const totalCombined = totalFriendly + totalEnemy;
        
        const reportSummary = document.getElementById('report-summary');
        if (reportSummary && totalCombined > 0) {
            document.getElementById('total-friendly-reports').textContent = totalFriendly;
            document.getElementById('total-enemy-reports').textContent = totalEnemy;
            document.getElementById('total-combined-reports').textContent = totalCombined;
            reportSummary.style.display = 'block';
        } else if (reportSummary) {
            reportSummary.style.display = 'none';
        }

        // Calculate and display totals for all matches by summing unique reports received by the target player
        let allMatchesFriendly = 0;
        let allMatchesEnemy = 0;
        
        if (allMatchDataOriginal && allMatchDataOriginal.length > 0 && (playerFilter || analysisSteamID)) {
            const filteredAllMatchData = filterDataByPlayer(allMatchDataOriginal, playerFilter);
            filteredAllMatchData.forEach(match => {
                // Count unique reports by Slot (reporter slot) for the target player
                const countedSlots = new Set();
                let friendly = 0;
                let enemy = 0;
                
                (match.reports || []).forEach(report => {
                    if (!countedSlots.has(report.Slot)) {
                        countedSlots.add(report.Slot);
                        if (report.Team === "FRIENDLY") {
                            friendly++;
                        } else {
                            enemy++;
                        }
                    }
                });
                
                allMatchesFriendly += friendly;
                allMatchesEnemy += enemy;
            });
        }
        
        const allMatchesCombined = allMatchesFriendly + allMatchesEnemy;
        
        const allMatchesReportSummary = document.getElementById('all-matches-report-summary');
        if (allMatchesReportSummary && allMatchesCombined > 0 && matchData.length > 1) {
            document.getElementById('all-matches-friendly-reports').textContent = allMatchesFriendly;
            document.getElementById('all-matches-enemy-reports').textContent = allMatchesEnemy;
            document.getElementById('all-matches-combined-reports').textContent = allMatchesCombined;
            allMatchesReportSummary.style.display = 'block';
        } else if (allMatchesReportSummary) {
            allMatchesReportSummary.style.display = 'none';
        }

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: T.text
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: T.muted },
                    grid: { color: T.line }
                },
                y: {
                    ticks: { color: T.muted },
                    grid: { color: T.line }
                }
            }
        };

        const hasUnconfirmed = totalUnconfirmedTeamReports + totalUnconfirmedEnemyReports > 0;

        document.querySelectorAll('[id^="unconfirmed"]').forEach(el => {
            if (el.tagName === 'CANVAS') {
                el.parentElement.style.display = hasUnconfirmed ? 'block' : 'none';
            }
        });
        
        const unconfirmedTitle = document.querySelector('.unconfirmed-section-title');
        if (unconfirmedTitle) {
            unconfirmedTitle.style.display = hasUnconfirmed ? 'block' : 'none';
        }

        if (chartsReady && totalUnconfirmedTeamReports + totalUnconfirmedEnemyReports > 0) {
            const unconfirmedTeamEnemyCtx = document.getElementById('unconfirmedTeamEnemyChart').getContext('2d');
            chartInstances.push(new Chart(unconfirmedTeamEnemyCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Team Reports', 'Enemy Reports'],
                    datasets: [{
                        data: [totalUnconfirmedTeamReports, totalUnconfirmedEnemyReports],
                        backgroundColor: [T.good, T.bad],
                        borderColor: [T.good, T.bad],
                        borderWidth: 2
                    }]
                },
                options: {
                    ...chartOptions,
                    plugins: {
                        ...chartOptions.plugins,
                        title: {
                            display: true,
                            text: 'Unconfirmed: Team vs Enemy',
                            color: T.text,
                            font: { size: 14, weight: 'bold' }
                        }
                    }
                }
            }));

            const unconfirmedStatusCtx = document.getElementById('unconfirmedStatusChart').getContext('2d');
            chartInstances.push(new Chart(unconfirmedStatusCtx, {
                type: 'bar',
                data: {
                    labels: ['Team', 'Enemy'],
                    datasets: [{
                        label: 'Unconfirmed Reports',
                        data: [totalUnconfirmedTeamReports, totalUnconfirmedEnemyReports],
                        backgroundColor: T.warn,
                        borderColor: T.warn,
                        borderWidth: 1
                    }]
                },
                options: {
                    ...chartOptions,
                    plugins: {
                        ...chartOptions.plugins,
                        title: {
                            display: true,
                            text: 'Unconfirmed Reports by Team',
                            color: T.text,
                            font: { size: 14, weight: 'bold' }
                        }
                    },
                    scales: {
                        ...chartOptions.scales,
                        y: {
                            ...chartOptions.scales.y,
                            beginAtZero: true
                        }
                    }
                }
            }));

            if (matchData.length > 1) {
                const unconfirmedPerMatchCtx = document.getElementById('unconfirmedPerMatchChart').getContext('2d');
                const matchLabels = matchData.map(m => `Match ${m.matchID}`);
                chartInstances.push(new Chart(unconfirmedPerMatchCtx, {
                    type: 'bar',
                    data: {
                        labels: matchLabels,
                        datasets: [
                            {
                                label: 'Team Reports',
                                data: matchData.map(m => m.unconfirmedTeamReports),
                                backgroundColor: T.good,
                                borderColor: T.good,
                                borderWidth: 1
                            },
                            {
                                label: 'Enemy Reports',
                                data: matchData.map(m => m.unconfirmedEnemyReports),
                                backgroundColor: T.bad,
                                borderColor: T.bad,
                                borderWidth: 1
                            }
                        ]
                    },
                    options: {
                        ...chartOptions,
                        plugins: {
                            ...chartOptions.plugins,
                            title: {
                                display: true,
                                text: 'Unconfirmed Reports Per Match',
                                color: T.text,
                                font: { size: 14, weight: 'bold' }
                            }
                        },
                        scales: {
                            ...chartOptions.scales,
                            y: {
                                ...chartOptions.scales.y,
                                beginAtZero: true,
                                ticks: {
                                    ...chartOptions.scales.y.ticks,
                                    stepSize: 1,
                                    precision: 0
                                }
                            }
                        }
                    }
                }));
                document.getElementById('unconfirmedPerMatchContainer').style.display = 'block';
            } else {
                document.getElementById('unconfirmedPerMatchContainer').style.display = 'none';
            }

            const unconfirmedTimelineCtx = document.getElementById('unconfirmedTimelineChart').getContext('2d');
            const unconfirmedFriendlyData = unconfirmedTimelineData.filter(d => d.y === 1);
            const unconfirmedEnemyData = unconfirmedTimelineData.filter(d => d.y === 2);
            
            chartInstances.push(new Chart(unconfirmedTimelineCtx, {
                type: 'scatter',
                data: {
                    datasets: [
                        {
                            label: 'Team Reports',
                            data: unconfirmedFriendlyData,
                            backgroundColor: T.good + '80',
                            borderColor: T.good,
                            borderWidth: 2,
                            pointRadius: 5
                        },
                        {
                            label: 'Enemy Reports',
                            data: unconfirmedEnemyData,
                            backgroundColor: T.bad + '80',
                            borderColor: T.bad,
                            borderWidth: 2,
                            pointRadius: 5
                        }
                    ]
                },
                options: {
                    ...chartOptions,
                    plugins: {
                        ...chartOptions.plugins,
                        title: {
                            display: true,
                            text: 'Unconfirmed Reports Timeline (Match Minutes)',
                            color: T.text,
                            font: { size: 14, weight: 'bold' }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const point = context.raw;
                                    return `${context.dataset.label}: ${point.x.toFixed(2)} min (Unconfirmed)`;
                                }
                            }
                        }
                    },
                    scales: {
                        ...chartOptions.scales,
                        x: {
                            ...chartOptions.scales.x,
                            title: {
                                display: true,
                                text: 'Match Time (minutes)',
                                color: T.muted
                            }
                        },
                        y: {
                            ...chartOptions.scales.y,
                            min: 0.5,
                            max: 2.5,
                            ticks: {
                                stepSize: 1,
                                callback: function(value) {
                                    return value === 1 ? 'Team' : value === 2 ? 'Enemy' : '';
                                }
                            },
                            title: {
                                display: true,
                                text: 'Report Type',
                                color: T.muted
                            }
                        }
                    }
                }
            }));

            const unconfirmedTopReportersArray = Array.from(unconfirmedPlayerReportCounts.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            
            if (unconfirmedTopReportersArray.length > 0) {
                const unconfirmedTopReportersCtx = document.getElementById('unconfirmedTopReportersChart').getContext('2d');
                chartInstances.push(new Chart(unconfirmedTopReportersCtx, {
                    type: 'bar',
                    data: {
                        labels: unconfirmedTopReportersArray.map(p => p[0]),
                        datasets: [{
                            label: 'Unconfirmed Report Count',
                            data: unconfirmedTopReportersArray.map(p => p[1]),
                            backgroundColor: T.warn,
                            borderColor: T.warn,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        ...chartOptions,
                        indexAxis: 'y',
                        plugins: {
                            ...chartOptions.plugins,
                            title: {
                                display: true,
                                text: 'Top Reporters (Unconfirmed)',
                                color: T.text,
                                font: { size: 14, weight: 'bold' }
                            }
                        },
                        scales: {
                            ...chartOptions.scales,
                            x: {
                                ...chartOptions.scales.x,
                                beginAtZero: true
                            }
                        }
                    }
                }));
            }
        }
    }
});
