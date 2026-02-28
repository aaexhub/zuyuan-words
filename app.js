const STORAGE_KEY = "wordAppMultiUserV1";
const DAILY_GOAL = 5;
const APP_VERSION = "2026-02-28-v1";  // 多用户版本
const PAGE_SIZE = 20;

const state = {
  books: {},
  selectedBook: "",
  selectedUnit: null,
  words: [],
  currentWord: null,
  wordHistory: [],
  currentIndex: -1,
  options: [],
  answered: false,
  answerCorrect: false,
  learnMode: "choice",
  practiceMode: false,
  wordHidden: false,
  shuffleMode: false,
  sequentialIndex: 0,
  // 多用户相关
  currentUser: null,
  appState: null,  // 当前用户的数据
  // 分页状态
  wrongPage: 1,
  learnedPage: 1
};

const el = {};

// ========== 多用户管理 ==========

function loadGlobalData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        users: {},
        currentUser: null
      };
    }
    return JSON.parse(raw);
  } catch {
    return { users: {}, currentUser: null };
  }
}

function saveGlobalData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getUserData(username) {
  const global = loadGlobalData();
  if (!global.users[username]) {
    // 创建新用户数据
    global.users[username] = {
      progress: {},
      dailyCount: {},
      quizLogs: [],
      calendar: {},
      pronounceType: 1,
      createdAt: Date.now()
    };
    saveGlobalData(global);
  }
  return global.users[username];
}

function switchUser(username) {
  const global = loadGlobalData();
  global.currentUser = username;
  saveGlobalData(global);
  state.currentUser = username;
  state.appState = getUserData(username);
  
  // 重置学习状态
  state.selectedBook = "";
  state.selectedUnit = null;
  state.words = [];
  state.wordHistory = [];
  state.currentIndex = -1;
  state.currentWord = null;
  
  // 隐藏用户面板，显示主界面
  document.getElementById("user-panel").classList.add("hidden");
  
  // 更新用户显示
  updateUserDisplay();
  
  // 刷新界面
  renderBooks();
  renderWrongBook();
  renderLearnedList();
  renderCalendar();
  renderStats();
  
  // 回到选择面板
  el.selectorPanel.classList.remove("hidden");
  el.learnPanel.classList.add("hidden");
  el.unitSelector.classList.add("hidden");
}

function updateUserDisplay() {
  const display = document.getElementById("current-user-display");
  if (display && state.currentUser) {
    const avatar = state.currentUser.charAt(0).toUpperCase();
    display.innerHTML = `
      <div class="user-avatar">${avatar}</div>
      <span>${state.currentUser}</span>
    `;
  }
}

function showUserPanel() {
  document.getElementById("user-panel").classList.remove("hidden");
  renderUserList();
}

function renderUserList() {
  const global = loadGlobalData();
  const userList = document.getElementById("user-list");
  userList.innerHTML = "";
  
  const usernames = Object.keys(global.users);
  
  if (usernames.length === 0) {
    userList.innerHTML = '<p style="color:#999;text-align:center;width:100%">还没有用户，请创建一个</p>';
  } else {
    usernames.forEach(username => {
      const userData = global.users[username];
      const learnedCount = Object.keys(userData.progress || {}).length;
      const avatar = username.charAt(0).toUpperCase();
      
      const item = document.createElement("div");
      item.className = "user-item";
      item.innerHTML = `
        <div class="user-avatar">${avatar}</div>
        <div class="user-name">${username}</div>
        <div class="user-stats">已学 ${learnedCount} 词</div>
      `;
      item.addEventListener("click", () => switchUser(username));
      userList.appendChild(item);
    });
  }
}

function addNewUser() {
  const input = document.getElementById("new-user-input");
  const name = input.value.trim();
  
  if (!name) {
    alert("请输入用户名");
    return;
  }
  
  if (name.length > 10) {
    alert("用户名最多10个字符");
    return;
  }
  
  const global = loadGlobalData();
  if (global.users[name]) {
    alert("用户名已存在");
    return;
  }
  
  // 创建新用户
  global.users[name] = {
    progress: {},
    dailyCount: {},
    quizLogs: [],
    calendar: {},
    pronounceType: 1,
    createdAt: Date.now()
  };
  global.currentUser = name;
  saveGlobalData(global);
  
  input.value = "";
  switchUser(name);
}

