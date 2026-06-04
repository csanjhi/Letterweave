// ══════════════════════════════════════════════════
// LETTERWEAVE — Game Engine
// ══════════════════════════════════════════════════

// ── CONSTANTS ────────────────────────────────────
const GRID_SIZE = 15;
const TURN_TIME = 120; // seconds

// Letter values (Scrabble-style)
const LETTER_VALUES = {
  A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:5,L:1,M:3,
  N:1,O:1,P:3,Q:10,R:1,S:1,T:1,U:1,V:4,W:4,X:8,Y:4,Z:10
};

// Full tile distribution with extra vowels
const TILE_DISTRIBUTION = {
  A:9, B:2, C:2, D:4, E:12, F:2, G:3, H:2, I:9, J:1, K:1, L:4, M:2,
  N:6, O:8, P:2, Q:1, R:6, S:4, T:6, U:6, V:2, W:2, X:1, Y:2, Z:1
};

const VOWELS = new Set(['A','E','I','O','U']);

// Bonus cells: 'DL'=double letter, 'TL'=triple letter
// (we skip word bonuses for simplicity, keep letter bonuses)
const BONUS_MAP = (() => {
  const m = {};
  // Double letter
  [[0,3],[0,11],[2,6],[2,8],[3,0],[3,7],[3,14],[6,2],[6,6],[6,8],[6,12],
   [7,3],[7,11],[8,2],[8,6],[8,8],[8,12],[11,0],[11,7],[11,14],[12,6],[12,8],
   [14,3],[14,11]].forEach(([r,c])=>{ m[`${r},${c}`]='DL'; });
  // Triple letter
  [[1,5],[1,9],[5,1],[5,5],[5,9],[5,13],[9,1],[9,5],[9,9],[9,13],[13,5],[13,9]]
   .forEach(([r,c])=>{ m[`${r},${c}`]='TL'; });
  return m;
})();
const CENTER = { r: 7, c: 7 };

