(function () {
  // Compatibility shim: legacy layouts reference this file.
  // Keep it safe/no-op when notification wiring is not configured.
  window.TopbarNotifications = window.TopbarNotifications || {
    init: function () { return; }
  };
})();