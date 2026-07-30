// 共用的注音排版與自動注音產生邏輯，沿用「注音手動排版元件」的核心設計。
// 由 match-game / flashcard / zhuyin-quiz / collection-map 四個頁面共用。
function renderZhuyinText(pairs, options) {
  options = options || {};
  var hanziSize = options.hanziSize || 48;
  var ratio = options.ratio || 0.22;
  var gap = options.gap != null ? options.gap : 4;
  var charGap = options.charGap != null ? options.charGap : 6;
  var color = options.color || 'inherit';
  var TONE_MARKS = { 'ˊ': 1, 'ˇ': 1, 'ˋ': 1 };
  var LIGHT_TONE = '˙';
  var zySize = Math.round(hanziSize * ratio * 100) / 100;

  function parseZhuyin(zy) {
    if (!zy) return null;
    var chars = Array.from(zy).filter(function(c){ return c.trim() !== ''; });
    if (!chars.length) return null;
    var light = false, tone = null;
    if (chars[0] === LIGHT_TONE) { light = true; chars = chars.slice(1); }
    else if (chars[chars.length - 1] === LIGHT_TONE) { light = true; chars = chars.slice(0, -1); }
    else if (chars.length && TONE_MARKS[chars[chars.length - 1]]) { tone = chars[chars.length - 1]; chars = chars.slice(0, -1); }
    return { letters: chars.slice(0, 3), tone: tone, light: light };
  }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function renderColumn(parsed) {
    if (!parsed) return '';
    var letters = parsed.letters, tone = parsed.tone, light = parsed.light, rows = [];
    if (light) rows.push('<span style="display:block;line-height:1;font-size:'+zySize+'px;font-weight:800;">'+esc(LIGHT_TONE)+'</span>');
    letters.forEach(function(letter, i) {
      var isLast = i === letters.length - 1;
      if (isLast) {
        // 不管這個字有沒有聲調，都保留同樣寬度的「聲調欄位」（沒聲調就隱形），
        // 這樣同一題裡每個選項的總寬度才會一致，置中時每一行才會對齊整齊
        var toneHtml = tone
          ? '<span style="display:inline-block;width:0.55em;font-size:0.9em;line-height:1;transform:translateY(-0.25em);margin-left:1px;">'+esc(tone)+'</span>'
          : '<span style="display:inline-block;width:0.55em;margin-left:1px;visibility:hidden;">ˇ</span>';
        rows.push('<span style="display:flex;align-items:flex-start;line-height:1;font-size:'+zySize+'px;font-weight:800;"><span>'+esc(letter)+'</span>'+toneHtml+'</span>');
      } else {
        rows.push('<span style="display:block;line-height:1;font-size:'+zySize+'px;font-weight:800;">'+esc(letter)+'</span>');
      }
    });
    return '<span style="display:inline-flex;flex-direction:column;align-items:flex-start;justify-content:center;line-height:1;margin-left:'+gap+'px;">'+rows.join('')+'</span>';
  }
  var unitsHtml = pairs.map(function (pair) {
    var hanzi = pair[0], zy = pair[1];
    var colHtml = renderColumn(parseZhuyin(zy));
    return '<span style="display:inline-flex;align-items:center;margin:0 '+(charGap/2)+'px;"><span style="font-size:'+hanziSize+'px;line-height:1;font-weight:700;">'+esc(hanzi)+'</span>'+colHtml+'</span>';
  });
  return '<span style="display:inline-flex;flex-wrap:wrap;justify-content:center;align-items:center;color:'+color+';">'+unitsHtml.join('')+'</span>';
}