// A minimal built-in word list (common English words) — used for validation
const WORD_LIST = new Set([
  "A","I","IS","IT","IN","AN","AS","AT","BE","BY","DO","GO","HE","IF","ME","MY",
  "NO","OF","ON","OR","SO","TO","UP","US","WE","YO","OX","EX","AX","OX",
  "THE","AND","FOR","ARE","BUT","NOT","YOU","ALL","CAN","HER","WAS","ONE","OUR",
  "OUT","DAY","GET","HAS","HIM","HIS","HOW","ITS","NEW","NOW","OLD","SEE","TWO",
  "WAY","WHO","BOY","DID","ITS","LET","PUT","SAY","SHE","TOO","USE","MAN","MEN",
  "CAT","DOG","EAT","FLY","GOT","HAD","HAT","LAW","LAY","LET","LIE","LOT","LOW",
  "MAP","MAY","NET","ODD","OWN","PAY","PEN","PIG","PIN","PIT","PLY","POT","RAT",
  "RAW","RAN","RAY","RIG","RUN","SAT","SAW","SAY","SET","SIT","SIX","SKY","SLY",
  "SOB","SON","SOT","SOW","SOY","SPA","SPY","STY","SUB","SUM","SUN","TAB","TAG",
  "TAN","TAP","TAR","TAX","TEA","TEN","TIE","TIP","TOE","TON","TOO","TOP","TOW",
  "TRY","TUB","TUG","TUN","TUP","TWO","URN","VAN","VAT","VET","VIA","VIE","VOW",
  "WAR","WEB","WED","WIG","WIN","WIT","WOE","WOK","WON","WOO","WRY","YAK","YAM",
  "YAP","YAW","YEA","YEN","YEP","YES","YET","YEW","YIN","YIP","YOU","ZAP","ZAG",
  "ZAX","ZED","ZEN","ZEP","ZIG","ZIP","ZIT","ZOO",
  "ABLE","ACID","AGED","ALSO","AREA","ARMY","ATOM","BABY","BACK","BALL","BAND",
  "BANK","BASE","BATH","BEAR","BEAT","BEEN","BELL","BEST","BIRD","BLOW","BLUE",
  "BOAT","BODY","BOMB","BOND","BONE","BOOK","BORE","BORN","BOTH","BOWL","BULK",
  "BURN","BUSH","BUSY","CALL","CALM","CAME","CARD","CARE","CASE","CASH","CAST",
  "CAVE","CELL","CHAT","CHIN","CHIP","CHOP","CITY","CLAM","CLAP","CLAN","CLAW",
  "CLAY","CLIP","CLUB","CLUE","COAL","COAT","CODE","COIL","COIN","COLD","COME",
  "COOK","COOL","COPE","COPY","CORE","CORN","COST","COZY","CREW","CROP","CROW",
  "CUBE","CURB","CURE","CURL","CUTE","DAME","DARE","DARK","DATA","DAWN","DAYS",
  "DEAD","DEAL","DEAR","DEEP","DELL","DENT","DEW","DIAL","DICE","DIET","DIRT",
  "DISC","DISH","DISK","DIVE","DOCK","DOOR","DOSE","DOVE","DOWN","DRAW","DREW",
  "DRIP","DROP","DRUG","DRUM","DUAL","DUCK","DUEL","DUSK","DUST","DUTY","EACH",
  "EARL","EARN","EASE","EAST","EDGE","EMIT","EPIC","EVEN","EVER","EVIL","EXAM",
  "FACE","FACT","FADE","FAIL","FAIR","FAKE","FALL","FAME","FARM","FAST","FATE",
  "FEAR","FEAT","FEED","FEEL","FEET","FELL","FELT","FILE","FILL","FILM","FIND",
  "FINE","FIRE","FIRM","FISH","FIST","FLAG","FLAT","FLEW","FLEX","FLIP","FLOW",
  "FOAM","FOLD","FOLK","FOND","FOOD","FOOL","FOOT","FORD","FORE","FORK","FORM",
  "FORT","FOUL","FOUR","FREE","FROM","FUEL","FULL","FUND","FURY","FUSE","GAIN",
  "GALE","GAME","GANG","GARB","GASH","GATE","GAVE","GEAR","GENE","GERM","GIFT",
  "GIRL","GIVE","GLAD","GLEE","GLOB","GLOW","GLUE","GNAT","GOAL","GOLD","GOLF",
  "GONE","GOOD","GRAB","GRAM","GRAY","GREW","GRID","GRIN","GRIP","GROW","GUST",
  "GUTS","GUYS","HACK","HAIL","HAIR","HALF","HALL","HALT","HAND","HANG","HARD",
  "HARM","HARP","HATE","HAUL","HAVE","HAWK","HEAD","HEAL","HEAP","HEAR","HEAT",
  "HEEL","HELD","HELP","HERB","HERO","HIGH","HILL","HINT","HIRE","HOLD","HOLE",
  "HOLY","HOME","HOOD","HOOK","HOPE","HORN","HOST","HOUR","HUGE","HULK","HULL",
  "HUNG","HUNT","HURL","HURT","HUSK","ICON","IDLE","INCH","IRON","ISLE","ITEM",
  "JAIL","JEST","JOIN","JOKE","JOLT","JUMP","JUST","KEEN","KEPT","KICK","KIND",
  "KING","KNEE","KNEW","KNIT","KNOB","KNOT","KNOW","LACE","LACK","LAID","LAKE",
  "LAMB","LAME","LAMP","LAND","LANE","LARK","LAST","LATE","LAVA","LAWN","LEAD",
  "LEAF","LEAK","LEAN","LEEK","LEND","LENS","LEST","LEVY","LIFE","LIFT","LIKE",
  "LILY","LIMP","LINE","LINK","LINT","LION","LISP","LIST","LIVE","LOAD","LOAN",
  "LOCK","LOFT","LONG","LOOK","LOOP","LORD","LORE","LORN","LOSE","LOSS","LOST",
  "LOUD","LOVE","LUCK","LURE","LURK","MADE","MAIL","MAIN","MAKE","MALE","MALT",
  "MANE","MARE","MARK","MARS","MAST","MATE","MEAL","MEAN","MEAT","MELT","MESH",
  "MILD","MILE","MILK","MILL","MIND","MINE","MINT","MIST","MODE","MOLD","MOLE",
  "MOOD","MOOR","MORE","MOST","MOVE","MUCH","MUGS","MULE","MULL","MYTH","NAIL",
  "NAME","NEAR","NEAT","NECK","NEED","NEWS","NEXT","NICE","NIGHT","NODE","NONE",
  "NOOK","NOON","NORM","NOSE","NOTE","NUDE","NULL","NUMB","OATH","OBEY","OMEN",
  "ONCE","ONLY","OPEN","OVER","OVEN","PACE","PACK","PAGE","PAIN","PAIR","PALE",
  "PALM","PANE","PARK","PART","PASS","PAST","PATH","PAVE","PEAK","PEAR","PEEL",
  "PEER","PERM","PEST","PINE","PINK","PIPE","PLAN","PLAY","PLOD","PLOT","PLOW",
  "PLUM","PLUS","POEM","POLE","POLL","POND","POOR","PORK","PORT","POSE","POST",
  "POUR","PRAY","PREY","PROD","PROP","PULL","PUMP","PUNK","PURE","PUSH","QUAD",
  "QUAY","QUIT","QUIZ","RACE","RACK","RAID","RAIL","RAIN","RAMP","RANG","RANK",
  "RANT","RASH","RATE","READ","REAL","REAP","REAR","REEF","REED","REEL","RELY",
  "REND","RENT","RICE","RICH","RIDE","RING","RIOT","RISE","RISK","ROAD","ROAM",
  "ROAR","ROBE","ROCK","RODE","ROLE","ROLL","ROOF","ROOM","ROOT","ROPE","ROSE",
  "RUIN","RULE","RUSH","RUST","RUTS","SAFE","SAGE","SAIL","SAKE","SALE","SALT",
  "SAME","SAND","SANE","SANG","SANK","SAVE","SCAN","SCAR","SEAL","SEAM","SEAT",
  "SEED","SEEK","SEEM","SELF","SELL","SENT","SHED","SHIN","SHIP","SHOE","SHOP",
  "SHOT","SHOW","SHUT","SICK","SIDE","SIGN","SILK","SING","SINK","SIZE","SKIN",
  "SKIP","SLAM","SLAP","SLAB","SLAG","SLID","SLIM","SLIP","SLOT","SLOW","SLUG",
  "SLUM","SNAP","SNIP","SNOW","SOAK","SOAP","SOCK","SOFT","SOIL","SOLD","SOLE",
  "SONG","SOOT","SORT","SOUL","SOUP","SOUR","SPAN","SPIN","SPIT","SPOT","STAB",
  "STAR","STAY","STEM","STEP","STEW","STIR","STOP","STUB","SUCH","SUIT","SUNG",
  "SUNK","SURE","SWAM","SWAN","SWAP","SWAY","SWIM","SWUM","SWUNG","TALE","TALL",
  "TAME","TANK","TASK","TEAM","TEAR","TELL","TERM","TEST","THAT","THEE","THEM",
  "THEN","THEY","THIN","THIS","TICK","TIDE","TIME","TINY","TIRE","TOLL","TOMB",
  "TOME","TONE","TORN","TORT","TOSS","TOUR","TOWN","TRAP","TREE","TRIM","TRIO",
  "TRIP","TROD","TROY","TRUE","TUBE","TUFT","TUNE","TURF","TURN","TWIN","TYPE",
  "UGLY","ULNA","UNDO","UNIT","UNTO","UPON","USED","VALE","VARY","VEIL","VEIN",
  "VERB","VEST","VIEW","VINE","VOID","VOLT","VOTE","WADE","WAGE","WAKE","WALK",
  "WALL","WAND","WANT","WARD","WARM","WART","WAVE","WEAK","WEAL","WEAN","WEAR",
  "WEED","WEEK","WELL","WEND","WENT","WERE","WEST","WHAT","WHEN","WHOM","WIDE",
  "WIFE","WILD","WILL","WIND","WINE","WING","WINK","WIRE","WISE","WISH","WITH",
  "WOKE","WOLF","WOOD","WOOL","WORD","WORE","WORM","WORN","WORT","WRAP","WRIT",
  "YARD","YARN","YEAR","YELL","YOKE","YORE","YOUR","ZONE","ZOOM",
  "ABOUT","ABOVE","ABUSE","ACHED","ACORN","ACRES","ADDED","AFTER","AGAIN","AGENT",
  "AGING","AIDED","AIMED","AIRED","ALBUM","ALERT","ALIKE","ALIVE","ALOFT","ALONE",
  "ALONG","ALOUD","ANGEL","ANGRY","ANKLE","ANNEX","APART","APPLE","APPLY","ARENA",
  "ARGON","ARISE","AROSE","ARROW","ASKED","ATTIC","AUDIO","AUNTS","AVAIL","AVOID",
  "AWAKE","AWARD","AWARE","BADLY","BAGEL","BAKED","BAKER","BARON","BASIC","BASIN",
  "BATCH","BATON","BEACH","BEGAN","BEGIN","BEING","BELOW","BENCH","BIRCH","BIRTH",
  "BISON","BLADE","BLAME","BLAND","BLANK","BLAST","BLAZE","BLEED","BLEND","BLESS",
  "BLIND","BLOCK","BLOOD","BLOOM","BLOWN","BLUNT","BOARD","BOSSY","BRACE","BRAIN",
  "BRAND","BRAVE","BREAK","BRICK","BRIDE","BRIEF","BRING","BRISK","BROKE","BROOK",
  "BROWN","BRUSH","BUILD","BUILT","BULLY","BUMPY","BUNCH","BURLY","BUTCH","CABBY",
  "CACHE","CAMEL","CANDY","CAPED","CARGO","CAROL","CARRY","CATCH","CAUSE","CEDAR",
  "CHAIN","CHAIR","CHALK","CHAOS","CHARM","CHART","CHASE","CHEAP","CHEEK","CHEER",
  "CHESS","CHEST","CHIEF","CHILD","CHILL","CHIMP","CHOIR","CHUNK","CIDER","CIVIC",
  "CIVIL","CLAIM","CLANG","CLASS","CLEAN","CLEAR","CLERK","CLICK","CLIMB","CLING",
  "CLOCK","CLONE","CLOSE","CLOUD","COACH","COAST","COMIC","COMMA","CORAL","COULD",
  "COUNT","COURT","COVER","CRACK","CRAFT","CRANE","CRASH","CREAM","CREEK","CREST",
  "CRIMP","CRISP","CROSS","CROWD","CROWN","CRUEL","CRUSH","CURVE","CYCLE","DANCE",
  "DAUNT","DEBUT","DECAY","DECOR","DELAY","DENIM","DENSE","DEPOT","DEPTH","DERBY",
  "DEVIL","DIARY","DIGIT","DIMLY","DISCO","DIZZY","DODGE","DOING","DOLLY","DONOR",
  "DOUBT","DOUGH","DOWEL","DOZEN","DRAFT","DRAIN","DRAMA","DRANK","DRAPE","DRAWL",
  "DREAD","DREAM","DRESS","DRIFT","DROWN","DRUNK","DRYER","DWARF","DWELL","EAGER",
  "EARLY","EARTH","EIGHT","ELBOW","ELITE","EMAIL","EMBER","EMPTY","ENDED","ENJOY",
  "ENTER","ENTRY","EQUAL","ERROR","ESSAY","EXACT","EXCEL","EXTRA","FABLE","FACED",
  "FAITH","FALLS","FALSE","FANCY","FEAST","FENCE","FERRY","FEVER","FIFTH","FIFTY",
  "FIGHT","FINAL","FIXED","FLAME","FLESH","FLOAT","FLOCK","FLOOD","FLOOR","FLOSS",
  "FLOUR","FLOWN","FOCAL","FOGGY","FORCE","FORGE","FOUND","FRAME","FRESH","FRONT",
  "FROST","FROZE","FRUIT","FULLY","FUNNY","GHOST","GIVEN","GLAND","GLARE","GLASS",
  "GLIDE","GLOBE","GLOOM","GLORY","GLOSS","GLOVE","GONER","GRACE","GRADE","GRAIN",
  "GRAND","GRANT","GRASP","GRASS","GRAVE","GRAZE","GREED","GREET","GRIEF","GRILL",
  "GROAN","GROIN","GROOM","GROSS","GROUP","GROUT","GROVE","GROWL","GRUEL","GRUFF",
  "GUARD","GUESS","GUEST","GUIDE","GUILE","GUISE","GULCH","GUSTO","GYPSY","HABIT",
  "HAPPY","HARSH","HASTE","HATCH","HAUNT","HAVEN","HEAVY","HENCE","HINGE","HIRED",
  "HOARD","HOBBY","HOMER","HONEY","HONOR","HORSE","HOTEL","HOUSE","HUMAN","HUMID",
  "HUSKY","HYENA","IDEAL","IMAGE","IMPLY","INBOX","INDEX","INFER","INNER","INPUT",
  "INTER","INTRO","INURE","ISSUE","IVORY","JOKER","JOUST","JUDGE","JUICY","JUMPY",
  "JUROR","KARMA","KNACK","LABEL","LANCE","LASER","LARGE","LAUGH","LAYER","LEAFY",
  "LEARN","LEASE","LEASH","LEAST","LEAVE","LEVEL","LIMIT","LINEN","LOCAL","LODGE",
  "LOGIC","LOOSE","LOWER","LOYAL","LUCKY","LUNAR","LYING","MAGIC","MAJOR","MAPLE",
  "MARCH","MATCH","MAYOR","MEDIA","MERCY","METAL","MIGHT","MINOR","MINUS","MODEL",
  "MONEY","MONTH","MORAL","MOUND","MOUNT","MOUSE","MOUTH","MOVER","MOVIE","MUDDY",
  "MUSIC","NAIVE","NAVAL","NERVE","NEVER","NIGHT","NOBLE","NOISE","NORTH","NOTED",
  "NOVEL","NURSE","NYMPH","OASIS","OCEAN","OFFER","OFTEN","OLIVE","ORDER","OUGHT",
  "OUTER","OWNER","OXIDE","OZONE","PACED","PAINT","PANIC","PAPER","PARTY","PASTE",
  "PATCH","PAUSE","PEACE","PENAL","PENNY","PERCH","PHASE","PHONE","PHOTO","PIANO",
  "PILOT","PITCH","PIXEL","PIZZA","PLACE","PLAID","PLAIN","PLANE","PLANT","PLATE",
  "PLAZA","PLEAD","PLUCK","PLUGS","POINT","POLAR","POPPY","POWER","PRESS","PRICE",
  "PRIDE","PRIME","PRINT","PRIOR","PRIZE","PROBE","PROVE","PROWL","PRUNE","PSALM",
  "PUDGY","PULSE","QUEEN","QUERY","QUEST","QUEUE","QUICK","QUIET","QUOTA","QUOTE",
  "RADAR","RADIO","RAISE","RALLY","RANGE","RAPID","RATIO","REACH","REACT","READY",
  "REALM","REPAY","REPLY","RIDER","RIDGE","RIGHT","RISKY","RIVAL","RIVER","ROBIN",
  "ROBOT","ROCKY","ROMAN","ROUGE","ROUGH","ROUND","ROUTE","ROYAL","RUGBY","RULER",
  "SADLY","SAINT","SALAD","SAUCE","SCALE","SCALP","SCAMP","SCARY","SCENE","SCONE",
  "SCOPE","SCORE","SCOUT","SCRAP","SCREW","SCRUB","SEIZE","SENSE","SERVE","SEVEN",
  "SHADE","SHAFT","SHAKE","SHALL","SHAME","SHAPE","SHARE","SHARK","SHARP","SHEEN",
  "SHEEP","SHELF","SHELL","SHIFT","SHORE","SHORT","SHOUT","SHOVE","SHOWN","SHRUG",
  "SIGHT","SIXTH","SIXTY","SKILL","SKIRT","SKULL","SLACK","SLAIN","SLAVE","SLEEP",
  "SLICE","SLIDE","SLIME","SLOPE","SLOTH","SMART","SMELL","SMILE","SMITE","SMOKE",
  "SNAKE","SNARE","SNEAK","SNORT","SOLVE","SPACE","SPARE","SPARK","SPAWN","SPEAK",
  "SPEAR","SPEED","SPELL","SPEND","SPICE","SPIKE","SPINE","SPOKE","SPOON","SPORT",
  "SQUAD","SQUAT","STAGE","STAIN","STALE","STAND","STARE","START","STATE","STEAM",
  "STEEL","STICK","STIFF","STILL","STING","STOCK","STONE","STOOD","STOVE","STRAP",
  "STRAW","STRIP","STUCK","STUDY","STUMP","STUNT","STYLE","SUGAR","SUITE","SUPER",
  "SURGE","SWAMP","SWEEP","SWEET","SWEPT","SWIFT","SWORD","TABLE","TALON","TALLY",
  "TASTE","TEACH","TEETH","TEMPO","TENSE","TENTH","THEFT","THERE","THESE","THICK",
  "THING","THINK","THIRD","THOSE","THREE","THREW","THROW","THUMB","TIGER","TIGHT",
  "TIMER","TIRED","TITLE","TODAY","TOKEN","TOPIC","TOTAL","TOUCH","TOUGH","TOWER",
  "TOXIC","TRACK","TRADE","TRAIL","TRAIN","TRAMP","TREAD","TREAT","TREND","TRIAL",
  "TRIBE","TRICK","TROOP","TROUT","TRUCK","TRULY","TRUMP","TRUNK","TRUST","TRUTH",
  "TULIP","TUNER","TWIRL","TWIST","UDDER","ULTRA","UNCLE","UNDER","UNDUE","UNIFY",
  "UNION","UNITE","UNITY","UNTIL","UPPER","UPSET","URBAN","USAGE","USUAL","UTTER",
  "VALID","VALUE","VALVE","VAPOR","VAULT","VERSE","VIDEO","VIGOR","VIRAL","VIRUS",
  "VISIT","VISOR","VISTA","VITAL","VIXEN","VOCAL","VOICE","VOMIT","VOTER","VYING",
  "WAGER","WATER","WEAVE","WEIGH","WEIRD","WHALE","WHEAT","WHEEL","WHERE","WHICH",
  "WHILE","WHITE","WHOLE","WHOSE","WIELD","WITTY","WOMAN","WOMEN","WOODS","WORLD",
  "WORRY","WORSE","WORST","WORTH","WOULD","WOUND","WRATH","WRING","WRONG","YACHT",
  "YEARN","YIELD","YOUNG","YOURS","YOUTH","ZEBRA","ZESTY","ZILCH","ZIPPY"
]);

