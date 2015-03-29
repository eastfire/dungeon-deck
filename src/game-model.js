/**
 * Created by 赢潮 on 2015/3/1.
 */

var GameModel = Backbone.Model.extend({
    defaults:function(){
        return {
            score: 0,

            initMoney:15,
            money : 10,
            maxMoney: 10,

            levelUpHpEffect: 5,
            baseHp: 15,
            hp : 20,
            maxHp : 20,

            level: 1,
            exp: 0,
            maxExp: 10,
            status: null,
            phase: "hero-generate", //hero-generate , team-enter-dungeon, team-enter-level, team-enter-room, team-leave-room, team-leave-level, team
            heroList: [ "warrior" ],
            //initDeck: [ "skeleton", "skeleton","skeleton","skeleton","ratman","ratman","ratman","ratman" ],
            initDeck: [ "magic-missile","skeleton", "skeleton","skeleton","skeleton","ratman","ratman","ratman","ratman" ],
            isInitDeckShuffle: true,

            deck: [],
            discardDeck: [],

            hand: [], //魔法
            maxHand: 3,
            team: [],

            costPerStage: 5,
            stage: [],
            stageNumber: 0,

            regularBuyableCards: [],
            initRegularBuyableCards : [ {
                type:"ratman",
                count: 8
            }, {
                type:"skeleton",
                count: 8
            }, {
                type:"magic-missile",
                count: 8
            },{
                type:"lightening",
                count: 8
            },{
                type:"fireball",
                count: 8
            }]
        }
    },
    initialize:function(){
        this.expUnused = 0;
        this.setLevel(1);
    },
    sortTeam:function(){
        var team = this.get("team");
        for ( var i = 0; i < team.length; i++ ) {
            var model = team[i];
            model.set("positionInTeam", i, {silent:true});
            model.trigger("change:positionInTeam");
        }
    },
    setLevel:function(l){
        this.set("level",l);
        this.set("maxHp",this.calMaxHp(l));
        this.set("hp", this.get("maxHp"));
        this.set("exp",0);
        this.set("maxExp",this.calExpRequire(l));
    },
    getExp:function(exp){
        if ( this.expUnused == 0 ) {
            this.expUnused += exp;
            this.checkLevelUp();
        } else {
            this.expUnused += exp;
        }
    },
    getScore:function(score){
        this.set("score",this.get("score")+score);
    },
    getMoney:function(money){
        this.set("money",Math.min( this.get("maxMoney") , this.get("money")+money ) );
    },
    useMoney:function(money){
        this.set("money", Math.max(0, this.get("money") - money ));
    },
    calExpRequire: function (lv) {
        return Math.round((Math.log10(lv) * lv * 16.61 + 10) /** (1 - (CUNNING_EFFECT / 100) * this.get("cunning"))*/);
    },
    calMaxHp: function (lv) {
        return lv * this.get("levelUpHpEffect") + this.get("baseHp");
    },
    checkLevelUp:function(){
        var currentExp = this.get("exp");
        var expRequire = this.get("maxExp");
        if (currentExp + this.expUnused >= expRequire) {
            this.levelUp();
            this.expUnused -= ( expRequire - currentExp );
            var self = this;
            window.showLevelUpDialog(function(){
                self.checkLevelUp();
            })
        } else {
            this.set("exp", currentExp + this.expUnused);
            this.expUnused = 0;
        }
    },
    levelUp:function(){
        var newLevel = this.get("level") + 1;
        this.setLevel(newLevel);
    },
    isTeamAlive:function(){
        return _.any(this.get("team"),function(heroModel){
            return heroModel.get("hp") > 0;
        },this)
    },
    removeDeadHeroFromTeam:function(){
        var team = this.get("team");
        for ( var i = 0;i < team.length; ) {
            var model = team[i];
            if ( model.isAlive() ) {
                i++;
            } else {
                team.splice(i,1);
                model.destroy();
                model = null;
            }
        }
        this.sortTeam();
    },
    getBuildCost:function(){
        return this.get("stageNumber")* this.get("costPerStage");
    },
    getSpellCard:function(cardSprite){
        this.get("hand").push(cardSprite.model);
        cardSprite.removeFromParent(true);
        this.trigger("change:hand");
    },
    useSpellCard:function(cardModel){
        var hand = this.get("hand");
        var index = hand.indexOf(cardModel);
        if ( index != -1 )
            _.splice( this.get("hand"), index, 1)
        this.trigger("change:hand");
    },
    initDeck:function(){
        _.each( this.get("initDeck"), function(cardName){
            var Model = DUNGEON_CLASS_MAP[cardName];
            var model = new Model();
            this.get("deck").push( model );
        },this);

        if ( this.get("isInitDeckShuffle") )
            this.set("deck",_.shuffle(this.get("deck")));
    },
    initRegularBuyableCards:function(){
        _.each( this.get("initRegularBuyableCards"), function(entry){
            var deck = [];
            for ( var i = 0; i < entry.count; i++ ) {
                var Model = DUNGEON_CLASS_MAP[entry.type];
                var model = new Model({
                    side:"front"
                });
                deck.push( model );
            }
            this.get("regularBuyableCards").push(deck);
        },this);
    },
    beAttacked:function(damage){
        var hp = this.get("hp");
        this.set("hp", Math.max(0, hp - damage) );
    }
})

var DungeonCardModel = Backbone.Model.extend({ //地城牌
    defaults:function(){
        return {
            name: "",
            backType:"dungeon",
            description: "",
            baseCost: 1,
            cost: 1,
            baseScore: 0,
            score: 0,
            side: "back",
            level: 1,
            status: ""
        }
    },
    initialize:function(){
        this.on("change:baseScore", this.evaluateScore, this);
        this.on("change:baseCost", this.evaluateCost, this);
    },
    evaluateScore:function(){
        this.set("score", this.get("baseScore"))
    },
    evaluateCost:function(){
        this.set("cost", this.get("baseCost"))
    },
    getDescription:function(){
    },
    onDiscard : function(){
    },
    onReveal : function(){
    },
    onLevelReveal: function(){
    },
    resetToOrigin:function(){
        this.set("status","");
    }
})



var RoomModel = DungeonCardModel.extend({ //房间
    defaults:function(){
        return _.extend( DungeonCardModel.prototype.defaults.call(this),{
            type: "room",
            baseAttack: 1,
            attack: 1,
            status: null
        })
    },
    onTeamEnter:function(team){
    },
    onAttackHero:function(heroModel){
    },
    onDamageHero:function(heroModel, damage, type){
    },
    onTeamPass:function(team){
    },
    onPay:function(cost){
    },
    onCantPay:function(cost){
    }
})

var SpellModel = DungeonCardModel.extend({ //法术
    defaults:function(){
        return _.extend( DungeonCardModel.prototype.defaults.call(this),{
            type: "spell",
            target: "none" // none, hero, dungeonCard, monster, room, , item, cardInDiscard, cardInDeck
        })
    },
    onCast:function(){
    }
})

