var ItemCardSprite = BaseCardSprite.extend({
    ctor: function( options ){
        this._super( options )

//        this.iconPositions = {
//            score: {
//                x: dimens.hero_icon_offset.x,
//                y: dimens.hero_icon_offset.y
//            }
//        }
//        this.iconImages = {
//            score: cc.spriteFrameCache.getSpriteFrame("score-icon.png")
//        }
//        this.icons = {
//        }
        this.registerIcon("score", cc.spriteFrameCache.getSpriteFrame("score-icon.png") ,{
            x: dimens.hero_icon_offset.x,
            y: dimens.hero_icon_offset.y
        })
    },
    __initEvent:function(){
        this._super();
        this.model.on("change:score",function(){
            this.onIconChanged("score", true, true);
        },this);
    },
    __refresh:function(){
        this._super();
        this.renderIcon("score");
    }/*,
    renderIcon:function(attr){
        var stat = this.model.get(attr);
        var icon = this.icons[attr];
        if (stat !== 0) {
            if ( icon ) {
                icon.setString(stat);
            } else {
                icon = this.icons[attr] = new IconSprite({
                    image: this.iconImages[attr]
                });
                icon.attr ( this.iconPositions[attr] )
                this.addChild(icon,1)
                this.addFrontSprite( icon );
            }
        } else {
            if ( icon ) {
                this.removeFrontSprite(icon);
                icon.removeFromParent(true);
                this.icons[attr] = null;
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
    }*/
})