var ZHUYIN_TONE_MARK_TABLE = { a:["ā","á","ǎ","à"], e:["ē","é","ě","è"], i:["ī","í","ǐ","ì"], o:["ō","ó","ǒ","ò"], u:["ū","ú","ǔ","ù"], "ü":["ǖ","ǘ","ǚ","ǜ"] };
var ZHUYIN_TONE_MARK_REVERSE = (function () {
  var map = {};
  Object.keys(ZHUYIN_TONE_MARK_TABLE).forEach(function (base) {
    ZHUYIN_TONE_MARK_TABLE[base].forEach(function (ch, idx) { map[ch] = { base: base, tone: idx + 1 }; });
  });
  return map;
})();
var ZHUYIN_BPMF_TRANSFORMS = [
  { "・": " " }, { "v": "ü" },
  { yao:"ㄧㄠ", you:"ㄧㄡ", yue:"ㄩㄝ", yong:"ㄩㄥ", yuan:"ㄩㄢ", ying:"ㄧㄥ", yun:"ㄩㄣ", yang:"ㄧㄤ", yan:"ㄧㄢ", yin:"ㄧㄣ", yai:"ㄧㄞ", wei:"ㄨㄟ", wang:"ㄨㄤ", wan:"ㄨㄢ", weng:"ㄨㄥ", wen:"ㄨㄣ", wai:"ㄨㄞ" },
  { iang:"ㄧㄤ", ing:"ㄧㄥ" },
  { iai:"ㄧㄞ", iao:"ㄧㄠ", iu:"ㄧㄡ", ian:"ㄧㄢ", in:"ㄧㄣ" },
  { uai:"ㄨㄞ", uang:"ㄨㄤ", uan:"ㄨㄢ", ua:"ㄨㄚ", uo:"ㄨㄛ", ui:"ㄨㄟ", un:"ㄨㄣ", "ün":"ㄩㄣ", iong:"ㄩㄥ", ong:"ㄨㄥ" },
  { uan:"ㄩㄢ", un:"ㄩㄣ", ong:"ㄩㄥ", ue:"ㄩㄝ" },
  { zhi:"ㄓ", chi:"ㄔ", shi:"ㄕ", ri:"ㄖ", ang:"ㄤ", eng:"ㄥ", ai:"ㄞ", ei:"ㄟ", ao:"ㄠ", ou:"ㄡ", er:"ㄦ" },
  { an:"ㄢ", en:"ㄣ", wa:"ㄨㄚ", wo:"ㄨㄛ", wu:"ㄨ", ya:"ㄧㄚ", yo:"ㄧㄛ", ye:"ㄧㄝ", yu:"ㄩ" },
  { ia:"ㄧㄚ", io:"ㄧㄛ", ie:"ㄧㄝ" },
  { zh:"ㄓ", ch:"ㄔ", sh:"ㄕ", zi:"ㄗ", ci:"ㄘ", si:"ㄙ", r:"ㄖ", yi:"ㄧ", "üe":"ㄩㄝ" },
  { b:"ㄅ", p:"ㄆ", m:"ㄇ", f:"ㄈ", d:"ㄉ", t:"ㄊ", n:"ㄋ", l:"ㄌ", g:"ㄍ", k:"ㄎ", h:"ㄏ", j:"ㄐ", q:"ㄑ", x:"ㄒ", z:"ㄗ", c:"ㄘ", s:"ㄙ", i:"ㄧ", u:"ㄨ", "ü":"ㄩ", a:"ㄚ", o:"ㄛ", e:"ㄜ" },
  { "(ㄐ|ㄑ|ㄒ)ㄨ": "$1ㄩ" }, { "'": " " }
];
function zhuyinSyllableLetters(plain) {
  var out = plain.toLowerCase();
  ZHUYIN_BPMF_TRANSFORMS.forEach(function (rule) {
    Object.keys(rule).forEach(function (pat) { out = out.replace(new RegExp(pat, 'g'), rule[pat]); });
  });
  return out;
}
function pinyinSyllableToZhuyin(marked) {
  var tone = null, plain = '', found = false;
  Array.from(marked).forEach(function (ch) {
    if (!found && ZHUYIN_TONE_MARK_REVERSE[ch]) { var info = ZHUYIN_TONE_MARK_REVERSE[ch]; plain += info.base; tone = info.tone; found = true; }
    else { plain += ch; }
  });
  if (!found) tone = 5;
  var letters = zhuyinSyllableLetters(plain);
  var TONE_SYMBOL = { 1:'', 2:'ˊ', 3:'ˇ', 4:'ˋ', 5:'˙' };
  var sym = TONE_SYMBOL[tone];
  return tone === 5 ? (sym + letters) : (letters + sym);
}
function generateZhuyinPairs(text) {
  if (typeof window === 'undefined' || !window.pinyinPro) return { pairs: Array.from(text).map(function(c){return [c,'']; }) };
  var chars = Array.from(text || '');
  if (!chars.length) return { pairs: [] };
  var contextPinyin = window.pinyinPro.pinyin(text, { type: 'array' });
  var pairs = [];
  chars.forEach(function (ch, i) {
    var isHanzi = /[㐀-鿿]/.test(ch);
    if (!isHanzi) { pairs.push([ch, '']); return; }
    pairs.push([ch, pinyinSyllableToZhuyin(contextPinyin[i] || ch)]);
  });
  return { pairs: pairs };
}
