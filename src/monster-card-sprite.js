/**
 * Created by 赢潮 on 2015/2/27.
 */


var MonsterCardSprite = BaseCardSprite.extend({
    ctor: function( options ){
        this._super( options )
        //add attack icon and label
        this.attackIcon = new IconSprite({
            image: cc.spriteFrameCache.getSpriteFrame("attack-icon.png")
        });
        this.attackIcon.attr({
            x: dimens.card_width - dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y
        });
        this.addChild(this.attackIcon,1);
        this.addFrontSprite( this.attackIcon );

        this.attackRangeIcon = new IconSprite({
            image: cc.spriteFrameCache.getSpriteFrame("attack-"+this.model.get("attackRange")+"-icon.png")
        });
        this.attackRangeIcon.attr({
            x: dimens.card_width - dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y - dimens.hero_icon_size.height
        });
        this.addChild(this.attackRangeIcon,1);
        this.addFrontSprite( this.attackRangeIcon );

        this.renderPierceIcon();
        this.renderTrampleIcon();
    },
    renderAttackRangeIcon:function(){
        this.attackRangeIcon.setIcon(cc.spriteFrameCache.getSpriteFrame("attack-"+this.model.get("attackRange")+"-icon.png"));
    },
    renderPierceIcon:function(){
        if ( this.model.get("pierce") ) {
            this.pierceIcon = new IconSprite({
                image: cc.spriteFrameCache.getSpriteFrame("pierce-icon.png")
            });
            this.pierceIcon.attr({
                x: dimens.card_width - dimens.hero_icon_offset.x,
                y: dimens.card_height - dimens.hero_icon_offset.y - dimens.hero_icon_size.height * 2
            });
            this.addChild(this.pierceIcon,1);
            this.addFrontSprite( this.pierceIcon );
        } else {
            if (this.pierceIcon ) {
                this.removeFrontSprite( this.pierceIcon );
                this.pierceIcon.removeFromParent(true);
            }
        }
    },
    renderTrampleIcon:function(){
        if ( this.model.get("trample") ) {
            this.trampleIcon = new IconSprite({
                image: cc.spriteFrameCache.getSpriteFrame("trample-icon.png")
            });
            this.trampleIcon.attr({
                x: dimens.card_width - dimens.hero_icon_offset.x,
                y: dimens.card_height - dimens.hero_icon_offset.y - dimens.hero_icon_size.height * 3
            });
            this.addChild(this.trampleIcon,1);
            this.addFrontSprite( this.trampleIcon );
        } else {
            if (this.trampleIcon ) {
                this.removeFrontSprite( this.trampleIcon );
                this.trampleIcon.removeFromParent(true);
            }
        }
    },
    __refresh:function(){
        this._super();
        this.renderAttack();
    },
    __initEvent:function(){
        this._super();
        this.model.on("change:attack",this.renderAttack, this);
        this.model.on("change:attackRange",this.renderAttackRangeIcon,this);
        this.model.on("change:pierce",this.renderPierceIcon,this);
        this.model.on("change:trample",this.renderTrampleIcon,this);
    },
    renderAttack:function(){
        this.attackIcon.setString(this.model.get("attack"))
    }
})