// ── GAME STATE ────────────────────────────────────
let STATE = {};

function initState(mode, p1name, p2name) {
  const bag = buildBag();
  const p1Tiles = drawTiles(bag, 7);
  const p2Tiles = drawTiles(bag, 7);
  return {
    mode, // 'solo' | 'local' | 'online'
    board: Array.from({length:GRID_SIZE}, () => Array(GRID_SIZE).fill(null)),
    // board cell: null or {letter, player, bonus}
    bag,
    turn: 0, // 0=p1, 1=p2
    scores: [0, 0],
    names: [p1name || 'Player 1', p2name || (mode==='solo'?'Computer':'Player 2')],
    tiles: [p1Tiles, p2Tiles],
    placed: [], // current turn placements: [{r,c,letter,tileId}]
    words: [[], []], // word history per player
    consecutiveSkips: 0,
    turnTime: TURN_TIME,
    timerInterval: null,
    firstWord: true,
    gameOver: false,
  };
}

function buildBag() {
  const bag = [];
  Object.entries(TILE_DISTRIBUTION).forEach(([letter, count]) => {
    for (let i = 0; i < count; i++) bag.push(letter);
  });
  shuffle(bag);
  return bag;
}

function drawTiles(bag, n) {
  const drawn = [];
  for (let i = 0; i < n && bag.length > 0; i++) {
    drawn.push({letter: bag.pop(), id: Math.random().toString(36).slice(2)});
  }
  return drawn;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
}

