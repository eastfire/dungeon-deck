/**
 * Created by 赢潮 on 2015/3/28.
 */

var SpellBookLayer = cc.Layer.extend({
    ctor:function(options){
        this._super();

        this.model = options.model;

        var bg = new cc.Sprite(res.book_bg_png);
        bg.attr({
            x:320,
            y:0,
            anchorY:0
        });
        this.addChild(bg,1);

        this.__initEvent();
        this.__renderCastSpell();
        this.__renderCards();
    },
    __initEvent:function(){
        var self = this;
        cc.eventManager.addListener(this.touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: function (touch, event) {
                return true;
            },
            onTouchMoved: function (touch, event) {
            },
            onTouchEnded: function (touch, event) {
                self.close.call(self);
            }
        }), this);

    },
    close:function(){
        window.mainGame.resumeAction();
        this.removeFromParent(true);
    },
    onExit:function(){
        cc.eventManager.removeListener(this.touchListener);
        _.each(this.model.get("hand"),function(cardModel){
            cardModel.off(null,null,this);
        },this);
    },
    __renderCastSpell:function(){
        var item = new cc.MenuItemImage(
            cc.spriteFrameCache.getSpriteFrame("short-normal.png"),
            cc.spriteFrameCache.getSpriteFrame("short-selected.png"),
            function () {
                //TODO check timing
                cc.eventManager.dispatchCustomEvent("cast-spell",{
                    model: this.currentSelectedCard.model,
                    x: this.currentSelectedCard.x,
                    y: this.currentSelectedCard.y
                });
                this.removeFromParent(true);
            }, this );
        item.attr({
            x: dimens.continue_position.x,
            y: dimens.continue_position.y,
            anchorX: 0.5,
            anchorY: 0.5
        });
        var text = new cc.LabelTTF(texts.cast_spell, "Arial", dimens.build_new_stage_font_size);
        text.attr({
            color: cc.color.BLACK,
            x: 90,
            y: 25
        })

        item.addChild( text );
        this.castMenu = new cc.Menu(item);
        this.castMenu.x = 0;
        this.castMenu.y = 0;
        this.addChild(this.castMenu, 20);
        this.castMenu.setVisible(false);
    },
    __renderCards:function(){
        var length = this.model.get("hand").length;
        if ( length === 0)
            return;
        var unitWidth = cc.winSize.width/length;
        var i = 0;
        _.each(this.model.get("hand"),function(cardModel){
            var cardSprite = new DUNGEON_SPRITE_CLASS_MAP[cardModel.get("name")]({
                model: cardModel
            })
            cardSprite.setSwallowEvent(true);
            cardSprite.attr({
                x : i*unitWidth+unitWidth/2,
                y : dimens.card_height/2 + 60
            });
            cardSprite.setOnClickListener(function(){
                if ( this.currentSelectedCard === cardSprite )
                    return;
                if ( this.currentSelectedCard ) {
                    this.currentSelectedCard.runAction(cc.moveBy(times.select_spell, 0, -dimens.select_spell_offset));
                }
                cardSprite.runAction(cc.moveBy(times.select_spell,0,dimens.select_spell_offset));
                this.currentSelectedCard = cardSprite;

                this.castMenu.setVisible(true);
            },this);
            this.addChild(cardSprite, i+1 + 60);

            i++;
        },this)
    }
});
