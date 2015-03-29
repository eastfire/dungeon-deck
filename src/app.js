var DUNGEON_CARD_PER_STAGE = 4;
var MAX_HERO_COUNT = 4;

var UILayer = cc.Layer.extend({
    ctor:function (options) {
        this._super();

        this.model = options.model

        this.titleBar = new cc.Sprite(res.title_bar_jpg);
        this.titleBar.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height,
            anchorX: 0.5,
            anchorY: 1
        })
        this.addChild(this.titleBar,100);

        this.scoreIcon = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("score-icon.png"))
        this.scoreIcon.attr({
            x: dimens.ui_score_icon_position.x,
            y: dimens.ui_score_icon_position.y,
            scaleX : 0.5,
            scaleY : 0.5
        })
        this.addChild(this.scoreIcon,101)

        this.scoreLabel = new cc.LabelTTF("", "Arial", dimens.top_bar_label_font_size);
        this.scoreLabel.attr({
            color: colors.top_bar_label,
            x: dimens.ui_score_icon_position.x + 30,
            y: dimens.ui_score_icon_position.y - 5
        })
        this.addChild(this.scoreLabel,101)

        this.moneyIcon = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("money-icon.png"))
        this.moneyIcon.attr({
            x: dimens.ui_money_icon_position.x,
            y: dimens.ui_money_icon_position.y,
            scaleX : 0.5,
            scaleY : 0.5
        })
        this.addChild(this.moneyIcon,101)

        this.moneyLabel = new cc.LabelTTF("", "Arial", dimens.top_bar_label_font_size);
        this.moneyLabel.attr({
            color: colors.top_bar_label,
            x: dimens.ui_money_icon_position.x + 30,
            y: dimens.ui_money_icon_position.y - 5,
            anchorX : 0
        })
        this.addChild(this.moneyLabel,101)

        var closeItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("CloseNormal.png"),
            cc.spriteFrameCache.getSpriteFrame("CloseSelected.png"),
            function () {
                this.openSystemMenu();
            }, this);
        closeItem.attr({
            x: cc.winSize.width - 20,
            y: cc.winSize.height - 20,
            anchorX: 0.5,
            anchorY: 0.5
        });
        var menu = new cc.Menu(closeItem);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu, 101);
    },
    onEnter:function(){
        this._super();
        this.__initEvent();
        this.__refresh();
    },
    __refresh:function(){
        this.__renderScore();
        this.__renderMoney();
    },
    onExit:function(){
        this.model.off(null,null,this);
    },
    __initEvent:function(){
        this.model.on("change:score",this.__renderScore, this);
        this.model.on("change:money change:maxMoney",this.__renderMoney, this);
    },
    __renderScore:function(){
        this.scoreLabel.setString( this.model.get("score") );
    },
    __renderMoney:function(){
        this.moneyLabel.setString( this.model.get("money") + " / " + this.model.get("maxMoney") );
    },
    openSystemMenu:function(){

    }
});

