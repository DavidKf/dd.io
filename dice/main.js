"use strict";

function dice_initialize(container) {
    $t.remove($t.id('loading_text'));

    var buttons = document.querySelectorAll('button').length;
    for (var i = 0; i < buttons; i++) {
        document.querySelectorAll('button')[i].style.backgroundColor = coloru;
        document.querySelectorAll('button')[i].style.color = coloruLabel;
    }

    document.getElementById('body').style.backgroundColor = 'black';

    var canvas = $t.id('canvas');
    canvas.style.width = window.innerWidth - 1 + 'px';
    canvas.style.height = window.innerHeight - 1 + 'px';
    var label = $t.id('label');
    var set = $t.id('set');
    var selector_div = $t.id('selector_div');
    var color_picker_wrapper = $t.id('color-picker-wrapper');
    var info_div = $t.id('info_div');
    on_set_change();

    $t.dice.use_true_random = false;

    function on_set_change(ev) { set.style.width = set.value.length + 3 + 'ex'; }
    $t.bind(set, 'keyup', on_set_change);
    $t.bind(set, 'mousedown', function(ev) { ev.stopPropagation(); });
    $t.bind(set, 'mouseup', function(ev) { ev.stopPropagation(); });
    $t.bind(set, 'focus', function(ev) { $t.set(container, { class: '' }); });
    $t.bind(set, 'blur', function(ev) { $t.set(container, { class: 'noselect' }); });

    $t.bind($t.id('clear'), ['mouseup', 'touchend'], function(ev) {
        ev.stopPropagation();
        set.value = '0';
        on_set_change();
    });

    $t.bind($t.id('limpar_historia'), ['mouseup', 'touchend'], function(ev) {
        ev.stopPropagation();
        label_last.innerHTML = '';
    });

    var box = new $t.dice.dice_box(canvas, { w: 500, h: 300 });
    box.animate_selector = false;

    $t.bind(window, 'resize', function() {
        canvas.style.width = window.innerWidth - 1 + 'px';
        canvas.style.height = window.innerHeight - 1 + 'px';
        box.reinit(canvas, { w: 500, h: 300 });
    });

    function show_selector() {
        info_div.style.display = 'none';
        results.style.display = 'none';
        selector_div.style.display = 'inline-block';
        color_picker_wrapper.style.display = 'block';
        box.draw_selector();
    }

    function before_roll(vectors, notation, callback) {
        info_div.style.display = 'none';
        selector_div.style.display = 'none';
        results.style.display = 'none';
        color_picker_wrapper.style.display = 'none';
        // do here rpc call or whatever to get your own result of throw.
        // then callback with array of your result, example:
        // callback([2, 2, 2, 2]); // for 4d6 where all dice values are 2.
        callback();
    }

    function notation_getter() {
        return $t.dice.parse_notation(set.value);
    }

    function after_roll(notation, result) {
        var droped_value = 0;

        if (notation.dl) {
            result.sort(function(a, b) { return b - a });
            droped_value = result[result.length - 1];
            result.pop();
        }

        var res = result.join(' ');
        if (notation.constant) res += ' + ' + notation.constant;
        if (result.length >= 1) res += ' = ' +
            (result.reduce(function(s, a) { return s + a; }) + notation.constant);

        if (notation.dl) {
            label.innerHTML = '(' + droped_value + ') ' + res;
            if (label_last.innerHTML.length > 0) {
                label_last.innerHTML += '<br> (' + droped_value + ') ' + res;
            } else {
                label_last.innerHTML += '(' + droped_value + ') ' + res;
            }
        } else {
            label.innerHTML = res;
            if (label_last.innerHTML.length > 0) {
                label_last.innerHTML += '<br> ' + res;
            } else {
                label_last.innerHTML += res;
            }
        }

        if (results.innerHTML.length > 354) {
            results.style.display = 'inline-block';
        } else {
            results.style.display = 'none';
        }

        info_div.style.display = 'inline-block';
    }

    box.bind_mouse(container, notation_getter, before_roll, after_roll);
    box.bind_throw($t.id('throw'), notation_getter, before_roll, after_roll);

    $t.bind(container, ['mouseup'], function(ev) {
        // ev.stopPropagation();
        if (selector_div.style.display == 'none') {
            if (!box.rolling) show_selector();
            box.rolling = false;
            return;
        }
        var name = box.search_dice_by_mouse(ev);
        if (name != undefined) {
            var notation = $t.dice.parse_notation(set.value);
            notation.set.push(name);
            set.value = $t.dice.stringify_notation(notation);
            on_set_change();
        }
    });

    var params = $t.get_url_params();
    if (params.notation) {
        set.value = params.notation;
    }
    if (params.roll) {
        $t.raise_event($t.id('throw'), 'mouseup');
    } else {
        show_selector();
    }
}