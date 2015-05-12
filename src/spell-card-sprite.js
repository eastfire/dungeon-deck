/**
 * Created by 赢潮 on 2015/2/27.
 */


var SpellCardSprite = BaseCardSprite.extend({
    ctor: function( options ){
        this._super( options )
        //add attack icon and label
        this.attackIcon = new IconSprite({
            image:cc.spriteFrameCache.getSpriteFrame("attack-icon.png")
        });
        this.attackIcon.attr({
            x: dimens.card_width - dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y
        });
        this.addChild(this.attackIcon,1);
        this.addFrontSprite( this.attackIcon );
    },
    __refresh:function(){
        this._super();
        this.renderAttack();
    },
    __initEvent:function(){
        BaseCardSprite.prototype.__initEvent.call(this);
        this.model.on("change:attack",this.renderAttack, this);
    },
    renderAttack:function(){
        if ( this.model.get("attack") === 0 ) {
            this.attackIcon.opacity = 0;
        } else {
            this.attackIcon.opacity = 255;
            this.attackIcon.setString(this.model.get("attack"))
        }
    }
});

var MagicMissileCardSprite = SpellCardSprite.extend({
    onSelectTarget:function(heroModel){
        var heroSprite = mainLayer.getHeroSpriteByModel( heroModel );
        if ( heroSprite ) {
            effectIconMananger.fly(this, heroSprite, {
                icon: "attack",
                callback: function(){
                    this.model.onSelectTarget(heroModel)
                },
                context: this
            });
        } else {
            this.model.onSelectTarget(heroModel);
        }
    }
});

var WarDrumCardSprite = SpellCardSprite.extend({
    onSelectTarget:function(dungeonModel){
        var dungeonSprite = mainLayer.getDungeonSpriteByModel( dungeonModel );
        if ( dungeonSprite ) {
            effectIconMananger.fly(this, dungeonSprite, {
                icon: "attack",
                callback: function(){
                    this.model.onSelectTarget(dungeonModel)
                },
                context: this
            });
        } else {
            this.model.onSelectTarget(dungeonModel);
        }
    }
});