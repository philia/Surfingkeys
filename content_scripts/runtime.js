var runtime = window.runtime || (function() {
    var self = {
        successById: {},
        actions: {},
        runtime_handlers: {}
    };
    var _port = chrome.runtime.connect({
        name: 'main'
    });
    self.actions['initSettings'] = function(response) {
        self.settings = response.settings;
        $(document).trigger("surfingkeys:connected");
    };
    _port.onMessage.addListener(function(_message) {
        if (self.successById[_message.id]) {
            var f = self.successById[_message.id];
            delete self.successById[_message.id];
            f(_message);
        } else if (self.actions[_message.action]) {
            var result = {
                id: _message.id,
                action: _message.action
            };
            result.data = self.actions[_message.action](_message);
            if (_message.ack) {
                _port.postMessage(result);
            }
        } else {
            console.log("[unexpected runtime message] " + JSON.stringify(_message))
        }
    });

    self.command = function(args, successById) {
        args.id = generateQuickGuid();
        if (successById) {
            self.successById[args.id] = successById;
            args.ack = true;
        }
        _port.postMessage(args);
    };
    self.frontendCommand = function(args, successById) {
        args.toFrontend = true;
        self.command(args, successById);
    };
    self.contentCommand = function(args, successById) {
        args.toContent = true;
        self.command(args, successById);
    };
    self.updateHistory = function(type, cmd) {
        var prop = type + 'History';
        var list = self.settings[prop];
        if (cmd.length) {
            list = list.filter(function(c) {
                return c.length && c !== cmd;
            });
            list.unshift(cmd);
            if (list.length > 50) {
                list.pop();
            }
            var toUpdate = {};
            toUpdate[prop] = list;
            self.command({
                action: 'updateSettings',
                settings: toUpdate
            });
        }
    };

    chrome.runtime.onMessage.addListener(function(msg, sender, response) {
        if (msg.target === 'content_runtime') {
            if (self.runtime_handlers[msg.subject]) {
                self.runtime_handlers[msg.subject](msg, sender, response);
            } else {
                console.log("[unexpected runtime message] " + JSON.stringify(msg))
            }
        }
    });

    return self;
})();
