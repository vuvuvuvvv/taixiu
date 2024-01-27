var total_money = 100000, current_bet_lv = 1, total_bet = 0, all = false;
var results = [];
var isDragging = false;
var offsetX, offsetY, f_offsetX, f_offsetY;
var ct = null, cl = null, cr = null;
var except_bet_type = null;

var memes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
var used_memes = [];

var intro = $("#intro");
var fr_main = $("#fr_main");
var btn_start = $("#btn_start");

$(document).ready(function () {
    // fr_main.hide();
    formatTotalMoney();
    checkBetLv();

    //Xác nhận điều khoản
    btn_start.on({
        mouseenter: function () {
            if ($("#confirm").prop("checked")) {
                $(this).click(() => {
                    intro.hide(500);
                    fr_main.show(500);
                });
            } else {
                var randomTop = Math.floor(Math.random() * (intro.outerHeight() - btn_start.outerHeight() * 2)) + btn_start.outerHeight() / 2;
                var randomLeft = Math.floor(Math.random() * (intro.outerWidth() - btn_start.outerWidth() * 2)) + btn_start.outerWidth() / 2;
                $(this).css({ top: randomTop, left: randomLeft });
                $(this).click(() => {
                    $(this).css({ top: randomTop, left: randomLeft });
                });
            }
        },
    });
    //End confirm

    //Hoạt ảnh kéo thả bát úp
    var cover = $('#cover');
    f_offsetX = cover.offset().left;
    f_offsetY = cover.offset().top;

    cover.mousedown(function (e) {
        isDragging = true;

        offsetX = e.pageX;
        offsetY = e.pageY;

        var coverPos = cover.position();
        offsetX -= coverPos.left;
        offsetY -= coverPos.top;
    });

    $(document).mouseup(function () {
        isDragging = false;
    });

    cover.mousemove(function (e) {
        if (isDragging) {
            var x = e.pageX - offsetX;
            var y = e.pageY - offsetY;

            var maxX = $('#fr_animation').width() - cover.width() / 2;
            var maxY = $('#fr_animation').height() - cover.height() / 2;

            x = Math.min(Math.max(x, 0 - cover.width() / 2), maxX);
            y = Math.min(Math.max(y, 0 - cover.height() / 2), maxY);

            cover.css({ left: x, top: y });
        }
    });
    //End hoạt ảnh

    //Event click mức cược
    $('.btn_bet_lv').each((i, el) => {
        $(el).click(() => {
            if (!$(el).hasClass("bet_inactive")) {
                $(el).addClass("bet_active").removeClass("bet_inactive").siblings().removeClass("bet_active");
                current_bet_lv = ($(el).attr("data-bet-lv") > 500) ? total_money : $(el).attr("data-bet-lv");

            }
        })
    });
    //End event

    //Click cược
    $('.btn_bet').each((i, el) => {
        $(el).click(() => {
            onBet(el);
            randCube();
        });
    });
    //End event

    randCube();
});

function onBet(el) {
    except_bet_type = $(el).attr('data-except-bet-type');
    $(`#bet_${except_bet_type}`).addClass("bet_inactive").off("click");
    $(`#fr_${except_bet_type}`).addClass("bet_inactive");
    if (total_money >= 1000) {
        if (current_bet_lv > 500) {
            total_bet += total_money;
            total_money = 0;
        } else {
            total_bet += current_bet_lv * 1000;
            total_money -= current_bet_lv * 1000;
        }
        formatTotalBet(except_bet_type, total_bet);
        formatTotalMoney();
        checkBetLv();
    } else {
        let note = $("<span class='note'>Không đủ tiền đặt cược. Vui lòng xin thêm để chơi</span>");
        $("#notify").append(note);
        setTimeout(function () {
            note.remove();
        }, 1500);
    }
}

function activeBet() {
    $('.btn_bet').each((i, el) => {
        $(el).click(() => {
            onBet(el);
        })
    });

}

function reActiveBet() {
    if (except_bet_type != null) {
        $(`#bet_${except_bet_type}`).removeClass("bet_inactive");
        $(`#fr_${except_bet_type}`).removeClass("bet_inactive");
        total_bet = 0;
        formatTotalBet(except_bet_type, total_bet);
        formatTotalMoney();
        except_bet_type = null;
        activeBet();
    }
}