// ========== 原有功能（适配多用户） ==========

function initElements() {
  el.grade7Books = document.getElementById("grade7-books");
  el.grade8Books = document.getElementById("grade8-books");
  el.selectorPanel = document.getElementById("selector-panel");
  el.learnPanel = document.getElementById("learn-panel");
  el.progressTip = document.getElementById("progress-tip");
  el.progressSteps = document.getElementById("progress-steps");
  el.wordText = document.getElementById("word-text");
  el.phoneticText = document.getElementById("phonetic-text");
  el.rootTip = document.getElementById("root-tip");
  el.options = document.getElementById("options");
  el.answerResult = document.getElementById("answer-result");
  el.btnNext = document.getElementById("btn-next");
  el.btnPrev = document.getElementById("btn-prev");
  el.btnBack = document.getElementById("btn-back");
  el.btnPronounce = document.getElementById("btn-pronounce");
  el.pronounceType = document.getElementById("pronounce-type");
  el.wrongList = document.getElementById("wrong-list");
  el.learnedList = document.getElementById("learned-list");
  el.calendarGrid = document.getElementById("calendar-grid");
  el.statsGrid = document.getElementById("stats-grid");
  el.choiceMode = document.getElementById("choice-mode");
  el.spellMode = document.getElementById("spell-mode");
  el.spellHint = document.getElementById("spell-hint");
  el.spellInput = document.getElementById("spell-input");
  el.btnCheckSpell = document.getElementById("btn-check-spell");
  el.btnShowAnswer = document.getElementById("btn-show-answer");
  el.spellResult = document.getElementById("spell-result");
  el.btnReviewLearned = document.getElementById("btn-review-learned");
  el.btnPracticeLearned = document.getElementById("btn-practice-learned");
  el.learnedCount = document.getElementById("learned-count");
  el.totalDays = document.getElementById("total-days");
  el.totalWords = document.getElementById("total-words");
  el.streakDays = document.getElementById("streak-days");
  el.wordCard = document.getElementById("word-card");
  el.unitSelector = document.getElementById("unit-selector");
  el.unitGrid = document.getElementById("unit-grid");
  el.miniCalendar = document.getElementById("mini-calendar");
  el.btnToggleWord = document.getElementById("btn-toggle-word");
  el.btnShuffle = document.getElementById("btn-shuffle");
}

async function init() {
  try {
    initElements();
    const resp = await fetch("./words.json");
    const data = await resp.json();
    state.books = data;
    
    // 检查是否有当前用户
    const global = loadGlobalData();
    if (global.currentUser && global.users[global.currentUser]) {
      state.currentUser = global.currentUser;
      state.appState = getUserData(global.currentUser);
      updateUserDisplay();
      renderBooks();
    } else {
      // 显示用户选择面板
      showUserPanel();
    }
    
    renderWrongBook();
    renderLearnedList();
    renderCalendar();
    renderStats();
    setupEvents();
    
    // 注册 Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker 注册成功'))
        .catch(err => console.log('Service Worker 注册失败:', err));
    }
  } catch (err) {
    document.getElementById("selector-panel").innerHTML = `<h2>加载失败</h2><p>${String(err)}</p>`;
  }
}

