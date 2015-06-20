/**
 * Created by 赢潮 on 2015/5/1.
 */
/*var UPGRADE_CARD_PER_ROW = 4;

var UpgradeLayer = cc.Layer.extend({
    ctor:function(options){
        this._super();
        this.options = options || {};
        this.model = options.model;

        this.marginY = 260;
        this.marginX = Math.floor( cc.winSize.width / UPGRADE_CARD_PER_ROW );

        this.__initView();
        this.__initUI();

        this.__renderAll();
    },
    __initUI:function(){
        var cancelItem = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("short-normal.png"),
            cc.spriteFrameCache.getSpriteFrame("short-selected.png"),
            function () {
                this.close();
            }, this );
        cancelItem.attr({
            x: dimens.cancel_buy_position.x,
            y: dimens.cancel_buy_position.y,
            anchorX: 0.5,
            anchorY: 0.5
        });
        var cancelText = new cc.LabelTTF(texts.cancel, "Arial", dimens.cancel_buy_font_size);
        cancelText.attr({
            color: colors.cancel_buy,
            x: 90,
            y: 25
        })
        cancelItem.addChild( cancelText );
        var cancelMenu = new cc.Menu(cancelItem);
        cancelMenu.x = 0;
        cancelMenu.y = 0;
        this.addChild(cancelMenu, 5);
    },
    close:function(){
        cc.director.popScene();
    },
    __initView:function(){
        this.chanceLabel = new cc.LabelTTF("", "Arial", dimens.buy_font_size);
        this.addChild(this.chanceLabel,2);
        this.chanceLabel.attr({
            color: colors.upgrade_type_label,
            x: cc.winSize.width/2,
            y: cc.winSize.height -  dimens.top_bar_height - 5,
            anchorY: 1
        })

        // Create the scrollview
        this.scrollView = new ccui.ScrollView();
        this.scrollView.setDirection(ccui.ScrollView.DIR_VERTICAL);
        this.scrollView.setTouchEnabled(true);

        this.addChild(this.scrollView,2)
    },
    __renderUpgradeChance:function(){
        var chance = this.model.get("upgradeChance");
        var chanceText = chance > 0 ? ("你可以升级"+chance+"次卡牌") : "升级地城之心以获得升级卡牌的机会";
        this.chanceLabel.setString(chanceText);
    },
    __renderAll:function(){
        this.__renderUpgradeChance();

        var topMargin = dimens.top_bar_height + 40;
        var bottomMargin = dimens.cancel_buy_height;
        var height = cc.winSize.height -  topMargin - bottomMargin;

        var totalHeight = 0;

        this.scrollView.removeAllChildrenWithCleanup(true);

        this.upgradeItems = [];
        var upgradeableCards = this.getUpgradeableDiscardCards();
        if ( upgradeableCards.length > 0 ) {
            totalHeight += dimens.upgrade_type_label_height;
            totalHeight += this.marginY * Math.ceil( upgradeableCards.length / UPGRADE_CARD_PER_ROW );
        }

        this.layerCardY = Math.max( height, totalHeight );
        this.scrollView.setInnerContainerSize( cc.size( cc.winSize.width, this.layerCardY ) );
        this.scrollView.setContentSize(cc.size(cc.winSize.width, height));

        this.renderUpgrade(upgradeableCards, "discard");

        var upgradeMenu = new cc.Menu(this.upgradeItems);
        upgradeMenu.x = 0;
        upgradeMenu.y = 0;
        this.scrollView.addChild(upgradeMenu, 5);

        this.scrollView.x = 0;
        this.scrollView.y = bottomMargin;//cc.winSize.height - topMargin;
        this.scrollView.jumpToTop();
    },
    getUpgradeableDiscardCards:function(){
        var cards = this.model.get("discardDeck");
        return _.filter(cards, function(model){
            return model.get("upgradeable");
        },this);
    },
    getUpgradeableDeckCards:function(){

    },
    getUpgradeableHandCards:function(){

    },
    getUpgradeableDungeonCards:function(){

    },
    renderUpgrade:function(cards, type){
        var label = new cc.LabelTTF(texts.card_from[type], "Arial", dimens.buy_font_size);
        this.layerCardY -= dimens.upgrade_type_label_height/2 + 10;
        label.attr({
            color: colors.upgrade_type_label,
            x: cc.winSize.width/2,
            y: this.layerCardY,
            anchorY: 0.5
        })
        this.scrollView.addChild(label);
        this.layerCardY -= dimens.upgrade_type_label_height/2+this.marginY / 2-35;

        this.layerCardX = this.marginX/2;

        _.each(cards,function(model){
            this.renderOneUpgrade(model);
        },this)
    },
    renderOneUpgrade:function(cardModel){
        var cardSprite = new DUNGEON_SPRITE_CLASS_MAP[cardModel.get("name")]({
            model: cardModel
        });
        cardSprite.attr({
            x: this.layerCardX,
            y: this.layerCardY,
            anchorX : 0.5,
            anchorY : 0.5
        });
        this.scrollView.addChild(cardSprite);

        if (this.model.get("upgradeChance") > 0) {
            if ( cardModel.get("level") < cardModel.get("maxLevel") ) {
                var cost = cardModel.get("upgradeCost");
                var icon = new IconSprite({
                    image: cc.spriteFrameCache.getSpriteFrame("money-icon.png"),
                    text: cost,
                    fontSize: dimens.buyable_deck_count_font_size,
                    offset: {
                        x: dimens.hero_icon_size.width / 2 - 1,
                        y: dimens.hero_icon_size.height / 2 - 5
                    }
                });
                icon.attr({
                    x: dimens.hero_icon_offset.x,
                    y: dimens.hero_icon_offset.y
                })
                cardSprite.addChild(icon);

                if (this.model.get("money") >= cardModel.get("upgradeCost")) {
                    (function (cardModel, x, y) {
                        var cost = cardModel.get("upgradeCost");
                        var upgradeItem = new cc.MenuItemImage(
                            cc.spriteFrameCache.getSpriteFrame("short-normal.png"),
                            cc.spriteFrameCache.getSpriteFrame("short-selected.png"),
                            function () {
                                if (cost <= this.model.get("money")) {
                                    this.askUpgrade(cardModel);
                                }
                            }, this);
                        upgradeItem.attr({
                            x: x - 2,
                            y: y - dimens.card_height / 2 - 43,
                            anchorX: 0.5,
                            anchorY: 0.5,
                            scaleX: 0.7,
                            scaleY: 0.8
                        });
                        var upgradeText = new cc.LabelTTF(texts.level_up, "Arial", dimens.buy_font_size);
                        upgradeText.attr({
                            color: colors.buy,
                            x: x,
                            y: y - dimens.card_height / 2 - 48
                        });
                        this.scrollView.addChild(upgradeText, 10);

                        this.upgradeItems.push(upgradeItem);
                    }).call(this, cardModel, this.layerCardX, this.layerCardY);
                }
            } else {
                var label = new cc.LabelTTF(texts.max_level, "Arial", dimens.buy_font_size);
                label.attr({
                    color: colors.upgrade_type_label,
                    x: this.layerCardX,
                    y: this.layerCardY - dimens.card_height / 2 - 48,
                    anchorY: 0.5
                })
                this.scrollView.addChild(label);
            }
        }

        this.layerCardX += this.marginX;
        if ( this.layerCardX > cc.winSize.width ) {
            this.layerCardX = this.marginX/2;
            this.layerCardY -= this.marginY;
        }
    },
    askUpgrade:function(model){
        var targetLevel = model.get("level") + 1;
        var upgradeVersionModel = new DUNGEON_CLASS_MAP[model.get("name")]({
            level: targetLevel
        });
        var self = this;
        window.mainGame.pauseAction();
        var layer = new CardDetailLayer({model:upgradeVersionModel,
            hint: "支付"+model.get("upgradeCost")+"{[money]}将"+model.get("displayName")+"升到"+targetLevel+"级？",
            choices:[{
                text: texts.level_up,
                callback: function(){
                    this.model.useMoney(model.get("upgradeCost"));
                    model.levelUp();
                    this.model.set("upgradeChance", this.model.get("upgradeChance")-1);
                    this.__renderAll();
                    layer.close();
                },
                context: this,
                textOffset: {
                    x: 150,
                    y: 15
                }
            },{
                text: texts.cancel,
                callback: function(){
                    layer.close();
                },
                context: this,
                textOffset: {
                    x: 150,
                    y: 15
                }
            }]});
        this.addChild(layer, 300);
    }
})

var UpgradeScene = cc.Scene.extend({
    ctor:function(options){
        this._super();
    },
    onEnter:function (options) {
        this._super();
        var layer = new UpgradeLayer({model:window.gameModel});
        this.addChild(layer);
        var uiLayer = new UILayer({model:window.gameModel});
        this.addChild(uiLayer,100);
    }
});*/

