/**
 * Created by 赢潮 on 2015/2/27.
 */


var HeroCardSprite = BaseCardSprite.extend({
    ctor: function( options ){
        this._super( options )

        //add hp icon and label
        var hpIcon = new IconSprite({
            image: cc.spriteFrameCache.getSpriteFrame("hp-icon.png")
        })
        hpIcon.attr({
            x: dimens.card_width - dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y
        })
        this.addChild(hpIcon,1)
        this.addFrontSprite( hpIcon )

        //add score icon and label
        var scoreIcon = new IconSprite({
            image: cc.spriteFrameCache.getSpriteFrame("score-icon.png")
        });
        scoreIcon.attr({
            x: dimens.hero_icon_offset.x,
            y: dimens.hero_icon_offset.y
        })
        this.addChild(scoreIcon,1)
        this.addFrontSprite( scoreIcon )

        var defenseIcon = new IconSprite({
            image: cc.spriteFrameCache.getSpriteFrame("defense-icon.png")
        });
        defenseIcon.attr({
            x: dimens.card_width - dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y - dimens.hero_icon_size.height
        })
        this.addChild(defenseIcon,1);
        this.addFrontSprite( defenseIcon );

        var poisonIcon = new IconSprite({
            image: cc.spriteFrameCache.getSpriteFrame("poison-icon.png"),
            fontColor: cc.color.BLACK
        });
        poisonIcon.attr({
            x: dimens.card_width - dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y - dimens.hero_icon_size.height * 2
        })
        this.addChild(poisonIcon,1);
        this.addFrontSprite( poisonIcon );

        var slowIcon = new IconSprite({
            image: cc.spriteFrameCache.getSpriteFrame("slow-icon.png"),
            fontColor: cc.color.WHITE
        });
        slowIcon.attr({
            x: dimens.card_width - dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y - dimens.hero_icon_size.height * 3
        })
        this.addChild(slowIcon,1);
        this.addFrontSprite( slowIcon );

        this.icons = {
            hp: hpIcon,
            score: scoreIcon,
            defense: defenseIcon,
            poison: poisonIcon,
            slow: slowIcon
        }


    },
    __initEvent:function(){
        this._super();
        this.model.on("destroy",this.remove,this);
        this.model.on("change:hp",function(){
            this.onIconChanged("hp", true, true);
            this.checkDie();
        },this);
        this.model.on("change:score",function(){
            this.onIconChanged("score", true, true);
        },this);
        this.model.on("change:defense",function(){
            this.onIconChanged("defense", true, true);
        },this);
        this.model.on("change:poison",function(){
            this.onIconChanged("poison", true, false);
        },this);
        this.model.on("change:slow",function(){
            this.onIconChanged("slow", true, false);
        },this);
        this.model.on("change:positionInTeam", this.renderPositionInTeam,this);
        this.model.on("change:level",this.onLevelChanged,this)
        this.model.on("leaveTeam",this.leaveTeam,this);
    },
    __refresh:function(){
        this._super();
        this.renderIcon("hp");
        this.renderIcon("score");
        this.renderIcon("defense");
        this.renderIcon("poison");
        this.renderIcon("slow");
    },
    remove:function(){
        if ( this.model.isAlive() ) {
            var leaveTeamSequence = cc.sequence(cc.moveTo(0.5, -dimens.card_width, this.y),
                cc.callFunc(function(){
                    this.removeFromParent(true);
                },this));
            this.runAction(leaveTeamSequence);
        } else {
            var removeBodySequence = cc.sequence(cc.moveBy(0.4, 0, dimens.card_height),
            cc.callFunc(function(){
                this.removeFromParent(true);
            },this));
            this.runAction(removeBodySequence);
            this.runAction(cc.fadeOut(0.4));
        }
    },
    checkDie:function(){
        var hp = this.model.get("hp");
        if ( hp === 0 ) {
            var dieSequence = cc.sequence( cc.delayTime(times.before_hero_die), this.getFlipSequence() );
            this.runAction(dieSequence);
        }
    },
    onLevelChanged:function(){
        var level = this.model.get("level");
        if ( this.model.previous("level") != level ) {
            var diff = level - this.model.previous("level");
            if (diff > 0)
                diff = "+" + diff;
            effectIconMananger.enqueue(this, {
                icon: "level-icon",
                text: diff
            });
        }
    },
    renderIcon:function(attr){
        var stat = this.model.get(attr);
        var icon = this.icons[attr];
        if ( icon ) {
            if (stat !== 0) {
                icon.setVisible(true);
                icon.setString(stat);
            } else {
                icon.setVisible(false);
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
    },
    renderPositionInTeam:function(){
        var team = window.gameModel.get("team");
        var realWidth = dimens.card_width + dimens.hero_icon_size.width - dimens.hero_icon_offset.x*2;
        var prevPosition = this.model.previous("positionInTeam");
        var position = this.model.get("positionInTeam");

        var teamWidth = team.length * realWidth;
        if ( team.length >= 2 )
            teamWidth += ( team.length - 1 ) * dimens.hero_margin;
        var x = dimens.team_position.x - teamWidth/2 + position * (realWidth + dimens.hero_margin) + realWidth/2 ;
        var y = dimens.team_position.y;
        var action = cc.moveTo( times.hero_join_team, x, y );

        this.stopAllActions();
        this.runAction(cc.sequence(action ,cc.callFunc(function(){
            this.model.onJoinTeam();
            if ( prevPosition !== null && prevPosition != position )
                this.model.onPositionInTeamChange();
        }, this) ));
    },
    leaveTeam:function(){
        this.runAction(cc.sequence(
            cc.moveTo( times.hero_join_team, -100, dimens.team_position.y ),
            cc.callFunc(function(){
                this.model.destroy();
            }, this)
        ));
    }
})