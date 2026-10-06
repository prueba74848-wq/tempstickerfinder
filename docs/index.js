(function () {
  "use strict";
  var module = { exports: {} };

  var WANTED = ["cheerful choco", "robo nelly", "clyde bot", "doggo replies", "wumpus beyond", "sassy peach"];
  var STICKER_NAMES = ["wave", "sup", "scream"];

  var logger = vendetta.logger;

  function lower(s) {
    return String(s == null ? "" : s).toLowerCase();
  }

  function toast(text) {
    try {
      vendetta.ui.toasts.showToast(text, vendetta.ui.assets.getAssetIDByName("Small"));
    } catch (e) {
      logger.log("[StickerIDFinder] toast failed: " + String(e));
    }
  }

  function copy(text) {
    try {
      var cb = vendetta.metro.common.clipboard || vendetta.metro.findByProps("setString", "getString");
      cb.setString(text);
      return true;
    } catch (e) {
      logger.log("[StickerIDFinder] clipboard failed: " + String(e));
      return false;
    }
  }

  function run() {
    return fetch("https://discord.com/api/v10/sticker-packs")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var packs = data.sticker_packs || [];
        var lines = [];
        var found = {};

        packs.forEach(function (pack) {
          var pname = lower(pack.name);
          var hit = WANTED.filter(function (w) { return pname.indexOf(w) !== -1; })[0];
          if (!hit) return;
          found[hit] = true;
          var matches = (pack.stickers || []).filter(function (s) {
            return STICKER_NAMES.indexOf(lower(s.name)) !== -1;
          });
          if (!matches.length) {
            lines.push(pack.name + ": no Wave/Sup/Scream sticker");
          }
          matches.forEach(function (s) {
            lines.push(pack.name + " | " + s.name + " | " + s.id);
          });
        });

        WANTED.forEach(function (w) {
          if (!found[w]) lines.push("PACK NOT FOUND BY NAME: " + w);
        });

        var text = lines.join("\n");
        logger.log("[StickerIDFinder]\n" + text);
        toast(copy(text) ? "Sticker IDs copied, paste them in the chat" : "Could not copy, check the debug logs");
      })
      .catch(function (e) {
        logger.error("[StickerIDFinder] failed", e);
        toast("Sticker finder failed, check the debug logs");
      });
  }

  module.exports = {
    onLoad: function () {
      run();
    },
    onUnload: function () {}
  };

  return module.exports;
})();
