/**
 * Created by 赢潮 on 2015/3/25.
 */
var BUYABLE_CARD_PER_ROW = 4;

var BuyCardLayer = cc.LayerColor.extend({
    ctor: function (options) {
        options = options || {};
        this._super(colors.card_detail_mask);
        this.model = options.model;

        this.initRegular();
        this.initFlow();
        this.__initUI();
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
        var cancelText = new cc.LabelTTF(texts.cancel, "宋体", dimens.cancel_buy_font_size);
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
        /*mainGame.resumeAction();
        this.removeFromParent(true);*/
        cc.director.popScene();
    },
    initRegular:function(){
        var buyItems = [];
        var layerHeight = cc.winSize.height - dimens.top_bar_height - dimens.cancel_buy_height;
        var row = Math.ceil( this.model.get("regularBuyableCards").length  / BUYABLE_CARD_PER_ROW ) + this.model.get("flowBuyableCardLines").length;
        var marginY = Math.floor( layerHeight / row );
        var marginX = Math.floor( cc.winSize.width / BUYABLE_CARD_PER_ROW );
        var y = layerHeight - marginY/2 + dimens.cancel_buy_height + 25;
        var x = marginX/2;
        var i = 0;
        _.each( this.model.get("regularBuyableCards"), function(deck){
            if ( !deck.length )
                return;

            var cardModel = _.first(deck);
            var deckSprite = new DungeonDeckSprite({
                array: deck,
                side: "front",
                fontSize : dimens.buyable_deck_count_font_size,
                countLabelOffset: { x: dimens.card_width/2-dimens.hero_icon_offset.x, y: -dimens.card_height/2 },
                numberFormat: "×%d",
                cardClass: DUNGEON_SPRITE_CLASS_MAP[cardModel.get("name")]
            });
            deckSprite.attr({
                x: x,
                y: y
            });
            this.addChild(deckSprite);

            var cost = cardModel.get("cost");
            var icon = new IconSprite({
                image: cc.spriteFrameCache.getSpriteFrame("money-icon.png"),
                text: cost,
                fontSize: dimens.buyable_deck_count_font_size,
                offset: {
                    x: dimens.hero_icon_size.width/2-1,
                    y: dimens.hero_icon_size.height/2-5
                }
            });
            icon.attr({
                x: -dimens.card_width/2 + dimens.hero_icon_offset.x,
                y: -dimens.card_height/2 + dimens.hero_icon_offset.y - 10
            })
            deckSprite.addChild(icon);

            if ( cost <= this.model.get("money") ) {
                (function(cardModel, x, y, deck){
                    var cost = cardModel.get("cost");
                    var buyItem = new cc.MenuItemImage(
                        cc.spriteFrameCache.getSpriteFrame("short-normal.png"),
                        cc.spriteFrameCache.getSpriteFrame("short-selected.png"),
                        function () {
                            if (cost <= window.gameModel.get("money")) {
                                window.gameModel.useMoney(cost);
                                deck.splice(0,1);
                                window.newDiscardCardModel = cardModel;
                                window.newDiscardCardPosition = {
                                    x: x,
                                    y: y
                                }
                                window.newDiscardCardModel.onGain();
                                this.close();
                            }
                        }, this);
                    buyItem.attr({
                        x: x - 2,
                        y: y - dimens.card_height / 2 - 43,
                        anchorX: 0.5,
                        anchorY: 0.5,
                        scaleX: 0.7,
                        scaleY: 0.8
                    });
                    var buyText = new cc.LabelTTF(texts.buy, "宋体", dimens.buy_font_size);
                    buyText.attr({
                        color: colors.buy,
                        x: x,
                        y: y - dimens.card_height / 2 - 48
                    });
                    this.addChild(buyText,10);

                    buyItems.push(buyItem);
                }).call(this, cardModel, x, y, deck);
            }

            x += marginX;
            i++;
            if ( i >= BUYABLE_CARD_PER_ROW ) {
                x = marginX/2;
                y -= marginY;
                i = 0;
            }
        },this);

        var buyMenu = new cc.Menu(buyItems);
        buyMenu.x = 0;
        buyMenu.y = 0;
        this.addChild(buyMenu, 5);
    },
    initFlow:function(){
        var buyItems = [];
        var layerHeight = cc.winSize.height - dimens.top_bar_height - dimens.cancel_buy_height;
        var row = Math.ceil( this.model.get("regularBuyableCards").length  / BUYABLE_CARD_PER_ROW ) + this.model.get("flowBuyableCardLines").length;
        var marginY = Math.floor( layerHeight / row );
        var marginX = Math.floor( cc.winSize.width / BUYABLE_CARD_PER_ROW );
        var y = layerHeight - marginY/2 + dimens.cancel_buy_height + 25 - (Math.ceil( this.model.get("regularBuyableCards").length  / BUYABLE_CARD_PER_ROW )*marginY);
        var x = marginX/2;

        _.each(this.model.get("flowBuyableCardLines"),function(line){
            var i = 0;
            _.each(line,function(cardModel){
                var arrow;
                if ( i === 0 ) {
                } else {
                    arrow = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("flow-left.png"));
                    arrow.attr({
                        x: x-marginX/2,
                        y: y-20
                    });
                    this.addChild(arrow);
                }

                if ( cardModel == null ) {
                    i++;
                    x += marginX;
                    return;
                }
                var cardSprite = new DUNGEON_SPRITE_CLASS_MAP[cardModel.get("name")]({
                    side: "front",
                    model: cardModel
                });
                cardSprite.attr({
                    x: x,
                    y: y
                });
                this.addChild(cardSprite);

                var cost = cardModel.get("cost");
                var icon = new IconSprite({
                    image: cc.spriteFrameCache.getSpriteFrame("money-icon.png"),
                    text: cost,
                    fontSize: dimens.buyable_deck_count_font_size,
                    offset: {
                        x: dimens.hero_icon_size.width/2-1,
                        y: dimens.hero_icon_size.height/2-5
                    }
                });
                icon.attr({
                    x: dimens.hero_icon_offset.x,
                    y: dimens.hero_icon_offset.y - 10
                })
                cardSprite.addChild(icon);

                if ( cost <= this.model.get("money") ) {
                    (function(cardModel, x, y, line, index){
                        var cost = cardModel.get("cost");
                        var buyItem = new cc.MenuItemImage(
                            cc.spriteFrameCache.getSpriteFrame("short-normal.png"),
                            cc.spriteFrameCache.getSpriteFrame("short-selected.png"),
                            function () {
                                if (cost <= window.gameModel.get("money")) {
                                    window.gameModel.useMoney(cost);
                                    window.newDiscardCardModel = cardModel;
                                    window.newDiscardCardPosition = {
                                        x: x,
                                        y: y
                                    }
                                    window.newDiscardCardModel.onGain();
                                    line[index] = null;
                                    this.close();
                                }
                            }, this);
                        buyItem.attr({
                            x: x - 2,
                            y: y - dimens.card_height / 2 - 43,
                            anchorX: 0.5,
                            anchorY: 0.5,
                            scaleX: 0.7,
                            scaleY: 0.8
                        });
                        var buyText = new cc.LabelTTF(texts.buy, "宋体", dimens.buy_font_size);
                        buyText.attr({
                            color: colors.buy,
                            x: x,
                            y: y - dimens.card_height / 2 - 48
                        });
                        this.addChild(buyText,10);

                        buyItems.push(buyItem);
                    }).call(this, cardModel, x, y, line, i);
                }

                i++;
                x += marginX;
            },this);
            x = marginX/2;
            y -= marginY;
        },this)

        var buyMenu = new cc.Menu(buyItems);
        buyMenu.x = 0;
        buyMenu.y = 0;
        this.addChild(buyMenu, 5);
    }
});

var BuyCardScene = cc.Scene.extend({
    ctor:function(options){
        this._super();
        this.options = options || {};
    },
    onEnter:function (options) {
        this._super();
        var layer = new BuyCardLayer({model:this.options.model});
        this.addChild(layer);
        var uiLayer = new UILayer({model:window.gameModel});
        this.addChild(uiLayer,100);
    }
});