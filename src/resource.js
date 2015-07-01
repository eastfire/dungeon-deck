var res = {
    //intro_jpg : "res/intro.jpg",
    title_bar_jpg: "res/title_bar.jpg",
    bg0_jpg : "res/bg0.jpg",
    book_bg_png : "res/book-bg.png",
    card_plist: "res/card.plist",
    card_png : "res/card.png",
    monster_plist: "res/monster.plist",
    monster_png : "res/monster.png",
    monster2_plist: "res/monster2.plist",
    monster2_png : "res/monster2.png",
    room_plist: "res/room.plist",
    room_png : "res/room.png",
    hero_plist: "res/hero.plist",
    hero_png : "res/hero.png",
    item_plist: "res/item.plist",
    item_png : "res/item.png",
    icon_plist: "res/icon.plist",
    icon_png : "res/icon.png",
    ui_plist: "res/ui.plist",
    ui_png : "res/ui.png"
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
    short_button_size: {
        width: 180,
        height: 60
    },
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
    card_detail_desc_font_size: 35,
    card_detail_desc_size: { width: 520, height: 60},
    card_detail_desc_position: { x: 320, y: 280},
    card_detail_desc_mask_position: { x: 320, y: 340},
    card_detail_desc_line_space : 60,
    card_detail_desc_text_start_y: 480,
    card_detail_hint_position: { x:320, y: 1035},
    card_detail_hint_size: { width: 500, height: 80},

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
    dungeon_depth: 255,

    throne_position: {x:320,y:0},
    throne_label_offset: { x: 80, y: 50},
    throne_font_size: 30,

    book_menu_position: { x: 460, y :0},
    book_label_offset: { x: 0, y: 65},
    book_font_size: 35,

    vault_font_size: 35,
    vault_menu_position: { x: 180, y :0},
    vault_label_offset: { x: 0, y: 65},

    build_menu_position: { x: 60, y :0},

    upgrade_menu_position: { x:580, y:0},
    upgrade_label_offset: { x: 0, y: 15},

    hero_margin:10,

    dungeon_card_margin: 30,
    dungeon_list_position: { x: 30, y: 360},

    hint_font_size: 30,
    hint_position : { x :320, y: 550 },

    continue_position: { x : 320, y: 280 },
    stage_number_position: { x : 320, y: 325 },
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
    attack_dungeon_heart_offset: 215,

    teleport_effect_offset: 100,

    new_item_card_position: { x: 320, y: 1000 },

    buyable_deck_count_font_size: 35,
    cancel_buy_position: {x:320,y:30},
    cancel_buy_font_size: 40,
    cancel_buy_height: 60,
    buy_font_size: 35,

    select_spell_offset: 25,

    choose_hero_hint_position: {x:320, y : 500},

    cant_choose_opacity: 111,

    upgrade_type_label_height: 40,

    game_over_font_size: 70,
    game_over_score_font_size: 36,

    score_line_height: 40,
    score_line_font_size: 25,

    score_board_width:630,
    score_board_height: 1000,

    loading_score_board_font: 50
}

var colors = {
    dungeon_hp_normal: cc.color.BLACK,
    dungeon_hp_danger: cc.color.RED,
    exp_normal: cc.color.BLACK,
    exp_full: cc.color.GREEN,

    icon_label: cc.color(0,0,0,255),
    icon_debuff: cc.color.GRAY,
    top_bar: cc.color(255,255,255,255),
    top_bar_label: cc.color(0,0,0,255),
    card_detail_mask: cc.color(0,0,0,218),
    card_detail_name: cc.color(0,0,0,192),
    card_detail_desc: cc.color(0,0,0,255),
    card_detail_hint: cc.color.WHITE,

    hint: cc.color(255,255,255,255),
    build_new_stage: cc.color.WHITE,
    cancel_buy: cc.color.BLACK,
    buy: cc.color.BLACK,
    book: cc.color.BLACK,
    upgrade_chance_label: cc.color.BLACK,
    spell_book_mask: cc.color(0,0,0,128),

    upgrade_type_label : cc.color.WHITE,

    game_over: cc.color.WHITE
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
    before_hero_die : 0.20,
    effect_icon_move: 0.35,
    move_to_dungeon_heart: 0.5,
    team_teleport_leave: 0.4,
    default_icon_fly: 0.3,
    book_appear: 0.4,
    select_spell: 0.1,
    pay: 0.4
}

var texts = {
    cancel: "取消",
    buy: "购买",
    select: "选择",
    continue: "{[play]}继续",
    you_can_arrange_dungeon_card : "你可以拖拽地城牌排列顺序",
    please_choose: "请选择",
    pay: "支付",
    cull: "精简",
    cast_spell: "施放",
    build_new_stage: "建造下1层地城",
    not_enough_money_1: "需要",
    not_enough_money: "{[money]}才能建造下1层地城",
    not_enough_card: "没有足够{[card]}建造下1层地城",
    give_up: "{[give-up]}放弃抵抗",

    please_choose_target_hero_for_spell: "请为你的法术选择1个目标\n点击空白处取消施放法术",
    please_choose_target_dungeon_for_spell: "请为你的法术选择1个目标\n点击空白处取消施放法术",
    no_valid_target: "你的法术没有合法的目标",

    card_from: {
        discard: "弃牌堆中的牌",
        deck: "牌堆中的牌",
        hand: "手牌中的牌",
        dungeon: "当前地城中的牌"
    },
    none: "(无)",
    level_up: "升级",
    max_level: "满级",

    game_over: "Game Over",
    confirm: "确定",
    restart: "再来一局"
}