var MainGameLayer = cc.Layer.extend({
    ctor:function (options) {
        this._super();

        this.model = options.model

        var size = cc.winSize;

        this.firstHero = true;

        window.effectIconMananger = new EffectIconManager({
            layer:this
        });

        this.__initUI();

        this.__initBackground();

        this.__initEvent();

        this.meeple = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("meeple.png") )
        this.addChild(this.meeple);
        this.meeple.setVisible(false);


        this.__resetMeeple();

        this.throne = new IconSprite({
            image: cc.spriteFrameCache.getSpriteFrame("throne-menu.png"),
            offset:dimens.throne_label_offset,
            fontSize: dimens.throne_font_size,
            fontColor: cc.color(255,0,0,255)
        });
        this.throne.attr({
            x: dimens.throne_position.x,
            y: dimens.throne_position.y,
            anchorY:0
        });
        this.addChild(this.throne,20)
        this.__renderDungeonHeart();

        var bookMenuItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("book-menu.png"),
            cc.spriteFrameCache.getSpriteFrame("book-menu-selected.png"),
            this.openBookMenu, this);
        bookMenuItem.attr({
            x: dimens.book_menu_position.x,
            y: dimens.book_menu_position.y,
            anchorX: 0.5,
            anchorY: 0
        });
        this.bookText = new cc.LabelTTF("", "Arial", dimens.book_font_size);
        this.bookText.attr({
            color: colors.book,
            x: dimens.book_menu_position.x,
            y: dimens.book_menu_position.y+dimens.book_label_offset.y
        });
        this.addChild(this.bookText,40);
        this.__renderBook();

        this.pot = new IconSprite({
            image: cc.spriteFrameCache.getSpriteFrame("pot0.png"),
            offset:dimens.pot_label_offset,
            fontSize: dimens.pot_font_size,
            fontColor: cc.color(255,0,0,255)
        });
        this.pot.attr({
            x: dimens.pot_position.x,
            y: dimens.pot_position.y,
            anchorY:0
        });
        this.addChild(this.pot,20);
        this.__renderPot();

        this.dungeonList = new SortableSpriteList({
            margin:dimens.dungeon_card_margin
        });
        this.dungeonList.attr({
            x: dimens.dungeon_list_position.x,
            y: dimens.dungeon_list_position.y
        })
        this.dungeonList.setEnabled(false);
        this.addChild(this.dungeonList,2)

        this.deckSprite = new DungeonDeckSprite({
            array: this.model.get("deck"),
            side: "back",
            fontSize : dimens.deck_count_font_size,
            countLabelOffset: { x: 0, y: -dimens.card_height/2 - dimens.deck_count_font_size },
            numberFormat: "%d张"
        });
        this.deckSprite.attr({
            x: dimens.deck_position.x,
            y: dimens.deck_position.y,
            scaleX : dimens.deck_scale_rate,
            scaleY : dimens.deck_scale_rate
        });
        this.addChild(this.deckSprite);

        this.discardDeckSprite = new DungeonDeckSprite({
            array: this.model.get("discardDeck"),
            side: "front",
            fontSize : dimens.deck_count_font_size,
            countLabelOffset: { x: 0, y: -dimens.card_height/2 - dimens.deck_count_font_size },
            numberFormat: "%d张",
            cardClass: DiscardCardSprite
        });
        this.discardDeckSprite.attr({
            x: dimens.discard_deck_position.x,
            y: dimens.discard_deck_position.y,
            scaleX : dimens.deck_scale_rate,
            scaleY : dimens.deck_scale_rate
        });
        this.addChild(this.discardDeckSprite);

        this.deckSprite.setDiscardDeck( this.discardDeckSprite, true, "shuffle" );

        this.hintLable = new cc.LabelTTF("", "Arial", dimens.hint_font_size);
        this.hintLable.attr({
            color: colors.hint,
            x: dimens.hint_position.x,
            y: dimens.hint_position.y
        })
        this.addChild(this.hintLable, 100);
        this.hintLable.setVisible(false);

        this.conflictIcon = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("cross-sword.png"));
        this.addChild(this.conflictIcon,3);
        this.conflictIcon.setVisible(false);

        var buildItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("build-menu.png"),
            cc.spriteFrameCache.getSpriteFrame("build-menu-selected.png"),
            function () {
                this.openBuildMenu();
            }, this);
        buildItem.attr({
            x: dimens.build_menu_position.x,
            y: dimens.build_menu_position.y,
            anchorX: 0.5,
            anchorY: 0
        });
        var upgradeItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("upgrade-menu.png"),
            cc.spriteFrameCache.getSpriteFrame("upgrade-menu-selected.png"),
            function () {
                this.openUpgradeMenu();
            }, this);
        upgradeItem.attr({
            x: dimens.upgrade_menu_position.x,
            y: dimens.upgrade_menu_position.y,
            anchorX: 0.5,
            anchorY: 0
        });

        var menu = new cc.Menu(buildItem,upgradeItem, bookMenuItem);
        menu.x = 0;
        menu.y = 0;
        this.addChild(menu);

        window.iconSource = {
            money : this.throne,
            hp : this.throne
        }
        return true;
    },
    onEnter:function(){
        this._super();
        if ( this.firstHero ) {
            this.generateHero();
            this.firstHero = false;
        }
        if ( window.boughtCardModel ) {
            var boughtCardSprite = new DUNGEON_SPRITE_CLASS_MAP[ window.boughtCardModel.get("name") ]({
                model: window.boughtCardModel
            });
            boughtCardSprite.attr({
                x: window.boughtCardPosition.x,
                y: window.boughtCardPosition.y
            });
            this.addChild(boughtCardSprite);
            this.discardCard( boughtCardSprite );
        }
    },
    cleanUp:function(){
        this.model.off(null,null,this);
        cc.director.popScene();
    },
    __initEvent:function(){
        this.model.on("change:hp change:maxHp",this.__onDungeonHPChanged,this);
        this.model.on("change:hand",this.__renderBook,this);
        this.model.on("change:exp",this.__renderPot,this);
        var self = this;
        cc.eventManager.addListener(cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "double-tap",
            callback: function (event) {
                var target = event.getUserData();
                if (target.side === "front") {
                    window.mainGame.showCardDetailLayer(target.model)
                }
            }
        }), 1);
        cc.eventManager.addListener(cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "generate-hero-end",
            callback: function (event) {
                self.model.set("phase","generate-hero-end");
                self.continueMenu.setVisible(true);
            }
        }), 1);
        cc.eventManager.addListener(cc.EventListener.create({
            event: cc.EventListener.CUSTOM,
            eventName: "team-leave-stage",
            callback: function (event) {
                self.onTeamLeaveStage();
            }
        }), 1);
    },
    __initBackground:function(){
        this.background = [];

        var level = 0;
        this.background[level] = new cc.Sprite(res.bg0_jpg)
        this.__resetBackground();
        this.addChild(this.background[level],-1)
    },
    __resetBackground:function(){
        var level = 0;
        var y = cc.winSize.height - dimens.top_bar_height - level * dimens.levelHeight;
        this.background[level].attr({
            x: 0,
            y: y,
            anchorX: 0,
            anchorY: 1
        })
    },
    __initUI:function(){
        var continueItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("short-normal.png"),
            cc.spriteFrameCache.getSpriteFrame("short-selected.png"),
            function () {
                var phase = this.model.get("phase");
                switch ( phase ) {
                    case "generate-dungeon":
                        this.continueMenu.setVisible(false);
                        if ( this.model.get("stageNumber") === 0 ) {
                            cc.log("teamEnterDungeon")
                            this.teamEnterDungeon();
                        } else {
                            cc.log("teamEnterNextStage")
                            this.teamEnterNextStage();
                        }
                        break;
                    case "generate-hero-end":
                        this.continueMenu.setVisible(false);
                        this.moveTeamToEntry();
                        break;
                    case "team-die":
                        this.continueMenu.setVisible(false);
                        this.afterTeamDie();
                        break;
                }
            }, this );
        continueItem.attr({
            x: dimens.continue_position.x,
            y: dimens.continue_position.y,
            anchorX: 0.5,
            anchorY: 0.5
        });
        var continueText = buildRichText({
            str : texts.continue,
            fontSize : dimens.build_new_stage_font_size,
            fontColor: cc.color.BLACK,
            width: 180,
            height: 60
        });
        continueText.attr({
            x: 120,
            y: 25,
            anchorX : 0.5,
            anchorY : 0.5
        })
        continueItem.addChild( continueText );
        this.continueMenu = new cc.Menu(continueItem);
        this.continueMenu.x = 0;
        this.continueMenu.y = 0;
        this.addChild(this.continueMenu, 20);
        this.continueMenu.setVisible(false);

        this.giveUpItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("long-normal.png"),
            cc.spriteFrameCache.getSpriteFrame("long-selected.png"),
            function () {
                this.onGiveUp();
            }, this );
        this.giveUpItem.attr({
            x: dimens.give_up_position.x,
            y: dimens.give_up_position.y,
            anchorX: 0.5,
            anchorY: 0.5
        });

        this.giveUpMenu = new cc.Menu(this.giveUpItem);
        this.giveUpMenu.x = 0;
        this.giveUpMenu.y = 0;
        this.addChild(this.giveUpMenu, 20);
        this.giveUpMenu.setVisible(false);

        this.buildStageItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("long-normal.png"),
            cc.spriteFrameCache.getSpriteFrame("long-selected.png"),
            function () {
                this.onBuildNewStage();
            }, this );
        this.buildStageItem.attr({
            x: dimens.build_new_stage_position.x,
            y: dimens.build_new_stage_position.y,
            anchorX: 0.5,
            anchorY: 0.5
        });
        this.buildStageMenu = new cc.Menu(this.buildStageItem);
        this.buildStageMenu.x = 0;
        this.buildStageMenu.y = 0;
        this.addChild(this.buildStageMenu, 20);
        this.buildStageMenu.setVisible(false);
    },
    openBuildMenu:function(){
        cc.director.pushScene(new BuyCardScene({
            model:this.model
        }));
        /*this.runningTargets = this.actionManager.pauseAllRunningActions();
        var layer = new BuyCardLayer({model:this.model});
        this.addChild(layer, 50);*/
    },
    openUpgradeMenu:function(){

    },
    openBookMenu:function(){
        mainGame.pauseAction();
        var spellBookLayer = new SpellBookLayer({
            model: this.model
        });
        this.addChild(spellBookLayer,50);
    },
    __renderDungeonHeart:function(){
        this.throne.setString( "hp"+this.model.get("hp") + "/" + this.model.get("maxHp") );
    },
    __onDungeonHPChanged:function(){
        var hp = this.model.get("hp");
        if ( this.model.previous("hp") != hp ) {
            var diff = hp - this.model.previous("hp");
            if ( diff > 0 )
                diff = "+"+diff;
            effectIconMananger.enqueue(this.throne, {
                icon: "hp-icon",
                text: diff,
                offset: {x:0, y:80}
            });
        }
        this.__renderDungeonHeart();
    },
    __renderBook:function(){
        var l = this.model.get("hand").length;
        this.bookText.setString( l + "/" + this.model.get("maxHand") );
    },
    __renderPot:function(){
        this.pot.setString( this.model.get("exp") + "/" + this.model.get("maxExp") )
    },
    __resetMeeple:function(){
        this.meeple.attr({
            x: dimens.meeple_position.x,
            y: dimens.meeple_position.y,
            scaleX : 1,
            scaleY : 1,
            anchorX: 0.5,
            anchorY: 0
        });
        this.meeple.setSpriteFrame( cc.spriteFrameCache.getSpriteFrame("meeple.png") );
        this.meeple.setVisible(true);
    },
    generateHero:function(){
        var team = this.model.get("team");
        if ( team.length >= MAX_HERO_COUNT ) {
            var e = new cc.EventCustom("generate-hero-end");
            cc.eventManager.dispatchEvent(e);
            return;
        }
        this.model.set("phase","generate-hero");
        this.model.set("stageNumber",0);

        var heroType = _.sample( this.model.get("heroList") )
        var heroModel = new HERO_CLASS_MAP[ heroType ]()
        var card = new HeroCardSprite({ model: heroModel , side: "front"})

        card.attr({
            x: cc.winSize.width + dimens.card_width,
            y: dimens.team_position.y
        })

        this.addChild(card, 1);
        card.setName(card.model.cid);

        team.push( heroModel );
        heroModel.on("joinTeamEnd", function(){
            if (_.all( team , function(model){
                return model.isJoinTeamEnd();
            }, this) ) {
                var e = new cc.EventCustom("generate-hero-end");
                cc.eventManager.dispatchEvent(e);
            }
        },this);
        _.each(team,function(model){
            model.startJoinTeam();
        },this)
        this.model.sortTeam();

    },
    teamEnterDungeon:function(){
        this.model.set("phase","team-enter-dungeon");
        this.model.set("stageNumber", 0);
        this.hintLable.setVisible(false);
        this.dungeonList.setEnabled(false);

        var meepleX = this.meeple.x + dimens.enter_door_width;
        this.meeple.runAction(cc.sequence(
            cc.moveTo( times.one_step, meepleX, this.meeple.y ),
            cc.callFunc(function(){
                _.each( this.model.get("team"), function( heroModel){
                    if ( heroModel.isAlive() )
                        heroModel.onEnterDungeon();
                },this);
            },this),
            cc.callFunc(this.teamEnterNextStage, this)
        ))
    },
    teamEnterNextStage:function(){
        this.model.set("phase","team-enter-stage");
        this.model.set("stageNumber", this.model.get("stageNumber") + 1);

        this.hintLable.setVisible(false);
        this.dungeonList.setEnabled(false);

        var moveWidth = this.meeple.x - this.dungeonList.x - dimens.card_width/2;
        var moveDeep = 255;
        var stepCount = 8;
        var stepWidth = moveWidth / stepCount;
        var stepDeep = moveDeep / stepCount;

        var meepleArray = [];
        var bgArray = [];
        var dungeonArray = [];
        var meepleX = this.meeple.x;
        var meepleY = this.meeple.y;
        var bgY = this.background[0].y;
        var dungeonY = this.dungeonList.y;
        var dungeonX = this.dungeonList.x;
        meepleArray.push( cc.scaleTo(times.one_step/2, -1, 1 ) );

        bgArray.push( cc.delayTime(times.one_step/2) );
        bgY += stepDeep;
        bgArray.push( cc.moveTo( times.one_step/2, 0, bgY) );

        dungeonArray.push( cc.delayTime(times.one_step/2) );
        dungeonY += stepDeep;
        dungeonArray.push( cc.moveTo(times.one_step/2,dungeonX, dungeonY) );
        for ( var i = 0 ; i < stepCount ; i++ ){
            meepleArray.push( cc.moveTo( times.one_step/2, meepleX - stepWidth, meepleY ) );
            meepleArray.push( cc.delayTime( times.one_step/2 ) );
            meepleX-= stepWidth;

            bgArray.push( cc.delayTime(times.one_step/2) );
            bgY += stepDeep;
            bgArray.push( cc.moveTo( times.one_step/2, 0, bgY ) );

            dungeonArray.push( cc.delayTime(times.one_step/2) );
            dungeonY += stepDeep;
            dungeonArray.push( cc.moveTo( times.one_step/2, dungeonX, dungeonY ) );
        }
        meepleArray.push( cc.scaleTo(times.one_step/2, 1, 1 ) );
        meepleArray.push( cc.callFunc(function(){
            var e = new cc.EventCustom("team-enter-stage-end");
            cc.eventManager.dispatchEvent(e);

            this.model.set("currentRoomNumber", 0);
            this.teamEnterStage();
        },this));

        this.meeple.runAction(cc.sequence(meepleArray));
        this.background[0].runAction(cc.sequence(bgArray));
        this.dungeonList.runAction(cc.sequence(dungeonArray));
    },
    teamLeaveDungeon:function(){
        var sequence = cc.sequence( cc.scaleTo(times.team_teleport_leave, 0.1, 4 ),
            cc.callFunc(function(){
                this.__resetBackground();
                this.meeple.attr({
                    x: dimens.meeple_position.x,
                    y: dimens.meeple_position.y + dimens.teleport_effect_offset
                })
        },this),
        cc.scaleTo(times.team_teleport_leave, 1, 1 ),
        cc.callFunc(function(){
            _.each( this.model.get("team"),function(heroModel){
                if ( heroModel.isAlive() ){
                    effectIconMananger.enqueue(this.meeple, {
                        icon: "beer-icon",
                        offset: {
                            x : -25,
                            y : 0
                        }
                    });
                    heroModel.onPassDungeon();
                }
            },this);
        },this),
        cc.delayTime(1),
        cc.callFunc(this.removeDeadHero,this),
        cc.callFunc(function(){
            this.generateHero();
            this.__resetMeeple();
        },this));
        var sequence2 = cc.sequence( cc.moveBy(times.team_teleport_leave, 0, dimens.teleport_effect_offset ),
            cc.moveBy(times.team_teleport_leave, 0, -dimens.teleport_effect_offset ) );
        this.meeple.runAction(sequence);
        this.meeple.runAction(sequence2);
    },
    removeDeadHero:function(){
        this.model.removeDeadHeroFromTeam();
    },
    moveTeamToEntry:function(){
        this.meeple.runAction(
            cc.sequence(
                cc.moveTo(times.move_to_entry, dimens.dungeon_entry_position.x+10, dimens.dungeon_entry_position.y),
                cc.callFunc( function(){
                    this.generateDungeonStageUntilFull();
                }, this)
            ) );
    },
    teamEnterStage:function(){
        var dungeonCards = _.map( this.dungeonList.sprites, function(sprite){
            return sprite.model;
        },this);
        _.each( this.model.get("team"), function( heroModel){
            if ( heroModel.isAlive() )
                heroModel.onEnterStage(dungeonCards);
        },this);

        this.teamEnterRoom();
    },
    teamMoveToNextRoom:function(){
        var currentNumber = this.model.get("currentRoomNumber");
        if ( this.dungeonList.sprites.length > currentNumber + 1 ) {
            var distance = this.dungeonList.sprites[currentNumber+1].x - this.dungeonList.sprites[currentNumber].x;
            var sequence = cc.sequence(cc.moveBy( times.team_move_to_next_room, distance,0),
                cc.callFunc(function(){
                    this.model.set("currentRoomNumber", currentNumber + 1 );
                    this.teamEnterRoom();
                },this));
            this.meeple.runAction(sequence);
        } else {
            //team leave stage
            var sequence = cc.sequence(cc.moveBy( times.team_move_to_next_room, dimens.card_width/2, 0),
                cc.callFunc(function(){
                    var dungeonCards = _.map( this.dungeonList.sprites, function(sprite){
                        return sprite.model;
                    },this);
                    _.each( this.model.get("team"), function( heroModel){
                        if ( heroModel.isAlive() )
                            heroModel.onPassStage(dungeonCards);
                    },this);

                    var e = new cc.EventCustom("team-leave-stage");
                    cc.eventManager.dispatchEvent(e);
                },this));
            this.meeple.runAction(sequence);
        }
    },
    onTeamLeaveStage:function(){
        //user choose build new stage or pass
        this.hintLable.setVisible(true);
        this.hintLable.setString(texts.please_choose);

        this.giveUpMenu.setVisible(true);

        var cardLeft = this.model.get("deck").length + this.model.get("discardDeck").length;
        var buildNewText;
        if ( cardLeft == 0 ) {
            this.giveUpText = buildRichText({
                str : texts.not_enough_card,
                fontSize : dimens.build_new_stage_font_size,
                fontColor: cc.color.BLACK,
                width: 390,
                height: 60
            });

            this.giveUpText.attr({
                x: 240,
                y: 20,
                anchorX : 0.5,
                anchorY : 0.5
            });
            this.giveUpMenu.setVisible(true);
            this.giveUpItem.addChild( this.giveUpText );
        } else {
            var cost = this.model.getBuildCost();
            if ( cost <= this.model.get("money") ) {
                this.buildStageText = buildRichText({
                    str : texts.pay + cost + "{[money]}" + texts.build_new_stage,
                    fontSize : dimens.build_new_stage_font_size,
                    fontColor: cc.color.BLACK,
                    width: 390,
                    height: 60
                });
                this.buildStageText.attr({
                    x: 240,
                    y: 25,
                    anchorX : 0.5,
                    anchorY : 0.5
                });
                this.buildStageMenu.setVisible(true);
                this.buildStageItem.addChild(this.buildStageText);

                this.giveUpText = buildRichText({
                    str : texts.give_up,
                    fontSize : dimens.build_new_stage_font_size,
                    fontColor: cc.color.BLACK,
                    width: 390,
                    height: 60
                });
                this.giveUpText.attr({
                    x: 330,
                    y: 25,
                    anchorX : 0.5,
                    anchorY : 0.5
                });
                this.giveUpMenu.setVisible(true);
                this.giveUpItem.addChild( this.giveUpText );
            } else {
                this.giveUpText = buildRichText({
                    str : texts.not_enough_money_1 + cost + texts.not_enough_money,
                    fontSize : dimens.build_new_stage_font_size,
                    fontColor: cc.color.BLACK,
                    width: 390,
                    height: 60
                });
                this.giveUpText.attr({
                    x: 240,
                    y: 25,
                    anchorX : 0.5,
                    anchorY : 0.5
                });
                this.giveUpMenu.setVisible(true);
                this.giveUpItem.addChild( this.giveUpText );
            }
        }


    },
    discardCard:function(cardSprite, callback, context){
        var sequence = cc.sequence( cc.moveTo( times.discard_card, this.discardDeckSprite.x, this.discardDeckSprite.y ),
            cc.callFunc(function(){
                this.discardDeckSprite.putCard(cardSprite);
                if ( callback )
                    callback.call(context);
            },this))
        cardSprite.runAction(sequence);
        cardSprite.runAction(cc.scaleTo(times.draw_card,dimens.deck_scale_rate,dimens.deck_scale_rate));
    },
    discardAllDungeonCards:function(){
        var len = this.dungeonList.sprites.length;
        for ( var i = len - 1; i >= 0; i --){
            var sprite = this.dungeonList.removeSpriteByIndex(i);
            if ( sprite.model.get("exiled") ) {
                sprite = null;
            } else {
                sprite.model.resetToOrigin();
                sprite.model.set("side","front");
                this.addChild(sprite);
                this.discardCard(sprite);
            }
        }
    },
    onGiveUp:function(){
        this.hintLable.setVisible(false);
        this.buildStageMenu.setVisible(false);
        this.giveUpMenu.setVisible(false);
        this.buildStageText.removeFromParent(true);
        this.giveUpText.removeFromParent(true);
        this.discardAllDungeonCards();

        this.teamAttackDungeonHeart();
    },
    onBuildNewStage:function(){
        this.hintLable.setVisible(false);
        this.buildStageMenu.setVisible(false);
        this.giveUpMenu.setVisible(false);
        this.buildStageText.removeFromParent(true);
        this.giveUpText.removeFromParent(true);
        this.model.useMoney(this.model.getBuildCost());
        this.discardAllDungeonCards();
        this.generateDungeonStageUntilFull();
    },
    teamAttackDungeonHeart:function(){
        this.conflictIcon.attr({
            x: dimens.throne_position.x,
            y: dimens.throne_position.y + dimens.attack_dungeon_heart_offset - 45,
            scaleX : 0.5,
            scaleY : 0.5
        });
        this.conflictIcon.runAction(cc.sequence(
            cc.delayTime( times.move_to_dungeon_heart),
            cc.callFunc(function(){
                this.conflictIcon.setVisible(true);
            },this),
            cc.scaleTo( times.attack*2, 1,1),
            cc.callFunc(function(){
                this.conflictIcon.setVisible(false);
            }, this
        )))

        var sequence = cc.sequence( cc.moveTo( times.move_to_dungeon_heart, dimens.throne_position.x, dimens.throne_position.y + dimens.attack_dungeon_heart_offset),
            cc.moveBy(times.attack, 0, -dimens.hero_attack_offset ),
            cc.callFunc(function(){
                var totalPower = 0;
                _.each( this.model.get("team"), function(heroModel){
                    if ( heroModel.isAlive() ) {
                        var power = heroModel.getAttackHeartPower();
                        heroModel.onAttackHeart(power);
                        totalPower += power;
                    }
                });
                this.model.beAttacked(totalPower);
            },this),
            cc.moveBy(times.attack, 0, dimens.hero_attack_offset ),
            cc.delayTime(0.2),
            cc.callFunc(function(){
                this.teamLeaveDungeon()
            },this));
        this.meeple.runAction(sequence);
    },
    generateItemCard:function(level){
        return new TreasureChestModel({
            level: level,
            side: "front"
        });
    },
    teamDie:function() {
        var totalLevel = _.reduce(this.model.get("team"), function (memo, heroModel) {
            return memo + heroModel.get("level");
        }, 0, this);
        //meeple disappear
        var meepleSequence = cc.sequence(cc.scaleTo(0.2, 1, 0.1),
            cc.callFunc(function () {
                this.meeple.setSpriteFrame(cc.spriteFrameCache.getSpriteFrame("rip-icon.png"));
            }, this),
            cc.scaleTo(0.4, 1, 1),
            cc.callFunc(function(){
                this.model.set("phase","team-die");
                this.continueMenu.setVisible(true);
            },this));
        this.meeple.stopAllActions();
        this.meeple.runAction(meepleSequence);

        var itemCard = this.generateItemCard(totalLevel)
        this.newItemCardSprite = new ItemCardSprite({
            model: itemCard
        });
        this.newItemCardSprite.attr({
            x: dimens.new_item_card_position.x,
            y: dimens.new_item_card_position.y
        })
        this.addChild(this.newItemCardSprite);

        this.removeDeadHero();

    },
    afterTeamDie:function(){
        this.meeple.setVisible(false);
        this.discardAllDungeonCards();
        if ( this.newItemCardSprite ) {
            this.discardCard(this.newItemCardSprite, function(){
                this.newItemCardSprite = null;
                this.__resetBackground();
                this.__resetMeeple();
                this.generateHero();
            },this);
        } else {
            this.__resetBackground();
            this.__resetMeeple();
            this.generateHero();
        }
    },
    teamEnterRoom:function(){
        var currentNumber = this.model.get("currentRoomNumber");

        var roomSprite = this.dungeonList.sprites[currentNumber];
        var dungeonModel = roomSprite.model;
        var team = this.model.get("team");
        _.each( team, function( heroModel){
            if ( heroModel.isAlive() )
                heroModel.onEnterRoom(dungeonModel);
        },this);
        dungeonModel.onTeamEnter(team);

        //attack!
        if ( dungeonModel instanceof MonsterModel ){
            this.conflictIcon.setVisible(true);
            this.conflictIcon.attr({
                x: this.meeple.x + dimens.conflict_icon_offset.x,
                y: this.meeple.y + dimens.conflict_icon_offset.y + 24,
                scaleX : 0.5,
                scaleY : 0.5
            });
            this.conflictIcon.runAction(cc.sequence( cc.scaleTo( times.attack*2, 1,1), cc.callFunc(
                function(){
                    this.conflictIcon.setVisible(false);
                }, this
            )))

            var sequenceMeeple = cc.sequence( cc.moveBy(times.attack, 0, -dimens.hero_attack_offset ),
                cc.moveBy(times.attack, 0, dimens.hero_attack_offset ));
            this.meeple.runAction(sequenceMeeple);

            var sequenceMonster = cc.sequence( cc.moveBy(times.attack, 0, dimens.monster_attack_offset ),
                cc.callFunc(function(){
                    dungeonModel.onAttackTeam(team);
                },this),
                cc.moveBy(times.attack, 0, -dimens.monster_attack_offset ),
                cc.callFunc(this.afterTeamEnterRoom,this));
            roomSprite.runAction(sequenceMonster);
        } else if ( dungeonModel instanceof RoomModel ){
            var sequenceMeeple = cc.sequence( cc.moveBy(times.attack, 0, -dimens.hero_attack_offset-dimens.monster_attack_offset ),
                cc.moveBy(times.attack, 0, dimens.hero_attack_offset+dimens.monster_attack_offset ),
                cc.callFunc(this.afterTeamEnterRoom,this));
            this.meeple.runAction(sequenceMeeple);
        } else if ( dungeonModel instanceof ItemModel ){
            var sequenceMeeple = cc.sequence( cc.moveBy(times.attack, 0, -dimens.hero_attack_offset-dimens.monster_attack_offset ),
                cc.callFunc(function(){
                    roomSprite.runAction(cc.moveBy(times.get_item, 0, dimens.card_height/2+25));
                    roomSprite.runAction(cc.scaleTo(times.get_item, 0.1, 0.1));
                },this),
                cc.delayTime(times.get_item),
                cc.callFunc(function(){
                    dungeonModel.onTeamGet(team);
                    roomSprite.setVisible(false);
                },this),
                cc.moveBy(times.attack, 0, dimens.hero_attack_offset+dimens.monster_attack_offset ),
                cc.callFunc(this.afterTeamEnterRoom,this));
            this.meeple.runAction(sequenceMeeple);
        }
    },
    afterTeamEnterRoom:function(dungeonModel){
        if ( this.model.isTeamAlive()) {
            _.each( this.model.get("team"), function( heroModel){
                if ( heroModel.isAlive() )
                    heroModel.onPassRoom(dungeonModel);
            },this);
            this.teamMoveToNextRoom();
        } else {
            this.teamDie();
        }
    },
    generateDungeonStageUntilFull:function(){
        this.model.set("phase","generate-dungeon");
        this.dungeonList.attr({
            y: dimens.dungeon_list_position.y
        })
        this.generateDungeonStage();
    },
    generateDungeonStage:function(){
        if ( this.dungeonList.sprites.length >= DUNGEON_CARD_PER_STAGE ) {
            var e = new cc.EventCustom("generate-dungeon-end");
            cc.eventManager.dispatchEvent(e);
            //show hint
            this.hintLable.setVisible(true);
            this.hintLable.setString(texts.you_can_arrange_dungeon_card);
            //show choice
            this.continueMenu.setVisible(true);
            //enable sort
            this.dungeonList.setEnabled(true);
            return;
        }
        this.deckSprite.drawCard(function(cardSprite){
            if ( !cardSprite )
                return;

            cardSprite.attr({
                x: this.deckSprite.getPosition().x,
                y: this.deckSprite.getPosition().y,
                scaleX: dimens.deck_scale_rate,
                scaleY: dimens.deck_scale_rate
            })
            this.addChild(cardSprite);
            var sequence;
            if ( cardSprite.model.get("type") == "spell" ) {
                sequence = cc.sequence(
                    cc.moveTo(times.draw_card, dimens.draw_card_position),
                    cardSprite.getFlipSequence(),
                    cc.moveTo(times.draw_card, dimens.book_position),
                    cc.callFunc(function(){
                        this.model.getSpellCard( cardSprite );
                    },this),
                    cc.callFunc(function(){
                        this.generateDungeonStage();
                    },this));
            } else {
                sequence = cc.sequence(
                    cc.moveTo(times.draw_card, dimens.draw_card_position),
                    cardSprite.getFlipSequence(),
                    cc.callFunc(function(){
                        cardSprite.model.onReveal();
                        this.dungeonList.addSprite( cardSprite, -1);
                    },this), cc.callFunc(function(){
                        this.generateDungeonStage();
                    },this));
            }
            cardSprite.runAction(cc.scaleTo(times.draw_card,1,1));
            cardSprite.runAction(sequence);
        }, this);
    }
});

var MainGameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        if ( window.gameModel )
            return false;

        window.gameModel = new GameModel();
        window.gameModel.initDeck();
        window.gameModel.initRegularBuyableCards();
        var layer = new MainGameLayer({model:window.gameModel});
        window.mainLayer = layer;
        this.addChild(layer);

        var uiLayer = new UILayer({model:window.gameModel});
        this.addChild(uiLayer,100);
        return true;
    },
    showCardDetailLayer:function(cardModel){
        this.onPauseAction();
        var layer = new CardDetailLayer({model:cardModel});
        cc.director.getRunningScene().addChild(layer, 300);
    },
    pauseAction:function(){
        if ( !this.runningTargets )
            this.runningTargets = this.actionManager.pauseAllRunningActions();
    },
    onResumeAction:function(){
        this.actionManager.resumeTargets(this.runningTargets);
        this.runningTargets = null;
    }
});