// ── UI HELPERS ────────────────────────────────────
const $ = id => document.getElementById(id);
function show(id) { const el=$(id); if(el){el.classList.add('active');} }
function hide(id) { const el=$(id); if(el){el.classList.remove('active');} }
function openModal(id) { $(id).classList.add('open'); }
function closeModal(id) { $(id).classList.remove('open'); }

let selectedTile = null; // {letter, id, rack}
let timerInterval = null;
let timeLeft = TURN_TIME;

// ── INIT HOME ─────────────────────────────────────
function initHome() {
  buildMiniBoard();
  $('home-btn').style.display = 'none';
  show('home-screen');
  hide('game-screen');
  hide('invite-screen');
}

function buildMiniBoard() {
  const mb = $('mini-board');
  mb.innerHTML = '';
  const words = [
    [0,0,'',0,0,'',0],
    [0,'W','O','R','D','S',0],
    [0,0,'',0,0,'',0],
    [0,'P','L','A','Y',0,0],
    [0,0,'',0,0,'',0],
  ];
  const cls = [[0,0,0,0,0,0,0],[0,2,1,1,1,1,0],[0,0,0,0,0,0,0],[0,2,1,1,1,0,0],[0,0,0,0,0,0,0]];
  words.forEach((row,ri) => row.forEach((cell,ci) => {
    const d = document.createElement('div');
    d.className = 'mini-cell';
    if(cell) {
      d.textContent = cell;
      d.className = `mini-cell ${cls[ri][ci]===1?'p1':cls[ri][ci]===2?'p2':'filled'}`;
    }
    mb.appendChild(d);
  }));
}

// ── MODE CARDS ────────────────────────────────────
$('mode-solo').addEventListener('click', () => showSetup('solo'));
$('mode-local').addEventListener('click', () => showSetup('local'));
$('mode-online').addEventListener('click', () => showOnline());

