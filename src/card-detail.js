/**
 * Created by 赢潮 on 2015/3/23.
 */

var CardDetailLayer = cc.LayerColor.extend({
    ctor: function (options) {
        options = options || {};
        this.model = options.model;
        this.fromTop = options.fromTop || true;

        this._super(colors.card_detail_mask);

        var scaleRate = dimens.card_detail_scale_rate;
        var iconScaleRate = dimens.card_detail_icon_scale_rate;

        var card = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame(this.model.get("type")+"-"+this.model.get("name")+"-small.png"));
        card.attr({
            x: cc.winSize.width/2,
            y: cc.winSize.height/2,
            scaleX: dimens.card_detail_scale_rate,
            scaleY: dimens.card_detail_scale_rate
        })
        this.addChild(card,11)
        var cardLeft = cc.winSize.width/2 - dimens.card_width * scaleRate/2;
        var cardBottom = cc.winSize.height/2 - dimens.card_height * scaleRate/2;

        var nameLabel = new cc.LabelTTF(this.model.get("displayName"), "Arial", dimens.card_detail_name_font_size);
        nameLabel.attr({
            color: colors.card_detail_name,
            x: cc.winSize.width/2,
            y: cc.winSize.height/2 + dimens.card_height/2*scaleRate - dimens.card_detail_name_font_size
        })
        this.addChild(nameLabel,15);

        var levelIcon = new IconSprite({
            image: cc.spriteFrameCache.getSpriteFrame("level-icon.png")
        });
        levelIcon.attr({
            scaleX: iconScaleRate,
            scaleY: iconScaleRate,
            x: cardLeft + dimens.card_detail_icon_offset.x*scaleRate,
            y: cardBottom + (dimens.card_height - dimens.card_detail_icon_offset.y)*scaleRate
        });
        levelIcon.setString(this.model.get("level"));
        this.addChild(levelIcon,15);

        if ( this.model instanceof HeroModel ) {
            var hpIcon = new IconSprite({
                image: cc.spriteFrameCache.getSpriteFrame("hp-icon.png")
            })
            hpIcon.attr({
                scaleX: iconScaleRate,
                scaleY: iconScaleRate,
                x: cardLeft + ( dimens.card_width - dimens.card_detail_icon_offset.x )*scaleRate,
                y: cardBottom + (dimens.card_height - dimens.card_detail_icon_offset.y)*scaleRate
            })
            this.addChild(hpIcon,15);
            hpIcon.setString(this.model.get("hp"));

            //add score icon and label
            var scoreIcon = new IconSprite({
                image: cc.spriteFrameCache.getSpriteFrame("score-icon.png")
            });
            scoreIcon.attr({
                scaleX: iconScaleRate,
                scaleY: iconScaleRate,
                x: cardLeft + dimens.card_detail_icon_offset.x*scaleRate,
                y: cardBottom + dimens.card_detail_icon_offset.y*scaleRate
            })
            this.addChild(scoreIcon,15)
            scoreIcon.setString(this.model.get("score"));
        } else if ( this.model instanceof MonsterModel ){
            var attackIcon = new IconSprite({
                image: cc.spriteFrameCache.getSpriteFrame("attack-icon.png")
            })
            attackIcon.attr({
                scaleX: iconScaleRate,
                scaleY: iconScaleRate,
                x: cardLeft + ( dimens.card_width - dimens.card_detail_icon_offset.x )*scaleRate,
                y: cardBottom + (dimens.card_height - dimens.card_detail_icon_offset.y)*scaleRate
            })
            this.addChild(attackIcon,15);
            attackIcon.setString(this.model.get("attack"));

            var attackRangeIcon = new IconSprite({
                image: cc.spriteFrameCache.getSpriteFrame("attack-"+this.model.get("attackRange")+"-icon.png")
            })
            attackRangeIcon.attr({
                scaleX: iconScaleRate,
                scaleY: iconScaleRate,
                x: cardLeft + ( dimens.card_width - dimens.card_detail_icon_offset.x )*scaleRate,
                y: cardBottom + (dimens.card_height - dimens.card_detail_icon_offset.y)*scaleRate-dimens.hero_icon_size.height*iconScaleRate
            })
            this.addChild(attackRangeIcon,15);
        } else if ( this.model instanceof SpellModel ){
            var attackIcon = new IconSprite({
                image: cc.spriteFrameCache.getSpriteFrame("attack-icon.png")
            })
            attackIcon.attr({
                scaleX: iconScaleRate,
                scaleY: iconScaleRate,
                x: cardLeft + ( dimens.card_width - dimens.card_detail_icon_offset.x )*scaleRate,
                y: cardBottom + (dimens.card_height - dimens.card_detail_icon_offset.y)*scaleRate
            })
            this.addChild(attackIcon,15);
            attackIcon.setString(this.model.get("attack"));
        }

        var desc = this.model.getDescription();
        if ( desc && desc != "" ) {
            var desc_mask = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("card-desc-bg.png"));
            desc_mask.attr({
                x: cc.winSize.width/2,
                y: dimens.card_detail_desc_mask_position.y,
                scaleX: dimens.card_detail_scale_rate,
                scaleY: dimens.card_detail_scale_rate,
                opacity: 188
            })
            this.addChild(desc_mask,12);

            var richText = buildRichText({
                str: desc,
                fontSize: dimens.card_detail_desc_font_size,
                fontColor: colors.card_detail_desc,
                width: dimens.card_detail_desc_size.width,
                height: dimens.card_detail_desc_size.height
            });
            richText.attr({
                x: cc.winSize.width/2,
                y: cc.winSize.height/4
            });
            this.addChild(richText, 15);
        }
    },
    onEnter:function(){
        this._super();
        this.__initEvent();
    },
    onExit:function(){
        this._super();
        cc.eventManager.removeListener(this.touchListener);
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
                //cc.director.popScene();
                if ( this.fromTop )
                    mainGame.resumeAction();
                self.removeFromParent(true);
            }
        }), this);
    }
});