function setupEvents() {
  el.btnNext.addEventListener("click", nextQuestion);
  if (el.btnPrev) el.btnPrev.addEventListener("click", prevQuestion);
  if (el.btnBack) el.btnBack.addEventListener("click", goBackToSelection);
  el.btnPronounce.addEventListener("click", pronounceCurrentWord);

  // 隐藏/显示单词按钮
  if (el.btnToggleWord) {
    el.btnToggleWord.addEventListener("click", toggleWordVisibility);
  }

  // 打乱/顺序切换按钮
  if (el.btnShuffle) {
    el.btnShuffle.addEventListener("click", toggleShuffleMode);
  }

  if (el.pronounceType) {
    el.pronounceType.value = String(getPronounceType());
    el.pronounceType.addEventListener("change", (e) => {
      setPronounceType(parseInt(e.target.value, 10));
    });
  }

  document.querySelectorAll(".mode-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".mode-tab").forEach((x) => x.classList.remove("active"));
      tab.classList.add("active");
      state.learnMode = tab.dataset.mode;
      el.choiceMode.classList.toggle("hidden", state.learnMode !== "choice");
      el.spellMode.classList.toggle("hidden", state.learnMode !== "spell");
      
      if (state.learnMode === "spell" && state.currentWord) {
        state.wordHidden = true;
        updateWordDisplay();
        setupSpellMode();
      } else {
        state.wordHidden = false;
        updateWordDisplay();
      }
    });
  });

  if (el.btnCheckSpell) el.btnCheckSpell.addEventListener("click", checkSpelling);
  if (el.btnShowAnswer) el.btnShowAnswer.addEventListener("click", showSpellAnswer);
  if (el.spellInput) {
    el.spellInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") checkSpelling();
    });
  }

  if (el.btnReviewLearned) {
    el.btnReviewLearned.addEventListener("click", startLearnedReview);
  }
  
  if (el.btnPracticeLearned) {
    el.btnPracticeLearned.addEventListener("click", startPractice);
  }

  document.querySelectorAll(".mark-row .mark").forEach((btn) => {
    btn.addEventListener("click", () => markCurrentWord(btn.dataset.mark));
  });

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((x) => x.classList.remove("active"));
      tab.classList.add("active");
      const tabName = tab.dataset.tab;
      document.querySelectorAll(".tab-view").forEach((view) => view.classList.add("hidden"));
      const view = document.getElementById(`tab-${tabName}`);
      if (view) view.classList.remove("hidden");
      if (tabName === "calendar") renderCalendar();
    });
  });
  
  // 用户相关事件
  document.getElementById("btn-switch-user").addEventListener("click", showUserPanel);
  document.getElementById("btn-add-user").addEventListener("click", addNewUser);
  document.getElementById("new-user-input").addEventListener("keypress", (e) => {
    if (e.key === "Enter") addNewUser();
  });
}

function toggleShuffleMode() {
  state.shuffleMode = !state.shuffleMode;
  if (el.btnShuffle) {
    if (state.shuffleMode) {
      el.btnShuffle.textContent = "顺序学习";
      el.btnShuffle.classList.add("active");
    } else {
      el.btnShuffle.textContent = "打乱顺序";
      el.btnShuffle.classList.remove("active");
    }
  }
  if (state.selectedBook && state.selectedUnit !== undefined) {
    const book = state.books[state.selectedBook];
    if (book.hasUnits && state.selectedUnit !== null) {
      const unit = book.units.find(u => u.unit === state.selectedUnit);
      state.words = unit ? [...unit.words] : [];
    } else if (book.hasUnits) {
      state.words = book.units.flatMap(u => u.words);
    } else {
      state.words = book.words ? [...book.words] : [];
    }
    
    if (state.shuffleMode) {
      state.words = shuffleArray(state.words);
    }
    
    state.wordHistory = [];
    state.currentIndex = -1;
    state.sequentialIndex = 0;
    nextQuestion();
  }
}

function renderBooks() {
  if (!el.grade7Books || !el.grade8Books) return;
  
  el.grade7Books.innerHTML = "";
  el.grade8Books.innerHTML = "";
  
  const grade7Keys = ["grade7_upper", "grade7_lower"];
  const grade8Keys = ["grade8_upper", "grade8_lower"];
  
  grade7Keys.forEach(bookKey => {
    if (!state.books[bookKey]) return;
    const book = state.books[bookKey];
    const learnedCount = countLearnedWords(bookKey);
    const total = book.hasUnits 
      ? (book.units || []).reduce((sum, u) => sum + u.words.length, 0)
      : book.words.length;
    
    const btn = document.createElement("button");
    btn.className = "book-btn";
    btn.innerHTML = `<strong>${book.name}</strong><br><small>${learnedCount}/${total} 词</small>`;
    btn.addEventListener("click", () => {
      if (book.hasUnits) {
        showUnitSelector(bookKey, btn);
      } else {
        selectBook(bookKey, null, btn);
      }
    });
    el.grade7Books.appendChild(btn);
  });
  
  grade8Keys.forEach(bookKey => {
    if (!state.books[bookKey]) return;
    const book = state.books[bookKey];
    const learnedCount = countLearnedWords(bookKey);
    const total = book.hasUnits 
      ? (book.units || []).reduce((sum, u) => sum + u.words.length, 0)
      : book.words.length;
    
    const btn = document.createElement("button");
    btn.className = "book-btn";
    btn.innerHTML = `<strong>${book.name}</strong><br><small>${learnedCount}/${total} 词</small>`;
    btn.addEventListener("click", () => {
      if (book.hasUnits) {
        showUnitSelector(bookKey, btn);
      } else {
        selectBook(bookKey, null, btn);
      }
    });
    el.grade8Books.appendChild(btn);
  });
}