function showSetup(mode) {
  const si = $('setup-inputs');
  si.innerHTML = '';
  if (mode === 'solo') {
    $('setup-title').textContent = 'Solo Game';
    $('setup-desc').textContent = 'Play against the computer.';
    addNameInput(si, 'Your Name', 'p1name', 'Player 1');
  } else {
    $('setup-title').textContent = 'Pass & Play';
    $('setup-desc').textContent = 'Two players, one device.';
    addNameInput(si, 'Player 1 Name', 'p1name', 'Player 1');
    addNameInput(si, 'Player 2 Name', 'p2name', 'Player 2');
  }
  $('start-game-btn').onclick = () => {
    const p1 = $('p1name')?.value.trim() || 'Player 1';
    const p2 = $('p2name')?.value.trim() || (mode==='solo'?'Computer':'Player 2');
    closeModal('setup-modal');
    startGame(mode, p1, p2);
  };
  openModal('setup-modal');
}

function addNameInput(container, label, id, placeholder) {
  const wrap = document.createElement('div');
  wrap.innerHTML = `<label>${label}</label><input type="text" id="${id}" placeholder="${placeholder}" maxlength="16">`;
  container.appendChild(wrap);
}

// ── ONLINE INVITE ─────────────────────────────────
let onlineRole = null; // 'host' or 'guest'
let onlineGameId = null;

function showOnline() {
  hide('home-screen');
  show('invite-screen');
  $('home-btn').style.display = 'block';

  // Generate a unique game ID
  onlineGameId = Math.random().toString(36).slice(2,8).toUpperCase();
  onlineRole = 'host';

  const url = `${location.href.split('?')[0]}?join=${onlineGameId}`;
  $('invite-link-input').value = url;

  // Simulate connection polling (in real deployment, use a backend or Firebase)
  // For GitHub Pages, we use localStorage cross-tab communication
  $('conn-dot').className = 'status-dot';
  $('conn-status').textContent = 'Waiting for your friend to join…';

  startHostPolling();
}

function startHostPolling() {
  localStorage.removeItem(`lw_join_${onlineGameId}`);
  const poll = setInterval(() => {
    const joined = localStorage.getItem(`lw_join_${onlineGameId}`);
    if (joined) {
      clearInterval(poll);
      $('conn-dot').className = 'status-dot connected';
      $('conn-status').textContent = 'Friend connected! Starting game…';
      setTimeout(() => {
        closeModal('setup-modal');
        startGame('online', 'You (Host)', joined);
      }, 1200);
    }
  }, 800);
  window._hostPoll = poll;
}

$('copy-link-btn').addEventListener('click', () => {
  $('invite-link-input').select();
  navigator.clipboard.writeText($('invite-link-input').value).catch(()=>{});
  $('copy-link-btn').textContent = 'Copied!';
  setTimeout(() => $('copy-link-btn').textContent = 'Copy', 2000);
});

$('invite-back-btn').addEventListener('click', () => {
  if (window._hostPoll) clearInterval(window._hostPoll);
  hide('invite-screen');
  show('home-screen');
  $('home-btn').style.display = 'none';
});

$('start-without-btn').addEventListener('click', () => {
  if (window._hostPoll) clearInterval(window._hostPoll);
  hide('invite-screen');
  showSetup('solo');
});

$('join-game-btn').addEventListener('click', () => {
  const val = $('join-code-input').value.trim();
  const m = val.match(/join=([A-Z0-9]+)/i) || val.match(/^([A-Z0-9]{6})$/i);
  if (!m) { showMsg('Invalid code or link', 'error'); return; }
  const gameId = m[1].toUpperCase();
  const guestName = prompt('Enter your name:', 'Guest') || 'Guest';
  localStorage.setItem(`lw_join_${gameId}`, guestName);
  $('conn-status').textContent = `Joined! Waiting for host…`;
  $('conn-dot').className = 'status-dot connected';
  // Guest also starts game locally (in real app, sync via backend)
  setTimeout(() => {
    hide('invite-screen');
    startGame('online', guestName, 'Host', true);
  }, 1500);
});

// Check if loaded with join parameter
(function checkJoinParam() {
  const params = new URLSearchParams(location.search);
  const joinId = params.get('join');
  if (joinId) {
    // auto-fill join code
    setTimeout(() => {
      hide('home-screen');
      show('invite-screen');
      $('home-btn').style.display = 'block';
      onlineGameId = joinId;
      const url = `${location.href.split('?')[0]}?join=${joinId}`;
      $('invite-link-input').value = url;
      $('join-code-input').value = joinId;
      $('conn-status').textContent = `You were invited! Enter your name and click Join.`;
    }, 300);
  }
})();

// ── START GAME ────────────────────────────────────
function startGame(mode, p1name, p2name, isGuest) {
  STATE = initState(mode, p1name, p2name);
  hide('home-screen');
  hide('invite-screen');
  hide('setup-modal');
  show('game-screen');
  $('home-btn').style.display = 'block';

  $('p1-name').textContent = STATE.names[0];
  $('p2-name').textContent = STATE.names[1];

  renderBoard();
  renderRack();
  updateScoreUI();
  startTimer();
  updateTurnUI();
}

// ── BOARD ─────────────────────────────────────────
function renderBoard() {
  const grid = $('grid');
  grid.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 38px)`;
  grid.style.gridTemplateRows = `repeat(${GRID_SIZE}, 38px)`;
  grid.innerHTML = '';

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.r = r;
      cell.dataset.c = c;

      const key = `${r},${c}`;
      const bonus = BONUS_MAP[key];
      if (bonus === 'DL') cell.classList.add('double');
      if (bonus === 'TL') cell.classList.add('triple');
      if (r === CENTER.r && c === CENTER.c) cell.classList.add('center');

      const boardCell = STATE.board[r][c];
      if (boardCell) {
        cell.textContent = boardCell.letter;
        cell.classList.add('placed', `p${boardCell.player+1}`);
      }

      cell.addEventListener('click', () => onCellClick(r, c));
      grid.appendChild(cell);
    }
  }

  // Re-render any previews for current turn placements
  STATE.placed.forEach(p => {
    const cell = getCellEl(p.r, p.c);
    if (cell) {
      cell.textContent = p.letter;
      cell.classList.add('preview');
    }
  });
}

function getCellEl(r, c) {
  return document.querySelector(`#grid .cell[data-r='${r}'][data-c='${c}']`);
}

function onCellClick(r, c) {
  if (STATE.gameOver) return;
  const isMyTurn = isCurrentPlayerHuman();
  if (!isMyTurn) return;

  const existing = STATE.board[r][c];
  const alreadyPlaced = STATE.placed.find(p => p.r === r && p.c === c);

  if (alreadyPlaced) {
    // Deselect / recall this tile
    recallTile(alreadyPlaced);
    return;
  }

  if (existing) return; // occupied

  if (!selectedTile) {
    showMsg('Select a tile from your rack first', 'info');
    return;
  }

  placeTileOnBoard(r, c, selectedTile);
  selectedTile = null;
  clearRackSelection();
}

