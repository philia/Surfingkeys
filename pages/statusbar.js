var StatusBar = (function(ui) {
    var self = {};

    var timerHide = null;
    self.show = function(n, content, duration) {
        if (timerHide) {
            clearTimeout(timerHide);
            timerHide = null;
        }
        var span = ui.find('span');
        if (n < 0) {
            span.html("");
        } else {
            $(span[n]).html("").append(content);
        }
        var lastSpan = -1;
        for (var i = 0; i < span.length; i++) {
            if ($(span[i]).html().length) {
                lastSpan = i;
                $(span[i]).css('padding', '0px 8px');
                $(span[i]).css('border-right', '1px solid #999');
            } else {
                $(span[i]).css('padding', '');
                $(span[i]).css('border-right', '');
            }
        }
        $(span[lastSpan]).css('border-right', '');
        ui.css('display', lastSpan === -1 ? 'none' : 'block');
        frontendUI.flush();
        if (duration) {
            timerHide = setTimeout(function() {
                ui.css('display', 'none');
            }, duration);
        }
    };
    return self;
})(frontendUI.statusBar);

var Find = (function() {
    var self = {};

    var input = $('<input id="sk_find" class="sk_theme"/>');
    var historyInc;
    function reset() {
        input.val('');
        StatusBar.show(-1, '');
        Insert.exit();
        Insert.suppressKeyEsc = true;
    }

    self.open = function() {
        historyInc = -1;
        StatusBar.show(0, "/");
        StatusBar.show(1, input);
        input.on('input', function() {
            runtime.contentCommand({
                action: 'visualUpdate',
                query: input.val()
            });
        });
        input[0].onkeydown = function(event) {
            if (event.keyCode === KeyboardUtils.keyCodes.ESC) {
                runtime.contentCommand({
                    action: 'visualClear'
                });
                reset();
            } else if (event.keyCode === KeyboardUtils.keyCodes.enter) {
                var query = input.val();
                reset();
                runtime.updateHistory('find', query);
                runtime.contentCommand({
                    action: 'visualEnter',
                    query: query
                });
            } else if (event.keyCode === KeyboardUtils.keyCodes.upArrow || event.keyCode === KeyboardUtils.keyCodes.downArrow) {
                if (runtime.settings.findHistory.length) {
                    historyInc = (event.keyCode === KeyboardUtils.keyCodes.upArrow) ? (historyInc + 1) : (historyInc + runtime.settings.findHistory.length - 1);
                    historyInc = historyInc % runtime.settings.findHistory.length;
                    var query = runtime.settings.findHistory[historyInc];
                    input.val(query);
                    runtime.contentCommand({
                        action: 'visualUpdate',
                        query: query
                    });
                }
            }
        };
        input.focus();
        Insert.suppressKeyEsc = false;
        Insert.enter();
    };
    return self;
})();
