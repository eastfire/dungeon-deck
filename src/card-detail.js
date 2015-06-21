/**
 * Created by 赢潮 on 2015/3/23.
 */

var CardDetailLayer = cc.LayerColor.extend({
    ctor: function (options) {
        options = options || {};
        var hint = options.hint;
        var choices = options.choices;
        this.model = options.model;

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

        var name = this.model.get("displayName");
        var nameLength = unicodeByteLength(name);
        var fontSize = dimens.card_detail_name_font_size;
        if ( nameLength >= 12 ) {
            fontSize = dimens.card_detail_name_font_size * 4 / 6;
        } else if ( nameLength >= 10 ) {
            fontSize = dimens.card_detail_name_font_size * 4 / 5;
        }
        var nameLabel = new cc.LabelTTF(name, "宋体",fontSize );
        nameLabel.attr({
            color: colors.card_detail_name,
            x: cc.winSize.width/2,
            y: cc.winSize.height/2 + dimens.card_height/2*scaleRate - dimens.card_detail_name_font_size,
            anchorX: 0.5,
            anchorY: 0.5
        })
        this.addChild(nameLabel,15);

        var levelIcon = new IconSprite({
            image: this.model.isMaxLevel() ? cc.spriteFrameCache.getSpriteFrame("max-level-icon.png") : cc.spriteFrameCache.getSpriteFrame("level-icon.png")
        });
        levelIcon.attr({
            scaleX: iconScaleRate,
            scaleY: iconScaleRate,
            x: cardLeft + dimens.card_detail_icon_offset.x*scaleRate,
            y: cardBottom + (dimens.card_height - dimens.card_detail_icon_offset.y)*scaleRate
        });
        levelIcon.setString(this.model.get("level"));
        this.addChild(levelIcon,15);

        if ( this.model.get("maxLevel") !== "NA" ) {
            var maxLevelIcon = new IconSprite({
                image: cc.spriteFrameCache.getSpriteFrame("level-icon.png"),
                fontSize: 12,
                offset: {
                    x: dimens.hero_icon_size.width/2,
                    y: dimens.hero_icon_size.height/2-3
                }
            });
            maxLevelIcon.attr({
                scaleX: iconScaleRate,
                scaleY: iconScaleRate,
                x: cardLeft + dimens.card_detail_icon_offset.x * scaleRate,
                y: cardBottom + (dimens.card_height - dimens.card_detail_icon_offset.y - 19) * scaleRate
            });
            maxLevelIcon.setString("最大" + this.model.get("maxLevel"));
            this.addChild(maxLevelIcon, 14);
        }

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
            var maxHpIcon = new IconSprite({
                image: cc.spriteFrameCache.getSpriteFrame("hp-icon.png"),
                fontSize: 12
            });
            maxHpIcon.attr({
                scaleX: iconScaleRate,
                scaleY: iconScaleRate,
                x: cardLeft + ( dimens.card_width - dimens.card_detail_icon_offset.x )*scaleRate,
                y: cardBottom + (dimens.card_height - dimens.card_detail_icon_offset.y-19)*scaleRate
            });
            maxHpIcon.setString("最大" + this.model.get("maxHp"));
            this.addChild(maxHpIcon, 14);
        } else if ( this.model instanceof MonsterModel || this.model instanceof TrapModel ){
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

        if ( choices && choices.length ) {
            var choiceNumber = choices.length;
            var unitWidth = cc.winSize.width / choiceNumber;
            var menuX = unitWidth/2;
            var items = [];
            _.each( choices, function(choice){
                var item = new cc.MenuItemImage(
                    cc.spriteFrameCache.getSpriteFrame("short-normal.png"),
                    cc.spriteFrameCache.getSpriteFrame("short-selected.png"),
                    function () {
                        //cc.log( choice.text);
                        if ( choice.callback )
                            choice.callback.call( choice.context );
                    }, this );
                item.attr({
                    x: menuX,
                    y: 60,
                    anchorX: 0.5,
                    anchorY: 0.5
                });
                var text = buildRichText({
                    str : choice.text ,
                    fontSize : dimens.build_new_stage_font_size,
                    fontColor: cc.color.BLACK,
                    width: 180,
                    height: 60
                });
                text.attr({
                    x: choice.textOffset ? choice.textOffset.x : 120,
                    y: choice.textOffset ? choice.textOffset.y : 15,
                    anchorX : 0.5,
                    anchorY : 0.5
                })

                item.addChild( text );
                items.push( item );
                menuX += unitWidth;
            }, this )

            var menu = new cc.Menu(items);
            menu.x = 0;
            menu.y = 0;
            this.addChild(menu, 20);
        }

        if ( hint ) {
            var richText = buildRichText({
                str: hint,
                fontSize: dimens.card_detail_desc_font_size,
                fontColor: colors.card_detail_hint,
                width: dimens.card_detail_hint_size.width,
                height: dimens.card_detail_hint_size.height
            });
            richText.attr({
                x: dimens.card_detail_hint_position.x,
                y: dimens.card_detail_hint_position.y
            });
            this.addChild(richText, 15);
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

            var descLines = desc.split("\n");
            var descY = dimens.card_detail_desc_text_start_y;
            _.each(descLines,function(line){
                var richText = buildRichText({
                    str: line,
                    fontSize: dimens.card_detail_desc_font_size,
                    fontColor: colors.card_detail_desc,
                    width: dimens.card_detail_desc_size.width,
                    height: dimens.card_detail_desc_size.height
                });
                richText.attr({
                    x: cc.winSize.width/2,
                    y: descY
                });
                this.addChild(richText, 15);
                descY -= dimens.card_detail_desc_line_space;
            },this)

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
                self.close.call(self);
            }
        }), this);
    },
    close:function(){
        window.mainGame.resumeAction();
        this.removeAllChildren(true);
        this.removeFromParent(true);
    }
});