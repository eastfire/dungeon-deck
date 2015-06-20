var TrapCardSprite = BaseCardSprite.extend({
    ctor: function( options ){
        this._super( options )

        this.attackRangeIcon = new IconSprite({
            image: cc.spriteFrameCache.getSpriteFrame("attack-"+this.model.get("attackRange")+"-icon.png")
        });
        this.attackRangeIcon.attr({
            x: dimens.card_width - dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y - dimens.hero_icon_size.height
        });
        this.addChild(this.attackRangeIcon,1);
        this.addFrontSprite( this.attackRangeIcon );

        this.registerIcon("attack", cc.spriteFrameCache.getSpriteFrame("attack-icon.png"),{
            x: dimens.card_width - dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y
        }, {showZero:true} );
    },
    __refresh:function(){
        this._super();
        this.renderIcon("attack");
//        this.renderAttack();
    },
    __initEvent:function(){
        this._super();
        this.model.on("change:attack",function(){
            this.onIconChanged("attack",true,true);
        }, this);
        this.model.on("miss",this.onMissEffect,this);
    },
    onMissEffect:function(){
        effectIconMananger.enqueue(this, {
            icon: "miss-icon"
        });
    }
});