function placeTileOnBoard(r, c, tile) {
  STATE.placed.push({r, c, letter: tile.letter, tileId: tile.id});
  // Remove from rack visually (keep in state until confirmed)
  removeTileFromRack(tile.id);

  const cell = getCellEl(r, c);
  if (cell) {
    cell.textContent = tile.letter;
    cell.classList.remove('center');
    cell.classList.add('preview');
  }
  $('bag-count').textContent = STATE.bag.length;
}

function recallTile(placement) {
  STATE.placed = STATE.placed.filter(p => !(p.r===placement.r && p.c===placement.c));
  // Return tile to rack
  STATE.tiles[STATE.turn].push({letter: placement.letter, id: placement.tileId});
  renderRack();
  const cell = getCellEl(placement.r, placement.c);
  if (cell) {
    cell.textContent = '';
    cell.classList.remove('preview','valid-drop','invalid-drop');
    const key = `${placement.r},${placement.c}`;
    const bonus = BONUS_MAP[key];
    if (bonus==='DL') cell.classList.add('double');
    if (bonus==='TL') cell.classList.add('triple');
    if (placement.r===CENTER.r && placement.c===CENTER.c) cell.classList.add('center');
  }
}

// ── RACK ──────────────────────────────────────────
function renderRack() {
  const rack = $('tile-rack');
  rack.innerHTML = '';
  const tiles = STATE.tiles[STATE.turn];
  $('rack-label').textContent = `${STATE.names[STATE.turn]}'s Tiles`;

  tiles.forEach(tile => {
    const el = document.createElement('div');
    el.className = 'tile' + (VOWELS.has(tile.letter) ? ' vowel' : '');
    el.dataset.id = tile.id;
    el.innerHTML = `<span class="letter">${tile.letter}</span><span class="pts">${LETTER_VALUES[tile.letter]}</span>`;

    el.addEventListener('click', () => selectTile(tile, el));
    rack.appendChild(el);
  });
}

function selectTile(tile, el) {
  if (STATE.gameOver) return;
  if (!isCurrentPlayerHuman()) return;

  clearRackSelection();
  if (selectedTile && selectedTile.id === tile.id) {
    selectedTile = null;
    return;
  }
  selectedTile = tile;
  el.classList.add('selected-tile');
}

function clearRackSelection() {
  document.querySelectorAll('.tile.selected-tile').forEach(t => t.classList.remove('selected-tile'));
}

function removeTileFromRack(tileId) {
  STATE.tiles[STATE.turn] = STATE.tiles[STATE.turn].filter(t => t.id !== tileId);
  renderRack();
}

// ── ACTIONS ───────────────────────────────────────
$('place-btn').addEventListener('click', () => {
  if (!isCurrentPlayerHuman()) return;
  confirmPlacement();
});

$('recall-btn').addEventListener('click', () => {
  if (!isCurrentPlayerHuman()) return;
  recallAll();
});

$('shuffle-btn').addEventListener('click', () => {
  if (!isCurrentPlayerHuman()) return;
  shuffle(STATE.tiles[STATE.turn]);
  renderRack();
});

$('skip-btn').addEventListener('click', () => {
  if (!isCurrentPlayerHuman()) return;
  recallAll();
  skipTurn();
});

function recallAll() {
  [...STATE.placed].forEach(p => recallTile(p));
  selectedTile = null;
  clearRackSelection();
}

function skipTurn() {
  STATE.consecutiveSkips++;
  showMsg(`${STATE.names[STATE.turn]} skipped their turn`, 'info');
  if (STATE.consecutiveSkips >= 4) {
    endGame();
    return;
  }
  nextTurn();
}

function confirmPlacement() {
  if (STATE.placed.length === 0) {
    showMsg('Place at least one tile!', 'error');
    return;
  }

  const result = validatePlacement();
  if (!result.valid) {
    showMsg(result.reason, 'error');
    return;
  }

  // Commit to board
  STATE.placed.forEach(p => {
    STATE.board[p.r][p.c] = {letter: p.letter, player: STATE.turn};
  });

  // Score
  let pts = 0;
  result.newWords.forEach(word => {
    let wordPts = word.cells.reduce((sum, {r,c,letter}) => {
      const k = `${r},${c}`;
      const b = BONUS_MAP[k];
      let v = LETTER_VALUES[letter];
      if (b==='DL') v *= 2;
      if (b==='TL') v *= 3;
      return sum + v;
    }, 0);
    pts += wordPts;
  });

  STATE.scores[STATE.turn] += pts;
  STATE.words[STATE.turn].push({
    words: result.newWords.map(w=>w.word).join(', '),
    pts
  });
  STATE.consecutiveSkips = 0;
  STATE.placed = [];
  STATE.firstWord = false;

  // Draw new tiles
  const needed = 7 - STATE.tiles[STATE.turn].length;
  const newTiles = drawTiles(STATE.bag, needed);
  STATE.tiles[STATE.turn].push(...newTiles);

  showMsg(`✓ ${result.newWords.map(w=>w.word).join(' + ')} — +${pts} pts!`, 'success');
  updateScoreUI();
  renderBoard();
  renderRack();

  // Check win condition
  if (STATE.tiles[STATE.turn].length === 0 && STATE.bag.length === 0) {
    setTimeout(endGame, 800);
    return;
  }

  setTimeout(nextTurn, 600);
}

// ── VALIDATION ────────────────────────────────────
function validatePlacement() {
  const placed = STATE.placed;
  if (placed.length === 0) return {valid:false, reason:'No tiles placed'};

  // All in same row or column?
  const rows = [...new Set(placed.map(p=>p.r))];
  const cols = [...new Set(placed.map(p=>p.c))];
  if (rows.length > 1 && cols.length > 1) return {valid:false, reason:'All tiles must be in a row or column'};

  // Must touch center on first word
  if (STATE.firstWord) {
    const touchesCenter = placed.some(p=>p.r===CENTER.r&&p.c===CENTER.c);
    if (!touchesCenter) return {valid:false, reason:'First word must cross the center ★'};
  } else {
    // Must connect to existing board
    const connects = placed.some(p => {
      return [[p.r-1,p.c],[p.r+1,p.c],[p.r,p.c-1],[p.r,p.c+1]].some(([r2,c2]) =>
        r2>=0&&r2<GRID_SIZE&&c2>=0&&c2<GRID_SIZE&&STATE.board[r2][c2]!==null
      );
    });
    if (!connects) return {valid:false, reason:'Word must connect to existing letters'};
  }

  // Gather all new words formed
  const newWords = getAllNewWords(placed);
  if (newWords.length === 0) return {valid:false, reason:'No valid words formed'};

  // Validate each word
  for (const w of newWords) {
    if (w.word.length < 2) continue;
    if (!WORD_LIST.has(w.word.toUpperCase())) {
      return {valid:false, reason:`"${w.word}" is not a valid word`};
    }
  }

  return {valid:true, newWords};
}