//Format money
function formatMoney(money) {
    money_valid = new Intl.NumberFormat(['ban', 'id']).format(money);
    return money_valid;
}

//Format total money and print it
function formatTotalMoney() {
    $("#total_money").html(formatMoney(total_money) + " VND");
}

//Format total money and print it
function formatTotalBet(type, val) {
    $(`#total_bet_${(type == "s" ? "b" : "s")}`).html((val == 0) ? "" : formatMoney(val));
}

//+500k
function add500() {
    reActiveBet();
    // Rand meme
    const rand_meme = memes.splice(Math.floor(Math.random() * memes.length), 1)[0];
    $("#content_meme").css('background-image', `url('/web/material/meme/meme${rand_meme}.png')`);
    used_memes.push(rand_meme);
    if (memes.length === 0) {
        memes = [...used_memes];
        used_memes = [];
    }
    // Add money
    total_money += 500000;
    formatTotalMoney();
    checkBetLv();
}

//Active mức cược
function checkBetLv() {
    let bet_lv = [1, 5, 10, 50, 100, 500, 999999];
    let less_than_1000 = (total_money / 1000 < 1) ? true : false;
    if (less_than_1000) {
        bet_lv.forEach((val, i) => {
            $(`.bet_${val}k`).removeClass("bet_active").addClass("bet_inactive");
        });
    } else {
        let nearest_best_level = 0;
        bet_lv.forEach((val, i) => {
            let bet = $(`.bet_${val}k`);
            if (total_money / 1000 >= 500) {
                bet.removeClass("bet_inactive").removeClass("bet_active");
                nearest_best_level = 500;
            } else {
                if (total_money / 1000 >= val) {
                    if (bet.hasClass("bet_inactive")) {
                        bet.removeClass("bet_inactive");
                    }
                    if (bet.hasClass("bet_active")) {
                        bet.removeClass("bet_active");
                    }
                    nearest_best_level = val;
                } else {
                    if (!bet.hasClass("bet_inactive")) {
                        bet.addClass("bet_inactive");
                    }
                    if (bet.hasClass("bet_active")) {
                        bet.removeClass("bet_active");
                    }
                    if (i === bet_lv.length - 1) {
                        bet.removeClass("bet_inactive");
                        if (bet.hasClass("bet_inactive")) {
                            bet.removeClass("bet_inactive");
                        }
                        if (bet.hasClass("bet_active")) {
                            bet.removeClass("bet_active");
                        }
                    }
                }
            }
        });
        let cur_bet;
        if (nearest_best_level >= current_bet_lv) {
            cur_bet = $(`.bet_${current_bet_lv}k`);
        } else {
            cur_bet = $(`.bet_${nearest_best_level}k`);
        }
        if (!cur_bet.hasClass("bet_active")) {
            cur_bet.addClass("bet_active");
            current_bet_lv = cur_bet.attr("data-bet-lv");
        }

    }
}

// Random mặt xúc xắc
function rollADice() {
    let cube = [1, 2, 3, 4, 5, 6];
    let rand_i = Math.floor(Math.random() * cube.length);

    ct = cube[rand_i];
    //xóa đi top và bottom
    cube.splice(rand_i, 1);
    cube.splice((5 - rand_i), 1);
    //Thứ tụ in: top-> left-> right => left can not max(...cube)
    rand_i = Math.floor(Math.random() * (cube.length - 1));
    cl = cube[rand_i];
    cr = cube[rand_i + 1];
}

function randCube() {
    for(let i = 1; i<=3;i++) {
        let fr_cube = $(`#c${i}`);
        if (fr_cube.length > 0) {
            fr_cube.remove();
        }

        fr_cube = $(`<div class='cube' id='c${i}'></div>`);
        rollADice();
        let top = $(`<span class="ct"></span>`);
        top.css('background-image',`url("/web/material/t${ct}.png")`);
        let left = $(`<span class="cl"></span>`);
        left.css('background-image',`url("/web/material/l${cl}.png")`);
        let right = $(`<span class="cr"></span>`);
        right.css('background-image',`url("/web/material/r${cr}.png")`);
        fr_cube.append(top);
        fr_cube.append(left);
        fr_cube.append(right);
        console.log(fr_cube);
        $("#cubes").append(fr_cube);
        ct = cl = cr = null;
    }
}