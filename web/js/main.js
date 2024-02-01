var total_money = 100000, current_bet_lv = 1, total_bet = 0, all = false;
var results = [];
var isDragging = false;
var offsetX, offsetY, f_offsetX, f_offsetY;
var ct = null, cl = null, cr = null;
var except_bet_type = null;

var memes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
var used_memes = [];

var current_result = 0;

var is_opened = false;
var is_shacking = false;
var is_dragging = false;
var started = false;

var gen_rs;
var open_rs;

var bet_time = 20;
var open_time = 10;

var user_choice;

const intro = $("#intro");
const fr_main = $("#fr_main");
const btn_start = $("#btn_start");
const header = $("#header_txt");
const cover = $('#cover');
const countdown = $('#countdown');

$(document).ready(function () {
    fr_main.hide();

    //Xác nhận điều khoản
    btn_start.on({
        mouseenter: function () {
            if ($("#confirm").prop("checked")) {
                $(this).click(() => {
                    intro.hide(500);
                    fr_main.show(500);
                    setTimeout(()=>{
                        randCube();
                        runGame();
                        formatTotalMoney();
                    });
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
    f_offsetX = 172;
    f_offsetY = 29;

    cover.mousedown(function (e) {
        is_dragging = true;

        offsetX = e.pageX;
        offsetY = e.pageY;

        var coverPos = cover.position();
        offsetX -= coverPos.left;
        offsetY -= coverPos.top;
    });

    $(document).mouseup(function () {
        is_dragging = false;
    });

    cover.mousemove(function (e) {
        if (is_dragging && !is_opened && !is_shacking) {
            var x = e.pageX - offsetX;
            var y = e.pageY - offsetY;

            var maxX = $('#fr_animation').width() - cover.width() / 2;
            var maxY = $('#fr_animation').height() - cover.height() / 2;

            x = Math.min(Math.max(x, 0 - cover.width() / 2), maxX);
            y = Math.min(Math.max(y, 0 - cover.height() / 2), maxY);

            if (x <= 112 || x >= 280 || y <= -145 || y >= 238 || (y >= 210 && x <= -64) || (x >= 149 && y >= 210) || (y <= -64 && x <= 182) || (y >= 175 && x <= 235)) {
                clearTimeout(gen_rs);
                result();
            } else {
                cover.css({ left: x, top: y });
            }
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
});

function shakePlate() {

    if (!is_shacking) {
        is_shacking = true;


        started = true;
        clearTimeout(gen_rs);
        if (is_opened) {
            is_opened = false;
        }
        if (cover.hasClass("open")) {
            cover.removeClass("open");
        };
        cover.css({ left: f_offsetX, top: f_offsetY });
        setTimeout(function () {
            // shakePlate();

            $("#fr_animation").addClass("shake");
            header.html("Xóc-ing...");
            randCube();
            setTimeout(function () {
                is_shacking = false;
                $("#fr_animation").removeClass("shake");
                header.html("bắt đầu đặt cược");           
                if ($("#bet_b").hasClass("bet_inactive")) {
                    $("#bet_b").removeClass("bet_inactive");
                }
                if ($("#bet_s").hasClass("bet_inactive")) {
                    $("#bet_s").removeClass("bet_inactive");
                }
            }, 2000);

        }, 500);
    }
    //  else {
    //     let note = $("<span class='note'>Đang xóc! Bấm ít thôi :))</span>");
    //     $("#notify").append(note);
    //     setTimeout(function () {
    //         note.remove();
    //     }, 1500);
    // }
}

function onBet(el) {
    except_bet_type = $(el).attr('data-except-bet-type');
    user_choice = $(el).attr('data-bet');
    $(`#bet_${except_bet_type}`).addClass("bet_inactive").off("click");
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

function reActivateBet() {
    if (except_bet_type != null) {
        $(`#bet_${except_bet_type}`).removeClass("bet_inactive");
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
    current_result = 0;
    for (let i = 1; i <= 3; i++) {
        let fr_cube = $(`#c${i}`);
        if (fr_cube.length > 0) {
            fr_cube.remove();
        }

        fr_cube = $(`<div class='cube' id='c${i}'></div>`);
        rollADice();
        let top = $(`<span class="ct"></span>`);
        top.css('background-image', `url("./web/material/t${ct}.png")`);
        let left = $(`<span class="cl"></span>`);
        left.css('background-image', `url("./web/material/l${cl}.png")`);
        let right = $(`<span class="cr"></span>`);
        right.css('background-image', `url("./web/material/r${cr}.png")`);
        fr_cube.append(top);
        fr_cube.append(left);
        fr_cube.append(right);
        $("#cubes").append(fr_cube);
        current_result += ct;
        ct = cl = cr = null;
    }
}

function result() {
    let rs = current_result;
    is_opened = true;
    cover.addClass("open");
    if (started) {
        header.html(`${rs} điểm - ${(rs > 10) ? "Tài" : "Xỉu"}`);
        addToResults(rs);
    }

    if(user_choice == (rs >10)?1:0) {
        total_money += total_bet*2;
        formatTotalMoney();
    }
}

function runGame() {
    checkBetLv();
    reActivateBet();
    shakePlate();
    
    $("#total_bet_b").html("");
    $("#total_bet_s").html("");
    if (countdown.hasClass("ending")) {
        countdown.removeClass("ending");
    }
    countdown.html(bet_time);
    setTimeout(()=>{
        let rm_time = setInterval(() => {
            if (bet_time <= 5) {
                countdown.addClass("ending");
            } else {
                if (countdown.hasClass("ending")) {
                    countdown.removeClass("ending");
                }
            }
            bet_time -= 1;
            countdown.html(bet_time);
    
            if (bet_time == 0) {
                clearInterval(rm_time);
                bet_time = 20;
                
                if (!$("#bet_b").hasClass("bet_inactive")) {
                    $("#bet_b").addClass("bet_inactive");
                }
                if (!$("#bet_s").hasClass("bet_inactive")) {
                    $("#bet_s").addClass("bet_inactive");
                }
                header.html("ngừng cược!");
                setTimeout(function () {
                    open();
                }, 1000);
            }
        }, 1000)
    }, 2500);
}

function open() {
    header.html("mời mở");
    countdown.html(open_time);
    let op_time = setInterval(() => {
        open_time -= 1;
        countdown.html(open_time);

        if (open_time < 0) {
            clearInterval(op_time);
            open_time = 10;
            header.html("");
            runGame();
        }
    }, 1000);
    gen_rs =
    setTimeout(function () {
        result();
    }, (open_time*1000 - 3000));
}

function addToResults(rs) {

    if ($("#fr_result").children().length == 15) {
        $("#fr_result").children().first().remove();
    }

    let new_rs = $(`<div class='dot_rs dot_${(rs > 10)?"b":"s"}'></div>`);
    $("#fr_result").append(new_rs);
  }