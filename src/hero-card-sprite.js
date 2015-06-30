/**
 * Created by 赢潮 on 2015/2/27.
 */


var HeroCardSprite = BaseCardSprite.extend({
    ctor: function( options ){
        this._super( options )

        this.registerIcon("hp", cc.spriteFrameCache.getSpriteFrame("hp-icon.png"),{
            x: dimens.card_width - dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y
        }, {showZero: true} );
        this.registerIcon("score", cc.spriteFrameCache.getSpriteFrame("score-icon.png") ,{
            x: dimens.hero_icon_offset.x,
            y: dimens.hero_icon_offset.y
        });
        this.registerIcon("defense", cc.spriteFrameCache.getSpriteFrame("defense-icon.png") ,{
            x: dimens.card_width - dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y - dimens.hero_icon_size.height
        },{
            showZero: false
        });
        this.registerIcon("poison", cc.spriteFrameCache.getSpriteFrame("poison-icon.png") ,{
            x: dimens.card_width - dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y - dimens.hero_icon_size.height * 2
        });
        this.registerIcon("slow", cc.spriteFrameCache.getSpriteFrame("slow-icon.png") ,{
            x: dimens.card_width - dimens.hero_icon_offset.x,
            y: dimens.card_height - dimens.hero_icon_offset.y - dimens.hero_icon_size.height * 3
        });
        this.registerIcon("silent", cc.spriteFrameCache.getSpriteFrame("silent-icon.png") ,{
            x: dimens.card_width/2,
            y: dimens.hero_icon_offset.y
        },{
            normalColor: cc.color.RED
        });

        this.icons.level.concernIncrease = true;
        this.icons.level.concernDecrease = true;
    },
    __initEvent:function(){
        this._super();
        this.model.on("destroy",this.remove,this);
        this.model.on("change:hp",function(){
            this.onIconChanged("hp", true, true);
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
        this.model.on("change:silent",function(){
            this.onIconChanged("silent", false, false);
        },this);
        this.model.on("change:positionInTeam", this.renderPositionInTeam,this);
        this.model.on("leaveTeam",this.leaveTeam,this);
        this.model.on("blocked",this.onBlockedEffect,this);
        this.model.on("die",this.die,this);
        this.model.on("alive",this.alive,this);
        this.model.on("transform",this.transformToZombie,this)
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
            this.leaveTeam();
        } else {
            var removeBodySequence = cc.sequence(cc.moveBy(0.4, 0, dimens.card_height),
            cc.callFunc(function(){
                cc.log("remove sprite")
                this.removeFromParent(true);
            },this));
            this.runAction(removeBodySequence);
            this.runAction(cc.fadeOut(0.4));
        }
    },
    onBlockedEffect:function(){
        effectIconMananger.enqueue(this, {
            icon: "block-icon"
        });
    },
    die:function() {
        if (this.flipAction) {
            this.stopAction(this.flipAction);
        }
        this.flipAction = cc.sequence(cc.delayTime(times.before_hero_die), this.getFlipToBackSequence(), cc.callFunc(function () {
            this.flipAction = null;
        }, this));
        this.runAction(this.flipAction);
    },
    alive:function(){
        if ( this.flipAction ) {
            this.stopAction(this.flipAction);
        }
        this.flipAction = cc.sequence( this.getFlipToFrontSequence(), cc.callFunc(function(){
            this.flipAction = null;
        },this) );
        this.runAction(this.flipAction);
    },
    transformToZombie:function(){
        cc.log("transform")
        if (this.flipAction) {
            this.stopAction(this.flipAction);
        }
        var zombie = new ZombieModel({
            level: Math.ceil(this.model.get("level")/2),
            side: "front"
        });
        var zombieCardSprite = new MonsterCardSprite({
            model: zombie
        });
        zombieCardSprite.attr({
            x: this.x,
            y: this.y
        })
        this.getParent().addChild(zombieCardSprite,60);
        this.getParent().discardCard(zombieCardSprite, null, null, times.discard_card*2);

        var team = gameModel.get("team");
        var index = _.indexOf(team, this.model);
        team.splice(index,1);
        this.model.destroy();
        this.model.off();

        gameModel.changeTeamPosition(team);
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

        if ( this.repositionAction ) {
            this.stopAllActions(this.repositionAction);
        }

        this.runAction(this.repositionAction = cc.sequence(action ,cc.callFunc(function(){
            this.model.onPositionInTeamChange(prevPosition, position);
        }, this) ));
    },
    leaveTeam:function(){
        this.runAction(cc.sequence(
            cc.moveTo( times.hero_join_team, -120, dimens.team_position.y ),
            cc.callFunc(function(){
                cc.log("destroy")
                this.model.off();
                this.removeFromParent(true);
                this.model.destroy();
            }, this)
        ));
    }
})