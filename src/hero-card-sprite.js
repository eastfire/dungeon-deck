/**
 * Created by 赢潮 on 2015/2/27.
 */


var HeroCardSprite = BaseCardSprite.extend({
    ctor: function( options ){
        this._super( options )

        //add hp icon and label
        this.hpIcon = new IconSprite({
            image: cc.spriteFrameCache.getSpriteFrame("hp-icon.png")
        })
        this.hpIcon.attr({
            x: dimens.card_width - dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y
        })
        this.addChild(this.hpIcon,1)
        this.addFrontSprite( this.hpIcon )

        //add score icon and label
        this.scoreIcon = new IconSprite({
            image: cc.spriteFrameCache.getSpriteFrame("score-icon.png")
        });
        this.scoreIcon.attr({
            x: dimens.hero_icon_offset.x,
            y: dimens.hero_icon_offset.y
        })
        this.addChild(this.scoreIcon,1)
        this.addFrontSprite( this.scoreIcon )

        this.defenseIcon = new IconSprite({
            image: cc.spriteFrameCache.getSpriteFrame("defense-icon.png")
        });
        this.defenseIcon.attr({
            x: dimens.card_width - dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y - dimens.hero_icon_size.height
        })
        this.addChild(this.defenseIcon,1);
        this.addFrontSprite( this.defenseIcon )

        this.renderHp();
        this.renderDefense();
    },
    __initEvent:function(){
        this._super();
        this.model.on("destroy",this.remove,this);
        this.model.on("change:hp",this.onHpChanged, this);
        this.model.on("change:score",this.onScoreChanged, this);
        this.model.on("change:defense",this.onDefenseChanged, this);
        this.model.on("change:positionInTeam", this.renderPositionInTeam,this);
        this.model.on("change:level",this.onLevelChanged,this)
        this.model.on("leaveTeam",this.leaveTeam,this);
    },
    __refresh:function(){
        this._super();
        this.renderHp();
        this.renderScore();
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
    renderHp:function() {
        var hp = this.model.get("hp");
        this.hpIcon.setString(hp);
    },
    onHpChanged:function(){
        this.renderHp();
        var hp = this.model.get("hp");
        if ( this.model.previous("hp") != hp ) {
            var diff = hp - this.model.previous("hp");
            if ( diff > 0 )
                diff = "+"+diff;
            effectIconMananger.enqueue(this, {
                icon: "hp-icon",
                text: diff
            });
        }
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
    renderScore:function(){
        this.scoreIcon.setString(this.model.get("score"))
    },
    onScoreChanged:function(){
        this.renderScore();
    },
    renderDefense:function(){
        var def = this.model.get("defense");
        if ( def > 0 ) {
            this.defenseIcon.setVisible(true);
            this.defenseIcon.setString(def);
        } else {
            this.defenseIcon.setVisible(false);
        }
    },
    onDefenseChanged:function(){
        this.renderDefense();
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