function showUnitSelector(bookKey, bookBtn) {
  const book = state.books[bookKey];
  if (!book || !book.units) return;
  
  document.querySelectorAll(".book-btn").forEach((b) => b.classList.remove("active"));
  bookBtn.classList.add("active");
  
  el.unitSelector.classList.remove("hidden");
  el.unitGrid.innerHTML = "";
  
  const allBtn = document.createElement("button");
  allBtn.className = "unit-btn";
  allBtn.innerHTML = `<div class="unit-name">全部</div><div class="unit-count">${book.units.reduce((s, u) => s + u.words.length, 0)} 词</div>`;
  allBtn.addEventListener("click", () => selectBook(bookKey, null, bookBtn));
  el.unitGrid.appendChild(allBtn);
  
  book.units.forEach((unit) => {
    const btn = document.createElement("button");
    btn.className = "unit-btn";
    btn.innerHTML = `<div class="unit-name">${unit.name}</div><div class="unit-count">${unit.words.length} 词</div>`;
    btn.addEventListener("click", () => selectBook(bookKey, unit.unit, btn));
    el.unitGrid.appendChild(btn);
  });
}

function selectBook(bookKey, unitNum, btnNode) {
  state.selectedBook = bookKey;
  state.selectedUnit = unitNum;
  
  const book = state.books[bookKey];
  
  if (book.hasUnits && unitNum !== null) {
    const unit = book.units.find(u => u.unit === unitNum);
    state.words = unit ? [...unit.words] : [];
  } else if (book.hasUnits) {
    state.words = book.units.flatMap(u => u.words);
  } else {
    state.words = book.words ? [...book.words] : [];
  }
  
  if (state.shuffleMode) {
    state.words = shuffleArray(state.words);
  }
  
  state.wordHistory = [];
  state.currentIndex = -1;
  state.sequentialIndex = 0;
  state.practiceMode = false;

  document.querySelectorAll(".book-btn").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll(".unit-btn").forEach((b) => b.classList.remove("active"));
  if (btnNode) btnNode.classList.add("active");

  el.selectorPanel.classList.add("hidden");
  el.unitSelector.classList.add("hidden");
  el.learnPanel.classList.remove("hidden");
  
  nextQuestion();
}

function nextQuestion() {
  if (!state.selectedBook || !state.words.length) return;

  const todayLearned = getTodayLearnedCount();
  if (todayLearned >= DAILY_GOAL && !state.practiceMode) {
    el.progressTip.textContent = "🎉 今日目标已完成！可继续练习";
    renderProgressSteps();
    return;
  }

  state.currentIndex++;
  
  if (state.currentIndex >= state.wordHistory.length) {
    const newWord = getNewWord();
    if (!newWord) {
      el.progressTip.textContent = "🎉 所有单词已学完！";
      return;
    }
    state.wordHistory.push(newWord);
  }

  state.currentWord = state.wordHistory[state.currentIndex];
  state.options = generateOptions(state.currentWord, state.words);
  state.answered = false;
  state.answerCorrect = false;

  renderWord();
  renderProgressSteps();
}

function prevQuestion() {
  if (state.currentIndex > 0) {
    state.currentIndex--;
    state.currentWord = state.wordHistory[state.currentIndex];
    state.options = [];
    state.answered = false;
    renderWord();
  }
}

function goBackToSelection() {
  // 返回选择面板
  el.learnPanel.classList.add("hidden");
  el.selectorPanel.classList.remove("hidden");
  el.unitSelector.classList.add("hidden");
  
  // 重置状态
  state.wordHistory = [];
  state.currentIndex = -1;
  state.currentWord = null;
  state.practiceMode = false;
}

