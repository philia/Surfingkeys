function generateQuickGuid() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function htmlEncode(str) {
    return $('<div/>').text(str).html();
}

function htmlDecode(str) {
    return $('<div/>').html(str).text();
}
function isEditable(element) {
    return element.localName === 'input' || element.localName === 'textarea' || element.localName === 'select' || element.isContentEditable;
}

String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{' + i + '\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};

(function($) {
    $.fn.regex = function(pattern, fn, fn_a) {
        var fn = fn || $.fn.text;
        return this.filter(function() {
            return pattern.test(fn.apply($(this), fn_a));
        });
    };
    $.expr[':'].css = function(elem, pos, match) {
        var sel = match[3].split('=');
        return $(elem).css(sel[0]) == sel[1];
    };
    $.fn.topInView = function() {
        return this.filter(function() {
            return $(this).width() * $(this).height() > 0 && $(this).offset().top > document.body.scrollTop;
        });
    };
})(jQuery);

(function() {
    var KeyboardUtils, root;

    KeyboardUtils = {
        keyCodes: {
            ESC: 27,
            backspace: 8,
            deleteKey: 46,
            enter: 13,
            ctrlEnter: 10,
            space: 32,
            shiftKey: 16,
            ctrlKey: 17,
            f1: 112,
            f12: 123,
            comma: 188,
            tab: 9,
            downArrow: 40,
            upArrow: 38
        },
        keyNames: {
            8:   'Backspace',
            9:   'Tab',
            12:  'NumLock',
            27:  'Esc',
            32:  'Space',
            46:  'Delete',
        },
        keyIdentifierCorrectionMap: {
            "U+00C0": ["U+0060", "U+007E"],
            "U+0030": ["U+0030", "U+0029"],
            "U+0031": ["U+0031", "U+0021"],
            "U+0032": ["U+0032", "U+0040"],
            "U+0033": ["U+0033", "U+0023"],
            "U+0034": ["U+0034", "U+0024"],
            "U+0035": ["U+0035", "U+0025"],
            "U+0036": ["U+0036", "U+005E"],
            "U+0037": ["U+0037", "U+0026"],
            "U+0038": ["U+0038", "U+002A"],
            "U+0039": ["U+0039", "U+0028"],
            "U+00BD": ["U+002D", "U+005F"],
            "U+00BB": ["U+003D", "U+002B"],
            "U+00DB": ["U+005B", "U+007B"],
            "U+00DD": ["U+005D", "U+007D"],
            "U+00DC": ["U+005C", "U+007C"],
            "U+00BA": ["U+003B", "U+003A"],
            "U+00DE": ["U+0027", "U+0022"],
            "U+00BC": ["U+002C", "U+003C"],
            "U+00BE": ["U+002E", "U+003E"],
            "U+00BF": ["U+002F", "U+003F"]
        },
        init: function() {
            if (navigator.platform.indexOf("Mac") !== -1) {
                return this.platform = "Mac";
            } else if (navigator.userAgent.indexOf("Linux") !== -1) {
                return this.platform = "Linux";
            } else {
                return this.platform = "Windows";
            }
        },
        getKeyChar: function(event) {
            var character, correctedIdentifiers, keyIdentifier, unicodeKeyInHex;
            if (event.keyIdentifier.slice(0, 2) !== "U+") {
                character = "<{0}>".format(event.keyIdentifier);
            } else if (this.keyNames.hasOwnProperty(event.keyCode)) {
                character = "<{0}>".format(this.keyNames[event.keyCode]);
            } else {
                keyIdentifier = event.keyIdentifier;
                if ((this.platform === "Windows" || this.platform === "Linux") && this.keyIdentifierCorrectionMap[keyIdentifier]) {
                    correctedIdentifiers = this.keyIdentifierCorrectionMap[keyIdentifier];
                    keyIdentifier = event.shiftKey ? correctedIdentifiers[1] : correctedIdentifiers[0];
                }
                unicodeKeyInHex = "0x" + keyIdentifier.substring(2);
                character = String.fromCharCode(parseInt(unicodeKeyInHex));
                character = event.shiftKey ? character : character.toLowerCase();
                if (event.ctrlKey) {
                    character = "<Ctrl-{0}>".format(character);
                }
                if (event.altKey) {
                    character = "<Alt-{0}>".format(character);
                }
                if (event.metaKey) {
                    character = "<Meta-{0}>".format(character);
                }
            }
            return character;
        },
        isPrimaryModifierKey: function(event) {
            if (this.platform === "Mac") {
                return event.metaKey;
            } else {
                return event.ctrlKey;
            }
        },
        isEscape: function(event) {
            return (event.keyCode === this.keyCodes.ESC) || (event.ctrlKey && this.getKeyChar(event) === '[');
        },
        isWordChar: function(event) {
            return (event.keyCode < 123 && event.keyCode >= 97 || event.keyCode < 91 && event.keyCode >= 65 || event.keyCode < 58 && event.keyCode >= 48);
        },
        isPrintable: function(event) {
            var keyChar;
            if (event.metaKey || event.ctrlKey || event.altKey) {
                return false;
            }
            keyChar = event.type === "keypress" ? String.fromCharCode(event.charCode) : this.getKeyChar(event);
            return keyChar.length === 1;
        }
    };

    KeyboardUtils.init();

    root = typeof exports !== "undefined" && exports !== null ? exports : window;

    root.KeyboardUtils = KeyboardUtils;

    root.keyCodes = KeyboardUtils.keyCodes;

}).call(this);