function getAllNewWords(placed) {
  const tempBoard = STATE.board.map(row => [...row]);
  placed.forEach(p => { tempBoard[p.r][p.c] = {letter:p.letter, player:STATE.turn}; });

  const words = [];
  const seen = new Set();

  placed.forEach(p => {
    // Check horizontal word through p
    const hw = getWord(tempBoard, p.r, p.c, 0, 1);
    if (hw && hw.word.length >= 2 && !seen.has(hw.word+hw.r+hw.c)) {
      seen.add(hw.word+hw.r+hw.c);
      words.push(hw);
    }
    // Check vertical word through p
    const vw = getWord(tempBoard, p.r, p.c, 1, 0);
    if (vw && vw.word.length >= 2 && !seen.has(vw.word+vw.r+vw.c)) {
      seen.add(vw.word+vw.r+vw.c);
      words.push(vw);
    }
  });

  // Also include single-letter placeholders touching existing (for completeness: filter len<2)
  return words.filter(w => w.word.length >= 2);
}

function getWord(board, r, c, dr, dc) {
  // Find start
  let sr = r, sc = c;
  while (sr-dr>=0 && sc-dc>=0 && board[sr-dr][sc-dc]) { sr-=dr; sc-=dc; }
  // Build word
  let word = '', cells = [];
  let cr = sr, cc = sc;
  while (cr<GRID_SIZE && cc<GRID_SIZE && board[cr][cc]) {
    word += board[cr][cc].letter;
    cells.push({r:cr, c:cc, letter:board[cr][cc].letter});
    cr+=dr; cc+=dc;
  }
  if (word.length < 1) return null;
  return {word, cells, r:sr, c:sc};
}

// ── TURN MANAGEMENT ───────────────────────────────
function nextTurn() {
  STATE.turn = 1 - STATE.turn;
  clearTimer();
  selectedTile = null;
  STATE.placed = [];
  renderRack();
  updateTurnUI();
  startTimer();

  if (!isCurrentPlayerHuman()) {
    // Computer's turn
    setTimeout(computerTurn, 1200);
  }
}

function updateTurnUI() {
  const t = STATE.turn;
  $('turn-text').innerHTML = `<strong>${STATE.names[t]}</strong>'s turn`;
  $('p1-turn-indicator').className = `turn-indicator ${t===0?'active-turn p1':'inactive'}`;
  $('p1-turn-indicator').textContent = t===0 ? '● Your Turn' : '○ Waiting';
  $('p2-turn-indicator').className = `turn-indicator ${t===1?'active-turn p2':'inactive'}`;
  $('p2-turn-indicator').textContent = t===1 ? '● Your Turn' : '○ Waiting';

  $('place-btn').disabled = !isCurrentPlayerHuman();
  $('recall-btn').disabled = !isCurrentPlayerHuman();
  $('shuffle-btn').disabled = !isCurrentPlayerHuman();
  $('skip-btn').disabled = !isCurrentPlayerHuman();
}

function updateScoreUI() {
  $('p1-score').textContent = STATE.scores[0];
  $('p2-score').textContent = STATE.scores[1];
  $('bag-count').textContent = STATE.bag.length;

  // Word history
  ['p1-word-list','p2-word-list'].forEach((id,pi) => {
    const el = $(id);
    el.innerHTML = STATE.words[pi].slice(-8).map(w =>
      `<div class="word-entry p${pi+1}-word"><span class="word">${w.words}</span><span class="pts">+${w.pts}</span></div>`
    ).join('');
  });
}

function isCurrentPlayerHuman() {
  if (STATE.mode === 'solo' && STATE.turn === 1) return false;
  return true;
}

// ── TIMER ─────────────────────────────────────────
function startTimer() {
  timeLeft = TURN_TIME;
  updateTimerUI();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();
    if (timeLeft <= 0) {
      clearTimer();
      showMsg('Time up! Turn skipped.', 'info');
      recallAll();
      skipTurn();
    }
  }, 1000);
}

function clearTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  $('turn-timer').className = 'timer';
}

function updateTimerUI() {
  const m = Math.floor(timeLeft/60), s = timeLeft%60;
  $('turn-timer').textContent = `${m}:${s.toString().padStart(2,'0')}`;
  if (timeLeft <= 20) $('turn-timer').classList.add('urgent');
  else $('turn-timer').classList.remove('urgent');
}

// ── COMPUTER AI ───────────────────────────────────
function computerTurn() {
  if (STATE.gameOver) return;
  showMsg(`<span class="thinking-dots"><span></span><span></span><span></span></span> Computer is thinking…`, 'info');

  setTimeout(() => {
    const move = findBestComputerMove();
    if (!move) {
      skipTurn();
      return;
    }

    // Apply move
    move.placements.forEach(p => {
      STATE.board[p.r][p.c] = {letter:p.letter, player:1};
    });
    move.placements.forEach(p => {
      STATE.tiles[1] = STATE.tiles[1].filter(t => t.id !== p.tileId);
    });

    // Draw new tiles
    const needed = 7 - STATE.tiles[1].length;
    const newTiles = drawTiles(STATE.bag, needed);
    STATE.tiles[1].push(...newTiles);

    STATE.scores[1] += move.score;
    STATE.words[1].push({words: move.word, pts: move.score});
    STATE.consecutiveSkips = 0;
    STATE.firstWord = false;

    showMsg(`Computer played: ${move.word} (+${move.score})`, 'info');
    updateScoreUI();
    renderBoard();

    if (STATE.tiles[1].length === 0 && STATE.bag.length === 0) {
      setTimeout(endGame, 800);
      return;
    }

    setTimeout(nextTurn, 800);
  }, 1400);
}

