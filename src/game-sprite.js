/**
 * Created by 赢潮 on 2015/3/2.
 */

var DiscardCardSprite = CardSprite.extend({
    ctor: function (options) {
        options = options || {};
        this.model = options.model;

        var opt = {
            side: this.model.get("side"),
            frontImage: this.getFrontImage(),
            backImage: this.getBackImage()
        }
        this._super(opt);

        this.touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: false,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();

                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);

                if (cc.rectContainsPoint(rect, locationInNode)) {
                    return true;
                }
                return false;
            },
            onTouchMoved: function (touch, event) {
            },
            onTouchEnded: function (touch, event) {
                var target = event.getCurrentTarget();
                var now = (new Date()).getTime();
                if ( (Math.abs(now - target.lastTouchTime) < DOUBLE_TAP_TIME_THRESHOLD)) {
                    var e = new cc.EventCustom("double-tap");
                    e.setUserData(target);
                    cc.eventManager.dispatchEvent(e);
                }
                target.lastTouchTime = now;
            }
        });
    },
    onEnter:function(){
        this._super();
        this.__initEvent();
        this.__refresh();
    },
    onExit:function(){
        this._super();
        this.model.off(null,null,this);
        cc.eventManager.removeListener(this.touchListener);
    },
    __refresh:function(){

    },
    __initEvent:function(){
        this.lastTouchTime = 0;
        cc.eventManager.addListener(this.touchListener, this);
    },
    getFrontImage:function(){
        return cc.spriteFrameCache.getSpriteFrame(this.model.get("type")+"-"+this.model.get("name")+"-small.png")
    },
    getBackImage:function(){
        return cc.spriteFrameCache.getSpriteFrame(this.model.get("backType")+"-back.png")
    }
});

