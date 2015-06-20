/**
 * Created by 赢潮 on 2015/4/11.
 */
var LevelUpBonus = Backbone.Model.extend({
    defaults:function(){
        return {
            level: 1,
            maxLevel: 1,
            cancelable: false
        }
    },
    getDescription:function(){
        return this.get("description");
    },
    onGain:function(){
    }
});

var UpgradeChanceBonus = LevelUpBonus.extend({
    defaults:function(){
        return {
            level: 1,
            maxLevel: 10000,
            description:"获得2次卡牌升级机会"
        }
    },
    onGain:function(){
        window.gameModel.gainUpgradeChance(2);
    }
});

var HpBonus = LevelUpBonus.extend({
    defaults:function(){
        return {
            level: 1,
            maxLevel: 10000,
            description:"＋５{[hp]}上限"
        }
    },
    onGain:function(){
        window.gameModel.set("maxHp",window.gameModel.get("maxHp")+5);
        window.gameModel.set("hp",window.gameModel.get("hp")+5);
    }
});

var CardBonus = LevelUpBonus.extend({
    initialize:function(){
        this.set("level",this.get("level") || 1);
        this.set("maxLevel",this.get("maxLevel") || 1);
        this.set("cardLevel", this.get("cardLevel") || 1);
        this.set("cardNumber",this.get("cardNumber")||1);
        var name = this.get("cardName");
        var model = new DUNGEON_CLASS_MAP[name]();
        this.cardName = model.get("displayName");
    },
    getDescription:function(){
        return "获得"+this.get("cardNumber")+"张LV"+this.get("cardLevel") + this.cardName;
    },
    onGain:function(options){
        var name = this.get("cardName");
        var model = new DUNGEON_CLASS_MAP[name]({
            level: this.get("cardLevel"),
            side:"front"
        });
        window.newDiscardCardModel = model;
        window.newDiscardCardPosition = {
            x: options.cardX,
            y: options.cardY
        }
        window.newDiscardCardModel.onGain();
    }
});

var MoneyBonus = LevelUpBonus.extend({
    defaults:function(){
        return {
            level: 1,
            maxLevel: 10000,
            description:"让{[money]}变为最大"
        }
    },
    onGain:function(){
        window.gameModel.set("money",window.gameModel.get("maxMoney"));
    }
});

var UpgradeFromDeckBonus = LevelUpBonus.extend({
    defaults:function(){
        return {
            level: 1,
            maxLevel: 1,
            description:"可以升级牌堆中的牌"
        }
    },
    onGain:function(options){
        window.gameModel.set("upgradeRangeLevel", UPGRADE_RANGE_LEVEL.FROM_DECK );
    }
});

var CullBonus = LevelUpBonus.extend({
    defaults:function(){
        return {
            level: 1,
            maxLevel: 10000,
            description:"将弃牌堆中1张牌移出游戏",
            cancelable: true,
            range: "discard"
        }
    },
    onGain:function(options){
        var layer = new ChooseCardLayer({
            model: gameModel,
            range: [this.get("range")],
            validText: texts.cull,
            hint: "请选择1张牌移出游戏",
            visibleFilter:function(cardModel){
                return cardModel.get("cullable");
            },
            onSelectCallback:function(cardModel, chooseCardLayer){
                gameModel.cullCard(cardModel);
                if ( options.onConfirmCallback ) {
                    options.onConfirmCallback.call(options.context);
                }
            },
            onSelectContext:this,
            onCancelCallback:function(){
                layer.removeFromParent(true);
                if ( options.onCancelCallback )
                    options.onCancelCallback.call(options.context)
            },
            onCancelContext:options.context
        });
        options.context.addChild(layer,50);
    }
});

var AlwaysLevelUpBonus = LevelUpBonus.extend({
    defaults:function(){
        return {
            level: 1,
            maxLevel: 10000,
            description:"获得2次升级卡牌的机会"
        }
    },
    onGain:function(){
        window.gameModel.gainUpgradeChance(2);
    }
});

var BonusCardX = 545;

