(function () {
  "use strict";

  const versionEl = document.getElementById("latest-version");
  const dateEl = document.getElementById("latest-date");
  const dlBtn = document.getElementById("download-btn");
  const fallbackNote = document.getElementById("fallback-note");

  const API = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/releases`;

  function renderError(msg) {
    if (fallbackNote) {
      fallbackNote.textContent = msg;
      fallbackNote.hidden = false;
    }
  }

  function formatNumber(n) {
    return new Intl.NumberFormat("it-IT").format(n);
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("it-IT", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch (e) {
      return iso;
    }
  }

  fetch(API, { headers: { Accept: "application/vnd.github+json" } })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (releases) {
      if (!Array.isArray(releases) || releases.length === 0) {
        renderError("Nessuna release disponibile al momento.");
        return;
      }

      const latestRelease = releases.find(function (rel) {
        return !rel.draft && rel.assets && rel.assets.length;
      });

      if (!latestRelease) {
        renderError("Nessuna release disponibile al momento.");
        return;
      }

      if (versionEl) versionEl.textContent = latestRelease.tag_name || "";
      if (dateEl) dateEl.textContent = formatDate(latestRelease.published_at || latestRelease.created_at);

      const apk = (latestRelease.assets || []).find(function (a) {
        return a.name && a.name.endsWith(CONFIG.apkNameHint || ".apk");
      });

      if (apk && dlBtn) {
        dlBtn.href = apk.browser_download_url;
        const sizeEl = document.getElementById("apk-size");
        if (sizeEl && apk.size) {
          sizeEl.textContent = "(" + formatNumber(Math.round(apk.size / 1024 / 1024)) + " MB)";
        }
      }
    })
    .catch(function (err) {
      console.error(err);
      renderError("Impossibile recuperare le informazioni della release. Riprova piu tardi.");
    });
})();
