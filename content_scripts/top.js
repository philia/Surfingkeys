var frontendFrame = (function() {
    var self = {};
    var uiHost = document.createElement("div");
    var frontEndURL = chrome.runtime.getURL('pages/frontend.html');
    var ifr = $('<iframe allowtransparency=true frameborder=0 scrolling=no class=sk_ui src="{0}" />'.format(frontEndURL));
    uiHost.createShadowRoot();
    var sk_style = document.createElement("style");
    sk_style.innerHTML = '@import url("{0}");'.format(chrome.runtime.getURL("pages/shadow.css"));
    uiHost.shadowRoot.appendChild(sk_style);
    ifr.appendTo(uiHost.shadowRoot);

    function initPort() {
        this.contentWindow.postMessage({
            action: 'initPort',
            from: 'top'
        }, frontEndURL, [this.channel.port2]);
        self.contentWindow = this.contentWindow;
        $(document).trigger("surfingkeys:frontendReady");
    }

    self.setFrontFrame = function(response) {
        ifr.css('height', response.frameHeight);
        ifr.css('pointer-events', response.pointerEvents);
        if (response.frameHeight === '0px') {
            uiHost.blur();
        }
    };
    self.create = function() {
        ifr[0].channel = new MessageChannel();
        ifr[0].channel.port1.onmessage = function(message) {
            var _message = message.data;
            if (_message.action && self.hasOwnProperty(_message.action)) {
                var ret = self[_message.action](_message);
                if (ret) {
                    _message.data = ret;
                    self.contentWindow.postMessage(_message, frontEndURL);
                }
            }
        };
        ifr[0].removeEventListener("load", initPort, false);
        ifr[0].addEventListener("load", initPort, false);

        document.body.appendChild(uiHost);
    };

    return self;
})();

runtime.command({
    action: 'getSettings',
    key: ['blacklist', 'blacklistPattern']
}, function(response) {
    if (checkBlackList(response.settings)) {
        runtime.command({
            action: 'setSurfingkeysIcon',
            status: true
        });
    }
});

runtime.on('settingsUpdated', function(response) {
    if ('blacklist' in response.settings) {
        runtime.command({
            action: 'setSurfingkeysIcon',
            status: checkBlackList(response.settings)
        });
    }
});

document.addEventListener('DOMContentLoaded', function(e) {

    runtime.command({
        action: 'tabURLAccessed',
        title: document.title,
        url: window.location.href
    });

    var fakeBody = $('body[createdBySurfingkeys=1]');
    if (fakeBody.length) {
        fakeBody.remove();
        frontendFrame.contentWindow = null;
    }
    createFrontEnd();
    setTimeout(function() {
        for (var p in AutoCommands) {
            var c = AutoCommands[p];
            if (c.regex.test(window.location.href)) {
                c.code();
            }
        }
    }, 0);
});
function createFrontEnd() {
    var frontendReady = frontendFrame.contentWindow && frontendFrame.contentWindow.top === top;
    if (!frontendReady) {
        if (!document.body) {
            var dom = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', null);
            var body = dom.createElement("body");
            $(body).attr('createdBySurfingkeys', 1);
            document.documentElement.appendChild(body);
        }
        frontendFrame.create();
        frontendReady = true;
    }
    return frontendReady;
}

function _setScrollPos(x, y) {
    $(document).ready(function() {
        document.body.scrollLeft = x;
        document.body.scrollTop = y;
    });
}

function _prepareFrames() {
    var frames = Array.prototype.slice.call(top.document.querySelectorAll('iframe')).map(function(f) {
        return f.contentWindow;
    });
    frames.unshift(top);
    frames = frames.map(function(f) {
        try {
            f.frameId = f.frameId || generateQuickGuid();
            if (f.frameElement) {
                var rc = f.frameElement.getBoundingClientRect();
                if (rc.width * rc.height === 0) {
                    return null;
                }
            }
        } catch (e) {
            return null;
        }
        return f.frameId;
    });
    return frames.filter(function(f) {
        return f !== null;
    });
}