var showUpgrade = function(options){
    var range = ["discard"];
    if ( gameModel.get("upgradeRangeLevel") === UPGRADE_RANGE_LEVEL.FROM_DECK ) {
        range.push("deck");
    }
    cc.director.pushScene(new ChooseCardScene({
        model: gameModel,
        range: range,
        validText: texts.level_up,
        hint: function(){
            var chance = gameModel.get("upgradeChance");
            return chance > 0 ? ("你可以升级"+chance+"次卡牌") : "升级地城之心以获得升级卡牌的机会";
        },
        visibleFilter:function(cardModel){
            return cardModel.get("upgradeable");
        },
        validFilter:function(cardModel){
            return gameModel.get("upgradeChance") > 0
                && cardModel.get("level") < cardModel.get("maxLevel")
                && gameModel.get("money") >= cardModel.get("upgradeCost");
        },
        invalidText:function(cardModel){
            if ( gameModel.get("upgradeChance") === 0 ) return null;
            if ( cardModel.get("level") >= cardModel.get("maxLevel") ) return texts.max_level;
            return null;
        },
        appendIcon:function(cardModel){
            if ( cardModel.get("level") >= cardModel.get("maxLevel") ) return null;
            var cost = cardModel.get("upgradeCost");
            var icon = new IconSprite({
                image: cc.spriteFrameCache.getSpriteFrame("money-icon.png"),
                text: cost,
                fontSize: dimens.buyable_deck_count_font_size,
                offset: {
                    x: dimens.hero_icon_size.width / 2 - 1,
                    y: dimens.hero_icon_size.height / 2 - 5
                }
            });
            icon.attr({
                x: dimens.hero_icon_offset.x,
                y: dimens.hero_icon_offset.y
            })
            return icon;
        },
        onSelectCallback:function(cardModel, chooseCardLayer){
            var cost = cardModel.get("upgradeCost");
            if (cost <= gameModel.get("money")) {
                var targetLevel = cardModel.get("level") + 1;
                var upgradeVersionModel = new DUNGEON_CLASS_MAP[cardModel.get("name")]({
                    level: targetLevel
                });
                var self = this;
                window.mainGame.pauseAction();
                var layer = new CardDetailLayer({model:upgradeVersionModel,
                    hint: "支付"+cardModel.get("upgradeCost")+"{[money]}将"+cardModel.get("displayName")+"升到"+targetLevel+"级？",
                    choices:[{
                        text: texts.level_up,
                        callback: function(){
                            gameModel.useMoney(cardModel.get("upgradeCost"));
                            cardModel.levelUp();
                            gameModel.set("upgradeChance", gameModel.get("upgradeChance")-1);
                            chooseCardLayer.__renderAll();
                            layer.close();
                        },
                        context: this,
                        textOffset: {
                            x: 150,
                            y: 8
                        }
                    },{
                        text: texts.cancel,
                        callback: function(){
                            layer.close();
                        },
                        context: this,
                        textOffset: {
                            x: 150,
                            y: 8
                        }
                    }]});
                chooseCardLayer.addChild(layer, 300);
            }
        },
        onSelectContext:this
    }));
}