var BaseCardSprite = CardSprite.extend({
    ctor: function (options) {
        options = options || {};
        var swallowEvent = options.swallowEvent || false;
        var forceToSide = options.forceToSide || null;
        this.model = options.model;
        this.setName(this.model.cid);

        var opt = {
            side : forceToSide ? forceToSide : this.model.get("side"),
            frontImage: this.getFrontImage(),
            backImage: this.getBackImage()
        }
        this._super(opt);

        var self = this;
        this.touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: swallowEvent,
            onTouchBegan: function (touch, event) {
                var target = event.getCurrentTarget();

                var locationInNode = target.convertToNodeSpace(touch.getLocation());
                var s = target.getContentSize();
                var rect = cc.rect(0, 0, s.width, s.height);

                if (cc.rectContainsPoint(rect, locationInNode)) {
                    return true;
                }
                return false;
            },
            onTouchMoved: function (touch, event) {
            },
            onTouchEnded: function (touch, event) {
                var target = event.getCurrentTarget();
                var now = (new Date()).getTime();
                if (Math.abs(now - target.lastTouchTime) < DOUBLE_TAP_TIME_THRESHOLD) {
                    var e = new cc.EventCustom("double-tap");
                    e.setUserData(target);
                    cc.eventManager.dispatchEvent(e);
                } else {
                    if ( self.onClickListener ) {
                        self.onClickListener.call(self.onClickListenerContext);
                    }
                }
                target.lastTouchTime = now;
            }
        });

        this.icons = {};

        this.registerIcon( "level", cc.spriteFrameCache.getSpriteFrame(this.model.isMaxLevel() ? "max-level-icon.png" : "level-icon.png"), {
            x: dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y
        } );

        this.registerIcon( "payMoney", cc.spriteFrameCache.getSpriteFrame("pay-money-icon.png"), {
            x: dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y - dimens.hero_icon_size.height
        } );
        this.registerIcon( "payScore", cc.spriteFrameCache.getSpriteFrame("pay-score-icon.png"), {
            x: dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y - dimens.hero_icon_size.height
        } );
        this.registerIcon( "payHp", cc.spriteFrameCache.getSpriteFrame("pay-hp-icon.png"), {
            x: dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y - dimens.hero_icon_size.height
        } );

    },
    registerIcon:function(iconAttribute, image, position , options) {
        options = options || {};
        this.icons[iconAttribute] = {
            position:position,
            image: image,
            showZero: options.showZero || false,
            buffAttribute : options.buffAttribute,
            debuffAttribute : options.debuffAttribute,
            normalColor: options.normalColor || colors.icon_label,
            buffColor: options.buffColor || cc.color.GREEN,
            debuffColor: options.debuffColor || colors.icon_debuff
        };
    },
    setOnClickListener:function(listener,listenerContext){
        this.onClickListener = listener;
        this.onClickListenerContext = listenerContext;
    },
    setSwallowEvent:function(swallow){
        this.touchListener.swallowTouches = swallow;
    },
    __canShowDetail:function(){
        return true
    },
    getFrontImage:function(){
        return cc.spriteFrameCache.getSpriteFrame(this.model.get("type")+"-"+this.model.get("name")+"-small.png")
    },
    getBackImage:function(){
        return cc.spriteFrameCache.getSpriteFrame(this.model.get("backType")+"-back.png")
    },
    onChangeSide:function(){
        var side = this.model.get("side");
        if ( side === "back" ) {
            this.model.set("side","front");
        } else if ( side === "front" ) {
            this.model.set("side","back");
        }
    },
    onEnter:function(){
        this._super();
        this.__initEvent();
        this.__refresh();
    },
    onExit:function(){
        this.model.off(null,null,this);
        cc.eventManager.removeListener(this.touchListener);
        this._super();
    },
    __refresh:function(){
        this.renderIcon("level");
        this.renderIcon("payMoney");
        this.renderIcon("payHp");
        this.renderIcon("payScore");
    },
    __initEvent:function(){
        this.model.on("change:level",function(){
            this.onIconChanged("level", this.icons.level.concernIncrease, this.icons.level.concernDecrease);
            if ( this.model.isMaxLevel() && this.model.previous("level") < this.model.get("maxLevel") ) {
                if ( this.icons.level.icon ) {
                    this.icons.level.icon.setIcon(cc.spriteFrameCache.getSpriteFrame("max-level-icon.png"));
                }
            }
        },this);
        this.model.on("change:payMoney",function(){
            this.onIconChanged("payMoney", true, true);
        },this);
        this.model.on("change:payHp",function(){
            this.onIconChanged("payHp", true, true);
        },this);
        this.model.on("change:payScore",function(){
            this.onIconChanged("payScore", true, true);
        },this);
        this.model.on("give",this.onGiveIcon,this);
        this.model.on("take",this.onTakeIcon,this);

        this.lastTouchTime = 0;
        cc.eventManager.addListener(this.touchListener,this);
    },
    onGiveIcon:function(options){
        effectIconMananger.fly( this, iconSource[options.icon], {
            icon: options.icon,
            text: options.text
        });
    },
    onTakeIcon:function(options){
        effectIconMananger.fly( iconSource[options.icon], this, {
            icon: options.icon,
            text: options.text
        });
    },
//    renderLevel:function(){
//        this.levelIcon.setString(this.model.get("level"))
//    },
    onSelectTarget:function(heroModel){
        this.model.onSelectTarget(heroModel);
    },
    renderIconStringColor:function(entry){
        if ( entry.buffAttribute && entry.debuffAttribute ) {
            var diff = this.model.get(entry.buffAttribute) - this.model.get(entry.debuffAttribute);
            if ( diff > 0 ) {
                entry.icon.setFontColor(entry.buffColor);
            } else if ( diff < 0 ) {
                entry.icon.setFontColor(entry.debuffColor);
            } else {
                entry.icon.setFontColor(entry.normalColor);
            }
        } else {
            entry.icon.setFontColor(entry.normalColor);
        }
    },
    renderIcon:function(attr){
        var entry = this.icons[attr];
        if ( !entry ) return;
        var stat = this.model.get(attr);
        if ( stat !== false && (entry.showZero || stat !== 0) && stat !== undefined ) {
            if ( entry.icon ) {
                if ( stat !== true ) {
                    entry.icon.setString(stat);
                    this.renderIconStringColor(entry);
                }
            } else {
                var iconSprite = entry.icon = new IconSprite({
                    image: this.icons[attr].image
                });
                iconSprite.attr ( this.icons[attr].position )
                if ( stat !== true ) {
                    iconSprite.setString(stat);
                    this.renderIconStringColor(entry);
                }
                this.addChild(iconSprite,1)
                this.addFrontSprite( iconSprite );
            }
        } else {
            if ( entry.icon ) {
                this.removeFrontSprite(entry.icon);
                entry.icon.removeFromParent(true);
                entry.icon = null;
            }
        }
    },
    onIconChanged:function(attr, needAddEffect, needSubEffect){
        this.renderIcon(attr);
        var stat = this.model.get(attr);
        if ( this.model.previous(attr) != stat ) {
            var diff = stat - this.model.previous(attr);
            var diffStr = diff;
            if ( diff > 0 )
                diffStr = "+"+diff;
            if ( ( diff > 0 && needAddEffect ) || ( diff < 0 && needSubEffect ) ) {
                effectIconMananger.enqueue(this, {
                    icon: attr + "-icon",
                    text: diffStr
                });
            }
        }
    }
})

