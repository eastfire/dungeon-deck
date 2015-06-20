/**
 * Created by 赢潮 on 2015/2/27.
 */


var MonsterCardSprite = BaseCardSprite.extend({
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

        this.registerIcon("attack", cc.spriteFrameCache.getSpriteFrame("attack-icon.png") ,{
            x: dimens.card_width - dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y
        }, {
            showZero: true,
            buffAttribute:"attackBuff",
            debuffAttribute: "attackDebuff"
        });
        this.registerIcon("pierce", cc.spriteFrameCache.getSpriteFrame("pierce-icon.png") ,{
            x: dimens.card_width - dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y - dimens.hero_icon_size.height * 2
        });
        this.registerIcon("trample", cc.spriteFrameCache.getSpriteFrame("trample-icon.png") ,{
            x: dimens.card_width - dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y - dimens.hero_icon_size.height * 3
        });

    },
    renderAttackRangeIcon:function(){
        this.attackRangeIcon.setIcon(cc.spriteFrameCache.getSpriteFrame("attack-"+this.model.get("attackRange")+"-icon.png"));
    },
    __initEvent:function() {
        this._super();
        this.model.on("destroy", this.remove, this);
        this.model.on("change:hp", function () {
            this.onIconChanged("hp", true, true);
            this.checkDie();
        }, this);
        this.model.on("change:attack",function(){
            this.onIconChanged("attack",true,true);
        }, this);
        this.model.on("change:attackRange",this.renderAttackRangeIcon,this);
        this.model.on("change:pierce",function(){
            this.onIconChanged("pierce",false,false);
        },this);
        this.model.on("change:trample",function(){
            this.onIconChanged("trample",false,false);
        },this);
        this.model.on("miss",this.onMissEffect,this);
    },
    onMissEffect:function(){
        effectIconMananger.enqueue(this, {
            icon: "miss-icon"
        });
    },
    __refresh:function(){
        this._super();
        //this.renderAttack();
        this.renderIcon("attack");
        this.renderIcon("pierce");
        this.renderIcon("trample");
    }
})