var LevelUpLayer = cc.Layer.extend({
    ctor:function(options){
        this._super();
        this.options = options || {};

        this.model = options.model;

        this.renderAllBonus();

        var congratulationLabel = new cc.LabelTTF("恭喜！地城之心升级到LV"+this.model.get("level")+"\n\n\n请选择额外的奖励", "Arial", dimens.buy_font_size);
        this.addChild(congratulationLabel,2);
        congratulationLabel.attr({
            color: colors.upgrade_type_label,
            x: cc.winSize.width/2,
            y: cc.winSize.height -  dimens.top_bar_height - 5,
            anchorY: 1
        });

        var bonusEachLevelUp = this.model.get("bonusEachLevelUp");
        if ( bonusEachLevelUp ) {
            bonusEachLevelUp.onGain(this);
            var bonusEachLevelUpLabel = buildRichText({
                str : bonusEachLevelUp.getDescription() ,
                fontSize : dimens.buy_font_size,
                fontColor: colors.upgrade_type_label,
                width: cc.winSize.width,
                height: 60
            });
            this.addChild(bonusEachLevelUpLabel,2);
            bonusEachLevelUpLabel.attr({
                x: cc.winSize.width/2 + 120,
                y: cc.winSize.height -  dimens.top_bar_height - 5 - 30,
                anchorY: 1,
                anchorX : 0.5
            });
        }
    },
    generateAvailableLevelUpBonus:function(){
        var pool = _.filter(this.model.get("bonusPool"),function(bonus){
            return bonus.get("level") <= bonus.get("maxLevel")
        },this);
        return _.sample( pool, this.model.get("bonusChoiceNumber"))
    },
    renderAllBonus:function(){
        var levelUps = this.generateAvailableLevelUpBonus();
        var total = cc.winSize.height -  dimens.top_bar_height - 60;
        var bonusMarginY = total/this.model.get("bonusChoiceNumber");
        var bonusY = bonusMarginY*(this.model.get("bonusChoiceNumber")) - bonusMarginY/2;
        var bonusItems = [];
        _.each(levelUps,function(bonus){
            var y = bonusY;
            var bonusItem = new cc.MenuItemImage(
                cc.spriteFrameCache.getSpriteFrame("short-normal.png"),
                cc.spriteFrameCache.getSpriteFrame("short-selected.png"),
                function () {
                    if ( bonus.get("cancelable")) {
                        bonus.onGain({
                            cardX : BonusCardX,
                            cardY : y-50,
                            onCancelCallback:function(){
                            },
                            onConfirmCallback:function(){
                                this.close();
                                bonus.set("level", bonus.get("level")+1);
                            },
                            context: this
                        } );
                    } else {
                        bonus.onGain({
                            cardX : BonusCardX,
                            cardY : y-50
                        } );
                        this.close();
                        bonus.set("level", bonus.get("level")+1);
                    }
                }, this);
            bonusItem.attr({
                x: cc.winSize.width/2,
                y: bonusY-50,
                anchorX: 0.5,
                anchorY: 0.5,
                scaleX: 3.3,
                scaleY: 3.3
            });
            bonusItems.push(bonusItem);

            var bonusLabel = buildRichText({
                str : bonus.getDescription() ,
                fontSize : dimens.buy_font_size,
                fontColor: cc.color.BLACK,
                width: cc.winSize.width - 100,
                height: 60
            });
            this.addChild(bonusLabel,2);
            bonusLabel.attr({
                x: cc.winSize.width/2 + 100,
                y: bonusY,
                anchorY: 1,
                anchorX : 0.5
            });

            if (bonus instanceof  CardBonus) {
                var name = bonus.get("cardName");
                var model = new DUNGEON_CLASS_MAP[name]({
                    level: bonus.get("cardLevel"),
                    side:"front"
                });
                var cardSprite = new DUNGEON_SPRITE_CLASS_MAP[name]({
                    model: model,
                    swallowEvent: true
                });
                cardSprite.attr({
                    x: BonusCardX,
                    y: bonusY-50
                })
                this.addChild(cardSprite,5);
            }
            bonusY -= bonusMarginY;
        },this);

        var bonusMenu = new cc.Menu(bonusItems);
        bonusMenu.x = 0;
        bonusMenu.y = 0;
        this.addChild(bonusMenu);
    },
    close:function(){
        cc.director.popScene();
        if ( this.options.callback )
            this.options.callback.call(this.options.context);
    }
})

var LevelUpScene = cc.Scene.extend({
    ctor:function(options){
        this._super();
        this.options = options || {};
    },
    onEnter:function (options) {
        this._super();

        var layer = new LevelUpLayer(this.options);
        this.addChild(layer);
        var uiLayer = new UILayer({model:window.gameModel});
        this.addChild(uiLayer,100);
    }
});

//TODO card number up
//TODO card max level up
//TODO add choice count
//TODO reduce exp require
//TODO add tavern fee
//TODO reduce buy trap cost
//TODO reduce buy monster cost
//TODO reduce buy spell cost
//TODO reduce upgrade trap cost
//TODO reduce upgrade monster cost
//TODO reduce upgrade spell cost
//TODO reduce hero attack heart

var LEVEL_UP_BONUS_CLASS_MAP = {
    "alwaysLevelUpBonus": AlwaysLevelUpBonus,
    "upgradeChance": UpgradeChanceBonus,
    "maxHp": HpBonus,
    "money": MoneyBonus,
    cullDiscard : CullBonus,
    cullDeck : CullBonus.extend({
        defaults: function() {
            return _.extend(CullBonus.prototype.defaults.call(this), {
                description:"将牌堆中1张牌移出游戏",
                range: "deck"
            });
        }
    }),
    upgradeFromDeck : UpgradeFromDeckBonus,
    vault: CardBonus.extend({
        defaults: {
            maxLevel: 100,
            cardName: "vault"
        }
    }),
    "hen-den": CardBonus.extend({
        defaults: {
            maxLevel: 100,
            cardName: "hen-den"
        }
    }),
    library: CardBonus.extend({
        defaults: {
            maxLevel: 4,
            cardName: "library"
        }
    }),
    prison: CardBonus.extend({
        defaults: {
            maxLevel: 5,
            cardName: "prison"
        }
    }),
    "spoiled-food": CardBonus.extend({
        defaults: {
            maxLevel: 5,
            cardName: "spoiled-food"
        }
    })
}