function getNewWord() {
  const learned = new Set();
  Object.entries(state.appState.progress[state.selectedBook] || {}).forEach(([key, item]) => {
    learned.add(item.word.toLowerCase());
  });
  state.wordHistory.forEach(w => learned.add(w.word.toLowerCase()));
  
  if (!state.shuffleMode) {
    for (let i = state.sequentialIndex; i < state.words.length; i++) {
      const word = state.words[i];
      if (!learned.has(word.word.toLowerCase())) {
        state.sequentialIndex = i + 1;
        return word;
      }
    }
    state.sequentialIndex = 0;
    return state.words[0];
  }
  
  const unlearned = state.words.filter(w => !learned.has(w.word.toLowerCase()));
  if (unlearned.length === 0) return state.words[Math.floor(Math.random() * state.words.length)];
  return unlearned[Math.floor(Math.random() * unlearned.length)];
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderWord() {
  if (!state.currentWord) return;
  
  state.wordHidden = (state.learnMode === "spell");
  updateWordDisplay();
  
  if (state.learnMode === "spell") {
    setupSpellMode();
  } else {
    renderOptions();
  }
  el.answerResult.textContent = "";
}

function toggleWordVisibility() {
  state.wordHidden = !state.wordHidden;
  updateWordDisplay();
}

function updateWordDisplay() {
  if (!state.currentWord) return;
  
  if (state.wordHidden) {
    el.wordText.textContent = "?????";
    el.phoneticText.textContent = "";
    el.rootTip.textContent = "";
    if (el.btnToggleWord) el.btnToggleWord.textContent = "显示";
  } else {
    el.wordText.textContent = state.currentWord.word;
    el.phoneticText.textContent = state.currentWord.phonetic || "";
    el.rootTip.textContent = getRootTip(state.currentWord.word);
    if (el.btnToggleWord) el.btnToggleWord.textContent = "隐藏";
  }
}

function renderOptions() {
  el.options.innerHTML = "";
  const labels = ['A', 'B', 'C', 'D'];
  state.options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerHTML = `<span class="option-label">${labels[index]}</span><span class="option-text">${opt.chinese}</span>`;
    btn.addEventListener("click", () => checkAnswer(opt, btn));
    el.options.appendChild(btn);
  });
}

function checkAnswer(option, btnNode) {
  if (state.answered || !state.currentWord) return;
  state.answered = true;
  state.answerCorrect = option.word === state.currentWord.word;

  document.querySelectorAll(".option-btn").forEach((btn, i) => {
    if (state.options[i].word === state.currentWord.word) {
      btn.classList.add("correct");
    }
  });

  if (!state.answerCorrect) {
    btnNode.classList.add("wrong");
    el.answerResult.innerHTML = `<span style="color:var(--red)">❌ 答错了，正确答案：${state.currentWord.chinese}</span>`;
  } else {
    el.answerResult.innerHTML = `<span style="color:var(--green)">✅ 答对了！</span>`;
  }

  pushQuizLog(state.answerCorrect);
  saveCurrentUserState();
  renderStats();
}

function setupSpellMode() {
  if (!state.currentWord) return;
  el.spellHint.textContent = `${state.currentWord.chinese} ${state.currentWord.pos || ""}`;
  el.spellInput.value = "";
  el.spellInput.className = "spell-input";
  el.spellResult.textContent = "";
  el.spellInput.focus();
}

function checkSpelling() {
  if (!state.currentWord || state.answered) return;
  const input = el.spellInput.value.trim().toLowerCase();
  const correct = state.currentWord.word.toLowerCase();
  state.answered = true;

  if (input === correct) {
    el.spellInput.classList.add("correct");
    el.spellResult.innerHTML = `<span style="color:var(--green)">✅ 拼写正确！</span>`;
    state.answerCorrect = true;
  } else {
    el.spellInput.classList.add("wrong");
    el.spellResult.innerHTML = `<span style="color:var(--red)">❌ 拼写错误，正确答案：${state.currentWord.word}</span>`;
    state.answerCorrect = false;
  }

  pushQuizLog(state.answerCorrect);
  incrementTodayCount();
  saveCurrentUserState();
  renderStats();
  renderProgressSteps();
}