var IconSprite = cc.Sprite.extend({
    ctor: function(options){
        options = options || {}
        var fontSize = options.fontSize || dimens.hero_hp_font_size;
        var fontColor = options.fontColor || colors.icon_label;
        var text = options.text || "";
        var image = options.image;
        var offset = options.offset || {
            x : dimens.hero_icon_size.width/2,
            y : dimens.hero_icon_size.height/2-1
        }
        this._super(image);

        this.label = new ccui.Text(text, "Arial", fontSize );
        this.label.enableOutline(cc.color.WHITE, 2);
        this.label.setTextColor(fontColor);

        this.label.attr({
            x: offset.x,
            y: offset.y
        })
        this.addChild(this.label,1)
    },
    setIcon:function(image){
        if ( image instanceof cc.Texture2D )
            this.setTexture(image);
        else if ( image instanceof cc.SpriteFrame )
            this.setSpriteFrame(image);
    },
    setString:function(str){
        this.label.setString(str)
    },
    setFontColor:function(color){
        //this.label.setColor(color);
        this.label.setTextColor(color);
    }
})

var DeckSprite = cc.Sprite.extend({
    ctor: function (options) {
        options = options || {};
        this.__cards = options.array || [];
        this.countLabelFontSize = options.fontSize || 25;
        this.countLabelFontColor = options.fontColor || cc.color(255,255,255,255);
        this.countLabelOffset = options.countLabelOffset || { x: 0, y: 0 };
        this.isShowZero = options.isShowZero || false;
        this.numberFormat = options.numberFormat || "%d";
        this.cardClass = options.cardClass || BaseCardSprite;
        this._super();

        this.countLabel = new cc.LabelTTF("", "宋体", this.countLabelFontSize );
        this.countLabel.attr({
            color: this.countLabelFontColor,
            x: this.countLabelOffset.x,
            y: this.countLabelOffset.y
        })
        this.addChild(this.countLabel,2)

        this.__render();
    },
    setDiscardDeck:function( deckSprite , autoRefill, refillType ){
        this.discardDeck = deckSprite;
        this.autoRefill = autoRefill;
        this.refillType = refillType;
    },
    __render:function(){
        if ( this.topCardSprite ) {
            this.removeChild(this.topCardSprite, true);
            this.topCardSprite = null;
        }
        if ( this.__cards.length ) {
            var lastCard = _.last(this.__cards);
            this.topCardSprite = new this.cardClass({ model: lastCard })
            this.topCardSprite.attr({
                x: 0,
                y: 0
            })
            this.addChild(this.topCardSprite);
        }
        if ( ( this.__cards.length === 0 && this.isShowZero ) || this.__cards.length ) {
            this.countLabel.setString( this.numberFormat.replace("%d", this.__cards.length ));
        } else {
            this.countLabel.setString("");
        }
    },
    drawCard:function(callback, context){
        if ( this.__cards.length ) {
            var card = this.__cards.pop();
            callback.call(context, this.modelToSprite(card) );
            this.__render();
        } else if ( this.discardDeck && this.autoRefill && this.discardDeck.__cards.length ) {
            var tempCards = this.discardDeck.getCards();
            if ( this.refillType === "shuffle" ) {
                tempCards = _.shuffle( tempCards );
            }
            _.each(tempCards,function(model){
                this.__cards.push( model );
            },this);
            _.each(this.__cards,function(cardModel){
                cardModel.set("side","back");
            },this);
            this.discardDeck.empty();

            var card = this.__cards.pop();
            callback.call(context, this.modelToSprite(card) );
            this.__render();
        } else {
            callback.call(context, null); // nothing to draw
        }
    },
    modelToSprite:function(model){
        return new this.cardClass({
            model: model,
            side : model.get("side")
        });
    },
    putCard:function(cardSpriteOrModel){
        if ( cardSpriteOrModel instanceof cc.Sprite ) {
            this.__cards.push(cardSpriteOrModel.model);
            cardSpriteOrModel.removeFromParent(true);
            cardSpriteOrModel = null;
        } else if ( cardSpriteOrModel instanceof Backbone.Model ) {
            this.__cards.push(cardSpriteOrModel);
        }
        this.__render();
    },
    shuffle:function( callback, context ){
        var temp = _.shuffle(this.__cards);
        this.__cards.splice(0, temp.length);
        _.each( temp, function(model){
            this.__cards.push(model);
        },this);
        if ( callback )
            callback.call(context);
        this.__render();
    },
    empty:function( ) {
        this.__cards.splice(0, this.__cards.length);
        this.__render();
    },
    getCards:function(){
        return this.__cards;
    },
    cullCard:function(cardModel){
        var index = _.indexOf(this.__cards, cardModel);
        if ( index != -1 ) {
            this.__cards.splice(index, 1);
            this.__render();
        }
    }
})

