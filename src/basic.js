/**
 * Created by 赢潮 on 2015/2/8.
 */
var buildRichText = function( options ) {
    options = options || {};
    var richText = options.richText || new ccui.RichText();
    richText.ignoreContentAdaptWithSize(false);
    richText.width = options.width || 200;
    richText.height = options.height || 30;
    var str = options.str || options.text || "";
    var fontSize = options.fontSize || 16;
    var fontColor = options.fontColor || cc.color.WHITE;
    var fontFamily = options.fontFamily || "Arial";
    var opacity = options.opacity || 255;
    var segments = str.split(/[{|}]/);
    var tag = 1;
    _.each( segments, function(segment){
        var frame = null;
        if ( segment.substr(0,1) === "[" && segment.substr( segment.length - 1, 1) === "]" ) {
            var iconName = segment.substr(1, segment.length -2);
            frame = cc.spriteFrameCache.getSpriteFrame(iconName+"-icon.png");
        }
        if ( frame ) {
            var reimg = new ccui.RichElementImage(tag, cc.color.WHITE, 255, frame );
            richText.pushBackElement(reimg);
        } else {
            var re = new ccui.RichElementText(tag, new cc.FontDefinition({
                fillStyle: fontColor,
                fontName: fontFamily,
                fontSize: fontSize,
                fontWeight: "normal",
                fontStyle: "normal",
                lineHeight: fontSize
            }), opacity, segment);
            richText.pushBackElement(re);
        }
        tag++;
    });
    return richText;
}

var DEFAULT_CARD_FLIP_TIME = 0.3;
var DOUBLE_TAP_TIME_THRESHOLD = 500;

var CardSprite = cc.Sprite.extend({
    ctor: function( options ){
        var opt = options || {};
        this.imageMap = {
            front: opt.frontImage,
            back: opt.backImage
        }
        this.side = opt.side || "front";
        this.flipTime = opt.flipTime || DEFAULT_CARD_FLIP_TIME;

        this._super( this.imageMap[this.side] )

        this.flipActionFirstHalf = cc.scaleTo(this.flipTime/2, 0.01, 1)
        this.flipActionSecondHalf = cc.scaleTo(this.flipTime/2, 1, 1)

        this.__frontSprites = [];
        this.__backSprites = [];
        this.__invisibleBackSpirte = [];
        this.__invisibleFrontSprite = [];

        this.flipToFrontSequence = cc.sequence(this.flipActionFirstHalf, cc.callFunc(function( ) {
            this.side = "front";
            this.__changeSpriteVisible();
            this.onChangeSide();
            var image = this.imageMap[this.side];
            if ( image instanceof cc.Texture2D )
                this.setTexture(image);
            else if ( image instanceof cc.SpriteFrame )
                this.setSpriteFrame(image);
        }, this), this.flipActionSecondHalf);

        this.flipToBackSequence = cc.sequence(this.flipActionFirstHalf, cc.callFunc(function( ) {
            this.side = "back";
            this.__changeSpriteVisible();
            this.onChangeSide();
            var image = this.imageMap[this.side];
            if ( image instanceof cc.Texture2D )
                this.setTexture(image);
            else if ( image instanceof cc.SpriteFrame )
                this.setSpriteFrame(image);
        }, this), this.flipActionSecondHalf);
    },
    addFrontSprite:function(sprite){
        this.__frontSprites.push( sprite );
        sprite.setVisible(this.side === "front")
    },
    addBackSprite:function(sprite){
        this.__backSprites.push( sprite );
        sprite.setVisible(this.side === "back")
    },
    setSpriteVisible:function(sprite, visible){
        if ( this.__frontSprites.indexOf(sprite) !== -1 ) {
            sprite.__frontVisible = visible;
        } else if ( this.__backSprites.indexOf(sprite) !== -1 ) {
            sprite.__backVisible = visible;
        }
        sprite.setVisible(visible);
    },
    removeFrontSprite:function(sprite){
        var index = this.__frontSprites.indexOf(sprite);
        if ( index != -1 )
            this.__frontSprites.splice(index,1);
    },
    removeBackSprite:function(sprite){
        var index = this.__backSprites.indexOf(sprite);
        if ( index != -1 )
            this.__backSprites.splice(index,1);
    },
    __changeSpriteVisible:function(){
        if ( this.side === "front" ) {
            _.each(this.__backSprites, function(sprite){
                sprite.setVisible(false)
            },this);
            _.each(this.__frontSprites, function(sprite){
                sprite.setVisible(sprite.__frontVisible !== undefined? sprite.__frontVisible : true );
            },this);
        } else {
            _.each(this.__backSprites, function(sprite){
                sprite.setVisible(sprite.__backVisible !== undefined? sprite.__backVisible : true );
            },this)
            _.each(this.__frontSprites, function(sprite){
                sprite.setVisible(false);
             },this)
        }
    },
    onChangeSide:function(){
    },
    getFlipSequence:function(){
        if ( this.side === "back" )
            return this.flipToFrontSequence;
        else
            return this.flipToBackSequence;
    },
    getFlipToBackSequence:function(){
        return this.flipToBackSequence;
    },
    getFlipToFrontSequence:function(){
        return this.flipToFrontSequence;
    }
})