function showSpellAnswer() {
  if (!state.currentWord) return;
  el.spellInput.value = state.currentWord.word;
  el.spellInput.classList.add("correct");
  el.spellResult.textContent = `正确拼写：${state.currentWord.word}`;
  state.answered = true;
}

function markCurrentWord(mark) {
  if (!state.selectedBook || !state.currentWord) return;
  const bookKey = state.selectedBook;
  const wordKey = wordId(state.currentWord);
  
  if (!state.appState.progress[bookKey]) {
    state.appState.progress[bookKey] = {};
  }

  state.appState.progress[bookKey][wordKey] = {
    mark,
    updatedAt: Date.now(),
    word: state.currentWord.word,
    chinese: state.currentWord.chinese
  };

  incrementTodayCount();
  updateCalendar();
  saveCurrentUserState();
  renderWrongBook();
  renderLearnedList();
  renderStats();
  renderProgressSteps();
}

function renderProgressSteps() {
  const todayLearned = getTodayLearnedCount();
  if (!el.progressSteps) return;
  
  let html = "";
  for (let i = 0; i < DAILY_GOAL; i++) {
    const done = i < todayLearned ? "done" : "";
    const current = i === todayLearned ? "current" : "";
    html += `<div class="step-dot ${done} ${current}">${i + 1}</div>`;
  }
  el.progressSteps.innerHTML = html;
  el.progressTip.textContent = state.practiceMode 
    ? `练习模式 | 今日: ${todayLearned}/${DAILY_GOAL}`
    : `今日进度: ${todayLearned}/${DAILY_GOAL}`;
}