var DungeonDeckSprite = DeckSprite.extend({
    modelToSprite:function(model){
        return new DUNGEON_SPRITE_CLASS_MAP[model.get("name")]({
            model: model
        });
    }
})

var EffectIconManager = Backbone.Model.extend({
    initialize:function(options){
        this.layer = options.layer;
        this.iconZindex = options.zindex || 100;
        this.iconMap = {};
        this.queueMap = {};
    },
    enqueue:function(sprite, options){
        options = options || {};
        if ( !this.queueMap[ sprite.__instanceId ] )
            this.queueMap[sprite.__instanceId] = [];
        this.queueMap[sprite.__instanceId].push( {
            icon: options.icon,
            text: options.text || "",
            offset: options.offset || {x:0, y:0}
        });
        this._popEffect(sprite);
    },
    fly:function(fromSprite, toSprite, options ) {
        options = options || {};
        var moveTime = options.time || times.default_icon_fly;
        var fromOffset = options.fromOffset || {x:0,y:0};
        var toOffset = options.toOffset || {x:0,y:0};
        var icon = new IconSprite({
            text: options.text,
            image: cc.spriteFrameCache.getSpriteFrame(options.icon+"-icon.png")
        });
        var fromBox = fromSprite.getBoundingBoxToWorld();
        icon.attr({
            x : fromBox.x + fromSprite.width/2 + fromOffset.x,
            y : fromBox.y + fromSprite.height/2 + fromOffset.y
        });
        this.layer.addChild( icon, this.iconZindex );

        var toBox = toSprite.getBoundingBoxToWorld();
        var sequence = cc.sequence( cc.moveTo(moveTime, toBox.x + toSprite.width/2 + toOffset.x, toBox.y + toSprite.height/2 + toOffset.y ),
        cc.callFunc(function(){
            icon.removeFromParent(true);
            if ( options.callback )
                options.callback.call(options.context);
        },this));
        icon.runAction(sequence);
    },
    _isIconRunning:function(sprite){
        if ( this.iconMap[sprite.__instanceId] ) {
            return true;
        }
        return false;
    },
    _popEffect:function(sprite){
        if ( !this._isIconRunning(sprite) ) {
            var entry = this.queueMap[sprite.__instanceId].shift();
            if ( entry === undefined )
                return;
            this.iconMap[sprite.__instanceId] = new IconSprite({
                text: entry.text,
                image: cc.spriteFrameCache.getSpriteFrame(entry.icon+".png")
            });
            this.layer.addChild( this.iconMap[sprite.__instanceId], this.iconZindex );

            var box = sprite.getBoundingBoxToWorld();
            this.iconMap[sprite.__instanceId].attr({
                x: box.x+sprite.width/2 + entry.offset.x,
                y: box.y+sprite.height/2 + entry.offset.y
            })
            var sequence = cc.sequence( cc.moveBy( times.effect_icon_move, 0, dimens.effect_icon_move_y),
            cc.callFunc(function(){
                this.iconMap[sprite.__instanceId].removeFromParent(true);
                this.iconMap[sprite.__instanceId] = null;
                this._popEffect(sprite);
            },this));
            this.iconMap[sprite.__instanceId].runAction(sequence);
        }
    }
})