function findBestComputerMove() {
  const rack = STATE.tiles[1];
  if (rack.length === 0) return null;

  const rackLetters = rack.map(t=>t.letter);
  let best = null;

  // Try placing words across / down on the board
  // For each cell, try to form words
  const candidates = [];

  if (STATE.firstWord) {
    // Place on center
    const word = findWordFromLetters(rackLetters, [], 7);
    if (word) {
      const placements = placeWordOnRow(word, CENTER.r, CENTER.c - Math.floor(word.length/2), 0, 1, rack);
      if (placements) candidates.push({word, placements, score: scoreWord(placements)});
    }
  } else {
    // Try each occupied cell as anchor
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!STATE.board[r][c]) continue;
        const anchor = STATE.board[r][c].letter;

        // Try across
        ['across','down'].forEach(dir => {
          const dr = dir==='down'?1:0, dc = dir==='across'?1:0;
          const word = findWordFromLetters(rackLetters, [anchor], 5, anchor);
          if (!word) return;
          // Try starting positions
          for (let offset = 0; offset < word.length; offset++) {
            if (word[offset] !== anchor) continue;
            const sr = r - offset*dr, sc = c - offset*dc;
            if (sr<0||sc<0||sr+word.length*dr>GRID_SIZE||sc+word.length*dc>GRID_SIZE) continue;
            const placements = placeWordOnBoard(word, sr, sc, dr, dc, rack, r, c);
            if (placements) {
              const s = scoreWord(placements);
              candidates.push({word, placements, score:s});
            }
          }
        });
      }
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a,b) => b.score - a.score);
  return candidates[0];
}

function findWordFromLetters(rackLetters, required, maxLen, anchorLetter) {
  const available = [...rackLetters];
  if (anchorLetter && !available.includes(anchorLetter)) {
    // anchor is on board, not from rack
  }

  // Try words from WORD_LIST that can be formed
  const workable = [...WORD_LIST].filter(w => {
    if (w.length < 2 || w.length > Math.min(7, maxLen)) return false;
    if (anchorLetter && !w.includes(anchorLetter)) return false;
    const need = [...w];
    const avail = [...rackLetters];
    for (const ch of need) {
      if (anchorLetter && ch === anchorLetter) {
        // anchor already on board
        continue;
      }
      const idx = avail.indexOf(ch);
      if (idx === -1) return false;
      avail.splice(idx,1);
    }
    return true;
  });

  if (workable.length === 0) return null;
  // Pick a random good-length word
  workable.sort((a,b) => b.length - a.length);
  return workable[Math.floor(Math.random()*Math.min(5,workable.length))];
}

function placeWordOnRow(word, r, c, dr, dc, rack) {
  if (c < 0) { c = 0; }
  const placements = [];
  const usedIds = new Set();
  const rackCopy = [...rack];
  for (let i = 0; i < word.length; i++) {
    const cr = r + i*dr, cc = c + i*dc;
    if (cr<0||cr>=GRID_SIZE||cc<0||cc>=GRID_SIZE) return null;
    if (STATE.board[cr][cc]) {
      if (STATE.board[cr][cc].letter !== word[i]) return null;
      continue;
    }
    const ti = rackCopy.findIndex(t => t.letter===word[i] && !usedIds.has(t.id));
    if (ti === -1) return null;
    usedIds.add(rackCopy[ti].id);
    placements.push({r:cr, c:cc, letter:word[i], tileId:rackCopy[ti].id});
  }
  return placements.length>0 ? placements : null;
}

function placeWordOnBoard(word, sr, sc, dr, dc, rack, anchorR, anchorC) {
  const placements = [];
  const usedIds = new Set();
  const rackCopy = [...rack];
  for (let i = 0; i < word.length; i++) {
    const cr = sr + i*dr, cc = sc + i*dc;
    if (cr<0||cr>=GRID_SIZE||cc<0||cc>=GRID_SIZE) return null;
    if (STATE.board[cr][cc]) {
      if (STATE.board[cr][cc].letter !== word[i]) return null;
      continue; // use existing board letter
    }
    const ti = rackCopy.findIndex(t => t.letter===word[i] && !usedIds.has(t.id));
    if (ti === -1) return null;
    usedIds.add(rackCopy[ti].id);
    placements.push({r:cr, c:cc, letter:word[i], tileId:rackCopy[ti].id});
  }
  return placements.length>0 ? placements : null;
}

function scoreWord(placements) {
  return placements.reduce((sum, {r,c,letter}) => {
    const k=`${r},${c}`, b=BONUS_MAP[k];
    let v = LETTER_VALUES[letter]||1;
    if(b==='DL') v*=2; if(b==='TL') v*=3;
    return sum+v;
  }, 0);
}

// ── GAME END ──────────────────────────────────────
function endGame() {
  STATE.gameOver = true;
  clearTimer();

  // Penalty: subtract remaining tile values
  [0,1].forEach(p => {
    const penalty = STATE.tiles[p].reduce((s,t) => s + LETTER_VALUES[t.letter], 0);
    STATE.scores[p] -= penalty;
  });

  const [s0, s1] = STATE.scores;
  let title, trophy, msg;
  if (s0 > s1) {
    title = `${STATE.names[0]} Wins!`;
    trophy = '🏆';
    msg = `Congratulations ${STATE.names[0]}! A well-played game.`;
  } else if (s1 > s0) {
    title = `${STATE.names[1]} Wins!`;
    trophy = '🏆';
    msg = `Congratulations ${STATE.names[1]}! A well-played game.`;
  } else {
    title = "It's a Tie!";
    trophy = '🤝';
    msg = "An evenly matched game — well played by both!";
  }

  $('end-title').textContent = title;
  $('end-trophy').textContent = trophy;
  $('end-message').textContent = msg;
  $('final-scores').innerHTML = STATE.names.map((name,i) =>
    `<div class="final-score-card">
      <div class="fsname">${name}</div>
      <div class="fspts" style="color:var(--${i===0?'p1':'p2'}-color)">${STATE.scores[i]}</div>
    </div>`
  ).join('');

  openModal('end-modal');
}

$('play-again-btn').addEventListener('click', () => {
  closeModal('end-modal');
  const mode = STATE.mode, names = STATE.names;
  startGame(mode, names[0], names[1]);
});

$('end-home-btn').addEventListener('click', () => {
  closeModal('end-modal');
  clearTimer();
  initHome();
});

// ── MESSAGES ──────────────────────────────────────
let msgTimeout;
function showMsg(html, type='info') {
  const feed = $('message-feed');
  feed.innerHTML = `<div class="message ${type}">${html}</div>`;
  clearTimeout(msgTimeout);
  msgTimeout = setTimeout(() => { feed.innerHTML=''; }, 3500);
}

// ── RULES ─────────────────────────────────────────
$('rules-btn').addEventListener('click', () => openModal('rules-modal'));
$('close-rules-btn').addEventListener('click', () => closeModal('rules-modal'));
$('home-btn').addEventListener('click', () => {
  clearTimer();
  initHome();
});

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay && !overlay.id.includes('setup') && !overlay.id.includes('end')) {
      closeModal(overlay.id);
    }
  });
});

// ── BOOT ──────────────────────────────────────────
initHome();