function renderWrongBook() {
  if (!state.appState) return;
  const redWords = [];
  Object.entries(state.appState.progress).forEach(([bookKey, map]) => {
    Object.entries(map).forEach(([key, item]) => {
      if (item.mark === "red") {
        redWords.push({
          ...item,
          bookName: state.books[bookKey]?.name || bookKey
        });
      }
    });
  });

  el.wrongList.innerHTML = "";
  if (!redWords.length) {
    el.wrongList.innerHTML = "<li>暂无错词</li>";
    document.getElementById("wrong-pagination").innerHTML = "";
    return;
  }

  const totalPages = Math.ceil(redWords.length / PAGE_SIZE);
  const start = (state.wrongPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageWords = redWords.slice(start, end);

  pageWords.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${item.word}</strong> ${item.chinese} <small>${item.bookName}</small>`;
    el.wrongList.appendChild(li);
  });

  renderPagination("wrong-pagination", state.wrongPage, totalPages, (page) => {
    state.wrongPage = page;
    renderWrongBook();
  });
}

function renderLearnedList() {
  if (!state.appState) return;
  const words = [];
  Object.entries(state.appState.progress).forEach(([bookKey, map]) => {
    Object.entries(map).forEach(([key, item]) => {
      words.push({
        ...item,
        bookName: state.books[bookKey]?.name || bookKey
      });
    });
  });

  if (el.learnedCount) el.learnedCount.textContent = words.length;
  
  el.learnedList.innerHTML = "";
  if (!words.length) {
    el.learnedList.innerHTML = "<li>暂无已学单词</li>";
    document.getElementById("learned-pagination").innerHTML = "";
    return;
  }

  const totalPages = Math.ceil(words.length / PAGE_SIZE);
  const start = (state.learnedPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageWords = words.slice(start, end);

  pageWords.forEach((item) => {
    const mark = item.mark === "green" ? "🟢" : item.mark === "yellow" ? "🟡" : "🔴";
    const li = document.createElement("li");
    li.innerHTML = `${mark} <strong>${item.word}</strong> ${item.chinese}`;
    el.learnedList.appendChild(li);
  });

  renderPagination("learned-pagination", state.learnedPage, totalPages, (page) => {
    state.learnedPage = page;
    renderLearnedList();
  });
}

function startPractice() {
  state.practiceMode = true;
  const words = [];
  Object.values(state.appState.progress).forEach(map => {
    Object.values(map).forEach(item => words.push(item));
  });
  
  if (!words.length) {
    alert("还没有学习过单词，先去学习吧！");
    state.practiceMode = false;
    return;
  }

  const practice = words.sort(() => Math.random() - 0.5).slice(0, 10);
  state.words = practice.map(w => ({ word: w.word, chinese: w.chinese, phonetic: "", pos: "" }));
  state.wordHistory = [];
  state.currentIndex = -1;
  
  el.learnPanel.classList.remove("hidden");
  nextQuestion();
}

function startLearnedReview() {
  state.practiceMode = false;
  const words = [];
  Object.values(state.appState.progress).forEach(map => {
    Object.values(map).forEach(item => words.push(item));
  });
  
  if (!words.length) {
    alert("还没有学习过单词");
    return;
  }

  const review = words.sort(() => Math.random() - 0.5).slice(0, 5);
  state.words = review.map(w => ({ word: w.word, chinese: w.chinese, phonetic: "", pos: "" }));
  state.wordHistory = [];
  state.currentIndex = -1;
  nextQuestion();
}

function renderPagination(containerId, currentPage, totalPages, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = "";
    return;
  }

  container.innerHTML = "";
  
  const prevBtn = document.createElement("button");
  prevBtn.className = "btn ghost";
  prevBtn.textContent = "上一页";
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => onPageChange(currentPage - 1));
  container.appendChild(prevBtn);

  const pageInfo = document.createElement("span");
  pageInfo.className = "page-info";
  pageInfo.textContent = ` ${currentPage} / ${totalPages} `;
  container.appendChild(pageInfo);

  const nextBtn = document.createElement("button");
  nextBtn.className = "btn ghost";
  nextBtn.textContent = "下一页";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => onPageChange(currentPage + 1));
  container.appendChild(nextBtn);
}

function renderCalendar() {
  if (!state.appState) return;
  const calendar = state.appState.calendar || {};
  const totalDays = Object.keys(calendar).length;
  const totalWords = Object.values(state.appState.dailyCount || {}).reduce((a, b) => a + b, 0);

  let streak = 0;
  const dates = Object.keys(calendar).sort().reverse();
  for (let i = 0; i < dates.length - 1; i++) {
    const d1 = new Date(dates[i]);
    const d2 = new Date(dates[i + 1]);
    const diff = (d1 - d2) / (1000 * 60 * 60 * 24);
    if (diff === 1) streak++;
    else break;
  }
  if (dates.length > 0) streak++;

  if (el.totalDays) el.totalDays.textContent = totalDays;
  if (el.totalWords) el.totalWords.textContent = totalWords;
  if (el.streakDays) el.streakDays.textContent = streak;

  if (!el.calendarGrid) return;

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = "";
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  weekdays.forEach(d => html += `<div class="calendar-weekday">${d}</div>`);

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dk = dateKey(date);
    const count = calendar[dk] || 0;
    const isToday = dk === dateKey(today);
    const hasLearned = count > 0 ? "has-learned" : "";
    const achieved = count >= DAILY_GOAL ? "achieved" : "";
    html += `<div class="calendar-day ${isToday ? 'today' : ''} ${hasLearned} ${achieved}">
      <span class="day-num">${day}</span>
      <span class="day-count">${count || ''}</span>
    </div>`;
  }
  el.calendarGrid.innerHTML = html;
}

function renderStats() {
  if (!state.appState) return;
  const stats = computeStats();
  const progress = Math.min(100, Math.round((stats.todayCount / DAILY_GOAL) * 100));
  const status = stats.todayCount >= DAILY_GOAL ? "✅ 已完成" : `${stats.todayCount}/${DAILY_GOAL}`;

  el.statsGrid.innerHTML = `
    <div class="stat goal-stat ${stats.todayCount >= DAILY_GOAL ? 'completed' : ''}">
      <div class="label">今日目标 (${status})</div>
      <div class="value">${stats.todayCount}/${DAILY_GOAL}</div>
      <div class="mini-progress"><div class="mini-fill" style="width:${progress}%"></div></div>
    </div>
    <div class="stat"><div class="label">本周正确率</div><div class="value">${stats.weeklyAccuracy}%</div></div>
    <div class="stat"><div class="label">🟢 已掌握</div><div class="value">${stats.colorCount.green}</div></div>
    <div class="stat"><div class="label">🟡 待巩固</div><div class="value">${stats.colorCount.yellow}</div></div>
    <div class="stat"><div class="label">🔴 错词本</div><div class="value">${stats.colorCount.red}</div></div>
    <div class="stat"><div class="label">累计学习</div><div class="value">${stats.totalLearned}</div></div>
  `;
}

function computeStats() {
  const today = dateKey(new Date());
  const todayCount = state.appState.dailyCount[today] || 0;
  const totalLearned = Object.values(state.appState.dailyCount || {}).reduce((a, b) => a + b, 0);

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recent = (state.appState.quizLogs || []).filter(x => x.ts >= weekAgo);
  const correct = recent.filter(x => x.correct).length;
  const weeklyAccuracy = recent.length ? Math.round((correct / recent.length) * 100) : 0;

  const colorCount = { red: 0, yellow: 0, green: 0 };
  Object.values(state.appState.progress).forEach(map => {
    Object.values(map).forEach(item => {
      if (colorCount[item.mark] !== undefined) colorCount[item.mark]++;
    });
  });

  return { todayCount, weeklyAccuracy, colorCount, totalLearned };
}

function pronounceCurrentWord() {
  if (!state.currentWord) return;
  const type = getPronounceType();
  const audio = new Audio(`https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(state.currentWord.word)}&type=${type}`);
  audio.play().catch(() => {
    if (window.speechSynthesis) {
      const utter = new SpeechSynthesisUtterance(state.currentWord.word);
      utter.lang = type === 2 ? "en-GB" : "en-US";
      window.speechSynthesis.speak(utter);
    }
  });
}

function getRootTip(word) {
  if (!word || word.length < 7) return "";
  const lower = word.toLowerCase();
  const prefixes = ["un", "re", "pre", "inter", "auto", "micro", "tele", "trans", "dis", "im", "in"];
  const suffixes = ["tion", "sion", "ment", "ness", "able", "less", "ful", "ing", "er", "ly"];
  
  const pre = prefixes.find(p => lower.startsWith(p));
  const suf = suffixes.find(s => lower.endsWith(s));
  if (!pre && !suf) return "";
  
  const stem = word.slice(pre ? pre.length : 0, suf ? lower.length - suf.length : word.length);
  if (pre && suf) return `词根: ${pre}- + ${stem} + -${suf}`;
  if (pre) return `词根: ${pre}- + ${stem}`;
  return `词根: ${stem} + -${suf}`;
}

function countLearnedWords(bookKey) {
  if (!state.appState) return 0;
  return Object.keys(state.appState.progress[bookKey] || {}).length;
}

function getTodayLearnedCount() {
  if (!state.appState) return 0;
  return state.appState.dailyCount[dateKey(new Date())] || 0;
}

function incrementTodayCount() {
  const key = dateKey(new Date());
  state.appState.dailyCount[key] = (state.appState.dailyCount[key] || 0) + 1;
}

function updateCalendar() {
  const key = dateKey(new Date());
  state.appState.calendar[key] = (state.appState.calendar[key] || 0) + 1;
}

function pushQuizLog(correct) {
  if (!state.appState.quizLogs) state.appState.quizLogs = [];
  state.appState.quizLogs.push({ ts: Date.now(), correct });
  if (state.appState.quizLogs.length > 2000) {
    state.appState.quizLogs = state.appState.quizLogs.slice(-1000);
  }
}

function generateOptions(correctWord, allWords) {
  const options = [correctWord];
  const candidates = allWords.filter(w => w.word !== correctWord.word && w.chinese !== correctWord.chinese);
  while (options.length < 4 && candidates.length) {
    const idx = Math.floor(Math.random() * candidates.length);
    options.push(candidates.splice(idx, 1)[0]);
  }
  return options.sort(() => Math.random() - 0.5);
}

function wordId(word) {
  return `${(word.word || "").toLowerCase()}__${word.chinese || ""}`;
}

function getPronounceType() {
  return state.appState?.pronounceType || 1;
}

function setPronounceType(type) {
  state.appState.pronounceType = type;
  saveCurrentUserState();
}

function saveCurrentUserState() {
  if (!state.currentUser) return;
  const global = loadGlobalData();
  global.users[state.currentUser] = state.appState;
  saveGlobalData(global);
}

function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// 启动
init();
