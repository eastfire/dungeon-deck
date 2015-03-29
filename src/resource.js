var res = {
    intro_jpg : "res/intro.jpg",
    title_bar_jpg: "res/title_bar.jpg",
    bg0_jpg : "res/bg0.jpg",
    book_bg_png : "res/book-bg.png",
    small_plist: "res/small.plist",
    small_png : "res/small.png"
/*    ,
    large_plist: "res/large.plist",
    large_png : "res/large.png"*/
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}

var dimens = {
    card_width: 120,
    card_height: 168,
    hero_level_font_size: 30,
    hero_hp_font_size: 30,
    hero_icon_size: { width: 48, height: 48 },
    hero_icon_offset: { x: 15, y: 15 },
    ui_score_icon_position: { x: 240, y: 1118},
    ui_money_icon_position: { x: 20, y: 1118},
    top_bar_label_font_size: 24,

    card_detail_scale_rate : 5,
    card_detail_icon_scale_rate: 3.5,
    card_detail_name_font_size: 65,
    card_detail_description_font_size: 30,
    card_detail_icon_offset: { x: 13, y: 13},
    card_detail_desc_font_size: 30,
    card_detail_desc_size: { width: 500, height: 400},
    card_detail_desc_position: { x: 320, y: 280},
    card_detail_desc_mask_position: { x: 320, y: 340},

    deck_count_font_size: 50,
    deck_position: { x: 60, y: 250},
    discard_deck_position: { x: 130, y: 250},
    deck_scale_rate: 0.5,
    draw_card_position: { x: 200, y: 250 },

    top_bar_height: 36,
    levelHeight: 260,
    team_position: { x: 320, y: 1000 },
    meeple_position: { x: 120, y: 846},
    dungeon_entry_position: { x: 500, y: 846},
    throne_position: {x:320,y:0},
    throne_label_offset: { x: 80, y: 50},
    throne_font_size: 30,


    pot_position: { x: 580, y :0},
    pot_label_offset: { x: 60, y: 60},
    pot_font_size: 40,
    book_menu_position: { x: 460, y :0},
    book_label_offset: { x: 0, y: 65},
    book_font_size: 40,
    build_menu_position: { x: 60, y :0},
    upgrade_menu_position: { x:180, y:0},
    hero_margin:10,

    dungeon_card_margin: 30,
    dungeon_list_position: { x: 30, y: 360},

    hint_font_size: 30,
    hint_position : { x :320, y: 550 },

    continue_position: { x : 320, y: 300 },
    build_new_stage_font_size: 28,

    enter_door_width: 40,
    hero_attack_offset: 15,
    monster_attack_offset: 15,
    conflict_icon_offset: { x : -4 , y : -35},

    build_new_stage_size: { width : 400, height: 100},
    build_new_stage_font: 30,
    build_new_stage_position: { x: 320, y : 480},
    give_up_position: { x: 320, y : 400},

    effect_icon_move_y: 35,
    attack_dungeon_heart_offset: 190,

    teleport_effect_offset: 100,

    new_item_card_position: { x: 320, y: 1000 },

    buyable_deck_count_font_size: 35,
    cancel_buy_position: {x:320,y:30},
    cancel_buy_font_size: 40,
    cancel_buy_height: 60,
    buy_font_size: 35
}

var colors = {
    icon_label: cc.color(0,0,0,255),
    top_bar: cc.color(255,255,255,255),
    top_bar_label: cc.color(0,0,0,255),
    card_detail_mask: cc.color(0,0,0,218),
    card_detail_name: cc.color(0,0,0,192),
    card_detail_desc: cc.color(0,0,0,255),
    hint: cc.color(255,255,255,255),
    build_new_stage: cc.color.WHITE,
    cancel_buy: cc.color.BLACK,
    buy: cc.color.BLACK,
    book: cc.color.BLACK
}

var times = {
    hero_join_team : 0.4,
    move_to_entry: 0.5,
    draw_dungeon_card: 0.3,
    get_spell_card: 0.3,
    draw_card: 0.3,
    discard_card: 0.3,
    one_step : 0.2,
    attack: 0.2,
    get_item: 0.4,
    team_move_to_next_room: 0.4,
    monster_die: 0.4,
    before_hero_die : 0.25,
    effect_icon_move: 0.35,
    move_to_dungeon_heart: 0.5,
    team_teleport_leave: 0.4,
    default_icon_fly: 0.3
}

var texts = {
    cancel: "取消",
    buy: "购买",
    continue: "{[play]}继续",
    you_can_arrange_dungeon_card : "你可以拖拽地城牌排列顺序",
    please_choose: "请选择",
    pay: "支付",
    build_new_stage: "建造下1层地城",
    not_enough_money_1: "需要",
    not_enough_money: "{[money]}才能建造下1层地城",
    not_enough_card: "没有足够{[card]}建造下1层地城",
    give_up: "{[give-up]}放弃抵抗"
}