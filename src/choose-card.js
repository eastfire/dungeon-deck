var CHOOSE_CARD_PER_ROW = 4;

var ChooseCardLayer = cc.LayerColor.extend({
    ctor:function(options){
        this._super(cc.color.BLACK);
        this.options = options || {};
        this.model = options.model;
        this.onCancelCallback = options.onCancelCallback;
        this.onCancelContext = options.onCancelContext;
        this.hint = options.hint;
        this.range = options.range || [];
        this.onSelectCallback = options.onSelectCallback;
        this.onSelectContext = options.onSelectContext;
        this.visibleFilter = options.visibleFilter;
        this.validText = options.validText;
        this.invalidText = options.invalidText;
        this.validFilter = options.validFilter;
        this.cancelText = options.cancelText || texts.cancel;
        this.appendIcon = options.appendIcon;

        this.marginY = 260;
        this.marginX = Math.floor( cc.winSize.width / CHOOSE_CARD_PER_ROW );

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
        var cancelText = new cc.LabelTTF(this.cancelText, "Arial", dimens.cancel_buy_font_size);
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
        if ( this.onCancelCallback ) {
            this.onCancelCallback.call(this.onCancelContext);
        } else {
            cc.director.popScene();
        }
    },
    __initView:function(){
        this.hintLabel = new cc.LabelTTF("", "Arial", dimens.buy_font_size);
        this.addChild(this.hintLabel,2);
        this.hintLabel.attr({
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
    __renderHint:function(){
        var hintText = null;
        if ( isString(this.hint) ) {
            hintText = this.hint;
        } else if ( isFunction(this.hint) ) {
            hintText = this.hint.call();
        }
        if ( hintText ) {
            this.hintLabel.setString(hintText);
        }
    },
    __renderAll:function(){
        this.__renderHint();

        var topMargin = dimens.top_bar_height + 40;
        var bottomMargin = dimens.cancel_buy_height;
        var height = cc.winSize.height -  topMargin - bottomMargin;

        var totalHeight = 0;

        this.scrollView.removeAllChildrenWithCleanup(true);

        this.choiceMenuItems = [];

        _.each( ["discard","deck"], function(r) {
            if (_.contains(this.range, r)) {
                var cards;
                switch (r) {
                    case "discard":
                        cards = this.model.get("discardDeck");
                        break;
                    case "deck":
                        cards = this.model.get("deck");
                        break;
                }
                if (this.visibleFilter) {
                    cards = _.filter(cards, this.visibleFilter, this);
                }
                if (cards.length > 0) {
                    totalHeight += dimens.upgrade_type_label_height + 25;
                    totalHeight += this.marginY * Math.ceil(cards.length / CHOOSE_CARD_PER_ROW);
                }
            }
        },this);

        this.layerCardY = Math.max( height, totalHeight );
        this.scrollView.setInnerContainerSize( cc.size( cc.winSize.width, this.layerCardY ) );
        this.scrollView.setContentSize(cc.size(cc.winSize.width, height));

        _.each( ["discard","deck"], function(r) {
            if (_.contains(this.range, r)) {
                var cards;
                switch (r) {
                    case "discard":
                        cards = this.model.get("discardDeck");
                        break;
                    case "deck":
                        cards = this.model.get("deck");
                        break;
                }
                if (this.visibleFilter) {
                    cards = _.filter(cards, this.visibleFilter, this);
                }
                cards = _.sortBy(cards, function (cardModel) {
                    return cardModel.get("displayName")
                });
                if (cards.length > 0) {
                    this.renderCards(cards, r);
                }
            }
        },this )

        var upgradeMenu = new cc.Menu(this.choiceMenuItems);
        upgradeMenu.x = 0;
        upgradeMenu.y = 0;
        this.scrollView.addChild(upgradeMenu, 5);

        this.scrollView.x = 0;
        this.scrollView.y = bottomMargin;//cc.winSize.height - topMargin;
        this.scrollView.jumpToTop();
    },
    getUpgradeableDeckCards:function(){

    },
    getUpgradeableHandCards:function(){

    },
    getUpgradeableDungeonCards:function(){

    },
    renderCards:function(cards, type){
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
            this.renderOneCard(model);
        },this)

        if ( cards.length % CHOOSE_CARD_PER_ROW != 0 ) {
            this.layerCardY -= this.marginY / 2 + 25;
        } else {
            this.layerCardY -= -this.marginY / 2 + 25;
        }
    },
    renderOneCard:function(cardModel){
        var cardSprite = new DUNGEON_SPRITE_CLASS_MAP[cardModel.get("name")]({
            model: cardModel,
            forceToSide: "front"
        });
        cardSprite.attr({
            x: this.layerCardX,
            y: this.layerCardY,
            anchorX : 0.5,
            anchorY : 0.5
        });
        this.scrollView.addChild(cardSprite);

        if ( this.appendIcon ) {
            var icon = this.appendIcon.call(this, cardModel);
            if ( icon ) cardSprite.addChild(icon);
        }

        if ( !this.validFilter || this.validFilter.call(this, cardModel) ) {
                (function (cardModel, x, y) {
                    var choiceItem = new cc.MenuItemImage(
                        cc.spriteFrameCache.getSpriteFrame("short-normal.png"),
                        cc.spriteFrameCache.getSpriteFrame("short-selected.png"),
                        function () {
                            if ( this.onSelectCallback ) {
                                this.onSelectCallback.call(this.onSelectCallback, cardModel, this);
                            }
                        }, this);
                    choiceItem.attr({
                        x: x - 2,
                        y: y - dimens.card_height / 2 - 43,
                        anchorX: 0.5,
                        anchorY: 0.5,
                        scaleX: 0.7,
                        scaleY: 0.8
                    });
                    var text = "";
                    if ( isString(this.validText) ) {
                        text = this.validText;
                    } else if ( isFunction(this.validText) ){
                        text = this.validText.call(this, cardModel);
                    }
                    var upgradeText = new cc.LabelTTF(text, "Arial", dimens.buy_font_size);
                    upgradeText.attr({
                        color: colors.buy,
                        x: x,
                        y: y - dimens.card_height / 2 - 48
                    });
                    this.scrollView.addChild(upgradeText, 10);

                    this.choiceMenuItems.push(choiceItem);
                }).call(this, cardModel, this.layerCardX, this.layerCardY);
        } else {
            var text = null;
            if ( isString(this.invalidText) ) {
                text = this.invalidText;
            } else if ( isFunction(this.invalidText) ){
                text = this.invalidText.call(this, cardModel);
            }
            if ( text && text !== "") {
                var label = new cc.LabelTTF(text, "Arial", dimens.buy_font_size);
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

var ChooseCardScene = cc.Scene.extend({
    ctor:function(options){
        this._super();
        this.options = options;
    },
    onEnter:function () {
        this._super();
        var layer = new ChooseCardLayer(this.options);
        this.addChild(layer);
        var uiLayer = new UILayer({model:window.gameModel});
        this.addChild(uiLayer,100);
    }
});