var DEFAULT_SORT_TIME = 0.3;
var SortableSpriteList = cc.Layer.extend({
    __enabled: true,
    ctor: function( options ) {
        this._super();

        var opt = options || {};
        this.placeHolderSprite = opt.placeHolderSprite;
        this.sortTime = opt.sortTime || DEFAULT_SORT_TIME;
        this.x = opt.x || 0;
        this.y = opt.y || 0;
        this.restrict = opt.restrict || false;
        this.leaveable = opt.leaveable || false;
        this.width = opt.width || 0;//0: auto
        this.height = opt.height || 0;//0 : auto
        this.margin = opt.margin || 0;
        this.orientation = opt.orientation || "horizontal"
        this.needAnimation = opt.needAnimation || true;

        this.listeners = {};
        this.sprites = opt.sprites || [];
        _.each( this.sprites, function(s){
            this.addSprite(s,-1,false)
        },this)

        if ( this.placeHolderSprite ) {
            this.addChild(this.placeHolderSprite, 1)
            this.placeHolderSprite.setVisible(false);
        }
    },
    addSprite:function(sprite, index) {
        if (index === undefined)
            index = this.sprites.length;
        if (index < 0 || index > this.sprites.length)
            index = this.sprites.length;
        var position = this.convertToNodeSpace( sprite.getPosition() );
        this.sprites.splice(index, 0, sprite)

        sprite.removeFromParent();
        this.addChild(sprite, 1)
        sprite.attr( {
            x:position.x,
            y:position.y
        });

        this.__addListener(sprite)

        this.__rearrange();
    },
    __addListener:function(sprite){
        var self = this;
        cc.eventManager.addListener(this.listeners[sprite.__instanceId] = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                if ( !self.__enabled )
                    return false;
                if ( self.__holding )
                    return false;

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
                if ( !self.__enabled )
                    return;
                var target = event.getCurrentTarget();
                var delta = touch.getDelta();
                target.x += delta.x;
                target.y += delta.y;
                if ( self.restrict ) {
                    target.y = Math.max( target.height/2, Math.min( this.height ? this.height : target.height/2, target.y ) )
                    target.x = Math.max( target.width/2, Math.min( ( this.width ? this.width : this.containWidth ) - target.width/2, target.x ) )
                }
                //remove target from list
                var index = _.indexOf(self.sprites, target);
                if ( index != -1 ) {
                    target.setLocalZOrder(100)
                    self.__holding = target;
                    self.sprites.splice(index, 1)
                }
                self.__renderPlaceHolder( target )
            },
            onTouchEnded: function (touch, event) {
                var target = event.getCurrentTarget();

                self.__holding = null;

                target.setLocalZOrder(1)
                var index = _.indexOf(self.sprites, target);
                if ( index == -1 ) {
                    self.sprites.splice(self.__insertIndex, 0, target)
                }
                self.__rearrange(true)
/*
                var now = (new Date()).getTime();
                cc.log("now"+now)
                cc.log("target.lastTouchTime"+ target.lastTouchTime)
                if ( Math.abs(now - target.lastTouchTime) < DOUBLE_TAP_TIME_THRESHOLD ) {
                    cc.log("double-tap in list")
                    target.lastTouchTime = 0;
                    var e = new cc.EventCustom("double-tap");
                    e.setUserData(target);
                    cc.eventManager.dispatchEvent(e);
                }
                target.lastTouchTime = now;*/
            }
        }), sprite);
    },
    onEnter:function(){
        this._super();
        _.each(this.sprites, function(s){
            var listener = this.listeners[s.__instanceId];
            if ( listener ) cc.eventManager.addListener(listener, s);
        },this);
    },
    onExit:function(){
        _.each(this.sprites, function(s){
            var listener = this.listeners[s.__instanceId];
            cc.eventManager.removeListener(listener);
        },this);
        this._super();
    },
    setEnabled:function(enable){
        this.__enabled = enable;
    },
    __rearrange:function() {
        if ( this.sprites.length <= 0 )
            return;

        var x = 0;
        _.each(this.sprites, function(s){
            var archorPoint = s.getAnchorPointInPoints();
            var positionX = x + archorPoint.x;
            var positionY = archorPoint.y;
            this.__moveComponentTo(s, positionX, positionY)
            x += s.width + this.margin;
        },this)
        this.containWidth = x;
    },
    __renderPlaceHolder:function(sprite){
        var targetX = sprite.x - sprite.getAnchorPointInPoints().x;
        var index = -1;
        var indexX = 0;
        var found = false;
        for ( var i = 0; i < this.sprites.length; i++ ){
            var s = this.sprites[i];
            if ( indexX + s.getAnchorPointInPoints().x > targetX && !found ) {
                if ( this.placeHolderSprite ) {
                    this.placeHolderSprite.setVisible(true)
                    this.placeHolderSprite.x = indexX + this.placeHolderSprite.getAnchorPointInPoints().x
                    this.placeHolderSprite.y = this.placeHolderSprite.getAnchorPointInPoints().y
                }
                found = true;
                index = i;
                indexX += sprite.width + this.margin
            }

            this.__moveComponentTo( s, indexX + s.getAnchorPointInPoints().x, s.getAnchorPointInPoints().y )
            indexX += s.width + this.margin;
        }
        if ( !found ) {
            index = i;
            if ( this.placeHolderSprite ) {
                this.placeHolderSprite.setVisible(true)
                this.placeHolderSprite.x = indexX + this.placeHolderSprite.getAnchorPointInPoints().x
                this.placeHolderSprite.y = this.placeHolderSprite.getAnchorPointInPoints().y
            }
        }
        this.__insertIndex = index;
    },
    __moveComponentTo:function(sprite, x,y){
        if ( this.needAnimation ) {
            if ( sprite.__cardMove !== x ) {
                sprite.__cardMove = x;
                sprite.stopAllActions();
                var time = this.sortTime;
                sprite.runAction( cc.sequence(cc.moveTo(time, x, y), cc.callFunc(function( ) {
                    sprite.__cardMove = undefined;
                }, sprite) ) )
            }
        } else {
            sprite.attr({
                x: x,
                y: y
            })
        }
    },
    empty:function(){
        _.each( this.sprites, function(sprite){
            this.removeChild(sprite, true);
            var listener = this.listeners[s.__instanceId];
            cc.eventManager.removeListener(listener);
        },this)
        this.listeners = [];
        this.sprites = [];
    },
    removeSpriteByIndex:function(index){
        var array = this.sprites.splice(index,1);
        if ( array.length === 0 )
            return;

        var sprite = array[0];
        var box = sprite.getBoundingBoxToWorld();
        var point = sprite.getAnchorPoint();
        sprite.attr({
            x: box.x + point.x*box.width,
            y: box.y + point.y*box.height
        });
        cc.eventManager.removeListener(this.listeners[sprite.__instanceId]);
        this.listeners[sprite.__instanceId] = null;
        this.removeChild(sprite, false);
        return sprite;
    },
    removeSprite:function(sprite){
        var index = _.indexOf(this.sprites, sprite);
        if ( index != -1 ) {
            this.removeSpriteByIndex(index)
        }
    }
})